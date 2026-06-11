import type { AgentTaskPack, ExternalArtifact, IngestionRun, ProjectProfile, SiteReadSnapshot, WorkflowState, WorkspaceState } from '../types'

type ApiErrorBody = { error?: { code: string; message: string } }

export interface WorkspaceResponse {
  workspace: WorkspaceState;
  workflow: WorkflowState;
}

export interface ProjectProfileInput {
  projectName: string;
  domain: string;
  company: string;
  industry: string;
  targetMarkets: string[];
  coreProducts: string[];
  targetCustomers: string[];
  primaryConversionGoal: string;
}

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
    throw new Error(body.error?.message || `API 请求失败：${response.status}`)
  }
  return body
}

export async function fetchWorkspace() {
  return requestJson<WorkspaceResponse>('/api/workspace')
}

export async function fetchWorkflow() {
  return requestJson<{ workflow: WorkflowState }>('/api/workflow')
}

export async function saveProjectProfile(input: ProjectProfileInput) {
  return requestJson<WorkspaceResponse & { project: ProjectProfile }>('/api/project', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function createSiteReadSnapshot() {
  return requestJson<WorkspaceResponse & { snapshot: SiteReadSnapshot }>('/api/site-read-snapshots', {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export async function fetchLatestSiteReadSnapshot() {
  return requestJson<{ snapshot: SiteReadSnapshot }>('/api/site-read-snapshots/latest')
}

export async function generateTaskPack(input: {
  workflowStepId: string;
  taskType: string;
  targetAgent: string;
  userInput?: string;
}) {
  return requestJson<WorkspaceResponse & { taskPack: AgentTaskPack }>('/api/task-packs/generate', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function submitArtifact(input: {
  taskPackId: string;
  sourceAgent: string;
  format: 'json' | 'markdown' | 'csv' | 'mixed_text';
  rawContent: string;
}) {
  return requestJson<WorkspaceResponse & { artifact: ExternalArtifact }>('/api/artifacts', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function runArtifactIngestion(input: { artifactId: string }) {
  return requestJson<WorkspaceResponse & { ingestionRun: IngestionRun }>('/api/ingestion-runs', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function reviewIngestionRun(ingestionRunId: string, input: {
  decision: 'approved' | 'rejected';
  reviewer: string;
  notes: string;
}) {
  return requestJson<WorkspaceResponse & { ingestionRun: IngestionRun }>(`/api/ingestion-runs/${encodeURIComponent(ingestionRunId)}/review`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
