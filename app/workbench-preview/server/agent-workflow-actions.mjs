import { randomUUID } from 'node:crypto'
import { applyApprovedSiteReadSnapshot } from './site-reading-actions.mjs'

const SITE_READ_STEP = 'site_connection_reading'
const SITE_READ_TASK = 'site_read'
const SITE_READ_SCHEMA = 'site_read_snapshot_v1'

export class AgentWorkflowError extends Error {
  constructor(statusCode, code, message) {
    super(message)
    this.statusCode = statusCode
    this.code = code
  }
}

export function generateTaskPack(state, body) {
  if (!state.project?.projectId) {
    throw new AgentWorkflowError(409, 'prerequisite_missing', '请先完成项目档案，再生成站点读取任务包。')
  }

  const workflowStepId = cleanText(body.workflowStepId)
  const taskType = cleanText(body.taskType)
  if (workflowStepId !== SITE_READ_STEP || taskType !== SITE_READ_TASK) {
    throw new AgentWorkflowError(400, 'unsupported_task_pack', '第一阶段只支持生成站点读取任务包。')
  }

  const now = new Date().toISOString()
  const taskPack = {
    taskPackId: createId('task_pack'),
    workflowStepId,
    taskType,
    targetAgent: cleanText(body.targetAgent) || 'chatgpt',
    sourceInputs: {
      userInput: cleanText(body.userInput),
    },
    projectContextSnapshot: buildProjectContextSnapshot(state),
    promptMarkdown: buildSiteReadPrompt(state, body),
    expectedArtifactSchema: {
      schemaName: SITE_READ_SCHEMA,
      format: 'json',
      requiredFields: ['schemaVersion', 'domain', 'pages', 'menus', 'forms', 'seoFields', 'anomalies', 'humanReviewItems'],
    },
    forbiddenActions: [
      '禁止写入 WordPress',
      '禁止要求或保存 WordPress 密码、API Key、服务器登录信息',
      '禁止上传媒体、修改页面、发布内容',
      '禁止把未确认商业事实写成确定结论',
    ],
    humanChecklist: [
      '确认读取的网站域名与项目档案一致。',
      '确认输出中没有密码、Token 或后台登录地址。',
      '确认至少包含首页、产品页、关于页、联系页或资源页中的一类页面。',
      '确认异常提醒可以被非技术人员理解。',
    ],
    status: 'ready_to_copy',
    createdAt: now,
  }

  state.taskPacks.unshift(taskPack)
  addWorkspaceArtifact(state, {
    type: 'agent_task_pack',
    title: '站点读取 AgentTaskPack',
    stepLabel: '站点接入与读取',
    sourceId: taskPack.taskPackId,
    route: '/project-center',
  })
  return taskPack
}

export function submitArtifact(state, body) {
  const taskPack = findTaskPack(state, body.taskPackId)
  const rawContent = cleanText(body.rawContent)
  if (!rawContent) {
    throw new AgentWorkflowError(400, 'invalid_artifact', '回填内容不能为空。')
  }

  const format = normalizeArtifactFormat(body.format)
  if (format === 'json') {
    parseJsonArtifact(rawContent)
  }

  const artifact = {
    artifactId: createId('artifact_return'),
    taskPackId: taskPack.taskPackId,
    workflowStepId: taskPack.workflowStepId,
    format,
    rawContent,
    sourceAgent: cleanText(body.sourceAgent) || taskPack.targetAgent,
    status: 'submitted',
    submittedAt: new Date().toISOString(),
  }

  state.externalArtifacts.unshift(artifact)
  taskPack.status = 'artifact_returned'
  addWorkspaceArtifact(state, {
    type: 'external_artifact',
    title: '外部智能体回填 Artifact',
    stepLabel: '站点接入与读取',
    sourceId: artifact.artifactId,
    route: '/project-center',
  })
  return artifact
}

