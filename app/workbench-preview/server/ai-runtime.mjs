import { randomUUID } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

export const DEFAULT_AI_SETTINGS = {
  schemaVersion: '0.1',
  mode: 'manual_mock',
  provider: 'openai_compatible',
  endpoint: '',
  model: 'manual-mock',
  apiKey: '',
  temperature: 0.2,
  maxTokens: 4000,
  requestTimeoutMs: 30000,
  createdAt: null,
  updatedAt: null,
}

const AI_CALL_STATE = {
  schemaVersion: '0.1',
  runs: [],
}

const ALLOWED_MODES = new Set(['manual_mock', 'real_api'])
const ALLOWED_PROVIDERS = new Set(['openai_compatible', 'xiaomi_mimo', 'custom'])
const ALLOWED_ROLES = new Set(['system', 'user', 'assistant'])

export class AiRuntimeError extends Error {
  constructor(statusCode, code, message) {
    super(message)
    this.name = 'AiRuntimeError'
    this.statusCode = statusCode
    this.code = code
  }
}

export class JsonAiSettingsStore {
  constructor(runtimeDir) {
    this.runtimeDir = runtimeDir
    this.filePath = path.join(runtimeDir, 'ai-settings.json')
  }

  async readSettings() {
    await mkdir(this.runtimeDir, { recursive: true })
    try {
      const raw = await readFile(this.filePath, 'utf8')
      const parsed = JSON.parse(raw)
      return normalizeSettings(parsed.settings || parsed)
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error
      }
      const settings = normalizeSettings(DEFAULT_AI_SETTINGS)
      await this.writeSettings(settings)
      return settings
    }
  }

  async writeSettings(settings) {
    await mkdir(this.runtimeDir, { recursive: true })
    await writeFile(this.filePath, `${JSON.stringify({ schemaVersion: '0.1', settings: normalizeSettings(settings) }, null, 2)}\n`, 'utf8')
  }

  async updateSettings(input) {
    const current = await this.readSettings()
    const now = new Date().toISOString()
    const next = normalizeSettings({
      ...current,
      ...pickSettingsInput(input),
      createdAt: current.createdAt || now,
      updatedAt: now,
    })

    if (input && input.clearApiKey === true) {
      next.apiKey = ''
    } else if (typeof input?.apiKey === 'string' && input.apiKey.trim()) {
      next.apiKey = input.apiKey.trim()
    }

    await this.writeSettings(next)
    return next
  }
}

export class JsonAiCallRunStore {
  constructor(runtimeDir) {
    this.runtimeDir = runtimeDir
    this.filePath = path.join(runtimeDir, 'ai-call-runs.json')
  }

  async readState() {
    await mkdir(this.runtimeDir, { recursive: true })
    try {
      const raw = await readFile(this.filePath, 'utf8')
      const parsed = JSON.parse(raw)
      return {
        schemaVersion: parsed.schemaVersion || AI_CALL_STATE.schemaVersion,
        runs: Array.isArray(parsed.runs) ? parsed.runs : [],
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error
      }
      await this.writeState(AI_CALL_STATE)
      return { ...AI_CALL_STATE, runs: [] }
    }
  }

  async writeState(state) {
    await mkdir(this.runtimeDir, { recursive: true })
    await writeFile(this.filePath, `${JSON.stringify({
      schemaVersion: state.schemaVersion || AI_CALL_STATE.schemaVersion,
      runs: Array.isArray(state.runs) ? state.runs : [],
    }, null, 2)}\n`, 'utf8')
  }

  async listRuns() {
    const state = await this.readState()
    return state.runs
  }

  async insertRun(run) {
    const state = await this.readState()
    state.runs.unshift(run)
    state.runs = state.runs.slice(0, 100)
    await this.writeState(state)
    return run
  }
}

export function toPublicAiSettings(settings) {
  const normalized = normalizeSettings(settings)
  return {
    mode: normalized.mode,
    provider: normalized.provider,
    endpoint: normalized.endpoint,
    model: normalized.model,
    temperature: normalized.temperature,
    maxTokens: normalized.maxTokens,
    requestTimeoutMs: normalized.requestTimeoutMs,
    apiKeyConfigured: Boolean(normalized.apiKey),
    createdAt: normalized.createdAt,
    updatedAt: normalized.updatedAt,
  }
}

