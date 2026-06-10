import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(__dirname, '..')
const serverFile = path.join(appRoot, 'server', 'api-server.mjs')

const port = Number(process.env.TEST_SITE_READING_PORT || 4312)
const baseUrl = `http://127.0.0.1:${port}`
const runtimeDir = await mkdtemp(path.join(os.tmpdir(), 'b2b-seo-os-site-reading-'))

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

  const emptyWorkspace = await getJson('/api/workspace')
  assert.equal(emptyWorkspace.workspace.project, null)
  assert.equal(emptyWorkspace.workspace.latestSnapshot, null)
  assert.equal(emptyWorkspace.workspace.siteConnection.readOnly, true)
  assert.equal(emptyWorkspace.workspace.siteConnection.storesCredentials, false)
  assert.equal(emptyWorkspace.workflow.currentStepId, 'site_connection_reading')
  assert.equal(emptyWorkspace.workflow.steps[0].status, 'ready')
  assert.equal(emptyWorkspace.workflow.steps[1].status, 'locked')

  const blockedSnapshot = await postJson('/api/site-read-snapshots', {})
  assert.equal(blockedSnapshot.status, 409)
  assert.equal(blockedSnapshot.body.error.code, 'prerequisite_missing')
  assert.match(blockedSnapshot.body.error.message, /项目档案/)

  const invalidProject = await postJson('/api/project', {
    projectName: '测试工业供应商',
  })
  assert.equal(invalidProject.status, 400)
  assert.equal(invalidProject.body.error.code, 'invalid_project')
  assert.match(invalidProject.body.error.message, /网站域名/)

  const projectResponse = await postJson('/api/project', {
    projectName: '测试工业供应商',
    domain: 'example-b2b.com',
    company: '测试工业有限公司',
    industry: '工业零部件',
    targetMarkets: ['美国', '欧洲'],
    coreProducts: ['CNC 零件', '金属冲压件'],
    targetCustomers: ['采购经理', 'OEM 工程团队'],
    primaryConversionGoal: '提交询盘',
  })
  assert.equal(projectResponse.status, 200)
  assert.equal(projectResponse.body.workspace.project.projectName, '测试工业供应商')
  assert.equal(projectResponse.body.workspace.project.domain, 'https://example-b2b.com')
  assert.equal(projectResponse.body.workspace.siteConnection.wordpressWritesEnabled, false)
  assert.equal(projectResponse.body.workspace.siteConnection.storesCredentials, false)
  assert.equal(projectResponse.body.workflow.currentStepId, 'site_connection_reading')

  const savedWorkspace = await getJson('/api/workspace')
  assert.equal(savedWorkspace.workspace.project.company, '测试工业有限公司')
  assert.equal(savedWorkspace.workspace.latestSnapshot, null)

  const snapshotResponse = await postJson('/api/site-read-snapshots', {})
  assert.equal(snapshotResponse.status, 201)
  assert.equal(snapshotResponse.body.snapshot.mode, 'local_mock_read_only')
  assert.ok(snapshotResponse.body.snapshot.pages.length >= 1)
  assert.ok(snapshotResponse.body.snapshot.pageCount >= 1)
  assert.ok(snapshotResponse.body.snapshot.detectedForms.length >= 1)
  assert.ok(snapshotResponse.body.snapshot.seoFields.includes('Meta Description'))
  assert.ok(snapshotResponse.body.snapshot.anomalies.length >= 1)
  assert.equal(snapshotResponse.body.workflow.steps[0].status, 'done')
  assert.equal(snapshotResponse.body.workflow.steps[1].status, 'ready')
  assert.equal(snapshotResponse.body.workflow.currentStepId, 'audit')

  const latestSnapshot = await getJson('/api/site-read-snapshots/latest')
  assert.equal(latestSnapshot.snapshot.snapshotId, snapshotResponse.body.snapshot.snapshotId)
  assert.equal(latestSnapshot.snapshot.pages[0].url, '/')

  const workflow = await getJson('/api/workflow')
  assert.equal(workflow.workflow.completedCount, 1)
  assert.equal(workflow.workflow.nextAction, '基于读取快照生成审计结果')
  assert.equal(workflow.workflow.safetyBoundary.aiApiEnabled, false)
  assert.equal(workflow.workflow.safetyBoundary.wordpressWritesEnabled, false)
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
