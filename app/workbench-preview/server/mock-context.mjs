const projectProfile = {
  projectId: 'proj_demo',
  projectName: '演示工业零部件供应商',
  domain: 'https://demo-b2b-site.com',
  platform: 'wordpress',
  siteType: 'factory_trading',
  targetMarkets: ['美国', '欧洲'],
  primaryConversionGoal: '提交询价',
  safetyMode: 'read_only',
}

const b2bContext = {
  companyIdentity: '工贸一体 OEM 金属零部件供应商',
  productLines: ['定制金属零件', '不锈钢紧固件', 'CNC 加工', '金属支架'],
  capabilities: ['OEM 制造', '表面处理', '质量检测', '出口包装'],
  claimBoundaries: [
    'MOQ 与交期必须由销售确认后才能使用。',
    '客户名称公开使用前必须匿名化处理。',
    '证书范围必须检查后才能发布。',
  ],
}

const pageRecords = [
  {
    pageId: 'wp-p-001',
    url: '/',
    pageType: 'home',
    title: '定制金属零件制造商',
    h1: '定制金属零件供应商',
    primaryCta: '提交询价',
  },
  {
    pageId: 'wp-p-003',
    url: '/products/custom-metal-parts/',
    pageType: 'product_line',
    title: '定制金属零件',
    h1: '定制金属零件',
    primaryCta: '联系销售',
  },
  {
    pageId: 'wp-p-008',
    url: '/capabilities/oem-manufacturing/',
    pageType: 'capability',
    title: 'OEM 制造能力',
    h1: '金属零部件 OEM 制造能力',
    primaryCta: '沟通 OEM 项目',
  },
]

const keywordRecords = [
  {
    keywordId: 'kw-001',
    keyword: 'custom metal parts manufacturer',
    volume: 2400,
    kd: 38,
    status: 'pending_review',
    aiIntent: '采购供应商',
    likelyPageType: 'home_or_product_line',
  },
  {
    keywordId: 'kw-003',
    keyword: 'oem metal fabrication services',
    volume: 1300,
    kd: 34,
    status: 'assigned_existing_page',
    assignedPageId: 'wp-p-008',
    aiIntent: '服务采购',
    likelyPageType: 'capability',
  },
  {
    keywordId: 'kw-012',
    keyword: 'metal stamping parts supplier',
    volume: 760,
    kd: 27,
    status: 'unused_valid',
    aiIntent: '供应商',
    likelyPageType: 'new_product_page',
  },
  {
    keywordId: 'kw-017',
    keyword: 'metal parts amazon',
    volume: 3200,
    kd: 48,
    status: 'rejected',
    aiIntent: '平台购物',
    likelyPageType: 'not_fit',
  },
]

const auditFindings = [
  {
    findingId: 'af-001',
    category: 'home_value_proposition_unclear',
    severity: 'high',
    url: '/',
    title: '首页价值表达不清晰',
    evidence: '首屏文案没有清楚说明产品范围、供应商身份和询价路径。',
    recommendedAction: '明确供应商身份，并增加面向询价的行动按钮。',
  },
  {
    findingId: 'af-004',
    category: 'missing_product_specs',
    severity: 'high',
    url: '/products/custom-metal-parts/',
    title: '产品线页面缺少规格细节',
    evidence: '页面有产品声明，但缺少材料、公差、表面处理、MOQ 或交期模块。',
    recommendedAction: '增加规格参数表，并把商业事实放入人工确认项。',
  },
]

const evidenceRecords = [
  {
    evidenceId: 'ev-001',
    name: '工厂车间照片组',
    confirmed: true,
    supportedClaims: ['工厂能力', 'OEM 生产环境'],
    riskNotes: '未确认前不要披露精确设备数量。',
  },
  {
    evidenceId: 'ev-004',
    name: 'ISO 9001 证书',
    confirmed: true,
    supportedClaims: ['质量管理体系'],
    riskNotes: '证书有效期和适用范围需要定期复核。',
  },
  {
    evidenceId: 'ev-008',
    name: '质检报告样本',
    confirmed: false,
    supportedClaims: ['批次检验', '尺寸检查'],
    riskNotes: '包含客户项目编号，必须脱敏。',
  },
]

export function buildInputContext(contextPreset = 'project_sample', promptId = '') {
  const base = {
    projectProfile,
    wordpressSnapshot: {
      snapshotAt: '2026-06-09T14:32:00Z',
      pageCount: 86,
      postCount: 42,
      productCount: 38,
      mediaCount: 128,
      mode: 'mock_demo',
    },
    b2bContext,
    keywordRecords: [],
    pageRecords,
    evidenceRecords,
    auditFindings,
  }

  if (contextPreset === 'keyword_sample' || promptId.includes('keyword')) {
    return {
      ...base,
      keywordRecords,
    }
  }

  if (contextPreset === 'audit_sample' || promptId.includes('audit')) {
    return {
      ...base,
      pageInventory: pageRecords,
      forms: [{ formId: 'rfq_form', url: '/request-a-quote/', fields: ['name', 'email', 'project_details'] }],
      seoMeta: pageRecords.map((page) => ({ url: page.url, title: page.title, metaDescription: '' })),
    }
  }

  if (contextPreset === 'page_repair_sample' || promptId.includes('page-repair')) {
    return {
      ...base,
      pageSnapshot: pageRecords[1],
      assignedKeywords: keywordRecords.filter((keyword) => keyword.status === 'assigned_existing_page'),
      auditFindings,
      evidenceRecords,
    }
  }

  if (contextPreset === 'delivery_sample' || promptId.includes('delivery')) {
    return {
      ...base,
      tasks: [
        { taskId: 'task-001', title: '修复首页价值表达', status: 'needs_review', priority: 'p1' },
        { taskId: 'task-004', title: '增加产品规格参数表', status: 'todo', priority: 'p1' },
      ],
      packages: [{ packageId: 'dp-002', name: '页面修复任务包 - 第一批', status: 'draft' }],
      qaResults: [],
      openRisks: ['MOQ 与交期需要人工确认。', '质检报告样本必须先脱敏。'],
    }
  }

  return base
}