export function toPublicAiRun(run) {
  return {
    aiRunId: run.aiRunId,
    purpose: run.purpose,
    mode: run.mode,
    provider: run.provider,
    model: run.model,
    status: run.status,
    inputMessageCount: run.inputMessageCount,
    requestPreview: run.requestPreview,
    outputPreview: run.outputPreview,
    errorMessage: run.errorMessage,
    startedAt: run.startedAt,
    completedAt: run.completedAt,
    latencyMs: run.latencyMs,
  }
}

export async function testAiConnection(settingsStore, callRunStore) {
  const settings = await settingsStore.readSettings()
  if (settings.mode === 'manual_mock') {
    return {
      ok: true,
      mode: settings.mode,
      provider: settings.provider,
      model: settings.model,
      message: '手动模拟模式可用：当前不会调用真实 AI API。',
      latencyMs: 0,
    }
  }

  ensureRealApiReady(settings)
  const startedAt = Date.now()
  const { result, run } = await executeAiGeneration(settings, {
    purpose: 'connection_test',
    messages: [
      { role: 'system', content: '你是连接测试助手。' },
      { role: 'user', content: '请只回复 OK。' },
    ],
    temperature: 0,
    maxTokens: 16,
  })
  await callRunStore.insertRun(run)
  return {
    ok: true,
    mode: settings.mode,
    provider: settings.provider,
    model: settings.model,
    message: result.content.trim() || '真实 AI API 已返回响应。',
    latencyMs: Date.now() - startedAt,
    aiRunId: run.aiRunId,
  }
}

export async function generateAiText(settingsStore, callRunStore, input) {
  const settings = await settingsStore.readSettings()
  const { result, run } = await executeAiGeneration(settings, input)
  await callRunStore.insertRun(run)
  return { result, run }
}

async function executeAiGeneration(settings, input) {
  const messages = normalizeMessages(input?.messages)
  const purpose = normalizePurpose(input?.purpose)
  const now = new Date().toISOString()
  const startedAtMs = Date.now()
  const aiRunId = `airun_${now.replace(/\D/g, '').slice(0, 14)}_${randomUUID().slice(0, 8)}`
  const baseRun = {
    aiRunId,
    purpose,
    mode: settings.mode,
    provider: settings.provider,
    model: settings.model,
    inputMessageCount: messages.length,
    requestPreview: messages.map((message) => ({
      role: message.role,
      content: previewText(message.content, 300),
    })),
    outputPreview: '',
    errorMessage: '',
    startedAt: now,
    completedAt: null,
    latencyMs: 0,
    status: 'running',
  }

  try {
    const content = settings.mode === 'manual_mock'
      ? buildManualMockContent({ purpose, messages })
      : await callOpenAiCompatibleApi(settings, {
        messages,
        temperature: normalizeNumber(input?.temperature, settings.temperature, 0, 2),
        maxTokens: normalizeInteger(input?.maxTokens, settings.maxTokens, 1, 32000),
      })
    const completedAt = new Date().toISOString()
    const run = {
      ...baseRun,
      status: 'done',
      outputPreview: previewText(content, 1200),
      completedAt,
      latencyMs: Date.now() - startedAtMs,
    }
    return {
      result: {
        aiRunId,
        content,
        mode: settings.mode,
        provider: settings.provider,
        model: settings.model,
      },
      run,
    }
  } catch (error) {
    const completedAt = new Date().toISOString()
    const run = {
      ...baseRun,
      status: 'failed',
      errorMessage: error.message || 'AI 调用失败。',
      completedAt,
      latencyMs: Date.now() - startedAtMs,
    }
    if (error instanceof AiRuntimeError) {
      return Promise.reject(error)
    }
    throw new AiRuntimeError(502, 'ai_call_failed', error.message || 'AI 调用失败。')
  }
}

async function callOpenAiCompatibleApi(settings, input) {
  ensureRealApiReady(settings)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), settings.requestTimeoutMs)
  try {
    const response = await fetch(settings.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.model,
        messages: input.messages,
        temperature: input.temperature,
        max_tokens: input.maxTokens,
      }),
      signal: controller.signal,
    })
    const raw = await response.text()
    if (!response.ok) {
      throw new AiRuntimeError(response.status, 'ai_provider_error', `AI 服务返回错误 ${response.status}：${previewText(raw, 300)}`)
    }
    const data = raw ? JSON.parse(raw) : {}
    const content = data?.choices?.[0]?.message?.content || data?.output_text || data?.text || ''
    if (typeof content !== 'string' || !content.trim()) {
      throw new AiRuntimeError(502, 'ai_response_empty', 'AI 服务没有返回可用文本。')
    }
    return content
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new AiRuntimeError(504, 'ai_timeout', 'AI API 请求超时。')
    }
    if (error instanceof AiRuntimeError) {
      throw error
    }
    throw new AiRuntimeError(502, 'ai_call_failed', error.message || 'AI API 调用失败。')
  } finally {
    clearTimeout(timeout)
  }
}

