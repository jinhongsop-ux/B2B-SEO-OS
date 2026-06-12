import { randomUUID } from 'node:crypto'
import { applyApprovedSiteReadSnapshot } from './site-reading-actions.mjs'

const SITE_READ_STEP = 'site_connection_reading'
const SITE_READ_TASK = 'site_read'
const SITE_READ_SCHEMA = 'site_read_snapshot_v1'

const AUDIT_STEP = 'audit'
const AUDIT_TASK = 'site_audit'
const AUDIT_SCHEMA = 'site_audit_report_v1'

const B2B_CONTEXT_SCHEMA = 'b2b_context_evidence_v1'

export class AgentWorkflowError extends Error {
  constructor(statusCode, code, message) {
    super(message)
    this.statusCode = statusCode
    this.code = code
  }
}

export function generateTaskPack(state, body) {
  if (!state.project?.projectId) {
    throw new AgentWorkflowError(409, 'prerequisite_missing', '请先完成项目档案，再生成任务包。')
  }

  const workflowStepId = cleanText(body.workflowStepId)
  const taskType = cleanText(body.taskType)

  if (workflowStepId === SITE_READ_STEP && taskType === SITE_READ_TASK) {
    return generateSiteReadTaskPack(state, body)
  }
  if (workflowStepId === AUDIT_STEP && taskType === AUDIT_TASK) {
    return generateAuditTaskPack(state, body)
  }

  throw new AgentWorkflowError(400, 'unsupported_task_pack', '当前阶段不支持此任务包类型。')
}

function generateSiteReadTaskPack(state, body) {
  const now = new Date().toISOString()
  const taskPack = {
    taskPackId: createId('task_pack'),
    workflowStepId: SITE_READ_STEP,
    taskType: SITE_READ_TASK,
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

function generateAuditTaskPack(state, body) {
  const latestSnapshot = state.siteReadSnapshots[0]
  if (!latestSnapshot?.pages?.length) {
    throw new AgentWorkflowError(409, 'prerequisite_missing', '请先完成站点读取，再生成审计任务包。')
  }

  const now = new Date().toISOString()
  const taskPack = {
    taskPackId: createId('task_pack'),
    workflowStepId: AUDIT_STEP,
    taskType: AUDIT_TASK,
    targetAgent: cleanText(body.targetAgent) || 'chatgpt',
    sourceInputs: {
      userInput: cleanText(body.userInput),
      snapshotId: latestSnapshot.snapshotId,
      pageCount: latestSnapshot.pageCount,
    },
    projectContextSnapshot: buildProjectContextSnapshot(state),
    promptMarkdown: buildAuditPrompt(state, latestSnapshot, body),
    expectedArtifactSchema: {
      schemaName: AUDIT_SCHEMA,
      format: 'json',
      requiredFields: ['schemaVersion', 'summary', 'moduleReports', 'findings'],
    },
    forbiddenActions: [
      '禁止写入 WordPress',
      '禁止评分（不输出 0-10 分）',
      '禁止输出 P0/P1/P2/P3，priority 只用 blocking / normal',
      '禁止直接生成任务池',
      '禁止把未确认商业事实写成确定结论',
    ],
    humanChecklist: [
      '确认审计基于正确的站点读取快照。',
      '确认 blocking 级问题确实阻塞后续执行。',
      '确认建议动作属于站内 SEO 范围。',
      '确认不包含虚构证据或未确认声明。',
    ],
    status: 'ready_to_copy',
    createdAt: now,
  }

  state.taskPacks.unshift(taskPack)
  addWorkspaceArtifact(state, {
    type: 'agent_task_pack',
    title: '网站审计 AgentTaskPack',
    stepLabel: '网站现状审计',
    sourceId: taskPack.taskPackId,
    route: '/audit',
  })
  return taskPack
}

function buildAuditPrompt(state, snapshot, body) {
  const project = state.project
  const extraInstruction = cleanText(body.userInput) || '请基于站点读取快照，对当前网站做全面 B2B SEO 审计。'
  const pageSummary = snapshot.pages.slice(0, 20).map((p) => `- ${p.url} | ${p.pageType} | ${p.title}`).join('\n')

  return `# 网站审计 AgentTaskPack

你是 B2B 独立站 SEO 审计专家。基于以下站点读取快照，对网站做结构化诊断。

## 项目档案
- 项目名：${project.projectName}
- 域名：${project.domain}
- 行业：${project.industry}
- 目标市场：${project.targetMarkets.join('、')}
- 转化目标：${project.primaryConversionGoal}

## 站点快照摘要
- 总页面数：${snapshot.pageCount}
- 页面类型：${snapshot.detectedPageTypes.join('、') || '待确认'}
- 表单：${snapshot.detectedForms.join('、') || '未检测到'}
- 异常：${snapshot.anomalies.join('、') || '无'}

## 已读取页面（前 20 个）
${pageSummary || '（无页面数据）'}

## 执行目标
${extraInstruction}

## 审计维度（10 个）
1. 网站结构 — 导航、URL、层级、内链
2. 首页表达 — 价值主张、转化入口
3. 产品/服务页面 — 参数、规格、CTA
4. 转化路径 — RFQ、Contact、WhatsApp
5. 信任内容 — About、Factory、QC、证书
6. 技术 SEO — meta、canonical、robots
7. 性能与移动端 — 速度、响应式
8. 表单与询盘 — 字段、可用性
9. CMS/API 安全 — 权限暴露
10. 追踪配置 — GTM/GA4/GSC

## 禁止事项
- 禁止写入 WordPress。
- 禁止评分（不输出 0-10 分）。
- 禁止用 P0/P1/P2/P3，priority 只用 blocking / normal。
- 禁止直接生成任务池。
- 禁止虚构证据。

## 必须返回的 JSON
只返回一个 JSON 对象，schemaVersion 必须是 \`${AUDIT_SCHEMA}\`。

\`\`\`json
{
  "schemaVersion": "${AUDIT_SCHEMA}",
  "summary": "150 字以内总评",
  "moduleReports": [
    { "module": "site_structure", "status": "has_issues", "findings": ["问题1"] }
  ],
  "findings": [
    {
      "id": "finding-001",
      "category": "site_structure",
      "priority": "blocking",
      "problem": "问题描述",
      "affectedUrls": ["/page-url"],
      "evidence": [{ "url": "/page-url", "note": "证据说明" }],
      "impact": "对采购信任/SEO/转化的影响",
      "recommendedAction": "修复建议",
      "requiresDeveloper": false
    }
  ]
}
\`\`\`

## 人工检查清单
- blocking 问题是否确实阻塞后续执行。
- 每个 finding 是否有 URL、证据和建议动作。
- 信任相关问题是否标注了缺失证据。
- 不包含虚构事实。
`
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

  const stepLabel = taskPack.workflowStepId === AUDIT_STEP ? '网站现状审计' : '站点接入与读取'
  const route = taskPack.workflowStepId === AUDIT_STEP ? '/audit' : '/project-center'

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
    title: taskPack.workflowStepId === AUDIT_STEP ? '审计 Artifact' : '外部智能体回填 Artifact',
    stepLabel,
    sourceId: artifact.artifactId,
    route,
  })
  return artifact
}

