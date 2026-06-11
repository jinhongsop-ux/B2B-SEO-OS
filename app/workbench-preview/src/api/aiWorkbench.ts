import type { AgentRun, AiCallRun, AiConnectionTestResult, AiGenerateResult, AiProvider, BackendHealth, HumanReviewDecision, PromptDefinition, AiSettings, AiMode } from '../types'

type ApiErrorBody = { error?: { code: string; message: string } }

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  })
  const body = (await response.json()) as T & ApiErrorBody
  if (!response.ok) {
    const message = body.error?.message || `API request failed: ${response.status}`
    throw new Error(message)
  }
  return body
}

export async function fetchHealth() {
  return requestJson<BackendHealth>('/api/health')
}

export async function fetchAiSettings() {
  const body = await requestJson<{ settings: AiSettings }>('/api/ai/settings')
  return body.settings
}

export async function saveAiSettings(input: {
  mode: AiMode;
  provider: AiProvider;
  endpoint: string;
  model: string;
  apiKey?: string;
  clearApiKey?: boolean;
  temperature: number;
  maxTokens: number;
  requestTimeoutMs?: number;
}) {
  const body = await requestJson<{ settings: AiSettings }>('/api/ai/settings', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return body.settings
}

export async function testAiApiConnection() {
  return requestJson<{ result: AiConnectionTestResult; settings: AiSettings }>('/api/ai/test-connection', {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export async function generateAiText(input: {
  purpose: string;
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  temperature?: number;
  maxTokens?: number;
}) {
  return requestJson<{ result: AiGenerateResult; run: AiCallRun }>('/api/ai/generate', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function fetchAiCallRuns() {
  const body = await requestJson<{ runs: AiCallRun[] }>('/api/ai/runs')
  return body.runs
}

export async function fetchPrompts() {
  const body = await requestJson<{ prompts: PromptDefinition[] }>('/api/prompts')
  return body.prompts
}

export async function fetchPrompt(promptId: string) {
  const body = await requestJson<{ prompt: PromptDefinition }>(`/api/prompts/${encodeURIComponent(promptId)}`)
  return body.prompt
}

export async function fetchRuns() {
  const body = await requestJson<{ runs: AgentRun[] }>('/api/agent-runs')
  return body.runs
}

export async function fetchRun(runId: string) {
  const body = await requestJson<{ run: AgentRun }>(`/api/agent-runs/${encodeURIComponent(runId)}`)
  return body.run
}

export async function createAgentRun(input: { promptId: string; contextPreset: string; userInstruction: string }) {
  const body = await requestJson<{ run: AgentRun }>('/api/agent-runs', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return body.run
}

export async function reviewAgentRun(runId: string, decision: HumanReviewDecision, notes: string) {
  const body = await requestJson<{ run: AgentRun }>(`/api/agent-runs/${encodeURIComponent(runId)}/review`, {
    method: 'POST',
    body: JSON.stringify({
      decision,
      reviewer: 'operator',
      notes,
    }),
  })
  return body.run
}

export async function cancelAgentRun(runId: string) {
  const body = await requestJson<{ run: AgentRun }>(`/api/agent-runs/${encodeURIComponent(runId)}/cancel`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
  return body.run
}