function ensureRealApiReady(settings) {
  if (!settings.endpoint) {
    throw new AiRuntimeError(400, 'ai_settings_incomplete', '请先配置 AI API Endpoint。')
  }
  if (!settings.model) {
    throw new AiRuntimeError(400, 'ai_settings_incomplete', '请先配置 AI 模型名称。')
  }
  if (!settings.apiKey) {
    throw new AiRuntimeError(400, 'ai_settings_incomplete', '请先配置 AI API Key。')
  }
}

function normalizeSettings(input) {
  const now = new Date().toISOString()
  const settings = {
    ...DEFAULT_AI_SETTINGS,
    ...(input && typeof input === 'object' ? input : {}),
  }
  if (!ALLOWED_MODES.has(settings.mode)) {
    throw new AiRuntimeError(400, 'invalid_ai_settings', 'AI 调用模式只能是手动模拟或真实 API。')
  }
  if (!ALLOWED_PROVIDERS.has(settings.provider)) {
    throw new AiRuntimeError(400, 'invalid_ai_settings', 'AI Provider 不在支持范围内。')
  }
  settings.endpoint = typeof settings.endpoint === 'string' ? settings.endpoint.trim() : ''
  settings.model = typeof settings.model === 'string' && settings.model.trim() ? settings.model.trim() : 'manual-mock'
  settings.apiKey = typeof settings.apiKey === 'string' ? settings.apiKey.trim() : ''
  settings.temperature = normalizeNumber(settings.temperature, DEFAULT_AI_SETTINGS.temperature, 0, 2)
  settings.maxTokens = normalizeInteger(settings.maxTokens, DEFAULT_AI_SETTINGS.maxTokens, 1, 32000)
  settings.requestTimeoutMs = normalizeInteger(settings.requestTimeoutMs, DEFAULT_AI_SETTINGS.requestTimeoutMs, 1000, 120000)
  settings.createdAt = typeof settings.createdAt === 'string' ? settings.createdAt : now
  settings.updatedAt = typeof settings.updatedAt === 'string' ? settings.updatedAt : now
  settings.schemaVersion = '0.1'
  return settings
}

function pickSettingsInput(input) {
  if (!input || typeof input !== 'object') return {}
  const picked = {}
  for (const key of ['mode', 'provider', 'endpoint', 'model', 'temperature', 'maxTokens', 'requestTimeoutMs']) {
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      picked[key] = input[key]
    }
  }
  return picked
}

function normalizeMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new AiRuntimeError(400, 'invalid_ai_request', 'AI 请求必须包含至少一条消息。')
  }
  return messages.map((message) => {
    const role = typeof message?.role === 'string' ? message.role : ''
    const content = typeof message?.content === 'string' ? message.content.trim() : ''
    if (!ALLOWED_ROLES.has(role) || !content) {
      throw new AiRuntimeError(400, 'invalid_ai_request', 'AI 消息必须包含合法角色和非空内容。')
    }
    return { role, content }
  })
}

function normalizePurpose(purpose) {
  if (typeof purpose !== 'string' || !purpose.trim()) return 'general_ai_call'
  return purpose.trim().slice(0, 80)
}

function buildManualMockContent({ purpose, messages }) {
  const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user')
  return [
    '# 模拟 AI 输出',
    '',
    '当前为手动模拟模式，未调用真实 AI API。这个输出用于验证全局 AI 调用链路、日志记录和前端交互。',
    '',
    `## 调用目的`,
    purpose,
    '',
    '## 输入摘要',
    lastUserMessage ? previewText(lastUserMessage.content, 800) : '没有用户消息。',
    '',
    '## 下一步',
    '切换到真实 API 模式并配置 Endpoint、模型和 API Key 后，系统会用同一套接口发起真实 AI 调用。',
  ].join('\n')
}

function normalizeNumber(value, fallback, min, max) {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.min(max, Math.max(min, number))
}

function normalizeInteger(value, fallback, min, max) {
  const number = Math.round(Number(value))
  if (!Number.isFinite(number)) return fallback
  return Math.min(max, Math.max(min, number))
}

function previewText(value, limit) {
  const text = typeof value === 'string' ? value : JSON.stringify(value)
  return text.length > limit ? `${text.slice(0, limit)}...` : text
}
