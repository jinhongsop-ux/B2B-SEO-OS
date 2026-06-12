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

  // ── S4 种子关键词计划 ──

  const seedPrompt = await getJson('/api/seed-keyword-plan/prompt')
  assert.equal(typeof seedPrompt.prompt, 'string')
  assert.match(seedPrompt.prompt, /种子关键词计划/)
  assert.match(seedPrompt.prompt, /seed_keyword_plan_v1/)
  assert.match(seedPrompt.prompt, /核心产品词矩阵/)

  const seedGenResponse = await postJson('/api/seed-keyword-plan/generate', {})
  assert.equal(seedGenResponse.status, 201)
  assert.equal(seedGenResponse.body.seedKeywordPlan.schemaVersion, 'seed_keyword_plan_v1')
  assert.equal(seedGenResponse.body.seedKeywordPlan.status, 'ready')
  assert.ok(seedGenResponse.body.seedKeywordPlan.seedGroups.length >= 3)
  assert.ok(seedGenResponse.body.seedKeywordPlan.paaQuestions.length > 0)
  assert.ok(seedGenResponse.body.seedKeywordPlan.researchInstructions.length > 0)
  assert.ok(seedGenResponse.body.seedKeywordPlan.competitorResearchSeeds.length > 0)

  const seedGroup = seedGenResponse.body.seedKeywordPlan.seedGroups[0]
  assert.equal(seedGroup.moduleType, 'core_product')
  assert.ok(seedGroup.seeds.length > 0)
  assert.ok(seedGroup.seeds[0].keyword)
  assert.ok(seedGroup.seeds[0].priority)

  const seedGetResponse = await getJson('/api/seed-keyword-plan')
  assert.equal(seedGetResponse.seedKeywordPlan.status, 'ready')

  const seedWorkspace = await getJson('/api/workspace')
  assert.equal(seedWorkspace.workspace.seedKeywordPlan.status, 'ready')

  const seedDuplicate = await postJson('/api/seed-keyword-plan/generate', {})
  assert.equal(seedDuplicate.status, 409)
  assert.equal(seedDuplicate.body.error.code, 'plan_exists')

  const seedReset = await postJson('/api/seed-keyword-plan/reset', {})
  assert.equal(seedReset.status, 200)
  assert.equal(seedReset.body.result.reset, true)

  const seedAfterReset = await getJson('/api/seed-keyword-plan')
  assert.equal(seedAfterReset.seedKeywordPlan, null)

  // ── S5 关键词导入 ──

  const importEmpty = await postJson('/api/keywords/import', { csvText: '' })
  assert.equal(importEmpty.status, 400)
  assert.equal(importEmpty.body.error.code, 'invalid_csv')

  const csvText = [
    'keyword,volume,kd,intent',
    'cnc machining parts,1200,35,commercial',
    'custom metal stamping,800,28,commercial',
    'oem manufacturing services,600,42,commercial',
    'metal parts supplier,900,30,commercial',
    'buy cheap stuff,5000,15,transactional',
    'amazon warehouse,10000,5,navigational',
    'how to ensure quality when sourcing internationally,400,20,informational',
  ].join('\n')

  const importResponse = await postJson('/api/keywords/import', {
    csvText,
    sourceTool: 'semrush',
    market: '美国',
  })
  assert.equal(importResponse.status, 201)
  assert.equal(importResponse.body.importedCount, 7)
  assert.equal(importResponse.body.skippedCount, 0)
  assert.equal(importResponse.body.batch.sourceTool, 'semrush')

  const kwList = await getJson('/api/keywords')
  assert.equal(kwList.keywords.length, 7)
  assert.equal(kwList.keywords[0].status, 'raw_imported')
  assert.equal(kwList.importBatches.length, 1)
  const importDup = await postJson('/api/keywords/import', {
    csvText: 'keyword,volume\ncnc machining parts,1200\nanother new keyword,150',
  })
  assert.equal(importDup.status, 201)
  assert.equal(importDup.body.importedCount, 1)
  assert.equal(importDup.body.skippedCount, 1)

  // ── S6 关键词清洗 ──

  const cleanResponse = await postJson('/api/keywords/clean', {})
  assert.equal(cleanResponse.status, 201)
  assert.equal(cleanResponse.body.cleaningRun.status, 'waiting_review')
  assert.equal(cleanResponse.body.cleaningRun.totalKeywords, 8)
  assert.ok(cleanResponse.body.cleaningRun.approveCount > 0)
  assert.ok(cleanResponse.body.cleaningRun.rejectCount > 0)

  // Verify B2C and brand terms detected
  const suggestions = cleanResponse.body.cleaningRun.suggestions
  const cheapSuggestion = suggestions.find((s) => s.keyword.includes('cheap'))
  assert.ok(cheapSuggestion)
  assert.equal(cheapSuggestion.suggestedAction, 'reject')
  assert.equal(cheapSuggestion.isB2CTerm, true)

  const amazonSuggestion = suggestions.find((s) => s.keyword.includes('amazon'))
  assert.ok(amazonSuggestion)
  assert.equal(amazonSuggestion.suggestedAction, 'reject')
  assert.equal(amazonSuggestion.isBrandTerm, true)

  const cncSuggestion = suggestions.find((s) => s.keyword.includes('cnc'))
  assert.ok(cncSuggestion)
  assert.equal(cncSuggestion.suggestedAction, 'approve')

  const cleaningRuns = await getJson('/api/keywords/cleaning-runs')
  assert.equal(cleaningRuns.cleaningRuns.length, 1)

  // ── S7 关键词审核入库 ──

  const cleanReviewResponse = await postJson(`/api/keywords/cleaning-runs/${cleanResponse.body.cleaningRun.cleaningRunId}/review`, {
    decision: 'approved',
    reviewer: 'operator',
    notes: '清洗建议合理。',
  })
  assert.equal(cleanReviewResponse.status, 200)
  assert.equal(cleanReviewResponse.body.cleaningRun.status, 'done')

  const kwAfterClean = await getJson('/api/keywords')
  const approvedKws = kwAfterClean.keywords.filter((kw) => kw.status === 'approved')
  const rejectedKws = kwAfterClean.keywords.filter((kw) => kw.status === 'rejected')
  assert.equal(approvedKws.length, cleanResponse.body.cleaningRun.approveCount)
  assert.equal(rejectedKws.length, cleanResponse.body.cleaningRun.rejectCount)
  assert.ok(approvedKws.some((kw) => kw.keyword.includes('cnc')))
  assert.ok(rejectedKws.some((kw) => kw.keyword.includes('cheap')))
  assert.ok(rejectedKws.some((kw) => kw.keyword.includes('amazon')))

  const kwWorkspace = await getJson('/api/workspace')
  assert.equal(kwWorkspace.workspace.keywordCount, 8)
  assert.equal(kwWorkspace.workspace.approvedKeywordCount, cleanResponse.body.cleaningRun.approveCount)
  assert.equal(kwWorkspace.workflow.currentStepId, 'keyword_assignment')
  assert.equal(kwWorkspace.workflow.steps[3].status, 'done')
  assert.equal(kwWorkspace.workflow.steps[4].status, 'done')

  // ── S8 关键词分配 ──

  const assignResponse = await postJson('/api/keywords/assign', {})
  assert.equal(assignResponse.status, 201)
  assert.equal(assignResponse.body.assignmentRun.status, 'waiting_review')
  assert.ok(assignResponse.body.assignmentRun.totalKeywords > 0)
  assert.ok(assignResponse.body.assignmentRun.suggestions.length > 0)

  const assignSuggestions = assignResponse.body.assignmentRun.suggestions
  const productSuggestion = assignSuggestions.find((s) => s.keyword.includes('cnc'))
  assert.ok(productSuggestion)
  assert.ok(productSuggestion.suggestedUrl)
  assert.ok(productSuggestion.suggestedPageType)

  const assignRuns = await getJson('/api/keywords/assignment-runs')
  assert.equal(assignRuns.assignmentRuns.length, 1)

  const assignReview = await postJson(`/api/keywords/assignment-runs/${assignResponse.body.assignmentRun.assignmentRunId}/review`, {
    decision: 'approved',
    reviewer: 'operator',
    notes: '分配合理。',
  })
  assert.equal(assignReview.status, 200)
  assert.equal(assignReview.body.assignmentRun.status, 'done')

  const kwFinal = await getJson('/api/keywords')
  const assignedKws = kwFinal.keywords.filter((kw) => kw.isUsed)
  assert.ok(assignedKws.length > 0)
  assert.ok(assignedKws.every((kw) => kw.assignedUrl))

  const assignWorkspace = await getJson('/api/workspace')
  assert.equal(assignWorkspace.workflow.steps[5].status, 'done')
  assert.equal(assignWorkspace.workflow.currentStepId, 'page_repair')

  // ── S9 页面修复包 ──

  const repairResponse = await postJson('/api/page-repair/generate', {})
  assert.equal(repairResponse.status, 201)
  assert.ok(repairResponse.body.packages.length > 0)
  const repairPkg = repairResponse.body.packages[0]
  assert.ok(repairPkg.recommendedChanges.length > 0)
  assert.equal(repairPkg.status, 'waiting_review')

  const repairGet = await getJson('/api/page-repair')
  assert.ok(repairGet.packages.length > 0)

  // Approve all packages
  for (const pkg of repairResponse.body.packages) {
    await postJson(`/api/page-repair/${pkg.fixId}/review`, { decision: 'approved' })
  }

  const repairWorkspace = await getJson('/api/workspace')
  assert.equal(repairWorkspace.workflow.steps[6].status, 'done')

  // ── S10 未使用词聚类 ──

  const clusterResponse = await postJson('/api/keywords/cluster', {})
  assert.equal(clusterResponse.status, 201)
  assert.ok(clusterResponse.body.clusterRun.clusterCount > 0)
  assert.ok(clusterResponse.body.opportunities.length > 0)
  assert.equal(clusterResponse.body.clusterRun.status, 'done')

  const clusterGet = await getJson('/api/keywords/clusters')
  assert.ok(clusterGet.clusters.length > 0)
  assert.ok(clusterGet.opportunities.length > 0)

  // ── S11 内容交接 ──

  const handoffResponse = await postJson('/api/content-handoff/generate', {})
  assert.equal(handoffResponse.status, 201)
  assert.ok(handoffResponse.body.handoff.totalTasks > 0)
  assert.equal(handoffResponse.body.handoff.status, 'done')

  const handoffGet = await getJson('/api/content-handoff')
  assert.ok(handoffGet.handoffs.length > 0)

  const handoffWorkspace = await getJson('/api/workspace')
  assert.equal(handoffWorkspace.workflow.steps[7].status, 'done')

  // ── S13 QA 与交付 ──

  const qaResponse = await postJson('/api/qa/run', {})
  assert.equal(qaResponse.status, 201)
  assert.ok(qaResponse.body.qaRun.totalChecks > 0)
  assert.ok(qaResponse.body.qaRun.passCount > 0)
  assert.equal(typeof qaResponse.body.qaRun.summary, 'string')

  // If all pass, delivery report is auto-generated
  if (qaResponse.body.qaRun.failCount === 0) {
    assert.ok(qaResponse.body.deliveryReports.length > 0)
    assert.ok(qaResponse.body.deliveryReports[0].deliverables.length > 0)
    assert.ok(qaResponse.body.deliveryReports[0].nextSteps.length > 0)
  }

  const qaGet = await getJson('/api/qa')
  assert.ok(qaGet.qaRuns.length > 0)

  const deliveryGet = await getJson('/api/delivery')
  assert.ok(deliveryGet.deliveryReports.length > 0)

  // Final workflow state
  const finalWf = await getJson('/api/workflow')
  assert.equal(finalWf.workflow.completedCount, 11)
  assert.equal(finalWf.workflow.steps.every((s) => s.status === 'done'), true)
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
