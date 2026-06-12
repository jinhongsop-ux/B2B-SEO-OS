import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(__dirname, '..')
const serverFile = path.join(appRoot, 'server', 'api-server.mjs')

const port = Number(process.env.TEST_AGENT_WORKFLOW_PORT || 4313)
const baseUrl = `http://127.0.0.1:${port}`
const runtimeDir = await mkdtemp(path.join(os.tmpdir(), 'b2b-seo-os-agent-workflow-'))

let server

async function main() {
  server = spawn(process.execPath, [serverFile], {
    cwd: appRoot,
    env: {
      ...process.env,
      PORT: String(port),
      B2B_SEO_OS_RUNTIME_DIR: runtimeDir,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  await waitForHealth()

  const noProjectPack = await postJson('/api/task-packs/generate', {
    workflowStepId: 'site_connection_reading',
    taskType: 'site_read',
    targetAgent: 'chatgpt',
  })
  assert.equal(noProjectPack.status, 409)
  assert.equal(noProjectPack.body.error.code, 'prerequisite_missing')
  assert.match(noProjectPack.body.error.message, /项目档案/)

  await postJson('/api/project', {
    projectName: '测试工业供应商',
    domain: 'example-b2b.com',
    company: '测试工业有限公司',
    industry: '工业零部件',
    targetMarkets: ['美国', '欧洲'],
    coreProducts: ['CNC 零件', '金属冲压件'],
    targetCustomers: ['采购经理', 'OEM 工程团队'],
    primaryConversionGoal: '提交询盘',
  })

  const taskPackResponse = await postJson('/api/task-packs/generate', {
    workflowStepId: 'site_connection_reading',
    taskType: 'site_read',
    targetAgent: 'openclaw',
    userInput: '请优先读取首页、产品页、关于我们、联系页和资源文章。',
  })
  assert.equal(taskPackResponse.status, 201)
  assert.equal(taskPackResponse.body.taskPack.workflowStepId, 'site_connection_reading')
  assert.equal(taskPackResponse.body.taskPack.taskType, 'site_read')
  assert.equal(taskPackResponse.body.taskPack.targetAgent, 'openclaw')
  assert.match(taskPackResponse.body.taskPack.promptMarkdown, /site_read_snapshot_v1/)
  assert.match(taskPackResponse.body.taskPack.promptMarkdown, /禁止写入 WordPress/)
  assert.ok(taskPackResponse.body.taskPack.expectedArtifactSchema.requiredFields.includes('pages'))

  const taskPackId = taskPackResponse.body.taskPack.taskPackId
  const taskPacks = await getJson('/api/task-packs')
  assert.equal(taskPacks.taskPacks.length, 1)
  assert.equal(taskPacks.taskPacks[0].taskPackId, taskPackId)

  const badArtifact = await postJson('/api/artifacts', {
    taskPackId,
    sourceAgent: 'openclaw',
    format: 'json',
    rawContent: '{',
  })
  assert.equal(badArtifact.status, 400)
  assert.equal(badArtifact.body.error.code, 'invalid_artifact')

  const artifactResponse = await postJson('/api/artifacts', {
    taskPackId,
    sourceAgent: 'openclaw',
    format: 'json',
    rawContent: JSON.stringify({
      schemaVersion: 'site_read_snapshot_v1',
      domain: 'https://example-b2b.com',
      pages: [
        {
          url: '/',
          title: '测试工业有限公司',
          pageType: '首页',
          type: 'page',
          h1: '测试工业有限公司',
          metaDescription: '工业零部件供应商。',
          wordCount: 800,
          formsDetected: ['RFQ Form'],
        },
      ],
      menus: ['Main Menu'],
      forms: ['RFQ Form'],
      seoFields: ['SEO Title', 'Meta Description', 'H1'],
      anomalies: ['部分图片 ALT 为空'],
      humanReviewItems: ['确认抓取页面是否完整。'],
    }),
  })
  assert.equal(artifactResponse.status, 201)
  assert.equal(artifactResponse.body.artifact.taskPackId, taskPackId)

  const ingestionResponse = await postJson('/api/ingestion-runs', {
    artifactId: artifactResponse.body.artifact.artifactId,
  })
  assert.equal(ingestionResponse.status, 201)
  assert.equal(ingestionResponse.body.ingestionRun.status, 'waiting_review')
  assert.equal(ingestionResponse.body.ingestionRun.validationResult.valid, true)
  assert.equal(ingestionResponse.body.ingestionRun.canAdvance, true)
  assert.equal(ingestionResponse.body.ingestionRun.parsedObjects.siteReadSnapshot.pages.length, 1)

  const reviewResponse = await postJson(`/api/ingestion-runs/${ingestionResponse.body.ingestionRun.ingestionRunId}/review`, {
    decision: 'approved',
    reviewer: 'operator',
    notes: '页面读取结果可以进入审计阶段。',
  })
  assert.equal(reviewResponse.status, 200)
  assert.equal(reviewResponse.body.ingestionRun.status, 'approved')
  assert.equal(reviewResponse.body.workflow.currentStepId, 'audit')
  assert.equal(reviewResponse.body.workspace.latestSnapshot.pages[0].url, '/')

  const persisted = JSON.parse(await readFile(path.join(runtimeDir, 'workspace-state.json'), 'utf8'))
  assert.equal(persisted.taskPacks.length, 1)
  assert.equal(persisted.externalArtifacts.length, 1)
  assert.equal(persisted.ingestionRuns.length, 1)
  assert.equal(persisted.siteReadSnapshots.length, 1)

  // ── S2 审计闭环 ──

  const auditPackResponse = await postJson('/api/task-packs/generate', {
    workflowStepId: 'audit',
    taskType: 'site_audit',
    targetAgent: 'chatgpt',
    userInput: '请全面审计网站。'
  })
  assert.equal(auditPackResponse.status, 201)
  assert.equal(auditPackResponse.body.taskPack.workflowStepId, 'audit')
  assert.equal(auditPackResponse.body.taskPack.taskType, 'site_audit')
  assert.match(auditPackResponse.body.taskPack.promptMarkdown, /site_audit_report_v1/)
  assert.match(auditPackResponse.body.taskPack.promptMarkdown, /审计维度/)
  assert.ok(auditPackResponse.body.taskPack.expectedArtifactSchema.requiredFields.includes('findings'))
  assert.ok(auditPackResponse.body.taskPack.expectedArtifactSchema.requiredFields.includes('summary'))

  const auditTaskPackId = auditPackResponse.body.taskPack.taskPackId

  const auditArtifactResponse = await postJson('/api/artifacts', {
    taskPackId: auditTaskPackId,
    sourceAgent: 'chatgpt',
    format: 'json',
    rawContent: JSON.stringify({
      schemaVersion: 'site_audit_report_v1',
      summary: '首页价值主张不清晰，产品页缺少参数和 CTA，信任页面不足。',
      moduleReports: [
        { module: 'site_structure', status: 'has_issues', findins: ['导航缺少 Solutions 入口'] },
        { module: 'homepage', status: 'has_issues', findins: ['价值主张模糊'] },
      ],
      findings: [
        {
          id: 'finding-001',
          category: 'site_structure',
          priority: 'blocking',
          problem: '主导航缺少 Solutions 入口，B2B 采购方无法找到应用场景。',
          affectedUrls: ['/'],
          evidence: [{ url: '/', note: '主菜单无 Solutions 链接' }],
          impact: '供应商词和应用词流量无法有效承接。',
          recommendedAction: '在主导航增加 Solutions 一级入口。',
          requiresDeveloper: false,
        },
        {
          id: 'finding-002',
          category: 'products',
          priority: 'normal',
          problem: '产品页面缺少技术参数表格。',
          affectedUrls: ['/products/custom-metal-parts/'],
          evidence: [{ url: '/products/custom-metal-parts/', note: '未检测到参数表格' }],
          impact: '采购方无法快速评估是否匹配需求。',
          recommendedAction: '为每个产品页面增加材质、公差、MOQ 等参数表。',
          requiresDeveloper: false,
        },
      ],
    }),
  })
  assert.equal(auditArtifactResponse.status, 201)
  assert.equal(auditArtifactResponse.body.artifact.workflowStepId, 'audit')

  const auditIngestionResponse = await postJson('/api/ingestion-runs', {
    artifactId: auditArtifactResponse.body.artifact.artifactId,
  })
  assert.equal(auditIngestionResponse.status, 201)
  assert.equal(auditIngestionResponse.body.ingestionRun.status, 'done')
  assert.equal(auditIngestionResponse.body.ingestionRun.reviewDecision.decision, 'auto_approved')
  assert.equal(auditIngestionResponse.body.ingestionRun.validationResult.valid, true)
  assert.equal(auditIngestionResponse.body.ingestionRun.parsedObjects.auditReport.findings.length, 2)
  assert.equal(auditIngestionResponse.body.ingestionRun.parsedObjects.auditReport.findings[0].priority, 'blocking')
  assert.equal(auditIngestionResponse.body.ingestionRun.parsedObjects.auditReport.findings[1].priority, 'normal')

  const reReviewResult = await postJson(`/api/ingestion-runs/${auditIngestionResponse.body.ingestionRun.ingestionRunId}/review`, {
    decision: 'approved',
  })
  assert.equal(reReviewResult.status, 409)
  assert.equal(reReviewResult.body.error.code, 'already_auto_approved')

  const auditWorkspace = await getJson('/api/workspace')
  assert.equal(auditWorkspace.workspace.auditRuns.length, 1)
  assert.equal(auditWorkspace.workspace.auditFindings.length, 2)
  assert.equal(auditWorkspace.workspace.auditFindings[0].status, 'blocking')
  assert.equal(auditWorkspace.workspace.auditFindings[1].status, 'open')
  assert.equal(auditWorkspace.workflow.currentStepId, 'b2b_context')

  const auditRunsLatest = await getJson('/api/audit-runs/latest')
  assert.equal(auditRunsLatest.auditRun.findingCount, 2)
  assert.equal(auditRunsLatest.auditFindings.length, 2)

  const finalPersisted = JSON.parse(await readFile(path.join(runtimeDir, 'workspace-state.json'), 'utf8'))
  assert.equal(finalPersisted.auditRuns.length, 1)
  assert.equal(finalPersisted.auditFindings.length, 2)
  assert.equal(finalPersisted.taskPacks.length, 2)
  assert.equal(finalPersisted.externalArtifacts.length, 2)
  assert.equal(finalPersisted.ingestionRuns.length, 2)

  // ── S3 B2B 上下文闭环 ──

  const b2bPrompt = await getJson('/api/b2b-context/prompt')
  assert.equal(typeof b2bPrompt.prompt, 'string')
  assert.match(b2bPrompt.prompt, /B2B 上下文证据生成/)
  assert.match(b2bPrompt.prompt, /b2b_context_evidence_v1/)

  const b2bGenResponse = await postJson('/api/b2b-context/generate', {})
  assert.equal(b2bGenResponse.status, 201)
  assert.equal(b2bGenResponse.body.b2bContext.status, 'waiting_review')
  assert.equal(b2bGenResponse.body.b2bContext.schemaVersion, 'b2b_context_evidence_v1')
  assert.ok(b2bGenResponse.body.b2bContext.businessFacts.length > 0)
  assert.ok(b2bGenResponse.body.b2bContext.productLines.length > 0)
  assert.ok(b2bGenResponse.body.b2bContext.targetCustomers.length > 0)
  assert.equal(b2bGenResponse.body.b2bContext.businessFacts[0].confirmed, false)
  assert.equal(b2bGenResponse.body.workflow.currentStepId, 'b2b_context')
  assert.equal(b2bGenResponse.body.workflow.steps[2].status, 'waiting_review')

  const b2bGetResponse = await getJson('/api/b2b-context')
  assert.equal(b2bGetResponse.b2bContext.status, 'waiting_review')

  const b2bReviewIncomplete = await postJson('/api/b2b-context/review', {
    decision: 'approved',
    confirmedFactIds: [],
    confirmedProductLineIds: [],
    confirmedCustomerIds: [],
  })
  assert.equal(b2bReviewIncomplete.status, 409)
  assert.equal(b2bReviewIncomplete.body.error.code, 'incomplete_confirmation')

  const b2bReviewResponse = await postJson('/api/b2b-context/review', {
    decision: 'approved',
    reviewer: 'operator',
    notes: '商业事实确认无误。',
  })
  assert.equal(b2bReviewResponse.status, 200)
  assert.equal(b2bReviewResponse.body.b2bContext.status, 'done')
  assert.equal(b2bReviewResponse.body.b2bContext.reviewDecision.decision, 'approved')
  assert.ok(b2bReviewResponse.body.b2bContext.businessFacts.every((f) => f.confirmed))
  assert.ok(b2bReviewResponse.body.b2bContext.productLines.every((pl) => pl.confirmed))
  assert.ok(b2bReviewResponse.body.b2bContext.targetCustomers.every((tc) => tc.confirmed))
  assert.equal(b2bReviewResponse.body.workflow.currentStepId, 'keyword_import')

  const b2bDuplicate = await postJson('/api/b2b-context/generate', {})
  assert.equal(b2bDuplicate.status, 409)
  assert.equal(b2bDuplicate.body.error.code, 'context_exists')

  const finalWorkspace = await getJson('/api/workspace')
  assert.equal(finalWorkspace.workspace.b2bContext.status, 'done')
  assert.equal(finalWorkspace.workflow.steps[2].status, 'done')
  assert.equal(finalWorkspace.workflow.steps[3].status, 'ready')
}

async function waitForHealth() {
  const startedAt = Date.now()
  while (Date.now() - startedAt < 7000) {
    if (server.exitCode !== null) {
      throw new Error('server exited before health check passed')
    }
    try {
      const response = await fetch(`${baseUrl}/api/health`)
      if (response.ok) return
    } catch {
      await delay(100)
    }
  }
  throw new Error('server did not become ready')
}

async function getJson(route) {
  const response = await fetch(`${baseUrl}${route}`)
  assert.equal(response.status, 200)
  return response.json()
}

async function postJson(route, body) {
  const response = await fetch(`${baseUrl}${route}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return {
    status: response.status,
    body: await response.json(),
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

try {
  await main()
} finally {
  if (server && server.exitCode === null) {
    server.kill()
  }
  await rm(runtimeDir, { recursive: true, force: true })
}
