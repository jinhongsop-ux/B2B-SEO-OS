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