export function runArtifactIngestion(state, body) {
  const artifact = findExternalArtifact(state, body.artifactId)
  const taskPack = findTaskPack(state, artifact.taskPackId)
  if (artifact.workflowStepId !== SITE_READ_STEP || taskPack.taskType !== SITE_READ_TASK) {
    throw new AgentWorkflowError(400, 'unsupported_ingestion', '第一阶段只支持解析站点读取 Artifact。')
  }

  const parsed = parseJsonArtifact(artifact.rawContent)
  const validation = validateSiteReadArtifact(parsed)
  const siteReadSnapshot = buildSiteReadSnapshotFromArtifact(state, parsed, artifact)
  const now = new Date().toISOString()
  const ingestionRun = {
    ingestionRunId: createId('ingestion'),
    artifactId: artifact.artifactId,
    taskPackId: taskPack.taskPackId,
    workflowStepId: artifact.workflowStepId,
    parserPromptId: 'site-read-artifact-parser-v1',
    status: 'waiting_review',
    parsedObjects: {
      siteReadSnapshot,
    },
    validationResult: validation,
    humanReviewItems: buildHumanReviewItems(parsed, validation),
    canAdvance: validation.valid,
    writePlan: validation.valid
      ? [{ target: 'siteReadSnapshots', action: 'upsert_latest', summary: '审核通过后写入最新站点读取快照，并解锁网站现状审计。' }]
      : [],
    reviewDecision: null,
    createdAt: now,
    updatedAt: now,
  }

  state.ingestionRuns.unshift(ingestionRun)
  artifact.status = validation.valid ? 'parsed' : 'parse_failed'
  taskPack.status = 'ingested'
  addWorkspaceArtifact(state, {
    type: 'ingestion_run',
    title: '站点读取 Artifact 解析记录',
    stepLabel: '站点接入与读取',
    sourceId: ingestionRun.ingestionRunId,
    route: '/project-center',
  })
  return ingestionRun
}

export function reviewIngestionRun(state, ingestionRunId, body) {
  const ingestionRun = state.ingestionRuns.find((item) => item.ingestionRunId === ingestionRunId)
  if (!ingestionRun) {
    throw new AgentWorkflowError(404, 'unknown_ingestion_run', '没有找到对应的回填解析记录。')
  }

  const decision = cleanText(body.decision)
  if (!['approved', 'rejected'].includes(decision)) {
    throw new AgentWorkflowError(400, 'invalid_review_decision', '审核结果必须是 approved 或 rejected。')
  }

  const now = new Date().toISOString()
  ingestionRun.reviewDecision = {
    decision,
    reviewer: cleanText(body.reviewer) || 'operator',
    notes: cleanText(body.notes),
    reviewedAt: now,
  }
  ingestionRun.updatedAt = now

  const artifact = findExternalArtifact(state, ingestionRun.artifactId)
  if (decision === 'rejected') {
    ingestionRun.status = 'rejected'
    artifact.status = 'rejected'
    return ingestionRun
  }

  if (!ingestionRun.canAdvance || !ingestionRun.validationResult.valid) {
    throw new AgentWorkflowError(409, 'cannot_advance', '解析结果仍有缺失项，不能批准进入下一阶段。')
  }

  applyApprovedSiteReadSnapshot(
    state,
    ingestionRun.parsedObjects.siteReadSnapshot,
    ingestionRun.ingestionRunId,
  )
  ingestionRun.status = 'approved'
  artifact.status = 'reviewed'
  return ingestionRun
}

function buildProjectContextSnapshot(state) {
  return {
    projectId: state.project.projectId,
    projectName: state.project.projectName,
    domain: state.project.domain,
    company: state.project.company,
    industry: state.project.industry,
    targetMarkets: state.project.targetMarkets,
    coreProducts: state.project.coreProducts,
    targetCustomers: state.project.targetCustomers,
    primaryConversionGoal: state.project.primaryConversionGoal,
    safetyBoundary: state.siteConnection,
  }
}