export function runArtifactIngestion(state, body) {
  const artifact = findExternalArtifact(state, body.artifactId)
  const taskPack = findTaskPack(state, artifact.taskPackId)

  if (artifact.workflowStepId === SITE_READ_STEP && taskPack.taskType === SITE_READ_TASK) {
    return runSiteReadIngestion(state, artifact, taskPack)
  }
  if (artifact.workflowStepId === AUDIT_STEP && taskPack.taskType === AUDIT_TASK) {
    return runAuditIngestion(state, artifact, taskPack)
  }

  throw new AgentWorkflowError(400, 'unsupported_ingestion', '当前阶段不支持此 Artifact 类型的解析。')
}

export function reviewIngestionRun(state, ingestionRunId, body) {
  const ingestionRun = state.ingestionRuns.find((item) => item.ingestionRunId === ingestionRunId)
  if (!ingestionRun) {
    throw new AgentWorkflowError(404, 'unknown_ingestion_run', '没有找到对应的回填解析记录。')
  }

  if (ingestionRun.status === 'done' && ingestionRun.reviewDecision?.decision === 'auto_approved') {
    throw new AgentWorkflowError(409, 'already_auto_approved', '此 Artifact 已自动审核通过，无需重复操作。')
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

function runSiteReadIngestion(state, artifact, taskPack) {
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

function runAuditIngestion(state, artifact, taskPack) {
  const parsed = parseJsonArtifact(artifact.rawContent)
  const validation = validateAuditArtifact(parsed)
  const auditReport = buildAuditReportFromArtifact(state, parsed, artifact)
  const now = new Date().toISOString()

  const auditRun = {
    auditRunId: createId('audit_run'),
    artifactId: artifact.artifactId,
    taskPackId: taskPack.taskPackId,
    snapshotId: state.siteReadSnapshots[0]?.snapshotId,
    status: validation.valid ? 'done' : 'parse_failed',
    reportSummary: auditReport.summary,
    moduleReportCount: auditReport.moduleReports.length,
    findingCount: auditReport.findings.length,
    blockingCount: auditReport.findings.filter((f) => f.priority === 'blocking').length,
    createdAt: now,
  }

  const ingestionRun = {
    ingestionRunId: createId('ingestion'),
    artifactId: artifact.artifactId,
    taskPackId: taskPack.taskPackId,
    workflowStepId: artifact.workflowStepId,
    parserPromptId: 'site-audit-artifact-parser-v1',
    status: validation.valid ? 'done' : 'parse_failed',
    parsedObjects: validation.valid
      ? { auditReport }
      : { auditReport: null },
    validationResult: validation,
    humanReviewItems: [],
    canAdvance: validation.valid,
    writePlan: validation.valid
      ? [{ target: 'auditRuns', action: 'append', summary: '写入审计执行记录。' },
        { target: 'auditFindings', action: 'append_all', summary: `写入 ${auditReport.findings.length} 条审计发现。` }]
      : [],
    reviewDecision: validation.valid
      ? { decision: 'auto_approved', reviewer: 'system', notes: 'S2 审计 Artifact JSON 格式校验通过，自动写入。', reviewedAt: now }
      : null,
    createdAt: now,
    updatedAt: now,
  }

  if (validation.valid) {
    state.auditRuns.unshift(auditRun)
    state.auditFindings.push(...auditReport.findings.map((finding) => ({
      ...finding,
      findingId: finding.id || createId('finding'),
      auditRunId: auditRun.auditRunId,
      status: finding.priority === 'blocking' ? 'blocking' : 'open',
      createdAt: now,
    })))
  }

  state.ingestionRuns.unshift(ingestionRun)
  artifact.status = validation.valid ? 'reviewed' : 'parse_failed'
  taskPack.status = 'ingested'
  addWorkspaceArtifact(state, {
    type: 'ingestion_run',
    title: '审计 Artifact 解析记录',
    stepLabel: '网站现状审计',
    sourceId: ingestionRun.ingestionRunId,
    route: '/audit',
  })
  return ingestionRun
}

function validateAuditArtifact(parsed) {
  const missingFields = []
  const warnings = []

  if (parsed.schemaVersion !== AUDIT_SCHEMA) missingFields.push('schemaVersion')
  if (!cleanText(parsed.summary)) missingFields.push('summary')
  if (!Array.isArray(parsed.moduleReports) || parsed.moduleReports.length === 0) {
    missingFields.push('moduleReports')
  } else {
    parsed.moduleReports.forEach((report, index) => {
      if (!cleanText(report.module)) missingFields.push(`moduleReports[${index}].module`)
    })
  }
  if (!Array.isArray(parsed.findings)) {
    missingFields.push('findings')
  } else {
    parsed.findings.forEach((finding, index) => {
      if (!cleanText(finding.id)) warnings.push(`findings[${index}] 缺少 id。`)
      if (!cleanText(finding.category)) missingFields.push(`findings[${index}].category`)
      if (!['blocking', 'normal'].includes(finding.priority)) missingFields.push(`findings[${index}].priority`)
      if (!cleanText(finding.problem)) missingFields.push(`findings[${index}].problem`)
      if (!cleanText(finding.recommendedAction)) missingFields.push(`findings[${index}].recommendedAction`)
      if (!finding.affectedUrls?.length && !finding.evidence?.length) {
        warnings.push(`findings[${index}] 缺少 affectedUrls 和 evidence，需要补充证据。`)
      }
    })
  }

  const valid = missingFields.length === 0
  return {
    valid,
    qualityScore: valid ? Math.max(60, 100 - warnings.length * 5) : 30,
    missingFields,
    warnings,
  }
}

function buildAuditReportFromArtifact(state, parsed, artifact) {
  const now = new Date().toISOString()
  return {
    reportId: createId('audit_report'),
    schemaVersion: parsed.schemaVersion,
    projectId: state.project.projectId,
    summary: cleanText(parsed.summary),
    moduleReports: Array.isArray(parsed.moduleReports)
      ? parsed.moduleReports.map((report) => ({
          module: cleanText(report.module),
          status: cleanText(report.status) || 'has_issues',
          findings: cleanList(report.findings),
        }))
      : [],
    findings: Array.isArray(parsed.findings)
      ? parsed.findings.map((finding, index) => ({
          id: cleanText(finding.id) || `finding-${String(index + 1).padStart(3, '0')}`,
          category: cleanText(finding.category),
          priority: ['blocking', 'normal'].includes(finding.priority) ? finding.priority : 'normal',
          problem: cleanText(finding.problem),
          affectedUrls: cleanList(finding.affectedUrls),
          evidence: Array.isArray(finding.evidence) ? finding.evidence.map((e) => ({ url: cleanText(e.url), note: cleanText(e.note) })) : [],
          impact: cleanText(finding.impact),
          recommendedAction: cleanText(finding.recommendedAction),
          requiresDeveloper: Boolean(finding.requiresDeveloper),
        }))
      : [],
    sourceArtifactId: artifact.artifactId,
    createdAt: now,
  }
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

// ── S3 B2B 上下文 ──

const S3_REQUIRED_CONTEXT_FACTS = ['businessFacts', 'productLines', 'targetCustomers']

export function buildB2bContextPrompt(state) {
  const project = state.project
  const snapshot = state.siteReadSnapshots[0]
  const auditFindings = state.auditFindings

  if (!project?.projectName) {
    throw new AgentWorkflowError(409, 'prerequisite_missing', '请先完成项目档案。')
  }
  if (!snapshot?.pages?.length) {
    throw new AgentWorkflowError(409, 'prerequisite_missing', '请先完成站点读取。')
  }

  const blockingFindings = auditFindings.filter((f) => f.priority === 'blocking')
  const pageSummary = snapshot.pages.slice(0, 15).map((p) => `- ${p.url} | ${p.pageType} | ${p.title}`).join('\n')

  return `# B2B 上下文证据生成

你是 B2B 独立站行业分析师和品牌策略师。基于以下项目信息和网站现状，生成结构化的 B2B 上下文证据库。

## 项目档案
- 项目名：${project.projectName}
- 域名：${project.domain}
- 公司名：${project.company}
- 行业：${project.industry}
- 供应链身份：${project.supplierIdentity}
- 目标市场：${project.targetMarkets.join('、') || '待确认'}
- 核心产品：${project.coreProducts.join('、') || '待确认'}
- 目标客户：${project.targetCustomers.join('、') || '待确认'}
- 转化目标：${project.primaryConversionGoal}

## 网站现状
- 总页面数：${snapshot.pageCount}
- 页面类型：${snapshot.detectedPageTypes.join('、') || '待确认'}
- 表单：${snapshot.detectedForms.join('、') || '未检测到'}
- 异常：${snapshot.anomalies.join('、') || '无'}

### 已读取页面
${pageSummary || '（无页面数据）'}

${blockingFindings.length > 0 ? `## 审计发现的阻塞问题
${blockingFindings.map((f) => `- [${f.category}] ${f.problem} → ${f.recommendedAction}`).join('\n')}` : '## 审计未发现阻塞问题'}

## 任务
请生成结构化的 B2B 上下文证据，包含以下 8 个模块：

1. **行业认知** — 产品定义、主要产品分类、核心材料、关键工艺、应用行业
2. **采购角色** — 4-6 类采购角色及其公司类型、采购目标、关注指标、常见顾虑
3. **采购决策链路** — 从需求产生到下单的完整流程，每个阶段的网站承接方式
4. **供应商筛选标准** — 10-15 条标准及网站应如何证明
5. **品牌定位** — 一句话定位、价值主张 6-10 条、品牌调性原则
6. **商业事实** — 产品线事实、客户类型事实、公司能力事实（每条标注是否有证据支持）
7. **禁用说法** — 不可声明的内容、需要证据才能声明的内容
8. **信任证据方向** — 需要补充的信任素材和证据

## 禁止事项
- 禁止虚构证书、客户、案例、产能数据。
- 没有证据的事实必须标注「需人工补充证据」。
- 不使用 DTC 促销话术。
- 所有输出面向采购决策者，不是普通消费者。

## 必须返回的 JSON
只返回一个 JSON 对象，schemaVersion 必须是 \`${B2B_CONTEXT_SCHEMA}\`。

\`\`\`json
{
  "schemaVersion": "${B2B_CONTEXT_SCHEMA}",
  "businessFacts": [
    { "id": "fact-001", "category": "product_line", "statement": "事实描述", "hasEvidence": false, "evidenceNote": "需人工补充证据" }
  ],
  "industryCognition": {
    "productDefinition": "一句话描述产品",
    "categories": ["分类1"],
    "materials": ["材料1"],
    "processes": ["工艺1"],
    "applications": ["应用行业1"]
  },
  "buyerPersonas": [
    { "role": "采购经理", "companyType": "制造商", "goal": "降低采购成本", "concerns": ["质量", "交期"] }
  ],
  "procurementFlow": [
    { "stage": "需求产生", "buyerNeed": "信息", "siteResponse": "页面", "cta": "CTA建议" }
  ],
  "supplierCriteria": [
    { "criterion": "MOQ", "whyItMatters": "采购方关心原因", "siteProof": "网站如何证明" }
  ],
  "brandPositioning": {
    "oneLiner": "一句话定位",
    "valuePropositions": [{ "vp": "价值主张", "meaning": "对采购方意义", "proofNeeded": "需要证据" }],
    "tonePrinciples": ["原则1"]
  },
  "productLines": [
    { "id": "pl-001", "name": "产品线名称", "description": "描述", "confirmed": false }
  ],
  "targetCustomers": [
    { "id": "tc-001", "role": "角色", "description": "描述", "confirmed": false }
  ],
  "forbiddenClaims": ["禁止声明1"],
  "trustEvidenceGaps": ["缺失证据方向1"],
  "humanReviewItems": ["需要人工确认的事项"]
}
\`\`\`

## 人工检查清单
- 所有商业事实是否有真实证据支持。
- 采购角色是否覆盖主要客户类型。
- 品牌定位是否符合公司真实能力。
- 禁用说法是否包含所有无法证明的声明。
- 不包含虚构证书、客户或案例。
`
}

export function generateB2bContextMock(state) {
  const project = state.project
  const now = new Date().toISOString()
  const product = project.coreProducts[0] || '核心产品'
  const market = project.targetMarkets[0] || '全球市场'

  return {
    schemaVersion: B2B_CONTEXT_SCHEMA,
    businessFacts: [
      { id: 'fact-001', category: 'product_line', statement: `${project.company} 提供 ${product} 及相关定制服务`, hasEvidence: true, evidenceNote: '基于项目档案' },
      { id: 'fact-002', category: 'customer_type', statement: `主要服务${market}的 ${project.targetCustomers.join('、')} 类客户`, hasEvidence: true, evidenceNote: '基于项目档案' },
      { id: 'fact-003', category: 'capability', statement: '支持 OEM/ODM 定制生产', hasEvidence: false, evidenceNote: '需人工补充：工厂图片、设备清单、定制案例' },
      { id: 'fact-004', category: 'trust', statement: '公司具备质量管理体系', hasEvidence: false, evidenceNote: '需人工补充：ISO 证书、质检流程文档' },
    ],
    industryCognition: {
      productDefinition: `${product} 是面向企业客户的定制化供应/制造服务`,
      categories: [product, '定制件', '标准件'],
      materials: ['金属', '塑料', '复合材料'],
      processes: ['CNC 加工', '冲压', '注塑'],
      applications: ['工业制造', '机械设备', '自动化'],
    },
    buyerPersonas: [
      { role: '采购经理', companyType: '制造商', goal: '找到可靠供应商降低采购风险', concerns: ['质量稳定性', '交期', 'MOQ'] },
      { role: 'OEM 工程师', companyType: 'OEM 品牌方', goal: '找到能定制开发的供应商', concerns: ['定制能力', '技术沟通', '保密性'] },
      { role: '分销商/贸易商', companyType: '贸易公司', goal: '找到性价比高的供货渠道', concerns: ['价格', 'MOQ', '出口经验'] },
      { role: '项目负责人', companyType: '工程公司', goal: '按项目采购特定零件', concerns: ['交期', '小批量', '技术支持'] },
    ],
    procurementFlow: [
      { stage: '需求产生', buyerNeed: '明确需要什么产品/规格', siteResponse: '产品线页面、应用指南', cta: '查看产品详情' },
      { stage: '供应商搜索', buyerNeed: '找到合格供应商', siteResponse: '首页、About Us、能力页面', cta: 'Request a Quote' },
      { stage: '初步筛选', buyerNeed: '评估供应商能力', siteResponse: 'Factory、QC、证书页面', cta: '下载公司简介' },
      { stage: '参数确认', buyerNeed: '确认技术参数和价格', siteResponse: '产品详情页、规格参数表', cta: '发送 RFQ' },
      { stage: '样品验证', buyerNeed: '验证样品质量', siteResponse: 'Sample Policy 页面', cta: '申请样品' },
      { stage: '下单', buyerNeed: '确认订单条款', siteResponse: 'Contact、RFQ 页面', cta: '提交询盘' },
    ],
    supplierCriteria: [
      { criterion: 'MOQ', whyItMatters: '决定能否小批量试单', siteProof: '在产品页明确标注 MOQ' },
      { criterion: 'Lead Time', whyItMatters: '影响项目排期', siteProof: '在能力页面说明标准交期' },
      { criterion: 'Customization', whyItMatters: 'OEM 客户核心需求', siteProof: '展示定制流程和案例' },
      { criterion: 'Certification', whyItMatters: '合规准入门槛', siteProof: '展示 ISO 等证书' },
      { criterion: 'Quality Control', whyItMatters: '保证批量一致性', siteProof: '展示 QC 流程和检测设备' },
      { criterion: 'Sample Policy', whyItMatters: '降低试错成本', siteProof: '明确样品政策' },
      { criterion: 'Export Experience', whyItMatters: '降低贸易风险', siteProof: '展示出口国家和案例' },
      { criterion: 'Communication', whyItMatters: '影响项目推进效率', siteProof: '多语言支持、响应承诺' },
    ],
    brandPositioning: {
      oneLiner: `For ${market} buyers, ${project.company} is a ${project.supplierIdentity} that provides reliable ${product} solutions.`,
      valuePropositions: [
        { vp: '专业定制能力', meaning: '能满足 OEM/ODM 需求', proofNeeded: '定制案例、设备清单' },
        { vp: '质量可控', meaning: '批量一致性有保障', proofNeeded: 'QC 流程、检测报告' },
        { vp: '交期可靠', meaning: '按时交付不影响项目', proofNeeded: '产能数据、交期记录' },
        { vp: '沟通高效', meaning: '技术问题能快速响应', proofNeeded: '团队介绍、服务承诺' },
      ],
      tonePrinciples: ['专业克制，不夸张', '用数据和事实说话', '面向采购决策者表达', '避免 DTC 促销语气'],
    },
    productLines: [
      { id: 'pl-001', name: product, description: `核心${product}产品线`, confirmed: false },
    ],
    targetCustomers: [
      { id: 'tc-001', role: '采购经理', description: `${market}制造企业的采购决策者`, confirmed: false },
      { id: 'tc-002', role: 'OEM 工程师', description: '品牌方的技术选型负责人', confirmed: false },
    ],
    forbiddenClaims: [
      '不得声称「工厂直供零风险」',
      '不得使用「最低价」「最好的质量」等无法证明的表述',
      '未取得 ISO 证书前不得声称具备 ISO 认证',
      '未有真实案例前不得虚构客户名、项目细节',
      '不得使用 DTC 促销话术：limited offer、buy now、flash sale',
    ],
    trustEvidenceGaps: [
      '工厂实景照片和设备清单',
      'ISO 或行业认证证书',
      '质检流程文档和检测报告',
      '真实出口案例（行业、国家、产品、数量）',
      '团队照片和公司介绍',
    ],
    humanReviewItems: [
      '确认产品线分类是否完整。',
      '确认采购角色覆盖了主要客户类型。',
      '确认品牌定位符合公司真实能力。',
      '确认商业事实是否有证据支持。',
      '确认禁用说法是否合理。',
    ],
  }
}

export function createB2bContextFromAiOutput(state, parsed) {
  const now = new Date().toISOString()
  return {
    contextId: createId('b2b_ctx'),
    schemaVersion: parsed.schemaVersion || B2B_CONTEXT_SCHEMA,
    status: 'waiting_review',
    businessFacts: Array.isArray(parsed.businessFacts) ? parsed.businessFacts.map((f) => ({
      id: cleanText(f.id) || createId('fact'),
      category: cleanText(f.category) || 'general',
      statement: cleanText(f.statement),
      hasEvidence: Boolean(f.hasEvidence),
      evidenceNote: cleanText(f.evidenceNote),
      confirmed: false,
    })) : [],
    industryCognition: parsed.industryCognition || {},
    buyerPersonas: Array.isArray(parsed.buyerPersonas) ? parsed.buyerPersonas : [],
    procurementFlow: Array.isArray(parsed.procurementFlow) ? parsed.procurementFlow : [],
    supplierCriteria: Array.isArray(parsed.supplierCriteria) ? parsed.supplierCriteria : [],
    brandPositioning: parsed.brandPositioning || {},
    productLines: Array.isArray(parsed.productLines) ? parsed.productLines.map((pl) => ({
      ...pl,
      id: cleanText(pl.id) || createId('pl'),
      confirmed: false,
    })) : [],
    targetCustomers: Array.isArray(parsed.targetCustomers) ? parsed.targetCustomers.map((tc) => ({
      ...tc,
      id: cleanText(tc.id) || createId('tc'),
      confirmed: false,
    })) : [],
    forbiddenClaims: cleanList(parsed.forbiddenClaims),
    trustEvidenceGaps: cleanList(parsed.trustEvidenceGaps),
    humanReviewItems: cleanList(parsed.humanReviewItems),
    sourceAiRunId: null,
    createdAt: now,
    updatedAt: now,
  }
}

export function submitB2bContext(state, body) {
  if (state.b2bContext?.status === 'waiting_review' || state.b2bContext?.status === 'done') {
    throw new AgentWorkflowError(409, 'context_exists', 'B2B 上下文已存在，请审核或重置后再生成。')
  }

  const rawContent = cleanText(body.rawContent)
  let parsed
  if (rawContent) {
    parsed = parseJsonArtifact(rawContent)
    if (parsed.schemaVersion !== B2B_CONTEXT_SCHEMA) {
      throw new AgentWorkflowError(400, 'invalid_schema', `schemaVersion 必须是 ${B2B_CONTEXT_SCHEMA}。`)
    }
  } else {
    parsed = generateB2bContextMock(state)
  }

  const context = createB2bContextFromAiOutput(state, parsed)
  if (body.sourceAiRunId) context.sourceAiRunId = cleanText(body.sourceAiRunId)
  state.b2bContext = context

  addWorkspaceArtifact(state, {
    type: 'b2b_context',
    title: 'B2B 上下文证据库',
    stepLabel: 'B2B 上下文建立',
    sourceId: context.contextId,
    route: '/trust',
  })
  return context
}

export function reviewB2bContext(state, body) {
  if (!state.b2bContext || state.b2bContext.status === 'none') {
    throw new AgentWorkflowError(404, 'no_context', '还没有生成 B2B 上下文。')
  }

  const decision = cleanText(body.decision)
  if (!['approved', 'rejected'].includes(decision)) {
    throw new AgentWorkflowError(400, 'invalid_decision', '审核结果必须是 approved 或 rejected。')
  }

  const now = new Date().toISOString()

  if (decision === 'rejected') {
    state.b2bContext.status = 'rejected'
    state.b2bContext.updatedAt = now
    state.b2bContext.reviewDecision = {
      decision,
      reviewer: cleanText(body.reviewer) || 'operator',
      notes: cleanText(body.notes),
      reviewedAt: now,
    }
    return state.b2bContext
  }

  // Approve: apply confirmed facts
  if (body.confirmedFactIds && Array.isArray(body.confirmedFactIds)) {
    const confirmedIds = new Set(body.confirmedFactIds)
    state.b2bContext.businessFacts.forEach((fact) => {
      if (confirmedIds.has(fact.id)) fact.confirmed = true
    })
  } else {
    // If no specific IDs, confirm all facts
    state.b2bContext.businessFacts.forEach((fact) => { fact.confirmed = true })
  }

  if (body.confirmedProductLineIds && Array.isArray(body.confirmedProductLineIds)) {
    const confirmedIds = new Set(body.confirmedProductLineIds)
    state.b2bContext.productLines.forEach((pl) => {
      if (confirmedIds.has(pl.id)) pl.confirmed = true
    })
  } else {
    state.b2bContext.productLines.forEach((pl) => { pl.confirmed = true })
  }

  if (body.confirmedCustomerIds && Array.isArray(body.confirmedCustomerIds)) {
    const confirmedIds = new Set(body.confirmedCustomerIds)
    state.b2bContext.targetCustomers.forEach((tc) => {
      if (confirmedIds.has(tc.id)) tc.confirmed = true
    })
  } else {
    state.b2bContext.targetCustomers.forEach((tc) => { tc.confirmed = true })
  }

  const hasAllConfirmed =
    state.b2bContext.businessFacts.some((f) => f.confirmed) &&
    state.b2bContext.productLines.some((pl) => pl.confirmed) &&
    state.b2bContext.targetCustomers.some((tc) => tc.confirmed)

  if (!hasAllConfirmed) {
    throw new AgentWorkflowError(409, 'incomplete_confirmation', '至少需要确认一条商业事实、一条产品线和一个客户类型。')
  }

  state.b2bContext.status = 'done'
  state.b2bContext.updatedAt = now
  state.b2bContext.reviewDecision = {
    decision: 'approved',
    reviewer: cleanText(body.reviewer) || 'operator',
    notes: cleanText(body.notes),
    reviewedAt: now,
  }

  addWorkspaceArtifact(state, {
    type: 'b2b_context_confirmed',
    title: 'B2B 上下文证据库（已确认）',
    stepLabel: 'B2B 上下文建立',
    sourceId: state.b2bContext.contextId,
    route: '/trust',
  })
  return state.b2bContext
}

// ── S4 种子关键词计划 ──

const S4_SCHEMA = 'seed_keyword_plan_v1'

export function buildSeedKeywordPlanPrompt(state) {
  const project = state.project
  const context = state.b2bContext

  if (!project?.projectName) {
    throw new AgentWorkflowError(409, 'prerequisite_missing', '请先完成项目档案。')
  }
  if (!context || context.status !== 'done') {
    throw new AgentWorkflowError(409, 'prerequisite_missing', '请先完成 B2B 上下文确认。')
  }

  const productLines = context.productLines.filter((pl) => pl.confirmed).map((pl) => pl.name || pl.description).join('、')
  const buyerRoles = context.buyerPersonas.map((bp) => bp.role).join('、')
  const valueProps = context.brandPositioning?.valuePropositions?.map((vp) => vp.vp).join('、') || ''

  return `# 种子关键词计划

你是 B2B SEO 关键词策略师。基于以下项目档案和 B2B 上下文，生成种子词作战表。

## 项目档案
- 项目名：${project.projectName}
- 域名：${project.domain}
- 行业：${project.industry}
- 供应链身份：${project.supplierIdentity}
- 目标市场：${project.targetMarkets.join('、')}
- 核心产品：${project.coreProducts.join('、')}
- 目标客户：${project.targetCustomers.join('、')}
- 转化目标：${project.primaryConversionGoal}

## B2B 上下文摘要
- 产品线：${productLines || '待确认'}
- 采购角色：${buyerRoles || '待确认'}
- 价值主张：${valueProps || '待确认'}
- 行业认知：${context.industryCognition?.productDefinition || '待确认'}
- 应用行业：${(context.industryCognition?.applications || []).join('、') || '待确认'}
- 核心材料：${(context.industryCognition?.materials || []).join('、') || '待确认'}
- 核心工艺：${(context.industryCognition?.processes || []).join('、') || '待确认'}

## 输出要求
按 8 个模块输出种子词矩阵。每个种子词保留英文，解释用中文。

### 模块 1：核心产品词矩阵
T1（核心产品词）、T2（产品+修饰词）、T3（长尾产品词）

### 模块 2：供应商身份词矩阵
manufacturer、supplier、factory、wholesale、bulk、distributor、exporter 等组合

### 模块 3：定制与 OEM/ODM 词矩阵
custom、private label、OEM、ODM、logo printing、custom size 等

### 模块 4：应用行业词矩阵
[product] for [industry/application] 格式

### 模块 5：材料/工艺/认证词矩阵
材料、技术参数、生产工艺、认证、合规标准

### 模块 6：采购问题与 PAA 触发词
50-80 个英文问题词，覆盖 MOQ、lead time、sample、price、supplier selection、QC、certification、shipping、customization

### 模块 7：竞品反查清单
5-10 个竞品/同行网站类型和搜索方式

### 模块 8：工具执行清单
按 Semrush/Ahrefs、GKP、PAA、Google Suggest、竞品反查分别列执行步骤

## 禁止事项
- 种子词保留英文，解释用中文。
- 不生成最终页面架构，页面映射留给后续阶段。
- 优先级用 P0/P1/P2。
- 不使用 DTC 术语。

## 必须返回的 JSON
只返回一个 JSON 对象，schemaVersion 必须是 \`${S4_SCHEMA}\`。

\`\`\`json
{
  "schemaVersion": "${S4_SCHEMA}",
  "seedGroups": [
    {
      "seedGroupId": "sg-001",
      "moduleType": "core_product",
      "name": "核心产品词矩阵",
      "seeds": [
        { "keyword": "cnc machining parts", "chineseExplanation": "CNC 加工零件", "productLine": "核心产品", "priority": "P0", "toolInstruction": "在 Semrush 中查 volume 和 KD" }
      ]
    }
  ],
  "paaQuestions": ["how to choose a reliable supplier for..."],
  "competitorResearchSeeds": ["搜索 site:alibaba.com [industry] supplier"],
  "researchInstructions": ["使用 Semrush 的 Keyword Magic Tool..."],
  "negativeDirections": ["避免 DTC 消费者词", "避免品牌词蚕食"],
  "humanReviewItems": ["确认产品词覆盖完整", "确认采购问题真实存在"]
}
\`\`\`
`
}

export function generateSeedKeywordPlanMock(state) {
  const project = state.project
  const context = state.b2bContext
  const product = project.coreProducts[0] || 'products'
  const market = project.targetMarkets[0] || 'global'

  return {
    schemaVersion: S4_SCHEMA,
    seedGroups: [
      {
        seedGroupId: 'sg-001',
        moduleType: 'core_product',
        name: '核心产品词矩阵',
        seeds: [
          { keyword: `${product.toLowerCase()}`, chineseExplanation: `核心产品词`, productLine: product, priority: 'P0', toolInstruction: 'Semrush 查 volume/KD' },
          { keyword: `custom ${product.toLowerCase()}`, chineseExplanation: `定制${product}`, productLine: product, priority: 'P0', toolInstruction: 'GKP 查搜索量' },
          { keyword: `${product.toLowerCase()} manufacturer`, chineseExplanation: `${product}制造商`, productLine: product, priority: 'P0', toolInstruction: 'Semrush 竞品分析' },
          { keyword: `wholesale ${product.toLowerCase()}`, chineseExplanation: `批发${product}`, productLine: product, priority: 'P1', toolInstruction: '查看商业意图' },
        ],
      },
      {
        seedGroupId: 'sg-002',
        moduleType: 'supplier_identity',
        name: '供应商身份词矩阵',
        seeds: [
          { keyword: `${project.industry.toLowerCase()} supplier`, chineseExplanation: `${project.industry}供应商`, productLine: '通用', priority: 'P0', toolInstruction: 'Semrush 查排名' },
          { keyword: `${project.industry.toLowerCase()} manufacturer`, chineseExplanation: `${project.industry}制造商`, productLine: '通用', priority: 'P0', toolInstruction: '检查 SERP 竞争度' },
          { keyword: `${project.industry.toLowerCase()} factory`, chineseExplanation: `${project.industry}工厂`, productLine: '通用', priority: 'P1', toolInstruction: 'Google Suggest 扩展' },
          { keyword: `${project.industry.toLowerCase()} exporter`, chineseExplanation: `${project.industry}出口商`, productLine: '通用', priority: 'P1', toolInstruction: '查看国际搜索量' },
        ],
      },
      {
        seedGroupId: 'sg-003',
        moduleType: 'custom_oem',
        name: '定制与 OEM/ODM 词矩阵',
        seeds: [
          { keyword: `custom ${product.toLowerCase()} manufacturer`, chineseExplanation: `定制${product}制造商`, productLine: product, priority: 'P0', toolInstruction: '高意向词，优先优化' },
          { keyword: `OEM ${product.toLowerCase()}`, chineseExplanation: `OEM ${product}`, productLine: product, priority: 'P0', toolInstruction: 'B2B 高价值词' },
          { keyword: `private label ${product.toLowerCase()}`, chineseExplanation: `贴牌${product}`, productLine: product, priority: 'P1', toolInstruction: '品牌方采购词' },
        ],
      },
      {
        seedGroupId: 'sg-004',
        moduleType: 'application',
        name: '应用行业词矩阵',
        seeds: [
          { keyword: `${product.toLowerCase()} for automotive`, chineseExplanation: `${product}用于汽车行业`, productLine: product, priority: 'P1', toolInstruction: '按行业扩展' },
          { keyword: `${product.toLowerCase()} for electronics`, chineseExplanation: `${product}用于电子行业`, productLine: product, priority: 'P1', toolInstruction: '查看行业搜索量' },
          { keyword: `industrial ${product.toLowerCase()}`, chineseExplanation: `工业用${product}`, productLine: product, priority: 'P1', toolInstruction: '应用场景扩展' },
        ],
      },
      {
        seedGroupId: 'sg-005',
        moduleType: 'material_process',
        name: '材料/工艺/认证词矩阵',
        seeds: [
          { keyword: `stainless steel ${product.toLowerCase()}`, chineseExplanation: `不锈钢${product}`, productLine: product, priority: 'P1', toolInstruction: '材料词扩展' },
          { keyword: `${product.toLowerCase()} with ISO certification`, chineseExplanation: `ISO 认证${product}`, productLine: product, priority: 'P2', toolInstruction: '合规词，信任建设' },
        ],
      },
    ],
    paaQuestions: [
      `how to choose a reliable ${project.industry.toLowerCase()} supplier`,
      `what is the MOQ for custom ${product.toLowerCase()}`,
      `how long is the lead time for ${product.toLowerCase()}`,
      `how to verify a ${project.industry.toLowerCase()} factory`,
      `what certifications should a ${project.industry.toLowerCase()} supplier have`,
      `how to get samples from ${project.industry.toLowerCase()} manufacturers`,
      `what is the typical price range for ${product.toLowerCase()}`,
      `how to ensure quality control when sourcing ${product.toLowerCase()}`,
    ],
    competitorResearchSeeds: [
      `site:alibaba.com ${project.industry.toLowerCase()} supplier`,
      `"${product.toLowerCase()}" manufacturer -alibaba -made-in-china`,
      `intitle:"${product.toLowerCase()}" inurl:products`,
      `${project.industry.toLowerCase()} supplier ${market.toLowerCase()}`,
    ],
    researchInstructions: [
      '使用 Semrush Keyword Magic Tool 输入核心产品词，导出前 500 个相关词',
      '使用 Google Keyword Planner 验证搜索量和竞争度',
      '使用 AlsoAsked/PAA 抓取采购问题词',
      '使用 Semrush Domain Overview 分析竞品关键词',
      '使用 Google Suggest 和 Related Searches 扩展长尾词',
    ],
    negativeDirections: [
      '避免 DTC 消费者词：buy now、cheap、best deal',
      '避免品牌词蚕食：不要用竞品品牌名作为目标关键词',
      '避免过宽泛词：不要用单个产品词如 parts、supplies',
      '避免信息意图词映射到商业页：how-to 词应映射到 Resource/Blog',
    ],
    humanReviewItems: [
      '确认产品词矩阵覆盖了所有产品线。',
      '确认供应商身份词符合公司真实身份。',
      '确认定制词反映了真实的定制能力。',
      '确认采购问题词覆盖了常见客户问题。',
      '确认没有包含无法满足的关键词方向。',
    ],
  }
}

export function submitSeedKeywordPlan(state, body) {
  if (state.seedKeywordPlan) {
    throw new AgentWorkflowError(409, 'plan_exists', '种子关键词计划已存在，请重置后再生成。')
  }

  const rawContent = cleanText(body.rawContent)
  let parsed
  if (rawContent) {
    parsed = parseJsonArtifact(rawContent)
    if (parsed.schemaVersion !== S4_SCHEMA) {
      throw new AgentWorkflowError(400, 'invalid_schema', `schemaVersion 必须是 ${S4_SCHEMA}。`)
    }
  } else {
    parsed = generateSeedKeywordPlanMock(state)
  }

  const plan = {
    planId: createId('seed_plan'),
    schemaVersion: S4_SCHEMA,
    status: 'ready',
    seedGroups: Array.isArray(parsed.seedGroups) ? parsed.seedGroups.map((group) => ({
      seedGroupId: cleanText(group.seedGroupId) || createId('sg'),
      moduleType: cleanText(group.moduleType) || 'general',
      name: cleanText(group.name),
      seeds: Array.isArray(group.seeds) ? group.seeds.map((seed) => ({
        keyword: cleanText(seed.keyword),
        chineseExplanation: cleanText(seed.chineseExplanation),
        productLine: cleanText(seed.productLine),
        priority: cleanText(seed.priority) || 'P2',
        toolInstruction: cleanText(seed.toolInstruction),
      })).filter((seed) => seed.keyword) : [],
    })) : [],
    paaQuestions: cleanList(parsed.paaQuestions),
    competitorResearchSeeds: cleanList(parsed.competitorResearchSeeds),
    researchInstructions: cleanList(parsed.researchInstructions),
    negativeDirections: cleanList(parsed.negativeDirections),
    humanReviewItems: cleanList(parsed.humanReviewItems),
    sourceAiRunId: body.sourceAiRunId ? cleanText(body.sourceAiRunId) : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  state.seedKeywordPlan = plan

  addWorkspaceArtifact(state, {
    type: 'seed_keyword_plan',
    title: '种子关键词计划',
    stepLabel: '关键词导入',
    sourceId: plan.planId,
    route: '/keywords',
  })
  return plan
}

export function resetSeedKeywordPlan(state) {
  if (!state.seedKeywordPlan) {
    throw new AgentWorkflowError(404, 'no_plan', '还没有生成种子关键词计划。')
  }
  state.seedKeywordPlan = null
  return { reset: true }
}

// ── S5 关键词导入 ──

export function importKeywords(state, body) {
  const csvText = cleanText(body.csvText)
  if (!csvText) {
    throw new AgentWorkflowError(400, 'invalid_csv', '请粘贴关键词 CSV 文本。')
  }

  const sourceTool = cleanText(body.sourceTool) || 'manual_import'
  const sourceFile = cleanText(body.sourceFile) || 'pasted_csv'
  const market = cleanText(body.market) || (state.project?.targetMarkets?.[0] || '')

  const rows = parseCsvRows(csvText)
  if (rows.length === 0) {
    throw new AgentWorkflowError(400, 'empty_csv', 'CSV 中没有有效数据行。')
  }

  const now = new Date().toISOString()
  const batchId = createId('kw_batch')
  const existingKeywords = new Set(state.keywords.map((kw) => kw.keyword.toLowerCase()))
  const validRows = []
  const skippedRows = []

  for (const row of rows) {
    const keyword = cleanText(row.keyword)
    if (!keyword) {
      skippedRows.push({ reason: 'empty_keyword', row })
      continue
    }
    if (existingKeywords.has(keyword.toLowerCase())) {
      skippedRows.push({ reason: 'duplicate', keyword })
      continue
    }

    const volume = Number(row.volume || row.search_volume || row['search volume'] || 0)
    const kd = Number(row.kd || row.keyword_difficulty || row['keyword difficulty'] || 0)
    const intent = cleanText(row.intent || row.search_intent || row['search intent'] || '')
    const seedGroup = cleanText(row.seed_group || row.seedGroup || '')

    validRows.push({
      keywordId: createId('kw'),
      keyword,
      volume: Number.isFinite(volume) ? volume : 0,
      kd: Number.isFinite(kd) ? kd : 0,
      sourceTool,
      sourceFile,
      seedGroup,
      aiIntent: intent,
      aiPageType: '',
      aiRelevant: true,
      isBrandTerm: false,
      isPlatformTerm: false,
      isB2CTerm: false,
      cleaningReason: '',
      aiConfidence: 0,
      status: 'raw_imported',
      assignedPageId: null,
      assignedUrl: null,
      isUsed: false,
      isValidUnused: false,
      reviewNotes: '',
      createdAt: now,
    })
    existingKeywords.add(keyword.toLowerCase())
  }

  if (validRows.length === 0) {
    throw new AgentWorkflowError(400, 'no_valid_keywords', 'CSV 中没有有效关键词。')
  }

  const batch = {
    batchId,
    sourceTool,
    sourceFile,
    market,
    totalRows: rows.length,
    validRows: validRows.length,
    skippedRows: skippedRows.length,
    status: 'imported',
    createdAt: now,
  }

  state.keywordImportBatches.unshift(batch)
  state.keywords.push(...validRows)

  addWorkspaceArtifact(state, {
    type: 'keyword_import_batch',
    title: `关键词导入批次 (${validRows.length} 条)`,
    stepLabel: '关键词导入',
    sourceId: batchId,
    route: '/keywords',
  })
  return { batch, importedCount: validRows.length, skippedCount: skippedRows.length }
}

// ── S6 关键词清洗 ──

export function generateCleaningRun(state, body) {
  const rawKeywords = state.keywords.filter((kw) => kw.status === 'raw_imported')
  if (rawKeywords.length === 0) {
    throw new AgentWorkflowError(409, 'no_raw_keywords', '没有待清洗的原始关键词。')
  }

  const now = new Date().toISOString()
  const runId = createId('clean_run')
  const suggestions = []

  for (const kw of rawKeywords) {
    const lower = kw.keyword.toLowerCase()
    const reasons = []

    // Detect brand/platform/B2C terms
    const isBrandTerm = /\b(amazon|ebay|walmart|alibaba|aliexpress|wish)\b/i.test(lower)
    const isPlatformTerm = /\b(shopify|woocommerce|etsy|tiktok shop)\b/i.test(lower)
    const isB2CTerm = /\b(buy now|cheap|discount|coupon|free shipping|best seller|trending)\b/i.test(lower)

    if (isBrandTerm) reasons.push('品牌平台词')
    if (isPlatformTerm) reasons.push('平台技术词')
    if (isB2CTerm) reasons.push('B2C 消费者词')

    // Detect duplicates by similar intent
    const existingSimilar = state.keywords.filter(
      (other) => other.keywordId !== kw.keywordId && other.status !== 'raw_imported' &&
        other.keyword.toLowerCase() === lower
    )
    if (existingSimilar.length > 0) reasons.push('完全重复')

    const shouldReject = reasons.length > 0
    const confidence = shouldReject ? 0.9 : 0.7

    suggestions.push({
      keywordId: kw.keywordId,
      keyword: kw.keyword,
      currentStatus: kw.status,
      suggestedAction: shouldReject ? 'reject' : 'approve',
      reason: reasons.join('；') || '符合 B2B 采购搜索意图',
      isBrandTerm,
      isPlatformTerm,
      isB2CTerm,
      confidence,
    })
  }

  const approveCount = suggestions.filter((s) => s.suggestedAction === 'approve').length
  const rejectCount = suggestions.filter((s) => s.suggestedAction === 'reject').length

  const cleaningRun = {
    cleaningRunId: runId,
    status: 'waiting_review',
    totalKeywords: rawKeywords.length,
    approveCount,
    rejectCount,
    suggestions,
    createdAt: now,
    updatedAt: now,
  }

  state.keywordCleaningRuns.unshift(cleaningRun)
  addWorkspaceArtifact(state, {
    type: 'keyword_cleaning_run',
    title: `关键词清洗建议 (${approveCount} 通过 / ${rejectCount} 拒绝)`,
    stepLabel: '关键词清洗入库',
    sourceId: runId,
    route: '/keywords',
  })
  return cleaningRun
}

// ── S7 关键词审核入库 ──

export function reviewCleaningRun(state, cleaningRunId, body) {
  const cleaningRun = state.keywordCleaningRuns.find((run) => run.cleaningRunId === cleaningRunId)
  if (!cleaningRun) {
    throw new AgentWorkflowError(404, 'unknown_cleaning_run', '没有找到对应的清洗记录。')
  }
  if (cleaningRun.status !== 'waiting_review') {
    throw new AgentWorkflowError(409, 'already_reviewed', '此清洗记录已审核。')
  }

  const decision = cleanText(body.decision)
  if (!['approved', 'rejected'].includes(decision)) {
    throw new AgentWorkflowError(400, 'invalid_decision', '审核结果必须是 approved 或 rejected。')
  }

  const now = new Date().toISOString()

  if (decision === 'rejected') {
    cleaningRun.status = 'rejected'
    cleaningRun.updatedAt = now
    cleaningRun.reviewDecision = { decision, reviewer: cleanText(body.reviewer) || 'operator', notes: cleanText(body.notes), reviewedAt: now }
    return cleaningRun
  }

  // Approved: apply suggestions
  const overrides = body.overrides && typeof body.overrides === 'object' ? body.overrides : {}
  const keywordMap = new Map(state.keywords.map((kw) => [kw.keywordId, kw]))

  for (const suggestion of cleaningRun.suggestions) {
    const kw = keywordMap.get(suggestion.keywordId)
    if (!kw) continue

    const override = overrides[suggestion.keywordId]
    const action = override?.action || suggestion.suggestedAction

    if (action === 'reject') {
      kw.status = 'rejected'
      kw.cleaningReason = override?.reason || suggestion.reason
      kw.isBrandTerm = suggestion.isBrandTerm
      kw.isPlatformTerm = suggestion.isPlatformTerm
      kw.isB2CTerm = suggestion.isB2CTerm
    } else {
      kw.status = 'approved'
      kw.cleaningReason = suggestion.reason
      kw.isBrandTerm = suggestion.isBrandTerm
      kw.isPlatformTerm = suggestion.isPlatformTerm
      kw.isB2CTerm = suggestion.isB2CTerm
      kw.aiConfidence = suggestion.confidence
    }
  }

  cleaningRun.status = 'done'
  cleaningRun.updatedAt = now
  cleaningRun.reviewDecision = { decision: 'approved', reviewer: cleanText(body.reviewer) || 'operator', notes: cleanText(body.notes), reviewedAt: now }

  addWorkspaceArtifact(state, {
    type: 'keyword_cleaning_approved',
    title: '关键词清洗已批准',
    stepLabel: '关键词清洗入库',
    sourceId: cleaningRunId,
    route: '/keywords',
  })
  return cleaningRun
}

// ── CSV 解析 ──

function parseCsvRows(csvText) {
  const lines = csvText.split('\n').map((line) => line.trim()).filter(Boolean)
  if (lines.length < 2) return []

  const headers = parseCsvLine(lines[0]).map((h) => cleanText(h).toLowerCase().replace(/\s+/g, '_'))
  const rows = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i])
    if (values.length === 0) continue
    const row = {}
    headers.forEach((header, index) => {
      row[header] = cleanText(values[index] || '')
    })
    rows.push(row)
  }
  return rows
}

function parseCsvLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  result.push(current)
  return result
}
