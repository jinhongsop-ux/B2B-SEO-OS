import { randomUUID } from 'node:crypto'

export class SiteReadingError extends Error {
  constructor(statusCode, code, message) {
    super(message)
    this.statusCode = statusCode
    this.code = code
  }
}

export function toWorkspaceView(state) {
  return {
    project: state.project,
    siteConnection: state.siteConnection,
    latestSnapshot: state.siteReadSnapshots[0] || null,
    snapshotHistory: state.siteReadSnapshots.map((snapshot) => ({
      snapshotId: snapshot.snapshotId,
      snapshotAt: snapshot.snapshotAt,
      domain: snapshot.domain,
      pageCount: snapshot.pageCount,
      postCount: snapshot.postCount,
      productCount: snapshot.productCount,
      mediaCount: snapshot.mediaCount,
      mode: snapshot.mode,
    })),
    auditRuns: state.auditRuns,
    auditFindings: state.auditFindings,
    b2bContext: state.b2bContext,
    seedKeywordPlan: state.seedKeywordPlan,
    keywordImportBatches: state.keywordImportBatches,
    keywordCount: state.keywords.length,
    approvedKeywordCount: state.keywords.filter((kw) => kw.status === 'approved').length,
    keywordCleaningRuns: state.keywordCleaningRuns,
    artifacts: state.artifacts,
    taskPacks: state.taskPacks,
    externalArtifacts: state.externalArtifacts,
    ingestionRuns: state.ingestionRuns,
  }
}

export function saveProjectProfile(state, body) {
  const projectName = cleanText(body.projectName)
  const domain = normalizeDomain(body.domain)
  if (!projectName) {
    throw new SiteReadingError(400, 'invalid_project', '项目名称不能为空。')
  }
  if (!domain) {
    throw new SiteReadingError(400, 'invalid_project', '网站域名不能为空。')
  }

  const now = new Date().toISOString()
  state.project = {
    projectId: state.project?.projectId || createId('project'),
    projectName,
    domain,
    company: cleanText(body.company) || projectName,
    industry: cleanText(body.industry) || 'B2B 行业',
    targetMarkets: cleanList(body.targetMarkets),
    supplierIdentity: cleanText(body.supplierIdentity) || 'B2B 供应商',
    coreProducts: cleanList(body.coreProducts),
    targetCustomers: cleanList(body.targetCustomers),
    primaryConversionGoal: cleanText(body.primaryConversionGoal) || '提交询盘',
    currentStage: '站点接入与读取',
    safetyMode: 'read_only',
    createdAt: state.project?.createdAt || now,
    updatedAt: now,
  }

  state.siteConnection = {
    mode: 'local_mock_read_only',
    readOnly: true,
    storesCredentials: false,
    wordpressWritesEnabled: false,
    uploadsMedia: false,
    autoPublishes: false,
    domain,
    status: 'ready_for_mock_read',
    lastCheckedAt: now,
    notes: '本阶段只保存项目资料和站点域名，不保存 WordPress 密码或 API Key。',
  }

  addArtifact(state, {
    type: 'project_profile',
    title: '项目档案',
    stepLabel: '站点接入与读取',
    sourceId: state.project.projectId,
    route: '/project-center',
  })
  return state.project
}

