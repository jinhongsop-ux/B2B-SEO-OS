import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

export const DEFAULT_WORKSPACE_STATE = {
  schemaVersion: '0.2',
  project: null,
  siteConnection: {
    mode: 'local_mock_read_only',
    readOnly: true,
    storesCredentials: false,
    wordpressWritesEnabled: false,
    lastCheckedAt: null,
  },
  siteReadSnapshots: [],
  auditRuns: [],
  auditFindings: [],
  b2bContext: null,
  keywordImportBatches: [],
  keywords: [],
  keywordCleaningRuns: [],
  keywordAssignmentRuns: [],
  keywordAssignments: [],
  unusedKeywordPool: [],
  pageRepairPackages: [],
  taskCandidates: [],
  unusedKeywordClusterRuns: [],
  unusedKeywordClusters: [],
  contentOpportunities: [],
  contentHandoffs: [],
  qaRuns: [],
  deliveryReports: [],
  artifacts: [],
  taskPacks: [],
  externalArtifacts: [],
  ingestionRuns: [],
}

export class JsonWorkspaceStore {
  constructor(runtimeDir) {
    this.runtimeDir = runtimeDir
    this.filePath = path.join(runtimeDir, 'workspace-state.json')
  }

  async readState() {
    await mkdir(this.runtimeDir, { recursive: true })
    try {
      const raw = await readFile(this.filePath, 'utf8')
      return normalizeWorkspaceState(JSON.parse(raw))
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error
      }
      const state = createEmptyWorkspaceState()
      await this.writeState(state)
      return state
    }
  }

  async writeState(state) {
    await mkdir(this.runtimeDir, { recursive: true })
    await writeFile(this.filePath, `${JSON.stringify(normalizeWorkspaceState(state), null, 2)}\n`, 'utf8')
  }

  async updateState(updater) {
    const current = await this.readState()
    const draft = cloneJson(current)
    const result = updater(draft)
    const state = normalizeWorkspaceState(draft)
    await this.writeState(state)
    return { state, result }
  }
}

export function createEmptyWorkspaceState() {
  return cloneJson(DEFAULT_WORKSPACE_STATE)
}

function normalizeWorkspaceState(input) {
  const state = {
    ...createEmptyWorkspaceState(),
    ...(input && typeof input === 'object' ? input : {}),
  }
  for (const key of [
    'siteReadSnapshots',
    'auditRuns',
    'auditFindings',
    'keywordImportBatches',
    'keywords',
    'keywordCleaningRuns',
    'keywordAssignmentRuns',
    'keywordAssignments',
    'unusedKeywordPool',
    'pageRepairPackages',
    'taskCandidates',
    'unusedKeywordClusterRuns',
    'unusedKeywordClusters',
    'contentOpportunities',
    'contentHandoffs',
    'qaRuns',
    'deliveryReports',
    'artifacts',
    'taskPacks',
    'externalArtifacts',
    'ingestionRuns',
  ]) {
    if (!Array.isArray(state[key])) state[key] = []
  }
  state.siteConnection = {
    ...DEFAULT_WORKSPACE_STATE.siteConnection,
    ...(state.siteConnection && typeof state.siteConnection === 'object' ? state.siteConnection : {}),
  }
  return state
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value))
}
