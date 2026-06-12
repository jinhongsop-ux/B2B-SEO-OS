import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(__dirname, '..')
const serverFile = path.join(appRoot, 'server', 'api-server.mjs')

const port = Number(process.env.TEST_API_PORT || 4311)
const baseUrl = `http://127.0.0.1:${port}`
const runtimeDir = await mkdtemp(path.join(os.tmpdir(), 'b2b-seo-os-api-'))

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

  let stdout = ''
  let stderr = ''
  server.stdout.on('data', (chunk) => {
    stdout += chunk.toString()
  })
  server.stderr.on('data', (chunk) => {
    stderr += chunk.toString()
  })

  await waitForHealth(stdout, stderr)

  const health = await getJson('/api/health')
  assert.equal(health.ok, true)
  assert.equal(health.mode, 'manual_mock')
  assert.equal(health.aiApiEnabled, false)
  assert.equal(health.wordpressWritesEnabled, false)

  const prompts = await getJson('/api/prompts')
  assert.equal(prompts.prompts.length, 18)
  assert.ok(prompts.prompts.every((prompt) => prompt.canWriteWordPress === false))
  assert.ok(prompts.prompts.some((prompt) => prompt.promptId === 'keyword-ai-cleaning-v1'))

  const prompt = await getJson('/api/prompts/keyword-ai-cleaning-v1')
  assert.equal(prompt.prompt.promptId, 'keyword-ai-cleaning-v1')
  assert.equal(prompt.prompt.requiresHumanReview, true)
  assert.match(prompt.prompt.markdownTemplate, /关键词/)

  const badJson = await rawRequest('/api/agent-runs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{',
  })
  assert.equal(badJson.status, 400)
  assert.equal((await badJson.json()).error.code, 'bad_json')

  const missingPrompt = await postJson('/api/agent-runs', {
    promptId: 'missing-prompt',
    contextPreset: 'keyword_sample',
    userInstruction: 'test missing prompt',
  })
  assert.equal(missingPrompt.status, 404)
  assert.equal(missingPrompt.body.error.code, 'unknown_prompt')

  const created = await postJson('/api/agent-runs', {
    promptId: 'keyword-ai-cleaning-v1',
    contextPreset: 'keyword_sample',
    userInstruction: '清洗当前样本关键词，保留人工审核点。',
  })
  assert.equal(created.status, 201)
  assert.equal(created.body.run.promptId, 'keyword-ai-cleaning-v1')
  assert.equal(created.body.run.status, 'waiting_for_human')
  assert.equal(created.body.run.outputEnvelope.humanReviewRequired, true)
  assert.equal(created.body.run.manualPromptPackage.copyFormat, 'markdown')
  assert.match(created.body.run.manualPromptPackage.markdown, /安全边界/)
  assert.ok(Array.isArray(created.body.run.outputEnvelope.taskCandidates))

  const runId = created.body.run.runId
  const runList = await getJson('/api/agent-runs')
  assert.equal(runList.runs.length, 1)
  assert.equal(runList.runs[0].runId, runId)

  const persistedRaw = await readFile(path.join(runtimeDir, 'agent-runs.json'), 'utf8')
  const persisted = JSON.parse(persistedRaw)
  assert.equal(persisted.runs.length, 1)
  assert.equal(persisted.runs[0].runId, runId)

  const singleRun = await getJson(`/api/agent-runs/${runId}`)
  assert.equal(singleRun.run.runId, runId)

  const approved = await postJson(`/api/agent-runs/${runId}/review`, {
    decision: 'approved',
    reviewer: 'operator',
    notes: '输出可进入人工确认后的任务候选。',
  })
  assert.equal(approved.status, 200)
  assert.equal(approved.body.run.status, 'done')
  assert.equal(approved.body.run.humanReview.decision, 'approved')

  const rejectedSeed = await postJson('/api/agent-runs', {
    promptId: 'front-stage-b2b-audit-v1',
    contextPreset: 'audit_sample',
    userInstruction: '生成审计输出。',
  })
  assert.equal(rejectedSeed.status, 201)
  const rejected = await postJson(`/api/agent-runs/${rejectedSeed.body.run.runId}/review`, {
    decision: 'rejected',
    reviewer: 'operator',
    notes: '审计证据不足，要求重新整理。',
  })
  assert.equal(rejected.status, 200)
  assert.equal(rejected.body.run.status, 'failed')

  const invalidRun = await postJson('/api/agent-runs/run_missing/review', {
    decision: 'approved',
    reviewer: 'operator',
  })
  assert.equal(invalidRun.status, 404)
  assert.equal(invalidRun.body.error.code, 'unknown_run')

  const cancelledSeed = await postJson('/api/agent-runs', {
    promptId: 'delivery-package-generation-v1',
    contextPreset: 'delivery_sample',
    userInstruction: '生成交付报告摘要。',
  })
  assert.equal(cancelledSeed.status, 201)
  const cancelled = await postJson(`/api/agent-runs/${cancelledSeed.body.run.runId}/cancel`, {})
  assert.equal(cancelled.status, 200)
  assert.equal(cancelled.body.run.status, 'cancelled')
}

async function waitForHealth(stdoutRef, stderrRef) {
  const startedAt = Date.now()
  while (Date.now() - startedAt < 7000) {
    if (server.exitCode !== null) {
      throw new Error(`server exited early\nstdout:\n${stdoutRef}\nstderr:\n${stderrRef}`)
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
  const response = await rawRequest(route)
  assert.equal(response.status, 200)
  return response.json()
}

async function postJson(route, body) {
  const response = await rawRequest(route, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return {
    status: response.status,
    body: await response.json(),
  }
}

async function rawRequest(route, options = {}) {
  return fetch(`${baseUrl}${route}`, options)
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
