import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import { findPrompt, listPrompts } from './prompt-registry.mjs'
import { buildInputContext } from './mock-context.mjs'
import { buildManualPromptPackage, buildMockOutput } from './mock-executor.mjs'
import { JsonRunStore } from './storage.mjs'
import { JsonWorkspaceStore } from './workspace-store.mjs'
import { deriveWorkflow } from './workflow.mjs'
import {
  AgentWorkflowError,
  generateTaskPack,
  reviewIngestionRun as reviewWorkspaceIngestionRun,
  runArtifactIngestion,
  submitArtifact,
} from './agent-workflow-actions.mjs'
import {
  SiteReadingError,
  createLocalSiteReadSnapshot,
  saveProjectProfile,
  toWorkspaceView,
} from './site-reading-actions.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(__dirname, '..')
const port = Number(process.env.PORT || process.env.API_PORT || 4310)
const host = process.env.HOST || '127.0.0.1'
const runtimeDir = path.resolve(process.env.B2B_SEO_OS_RUNTIME_DIR || path.join(appRoot, 'runtime', 'ai-workbench'))
const store = new JsonRunStore(runtimeDir)
const workspaceStore = new JsonWorkspaceStore(runtimeDir)

export function createApiServer() {
  return http.createServer(async (request, response) => {
    try {
      await routeRequest(request, response)
    } catch (error) {
      if (error instanceof SiteReadingError) {
        sendError(response, error.statusCode, error.code, error.message)
        return
      }
      if (error instanceof AgentWorkflowError) {
        sendError(response, error.statusCode, error.code, error.message)
        return
      }
      sendJson(response, 500, {
        error: {
          code: 'internal_error',
          message: error.message || '服务器发生未知错误。',
        },
      })
    }
  })
}