function buildSiteReadPrompt(state, body) {
  const project = state.project
  const extraInstruction = cleanText(body.userInput) || '请读取网站公开前台页面，并输出结构化站点快照。'
  return `# 站点读取 AgentTaskPack

你是外部执行层智能体。请基于下面项目档案读取网站公开页面，并返回固定格式 Artifact。

## 项目档案
- 项目名：${project.projectName}
- 网站域名：${project.domain}
- 公司名：${project.company}
- 行业：${project.industry}
- 目标市场：${project.targetMarkets.join('、') || '待确认'}
- 核心产品：${project.coreProducts.join('、') || '待确认'}
- 目标客户：${project.targetCustomers.join('、') || '待确认'}
- 转化目标：${project.primaryConversionGoal}

## 执行目标
${extraInstruction}

请优先读取：首页、产品/服务页面、能力页面、关于我们、联系/RFQ、资源文章、菜单、表单、SEO 字段和明显异常。

## 禁止事项
- 禁止写入 WordPress。
- 禁止修改、发布、删除、上传任何内容。
- 禁止要求用户提供 WordPress 密码、API Key、服务器账号或后台登录信息。
- 禁止把未确认商业事实写成确定结论。

## 必须返回的 JSON
只返回一个 JSON 对象，schemaVersion 必须是 \`${SITE_READ_SCHEMA}\`。

\`\`\`json
{
  "schemaVersion": "site_read_snapshot_v1",
  "domain": "${project.domain}",
  "pages": [
    {
      "url": "/",
      "title": "页面标题",
      "pageType": "首页 / 产品线页面 / 关于我们 / 联系/RFQ / 资源文章",
      "type": "page",
      "h1": "页面 H1",
      "metaDescription": "Meta Description，如果缺失则为空字符串",
      "wordCount": 800,
      "formsDetected": ["RFQ Form"]
    }
  ],
  "menus": ["Main Menu"],
  "forms": ["RFQ Form"],
  "seoFields": ["SEO Title", "Meta Description", "H1"],
  "anomalies": ["中文异常提醒"],
  "humanReviewItems": ["需要人工确认的事项"]
}
\`\`\`

## 人工检查清单
- 是否读取了正确域名。
- 是否至少有 1 个页面。
- 是否保留缺失字段说明。
- 是否没有包含任何敏感凭据。
`
}

function buildSiteReadSnapshotFromArtifact(state, parsed, artifact) {
  const now = new Date().toISOString()
  const pages = Array.isArray(parsed.pages) ? parsed.pages.map((page, index) => normalizePage(page, index, now)) : []
  return {
    snapshotId: createId('snapshot'),
    projectId: state.project.projectId,
    domain: cleanText(parsed.domain) || state.project.domain,
    mode: 'external_agent_artifact',
    snapshotAt: now,
    pageCount: pages.filter((page) => page.type === 'page').length,
    postCount: pages.filter((page) => page.type === 'post').length,
    productCount: pages.filter((page) => page.type === 'product').length,
    mediaCount: Number(parsed.mediaCount || 0),
    menuCount: listLength(parsed.menus),
    formCount: listLength(parsed.forms),
    seoFieldCount: listLength(parsed.seoFields),
    detectedPageTypes: uniqueList(pages.map((page) => page.pageType)),
    detectedForms: cleanList(parsed.forms),
    trustPages: cleanList(parsed.trustPages),
    seoFields: cleanList(parsed.seoFields),
    anomalies: cleanList(parsed.anomalies),
    pages,
    humanReviewItems: buildHumanReviewItems(parsed, validateSiteReadArtifact(parsed)),
    sourceArtifactId: artifact.artifactId,
  }
}

function normalizePage(input, index, now) {
  const type = ['page', 'post', 'product'].includes(input.type) ? input.type : 'page'
  const title = cleanText(input.title) || cleanText(input.h1) || `未命名页面 ${index + 1}`
  const url = normalizeUrl(input.url)
  return {
    pageId: cleanText(input.pageId) || `external-page-${index + 1}`,
    wpId: Number(input.wpId || index + 1),
    type,
    status: 'publish',
    url,
    slug: url === '/' ? 'home' : url.replace(/^\/|\/$/g, '') || `page-${index + 1}`,
    title,
    seoTitle: cleanText(input.seoTitle) || title,
    metaDescription: cleanText(input.metaDescription),
    h1: cleanText(input.h1) || title,
    pageType: cleanText(input.pageType) || '待确认页面类型',
    wordCount: Number(input.wordCount || 0),
    primaryKeyword: null,
    suggestedPrimaryKeyword: null,
    auditIssueCount: 0,
    repairTaskCount: 0,
    internalLinkStatus: '待审计',
    modifiedAt: now,
    primaryCta: cleanText(input.primaryCta) || '',
    formsDetected: cleanList(input.formsDetected),
    headings: Array.isArray(input.headings)
      ? input.headings.map((heading) => ({ level: Number(heading.level || 2), text: cleanText(heading.text) })).filter((heading) => heading.text)
      : [{ level: 1, text: cleanText(input.h1) || title }],
  }
}