export function createLocalSiteReadSnapshot(state) {
  if (!state.project?.projectName || !state.project?.domain) {
    throw new SiteReadingError(409, 'prerequisite_missing', '请先完成项目档案，再生成本地读取快照。')
  }

  const now = new Date().toISOString()
  const pages = buildPages(state.project, now)
  const snapshot = {
    snapshotId: createId('snapshot'),
    projectId: state.project.projectId,
    domain: state.project.domain,
    mode: 'local_mock_read_only',
    snapshotAt: now,
    pageCount: pages.filter((page) => page.type === 'page').length,
    postCount: pages.filter((page) => page.type === 'post').length,
    productCount: pages.filter((page) => page.type === 'product').length,
    mediaCount: 24,
    menuCount: 2,
    formCount: 2,
    seoFieldCount: 18,
    detectedPageTypes: ['首页', '产品线页面', '能力页面', '关于我们', '联系/RFQ', '资源文章'],
    detectedForms: ['Contact Form 7 - Contact', 'RFQ Form - Request Quote'],
    trustPages: ['/about-us/', '/quality/', '/factory-tour/'],
    seoFields: ['SEO Title', 'Meta Description', 'H1', 'Focus Keyword'],
    anomalies: ['3 个页面缺少 Meta Description', '2 个产品页面缺少询盘 CTA', '部分图片 ALT 为空'],
    pages,
    humanReviewItems: ['确认页面类型是否符合真实业务。', '确认读取结果仅为本地模拟快照。'],
  }
  state.siteReadSnapshots.unshift(snapshot)
  addArtifact(state, {
    type: 'site_read_snapshot',
    title: '站点读取快照',
    stepLabel: '站点接入与读取',
    sourceId: snapshot.snapshotId,
    route: '/project-center',
  })
  return snapshot
}

export function applyApprovedSiteReadSnapshot(state, snapshot, sourceId) {
  if (!snapshot?.pages?.length) {
    throw new SiteReadingError(409, 'cannot_advance', '站点读取结果缺少页面记录，不能进入下一阶段。')
  }
  state.siteReadSnapshots = state.siteReadSnapshots.filter((item) => item.snapshotId !== snapshot.snapshotId)
  state.siteReadSnapshots.unshift(snapshot)
  addArtifact(state, {
    type: 'site_read_snapshot',
    title: '外部智能体回填的站点读取快照',
    stepLabel: '站点接入与读取',
    sourceId: sourceId || snapshot.snapshotId,
    route: '/project-center',
  })
  return snapshot
}

function buildPages(project, now) {
  const product = project.coreProducts[0] || '核心产品'
  return [
    makePage(101, 'wp-home', 'page', '/', 'home', '首页', `${project.company} | ${project.supplierIdentity}`, `${project.company} 首页`, 720, now, ['RFQ Form']),
    makePage(102, 'wp-products', 'page', '/products/custom-metal-parts/', 'products', '产品线页面', product, product, 560, now, []),
    makePage(103, 'wp-capability', 'page', '/capabilities/oem-manufacturing/', 'capability', '能力页面', 'OEM 制造能力', 'OEM Manufacturing Capability', 640, now, []),
    makePage(104, 'wp-about', 'page', '/about-us/', 'about', '关于我们', '关于我们', 'About Us', 520, now, []),
    makePage(105, 'wp-contact', 'page', '/contact/', 'contact', '联系/RFQ', '联系我们', 'Request a Quote', 310, now, ['Contact Form 7 - Contact']),
    makePage(201, 'wp-resource', 'post', '/resources/how-to-choose-supplier/', 'resource', '资源文章', '如何选择供应商', 'How to Choose a Supplier', 980, now, []),
    makePage(301, 'wp-product-demo', 'product', '/product/demo-industrial-part/', 'demo-industrial-part', '产品详情', `${product} 样品`, product, 420, now, []),
  ]
}

function makePage(wpId, pageId, type, url, slug, pageType, title, h1, wordCount, now, formsDetected) {
  return {
    pageId,
    wpId,
    type,
    status: 'publish',
    url,
    slug,
    title,
    seoTitle: title,
    metaDescription: wordCount > 500 ? `${title} 的 B2B 页面摘要。` : '',
    h1,
    pageType,
    wordCount,
    primaryKeyword: null,
    suggestedPrimaryKeyword: null,
    auditIssueCount: 0,
    repairTaskCount: 0,
    internalLinkStatus: '待审计',
    modifiedAt: now,
    primaryCta: pageType === '联系/RFQ' ? '提交询盘' : 'Request a Quote',
    formsDetected,
    headings: [{ level: 1, text: h1 }],
  }
}

function addArtifact(state, input) {
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

function cleanText(value) {
  return String(value || '').trim()
}

function normalizeDomain(value) {
  const domain = cleanText(value)
  if (!domain) return ''
  return /^https?:\/\//i.test(domain) ? domain : `https://${domain}`
}

function createId(prefix) {
  return `${prefix}_${randomUUID().slice(0, 8)}`
}