async function routeRequest(request, response) {
  addCorsHeaders(response)
  if (request.method === 'OPTIONS') {
    response.writeHead(204)
    response.end()
    return
  }

  const url = new URL(request.url || '/', `http://${host}:${port}`)
  const pathname = url.pathname

  if (request.method === 'GET' && pathname === '/api/health') {
    sendJson(response, 200, {
      ok: true,
      service: 'b2b-seo-os-local-ai-backend',
      mode: 'manual_mock',
      aiApiEnabled: false,
      wordpressWritesEnabled: false,
      runtimeDir,
      promptCount: listPrompts().length,
    })
    return
  }

  if (request.method === 'GET' && pathname === '/api/workspace') {
    const state = await workspaceStore.readState()
    sendJson(response, 200, {
      workspace: toWorkspaceView(state),
      workflow: deriveWorkflow(state),
    })
    return
  }

  if (request.method === 'GET' && pathname === '/api/workflow') {
    const state = await workspaceStore.readState()
    sendJson(response, 200, {
      workflow: deriveWorkflow(state),
    })
    return
  }

  if (request.method === 'POST' && pathname === '/api/project') {
    const body = await readJsonBody(request)
    if (body.error) {
      sendError(response, 400, 'bad_json', body.error)
      return
    }
    const { state, result } = await workspaceStore.updateState((draft) => saveProjectProfile(draft, body.value))
    sendJson(response, 200, {
      project: result,
      workspace: toWorkspaceView(state),
      workflow: deriveWorkflow(state),
    })
    return
  }

  if (request.method === 'POST' && pathname === '/api/site-read-snapshots') {
    const { state, result } = await workspaceStore.updateState((draft) => createLocalSiteReadSnapshot(draft))
    sendJson(response, 201, {
      snapshot: result,
      workspace: toWorkspaceView(state),
      workflow: deriveWorkflow(state),
    })
    return
  }

  if (request.method === 'GET' && pathname === '/api/site-read-snapshots/latest') {
    const state = await workspaceStore.readState()
    const snapshot = state.siteReadSnapshots[0] || null
    if (!snapshot) {
      sendError(response, 404, 'snapshot_not_found', '还没有生成站点读取快照。')
      return
    }
    sendJson(response, 200, { snapshot })
    return
  }

  if (request.method === 'GET' && pathname === '/api/task-packs') {
    const state = await workspaceStore.readState()
    sendJson(response, 200, { taskPacks: state.taskPacks })
    return
  }

  if (request.method === 'POST' && pathname === '/api/task-packs/generate') {
    const body = await readJsonBody(request)
    if (body.error) {
      sendError(response, 400, 'bad_json', body.error)
      return
    }
    const { state, result } = await workspaceStore.updateState((draft) => generateTaskPack(draft, body.value))
    sendJson(response, 201, {
      taskPack: result,
      workspace: toWorkspaceView(state),
      workflow: deriveWorkflow(state),
    })
    return
  }

  const taskPackMatch = pathname.match(/^\/api\/task-packs\/([^/]+)$/)
  if (request.method === 'GET' && taskPackMatch) {
    const state = await workspaceStore.readState()
    const taskPack = state.taskPacks.find((item) => item.taskPackId === decodeURIComponent(taskPackMatch[1]))
    if (!taskPack) {
      sendError(response, 404, 'unknown_task_pack', '没有找到对应的任务包。')
      return
    }
    sendJson(response, 200, { taskPack })
    return
  }

  if (request.method === 'GET' && pathname === '/api/artifacts') {
    const state = await workspaceStore.readState()
    sendJson(response, 200, { artifacts: state.externalArtifacts })
    return
  }

  if (request.method === 'POST' && pathname === '/api/artifacts') {
    const body = await readJsonBody(request)
    if (body.error) {
      sendError(response, 400, 'bad_json', body.error)
      return
    }
    const { state, result } = await workspaceStore.updateState((draft) => submitArtifact(draft, body.value))
    sendJson(response, 201, {
      artifact: result,
      workspace: toWorkspaceView(state),
      workflow: deriveWorkflow(state),
    })
    return
  }

  const artifactMatch = pathname.match(/^\/api\/artifacts\/([^/]+)$/)
  if (request.method === 'GET' && artifactMatch) {
    const state = await workspaceStore.readState()
    const artifact = state.externalArtifacts.find((item) => item.artifactId === decodeURIComponent(artifactMatch[1]))
    if (!artifact) {
      sendError(response, 404, 'unknown_artifact', '没有找到对应的回填 Artifact。')
      return
    }
    sendJson(response, 200, { artifact })
    return
  }

  if (request.method === 'GET' && pathname === '/api/ingestion-runs') {
    const state = await workspaceStore.readState()
    sendJson(response, 200, { ingestionRuns: state.ingestionRuns })
    return
  }

  if (request.method === 'POST' && pathname === '/api/ingestion-runs') {
    const body = await readJsonBody(request)
    if (body.error) {
      sendError(response, 400, 'bad_json', body.error)
      return
    }
    const { state, result } = await workspaceStore.updateState((draft) => runArtifactIngestion(draft, body.value))
    sendJson(response, 201, {
      ingestionRun: result,
      workspace: toWorkspaceView(state),
      workflow: deriveWorkflow(state),
    })
    return
  }

  const ingestionReviewMatch = pathname.match(/^\/api\/ingestion-runs\/([^/]+)\/review$/)
  if (request.method === 'POST' && ingestionReviewMatch) {
    const body = await readJsonBody(request)
    if (body.error) {
      sendError(response, 400, 'bad_json', body.error)
      return
    }
    const { state, result } = await workspaceStore.updateState((draft) => reviewWorkspaceIngestionRun(draft, decodeURIComponent(ingestionReviewMatch[1]), body.value))
    sendJson(response, 200, {
      ingestionRun: result,
      workspace: toWorkspaceView(state),
      workflow: deriveWorkflow(state),
    })
    return
  }

  const ingestionMatch = pathname.match(/^\/api\/ingestion-runs\/([^/]+)$/)
  if (request.method === 'GET' && ingestionMatch) {
    const state = await workspaceStore.readState()
    const ingestionRun = state.ingestionRuns.find((item) => item.ingestionRunId === decodeURIComponent(ingestionMatch[1]))
    if (!ingestionRun) {
      sendError(response, 404, 'unknown_ingestion_run', '没有找到对应的回填解析记录。')
      return
    }
    sendJson(response, 200, { ingestionRun })
    return
  }

  if (request.method === 'GET' && pathname === '/api/prompts') {
    sendJson(response, 200, {
      prompts: listPrompts().map(toPromptListItem),
    })
    return
  }

  const promptMatch = pathname.match(/^\/api\/prompts\/([^/]+)$/)
  if (request.method === 'GET' && promptMatch) {
    const prompt = findPrompt(decodeURIComponent(promptMatch[1]))
    if (!prompt) {
      sendError(response, 404, 'unknown_prompt', '没有找到对应的提示词。')
      return
    }
    sendJson(response, 200, { prompt })
    return
  }

  if (request.method === 'GET' && pathname === '/api/agent-runs') {
    const runs = await store.listRuns()
    sendJson(response, 200, { runs: runs.map(toRunListItem) })
    return
  }

  if (request.method === 'POST' && pathname === '/api/agent-runs') {
    const body = await readJsonBody(request)
    if (body.error) {
      sendError(response, 400, 'bad_json', body.error)
      return
    }
    await createAgentRun(response, body.value)
    return
  }

  const runReviewMatch = pathname.match(/^\/api\/agent-runs\/([^/]+)\/review$/)
  if (request.method === 'POST' && runReviewMatch) {
    const body = await readJsonBody(request)
    if (body.error) {
      sendError(response, 400, 'bad_json', body.error)
      return
    }
    await reviewAgentRun(response, decodeURIComponent(runReviewMatch[1]), body.value)
    return
  }

  const runCancelMatch = pathname.match(/^\/api\/agent-runs\/([^/]+)\/cancel$/)
  if (request.method === 'POST' && runCancelMatch) {
    await cancelAgentRun(response, decodeURIComponent(runCancelMatch[1]))
    return
  }

  const runMatch = pathname.match(/^\/api\/agent-runs\/([^/]+)$/)
  if (request.method === 'GET' && runMatch) {
    const run = await store.getRun(decodeURIComponent(runMatch[1]))
    if (!run) {
      sendError(response, 404, 'unknown_run', '没有找到对应的执行记录。')
      return
    }
    sendJson(response, 200, { run })
    return
  }

  sendError(response, 404, 'not_found', '没有找到对应的 API 路由。')
}