function validateSiteReadArtifact(parsed) {
  const missingFields = []
  const warnings = []
  if (parsed.schemaVersion !== SITE_READ_SCHEMA) missingFields.push('schemaVersion')
  if (!cleanText(parsed.domain)) warnings.push('未提供 domain，系统将使用项目档案中的域名。')
  if (!Array.isArray(parsed.pages) || parsed.pages.length === 0) {
    missingFields.push('pages')
  } else {
    parsed.pages.forEach((page, index) => {
      if (!cleanText(page.url)) missingFields.push(`pages[${index}].url`)
      if (!cleanText(page.title)) missingFields.push(`pages[${index}].title`)
      if (!cleanText(page.pageType)) missingFields.push(`pages[${index}].pageType`)
      if (!cleanText(page.metaDescription)) warnings.push(`pages[${index}] 缺少 Meta Description。`)
    })
  }
  if (!Array.isArray(parsed.seoFields) || parsed.seoFields.length === 0) warnings.push('未提供 SEO 字段清单。')
  if (!Array.isArray(parsed.forms) || parsed.forms.length === 0) warnings.push('未提供表单清单。')
  const valid = missingFields.length === 0
  return {
    valid,
    qualityScore: valid ? Math.max(70, 100 - warnings.length * 5) : 30,
    missingFields,
    warnings,
  }
}

function buildHumanReviewItems(parsed, validation) {
  return [
    ...cleanList(parsed.humanReviewItems),
    ...validation.missingFields.map((field) => `缺少必要字段：${field}`),
    ...validation.warnings,
  ]
}

function findTaskPack(state, taskPackId) {
  const id = cleanText(taskPackId)
  const taskPack = state.taskPacks.find((item) => item.taskPackId === id)
  if (!taskPack) {
    throw new AgentWorkflowError(404, 'unknown_task_pack', '没有找到对应的任务包。')
  }
  return taskPack
}

function findExternalArtifact(state, artifactId) {
  const id = cleanText(artifactId)
  const artifact = state.externalArtifacts.find((item) => item.artifactId === id)
  if (!artifact) {
    throw new AgentWorkflowError(404, 'unknown_artifact', '没有找到对应的回填 Artifact。')
  }
  return artifact
}

function parseJsonArtifact(rawContent) {
  try {
    return JSON.parse(rawContent)
  } catch {
    throw new AgentWorkflowError(400, 'invalid_artifact', '回填内容不是有效 JSON，请检查外部智能体输出。')
  }
}

function normalizeArtifactFormat(value) {
  const format = cleanText(value) || 'mixed_text'
  if (['json', 'markdown', 'csv', 'mixed_text'].includes(format)) return format
  throw new AgentWorkflowError(400, 'invalid_artifact_format', 'Artifact 格式必须是 json、markdown、csv 或 mixed_text。')
}

function addWorkspaceArtifact(state, input) {
  if (state.artifacts.some((artifact) => artifact.type === input.type && artifact.sourceId === input.sourceId)) return
  state.artifacts.unshift({
    artifactId: createId('artifact'),
    createdAt: new Date().toISOString(),
    ...input,
  })
}

function cleanList(value) {
  const items = Array.isArray(value) ? value : String(value || '').split(/[,\n，、]/)
  return items.map((item) => cleanText(item)).filter(Boolean)
}

function uniqueList(items) {
  return [...new Set(items.map((item) => cleanText(item)).filter(Boolean))]
}

function listLength(value) {
  return Array.isArray(value) ? value.length : 0
}

function normalizeUrl(value) {
  const url = cleanText(value)
  if (!url) return '/'
  if (/^https?:\/\//i.test(url)) {
    try {
      return new URL(url).pathname || '/'
    } catch {
      return url
    }
  }
  return url.startsWith('/') ? url : `/${url}`
}

function cleanText(value) {
  return String(value || '').trim()
}

function createId(prefix) {
  return `${prefix}_${randomUUID().slice(0, 8)}`
}
