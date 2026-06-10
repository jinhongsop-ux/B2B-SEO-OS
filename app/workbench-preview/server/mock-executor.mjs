export function buildManualPromptPackage(prompt, inputEnvelope) {
  const lines = [
    prompt.markdownTemplate,
    '',
    '## 用户补充指令',
    inputEnvelope.userInstruction || '无',
    '',
    '## 安全边界',
    '- 只读分析，不写入 WordPress。',
    '- 不自动发布，不上传媒体，不确认商业事实。',
    '- 所有输出必须进入人工审核。',
    '',
    '## 输入数据包',
    '```json',
    JSON.stringify(inputEnvelope, null, 2),
    '```',
    '',
    '## 输出要求',
    '- 返回人类可读的 Markdown 摘要。',
    '- 返回机器可读 JSON。',
    '- 返回任务候选时必须说明来源对象和人工确认点。',
  ]

  return {
    packageId: `manual_${inputEnvelope.runId}`,
    promptId: prompt.promptId,
    copyFormat: 'markdown',
    markdown: lines.join('\n'),
    inputPreview: summarizeInput(inputEnvelope.inputContext),
    createdAt: inputEnvelope.createdAt,
  }
}

export function buildMockOutput(prompt, inputEnvelope) {
  const promptId = prompt.promptId
  const context = inputEnvelope.inputContext

  if (promptId === 'keyword-ai-cleaning-v1') {
    const cleanedKeywords = (context.keywordRecords || []).map((keyword) => ({
      keywordId: keyword.keywordId,
      keyword: keyword.keyword,
      isRelevant: keyword.status !== 'rejected',
      likelyIntent: keyword.aiIntent || 'needs_review',
      likelyPageType: keyword.likelyPageType || 'needs_review',
      isB2CTerm: keyword.keyword.includes('wall art'),
      isPlatformTerm: keyword.keyword.includes('amazon'),
      cleaningReason: keyword.status === 'rejected'
        ? '不符合 B2B 独立站采购或询盘意图。'
        : '符合 B2B 供应商、产品、能力或采购意图。',
      aiConfidence: keyword.status === 'pending_review' ? 0.74 : 0.86,
    }))

    return envelope(inputEnvelope, 'success', '已完成关键词清洗模拟输出，所有词仅打标，等待人工审核。', {
      cleanedKeywords,
      warnings: ['AI 只给关键词打标，不会删除关键词，也不会直接分配页面。'],
    }, [
      '人工确认 pending_review 关键词是否保留。',
      '被识别为 rejected 的词仍需人工最终确认。',
    ], [])
  }

  if (promptId === 'front-stage-b2b-audit-v1') {
    const findings = (context.auditFindings || []).map((finding) => ({
      findingId: finding.findingId,
      category: finding.category,
      severity: finding.severity,
      url: finding.url,
      title: finding.title,
      description: finding.recommendedAction,
      evidence: finding.evidence,
      recommendedAction: finding.recommendedAction,
      requiresHumanReview: finding.severity === 'high',
    }))

    return envelope(inputEnvelope, 'success', '已生成 B2B 前台审计模拟结果，高风险问题需要人工确认后进入任务中心。', {
      overallAssessment: '核心商业页面存在明显的 B2B 信任表达和询盘转化缺口。',
      findings,
      taskCandidates: findings.map((finding) => ({
        title: finding.title,
        taskType: finding.category.includes('spec') ? 'page_repair' : 'site_audit',
        priority: finding.severity === 'high' ? 'p1' : 'p2',
        relatedUrl: finding.url,
        sourceObjectIds: [finding.findingId],
        requiresHumanReview: true,
      })),
    }, [
      '确认高风险 finding 是否属于当前阶段。',
      '关键词相关修复需等待关键词审核分配。',
    ], findings.map((finding) => ({
      title: finding.title,
      taskType: finding.category.includes('spec') ? 'page_repair' : 'site_audit',
      priority: finding.severity === 'high' ? 'p1' : 'p2',
      relatedUrl: finding.url,
      sourceObjectIds: [finding.findingId],
      requiresHumanReview: true,
    })))
  }

  if (promptId === 'page-repair-package-generation-v1') {
    const page = context.pageSnapshot || context.pageRecords?.[0] || {}
    const assignedKeywords = context.assignedKeywords || []
    const confirmedEvidence = (context.evidenceRecords || []).filter((item) => item.confirmed)
    const unconfirmedEvidence = (context.evidenceRecords || []).filter((item) => !item.confirmed)

    return envelope(inputEnvelope, 'success', '已生成页面修复包模拟输出；未确认事实进入人工确认项，不写 WordPress。', {
      repairPackage: {
        repairPackageId: `repair_${inputEnvelope.runId}`,
        url: page.url || '',
        pageType: page.pageType || '',
        assignedKeywords: assignedKeywords.map((keyword) => keyword.keyword),
        keywordsNotToForce: ['附近定制金属零件', '亚马逊金属零件'],
        writeBoundary: 'dry_run_only',
      },
      titleSuggestion: '面向 OEM 项目的定制金属零件制造商',
      metaDescriptionSuggestion: '为 B2B OEM 项目提供定制金属零件，支持材料、表面处理和询价信息整理。MOQ 与交期必须人工确认后使用。',
      modulesToAdd: [
        { module: '规格参数表', fields: ['材料', '公差', '表面处理', 'MOQ', '交期'] },
        { module: '质量证据模块', evidenceIds: confirmedEvidence.map((item) => item.evidenceId) },
        { module: '询价行动按钮', placement: '规格参数表后方与页面底部' },
      ],
      internalLinksToAdd: [
        { targetUrl: '/quality-control/', anchor: '质量控制流程' },
        { targetUrl: '/request-a-quote/', anchor: '提交询价' },
      ],
      humanReviewItems: [
        '使用前必须确认 MOQ 与交期。',
        ...unconfirmedEvidence.map((item) => `确认或脱敏证据：${item.name}`),
      ],
    }, [
      '确认所有商业事实。',
      '确认修复包只作为 dry-run 交付，不直接写入 WordPress。',
    ], [{
      title: `审查页面修复包：${page.url || '已选择页面'}`,
      taskType: 'page_repair',
      priority: 'p1',
      relatedUrl: page.url || '',
      sourceObjectIds: [inputEnvelope.runId],
      requiresHumanReview: true,
    }])
  }

  if (promptId === 'unused-keyword-super-clustering-v1') {
    const unused = (context.keywordRecords || []).filter((keyword) => keyword.status === 'unused_valid')
    const clusters = unused.slice(0, 3).map((keyword, index) => ({
      clusterId: `cluster_mock_${index + 1}`,
      clusterName: keyword.keyword.includes('stamping') ? '金属冲压新页面机会' : '采购支持内容机会',
      primaryKeyword: keyword.keyword,
      secondaryKeywords: unused.filter((item) => item.keywordId !== keyword.keywordId).slice(0, 2).map((item) => item.keyword),
      recommendedPageType: keyword.likelyPageType || 'content',
      recommendedAction: keyword.keyword.includes('supplier') ? 'new_page_task' : 'content_engine_task',
      reason: '现有页面不适合强行承接该关键词，应保留在未使用有效词聚类流程中。',
    }))

    return envelope(inputEnvelope, 'success', '已对未使用有效词生成聚类模拟输出，所有新页面和内容机会等待人工审核。', {
      clusters,
      taskCandidates: clusters.map((cluster) => ({
        title: `确认聚类：${cluster.clusterName}`,
        taskType: cluster.recommendedAction === 'new_page_task' ? 'new_page_candidate' : 'content_engine_handoff',
        priority: 'p2',
        relatedKeywordIds: [cluster.primaryKeyword],
        sourceObjectIds: [cluster.clusterId],
        requiresHumanReview: true,
      })),
    }, ['确认聚类名称、主词和页面类型。'], [])
  }

  if (promptId === 'delivery-package-generation-v1') {
    return envelope(inputEnvelope, 'success', '已整理交付摘要模拟输出，未完成风险继续保留。', {
      deliverySummary: '本次交付包含审计摘要、页面修复候选、关键词审核状态和开放风险。',
      includedModules: ['SEO 诊断', '页面修复包', '关键词状态', '人工审核点'],
      openRisks: context.openRisks || [],
      humanReviewItems: ['确认导出范围', '确认敏感信息已排除', '确认未完成风险可见'],
    }, ['人工审查交付摘要和开放风险。'], [])
  }

  return envelope(inputEnvelope, 'partial', '已生成手动提示词包。该提示词当前只提供手动执行入口，等待用户粘贴外部结果并人工审查。', {
    manualExecutionRequired: true,
    expectedOutputFields: prompt.outputFields,
  }, prompt.humanReviewItems, [])
}