async function createAgentRun(response, body) {
  const promptId = typeof body.promptId === 'string' ? body.promptId : ''
  const prompt = findPrompt(promptId)
  if (!prompt) {
    sendError(response, 404, 'unknown_prompt', '没有找到对应的提示词。')
    return
  }

  const now = new Date().toISOString()
  const runId = `run_${now.replace(/\D/g, '').slice(0, 14)}_${randomUUID().slice(0, 8)}`
  const inputEnvelope = {
    runId,
    promptId: prompt.promptId,
    projectId: 'proj_demo',
    siteId: 'site_demo',
    inputContext: buildInputContext(body.contextPreset || 'project_sample', prompt.promptId),
    userInstruction: typeof body.userInstruction === 'string' ? body.userInstruction : '',
    safetyBoundary: {
      readOnly: true,
      noAutoPublish: true,
      commercialFactsNeedHumanConfirmation: true,
      canWriteWordPress: false,
      canCallAiApi: false,
    },
    createdAt: now,
  }

  const manualPromptPackage = buildManualPromptPackage(prompt, inputEnvelope)
  const outputEnvelope = buildMockOutput(prompt, inputEnvelope)
  const run = {
    runId,
    taskType: prompt.category,
    promptId: prompt.promptId,
    promptName: prompt.name,
    promptVersion: prompt.version,
    model: 'manual_mock',
    contextPreset: body.contextPreset || 'project_sample',
    inputSources: Object.keys(inputEnvelope.inputContext),
    inputEnvelope,
    manualPromptPackage,
    outputEnvelope,
    status: 'waiting_for_human',
    humanReviewRequired: true,
    humanReview: {
      decision: 'pending',
      reviewer: '',
      notes: '',
      reviewedAt: null,
    },
    createdAt: now,
    updatedAt: now,
  }

  await store.insertRun(run)
  sendJson(response, 201, { run })
}

async function reviewAgentRun(response, runId, body) {
  const decision = body.decision
  if (!['approved', 'rejected', 'revision_needed'].includes(decision)) {
    sendError(response, 400, 'invalid_review_decision', '审核结果只能是批准、驳回或需要修订。')
    return
  }

  const updated = await store.updateRun(runId, (run) => {
    const now = new Date().toISOString()
    return {
      ...run,
      status: decision === 'approved' ? 'done' : decision === 'rejected' ? 'failed' : 'waiting_for_human',
      humanReview: {
        decision,
        reviewer: typeof body.reviewer === 'string' ? body.reviewer : 'operator',
        notes: typeof body.notes === 'string' ? body.notes : '',
        reviewedAt: now,
      },
      updatedAt: now,
    }
  })

  if (!updated) {
    sendError(response, 404, 'unknown_run', '没有找到对应的执行记录。')
    return
  }
  sendJson(response, 200, { run: updated })
}

async function cancelAgentRun(response, runId) {
  const updated = await store.updateRun(runId, (run) => {
    const now = new Date().toISOString()
    return {
      ...run,
      status: 'cancelled',
      updatedAt: now,
    }
  })

  if (!updated) {
    sendError(response, 404, 'unknown_run', '没有找到对应的执行记录。')
    return
  }
  sendJson(response, 200, { run: updated })
}

async function readJsonBody(request) {
  const chunks = []
  for await (const chunk of request) {
    chunks.push(chunk)
  }
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw.trim()) return { value: {} }
  try {
    return { value: JSON.parse(raw) }
  } catch {
    return { error: '请求体必须是合法 JSON。' }
  }
}

function toPromptListItem(prompt) {
  return {
    promptId: prompt.promptId,
    name: prompt.name,
    category: prompt.category,
    version: prompt.version,
    purpose: prompt.purpose,
    inputFields: prompt.inputFields,
    outputFields: prompt.outputFields,
    requiresHumanReview: prompt.requiresHumanReview,
    canCreateTasks: prompt.canCreateTasks,
    canWriteWordPress: prompt.canWriteWordPress,
    status: prompt.status,
  }
}

function toRunListItem(run) {
  return {
    runId: run.runId,
    promptId: run.promptId,
    promptName: run.promptName,
    promptVersion: run.promptVersion,
    taskType: run.taskType,
    model: run.model,
    status: run.status,
    contextPreset: run.contextPreset,
    summaryMarkdown: run.outputEnvelope?.summaryMarkdown || '',
    humanReviewRequired: run.humanReviewRequired,
    humanReview: run.humanReview,
    createdAt: run.createdAt,
    updatedAt: run.updatedAt,
  }
}

function addCorsHeaders(response) {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function sendError(response, statusCode, code, message) {
  sendJson(response, statusCode, {
    error: {
      code,
      message,
    },
  })
}

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  response.end(JSON.stringify(data))
}

if (path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] || '')) {
  const server = createApiServer()
  server.listen(port, host, () => {
    console.log(`B2B SEO OS local AI backend ready at http://${host}:${port}`)
  })
}
