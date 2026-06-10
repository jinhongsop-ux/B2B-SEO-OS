export const WORKFLOW_DEFINITIONS = [
  {
    stepId: 'site_connection_reading',
    label: '站点接入与读取',
    route: '/project-center',
    output: '项目档案、只读连接档案、站点读取快照',
    humanReviewPoint: '确认这是正确站点，且本阶段不保存密码、不写入 WordPress。',
    readyAction: '填写项目档案并生成本地读取快照',
  },
  {
    stepId: 'audit',
    label: '网站现状审计',
    route: '/audit',
    output: '审计问题清单、任务候选',
    humanReviewPoint: '确认高风险问题有页面、证据、影响和建议动作。',
    readyAction: '基于读取快照生成审计结果',
  },
  {
    stepId: 'b2b_context',
    label: 'B2B 上下文建立',
    route: '/trust',
    output: '已确认商业事实、信任证据、禁用说法',
    humanReviewPoint: '所有商业事实必须人工确认后才能被后续 AI 使用。',
    readyAction: '生成并确认 B2B 业务事实库',
  },
  {
    stepId: 'keyword_import',
    label: '关键词导入',
    route: '/keywords',
    output: '关键词导入批次、原始关键词池',
    humanReviewPoint: '确认来源工具、市场和字段识别是否正确。',
    readyAction: '粘贴或输入关键词并导入原始词池',
  },
  {
    stepId: 'keyword_cleaning',
    label: '关键词清洗入库',
    route: '/keywords',
    output: '清洗建议、正式关键词库',
    humanReviewPoint: '批准后才进入正式词库；排除词必须保留原因。',
    readyAction: '生成关键词清洗建议',
  },
  {
    stepId: 'keyword_assignment',
    label: '人工审核分配',
    route: '/keywords',
    output: '关键词分配结果、未使用词池',
    humanReviewPoint: '只有已审核关键词可分配；每个页面最多一个主词。',
    readyAction: '生成人工可确认的关键词分配',
  },
  {
    stepId: 'page_repair',
    label: '页面修复包',
    route: '/tasks',
    output: '页面 SEO 修复包、修复任务候选',
    humanReviewPoint: '未确认商业事实只能进入待确认项，不能写成确定文案。',
    readyAction: '为已分配页面生成修复包',
  },
  {
    stepId: 'unused_keyword_clustering',
    label: '未使用词聚类',
    route: '/keywords',
    output: '未使用词聚类、内容机会',
    humanReviewPoint: '聚类只形成内容机会，不直接创建正式任务。',
    readyAction: '把未使用关键词聚成内容机会',
  },
  {
    stepId: 'content_handoff',
    label: 'Content Engine 交接',
    route: '/content',
    output: '内容交接包、写作 Brief',
    humanReviewPoint: '交接包只作为执行材料，不自动发布。',
    readyAction: '整理页面修复包和内容机会',
  },
  {
    stepId: 'qa_delivery',
    label: 'QA 与交付报告',
    route: '/delivery',
    output: 'QA 检查结果、交付报告',
    humanReviewPoint: '交付前确认风险、待办和待确认项。',
    readyAction: '运行 QA 并生成交付报告',
  },
  {
    stepId: 'workflow_connection',
    label: '全流程串联',
    route: '/overview',
    output: '统一导航、状态栏、教程链接和数据引用',
    humanReviewPoint: '确认从空工作区到交付报告的路径完整可走。',
    readyAction: '查看完整流程闭环',
  },
]

