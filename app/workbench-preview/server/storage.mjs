import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const DEFAULT_STATE = {
  schemaVersion: '0.1',
  runs: [],
}

export class JsonRunStore {
  constructor(runtimeDir) {
    this.runtimeDir = runtimeDir
    this.filePath = path.join(runtimeDir, 'agent-runs.json')
  }

  async readState() {
    await mkdir(this.runtimeDir, { recursive: true })
    try {
      const raw = await readFile(this.filePath, 'utf8')
      const parsed = JSON.parse(raw)
      return {
        schemaVersion: parsed.schemaVersion || DEFAULT_STATE.schemaVersion,
        runs: Array.isArray(parsed.runs) ? parsed.runs : [],
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error
      }
      await this.writeState(DEFAULT_STATE)
      return { ...DEFAULT_STATE, runs: [] }
    }
  }

  async writeState(state) {
    await mkdir(this.runtimeDir, { recursive: true })
    await writeFile(this.filePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8')
  }

  async listRuns() {
    const state = await this.readState()
    return state.runs
  }

  async getRun(runId) {
    const runs = await this.listRuns()
    return runs.find((run) => run.runId === runId) || null
  }

  async insertRun(run) {
    const state = await this.readState()
    state.runs.unshift(run)
    await this.writeState(state)
    return run
  }

  async updateRun(runId, updater) {
    const state = await this.readState()
    const index = state.runs.findIndex((run) => run.runId === runId)
    if (index === -1) return null
    const updated = updater(state.runs[index])
    state.runs[index] = updated
    await this.writeState(state)
    return updated
  }
}