function envelope(inputEnvelope, status, summaryMarkdown, structuredOutput, humanReviewItems, taskCandidates) {
  return {
    runId: inputEnvelope.runId,
    promptId: inputEnvelope.promptId,
    status,
    summaryMarkdown,
    structuredOutput,
    humanReviewRequired: true,
    humanReviewItems,
    taskCandidates,
    warnings: [
      '当前仅为手动/模拟模式，没有调用真实 AI API。',
      '禁止写入 WordPress、发布内容、创建草稿或上传媒体。',
    ],
    sourceObjectIds: collectSourceObjectIds(inputEnvelope.inputContext),
    createdAt: inputEnvelope.createdAt,
  }
}

function summarizeInput(inputContext) {
  return {
    pages: inputContext.pageRecords?.length || inputContext.pageInventory?.length || 0,
    keywords: inputContext.keywordRecords?.length || 0,
    findings: inputContext.auditFindings?.length || 0,
    evidence: inputContext.evidenceRecords?.length || 0,
  }
}

function collectSourceObjectIds(inputContext) {
  return [
    ...(inputContext.pageRecords || []).map((item) => item.pageId),
    ...(inputContext.keywordRecords || []).map((item) => item.keywordId),
    ...(inputContext.auditFindings || []).map((item) => item.findingId),
    ...(inputContext.evidenceRecords || []).map((item) => item.evidenceId),
  ].filter(Boolean)
}
