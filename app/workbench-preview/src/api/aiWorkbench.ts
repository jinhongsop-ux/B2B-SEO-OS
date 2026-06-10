import type { AgentRun, BackendHealth, HumanReviewDecision, PromptDefinition } from '../types'

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