export function deriveWorkflow(state) {
  const facts = buildWorkflowFacts(state)
  const doneChecks = [
    facts.siteReady,
    facts.auditDone,
    facts.contextDone,
    facts.keywordImportDone,
    facts.cleaningDone,
    facts.assignmentDone,
    facts.repairDone,
    facts.clusterDone,
    facts.handoffDone,
    facts.deliveryDone,
    facts.deliveryDone,
  ]
  const waitingChecks = [
    false,
    facts.auditWaiting,
    facts.contextWaiting,
    false,
    facts.cleaningWaiting,
    facts.assignmentWaiting,
    facts.repairWaiting,
    facts.clusterWaiting,
    facts.handoffWaiting,
    facts.qaWaiting || facts.deliveryWaiting,
    false,
  ]

  const steps = WORKFLOW_DEFINITIONS.map((definition, index) => {
    let status = 'locked'
    const previousDone = index === 0 || doneChecks.slice(0, index).every(Boolean)
    if (doneChecks[index]) {
      status = 'done'
    } else if (previousDone && waitingChecks[index]) {
      status = 'waiting_review'
    } else if (previousDone) {
      status = 'ready'
    }
    return {
      ...definition,
      order: index + 1,
      status,
      blocker: status === 'locked' ? `请先完成「${WORKFLOW_DEFINITIONS[index - 1]?.label || '上一步'}」。` : '',
    }
  })

  const firstOpen = steps.find((step) => step.status !== 'done') || steps[steps.length - 1]
  return {
    steps,
    currentStepId: firstOpen.stepId,
    currentStepLabel: firstOpen.label,
    currentRoute: firstOpen.route,
    completedCount: steps.filter((step) => step.status === 'done').length,
    totalCount: steps.length,
    nextAction: firstOpen.readyAction,
    safetyBoundary: {
      aiApiEnabled: false,
      wordpressWritesEnabled: false,
      storesCredentials: false,
      mode: '本地手动/模拟',
    },
    updatedAt: new Date().toISOString(),
  }
}

export function buildWorkflowFacts(state) {
  const latestSnapshot = state.siteReadSnapshots[0] || null
  const approvedKeywords = state.keywords.filter((keyword) => keyword.status === 'approved')
  const hasDelivery = state.deliveryReports.some((report) => report.status === 'done')
  return {
    siteReady: Boolean(state.project?.projectName && state.project?.domain && latestSnapshot?.pages?.length),
    auditWaiting: state.auditRuns.some((run) => run.status === 'waiting_review'),
    auditDone: state.auditRuns.some((run) => run.status === 'done') && state.auditFindings.length > 0,
    contextWaiting: state.b2bContext?.status === 'waiting_review',
    contextDone: state.b2bContext?.status === 'done' && hasConfirmedContext(state.b2bContext),
    keywordImportDone: state.keywordImportBatches.some((batch) => batch.validRows > 0) && state.keywords.length > 0,
    cleaningWaiting: state.keywordCleaningRuns.some((run) => run.status === 'waiting_review'),
    cleaningDone: state.keywordCleaningRuns.some((run) => run.status === 'done') && approvedKeywords.length > 0,
    assignmentWaiting: state.keywordAssignmentRuns.some((run) => run.status === 'waiting_review'),
    assignmentDone: state.keywordAssignmentRuns.some((run) => run.status === 'done') && state.keywordAssignments.length > 0,
    repairWaiting: state.pageRepairPackages.some((item) => item.status === 'waiting_review'),
    repairDone: state.pageRepairPackages.some((item) => item.status === 'done'),
    clusterWaiting: state.unusedKeywordClusterRuns.some((run) => run.status === 'waiting_review'),
    clusterDone: state.unusedKeywordClusterRuns.some((run) => run.status === 'done') && state.contentOpportunities.length > 0,
    handoffWaiting: state.contentHandoffs.some((handoff) => handoff.status === 'waiting_review'),
    handoffDone: state.contentHandoffs.some((handoff) => handoff.status === 'done'),
    qaWaiting: state.qaRuns.some((run) => run.status === 'waiting_review'),
    deliveryWaiting: state.deliveryReports.some((report) => report.status === 'waiting_review'),
    deliveryDone: hasDelivery,
  }
}

function hasConfirmedContext(context) {
  return (
    (context.businessFacts || []).some((item) => item.confirmed) &&
    (context.productLines || []).some((item) => item.confirmed) &&
    (context.targetCustomers || []).some((item) => item.confirmed)
  )
}
