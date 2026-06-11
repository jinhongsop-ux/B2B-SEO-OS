import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(__dirname, '..')
const serverFile = path.join(appRoot, 'server', 'api-server.mjs')

const port = Number(process.env.TEST_AI_API_PORT || 4314)
const fakeProviderPort = Number(process.env.TEST_FAKE_AI_PROVIDER_PORT || 4324)
const baseUrl = `http://127.0.0.1:${port}`
const fakeProviderBaseUrl = `http://127.0.0.1:${fakeProviderPort}/v1`
const fakeProviderUrl = `${fakeProviderBaseUrl}/chat/completions`
const runtimeDir = await mkdtemp(path.join(os.tmpdir(), 'b2b-seo-os-ai-api-'))

let server
let fakeProvider

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

  const defaultSettings = await getJson('/api/ai/settings')
  assert.equal(defaultSettings.settings.mode, 'manual_mock')
  assert.equal(defaultSettings.settings.provider, 'openai_compatible')
  assert.equal(defaultSettings.settings.apiKeyConfigured, false)
  assert.equal('apiKey' in defaultSettings.settings, false)

  const mockConnection = await postJson('/api/ai/test-connection', {})
  assert.equal(mockConnection.status, 200)
  assert.equal(mockConnection.body.result.ok, true)
  assert.equal(mockConnection.body.result.mode, 'manual_mock')
  assert.match(mockConnection.body.result.message, /模拟/)

  const generated = await postJson('/api/ai/generate', {
    purpose: 'meta_prompt_compile',
    messages: [
      { role: 'system', content: '你是 B2B SEO OS 的元提示词编译器。' },
      { role: 'user', content: '请根据站点读取阶段生成外部智能体执行提示词。' },
    ],
    temperature: 0.2,
    maxTokens: 800,
  })
  assert.equal(generated.status, 200)
  assert.equal(generated.body.result.mode, 'manual_mock')
  assert.match(generated.body.result.content, /模拟 AI 输出/)
  assert.equal(generated.body.run.status, 'done')
  assert.equal(generated.body.run.purpose, 'meta_prompt_compile')
  assert.equal('apiKey' in generated.body.run, false)

  const runs = await getJson('/api/ai/runs')
  assert.equal(runs.runs.length, 1)
  assert.equal(runs.runs[0].status, 'done')
  assert.equal(runs.runs[0].mode, 'manual_mock')

  fakeProvider = await startFakeProvider()

  const saved = await postJson('/api/ai/settings', {
    mode: 'real_api',
    provider: 'xiaomi_mimo',
    endpoint: fakeProviderBaseUrl,
    model: 'mimo-test-model',
    apiKey: 'sk-local-secret-for-test',
    temperature: 0.35,
    maxTokens: 4096,
  })
  assert.equal(saved.status, 200)
  assert.equal(saved.body.settings.mode, 'real_api')
  assert.equal(saved.body.settings.provider, 'xiaomi_mimo')
  assert.equal(saved.body.settings.apiKeyConfigured, true)
  assert.equal('apiKey' in saved.body.settings, false)

  const afterSave = await getJson('/api/ai/settings')
  assert.equal(afterSave.settings.apiKeyConfigured, true)
  assert.equal('apiKey' in afterSave.settings, false)

  const health = await getJson('/api/health')
  assert.equal(health.aiApiEnabled, true)
  assert.equal(health.aiProvider, 'xiaomi_mimo')
  assert.equal(health.aiModel, 'mimo-test-model')
  assert.equal(health.aiApiKeyConfigured, true)

  const realConnection = await postJson('/api/ai/test-connection', {})
  assert.equal(realConnection.status, 200)
  assert.equal(realConnection.body.result.ok, true)
  assert.equal(realConnection.body.result.mode, 'real_api')
  assert.match(realConnection.body.result.message, /OK/)

  const realGenerated = await postJson('/api/ai/generate', {
    purpose: 'agent_taskpack_compile',
    messages: [
      { role: 'system', content: '你是 B2B SEO OS 的元提示词编译器。' },
      { role: 'user', content: '请生成站点读取智能体提示词文档。' },
    ],
  })
  assert.equal(realGenerated.status, 200)
  assert.equal(realGenerated.body.result.mode, 'real_api')
  assert.match(realGenerated.body.result.content, /真实 API 模拟响应/)

  const runsAfterRealApi = await getJson('/api/ai/runs')
  assert.equal(runsAfterRealApi.runs.length, 3)
  assert.equal(runsAfterRealApi.runs[0].purpose, 'agent_taskpack_compile')
  assert.equal(runsAfterRealApi.runs[0].mode, 'real_api')

  const persisted = JSON.parse(await readFile(path.join(runtimeDir, 'ai-settings.json'), 'utf8'))
  assert.equal(persisted.settings.apiKey, 'sk-local-secret-for-test')
  assert.equal(persisted.settings.mode, 'real_api')
  assert.equal(persisted.settings.endpoint, fakeProviderBaseUrl)

  const badJson = await rawPost('/api/ai/settings', '{')
  assert.equal(badJson.status, 400)
  assert.equal(badJson.body.error.code, 'bad_json')

  const invalidGenerate = await postJson('/api/ai/generate', {
    purpose: 'meta_prompt_compile',
    messages: [],
  })
  assert.equal(invalidGenerate.status, 400)
  assert.equal(invalidGenerate.body.error.code, 'invalid_ai_request')

  const cleared = await postJson('/api/ai/settings', {
    mode: 'real_api',
    provider: 'openai_compatible',
    endpoint: fakeProviderUrl,
    model: 'gpt-test',
    clearApiKey: true,
  })
  assert.equal(cleared.status, 200)
  assert.equal(cleared.body.settings.apiKeyConfigured, false)

  const realConnectionWithoutKey = await postJson('/api/ai/test-connection', {})
  assert.equal(realConnectionWithoutKey.status, 400)
  assert.equal(realConnectionWithoutKey.body.error.code, 'ai_settings_incomplete')
  assert.match(realConnectionWithoutKey.body.error.message, /API Key/)
}

function startFakeProvider() {
  const provider = http.createServer(async (request, response) => {
    if (request.method !== 'POST' || request.url !== '/v1/chat/completions') {
      response.writeHead(404, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify({ error: 'not found' }))
      return
    }
    const chunks = []
    for await (const chunk of request) {
      chunks.push(chunk)
    }
    const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
    assert.equal(request.headers.authorization, 'Bearer sk-local-secret-for-test')
    assert.equal(body.model, 'mimo-test-model')
    const lastUser = [...(body.messages || [])].reverse().find((message) => message.role === 'user')?.content || ''
    const content = lastUser.includes('OK') || lastUser.includes('只回复 OK')
      ? 'OK'
      : `真实 API 模拟响应：${lastUser}`
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({
      choices: [
        {
          message: {
            role: 'assistant',
            content,
          },
        },
      ],
    }))
  })
  return new Promise((resolve) => {
    provider.listen(fakeProviderPort, '127.0.0.1', () => resolve(provider))
  })
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

async function rawPost(route, body) {
  const response = await fetch(`${baseUrl}${route}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
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
  if (fakeProvider) {
    await new Promise((resolve) => fakeProvider.close(resolve))
  }
  await rm(runtimeDir, { recursive: true, force: true })
}
