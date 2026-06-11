import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  Archive,
  ArrowRight,
  Bot,
  BookOpen,
  Boxes,
  BriefcaseBusiness,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  Cpu,
  Database,
  Download,
  Eye,
  ExternalLink,
  FileArchive,
  FileSpreadsheet,
  FileText,
  Filter,
  Gauge,
  Home,
  Layers3,
  Library,
  Link2,
  Lock,
  Map,
  PackageCheck,
  PanelRightOpen,
  PlayCircle,
  RefreshCw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  Wrench,
  X,
} from 'lucide-react'
import {
  cancelAgentRun,
  createAgentRun,
  fetchAiCallRuns,
  fetchAiSettings,
  fetchHealth,
  fetchPrompt,
  fetchPrompts,
  fetchRun,
  fetchRuns,
  generateAiText,
  reviewAgentRun,
  saveAiSettings,
  testAiApiConnection,
} from './api/aiWorkbench'
import {
  createSiteReadSnapshot,
  fetchWorkspace,
  generateTaskPack,
  reviewIngestionRun,
  runArtifactIngestion,
  saveProjectProfile,
  submitArtifact,
  type ProjectProfileInput,
} from './api/workspace'
import { mockPages } from './mock/pages'
import { mockProject, mockSnapshot } from './mock/project'
import {
  auditFindings,
  cannibalizationRisks,
  cleaningStats,
  importFiles,
  mockAssets,
  mockClusters,
  mockContentOpportunities,
  mockDeliveryPackages,
  mockEvidence,
  mockKeywords,
  mockPromptContracts,
  mockTasks,
  workflowSteps,
} from './mock/workbench'
import Tutorial from './Tutorial'
import type { AgentRun, AgentTaskPack, AiCallRun, AiMode, AiProvider, AiSettings, AuditFinding, BackendHealth, ExternalArtifact, HumanReviewDecision, IngestionRun, Keyword, PromptDefinition, Task, WpPage, WorkflowState, WorkspaceState } from './types'

type Tone = 'default' | 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray'
type DrawerAction = { label: string; tone?: Tone; onClick?: () => void; icon?: ReactNode }
type DrawerState = { title: string; eyebrow?: string; description?: string; content: ReactNode; actions?: DrawerAction[] }
type ModalState = {
  title: string
  description?: string
  content: ReactNode
  primaryLabel?: string
  onPrimary?: () => void
}
type ConfirmState = { title: string; description: string; confirmLabel: string; onConfirm: () => void }
type ToastState = { id: number; message: string; tone: Tone }
type KeywordTab = 'pages' | 'library' | 'import' | 'review' | 'allocation' | 'unused' | 'cluster' | 'links'

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ')

const splitListInput = (value: string) => value.replace(/\uFF0C|\u3001/g, ',').split(/[,\n]/).map((item) => item.trim()).filter(Boolean)

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('zh-CN', { hour12: false })
}

const routeGroups = [
  {
    title: '一、项目与数据',
    items: [
      { path: '/overview', label: '项目总览', icon: Home },
      { path: '/project-center', label: '项目中心 / 数据源中心', icon: Database },
    ],
  },
  {
    title: '二、诊断与修复',
    items: [
      { path: '/audit', label: 'SEO 诊断', icon: Gauge },
      { path: '/keywords', label: '页面与关键词', icon: Map },
      { path: '/tasks', label: '任务中心', icon: ClipboardList },
    ],
  },
  {
    title: '三、B2B 资产',
    items: [
      { path: '/trust', label: '供应商可信度', icon: Building2 },
      { path: '/assets', label: '资料与素材库', icon: Library },
    ],
  },
  {
    title: '四、内容与交付',
    items: [
      { path: '/content', label: '内容运营', icon: FileText },
      { path: '/delivery', label: '交付中心', icon: PackageCheck },
    ],
  },
  {
    title: '五、AI 与系统',
    items: [
      { path: '/ai-workbench', label: '智能体任务中心', icon: Bot },
      { path: '/settings', label: '设置 / 系统状态', icon: Settings },
    ],
  },
]

const keywordTabs: Array<{ id: KeywordTab; label: string }> = [
  { id: 'pages', label: '页面地图' },
  { id: 'library', label: '关键词总库' },
  { id: 'import', label: 'CSV 导入与清洗' },
  { id: 'review', label: '人工审核' },
  { id: 'allocation', label: '关键词分配' },
  { id: 'unused', label: '未使用词池' },
  { id: 'cluster', label: '超级聚类' },
  { id: 'links', label: '内链与蚕食' },
]

const navigationGroups = [
  {
    title: '一、项目与数据',
    items: [
      { path: '/overview', label: '项目总览', icon: Home },
      { path: '/project-center', label: '项目中心 / 数据源中心', icon: Database },
    ],
  },
  {
    title: '二、诊断与修复',
    items: [
      { path: '/audit', label: 'SEO 诊断', icon: Gauge },
      { path: '/keywords', label: '页面与关键词', icon: Map },
      { path: '/tasks', label: '任务中心', icon: ClipboardList },
    ],
  },
  {
    title: '三、B2B 资产',
    items: [
      { path: '/trust', label: '供应商可信度', icon: Building2 },
      { path: '/assets', label: '资料与素材库', icon: Library },
    ],
  },
  {
    title: '四、内容与交付',
    items: [
      { path: '/content', label: '内容运营', icon: FileText },
      { path: '/delivery', label: '交付中心', icon: PackageCheck },
    ],
  },
  {
    title: '五、AI 与系统',
    items: [
      { path: '/ai-workbench', label: '智能体任务中心', icon: Bot },
      { path: '/settings', label: '设置 / 系统状态', icon: Settings },
    ],
  },
]

const operatingStats = {
  importedCsv: 3,
  totalKeywords: 4286,
  cleanedKeywords: 2940,
  pendingReview: 1120,
  assignedToPages: 380,
  unusedKeywords: 620,
  repairPages: 18,
  generatedRepairPackages: 5,
  contentHandoffTasks: 12,
}

const sourceLabels: Record<string, string> = {
  audit_fix: '审计修复',
  keyword_review: '关键词审核',
  keyword_allocation: '关键词分配',
  page_repair: '页面修复',
  trust_evidence: '证据补充',
  content_handoff: '内容交接',
  qa_revision: '质量审查修改',
  delivery_export: '交付导出',
  system_check: '系统检查',
}

const taskStatusLabels: Record<Task['status'], string> = {
  todo: '未开始',
  in_progress: '进行中',
  needs_review: '等待人工确认',
  approved: '已确认',
  done: '已完成',
  blocked: '等待资料',
  cancelled: '已忽略',
}

const keywordStatusLabels: Record<Keyword['status'], string> = {
  raw_imported: '原始导入',
  script_cleaned: '脚本清洗',
  ai_cleaned: 'AI 清洗',
  pending_review: '待审核',
  approved: '已通过',
  rejected: '已排除',
  duplicate_intent: '重复意图',
  hold: '保留观察',
  assigned_existing_page: '已分配到现有页面',
  unused_valid: '未使用有效词',
  super_clustered: '已超级聚类',
}

const promptCategoryLabels: Record<string, string> = {
  site_reading: '网站读取',
  audit: '前台审计',
  context: 'B2B 上下文',
  keyword: '关键词',
  page_repair: '页面修复',
  content: '内容交接',
  qa: '质量审查',
  delivery: '交付报告',
}

const promptStatusLabels: Record<string, string> = {
  active: '可用',
  draft: '草稿',
  deprecated: '已停用',
}

const agentRunStatusLabels: Record<string, string> = {
  queued: '排队中',
  running: '运行中',
  waiting_for_human: '等待人工审核',
  done: '已完成',
  failed: '未通过',
  cancelled: '已取消',
}

const reviewDecisionLabels: Record<string, string> = {
  pending: '待审核',
  approved: '已批准',
  rejected: '已驳回',
  revision_needed: '需要修订',
}

const modeLabels: Record<string, string> = {
  manual_mock: '手动/模拟模式',
}

const contextPresetLabels: Record<string, string> = {
  project_sample: '项目样本上下文',
  keyword_sample: '关键词样本上下文',
  audit_sample: '审计样本上下文',
  page_repair_sample: '页面修复样本上下文',
  delivery_sample: '交付样本上下文',
}

const enumValueLabels: Record<string, string> = {
  assign: '分配到现有页面',
  do_not_assign: '不分配',
  new_page: '新建页面',
  content_engine: '进入内容交接',
  hold: '暂缓观察',
  low: '低',
  medium: '中',
  high: '高',
}

const promptFieldLabels: Record<string, string> = {
  projectProfile: '项目档案',
  wordpressSnapshot: 'WordPress 只读快照',
  pages: '页面列表',
  posts: '文章列表',
  products: '产品列表',
  menus: '菜单结构',
  media: '媒体素材',
  siteStructureSummary: '网站结构摘要',
  detectedPageTypes: '识别出的页面类型',
  importantPages: '重要页面',
  missingCommonPages: '缺失的常见页面',
  navigationIssues: '导航问题',
  nextActions: '下一步建议',
  pageInventory: '页面清单',
  forms: '表单清单',
  seoMeta: 'SEO 元信息',
  overallAssessment: '整体评估',
  findings: '问题发现',
  taskCandidates: '任务候选',
  uploadedDocs: '上传资料',
  manualCompanyInfo: '人工录入的公司信息',
  existingWebsiteText: '现有网站文本',
  companyProfile: '公司档案',
  productLines: '产品线',
  capabilities: '能力说明',
  trustEvidence: '信任证据',
  claimBoundaries: '声明边界',
  missingInfo: '缺失信息',
  humanReviewItems: '人工确认项',
  b2bContext: 'B2B 上下文',
  seedGroups: '种子词组',
  competitorResearchDirections: '竞品调研方向',
  manualMiningChecklist: '人工挖词清单',
  keywordRecords: '关键词记录',
  cleanedKeywords: '清洗后的关键词',
  warnings: '警告',
  keyword: '关键词',
  candidatePages: '候选页面',
  auditFindings: '审计问题',
  recommendation: '分配建议',
  recommendedUrl: '推荐页面地址',
  reason: '理由',
  riskNotes: '风险提示',
  cannibalizationRisk: '关键词蚕食风险',
  humanDecisionRequired: '需要人工决策',
  unusedValidKeywords: '未使用有效关键词',
  existingPageMap: '现有页面地图',
  linkMap: '内链地图',
  clusters: '聚类结果',
  pageSnapshot: '页面快照',
  assignedKeywords: '已审核分配关键词',
  evidenceRecords: '证据记录',
  repairPackage: '页面修复包',
  titleSuggestion: '标题建议',
  metaDescriptionSuggestion: 'Meta 描述建议',
  modulesToAdd: '建议新增模块',
  internalLinksToAdd: '建议新增内链',
  cluster: '关键词聚类',
  keywords: '关键词集合',
  evidence: '证据',
  brandBoundaries: '品牌表达边界',
  handoffPackage: '内容交接包',
  qaRules: '质量审查规则',
  blockedReasons: '阻塞原因',
  draftOrPackage: '草稿或交付包',
  evidenceLibrary: '证据库',
  forbiddenClaims: '禁用声明',
  linkTargets: '内链目标',
  qaFindings: '质量问题',
  revisionTasks: '修订任务',
  approvedRuns: '已批准执行记录',
  taskSummary: '任务摘要',
  keywordStatus: '关键词状态',
  repairPackages: '修复包',
  openRisks: '未关闭风险',
  deliverySummary: '交付摘要',
  includedModules: '包含模块',
  exportChecklist: '导出检查清单',
  url: '页面地址',
  pageType: '页面类型',
  confidence: '置信度',
  findingId: '问题编号',
  category: '问题类别',
  severity: '严重程度',
  title: '标题',
  description: '说明',
  recommendedAction: '建议动作',
  requiresHumanReview: '需要人工审核',
  taskType: '任务类型',
  priority: '优先级',
  relatedUrl: '关联页面地址',
  sourceObjectIds: '来源对象编号',
  seedGroupId: '种子词组编号',
  name: '名称',
  seeds: '种子词',
  toolInstructions: '工具操作说明',
  keywordId: '关键词编号',
  isRelevant: '是否相关',
  likelyIntent: '可能搜索意图',
  likelyPageType: '可能页面类型',
  isB2CTerm: '是否 B2C 词',
  isPlatformTerm: '是否平台词',
  cleaningReason: '清洗理由',
  aiConfidence: 'AI 置信度',
  recommendedPageType: '推荐页面类型',
  clusterId: '聚类编号',
  clusterName: '聚类名称',
  primaryKeyword: '主关键词',
  secondaryKeywords: '辅助关键词',
  relatedKeywordIds: '关联关键词编号',
  claim: '待确认声明',
}

function labelFromMap(value: string | undefined, labels: Record<string, string>) {
  if (!value) return ''
  return labels[value] || value
}

function fieldLabel(field: string) {
  const label = promptFieldLabels[field]
  return label ? `${label}（${field}）` : field
}

function fieldLabels(fields: string[] = []) {
  return fields.map(fieldLabel)
}

function schemaValueLabel(rawValue: unknown) {
  const value = String(rawValue)
  if (value === 'string') return '字符串'
  if (value === 'string[]') return '字符串数组'
  if (value === 'object') return '对象'
  if (value === 'object[]') return '对象数组'
  if (value === 'boolean') return '布尔值'
  if (value.includes(' | ')) {
    return `可选值：${value.split(' | ').map((item) => {
      const trimmed = item.trim()
      const label = enumValueLabels[trimmed]
      return label ? `${label}（${trimmed}）` : trimmed
    }).join('、')}`
  }
  const arrayObjectMatch = value.match(/^Array<\{(.+)\}>$/)
  if (arrayObjectMatch) {
    const fields = arrayObjectMatch[1].split(',').map((field) => fieldLabel(field.trim()))
    return `对象数组，元素字段：${fields.join('、')}`
  }
  return value
}

function schemaSummaryWithChineseLabels(schema: Record<string, unknown> = {}) {
  return Object.fromEntries(Object.entries(schema).map(([key, value]) => [fieldLabel(key), schemaValueLabel(value)]))
}

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [keywords, setKeywords] = useState<Keyword[]>(mockKeywords)
  const [keywordTab, setKeywordTab] = useState<KeywordTab>('pages')
  const [selectedReviewKeywordId, setSelectedReviewKeywordId] = useState('kw-001')
  const [selectedAllocationPageId, setSelectedAllocationPageId] = useState('wp-p-003')
  const [drawer, setDrawer] = useState<DrawerState | null>(null)
  const [modal, setModal] = useState<ModalState | null>(null)
  const [confirm, setConfirm] = useState<ConfirmState | null>(null)
  const [toasts, setToasts] = useState<ToastState[]>([])
  const [auditView, setAuditView] = useState<'table' | 'page' | 'category'>('table')
  const [auditFilter, setAuditFilter] = useState<'all' | 'high' | 'evidence'>('all')
  const [keywordSearch, setKeywordSearch] = useState('')
  const [keywordFilter, setKeywordFilter] = useState<'all' | 'pending' | 'unused' | 'assigned'>('all')
  const [readTimestamp, setReadTimestamp] = useState('2026-06-09 14:32')
  const [keywordLibraryCount, setKeywordLibraryCount] = useState(operatingStats.cleanedKeywords)
  const [systemCheckDone, setSystemCheckDone] = useState(false)
  const [workspace, setWorkspace] = useState<WorkspaceState | null>(null)
  const [workflow, setWorkflow] = useState<WorkflowState | null>(null)
  const [workspaceLoading, setWorkspaceLoading] = useState(true)
  const [workspaceBusy, setWorkspaceBusy] = useState(false)
  const [workspaceError, setWorkspaceError] = useState('')
  const [projectDraft, setProjectDraft] = useState<ProjectProfileInput>({
    projectName: '测试工业供应商',
    domain: 'example-b2b.com',
    company: '测试工业有限公司',
    industry: '工业零部件',
    targetMarkets: ['美国', '欧洲'],
    coreProducts: ['CNC 零件', '金属冲压件'],
    targetCustomers: ['采购经理', 'OEM 工程团队'],
    primaryConversionGoal: '提交询盘',
  })
  const [siteReadAgent, setSiteReadAgent] = useState('openclaw')
  const [siteReadArtifactText, setSiteReadArtifactText] = useState('')

  const metrics = useMemo(() => {
    const pending = keywords.filter((item) => item.status === 'pending_review').length
    const assigned = keywords.filter((item) => item.status === 'assigned_existing_page').length
    const unused = keywords.filter((item) => item.status === 'unused_valid').length
    const highTasks = tasks.filter((task) => task.priority === 'p0' || task.priority === 'p1')
    return {
      pending,
      assigned,
      unused,
      highTasks,
      waitingReview: tasks.filter((task) => task.status === 'needs_review').length,
      handoff: mockContentOpportunities.filter((item) => item.status === 'handoff_ready' || item.status === 'brief_pending').length,
      completedTasks: tasks.filter((task) => task.status === 'done').length,
    }
  }, [keywords, tasks])

  const visibleAuditFindings = auditFindings.filter((finding) => {
    if (auditFilter === 'high') return finding.severity === 'high' || finding.severity === 'critical'
    if (auditFilter === 'evidence') return finding.requiresEvidence
    return true
  })

  const selectedReviewKeyword = keywords.find((keyword) => keyword.keywordId === selectedReviewKeywordId) ?? keywords[0]
  const selectedAllocationPage = mockPages.find((page) => page.pageId === selectedAllocationPageId) ?? mockPages[0]
  const siteReadTaskPack = workspace?.taskPacks?.find((taskPack) => taskPack.workflowStepId === 'site_connection_reading' && taskPack.taskType === 'site_read') ?? null
  const siteReadArtifact = siteReadTaskPack
    ? workspace?.externalArtifacts?.find((artifact) => artifact.taskPackId === siteReadTaskPack.taskPackId) ?? null
    : null
  const siteReadIngestion = siteReadArtifact
    ? workspace?.ingestionRuns?.find((run) => run.artifactId === siteReadArtifact.artifactId) ?? null
    : null

  useEffect(() => {
    void refreshWorkspace()
  }, [])

  useEffect(() => {
    if (!workspace?.project) return
    setProjectDraft({
      projectName: workspace.project.projectName,
      domain: workspace.project.domain,
      company: workspace.project.company,
      industry: workspace.project.industry,
      targetMarkets: workspace.project.targetMarkets,
      coreProducts: workspace.project.coreProducts,
      targetCustomers: workspace.project.targetCustomers,
      primaryConversionGoal: workspace.project.primaryConversionGoal,
    })
  }, [workspace?.project])

  async function refreshWorkspace() {
    try {
      const response = await fetchWorkspace()
      setWorkspace(response.workspace)
      setWorkflow(response.workflow)
      setWorkspaceError('')
      if (response.workspace.latestSnapshot?.snapshotAt) {
        setReadTimestamp(formatDateTime(response.workspace.latestSnapshot.snapshotAt))
      }
    } catch (error) {
      setWorkspaceError(error instanceof Error ? error.message : '本地后端暂时不可用。')
    } finally {
      setWorkspaceLoading(false)
    }
  }

  async function saveProjectFromUi() {
    setWorkspaceBusy(true)
    try {
      const response = await saveProjectProfile(projectDraft)
      setWorkspace(response.workspace)
      setWorkflow(response.workflow)
      setWorkspaceError('')
      showToast('项目档案已保存到本地工作区。')
    } catch (error) {
      const message = error instanceof Error ? error.message : '项目档案保存失败。'
      setWorkspaceError(message)
      showToast(message, 'red')
    } finally {
      setWorkspaceBusy(false)
    }
  }

  async function createSnapshotFromUi() {
    setWorkspaceBusy(true)
    try {
      const response = await createSiteReadSnapshot()
      setWorkspace(response.workspace)
      setWorkflow(response.workflow)
      setReadTimestamp(formatDateTime(response.snapshot.snapshotAt))
      setWorkspaceError('')
      showToast('本地只读站点快照已生成。')
    } catch (error) {
      const message = error instanceof Error ? error.message : '生成站点快照失败。'
      setWorkspaceError(message)
      showToast(message, 'red')
    } finally {
      setWorkspaceBusy(false)
    }
  }

  async function createSiteReadTaskPackFromUi() {
    setWorkspaceBusy(true)
    try {
      const response = await generateTaskPack({
        workflowStepId: 'site_connection_reading',
        taskType: 'site_read',
        targetAgent: siteReadAgent,
        userInput: '请读取公开前台页面，并输出 site_read_snapshot_v1 JSON。',
      })
      setWorkspace(response.workspace)
      setWorkflow(response.workflow)
      setWorkspaceError('')
      showToast('站点读取任务包已生成。')
    } catch (error) {
      const message = error instanceof Error ? error.message : '生成任务包失败。'
      setWorkspaceError(message)
      showToast(message, 'red')
    } finally {
      setWorkspaceBusy(false)
    }
  }

  async function submitSiteReadArtifactFromUi() {
    if (!siteReadTaskPack) {
      showToast('请先生成站点读取任务包。', 'orange')
      return
    }
    setWorkspaceBusy(true)
    try {
      const response = await submitArtifact({
        taskPackId: siteReadTaskPack.taskPackId,
        sourceAgent: siteReadAgent,
        format: 'json',
        rawContent: siteReadArtifactText,
      })
      setWorkspace(response.workspace)
      setWorkflow(response.workflow)
      setWorkspaceError('')
      showToast('外部智能体回填已保存。')
    } catch (error) {
      const message = error instanceof Error ? error.message : '保存回填失败。'
      setWorkspaceError(message)
      showToast(message, 'red')
    } finally {
      setWorkspaceBusy(false)
    }
  }

  async function runSiteReadIngestionFromUi() {
    if (!siteReadArtifact) {
      showToast('请先回填外部智能体输出。', 'orange')
      return
    }
    setWorkspaceBusy(true)
    try {
      const response = await runArtifactIngestion({ artifactId: siteReadArtifact.artifactId })
      setWorkspace(response.workspace)
      setWorkflow(response.workflow)
      setWorkspaceError('')
      showToast('程序内 AI 已完成回填解析校验。')
    } catch (error) {
      const message = error instanceof Error ? error.message : '解析校验失败。'
      setWorkspaceError(message)
      showToast(message, 'red')
    } finally {
      setWorkspaceBusy(false)
    }
  }

  async function reviewSiteReadIngestionFromUi(decision: 'approved' | 'rejected') {
    if (!siteReadIngestion) {
      showToast('请先完成 AI 解析校验。', 'orange')
      return
    }
    setWorkspaceBusy(true)
    try {
      const response = await reviewIngestionRun(siteReadIngestion.ingestionRunId, {
        decision,
        reviewer: 'operator',
        notes: decision === 'approved' ? '站点读取结果已人工确认，可以进入网站现状审计。' : '站点读取结果暂不采用，保留原始回填记录。',
      })
      setWorkspace(response.workspace)
      setWorkflow(response.workflow)
      if (response.workspace.latestSnapshot?.snapshotAt) {
        setReadTimestamp(formatDateTime(response.workspace.latestSnapshot.snapshotAt))
      }
      setWorkspaceError('')
      showToast(decision === 'approved' ? '已批准入库，流程进入网站现状审计。' : '已驳回回填结果。', decision === 'approved' ? 'green' : 'orange')
    } catch (error) {
      const message = error instanceof Error ? error.message : '人工审核操作失败。'
      setWorkspaceError(message)
      showToast(message, 'red')
    } finally {
      setWorkspaceBusy(false)
    }
  }

  async function copySiteReadTaskPackFromUi() {
    if (!siteReadTaskPack) {
      showToast('请先生成站点读取任务包。', 'orange')
      return
    }
    await navigator.clipboard?.writeText(siteReadTaskPack.promptMarkdown)
    showToast('任务包已复制，可以粘贴给外部智能体。')
  }

  function fillSampleSiteReadArtifact() {
    setSiteReadArtifactText(JSON.stringify({
      schemaVersion: 'site_read_snapshot_v1',
      domain: workspace?.project?.domain || 'https://example-b2b.com',
      pages: [
        {
          url: '/',
          title: workspace?.project?.company || '测试工业有限公司',
          pageType: '首页',
          type: 'page',
          h1: workspace?.project?.company || '测试工业有限公司',
          metaDescription: '工业零部件供应商首页，包含产品、能力和询盘入口。',
          wordCount: 820,
          formsDetected: ['RFQ Form'],
        },
        {
          url: '/products/custom-metal-parts/',
          title: 'Custom Metal Parts',
          pageType: '产品线页面',
          type: 'page',
          h1: 'Custom Metal Parts',
          metaDescription: '定制金属零部件产品页面。',
          wordCount: 640,
          formsDetected: [],
        },
      ],
      menus: ['Main Menu'],
      forms: ['RFQ Form'],
      seoFields: ['SEO Title', 'Meta Description', 'H1'],
      anomalies: ['部分图片 ALT 为空', '产品页 CTA 不够明确'],
      humanReviewItems: ['确认页面列表是否覆盖真实核心页面。'],
    }, null, 2))
  }

  function updateProjectField(field: 'projectName' | 'domain' | 'company' | 'industry' | 'primaryConversionGoal', value: string) {
    setProjectDraft((current) => ({ ...current, [field]: value }))
  }

  function updateProjectList(field: 'targetMarkets' | 'coreProducts' | 'targetCustomers', value: string) {
    setProjectDraft((current) => ({ ...current, [field]: splitListInput(value) }))
  }

  function showToast(message: string, tone: Tone = 'green') {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setToasts((current) => [...current, { id, message, tone }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 3200)
  }

  function openModalSteps(title: string, description: string, steps: string[], onPrimary?: () => void) {
    setModal({
      title,
      description,
      content: (
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-semibold text-primary-700 ring-1 ring-gray-200">
                {index + 1}
              </span>
              <span className="text-sm text-gray-800">{step}</span>
              <CheckCircle2 className="ml-auto h-4 w-4 text-success-600" />
            </div>
          ))}
          <p className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-800">
            当前为本地前端原型，只改变演示状态，不连接真实网站、不写入 WordPress。
          </p>
        </div>
      ),
      primaryLabel: '完成模拟',
      onPrimary,
    })
  }

  function addGeneratedTask(seed: Pick<Task, 'title' | 'taskType' | 'source' | 'priority' | 'description'> & Partial<Task>) {
    const task: Task = {
      taskId: `task-${Date.now()}`,
      taskType: seed.taskType,
      title: seed.title,
      description: seed.description,
      source: seed.source,
      sourceObjectIds: seed.sourceObjectIds ?? [],
      priority: seed.priority,
      priorityScore: seed.priorityScore ?? 70,
      status: 'todo',
      relatedUrl: seed.relatedUrl ?? null,
      relatedPageId: seed.relatedPageId ?? null,
      relatedKeywordIds: seed.relatedKeywordIds ?? [],
      relatedEvidenceIds: seed.relatedEvidenceIds ?? [],
      requiresHumanReview: seed.requiresHumanReview ?? true,
      blockedReason: '',
      acceptanceCriteria: seed.acceptanceCriteria ?? ['人工确认后进入下一步', '只生成本地建议', '不写入 WordPress'],
      nextAction: seed.nextAction ?? '打开任务详情',
      whyItMatters: seed.whyItMatters ?? '这个任务来自当前工作流，需要人工确认后继续。',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setTasks((current) => [task, ...current])
    showToast('已生成演示任务，任务中心已更新')
    return task
  }

  function updateTaskStatus(taskId: string, status: Task['status']) {
    setTasks((current) =>
      current.map((task) =>
        task.taskId === taskId ? { ...task, status, updatedAt: new Date().toISOString() } : task,
      ),
    )
    showToast(`任务状态已更新为「${taskStatusLabels[status]}」`, status === 'done' ? 'green' : 'blue')
  }

  function updateKeywordStatus(keywordId: string, status: Keyword['status'], extras: Partial<Keyword> = {}) {
    setKeywords((current) =>
      current.map((keyword) =>
        keyword.keywordId === keywordId ? { ...keyword, status, ...extras } : keyword,
      ),
    )
    showToast(`关键词已更新为「${keywordStatusLabels[status]}」`)
  }

  function navigateKeywordTab(tab: KeywordTab) {
    setKeywordTab(tab)
    navigate('/keywords')
  }

  function openTaskDrawer(task: Task) {
    setDrawer({
      title: task.title,
      eyebrow: `${sourceLabels[task.taskType] ?? task.taskType} · ${task.source}`,
      description: task.description,
      content: (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <PriorityBadge priority={task.priority} />
            <StatusBadge tone={statusTone(task.status)}>{taskStatusLabels[task.status]}</StatusBadge>
            {task.requiresHumanReview && <StatusBadge tone="orange">需要人工确认</StatusBadge>}
          </div>
          <InfoGrid
            items={[
              ['关联页面', task.relatedUrl ?? '未绑定页面'],
              ['关联关键词', task.relatedKeywordIds.length ? task.relatedKeywordIds.join(', ') : '无'],
              ['关联证据', task.relatedEvidenceIds.length ? task.relatedEvidenceIds.join(', ') : '无'],
              ['下一步动作', task.nextAction],
            ]}
          />
          <ContentBlock title="为什么要做">{task.whyItMatters}</ContentBlock>
          <ListBlock title="建议步骤" items={['查看关联对象', '确认风险和证据边界', '生成或更新本地交付包', '人工确认后再进入下一步']} />
          <ListBlock title="验收标准" items={task.acceptanceCriteria} />
          {task.blockedReason && <ContentBlock title="当前阻塞">{task.blockedReason}</ContentBlock>}
        </div>
      ),
      actions: [
        { label: '开始处理', icon: <PlayCircle className="h-4 w-4" />, onClick: () => updateTaskStatus(task.taskId, 'in_progress') },
        { label: '标记等待资料', tone: 'orange', icon: <Clock3 className="h-4 w-4" />, onClick: () => updateTaskStatus(task.taskId, 'blocked') },
        ...(task.relatedPageId
          ? [{ label: '查看关联页面', tone: 'blue' as Tone, icon: <FileText className="h-4 w-4" />, onClick: () => {
            const page = mockPages.find((item) => item.pageId === task.relatedPageId)
            if (page) openPageDrawer(page)
          } }]
          : []),
        ...(task.relatedKeywordIds.length
          ? [{ label: '查看关联关键词', tone: 'blue' as Tone, icon: <FileSpreadsheet className="h-4 w-4" />, onClick: () => {
            const keyword = keywords.find((item) => item.keywordId === task.relatedKeywordIds[0])
            if (keyword) openKeywordDrawer(keyword)
          } }]
          : []),
        {
          label: '标记完成',
          tone: 'green',
          icon: <Check className="h-4 w-4" />,
          onClick: () =>
            setConfirm({
              title: '确认完成这个任务？',
              description: '原型只会更新本地演示状态，不会触发任何真实发布或写入。',
              confirmLabel: '确认完成',
              onConfirm: () => updateTaskStatus(task.taskId, 'done'),
            }),
        },
      ],
    })
  }

  function openAuditDrawer(finding: AuditFinding) {
    setDrawer({
      title: finding.title,
      eyebrow: `${finding.category} · ${finding.url}`,
      description: finding.description,
      content: (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <SeverityBadge severity={finding.severity} />
            {finding.requiresKeywordData && <StatusBadge tone="blue">等待关键词分配后补充修复建议</StatusBadge>}
            {finding.requiresEvidence && <StatusBadge tone="orange">需要证据</StatusBadge>}
          </div>
          <ContentBlock title="当前观察">{finding.evidence}</ContentBlock>
          <ContentBlock title="为什么这是问题">{finding.impact}</ContentBlock>
          <ContentBlock title="建议修复方向">{finding.recommendedAction}</ContentBlock>
          <InfoGrid
            items={[
              ['影响页面', finding.url],
              ['是否关联关键词', finding.requiresKeywordData ? '是，需要等待审核分配' : '否'],
              ['是否需要证据', finding.requiresEvidence ? '是' : '否'],
              ['是否可生成任务', finding.canCreateTask ? '可生成任务草稿' : '仅记录'],
            ]}
          />
        </div>
      ),
      actions: [
        {
          label: '生成任务',
          icon: <ClipboardList className="h-4 w-4" />,
          onClick: () =>
            addGeneratedTask({
              title: finding.title,
              description: finding.recommendedAction,
              source: 'SEO 审计',
              taskType: 'audit_fix',
              priority: finding.severity === 'high' || finding.severity === 'critical' ? 'p1' : 'p2',
              relatedUrl: finding.url,
              relatedPageId: finding.pageId,
              sourceObjectIds: [finding.findingId],
              requiresHumanReview: finding.requiresHumanReview,
            }),
        },
        { label: '进入任务中心', tone: 'blue', icon: <ArrowRight className="h-4 w-4" />, onClick: () => navigate('/tasks') },
      ],
    })
  }

  function openPageDrawer(page: WpPage) {
    const pageKeywords = keywords.filter((keyword) => keyword.assignedPageId === page.pageId)
    const candidates = keywords.filter((keyword) => keyword.aiPageType.includes(page.pageType.split(' ')[0])).slice(0, 4)
    const relatedFindings = auditFindings.filter((finding) => finding.pageId === page.pageId)
    setDrawer({
      title: page.title,
      eyebrow: `${page.pageType} · ${page.url}`,
      description: '页面详情只展示读取快照和本地建议，不会修改 WordPress 页面。',
      content: (
        <div className="space-y-5">
          <InfoGrid
            items={[
              ['SEO 标题', page.seoTitle],
              ['Meta 描述', page.metaDescription || '缺失'],
              ['H1', page.h1],
              ['当前主关键词', page.primaryKeyword ?? '未设置'],
              ['建议主关键词', page.suggestedPrimaryKeyword ?? '暂无'],
              ['内链状态', page.internalLinkStatus],
            ]}
          />
          <ListBlock title="当前内容结构摘要" items={page.headings.map((heading) => `H${heading.level} ${heading.text}`)} />
          <ListBlock
            title="当前关联关键词"
            items={pageKeywords.length ? pageKeywords.map((keyword) => keyword.keyword) : ['暂无已分配关键词']}
          />
          <ListBlock
            title="可分配关键词候选"
            items={candidates.length ? candidates.map((keyword) => `${keyword.keyword} · ${keyword.aiIntent}`) : ['暂无候选，需要先审核关键词']}
          />
          <ListBlock
            title="不建议植入关键词"
            items={keywords.filter((keyword) => keyword.status === 'rejected').slice(0, 3).map((keyword) => `${keyword.keyword} · ${keyword.cleaningReason}`)}
          />
          <ListBlock title="审计问题" items={relatedFindings.map((finding) => finding.title)} />
        </div>
      ),
      actions: [
        { label: '查看关键词分配', icon: <Map className="h-4 w-4" />, onClick: () => navigateKeywordTab('allocation') },
        {
          label: '生成页面修复任务',
          tone: 'blue',
          icon: <Wrench className="h-4 w-4" />,
          onClick: () =>
            addGeneratedTask({
              title: `生成 ${page.title} 页面修复包`,
              description: `基于审计问题、已分配关键词和证据库，为 ${page.url} 生成本地修复包。`,
              source: '页面地图',
              taskType: 'page_repair',
              priority: page.auditIssueCount > 2 ? 'p1' : 'p2',
              relatedUrl: page.url,
              relatedPageId: page.pageId,
            }),
        },
      ],
    })
  }

  function openKeywordDrawer(keyword: Keyword) {
    setDrawer({
      title: keyword.keyword,
      eyebrow: `${keyword.sourceTool} · ${keyword.sourceFile}`,
      description: '关键词必须人工审核后才能进入页面修复；不适合现有页面的有效词进入未使用词池。',
      content: (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone={keywordTone(keyword.status)}>{keywordStatusLabels[keyword.status]}</StatusBadge>
            {keyword.isPlatformTerm && <StatusBadge tone="red">平台词</StatusBadge>}
            {keyword.isB2CTerm && <StatusBadge tone="red">B2C 词</StatusBadge>}
            {keyword.isBrandTerm && <StatusBadge tone="purple">品牌词</StatusBadge>}
          </div>
          <InfoGrid
            items={[
              ['搜索量', keyword.volume.toLocaleString()],
              ['关键词难度 KD', String(keyword.kd)],
              ['搜索意图', keyword.aiIntent],
              ['建议页面类型', keyword.aiPageType],
              ['候选现有页面', keyword.assignedUrl ?? '待人工判断'],
              ['是否适合植入现有页面', keyword.status === 'unused_valid' ? '暂不适合，进入未使用词池' : '需要审核匹配度'],
            ]}
          />
          <ContentBlock title="AI 清洗建议">{keyword.cleaningReason}</ContentBlock>
          <ContentBlock title="人工审核备注">{keyword.reviewNotes}</ContentBlock>
        </div>
      ),
      actions: [
        { label: '通过', tone: 'green', onClick: () => updateKeywordStatus(keyword.keywordId, 'approved') },
        { label: '排除', tone: 'red', onClick: () => updateKeywordStatus(keyword.keywordId, 'rejected', { isValidUnused: false }) },
        { label: '分配到页面', tone: 'blue', onClick: () => navigateKeywordTab('allocation') },
        { label: '加入未使用词池', tone: 'orange', onClick: () => updateKeywordStatus(keyword.keywordId, 'unused_valid', { isValidUnused: true }) },
      ],
    })
  }

  function openEvidenceDrawer(evidenceId: string) {
    const evidence = mockEvidence.find((item) => item.evidenceId === evidenceId) ?? mockEvidence[0]
    setDrawer({
      title: evidence.name,
      eyebrow: evidence.type,
      description: '证据用于约束页面修复和内容生产，AI 不能把待确认事实写成已确认事实。',
      content: (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone={evidence.confirmed ? 'green' : 'orange'}>{evidence.confirmed ? '已确认' : '待确认'}</StatusBadge>
            <StatusBadge tone={evidence.canUseInContent ? 'blue' : 'gray'}>
              {evidence.canUseInContent ? '可用于内容' : '暂不可用于内容'}
            </StatusBadge>
          </div>
          <ListBlock title="支持哪些声明" items={evidence.supportedClaims} />
          <ListBlock title="关联页面" items={evidence.applicablePages} />
          <ContentBlock title="风险提示">{evidence.riskNotes}</ContentBlock>
          <InfoGrid items={[['文件状态', evidence.fileStatus], ['可用于模块', '页面修复、内容引擎、质量审查']]} />
        </div>
      ),
      actions: [
        {
          label: '生成证据补充任务',
          icon: <ClipboardList className="h-4 w-4" />,
          onClick: () =>
            addGeneratedTask({
              title: `补充或确认证据：${evidence.name}`,
              description: evidence.riskNotes,
              source: 'B2B 证据库',
              taskType: 'trust_evidence',
              priority: evidence.confirmed ? 'p3' : 'p1',
              relatedEvidenceIds: [evidence.evidenceId],
            }),
        },
      ],
    })
  }

  function openHandoffDrawer(title: string) {
    setDrawer({
      title,
      eyebrow: '内容引擎交接包',
      description: 'B2B SEO OS 负责决定写什么、为什么写、用什么证据、链接到哪里；内容引擎只负责内容生产执行。',
      content: (
        <div className="space-y-5">
          <InfoGrid
            items={[
              ['目标读者', 'OEM 买家 / 工程采购团队'],
              ['内容类型', '采购指南 / 常见问题 / 应用场景页'],
              ['主关键词', 'metal fabrication vs machining'],
              ['内部链接目标', '/products/custom-metal-parts/、/request-a-quote/'],
            ]}
          />
          <ListBlock title="相关信任证据" items={['工厂外观与车间照片组', 'Custom Metal Parts 规格表', 'ISO 9001 证书']} />
          <ListBlock title="禁用表达" items={['不要承诺固定交期', '不要写未确认产能数值', '不要公开未脱敏客户名称']} />
          <ListBlock title="质量审查规则" items={['每个能力声明必须有证据来源', '采购建议不能替代销售确认', '必须链接到对应商业页面']} />
        </div>
      ),
      actions: [
        { label: '标记已交接', tone: 'green', onClick: () => showToast('内容引擎交接状态已更新') },
        {
          label: '生成修订任务',
          tone: 'orange',
          onClick: () =>
            addGeneratedTask({
              title: `修改交接包：${title}`,
              description: '根据人工审查补充证据、内链或禁用表达。',
              source: '内容运营',
              taskType: 'content_handoff',
              priority: 'p2',
            }),
        },
      ],
    })
  }

  function openPromptDrawer(promptId: string) {
    const prompt = mockPromptContracts.find((item) => item.promptId === promptId) ?? mockPromptContracts[0]
    setDrawer({
      title: prompt.name,
      eyebrow: `${labelFromMap(prompt.category, promptCategoryLabels)} · v${prompt.version}`,
      description: prompt.description,
      content: (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone={prompt.status === 'active' ? 'green' : 'gray'}>{labelFromMap(prompt.status, promptStatusLabels)}</StatusBadge>
            <StatusBadge tone="orange">需要人工审核：{prompt.requiresHumanReview ? '是' : '否'}</StatusBadge>
            <StatusBadge tone={prompt.canWriteWordPress ? 'red' : 'green'}>写入 WordPress：{prompt.canWriteWordPress ? '允许' : '禁止'}</StatusBadge>
          </div>
          <ListBlock title="输入字段" items={fieldLabels(prompt.inputFields)} />
          <ListBlock title="输出字段" items={fieldLabels(prompt.outputFields)} />
          <ContentBlock title="失败处理">{prompt.failureHandling}</ContentBlock>
          <CodePreview
            title="输出 JSON 示例"
            value={`{\n  "status": "needs_human_review",\n  "can_write_wordpress": false,\n  "task_candidates": [],\n  "human_checks": ["确认证据", "确认关键词匹配"]\n}`}
          />
        </div>
      ),
      actions: [
        {
          label: '模拟运行',
          icon: <PlayCircle className="h-4 w-4" />,
          onClick: () =>
            openModalSteps(
              `模拟运行：${prompt.name}`,
              '只展示执行过程和输出预览，不调用任何真实 AI API。',
              ['准备输入上下文', '校验提示词契约', '模拟生成输出', '等待人工审核'],
              () => showToast('AI 模拟运行完成，输出需要人工审查', 'blue'),
            ),
        },
        {
          label: '生成任务',
          tone: 'blue',
          onClick: () =>
            addGeneratedTask({
              title: `审查提示词输出：${prompt.name}`,
              description: '检查输出 JSON、人工确认点和失败处理是否符合契约。',
              source: '智能体任务中心',
              taskType: 'system_check',
              priority: 'p2',
            }),
        },
      ],
    })
  }

  function openExportModal(packageName = '本轮交付包') {
    setModal({
      title: 'Export Modal',
      description: `生成导出包：${packageName}`,
      content: (
        <div className="space-y-4">
          <MockForm fields={['导出范围', '包含模块', '文件命名', '审查人']} />
          <div className="grid gap-3 md:grid-cols-3">
            <BoundaryCard title="包含内容" tone="green" items={['审计摘要', '页面修复包', '关键词状态', '质量审查项']} />
            <BoundaryCard title="排除敏感信息" tone="orange" items={['真实凭据', '客户未脱敏信息', '本地绝对路径', '未确认事实']} />
            <BoundaryCard title="确认边界" tone="green" items={['只导出演示数据', '不发布 WordPress', '不上传媒体']} />
          </div>
        </div>
      ),
      primaryLabel: '生成完成状态',
      onPrimary: () => showToast('导出包演示文件已生成，未包含敏感信息'),
    })
  }

  function runReadSimulation() {
    void createSnapshotFromUi()
    return undefined
    openModalSteps(
      '正在模拟读取 WordPress 网站',
      '读取页面、文章、产品、媒体素材、菜单和 SEO 字段，生成本地快照。',
      ['读取页面', '读取文章', '读取产品', '读取媒体素材', '读取菜单', '读取 SEO 字段', '生成本地快照'],
      () => {
        setReadTimestamp('2026-06-10 10:48')
        showToast('读取状态已更新为最新演示快照')
      },
    )
  }

  function openSnapshotDrawer() {
    const snapshot = workspace?.latestSnapshot
    if (snapshot) {
      setDrawer({
        title: '站点读取快照',
        eyebrow: '本地只读模拟',
        description: '这份快照来自本地后端模拟读取，不包含 WordPress 密码，不会写入网站。',
        content: (
          <div className="space-y-5">
            <InfoGrid
              items={[
                ['读取时间', formatDateTime(snapshot.snapshotAt)],
                ['站点域名', snapshot.domain],
                ['页面数量', `${snapshot.pageCount}`],
                ['文章数量', `${snapshot.postCount}`],
                ['产品数量', `${snapshot.productCount}`],
                ['媒体数量', `${snapshot.mediaCount}`],
                ['表单入口', `${snapshot.formCount}`],
                ['SEO 字段', `${snapshot.seoFieldCount}`],
              ]}
            />
            <ListBlock title="检测到的页面类型" items={snapshot.detectedPageTypes} />
            <ListBlock title="检测到的表单入口" items={snapshot.detectedForms} />
            <ListBlock title="异常提醒" items={snapshot.anomalies} />
            <SimpleTable
              headers={['页面标题', 'URL', '类型', '字数', 'Meta 状态']}
              rows={snapshot.pages.map((page) => [
                page.title,
                page.url,
                page.pageType,
                `${page.wordCount}`,
                page.metaDescription ? '已有' : '缺失',
              ])}
            />
          </div>
        ),
        actions: [
          { label: '重新生成快照', icon: <RefreshCw className="h-4 w-4" />, onClick: runReadSimulation },
          { label: '进入下一步审计', tone: 'blue', icon: <Gauge className="h-4 w-4" />, onClick: () => navigate('/audit') },
        ],
      })
      return
    }

    setDrawer({
      title: '还没有站点快照',
      eyebrow: '站点接入与读取',
      description: '请先保存项目档案，然后生成站点读取任务包并回填外部智能体结果。',
      content: <EmptyState title="没有读取结果" text="项目中心会生成 AgentTaskPack，外部智能体执行后回填 site_read_snapshot_v1，再由程序内 AI 解析校验。" action="去项目中心" onClick={() => navigate('/project-center')} />,
      actions: [{ label: '去项目中心', icon: <Database className="h-4 w-4" />, onClick: () => navigate('/project-center') }],
    })
    return undefined
    setDrawer({
      title: 'WordPress Snapshot',
      eyebrow: '只读读取摘要',
      description: '这里展示本地演示快照，不包含真实连接凭据。',
      content: (
        <div className="space-y-5">
          <InfoGrid
            items={[
              ['读取时间', readTimestamp],
              ['页面数量', `${mockSnapshot.pageCount}`],
              ['文章数量', `${mockSnapshot.postCount}`],
              ['产品数量', `${mockSnapshot.productCount}`],
              ['媒体数量', `${mockSnapshot.mediaCount}`],
              ['表单入口', `${mockSnapshot.formCount}`],
              ['SEO 字段', `${mockSnapshot.seoFieldCount}`],
            ]}
          />
          <ListBlock title="检测到的页面类型" items={mockSnapshot.detectedPageTypes} />
          <ListBlock title="检测到的表单入口" items={mockSnapshot.detectedForms} />
          <ListBlock title="检测到的信任页面" items={mockSnapshot.trustPages} />
          <ListBlock title="异常项摘要" items={mockSnapshot.anomalies} />
        </div>
      ),
      actions: [
        { label: '模拟重新读取', icon: <RefreshCw className="h-4 w-4" />, onClick: runReadSimulation },
      ],
    })
  }

  function OverviewPage() {
    const latestSnapshot = workspace?.latestSnapshot
    const projectReady = Boolean(workspace?.project)
    const snapshotReady = Boolean(latestSnapshot?.pages?.length)
    const currentWorkflow = workflow?.currentStepLabel || '站点接入与读取'
    const nextAction = workflow?.nextAction || '填写项目档案并生成本地读取快照'
    return (
      <PageShell
        eyebrow="项目总览"
        title="先完成站点接入与读取"
        description="当前按主流程逐步落地。第一步只处理项目档案和本地只读站点快照，后续审计、关键词和修复模块会在你验收通过后再继续。"
        actions={
          <>
            <Button onClick={() => navigate('/project-center')} icon={<Database className="h-4 w-4" />} tone="primary">进入项目中心</Button>
            <Button onClick={openSnapshotDrawer} icon={<Eye className="h-4 w-4" />} tone="secondary">查看读取结果</Button>
          </>
        }
      >
        {workspaceError && <Notice title="本地后端提示" text={workspaceError} tone="red" />}
        <div className="grid gap-4 lg:grid-cols-4">
          <MetricCard title="项目档案" value={projectReady ? '已保存' : '未保存'} detail={workspace?.project?.domain || '需要填写站点域名'} tone={projectReady ? 'green' : 'orange'} icon={<BriefcaseBusiness className="h-5 w-5" />} onClick={() => navigate('/project-center')} />
          <MetricCard title="只读边界" value="已锁定" detail="不保存密码 / 不写入 WordPress" tone="green" icon={<ShieldCheck className="h-5 w-5" />} onClick={() => navigate('/project-center')} />
          <MetricCard title="站点快照" value={snapshotReady ? `${latestSnapshot?.pages.length || 0} 条记录` : '未生成'} detail={snapshotReady ? `读取时间：${formatDateTime(latestSnapshot?.snapshotAt || '')}` : '保存项目后生成本地快照'} tone={snapshotReady ? 'green' : 'orange'} icon={<Database className="h-5 w-5" />} onClick={openSnapshotDrawer} />
          <MetricCard title="当前阶段" value={currentWorkflow} detail={nextAction} tone={snapshotReady ? 'blue' : 'orange'} icon={<Layers3 className="h-5 w-5" />} onClick={() => navigate(workflow?.currentRoute || '/project-center')} />
        </div>

        <Panel title="主流程进度" action={<StatusBadge tone={snapshotReady ? 'blue' : 'orange'}>当前：{currentWorkflow}</StatusBadge>}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {(workflow?.steps || []).slice(0, 4).map((step) => (
              <button key={step.stepId} className="rounded-lg border border-gray-200 bg-white p-4 text-left transition hover:border-primary-200 hover:bg-primary-50" onClick={() => navigate(step.route)}>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">{step.order}</span>
                  <StatusBadge tone={step.status === 'done' ? 'green' : step.status === 'ready' ? 'orange' : 'gray'}>{step.status === 'done' ? '已完成' : step.status === 'ready' ? '可操作' : '未开始'}</StatusBadge>
                </div>
                <p className="mt-3 text-sm font-semibold text-gray-900">{step.label}</p>
                <p className="mt-1 text-xs leading-5 text-gray-500">{step.status === 'locked' ? step.blocker : step.readyAction}</p>
              </button>
            ))}
          </div>
        </Panel>

        <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
          <Panel title="第一步完成条件">
            <ProgressRows
              rows={[
                ['有项目档案', projectReady ? 100 : 0, projectReady ? '已保存' : '未保存'],
                ['有最新读取快照', snapshotReady ? 100 : 0, snapshotReady ? '已生成' : '未生成'],
                ['至少 1 条页面记录', latestSnapshot?.pages?.length ? 100 : 0, `${latestSnapshot?.pages?.length || 0} 条`],
                ['WordPress 写入能力', 0, '关闭'],
              ]}
            />
          </Panel>
          <Panel title="下一步">
            <div className="space-y-3">
              <Notice title={snapshotReady ? '可以进入网站现状审计' : '请先完成站点接入与读取'} text={snapshotReady ? '第一步已经有项目档案和本地快照。下一阶段再单独实现网站现状审计。' : '保存项目档案后，点击生成本地只读快照。快照生成成功后才进入下一步。'} tone={snapshotReady ? 'green' : 'orange'} />
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => navigate('/project-center')} icon={<Database className="h-4 w-4" />}>去项目中心</Button>
                <Button tone="secondary" onClick={runReadSimulation} icon={<RefreshCw className="h-4 w-4" />}>{snapshotReady ? '重新生成快照' : '生成读取快照'}</Button>
              </div>
            </div>
          </Panel>
        </div>
      </PageShell>
    )
    return (
      <PageShell
        eyebrow="项目总览"
        title="这个站现在卡在：关键词审核与页面修复前"
        description="先确认关键词、页面和证据，再生成修复包。所有建议都只保存在本地，不写入 WordPress。"
        actions={
          <>
            <Button onClick={() => navigate('/project-center')} icon={<Database className="h-4 w-4" />} tone="secondary">查看网站读取结果</Button>
            <Button onClick={() => navigate('/audit')} icon={<Gauge className="h-4 w-4" />}>查看审计问题</Button>
            <Button onClick={() => navigateKeywordTab('review')} icon={<ClipboardCheck className="h-4 w-4" />} tone="primary">继续审核关键词</Button>
          </>
        }
      >
        <div className="grid gap-4 lg:grid-cols-5">
          <MetricCard title="WordPress 读取" value="86 页" detail="42 篇文章 / 128 媒体" tone="green" icon={<Database className="h-5 w-5" />} onClick={openSnapshotDrawer} />
          <MetricCard title="现有网站审计" value="37 问题" detail="高风险 8 / 中风险 19" tone="red" icon={<AlertTriangle className="h-5 w-5" />} onClick={() => navigate('/audit')} />
          <MetricCard title="关键词数据库" value={keywordLibraryCount.toLocaleString()} detail={`已导入 ${operatingStats.importedCsv} CSV / 待审 ${operatingStats.pendingReview.toLocaleString()}`} tone="blue" icon={<FileSpreadsheet className="h-5 w-5" />} onClick={() => navigateKeywordTab('library')} />
          <MetricCard title="页面修复" value={`${operatingStats.repairPages} 页`} detail={`已生成优化包 ${operatingStats.generatedRepairPackages} 个`} tone="orange" icon={<Wrench className="h-5 w-5" />} onClick={() => navigate('/tasks')} />
          <MetricCard title="内容交接" value={`${operatingStats.contentHandoffTasks} 个`} detail={`样本待交接 ${metrics.handoff} 项`} tone="purple" icon={<Send className="h-5 w-5" />} onClick={() => navigate('/content')} />
        </div>

        <Panel title="主流程进度" action={<StatusBadge tone="orange">当前：人工审核分配</StatusBadge>}>
          <WorkflowStepper />
        </Panel>

        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <Panel title="今日建议动作" description="只显示最应该继续的 3 件事。">
            <div className="grid gap-3 md:grid-cols-3">
              <ActionCard title="继续审核关键词" text="先处理高搜索量和明确 B2B 采购意图词。" icon={<ClipboardCheck className="h-5 w-5" />} onClick={() => navigateKeywordTab('review')} />
              <ActionCard title="确认首页证据" text="首页价值主张需要证据支撑，不能让 AI 自动确认事实。" icon={<ShieldCheck className="h-5 w-5" />} onClick={() => navigate('/trust')} />
              <ActionCard title="处理高优先级任务" text="P0/P1 任务决定第一批修复包能否交付。" icon={<ClipboardList className="h-5 w-5" />} onClick={() => navigate('/tasks')} />
            </div>
          </Panel>
          <Panel title="当前数据完整度">
            <ProgressRows
              rows={[
                ['WordPress 读取', 100, '已读取'],
                ['审计结果', 92, '37 个问题'],
                ['关键词审核', 62, `${operatingStats.pendingReview.toLocaleString()} 个待审`],
                ['B2B 证据库', 68, '3 项待确认'],
                ['交付包', 35, '草稿中'],
              ]}
            />
          </Panel>
        </div>

        <Panel title="高优先级任务" description="点击任务可打开详情 Drawer。">
          <TaskTable tasks={metrics.highTasks.slice(0, 6)} onOpen={openTaskDrawer} />
        </Panel>
      </PageShell>
    )
  }

  function ProjectCenterPage() {
    const latestSnapshot = workspace?.latestSnapshot
    const projectReady = Boolean(workspace?.project)
    const snapshotReady = Boolean(latestSnapshot?.pages?.length)
    const inputClass = 'mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100'
    const sources = ['WordPress 页面', 'WordPress 文章', 'WooCommerce 产品', '媒体库', '菜单', '表单', 'SEO 字段', '关键词 CSV', 'B2B 公司资料', '证据素材', '内容引擎输出包']
    const sourceStatus = (source: string, index: number) => {
      if (['WordPress 页面', 'WordPress 文章', 'WooCommerce 产品', '媒体库', '菜单', '表单', 'SEO 字段'].includes(source)) {
        return snapshotReady ? ['green', '已读取'] as const : ['orange', '等待 Artifact'] as const
      }
      return index < 9 ? ['orange', '后续阶段'] as const : ['gray', '未开始'] as const
    }
    return (
      <PageShell
        eyebrow="项目中心 / 站点接入"
        title="站点接入与读取"
        description="这一步先建立项目档案，再由程序内 AI 生成外部智能体任务包；外部智能体执行后回填 Artifact，程序内 AI 解析校验，人工批准后进入网站现状审计。"
        actions={
          <>
            <Button tone="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={() => void refreshWorkspace()}>刷新状态</Button>
            <Button icon={<Bot className="h-4 w-4" />} onClick={() => void createSiteReadTaskPackFromUi()}>{siteReadTaskPack ? '重新生成任务包' : '生成站点读取任务包'}</Button>
          </>
        }
      >
        {workspaceError && <Notice title="操作提示" text={workspaceError} tone="red" />}
        {workspaceLoading && <Notice title="正在读取本地工作区" text="请稍等，系统正在读取项目档案和站点快照状态。" tone="blue" />}
        <Panel
          title="站点读取智能体闭环"
          description="主流程：生成 AgentTaskPack → 复制给外部智能体 → 回填 site_read_snapshot_v1 → 程序内 AI 解析校验 → 人工审核入库。"
          action={<StatusBadge tone={siteReadIngestion?.status === 'approved' ? 'green' : siteReadIngestion ? 'orange' : siteReadTaskPack ? 'blue' : 'gray'}>{siteReadIngestion?.status === 'approved' ? '已批准入库' : siteReadIngestion ? '等待人工审核' : siteReadTaskPack ? '任务包已生成' : '等待任务包'}</StatusBadge>}
        >
          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <label className="text-sm font-medium text-gray-700">
                  外部执行智能体
                  <select className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100" value={siteReadAgent} onChange={(event) => setSiteReadAgent(event.target.value)}>
                    <option value="openclaw">OpenClaw</option>
                    <option value="chatgpt">ChatGPT</option>
                    <option value="claude">Claude</option>
                    <option value="generic-agent">通用智能体</option>
                  </select>
                </label>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button icon={<Bot className="h-4 w-4" />} onClick={() => void createSiteReadTaskPackFromUi()}>{workspaceBusy ? '处理中...' : '生成 AgentTaskPack'}</Button>
                  <Button tone="secondary" icon={<ClipboardList className="h-4 w-4" />} onClick={() => void copySiteReadTaskPackFromUi()}>复制任务包</Button>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-gray-900">回填 Artifact</p>
                  <Button size="sm" tone="secondary" icon={<FileText className="h-4 w-4" />} onClick={fillSampleSiteReadArtifact}>填入示例</Button>
                </div>
                <textarea
                  className="mt-3 min-h-48 w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-xs leading-5 text-gray-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  value={siteReadArtifactText}
                  onChange={(event) => setSiteReadArtifactText(event.target.value)}
                  placeholder="粘贴外部智能体返回的 site_read_snapshot_v1 JSON。"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button icon={<Upload className="h-4 w-4" />} onClick={() => void submitSiteReadArtifactFromUi()}>保存回填</Button>
                  <Button tone="secondary" icon={<Sparkles className="h-4 w-4" />} onClick={() => void runSiteReadIngestionFromUi()}>AI 解析校验</Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-gray-900">任务包预览</p>
                  <StatusBadge tone={siteReadTaskPack ? 'blue' : 'gray'}>{siteReadTaskPack ? siteReadTaskPack.status : '未生成'}</StatusBadge>
                </div>
                {siteReadTaskPack ? (
                  <pre className="mt-3 max-h-72 overflow-auto rounded-lg bg-gray-950 p-3 text-xs leading-5 text-gray-100">{siteReadTaskPack.promptMarkdown}</pre>
                ) : (
                  <EmptyState title="还没有任务包" text="请先保存项目档案，然后生成站点读取 AgentTaskPack。" action="生成任务包" onClick={() => void createSiteReadTaskPackFromUi()} />
                )}
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-gray-900">解析与人工审核</p>
                  <StatusBadge tone={siteReadIngestion?.validationResult.valid ? 'green' : siteReadIngestion ? 'red' : 'gray'}>{siteReadIngestion ? `质量分 ${siteReadIngestion.validationResult.qualityScore}` : '等待解析'}</StatusBadge>
                </div>
                {siteReadIngestion ? (
                  <div className="mt-3 space-y-3">
                    <InfoGrid items={[
                      ['解析状态', siteReadIngestion.status],
                      ['是否可推进', siteReadIngestion.canAdvance ? '可以' : '不可以'],
                      ['缺失字段', siteReadIngestion.validationResult.missingFields.join('、') || '无'],
                      ['提醒事项', siteReadIngestion.humanReviewItems.length ? `${siteReadIngestion.humanReviewItems.length} 条` : '无'],
                    ]} />
                    <ListBlock title="人工审核项" items={siteReadIngestion.humanReviewItems} />
                    <div className="flex flex-wrap gap-2">
                      <Button icon={<CheckCircle2 className="h-4 w-4" />} onClick={() => void reviewSiteReadIngestionFromUi('approved')}>人工批准入库</Button>
                      <Button tone="danger" icon={<X className="h-4 w-4" />} onClick={() => void reviewSiteReadIngestionFromUi('rejected')}>驳回并保留原文</Button>
                    </div>
                  </div>
                ) : (
                  <EmptyState title="还没有解析结果" text="保存 Artifact 后，点击 AI 解析校验。解析通过且人工批准后，才会写入正式站点快照。" />
                )}
              </div>
            </div>
          </div>
        </Panel>
        <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <Panel title="项目档案" description="这些信息会作为后续审计、B2B 上下文和关键词判断的基础输入。" action={<StatusBadge tone={projectReady ? 'green' : 'orange'}>{projectReady ? '已保存' : '待保存'}</StatusBadge>}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-gray-700">项目名称<input className={inputClass} value={projectDraft.projectName} onChange={(event) => updateProjectField('projectName', event.target.value)} /></label>
              <label className="text-sm font-medium text-gray-700">网站域名<input className={inputClass} value={projectDraft.domain} onChange={(event) => updateProjectField('domain', event.target.value)} /></label>
              <label className="text-sm font-medium text-gray-700">公司名称<input className={inputClass} value={projectDraft.company} onChange={(event) => updateProjectField('company', event.target.value)} /></label>
              <label className="text-sm font-medium text-gray-700">行业<input className={inputClass} value={projectDraft.industry} onChange={(event) => updateProjectField('industry', event.target.value)} /></label>
              <label className="text-sm font-medium text-gray-700">目标市场<input className={inputClass} value={projectDraft.targetMarkets.join('，')} onChange={(event) => updateProjectList('targetMarkets', event.target.value)} /></label>
              <label className="text-sm font-medium text-gray-700">核心产品<input className={inputClass} value={projectDraft.coreProducts.join('，')} onChange={(event) => updateProjectList('coreProducts', event.target.value)} /></label>
              <label className="text-sm font-medium text-gray-700">目标客户<input className={inputClass} value={projectDraft.targetCustomers.join('，')} onChange={(event) => updateProjectList('targetCustomers', event.target.value)} /></label>
              <label className="text-sm font-medium text-gray-700">转化目标<input className={inputClass} value={projectDraft.primaryConversionGoal} onChange={(event) => updateProjectField('primaryConversionGoal', event.target.value)} /></label>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button icon={<Check className="h-4 w-4" />} onClick={() => void saveProjectFromUi()}>{workspaceBusy ? '处理中...' : '保存项目档案'}</Button>
              <Button tone="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={() => void createSnapshotFromUi()}>开发预览：生成本地模拟快照</Button>
            </div>
          </Panel>
          <Panel title="只读安全边界" action={<StatusBadge tone="green">本地模拟 / 不写站点</StatusBadge>}>
            <div className="grid gap-3 md:grid-cols-2">
              <BoundaryCard title="允许" tone="green" items={['保存项目资料', '保存站点域名', '生成本地模拟快照', '查看页面清单']} />
              <BoundaryCard title="禁止" tone="red" items={['保存 WordPress 密码', '写入 WordPress', '上传媒体', '自动发布页面']} />
            </div>
            <div className="mt-4">
              <InfoGrid items={[
                ['连接模式', workspace?.siteConnection.mode === 'local_mock_read_only' ? '本地只读模拟' : '等待初始化'],
                ['保存凭据', workspace?.siteConnection.storesCredentials ? '是' : '否'],
                ['WordPress 写入', workspace?.siteConnection.wordpressWritesEnabled ? '开启' : '关闭'],
                ['最近检查', workspace?.siteConnection.lastCheckedAt ? formatDateTime(workspace.siteConnection.lastCheckedAt) : '未检查'],
              ]} />
            </div>
          </Panel>
        </div>
        <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
          <Panel title="读取状态" action={<StatusBadge tone={snapshotReady ? 'green' : 'orange'}>{snapshotReady ? '快照已生成' : '等待读取'}</StatusBadge>}>
            <ProgressRows rows={[
              ['项目档案', projectReady ? 100 : 0, projectReady ? '已保存' : '未保存'],
              ['本地快照', snapshotReady ? 100 : 0, snapshotReady ? '已生成' : '未生成'],
              ['页面记录', latestSnapshot?.pages?.length ? 100 : 0, `${latestSnapshot?.pages?.length || 0} 条`],
              ['安全边界', 100, '只读 / 不写入'],
            ]} />
            <div className="mt-4 flex flex-wrap gap-2">
              <Button icon={<Bot className="h-4 w-4" />} onClick={() => void createSiteReadTaskPackFromUi()}>{siteReadTaskPack ? '重新生成任务包' : '生成站点读取任务包'}</Button>
              <Button tone="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={() => void createSnapshotFromUi()}>开发预览：本地模拟快照</Button>
              <Button tone="secondary" icon={<Eye className="h-4 w-4" />} onClick={openSnapshotDrawer}>查看快照详情</Button>
            </div>
          </Panel>
          <Panel title="最新读取快照">
            {latestSnapshot ? (
              <div className="space-y-4">
                <InfoGrid items={[
                  ['读取时间', formatDateTime(latestSnapshot.snapshotAt)],
                  ['页面 / 文章 / 产品', `${latestSnapshot.pageCount} / ${latestSnapshot.postCount} / ${latestSnapshot.productCount}`],
                  ['媒体数量', `${latestSnapshot.mediaCount}`],
                  ['菜单数量', `${latestSnapshot.menuCount}`],
                  ['表单入口', `${latestSnapshot.formCount}`],
                  ['异常提醒', `${latestSnapshot.anomalies.length} 条`],
                ]} />
                <SimpleTable headers={['页面标题', 'URL', '页面类型', '字数', '表单']} rows={latestSnapshot.pages.map((page) => [page.title, page.url, page.pageType, `${page.wordCount}`, page.formsDetected.length ? page.formsDetected.join('、') : '无'])} />
              </div>
            ) : (
              <EmptyState title="还没有读取快照" text="保存项目档案后，先生成站点读取任务包并交给外部智能体执行；回填解析并人工批准后，快照会作为下一步网站现状审计的输入。" action="生成任务包" onClick={() => void createSiteReadTaskPackFromUi()} />
            )}
          </Panel>
        </div>

        <Panel title="数据源状态" description="所有输入只进入本地原型状态，不触发真实外部请求。">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {sources.map((source, index) => {
              const [tone, label] = sourceStatus(source, index)
              return (
                <button key={source} className="rounded-lg border border-gray-200 bg-white p-3 text-left transition hover:border-primary-200 hover:bg-primary-50" onClick={() => showToast(`${source} 仍由当前主流程逐步接管`, 'blue')}>
                  <div className="flex items-center justify-between">
                    <Database className="h-4 w-4 text-primary-600" />
                    <StatusBadge tone={tone}>{label}</StatusBadge>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-gray-900">{source}</p>
                  <p className="mt-1 text-xs text-gray-500">来源：{snapshotReady && index < 7 ? '已批准站点快照' : '等待对应阶段产出物'}</p>
                </button>
              )
            })}
          </div>
        </Panel>

        <div className="grid gap-4 xl:grid-cols-2">
          <Panel title="最近一次读取摘要">
            <InfoGrid items={[
              ['读取时间', latestSnapshot ? formatDateTime(latestSnapshot.snapshotAt) : '等待 Artifact 入库'],
              ['页面 / 文章 / 产品', latestSnapshot ? `${latestSnapshot.pageCount} / ${latestSnapshot.postCount} / ${latestSnapshot.productCount}` : '0 / 0 / 0'],
              ['媒体', latestSnapshot ? `${latestSnapshot.mediaCount}` : '0'],
              ['异常项', latestSnapshot?.anomalies.length ? latestSnapshot.anomalies.join('、') : '等待外部智能体回填'],
            ]} />
          </Panel>
          <Panel title="资料缺口提醒" action={<Button tone="secondary" onClick={() => setDrawer({ title: '资料缺口', eyebrow: 'B2B 上下文', content: <ListBlock title="后续需要补充" items={['公司身份和产品线确认', '目标客户和目标市场确认', '可公开的信任证据', '禁止使用的商业说法']} /> })}>查看缺失资料</Button>}>
            <EmptyState title="后续阶段会逐步确认业务事实" text="当前阶段只负责站点读取。商业事实、证据和禁用说法会在 B2B 上下文阶段经人工确认后入库。" action="去证据库" onClick={() => navigate('/trust')} />
          </Panel>
        </div>
      </PageShell>
    )
  }

  function AuditPage() {
    return (
      <PageShell
        eyebrow="SEO 诊断"
        title="先理解现有网站问题，再进入关键词修复"
        description="审计结果可以生成任务草稿，但不能自动改页面；涉及关键词的修复建议会等待审核分配后补充。"
        actions={<Button icon={<PlayCircle className="h-4 w-4" />} onClick={() => openModalSteps('运行前台只读审计', '模拟读取页面前台状态并生成审计问题。', ['读取页面结构', '检查 B2B 信息架构', '检查信任与转化路径', '生成审计问题', '等待人工确认'], () => showToast('审计模拟完成'))}>运行前台只读审计</Button>}
      >
        <div className="grid gap-4 lg:grid-cols-5">
          <MetricCard title="总问题数" value="37" detail="可生成任务 31" tone="blue" icon={<Gauge className="h-5 w-5" />} />
          <MetricCard title="高风险" value="8" detail="优先处理页面 5 个" tone="red" icon={<AlertTriangle className="h-5 w-5" />} />
          <MetricCard title="需要人工确认" value="12" detail="证据或关键词边界" tone="orange" icon={<ShieldCheck className="h-5 w-5" />} />
          <MetricCard title="等待关键词" value="7" detail="先审核分配再修复" tone="purple" icon={<Clock3 className="h-5 w-5" />} />
          <MetricCard title="已生成任务" value={String(tasks.filter((task) => task.source === 'SEO 审计').length)} detail="本地演示任务" tone="green" icon={<ClipboardList className="h-5 w-5" />} />
        </div>

        <Panel
          title="问题队列"
          action={
            <div className="flex flex-wrap gap-2">
              <Segmented value={auditView} onChange={(value) => setAuditView(value as typeof auditView)} options={[['table', '问题列表'], ['page', '按页面'], ['category', '按分类']]} />
              <Segmented value={auditFilter} onChange={(value) => setAuditFilter(value as typeof auditFilter)} options={[['all', '全部'], ['high', '仅看高风险'], ['evidence', '需要证据']]} />
            </div>
          }
        >
          {auditView === 'table' && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs text-gray-500">
                    <th className="py-3 pr-4 font-medium">问题标题</th>
                    <th className="py-3 pr-4 font-medium">分类</th>
                    <th className="py-3 pr-4 font-medium">严重程度</th>
                    <th className="py-3 pr-4 font-medium">影响页面</th>
                    <th className="py-3 pr-4 font-medium">状态</th>
                    <th className="py-3 pr-4 font-medium">动作</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleAuditFindings.map((finding) => (
                    <tr key={finding.findingId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 pr-4 font-medium text-gray-900">
                        <button className="text-left hover:text-primary-700" onClick={() => openAuditDrawer(finding)}>{finding.title}</button>
                      </td>
                      <td className="py-3 pr-4 text-gray-600">{finding.category}</td>
                      <td className="py-3 pr-4"><SeverityBadge severity={finding.severity} /></td>
                      <td className="py-3 pr-4 text-gray-600">{finding.url}</td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap gap-1">
                          {finding.requiresKeywordData && <StatusBadge tone="blue">等待关键词</StatusBadge>}
                          {finding.requiresEvidence && <StatusBadge tone="orange">需证据</StatusBadge>}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <Button size="sm" tone="secondary" onClick={() => openAuditDrawer(finding)}>打开详情</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {auditView === 'page' && <GroupedCards items={groupBy(auditFindings, 'url')} onOpen={(title) => openAuditDrawer(auditFindings.find((finding) => finding.url === title) ?? auditFindings[0])} />}
          {auditView === 'category' && <GroupedCards items={groupBy(auditFindings, 'category')} onOpen={(title) => openAuditDrawer(auditFindings.find((finding) => finding.category === title) ?? auditFindings[0])} />}
        </Panel>
      </PageShell>
    )
  }

  function KeywordsPage() {
    return (
      <PageShell
        eyebrow="页面与关键词 / Keywords Map"
        title="关键词先入总库，人工审核后才分配到页面"
        description="不适合现有页面的有效词进入未使用词池；超级聚类只处理未使用词池。"
        actions={<Button icon={<Upload className="h-4 w-4" />} onClick={() => setKeywordTab('import')}>上传关键词 CSV</Button>}
      >
        <div className="grid gap-4 lg:grid-cols-6">
          <MetricCard title="页面总数" value="86" detail={`已展示核心页面 ${mockPages.length}`} tone="blue" icon={<FileText className="h-5 w-5" />} />
          <MetricCard title="总关键词" value={operatingStats.totalKeywords.toLocaleString()} detail={`清洗后 ${keywordLibraryCount.toLocaleString()} / 样本 ${keywords.length}`} tone="purple" icon={<FileSpreadsheet className="h-5 w-5" />} />
          <MetricCard title="待审核" value={operatingStats.pendingReview.toLocaleString()} detail={`样本队列 ${metrics.pending} 个，不能用于页面修复`} tone="orange" icon={<ClipboardCheck className="h-5 w-5" />} />
          <MetricCard title="已分配" value={operatingStats.assignedToPages.toLocaleString()} detail={`样本已分配 ${metrics.assigned} 个，进入页面修复`} tone="green" icon={<CheckCircle2 className="h-5 w-5" />} />
          <MetricCard title="未使用有效词" value={operatingStats.unusedKeywords.toLocaleString()} detail={`样本词池 ${metrics.unused} 个，等待超级聚类`} tone="blue" icon={<Boxes className="h-5 w-5" />} />
          <MetricCard title="蚕食风险" value="4" detail="1 个高风险" tone="red" icon={<Link2 className="h-5 w-5" />} />
        </div>

        <Panel title="Keywords Map 工作台">
          <div className="mb-4 flex gap-2 overflow-x-auto border-b border-gray-200 pb-2">
            {keywordTabs.map((tab) => (
              <button
                key={tab.id}
                className={cx(
                  'shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition',
                  keywordTab === tab.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                )}
                onClick={() => setKeywordTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {keywordTab === 'pages' && <PageMapTab />}
          {keywordTab === 'library' && <KeywordLibraryTab />}
          {keywordTab === 'import' && <KeywordImportTab />}
          {keywordTab === 'review' && <KeywordReviewTab />}
          {keywordTab === 'allocation' && <KeywordAllocationTab />}
          {keywordTab === 'unused' && <UnusedKeywordsTab />}
          {keywordTab === 'cluster' && <SuperClusterTab />}
          {keywordTab === 'links' && <InternalLinksTab />}
        </Panel>
      </PageShell>
    )
  }

  function PageMapTab() {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs text-gray-500">
              {['页面标题', 'URL', '页面类型', '当前 / 建议关键词', '问题 / 任务', '内链状态', '动作'].map((head) => (
                <th key={head} className="py-3 pr-4 font-medium">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockPages.map((page) => (
              <tr key={page.pageId} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 pr-4 font-medium text-gray-900"><button className="text-left hover:text-primary-700" onClick={() => openPageDrawer(page)}>{page.title}</button></td>
                <td className="py-3 pr-4 text-gray-600">{page.url}</td>
                <td className="py-3 pr-4"><StatusBadge tone="gray">{page.pageType}</StatusBadge></td>
                <td className="py-3 pr-4 text-gray-600">
                  <div>{page.primaryKeyword ?? '未设置'}</div>
                  <div className="text-xs text-primary-700">{page.suggestedPrimaryKeyword ?? '暂无建议'}</div>
                </td>
                <td className="py-3 pr-4 text-gray-600">{page.auditIssueCount} 问题 / {page.repairTaskCount} 任务</td>
                <td className="py-3 pr-4 text-gray-600">{page.internalLinkStatus}</td>
                <td className="py-3 pr-4">
                  <div className="flex gap-2">
                    <Button size="sm" tone="secondary" onClick={() => openPageDrawer(page)}>详情</Button>
                    <Button size="sm" tone="secondary" onClick={() => setKeywordTab('allocation')}>分配</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  function KeywordLibraryTab() {
    const filtered = keywords.filter((keyword) => {
      const matchesSearch = keyword.keyword.toLowerCase().includes(keywordSearch.toLowerCase())
      const matchesFilter =
        keywordFilter === 'all' ||
        (keywordFilter === 'pending' && keyword.status === 'pending_review') ||
        (keywordFilter === 'unused' && keyword.status === 'unused_valid') ||
        (keywordFilter === 'assigned' && keyword.status === 'assigned_existing_page')
      return matchesSearch && matchesFilter
    })
    return (
      <div className="space-y-4">
        <FilterBar>
          <SearchInput value={keywordSearch} onChange={setKeywordSearch} placeholder="搜索关键词、来源或意图" />
          <Segmented value={keywordFilter} onChange={(value) => setKeywordFilter(value as typeof keywordFilter)} options={[['all', '全部'], ['pending', '待审核'], ['assigned', '已分配'], ['unused', '未使用']]} />
          <Button tone="secondary" onClick={() => showToast('已批量标记通过 5 个关键词')}>批量通过</Button>
          <Button tone="secondary" onClick={() => showToast('已批量加入未使用词池')}>加入未使用词池</Button>
        </FilterBar>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs text-gray-500">
                {['关键词', 'Volume / KD', '来源', 'AI 标签', '审核状态', '页面建议', '目标 URL'].map((head) => (
                  <th key={head} className="py-3 pr-4 font-medium">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 18).map((keyword) => (
                <tr key={keyword.keywordId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 pr-4 font-medium text-gray-900"><button className="text-left hover:text-primary-700" onClick={() => openKeywordDrawer(keyword)}>{keyword.keyword}</button></td>
                  <td className="py-3 pr-4 text-gray-600">{keyword.volume.toLocaleString()} / {keyword.kd}</td>
                  <td className="py-3 pr-4 text-gray-600">{keyword.sourceTool}</td>
                  <td className="py-3 pr-4 text-gray-600">{keyword.aiIntent}</td>
                  <td className="py-3 pr-4"><StatusBadge tone={keywordTone(keyword.status)}>{keywordStatusLabels[keyword.status]}</StatusBadge></td>
                  <td className="py-3 pr-4 text-gray-600">{keyword.aiPageType}</td>
                  <td className="py-3 pr-4 text-gray-600">{keyword.assignedUrl ?? '待判断'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  function KeywordImportTab() {
    return (
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-5">
          {['上传多个 CSV', '内置脚本合并去重', 'AI + 规则清洗', '写入总关键词库', '等待人工审核'].map((step, index) => (
            <div key={step} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-sm font-semibold text-primary-700">{index + 1}</div>
              <p className="mt-3 text-sm font-semibold text-gray-900">{step}</p>
              <p className="mt-1 text-xs text-gray-500">原型只演示状态流转</p>
            </div>
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <Panel title="导入区" description="支持 Semrush / Ahrefs / GKP / 手工 CSV，本次不做真实解析。">
            <button
              className="flex min-h-40 w-full flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center transition hover:border-primary-300 hover:bg-primary-50"
              onClick={() =>
                setModal({
                  title: 'CSV Upload Modal',
                  description: '上传文件、选择来源工具、预览字段映射。本地原型不解析真实文件。',
                  content: <MockForm fields={['来源工具', '文件名', '字段映射状态', '识别关键词列', '识别搜索量 / 关键词难度']} />,
                  primaryLabel: '确认导入',
                  onPrimary: () => showToast('CSV 演示文件已加入导入列表'),
                })
              }
            >
              <Upload className="h-8 w-8 text-primary-600" />
              <span className="mt-3 text-sm font-semibold text-gray-900">点击上传 CSV</span>
              <span className="mt-1 text-xs text-gray-500">拖拽区域仅作视觉演示</span>
            </button>
          </Panel>
          <Panel title="清洗结果">
            <InfoGrid
              items={[
                ['原始词数', cleaningStats.raw.toLocaleString()],
                ['去重后词数', cleaningStats.deduped.toLocaleString()],
                ['AI 标记无关词', `${cleaningStats.irrelevant}`],
                ['AI 标记 B2C 词', `${cleaningStats.b2c}`],
                ['AI 标记平台词', `${cleaningStats.platform}`],
                ['待审核词数', `${cleaningStats.keptForReview}`],
              ]}
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={() => openModalSteps('内置脚本清洗中', '合并 CSV、标准化关键词、去重并生成关键词原始主表。', ['合并 CSV', '标准化关键词', '去重', '合并来源', '保留搜索量 / 关键词难度', '生成关键词原始主表'], () => showToast('脚本清洗演示完成'))}>运行合并去重</Button>
              <Button tone="secondary" onClick={() => setDrawer({ title: 'AI 清洗详情', eyebrow: 'AI + 规则清洗', description: 'AI 只打标，不删除关键词。', content: <div className="space-y-4"><InfoGrid items={[['输入词数', '2,940'], ['清洗目标', '标记无关词、B2C 词、平台词和待人工判断词'], ['输出状态', '已 AI 清洗 / 待人工审核']]} /><ListBlock title="保留问题词示例" items={['cheap metal parts wholesale', 'factory direct metal components', 'low moq custom metal parts']} /></div>, actions: [{ label: '确认写入已清洗状态', onClick: () => showToast('AI 清洗结果已写入演示状态') }] })}>运行 AI 清洗</Button>
              <Button
                tone="secondary"
                onClick={() => {
                  setKeywordLibraryCount((count) => Math.max(count, 2980))
                  showToast('已写入总词库，关键词总库数量已更新')
                }}
              >
                写入总词库
              </Button>
            </div>
          </Panel>
        </div>
        <Panel title="已导入文件">
          <SimpleTable rows={importFiles.map((file) => [file.file, file.source, `${file.raw}`, file.fields, `${file.duplicates}`, file.status])} headers={['文件名', '来源工具', '原始词数', '识别字段', '重复词数', '导入状态']} />
        </Panel>
      </div>
    )
  }

  function KeywordReviewTab() {
    const queue = keywords.filter((keyword) => keyword.status === 'pending_review' || keyword.status === 'hold').slice(0, 12)
    return (
      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <Panel title="待审核关键词队列" description={`项目总待人工确认 ${operatingStats.pendingReview.toLocaleString()} 个；当前原型展示 ${metrics.pending} 个可点击样本。`}>
          <div className="space-y-2">
            {queue.map((keyword) => (
              <button key={keyword.keywordId} className={cx('w-full rounded-lg border p-3 text-left transition', selectedReviewKeywordId === keyword.keywordId ? 'border-primary-300 bg-primary-50' : 'border-gray-200 bg-white hover:bg-gray-50')} onClick={() => setSelectedReviewKeywordId(keyword.keywordId)}>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-gray-900">{keyword.keyword}</span>
                  <StatusBadge tone={keywordTone(keyword.status)}>{keywordStatusLabels[keyword.status]}</StatusBadge>
                </div>
                <p className="mt-1 text-xs text-gray-500">{keyword.volume.toLocaleString()} volume · {keyword.aiIntent}</p>
              </button>
            ))}
          </div>
        </Panel>
        <Panel title="关键词详情与审核动作" action={<StatusBadge tone="orange">审核后才能分配</StatusBadge>}>
          {selectedReviewKeyword ? (
            <div className="space-y-4">
              <InfoGrid items={[['关键词', selectedReviewKeyword.keyword], ['搜索量 / KD', `${selectedReviewKeyword.volume.toLocaleString()} / ${selectedReviewKeyword.kd}`], ['搜索意图', selectedReviewKeyword.aiIntent], ['建议页面类型', selectedReviewKeyword.aiPageType], ['AI 置信度', `${Math.round(selectedReviewKeyword.aiConfidence * 100)}%`]]} />
              <ContentBlock title="AI 清洗建议">{selectedReviewKeyword.cleaningReason}</ContentBlock>
              <div className="flex flex-wrap gap-2">
                <Button tone="primary" onClick={() => updateKeywordStatus(selectedReviewKeyword.keywordId, 'approved')}>通过</Button>
                <Button tone="danger" onClick={() => updateKeywordStatus(selectedReviewKeyword.keywordId, 'rejected', { isValidUnused: false })}>排除</Button>
                <Button tone="secondary" onClick={() => updateKeywordStatus(selectedReviewKeyword.keywordId, 'duplicate_intent')}>合并到同义词</Button>
                <Button tone="secondary" onClick={() => showToast('已标记为品牌词，等待人工确认')}>标记品牌词</Button>
                <Button tone="secondary" onClick={() => updateKeywordStatus(selectedReviewKeyword.keywordId, 'rejected', { isPlatformTerm: true, isValidUnused: false })}>标记平台词</Button>
                <Button tone="secondary" onClick={() => updateKeywordStatus(selectedReviewKeyword.keywordId, 'hold')}>标记低价值</Button>
                <Button tone="secondary" onClick={() => updateKeywordStatus(selectedReviewKeyword.keywordId, 'hold', { isB2CTerm: true })}>标记疑似 B2C</Button>
                <Button tone="secondary" onClick={() => updateKeywordStatus(selectedReviewKeyword.keywordId, 'hold')}>保留观察</Button>
                <Button tone="secondary" onClick={() => setKeywordTab('allocation')}>标记待分配</Button>
              </div>
            </div>
          ) : (
            <EmptyState title="没有待审核关键词" text="可以先导入 CSV 或查看已清洗词库。" />
          )}
        </Panel>
      </div>
    )
  }

  function KeywordAllocationTab() {
    const candidates = keywords
      .filter((keyword) => keyword.status === 'approved' || keyword.status === 'pending_review')
      .slice(0, 8)
    const assignedToPage = keywords.filter((keyword) => keyword.assignedPageId === selectedAllocationPage.pageId)
    return (
      <div className="grid gap-4 xl:grid-cols-[0.8fr_1fr_0.8fr]">
        <Panel title="页面列表">
          <div className="space-y-2">
            {mockPages.slice(0, 10).map((page) => (
              <button key={page.pageId} className={cx('w-full rounded-lg border p-3 text-left transition', selectedAllocationPageId === page.pageId ? 'border-primary-300 bg-primary-50' : 'border-gray-200 bg-white hover:bg-gray-50')} onClick={() => setSelectedAllocationPageId(page.pageId)}>
                <p className="font-medium text-gray-900">{page.title}</p>
                <p className="mt-1 text-xs text-gray-500">{page.url}</p>
              </button>
            ))}
          </div>
        </Panel>
        <Panel title="候选关键词" description="点击关键词预览适配度。">
          <div className="space-y-3">
            {candidates.map((keyword) => (
              <div
                key={keyword.keywordId}
                role="button"
                tabIndex={0}
                className="w-full rounded-lg border border-gray-200 bg-white p-3 text-left transition hover:border-primary-200 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                onClick={() => openKeywordDrawer(keyword)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    openKeywordDrawer(keyword)
                  }
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-gray-900">{keyword.keyword}</span>
                  <span className="text-xs text-gray-500">{keyword.volume.toLocaleString()} / KD {keyword.kd}</span>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  <MiniFact label="页面当前定位" value={selectedAllocationPage.pageType} />
                  <MiniFact label="关键词意图" value={keyword.aiIntent} />
                  <MiniFact label="匹配度" value={keyword.aiPageType.includes(selectedAllocationPage.pageType.split(' ')[0]) ? '较高' : '需人工判断'} />
                </div>
                <p className="mt-2 text-xs text-orange-700">风险提示：分配前检查是否会造成蚕食，证据不足时不强行植入。</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" onClick={(event) => { event.stopPropagation(); updateKeywordStatus(keyword.keywordId, 'assigned_existing_page', { assignedPageId: selectedAllocationPage.pageId, assignedUrl: selectedAllocationPage.url, isUsed: true, isValidUnused: false }) }}>分配为主关键词</Button>
                  <Button size="sm" tone="secondary" onClick={(event) => { event.stopPropagation(); updateKeywordStatus(keyword.keywordId, 'assigned_existing_page', { assignedPageId: selectedAllocationPage.pageId, assignedUrl: selectedAllocationPage.url, isUsed: true, isValidUnused: false }) }}>分配为次关键词</Button>
                  <Button size="sm" tone="secondary" onClick={(event) => { event.stopPropagation(); showToast('已标记为不适合此页面，不会强行植入', 'orange') }}>不适合此页面</Button>
                  <Button size="sm" tone="secondary" onClick={(event) => { event.stopPropagation(); updateKeywordStatus(keyword.keywordId, 'unused_valid', { assignedPageId: null, assignedUrl: null, isUsed: false, isValidUnused: true }) }}>加入未使用词池</Button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="分配结果" description={selectedAllocationPage.url}>
          <InfoGrid items={[['页面当前定位', selectedAllocationPage.pageType], ['当前主关键词', selectedAllocationPage.primaryKeyword ?? '未设置'], ['建议主关键词', selectedAllocationPage.suggestedPrimaryKeyword ?? '暂无'], ['审计问题', `${selectedAllocationPage.auditIssueCount} 个`]]} />
          <ListBlock title="已分配关键词" items={assignedToPage.length ? assignedToPage.map((keyword) => keyword.keyword) : ['暂无分配，先选择候选关键词']} />
        </Panel>
      </div>
    )
  }

  function UnusedKeywordsTab() {
    const unused = keywords.filter((keyword) => keyword.status === 'unused_valid')
    return (
      <div className="space-y-4">
        <Notice tone="blue" title="未使用词池规则" text="这里仅包含已审核、有效、未分配、值得继续规划的关键词。不适合现有页面时，不强行植入。" />
        <FilterBar>
          <Button onClick={() => setKeywordTab('cluster')} icon={<Sparkles className="h-4 w-4" />}>加入超级聚类</Button>
          <Button tone="secondary" onClick={() => showToast('已保留待观察')}>保留待观察</Button>
          <Button tone="secondary" onClick={() => showToast('已排除选中词')}>排除</Button>
        </FilterBar>
        <SimpleTable
          headers={['关键词', 'Volume', 'KD', '意图', '建议方向', '原因', '是否进入聚类']}
          rows={unused.map((keyword) => [keyword.keyword, `${keyword.volume}`, `${keyword.kd}`, keyword.aiIntent, keyword.aiPageType, '现有页面不适合承接', '是'])}
          onRow={(index) => openKeywordDrawer(unused[index])}
        />
      </div>
    )
  }

  function SuperClusterTab() {
    return (
      <div className="space-y-4">
        <Notice tone="orange" title="超级聚类只处理未使用词池" text="它不会处理全部词库，也不会覆盖已分配页面；输出是新页面机会、内容任务或暂不处理。" />
        <div className="flex flex-wrap gap-2">
          <Button icon={<Sparkles className="h-4 w-4" />} onClick={() => openModalSteps('超级聚类演示', '输入为未使用词池，排除已分配关键词。', ['读取未使用词池', '排除已分配关键词', '按搜索意图聚类', '识别新页面机会', '生成内容任务 / 暂不处理'], () => showToast('超级聚类演示完成'))}>运行超级聚类</Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {mockClusters.map((cluster) => (
            <button key={cluster.clusterId} className="rounded-lg border border-gray-200 bg-white p-4 text-left transition hover:border-primary-200 hover:bg-primary-50" onClick={() => setDrawer({ title: cluster.clusterName, eyebrow: cluster.recommendedPageType, description: cluster.reason, content: <div className="space-y-4"><InfoGrid items={[['主关键词', cluster.primaryKeyword], ['搜索意图', cluster.searchIntent], ['建议 URL', cluster.recommendedUrl], ['推荐 CTA', cluster.recommendedCta], ['是否需要证据', cluster.needsEvidence ? '是' : '否']]} /><ListBlock title="包含关键词" items={[cluster.primaryKeyword, ...cluster.secondaryKeywords]} /><ListBlock title="内链目标" items={cluster.internalLinkTargets} /></div>, actions: [{ label: cluster.recommendedAction === 'new_page_task' ? '生成新页面任务' : '生成内容引擎交接任务', onClick: () => addGeneratedTask({ title: `${cluster.clusterName}：${cluster.recommendedPageType}`, description: cluster.reason, source: '超级聚类', taskType: cluster.recommendedAction === 'new_page_task' ? 'page_repair' : 'content_handoff', priority: 'p2', relatedKeywordIds: [cluster.primaryKeyword] }) }] })}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{cluster.clusterName}</p>
                  <p className="mt-1 text-sm text-gray-600">{cluster.primaryKeyword}</p>
                </div>
                <StatusBadge tone={cluster.recommendedAction === 'new_page_task' ? 'blue' : 'purple'}>{cluster.recommendedPageType}</StatusBadge>
              </div>
              <p className="mt-3 text-sm text-gray-600">{cluster.reason}</p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  function InternalLinksTab() {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {cannibalizationRisks.map((risk) => (
          <button key={risk.title} className="rounded-lg border border-gray-200 bg-white p-4 text-left transition hover:border-primary-200 hover:bg-primary-50" onClick={() => setDrawer({ title: risk.title, eyebrow: '内链与蚕食风险', content: <div className="space-y-4"><ListBlock title="相关页面" items={risk.pages} /><ContentBlock title="建议动作">{risk.action}</ContentBlock></div>, actions: [{ label: '生成内链任务', onClick: () => addGeneratedTask({ title: risk.title, description: risk.action, source: '内链与蚕食', taskType: 'audit_fix', priority: risk.level === 'high' ? 'p1' : 'p2' }) }, { label: '标记已处理', tone: 'green', onClick: () => showToast('风险已标记为已处理') }] })}>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-900">{risk.title}</p>
              <StatusBadge tone={risk.level === 'high' ? 'red' : risk.level === 'medium' ? 'orange' : 'gray'}>{risk.level}</StatusBadge>
            </div>
            <p className="mt-2 text-sm text-gray-600">{risk.action}</p>
          </button>
        ))}
      </div>
    )
  }

  function TrustPage() {
    const [trustTab, setTrustTab] = useState('company')
    return (
      <PageShell eyebrow="供应商可信度" title="把客户自己的 B2B 资料资产化" description="这里管理公司事实、产品线、能力边界和证据，不做第三方真假验证。">
        <div className="grid gap-4 lg:grid-cols-6">
          <MetricCard title="公司资料完整度" value="78%" detail="核心档案已建立" tone="green" icon={<Building2 className="h-5 w-5" />} />
          <MetricCard title="产品线资料完整度" value="64%" detail="MOQ / Lead Time 待确认" tone="orange" icon={<Boxes className="h-5 w-5" />} />
          <MetricCard title="证据素材数量" value="8" detail="3 项待确认" tone="blue" icon={<ShieldCheck className="h-5 w-5" />} />
          <MetricCard title="高风险声明" value="3" detail="不能直接写成事实" tone="red" icon={<AlertTriangle className="h-5 w-5" />} />
          <MetricCard title="缺失信任页面" value="2" detail="案例 / QC 报告" tone="purple" icon={<FileText className="h-5 w-5" />} />
          <MetricCard title="人工确认事实" value="6" detail="影响页面修复" tone="orange" icon={<ClipboardCheck className="h-5 w-5" />} />
        </div>
        <Panel
          title="B2B 上下文二级模块"
          action={
            <Segmented
              value={trustTab}
              onChange={setTrustTab}
              options={[
                ['company', '公司档案'],
                ['product', '产品线资料'],
                ['capability', '能力边界'],
                ['evidence', '证据库'],
                ['gap', '信任缺口'],
                ['redline', '内容事实红线'],
              ]}
            />
          }
        >
          {trustTab === 'company' && <InfoGrid items={[['公司名称', mockProject.company], ['供应链身份', mockProject.supplierIdentity], ['目标市场', mockProject.targetMarkets.join(' / ')], ['目标客户', mockProject.targetCustomers.join(' / ')], ['核心价值主张', 'OEM metal parts with controllable quality and export-ready RFQ workflow'], ['出口经验', '待证据确认']]} />}
          {trustTab === 'product' && <SimpleTable headers={['产品线名称', '规格', '材料', '应用', 'MOQ', 'Lead Time', '定制能力', '认证', '证据完整度']} rows={[['Custom Metal Parts', '按图纸定制', '不锈钢 / 铝 / 碳钢', '工业设备', '需确认', '需确认', 'OEM / ODM', 'ISO 9001', '72%'], ['Stainless Steel Fasteners', 'M3-M20', '304 / 316', 'Marine / Automotive', '需确认', '需确认', '表面处理', '待关联', '64%'], ['CNC Machined Components', '公差待确认', '铝 / 钢', 'Aerospace / Robotics', '需确认', '需确认', 'CNC machining', 'QC 报告待确认', '58%']]} />}
          {trustTab === 'capability' && <SimpleTable headers={['能力声明', '当前状态', '需要证据', '可用于页面', '风险提示']} rows={[['OEM Manufacturing', 'needs_evidence', '设备清单 / 车间图', '/capabilities/oem-manufacturing/', '不能写具体产能'], ['Quality Control', 'confirmed', 'ISO / QC 报告', '/quality-control/', '报告需脱敏'], ['Export Packaging', 'confirmed', '包装运输照片', '/faq/', '不要承诺固定交期']]} />}
          {trustTab === 'evidence' && <SimpleTable headers={['证据名称', '类型', '适用页面', '确认状态', '内容可用']} rows={mockEvidence.map((item) => [item.name, item.type, item.applicablePages.slice(0, 2).join(' / '), item.confirmed ? '已确认' : '待确认', item.canUseInContent ? '可用' : '不可用'])} onRow={(index) => openEvidenceDrawer(mockEvidence[index].evidenceId)} />}
          {trustTab === 'gap' && <div className="grid gap-3 md:grid-cols-2"><ActionCard title="OEM 设备证据缺口" text="影响 OEM Manufacturing 页面修复和能力声明。" icon={<AlertTriangle className="h-5 w-5" />} onClick={() => setDrawer({ title: 'Trust Gap Drawer', eyebrow: '缺口类型：能力证据', description: 'OEM 能力声明缺少设备照片、设备清单和产线说明。', content: <div className="space-y-4"><InfoGrid items={[['影响页面', '/capabilities/oem-manufacturing/'], ['为什么影响信任', '采购用户无法判断真实加工能力'], ['需要补充', '设备照片、设备型号、可公开产线说明'], ['是否影响页面修复', '是'], ['是否影响内容生产', '是']]} /></div>, actions: [{ label: '生成任务', onClick: () => addGeneratedTask({ title: '补充 OEM 设备证据', description: '补充或确认 OEM Manufacturing 证据。', source: '信任缺口', taskType: 'trust_evidence', priority: 'p1' }) }] })} /><ActionCard title="案例素材需脱敏" text="Automotive 案例可用范围不明确。" icon={<ShieldCheck className="h-5 w-5" />} onClick={() => showToast('已打开案例素材缺口', 'blue')} /></div>}
          {trustTab === 'redline' && <ListBlock title="不能声明内容" items={['不能写未确认产能数值', '不能承诺固定交期', '不能公开未脱敏客户名称', '不能把 needs_evidence 写成 confirmed', '不能做供应商真假验证']} />}
        </Panel>
        <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
          <Panel title="公司档案">
            <InfoGrid items={[['公司名称', mockProject.company], ['供应链身份', mockProject.supplierIdentity], ['目标市场', mockProject.targetMarkets.join(' / ')], ['目标客户', mockProject.targetCustomers.join(' / ')], ['核心价值主张', 'OEM metal parts with controllable quality and export-ready RFQ workflow'], ['出口经验', '待证据确认']]} />
          </Panel>
          <Panel title="证据库" action={<Button onClick={() => setModal({ title: '新增证据', description: '新增证据仅保存为演示状态。', content: <MockForm fields={['证据名称', '证据类型', '支持声明', '适用页面', '确认状态']} />, primaryLabel: '保存证据', onPrimary: () => showToast('证据演示数据已保存') })}>新增证据</Button>}>
            <SimpleTable headers={['证据名称', '类型', '适用页面', '确认状态', '内容可用']} rows={mockEvidence.map((item) => [item.name, item.type, item.applicablePages.slice(0, 2).join(' / '), item.confirmed ? '已确认' : '待确认', item.canUseInContent ? '可用' : '不可用'])} onRow={(index) => openEvidenceDrawer(mockEvidence[index].evidenceId)} />
          </Panel>
        </div>
      </PageShell>
    )
  }

  function ContentPage() {
    const [contentTab, setContentTab] = useState('opportunities')
    return (
      <PageShell eyebrow="内容运营" title="未使用词进入内容生产，内容引擎只负责执行" description="系统决定写什么、为什么写、用什么证据和链接到哪里，再交接给内容引擎。">
        <div className="grid gap-4 lg:grid-cols-5">
          <MetricCard title="待生成内容简报" value="12" detail="来自未使用词池" tone="blue" icon={<FileText className="h-5 w-5" />} />
          <MetricCard title="待交接" value="8" detail="内容引擎" tone="purple" icon={<Send className="h-5 w-5" />} />
          <MetricCard title="质量审查未通过" value="3" detail="需退回修改" tone="red" icon={<AlertTriangle className="h-5 w-5" />} />
          <MetricCard title="发布前审查" value="5" detail="只做审查包" tone="orange" icon={<ClipboardCheck className="h-5 w-5" />} />
          <MetricCard title="证据不足" value="4" detail="不可直接写事实" tone="orange" icon={<ShieldCheck className="h-5 w-5" />} />
        </div>
        <Panel
          title="内容运营二级模块"
          action={
            <Segmented
              value={contentTab}
              onChange={setContentTab}
              options={[
                ['opportunities', '内容机会'],
                ['handoff', '内容引擎交接包'],
                ['briefs', '内容简报队列'],
                ['qa', '质量审查结果'],
                ['review', '发布前审查包'],
              ]}
            />
          }
        >
          {contentTab === 'opportunities' && (
            <SimpleTable
              headers={['任务标题', '来源关键词', '来源聚类', '建议内容类型', '目标页面', '需要证据', '状态']}
              rows={mockContentOpportunities.map((item) => [item.title, item.sourceKeywords.join(', '), item.cluster, item.suggestedContentType, item.targetPage, item.needsEvidence ? '是' : '否', item.status])}
              onRow={(index) => openHandoffDrawer(mockContentOpportunities[index].title)}
            />
          )}
          {contentTab === 'handoff' && <div className="grid gap-3 md:grid-cols-2">{mockContentOpportunities.slice(0, 4).map((item) => <ActionCard key={item.opportunityId} title={item.title} text="生成关键词、读者、证据、内链和质量审查规则交接包。" icon={<Send className="h-5 w-5" />} onClick={() => openHandoffDrawer(item.title)} />)}</div>}
          {contentTab === 'briefs' && <SimpleTable headers={['内容简报', '来源聚类', '目标页面', '证据要求', '状态']} rows={mockContentOpportunities.map((item) => [item.title, item.cluster, item.targetPage, item.needsEvidence ? '需要证据' : '无需新增证据', item.status === 'brief_pending' ? '待生成' : '已进入后续'])} />}
          {contentTab === 'qa' && (
            <SimpleTable
              headers={['内容任务', '质量审查状态', '问题', '动作']}
              rows={[
                ['金属零件表面处理选项', '未通过', '证据不足 2 条', '退回修改'],
                ['金属零件出口包装标准', '待审查', '交期表达需确认', '人工确认'],
                ['询价准备清单', '通过', '无越界声明', '进入交付'],
              ]}
              onRow={(index) => setDrawer({
                title: '质量审查详情',
                eyebrow: `质量审查结果 ${index + 1}`,
                description: '检查内容是否越过事实边界、缺少证据或内链错误。',
                content: <ListBlock title="质量审查项" items={['证据引用是否足够', '是否出现禁用表达', '内链是否指向商业页', 'CTA 是否符合 RFQ 目标']} />,
                actions: [{
                  label: '退回修改',
                  tone: 'orange',
                  onClick: () => addGeneratedTask({ title: '退回内容草稿修改', description: '根据质量审查结果补证据和改禁用表达。', source: '质量审查', taskType: 'qa_revision', priority: 'p1' }),
                }],
              })}
            />
          )}
          {contentTab === 'review' && <ListBlock title="发布前审查包" items={['确认不自动发布', '确认所有事实有证据', '确认内部链接目标', '确认禁用表达未出现', '导出本地审查摘要']} />}
        </Panel>
      </PageShell>
    )
  }

  function TasksPage() {
    const [taskFilter, setTaskFilter] = useState<'all' | 'p0p1' | 'review' | 'blocked'>('all')
    const filteredTasks = tasks.filter((task) => {
      if (taskFilter === 'p0p1') return task.priority === 'p0' || task.priority === 'p1'
      if (taskFilter === 'review') return task.status === 'needs_review'
      if (taskFilter === 'blocked') return task.status === 'blocked'
      return true
    })
    return (
      <PageShell eyebrow="任务中心" title="所有子系统输出都变成可执行任务" description="按优先级、来源、状态、页面和关键词处理；状态按钮只改变本地演示数据。">
        <div className="grid gap-4 lg:grid-cols-4">
          <MetricCard title="今日建议处理" value={String(tasks.filter((task) => task.status !== 'done').length)} detail="按优先级排序" tone="blue" icon={<Target className="h-5 w-5" />} />
          <MetricCard title="高优先级任务" value={String(tasks.filter((task) => task.priority === 'p0' || task.priority === 'p1').length)} detail="P0 / P1" tone="red" icon={<AlertTriangle className="h-5 w-5" />} />
          <MetricCard title="等待人工确认" value={String(metrics.waitingReview)} detail="不可自动通过" tone="orange" icon={<ClipboardCheck className="h-5 w-5" />} />
          <MetricCard title="已完成" value={String(metrics.completedTasks)} detail="演示状态" tone="green" icon={<CheckCircle2 className="h-5 w-5" />} />
        </div>
        <Panel title="任务列表" action={<Segmented value={taskFilter} onChange={(value) => setTaskFilter(value as typeof taskFilter)} options={[['all', '全部'], ['p0p1', 'P0/P1'], ['review', '待确认'], ['blocked', '等待资料']]} />}>
          <TaskTable tasks={filteredTasks} onOpen={openTaskDrawer} />
        </Panel>
      </PageShell>
    )
  }

  function AssetsPage() {
    const [assetTab, setAssetTab] = useState('all')
    const visibleAssets = mockAssets.filter((asset) => {
      if (assetTab === 'all') return true
      if (assetTab === 'image') return asset.type === '图片'
      if (assetTab === 'pdf') return asset.type.includes('PDF') || asset.type.includes('Catalog')
      if (assetTab === 'cert') return asset.type.includes('证书')
      if (assetTab === 'case') return asset.type.includes('案例')
      if (assetTab === 'unlinked') return asset.relatedPages.length === 0 || asset.relatedEvidence.length === 0
      if (assetTab === 'alt') return asset.altStatus !== 'has_alt'
      return true
    })
    return (
      <PageShell eyebrow="资料与素材库" title="素材要关联到页面、证据和内容任务" description="管理产品图、工厂图、证书、案例、PDF、Catalog 和 ALT 状态。">
        <div className="grid gap-4 lg:grid-cols-4">
          <MetricCard title="全部素材" value="8" detail="原型样本" tone="blue" icon={<Archive className="h-5 w-5" />} />
          <MetricCard title="ALT 缺失" value="2" detail="可生成建议" tone="orange" icon={<FileText className="h-5 w-5" />} />
          <MetricCard title="未确认素材" value="3" detail="不可用于内容" tone="red" icon={<ShieldCheck className="h-5 w-5" />} />
          <MetricCard title="可用于内容" value="5" detail="已确认" tone="green" icon={<CheckCircle2 className="h-5 w-5" />} />
        </div>
        <Panel
          title="素材列表"
          action={
            <Segmented
              value={assetTab}
              onChange={setAssetTab}
              options={[
                ['all', '全部素材'],
                ['image', '图片'],
                ['pdf', 'PDF / Catalog'],
                ['cert', '证书'],
                ['case', '案例素材'],
                ['unlinked', '未关联素材'],
                ['alt', 'ALT 与 SEO 状态'],
              ]}
            />
          }
        >
          <SimpleTable
            headers={['素材名称', '类型', '用途', '关联页面', 'ALT 状态', '可用于内容', '确认状态']}
            rows={visibleAssets.map((asset) => [asset.name, asset.type, asset.purpose, asset.relatedPages.join(' / ') || '未关联', asset.altStatus, asset.canUseInContent ? '是' : '否', asset.confirmed ? '已确认' : '待确认'])}
            onRow={(index) => {
              const asset = visibleAssets[index]
              setDrawer({
                title: asset.name,
                eyebrow: asset.type,
                description: asset.purpose,
                content: (
                  <div className="space-y-4">
                    <div className="flex aspect-[16/9] items-center justify-center rounded-lg border border-gray-200 bg-gray-100">
                      <FileArchive className="h-12 w-12 text-gray-400" />
                    </div>
                    <InfoGrid items={[['当前 ALT', asset.currentAlt || '缺失'], ['建议 ALT', asset.suggestedAlt], ['可支撑声明', asset.relatedEvidence.join(', ')], ['关联页面', asset.relatedPages.join(' / ')]]} />
                    <ContentBlock title="风险提示">{asset.confirmed ? '已确认可用于对应模块。' : '未确认素材不能用于最终内容或页面修复包。'}</ContentBlock>
                  </div>
                ),
                actions: [
                  { label: '生成 ALT 建议', onClick: () => showToast('ALT 建议已生成，需要人工确认', 'blue') },
                  { label: '关联页面', tone: 'blue', onClick: () => showToast('已关联到演示页面') },
                  { label: '关联证据', tone: 'blue', onClick: () => showToast('已关联到演示证据') },
                  { label: '标记不可用', tone: 'red', onClick: () => showToast('素材已标记为不可用', 'orange') },
                ],
              })
            }}
          />
        </Panel>
      </PageShell>
    )
  }

  function DeliveryPage() {
    return (
      <PageShell eyebrow="交付中心" title="把已确认结果整理成可审查交付包" description="交付包可以预览和演示导出，但不会发布到 WordPress。">
        <div className="grid gap-4 lg:grid-cols-4">
          <MetricCard title="可导出包" value="4" detail="本地演示数据" tone="green" icon={<Download className="h-5 w-5" />} />
          <MetricCard title="待审查包" value="2" detail="需人工确认" tone="orange" icon={<ClipboardCheck className="h-5 w-5" />} />
          <MetricCard title="最近导出" value="未导出" detail="当前为原型" tone="gray" icon={<FileArchive className="h-5 w-5" />} />
          <MetricCard title="未完成风险" value="4" detail="证据与关键词审核" tone="red" icon={<AlertTriangle className="h-5 w-5" />} />
        </div>
        <Panel title="交付包">
          <div className="grid gap-3 md:grid-cols-2">
            {mockDeliveryPackages.map((pkg) => (
              <button key={pkg.packageId} className="rounded-lg border border-gray-200 bg-white p-4 text-left transition hover:border-primary-200 hover:bg-primary-50" onClick={() => setDrawer({ title: pkg.name, eyebrow: pkg.type, description: '交付包只导出本地演示数据，不包含真实凭据或敏感文件。', content: <div className="space-y-4"><ListBlock title="包含内容" items={pkg.includedModules} /><ListBlock title="未完成风险" items={pkg.uncompletedRisks} /><ListBlock title="人工审查项" items={pkg.humanReviewItems} /></div>, actions: [{ label: '预览 Markdown', icon: <Eye className="h-4 w-4" />, onClick: () => showToast('Markdown 预览已打开演示状态', 'blue') }, { label: '复制摘要', icon: <ClipboardCheck className="h-4 w-4" />, onClick: () => showToast('交付摘要已复制到演示剪贴板', 'blue') }, { label: '生成导出包', icon: <Download className="h-4 w-4" />, onClick: () => openExportModal(pkg.name) }] })}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{pkg.name}</p>
                    <p className="mt-1 text-sm text-gray-600">{pkg.includedModules.join(' / ')}</p>
                  </div>
                  <StatusBadge tone={pkg.status === 'ready' ? 'green' : 'orange'}>{pkg.status}</StatusBadge>
                </div>
              </button>
            ))}
          </div>
        </Panel>
      </PageShell>
    )
  }

  function AiWorkbenchPage() {
    const [aiTab, setAiTab] = useState('prompts')
    const [health, setHealth] = useState<BackendHealth | null>(null)
    const [prompts, setPrompts] = useState<PromptDefinition[]>([])
    const [runs, setRuns] = useState<AgentRun[]>([])
    const [selectedPromptId, setSelectedPromptId] = useState('')
    const [contextPreset, setContextPreset] = useState('keyword_sample')
    const [userInstruction, setUserInstruction] = useState('请根据当前样本上下文生成结构化输出，并保留所有人工审核点。')
    const [reviewNotes, setReviewNotes] = useState('已人工审查输出摘要、结构化 JSON、任务候选和安全边界。')
    const [aiBusy, setAiBusy] = useState(false)
    const [aiError, setAiError] = useState('')

    useEffect(() => {
      void refreshAiWorkbench()
    }, [])

    async function refreshAiWorkbench() {
      setAiBusy(true)
      setAiError('')
      try {
        const [nextHealth, nextPrompts, nextRuns] = await Promise.all([fetchHealth(), fetchPrompts(), fetchRuns()])
        setHealth(nextHealth)
        setPrompts(nextPrompts)
        setRuns(nextRuns)
        setSelectedPromptId((current) => current || nextPrompts.find((prompt) => prompt.promptId === 'keyword-ai-cleaning-v1')?.promptId || nextPrompts[0]?.promptId || '')
      } catch (error) {
        setAiError(error instanceof Error ? error.message : '智能体任务中心后端请求失败')
      } finally {
        setAiBusy(false)
      }
    }

    async function openPromptDefinition(promptId: string) {
      try {
        const prompt = await fetchPrompt(promptId)
        setDrawer({
          title: prompt.name,
          eyebrow: `${labelFromMap(prompt.category, promptCategoryLabels)} · ${prompt.version}`,
          description: prompt.purpose,
          content: (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone={prompt.status === 'active' ? 'green' : 'gray'}>{labelFromMap(prompt.status, promptStatusLabels)}</StatusBadge>
                <StatusBadge tone="orange">人工审核：{prompt.requiresHumanReview ? '需要' : '不需要'}</StatusBadge>
                <StatusBadge tone={prompt.canWriteWordPress ? 'red' : 'green'}>写入 WordPress：{prompt.canWriteWordPress ? '允许' : '禁止'}</StatusBadge>
              </div>
              <ListBlock title="输入字段" items={fieldLabels(prompt.inputFields)} />
              <ListBlock title="输出字段" items={fieldLabels(prompt.outputFields)} />
              <ListBlock title="人工确认点" items={prompt.humanReviewItems || ['所有输出进入人工审核']} />
              <ContentBlock title="失败处理">{prompt.failureHandling || '失败时进入人工重试'}</ContentBlock>
              <CodePreview title="Markdown 提示词模板" value={prompt.markdownTemplate || ''} />
              <CodePreview title="JSON 结构摘要" value={JSON.stringify(schemaSummaryWithChineseLabels(prompt.jsonSchemaSummary || {}), null, 2)} />
            </div>
          ),
          actions: [
            {
              label: '选择执行',
              icon: <PlayCircle className="h-4 w-4" />,
              onClick: () => {
                setSelectedPromptId(prompt.promptId)
                setAiTab('create')
              },
            },
          ],
        })
      } catch (error) {
        showToast(error instanceof Error ? error.message : '提示词读取失败', 'red')
      }
    }

    async function handleCreateRun() {
      if (!selectedPromptId) return
      setAiBusy(true)
      setAiError('')
      try {
        const run = await createAgentRun({ promptId: selectedPromptId, contextPreset, userInstruction })
        setRuns((current) => [run, ...current])
        setAiTab('runs')
        showToast('已生成手动提示词包和模拟输出，等待人工审核', 'blue')
      } catch (error) {
        setAiError(error instanceof Error ? error.message : '创建执行失败')
      } finally {
        setAiBusy(false)
      }
    }

    async function openRunDetail(runId: string) {
      try {
        const run = await fetchRun(runId)
        setDrawer({
          title: run.promptName,
          eyebrow: `${run.runId} · ${labelFromMap(run.status, agentRunStatusLabels)}`,
          description: run.outputEnvelope?.summaryMarkdown || '执行记录详情',
          content: (
            <div className="space-y-4">
              <InfoGrid
                items={[
                  ['运行模式', labelFromMap(run.model, modeLabels)],
                  ['上下文', labelFromMap(run.contextPreset, contextPresetLabels)],
                  ['状态', labelFromMap(run.status, agentRunStatusLabels)],
                  ['人工审核', labelFromMap(run.humanReview?.decision || 'pending', reviewDecisionLabels)],
                ]}
              />
              <ListBlock title="模拟输出字段" items={fieldLabels(Object.keys(run.outputEnvelope?.structuredOutput || {}))} />
              <CodePreview title="手动提示词包" value={run.manualPromptPackage?.markdown || ''} />
              <CodePreview title="模拟输出 JSON" value={JSON.stringify(run.outputEnvelope || {}, null, 2)} />
            </div>
          ),
          actions: [
            {
              label: '复制提示词',
              icon: <ClipboardCheck className="h-4 w-4" />,
              onClick: () => copyText(run.manualPromptPackage?.markdown || '', '提示词已复制'),
            },
            {
              label: '进入审核',
              icon: <ShieldCheck className="h-4 w-4" />,
              onClick: () => setAiTab('reviews'),
            },
          ],
        })
      } catch (error) {
        showToast(error instanceof Error ? error.message : '执行记录读取失败', 'red')
      }
    }

    async function handleReview(runId: string, decision: HumanReviewDecision) {
      setAiBusy(true)
      setAiError('')
      try {
        const updated = await reviewAgentRun(runId, decision, reviewNotes)
        setRuns((current) => current.map((run) => (run.runId === runId ? { ...run, ...updated } : run)))
        showToast(decision === 'approved' ? '输出已批准，仍需人工执行后续动作' : '输出已进入失败或修订状态', decision === 'approved' ? 'green' : 'orange')
      } catch (error) {
        setAiError(error instanceof Error ? error.message : '审核提交失败')
      } finally {
        setAiBusy(false)
      }
    }

    async function handleCancel(runId: string) {
      setAiBusy(true)
      setAiError('')
      try {
        const updated = await cancelAgentRun(runId)
        setRuns((current) => current.map((run) => (run.runId === runId ? { ...run, ...updated } : run)))
        showToast('执行记录已取消', 'orange')
      } catch (error) {
        setAiError(error instanceof Error ? error.message : '取消失败')
      } finally {
        setAiBusy(false)
      }
    }

    async function copyText(value: string, message: string) {
      if (!value) return
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(value)
          showToast(message, 'blue')
          return
        }
      } catch {
        // Clipboard permission can be unavailable in some embedded browsers.
      }
      showToast('当前浏览器未开放剪贴板权限，可在详情中手动复制', 'orange')
    }

    const selectedPrompt = prompts.find((prompt) => prompt.promptId === selectedPromptId) || prompts[0]
    const pendingRuns = runs.filter((run) => run.status === 'waiting_for_human')

    return (
        <PageShell eyebrow="智能体任务中心" title="任务包、Artifact 与回填解析记录" description="这里管理程序内 AI 生成的任务包、外部智能体回填的 Artifact，以及回填解析和人工审核记录。">
        <div className="grid gap-4 lg:grid-cols-4">
          <MetricCard title="本地后端" value={health?.ok ? '可用' : '未连接'} detail={health ? `提示词 ${health.promptCount} 个` : '等待检测'} tone={health?.ok ? 'green' : 'orange'} icon={<Cpu className="h-5 w-5" />} />
          <MetricCard title="程序内 AI" value="任务包 / 解析" detail="不负责复杂抓取" tone="purple" icon={<Sparkles className="h-5 w-5" />} />
          <MetricCard title="外部智能体" value="执行层" detail="抓取 / 搜索 / 审计 / 调研" tone="blue" icon={<Bot className="h-5 w-5" />} />
          <MetricCard title="WordPress 写入" value="禁止" detail="不发布、不上传媒体" tone="red" icon={<ShieldCheck className="h-5 w-5" />} />
        </div>
        {aiError && <div className="rounded-lg border border-danger-100 bg-danger-50 px-4 py-3 text-sm text-danger-700">{aiError}</div>}
        <Panel
          title="智能体任务中心模块"
          action={
            <Segmented
              value={aiTab}
              onChange={setAiTab}
              options={[
                ['prompts', '提示词库'],
                ['create', '新建执行'],
                ['runs', '执行记录'],
                ['reviews', '人工审核'],
                ['contracts', '契约与边界'],
              ]}
            />
          }
        >
          {aiTab === 'prompts' && (
            prompts.length ? (
              <SimpleTable
                headers={['名称', '类别', '输入', '输出', '人工审核', '写 WordPress', '状态']}
                rows={prompts.map((prompt) => [prompt.name, labelFromMap(prompt.category, promptCategoryLabels), fieldLabels(prompt.inputFields).join('、'), fieldLabels(prompt.outputFields).join('、'), prompt.requiresHumanReview ? '需要' : '不需要', prompt.canWriteWordPress ? '允许' : '禁止', labelFromMap(prompt.status, promptStatusLabels)])}
                onRow={(index) => void openPromptDefinition(prompts[index].promptId)}
              />
            ) : (
              <EmptyState title="提示词库未加载" text="请先确认本地后端 4310 是否可用。" action="重新加载" onClick={() => void refreshAiWorkbench()} />
            )
          )}
          {aiTab === 'create' && (
            <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
              <div className="space-y-4">
                <label className="block">
                  <span className="text-xs font-medium text-gray-600">提示词</span>
                  <select className="mt-1 min-h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100" value={selectedPromptId} onChange={(event) => setSelectedPromptId(event.target.value)}>
                    {prompts.map((prompt) => <option key={prompt.promptId} value={prompt.promptId}>{prompt.name}</option>)}
                  </select>
                </label>
                <div>
                  <p className="text-xs font-medium text-gray-600">上下文</p>
                  <div className="mt-2">
                    <Segmented
                      value={contextPreset}
                      onChange={setContextPreset}
                      options={[
                        ['project_sample', '项目'],
                        ['keyword_sample', '关键词'],
                        ['audit_sample', '审计'],
                        ['page_repair_sample', '页面修复'],
                        ['delivery_sample', '交付'],
                      ]}
                    />
                  </div>
                </div>
                <label className="block">
                  <span className="text-xs font-medium text-gray-600">用户补充指令</span>
                  <textarea className="mt-1 min-h-28 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100" value={userInstruction} onChange={(event) => setUserInstruction(event.target.value)} />
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button icon={<PlayCircle className="h-4 w-4" />} onClick={() => void handleCreateRun()}>{aiBusy ? '生成中' : '生成手动提示词包'}</Button>
                  <Button tone="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={() => void refreshAiWorkbench()}>刷新</Button>
                </div>
              </div>
              <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-950">{selectedPrompt?.name || '请选择提示词'}</p>
                <p className="text-sm leading-6 text-gray-600">{selectedPrompt?.purpose || '本地后端连接后会显示提示词说明。'}</p>
                <InfoGrid items={[['运行模式', labelFromMap('manual_mock', modeLabels)], ['人工审核', selectedPrompt?.requiresHumanReview ? '需要' : '不需要'], ['写 WordPress', selectedPrompt?.canWriteWordPress ? '允许' : '禁止'], ['可生成任务候选', selectedPrompt?.canCreateTasks ? '是' : '否']]} />
                {selectedPrompt && <ListBlock title="输出字段" items={fieldLabels(selectedPrompt.outputFields)} />}
              </div>
            </div>
          )}
          {aiTab === 'runs' && (
            <div className="space-y-4">
              <ProgressRows rows={[['准备输入上下文', 100, '由本地样本上下文生成'], ['生成手动提示词包', runs.length ? 100 : 0, runs.length ? '已有执行记录' : '待生成'], ['模拟输出预览', runs.length ? 100 : 0, runs.length ? '可查看 JSON' : '待生成'], ['人工确认', runs.length ? Math.max(15, Math.round(((runs.length - pendingRuns.length) / runs.length) * 100)) : 0, `${pendingRuns.length} 待审核`]]} />
              {runs.length ? (
                <SimpleTable
                  headers={['运行', '提示词', '模式', '状态', '审核', '创建时间']}
                  rows={runs.map((run) => [run.runId, run.promptName, labelFromMap(run.model, modeLabels), labelFromMap(run.status, agentRunStatusLabels), labelFromMap(run.humanReview?.decision || 'pending', reviewDecisionLabels), run.createdAt])}
                  onRow={(index) => void openRunDetail(runs[index].runId)}
                />
              ) : (
                <EmptyState title="还没有执行记录" text="先从新建执行生成一个手动提示词包和模拟输出。" action="新建执行" onClick={() => setAiTab('create')} />
              )}
            </div>
          )}
          {aiTab === 'reviews' && (
            <div className="space-y-4">
              <label className="block">
                <span className="text-xs font-medium text-gray-600">审核备注</span>
                <textarea className="mt-1 min-h-20 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100" value={reviewNotes} onChange={(event) => setReviewNotes(event.target.value)} />
              </label>
              {pendingRuns.length ? (
                <div className="grid gap-3 lg:grid-cols-2">
                  {pendingRuns.map((run) => (
                    <div key={run.runId} className="rounded-lg border border-gray-200 bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-950">{run.promptName}</p>
                          <p className="mt-1 text-xs text-gray-500">{run.runId}</p>
                        </div>
                        <StatusBadge tone="orange">等待人工审核</StatusBadge>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-gray-600">{run.summaryMarkdown || run.outputEnvelope?.summaryMarkdown}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button size="sm" icon={<CheckCircle2 className="h-4 w-4" />} onClick={() => void handleReview(run.runId, 'approved')}>批准输出</Button>
                        <Button size="sm" tone="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={() => void handleReview(run.runId, 'revision_needed')}>需要修订</Button>
                        <Button size="sm" tone="danger" icon={<X className="h-4 w-4" />} onClick={() => void handleReview(run.runId, 'rejected')}>驳回</Button>
                        <Button size="sm" tone="secondary" icon={<Eye className="h-4 w-4" />} onClick={() => void openRunDetail(run.runId)}>查看</Button>
                        <Button size="sm" tone="secondary" icon={<X className="h-4 w-4" />} onClick={() => void handleCancel(run.runId)}>取消</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="没有待审核输出" text="所有输出都必须先人工审核，批准后仍只作为本地建议。" action="查看执行记录" onClick={() => setAiTab('runs')} />
              )}
            </div>
          )}
          {aiTab === 'contracts' && (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-4">
                <BoundaryCard title="允许" tone="green" items={['生成手动提示词包', '生成模拟输出', '保存本地执行记录']} />
                <BoundaryCard title="禁止" tone="red" items={['调用真实 AI API', '写入 WordPress', '发布页面或文章']} />
                <BoundaryCard title="需要人工确认" tone="orange" items={['关键词最终分配', '商业事实', '页面修复包', '交付包']} />
                <BoundaryCard title="存储" tone="green" items={['提示词内置只读', '执行记录写入本地 JSON', '不保存密钥']} />
              </div>
              <SimpleTable headers={['提示词', '输入字段', '输出字段', '失败处理']} rows={prompts.map((prompt) => [prompt.name, fieldLabels(prompt.inputFields).join('、'), fieldLabels(prompt.outputFields).join('、'), prompt.failureHandling || '进入人工重试'])} onRow={(index) => void openPromptDefinition(prompts[index].promptId)} />
            </div>
          )}
        </Panel>
      </PageShell>
    )
  }

  function SettingsPage() {
    const boundaries = ['程序内 AI 只负责任务包生成和 Artifact 解析', '复杂抓取、搜索、审计、调研由外部智能体完成', '只支持 WordPress B2B 独立站', '当前为只读模式', '不自动发布', '不写入 WordPress', '不上传媒体', '不自动确认商业事实', '不做供应商验证', '不做多站点后台', '不做 Shopify / Webflow 适配', '不做外链 / 广告 / CRM']
    const [backendHealth, setBackendHealth] = useState<BackendHealth | null>(null)
    const [backendError, setBackendError] = useState('')
    const [aiSettings, setAiSettings] = useState<AiSettings | null>(null)
    const [aiDraft, setAiDraft] = useState({
      mode: 'manual_mock' as AiMode,
      provider: 'openai_compatible' as AiProvider,
      endpoint: '',
      model: 'manual-mock',
      apiKey: '',
      temperature: '0.2',
      maxTokens: '4000',
      requestTimeoutMs: '30000',
    })
    const [aiRuns, setAiRuns] = useState<AiCallRun[]>([])
    const [aiSettingsBusy, setAiSettingsBusy] = useState(false)
    const [aiSettingsError, setAiSettingsError] = useState('')
    const [aiTestResult, setAiTestResult] = useState('')
    const [aiTestPrompt, setAiTestPrompt] = useState('请用一句话说明当前 AI API 已经可以被 B2B SEO OS 调用。')
    const [aiGeneratedPreview, setAiGeneratedPreview] = useState('')
    const inputClass = 'mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100'

    useEffect(() => {
      void refreshBackendHealth()
      void refreshAiApiPanel()
    }, [])

    async function refreshBackendHealth() {
      try {
        const nextHealth = await fetchHealth()
        setBackendHealth(nextHealth)
        setBackendError('')
      } catch (error) {
        setBackendHealth(null)
        setBackendError(error instanceof Error ? error.message : '本地后端不可用')
      }
    }

    async function refreshAiApiPanel() {
      try {
        const [settings, runs] = await Promise.all([fetchAiSettings(), fetchAiCallRuns()])
        setAiSettings(settings)
        setAiDraft({
          mode: settings.mode,
          provider: settings.provider,
          endpoint: settings.endpoint,
          model: settings.model,
          apiKey: '',
          temperature: String(settings.temperature),
          maxTokens: String(settings.maxTokens),
          requestTimeoutMs: String(settings.requestTimeoutMs),
        })
        setAiRuns(runs)
        setAiSettingsError('')
      } catch (error) {
        setAiSettingsError(error instanceof Error ? error.message : 'AI 设置读取失败')
      }
    }

    async function saveAiSettingsFromUi(clearApiKey = false) {
      setAiSettingsBusy(true)
      try {
        const settings = await saveAiSettings({
          mode: aiDraft.mode,
          provider: aiDraft.provider,
          endpoint: aiDraft.endpoint,
          model: aiDraft.model,
          apiKey: aiDraft.apiKey.trim() ? aiDraft.apiKey : undefined,
          clearApiKey,
          temperature: Number(aiDraft.temperature),
          maxTokens: Number(aiDraft.maxTokens),
          requestTimeoutMs: Number(aiDraft.requestTimeoutMs),
        })
        setAiSettings(settings)
        setAiDraft((current) => ({ ...current, apiKey: '' }))
        setAiSettingsError(clearApiKey ? 'AI API Key 已清除。' : '全局 AI API 设置已保存。')
        await refreshBackendHealth()
        await refreshAiApiPanel()
      } catch (error) {
        const message = error instanceof Error ? error.message : 'AI 设置保存失败'
        setAiSettingsError(message)
      } finally {
        setAiSettingsBusy(false)
      }
    }

    async function testAiConnectionFromUi() {
      setAiSettingsBusy(true)
      try {
        const response = await testAiApiConnection()
        setAiTestResult(response.result.message)
        setAiSettings(response.settings)
        setAiSettingsError('')
        await refreshAiApiPanel()
        await refreshBackendHealth()
      } catch (error) {
        const message = error instanceof Error ? error.message : 'AI 连接测试失败'
        setAiTestResult('')
        setAiSettingsError(message)
      } finally {
        setAiSettingsBusy(false)
      }
    }

    async function generateAiPreviewFromUi() {
      setAiSettingsBusy(true)
      try {
        const response = await generateAiText({
          purpose: 'settings_panel_smoke_test',
          messages: [
            { role: 'system', content: '你是 B2B SEO OS 的全局 AI 调用测试助手。只需要验证调用链路是否可用。' },
            { role: 'user', content: aiTestPrompt },
          ],
          temperature: Number(aiDraft.temperature),
          maxTokens: Math.min(Number(aiDraft.maxTokens) || 800, 1200),
        })
        setAiGeneratedPreview(response.result.content)
        setAiSettingsError('')
        await refreshAiApiPanel()
      } catch (error) {
        const message = error instanceof Error ? error.message : 'AI 试生成失败'
        setAiGeneratedPreview('')
        setAiSettingsError(message)
      } finally {
        setAiSettingsBusy(false)
      }
    }

    return (
      <PageShell eyebrow="设置 / 系统状态" title="双 AI 层、安全边界和本地运行设置" description="这页明确区分程序内 AI 和外部执行层 AI，并展示哪些动作允许、禁止、需要人工确认。">
        <Panel
          title="全局 AI API 设置"
          description="这是整个程序统一使用的 AI 调用能力。后续元提示词编译、Artifact 解析和上下文转化都只能走这套全局接口。"
          action={<StatusBadge tone={aiSettings?.mode === 'real_api' ? (aiSettings.apiKeyConfigured ? 'green' : 'orange') : 'blue'}>{aiSettings?.mode === 'real_api' ? (aiSettings.apiKeyConfigured ? '真实 API 已配置' : '真实 API 缺少 Key') : '手动模拟模式'}</StatusBadge>}
        >
          <div className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium text-gray-700">
                  调用模式
                  <select className={inputClass} value={aiDraft.mode} onChange={(event) => setAiDraft((current) => ({ ...current, mode: event.target.value as AiMode }))}>
                    <option value="manual_mock">手动模拟模式</option>
                    <option value="real_api">真实 API 模式</option>
                  </select>
                </label>
                <label className="text-sm font-medium text-gray-700">
                  Provider
                  <select className={inputClass} value={aiDraft.provider} onChange={(event) => setAiDraft((current) => ({ ...current, provider: event.target.value as AiProvider }))}>
                    <option value="openai_compatible">OpenAI-compatible</option>
                    <option value="xiaomi_mimo">小米 Mimo</option>
                    <option value="custom">自定义兼容接口</option>
                  </select>
                </label>
                <label className="text-sm font-medium text-gray-700 md:col-span-2">
                  API Endpoint
                  <input className={inputClass} value={aiDraft.endpoint} onChange={(event) => setAiDraft((current) => ({ ...current, endpoint: event.target.value }))} placeholder="例如：https://api.example.com/v1/chat/completions" />
                </label>
                <label className="text-sm font-medium text-gray-700">
                  模型名称
                  <input className={inputClass} value={aiDraft.model} onChange={(event) => setAiDraft((current) => ({ ...current, model: event.target.value }))} placeholder="例如：gpt-4.1-mini / mimo-xxx" />
                </label>
                <label className="text-sm font-medium text-gray-700">
                  API Key
                  <input className={inputClass} type="password" value={aiDraft.apiKey} onChange={(event) => setAiDraft((current) => ({ ...current, apiKey: event.target.value }))} placeholder={aiSettings?.apiKeyConfigured ? '已配置，留空则保持不变' : '只保存到本地 runtime'} />
                </label>
                <label className="text-sm font-medium text-gray-700">
                  Temperature
                  <input className={inputClass} value={aiDraft.temperature} onChange={(event) => setAiDraft((current) => ({ ...current, temperature: event.target.value }))} />
                </label>
                <label className="text-sm font-medium text-gray-700">
                  Max Tokens
                  <input className={inputClass} value={aiDraft.maxTokens} onChange={(event) => setAiDraft((current) => ({ ...current, maxTokens: event.target.value }))} />
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button icon={<Check className="h-4 w-4" />} onClick={() => void saveAiSettingsFromUi(false)}>{aiSettingsBusy ? '处理中...' : '保存 AI 设置'}</Button>
                <Button tone="secondary" icon={<ShieldCheck className="h-4 w-4" />} onClick={() => void testAiConnectionFromUi()}>测试连接</Button>
                <Button tone="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={() => void refreshAiApiPanel()}>刷新设置</Button>
                <Button tone="danger" icon={<X className="h-4 w-4" />} onClick={() => void saveAiSettingsFromUi(true)}>清除 Key</Button>
              </div>
              {aiSettingsError && <p className="rounded-lg border border-danger-100 bg-danger-50 px-3 py-2 text-sm text-danger-700">{aiSettingsError}</p>}
            </div>
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-900">调用冒烟测试</p>
                <p className="mt-1 text-sm leading-6 text-gray-600">用当前全局设置发起一次最小 AI 生成请求，确认后续元提示词编译可以复用。</p>
                <textarea className="mt-3 min-h-24 w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm leading-6 text-gray-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100" value={aiTestPrompt} onChange={(event) => setAiTestPrompt(event.target.value)} />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" icon={<Sparkles className="h-4 w-4" />} onClick={() => void generateAiPreviewFromUi()}>试生成</Button>
                  <Button size="sm" tone="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={() => { setAiGeneratedPreview(''); setAiTestResult('') }}>清空结果</Button>
                </div>
                {aiTestResult && <p className="mt-3 rounded-lg border border-success-100 bg-success-50 px-3 py-2 text-sm text-success-700">{aiTestResult}</p>}
                {aiGeneratedPreview && <pre className="mt-3 max-h-56 overflow-auto rounded-lg bg-gray-950 p-3 text-xs leading-5 text-gray-100">{aiGeneratedPreview}</pre>}
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="AI 调用日志" description="只记录调用摘要和输出预览，不展示或返回 API Key。">
          {aiRuns.length ? (
            <SimpleTable
              headers={['调用 ID', '用途', '模式', 'Provider', '模型', '状态', '耗时']}
              rows={aiRuns.slice(0, 8).map((run) => [run.aiRunId, run.purpose, run.mode === 'real_api' ? '真实 API' : '手动模拟', run.provider, run.model, run.status === 'done' ? '完成' : run.status === 'failed' ? '失败' : '运行中', `${run.latencyMs}ms`])}
              onRow={(index) => {
                const run = aiRuns[index]
                setDrawer({
                  title: 'AI 调用详情',
                  eyebrow: run.aiRunId,
                  description: `${run.purpose} / ${run.mode === 'real_api' ? '真实 API' : '手动模拟'}`,
                  content: (
                    <div className="space-y-4">
                      <InfoGrid items={[['Provider', run.provider], ['模型', run.model], ['状态', run.status], ['耗时', `${run.latencyMs}ms`], ['开始时间', formatDateTime(run.startedAt)], ['完成时间', run.completedAt ? formatDateTime(run.completedAt) : '未完成']]} />
                      <ListBlock title="输入摘要" items={run.requestPreview.map((item) => `${item.role}: ${item.content}`)} />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">输出预览</p>
                        <pre className="mt-2 max-h-72 overflow-auto rounded-lg bg-gray-950 p-3 text-xs leading-5 text-gray-100">{run.outputPreview || run.errorMessage || '无输出'}</pre>
                      </div>
                    </div>
                  ),
                })
              }}
            />
          ) : (
            <EmptyState title="还没有 AI 调用日志" text="保存设置后可以先测试连接或试生成；后续元提示词编译也会写入这里。" />
          )}
        </Panel>

        <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
          <Panel
            title="产品硬边界"
            action={
              <>
                <Button onClick={() => setModal({ title: '安全边界说明', description: '系统边界用于防止原型误导为真实自动化发布工具。', content: <div className="grid gap-3 md:grid-cols-4"><BoundaryCard title="程序内 AI" tone="green" items={['生成任务包', '解析 Artifact', '校验完整性', '生成审核项']} /><BoundaryCard title="外部智能体" tone="blue" items={['网页抓取', '联网搜索', 'SEO 审计', '关键词调研']} /><BoundaryCard title="禁止的动作" tone="red" items={['发布', '写入', '上传媒体', '保存密码']} /><BoundaryCard title="需要人工确认" tone="orange" items={['关键词审核', '证据确认', '页面修复包', '交付包']} /></div>, primaryLabel: '知道了' })}>查看安全边界</Button>
                <Button tone="secondary" onClick={() => setDrawer({ title: '本地数据结构', eyebrow: '本地演示数据', description: '展示原型中的本地数据对象，不暴露真实路径或凭据。', content: <SimpleTable headers={['对象', '用途', '状态']} rows={[['项目档案', '项目档案和业务边界', '演示数据'], ['WordPress 只读快照', 'WordPress 只读读取快照', '演示数据'], ['关键词总库', '关键词总库和审核状态', '演示数据'], ['审计问题', 'SEO 审计问题', '演示数据'], ['任务记录', '任务中心状态', '演示数据'], ['证据库', '证据库与事实边界', '演示数据'], ['交付包', '交付包状态', '演示数据']]} /> })}>查看本地数据结构</Button>
              </>
            }
          >
            <div className="grid gap-2 md:grid-cols-2">
              {boundaries.map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800">
                  <Lock className="h-4 w-4 text-primary-600" />
                  {item}
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="系统检查" action={<Button onClick={() => { setSystemCheckDone(true); void refreshBackendHealth(); showToast('系统检查完成') }}>系统检查</Button>}>
            <ProgressRows rows={[['只读模式', 100, '已开启'], ['本地后端', backendHealth?.ok ? 100 : 0, backendHealth?.ok ? '可用' : '未连接'], ['全局 AI API', aiSettings?.mode === 'real_api' ? (aiSettings.apiKeyConfigured ? 100 : 55) : 65, aiSettings?.mode === 'real_api' ? (aiSettings.apiKeyConfigured ? '真实 API 已配置' : '真实 API 缺少 Key') : '手动模拟模式'], ['外部智能体执行', 100, '抓取 / 搜索 / 审计 / 调研'], ['WordPress 写入', 0, '关闭'], ['自动发布', 0, '关闭'], ['本地 JSON 存储', backendHealth?.ok ? 100 : 40, backendHealth?.ok ? '可写执行记录' : '待检测']]} />
            {backendError && <p className="mt-3 rounded-lg border border-warning-100 bg-warning-50 px-3 py-2 text-sm text-warning-700">{backendError}</p>}
          </Panel>
        </div>
        <Panel title="本地数据与功能开关">
          <SimpleTable headers={['模块', '当前状态', '说明']} rows={[['全局 AI API', aiSettings?.mode === 'real_api' ? '真实 API 模式' : '手动模拟模式', '所有元提示词编译、Artifact 解析和上下文转化统一从这里调用'], ['API Key', aiSettings?.apiKeyConfigured ? '已本地保存' : '未保存', '只保存在 runtime/ai-settings.json，不进入前端代码和 Git'], ['外部执行层 AI', '用户自行执行', 'ChatGPT / Claude / OpenClaw 负责网页抓取、联网搜索、SEO 审计和调研'], ['WordPress 写入', '关闭', '不保存写入权限，不上传媒体，不自动发布'], ['本地后端', backendHealth?.ok ? '可用' : '未连接', '4310 API 提供提示词库、任务包、回填和解析记录'], ['提示词库', backendHealth ? `${backendHealth.promptCount} 个提示词` : '待检测', '展示契约、输入输出和人工审核点'], ['安全边界', '强制显示', '所有页面展示只读/不发布']]} />
        </Panel>
      </PageShell>
    )
  }

  if (location.pathname === '/tutorial') {
    return <Tutorial />
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="flex min-h-screen">
        <Sidebar currentPath={location.pathname} />
        <div className="min-w-0 flex-1">
          <TopBar
            metrics={metrics}
            readTimestamp={readTimestamp}
            projectName={workspace?.project?.projectName || '未设置项目'}
            domain={workspace?.project?.domain || '等待填写网站域名'}
            siteReady={Boolean(workspace?.latestSnapshot?.pages?.length)}
            currentStepLabel={workflow?.currentStepLabel || '站点接入与读取'}
            onRead={runReadSimulation}
            onAudit={() => openModalSteps('运行前台只读审计', '模拟审计不会连接真实网站。', ['读取页面结构', '检查 SEO 基础', '检查信任与转化', '生成问题队列'], () => showToast('审计模拟完成'))}
            onImport={() => navigateKeywordTab('import')}
            onTasks={() => navigate('/tasks')}
            onExport={() => navigate('/delivery')}
          />
          <MobileNav />
          <main className="px-4 py-5 md:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Navigate to="/overview" replace />} />
              <Route path="/overview" element={<OverviewPage />} />
              <Route path="/project-center" element={<ProjectCenterPage />} />
              <Route path="/audit" element={<AuditPage />} />
              <Route path="/keywords" element={<KeywordsPage />} />
              <Route path="/trust" element={<TrustPage />} />
              <Route path="/content" element={<ContentPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/assets" element={<AssetsPage />} />
              <Route path="/delivery" element={<DeliveryPage />} />
              <Route path="/ai-workbench" element={<AiWorkbenchPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/tutorial" element={<Tutorial />} />
              <Route path="*" element={<Navigate to="/overview" replace />} />
            </Routes>
          </main>
        </div>
      </div>
      <DetailDrawer drawer={drawer} onClose={() => setDrawer(null)} />
      <Modal modal={modal} onClose={() => setModal(null)} />
      <ConfirmDialog confirm={confirm} onClose={() => setConfirm(null)} />
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))} />
    </div>
  )
}

function MobileNav() {
  const items = navigationGroups.flatMap((group) => group.items)
  return (
    <nav className="border-b border-gray-200 bg-white px-3 py-2 lg:hidden" aria-label="移动端工作区导航">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cx(
                'shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition',
                isActive ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

function Sidebar({ currentPath }: { currentPath: string }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-gray-200 bg-white lg:flex lg:flex-col">
      <div className="border-b border-gray-200 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white">
            <Layers3 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">B2B SEO OS</p>
            <p className="text-xs text-gray-500">站内 SEO 运营工作台</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {navigationGroups.map((group) => (
          <div key={group.title}>
            <p className="px-2 text-xs font-semibold text-gray-400">{group.title}</p>
            <div className="mt-2 space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon
                const active = currentPath === item.path
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={cx(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                      active ? 'bg-primary-50 text-primary-700 ring-1 ring-primary-100' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {active && <ChevronRight className="ml-auto h-4 w-4" />}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-gray-200 p-4">
        <a
          href="/tutorial"
          target="_blank"
          rel="noreferrer"
          className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-primary-100 bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700 transition hover:bg-primary-100"
        >
          <span className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            使用教程
          </span>
          <ExternalLink className="h-4 w-4" />
        </a>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
          <p className="font-semibold text-gray-900">本地工作区</p>
          <p className="mt-2">当前目标：站点接入与读取</p>
          <p>数据模式：本地 JSON 持久化</p>
          <p>WordPress 写入：关闭</p>
          <p>AI API 调用：关闭</p>
        </div>
      </div>
    </aside>
  )
  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-gray-200 bg-white lg:flex lg:flex-col">
      <div className="border-b border-gray-200 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white">
            <Layers3 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">B2B SEO OS</p>
            <p className="text-xs text-gray-500">站内 SEO 运营工作台</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {navigationGroups.map((group) => (
          <div key={group.title}>
            <p className="px-2 text-xs font-semibold text-gray-400">{group.title}</p>
            <div className="mt-2 space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon
                const active = currentPath === item.path
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={cx(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                      active ? 'bg-primary-50 text-primary-700 ring-1 ring-primary-100' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {active && <ChevronRight className="ml-auto h-4 w-4" />}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-gray-200 p-4">
        <a
          href="/tutorial"
          target="_blank"
          rel="noreferrer"
          className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-primary-100 bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700 transition hover:bg-primary-100"
        >
          <span className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            使用教程
          </span>
          <ExternalLink className="h-4 w-4" />
        </a>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
          <p className="font-semibold text-gray-900">Demo WordPress B2B Site</p>
          <p className="mt-2">站点类型：工贸一体 / OEM Supplier</p>
          <p>数据模式：演示数据 / 本地预览</p>
          <p>写入权限：关闭</p>
          <p>AI 调用：关闭</p>
        </div>
      </div>
    </aside>
  )
}

function TopBar({
  metrics,
  readTimestamp,
  projectName,
  domain,
  siteReady,
  currentStepLabel,
  onRead,
  onAudit,
  onImport,
  onTasks,
  onExport,
}: {
  metrics: { pending: number; handoff: number; waitingReview: number }
  readTimestamp: string
  projectName: string
  domain: string
  siteReady: boolean
  currentStepLabel: string
  onRead: () => void
  onAudit: () => void
  onImport: () => void
  onTasks: () => void
  onExport: () => void
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur md:px-6 lg:px-8">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold text-gray-900">{projectName}</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">{domain}</span>
            <StatusBadge tone={siteReady ? 'green' : 'orange'}>{siteReady ? '站点快照已生成' : '等待站点读取'}</StatusBadge>
            <StatusBadge tone="green">只读模式</StatusBadge>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <StatusBadge tone="blue">当前：{currentStepLabel}</StatusBadge>
            <StatusBadge tone={siteReady ? 'green' : 'orange'}>读取：{siteReady ? readTimestamp : '未生成快照'}</StatusBadge>
            <StatusBadge tone="purple">程序内 AI：任务包 / 解析</StatusBadge>
            <StatusBadge tone="blue">外部智能体：执行层</StatusBadge>
            <StatusBadge tone="green">WordPress 写入：关闭</StatusBadge>
            <StatusBadge tone="green">凭据保存：关闭</StatusBadge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/tutorial"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <BookOpen className="h-4 w-4" />
            使用教程
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <Button size="sm" tone="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={onRead}>开发预览快照</Button>
          <Button size="sm" tone="secondary" icon={<Database className="h-4 w-4" />} onClick={onImport}>后续：关键词导入</Button>
          <Button size="sm" tone="secondary" icon={<ClipboardList className="h-4 w-4" />} onClick={onTasks}>任务中心</Button>
        </div>
      </div>
    </header>
  )
  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur md:px-6 lg:px-8">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold text-gray-900">Demo Industrial Components Supplier</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">https://demo-b2b-site.com</span>
            <StatusBadge tone="green">WordPress 已读取</StatusBadge>
            <StatusBadge tone="orange">只读模式</StatusBadge>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <StatusBadge tone="green">读取：{readTimestamp}</StatusBadge>
            <StatusBadge tone="red">审计：有高风险</StatusBadge>
            <StatusBadge tone="orange">关键词：{operatingStats.pendingReview.toLocaleString()} 待审核</StatusBadge>
            <StatusBadge tone="orange">页面修复：{operatingStats.repairPages} 待处理</StatusBadge>
            <StatusBadge tone="purple">内容引擎：{metrics.handoff} 待交接</StatusBadge>
            <StatusBadge tone="blue">人工确认：{metrics.waitingReview}</StatusBadge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/tutorial"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <BookOpen className="h-4 w-4" />
            使用教程
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <Button size="sm" tone="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={onRead}>重新读取网站</Button>
          <Button size="sm" tone="secondary" icon={<Gauge className="h-4 w-4" />} onClick={onAudit}>运行前台审计</Button>
          <Button size="sm" tone="secondary" icon={<Upload className="h-4 w-4" />} onClick={onImport}>导入关键词 CSV</Button>
          <Button size="sm" tone="secondary" icon={<ClipboardList className="h-4 w-4" />} onClick={onTasks}>查看任务中心</Button>
          <Button size="sm" tone="secondary" icon={<Download className="h-4 w-4" />} onClick={onExport}>导出交付包</Button>
        </div>
      </div>
    </header>
  )
}

function PageShell({ eyebrow, title, description, actions, children }: { eyebrow: string; title: string; description: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-[1560px] space-y-5">
      <section className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-5 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-primary-700">{eyebrow}</p>
          <h1 className="mt-2 text-2xl font-semibold text-gray-950">{title}</h1>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-gray-600">{description}</p>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </section>
      {children}
    </div>
  )
}

function Panel({ title, description, action, children }: { title: string; description?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-950">{title}</h2>
          {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        </div>
        {action && <div className="flex shrink-0 flex-wrap gap-2">{action}</div>}
      </div>
      {children}
    </section>
  )
}

function Button({ children, icon, tone = 'primary', size = 'md', onClick }: { children: ReactNode; icon?: ReactNode; tone?: 'primary' | 'secondary' | 'danger'; size?: 'sm' | 'md'; onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        size === 'sm' ? 'min-h-9 px-3 py-1.5 text-xs' : 'min-h-11 px-4 py-2 text-sm',
        tone === 'primary' && 'bg-primary-600 text-white hover:bg-primary-700',
        tone === 'secondary' && 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
        tone === 'danger' && 'bg-danger-600 text-white hover:bg-danger-700',
      )}
    >
      {icon}
      {children}
    </button>
  )
}

function StatusBadge({ children, tone = 'default' }: { children: ReactNode; tone?: Tone }) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset',
        tone === 'green' && 'bg-success-50 text-success-700 ring-success-100',
        tone === 'orange' && 'bg-warning-50 text-warning-700 ring-warning-100',
        tone === 'red' && 'bg-danger-50 text-danger-700 ring-danger-100',
        tone === 'blue' && 'bg-primary-50 text-primary-700 ring-primary-100',
        tone === 'purple' && 'bg-purple-50 text-purple-700 ring-purple-100',
        (tone === 'gray' || tone === 'default') && 'bg-gray-50 text-gray-700 ring-gray-200',
      )}
    >
      {children}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: Task['priority'] }) {
  const tone: Tone = priority === 'p0' ? 'red' : priority === 'p1' ? 'orange' : priority === 'p2' ? 'blue' : 'gray'
  return <StatusBadge tone={tone}>{priority.toUpperCase()}</StatusBadge>
}

function SeverityBadge({ severity }: { severity: AuditFinding['severity'] }) {
  const tone: Tone = severity === 'critical' || severity === 'high' ? 'red' : severity === 'medium' ? 'orange' : severity === 'low' ? 'gray' : 'blue'
  const label = { critical: '严重', high: '高风险', medium: '中风险', low: '低风险', info: '提示' }[severity]
  return <StatusBadge tone={tone}>{label}</StatusBadge>
}

function MetricCard({ title, value, detail, tone, icon, onClick }: { title: string; value: string; detail: string; tone: Tone; icon: ReactNode; onClick?: () => void }) {
  const content = (
    <>
      <div className="flex items-center justify-between">
        <div className={cx('flex h-10 w-10 items-center justify-center rounded-lg', toneBg(tone))}>{icon}</div>
        <ChevronRight className="h-4 w-4 text-gray-300" />
      </div>
      <p className="mt-4 text-sm font-medium text-gray-600">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-950">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{detail}</p>
    </>
  )
  if (onClick) {
    return (
      <button className="rounded-lg border border-gray-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-sm" onClick={onClick}>
        {content}
      </button>
    )
  }
  return <div className="rounded-lg border border-gray-200 bg-white p-4">{content}</div>
}

function WorkflowStepper() {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-[980px] items-start">
        {workflowSteps.map((step, index) => (
          <div key={step.label} className="flex flex-1 items-start">
            <div className="flex min-w-0 flex-col items-center text-center">
              <div className={cx('flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ring-2', step.status === 'done' && 'bg-success-600 text-white ring-success-100', step.status === 'active' && 'bg-primary-600 text-white ring-primary-100', step.status === 'todo' && 'bg-white text-gray-500 ring-gray-200')}>
                {step.status === 'done' ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <p className="mt-2 max-w-24 text-xs font-medium text-gray-700">{step.label}</p>
            </div>
            {index < workflowSteps.length - 1 && <div className={cx('mt-4 h-0.5 flex-1', step.status === 'done' ? 'bg-success-300' : 'bg-gray-200')} />}
          </div>
        ))}
      </div>
    </div>
  )
}

function ActionCard({ title, text, icon, onClick }: { title: string; text: string; icon: ReactNode; onClick: () => void }) {
  return (
    <button className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-left transition hover:border-primary-200 hover:bg-primary-50" onClick={onClick}>
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-primary-700 ring-1 ring-gray-200">{icon}</div>
      <p className="mt-3 font-semibold text-gray-900">{title}</p>
      <p className="mt-1 text-sm leading-6 text-gray-600">{text}</p>
    </button>
  )
}

function InfoGrid({ items }: { items: Array<[string, string]> }) {
  return (
    <div className="grid gap-2 md:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
          <p className="text-xs text-gray-500">{label}</p>
          <p className="mt-1 break-words text-sm font-medium text-gray-900">{value}</p>
        </div>
      ))}
    </div>
  )
}

function ContentBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <p className="text-xs font-semibold text-gray-500">{title}</p>
      <div className="mt-2 text-sm leading-6 text-gray-800">{children}</div>
    </div>
  )
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <p className="text-xs font-semibold text-gray-500">{title}</p>
      <ul className="mt-2 space-y-2">
        {items.length ? items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-6 text-gray-800">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary-600" />
            <span>{item}</span>
          </li>
        )) : <li className="text-sm text-gray-500">暂无</li>}
      </ul>
    </div>
  )
}

function SimpleTable({ headers, rows, onRow }: { headers: string[]; rows: string[][]; onRow?: (index: number) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-xs text-gray-500">
            {headers.map((header) => <th key={header} className="py-3 pr-4 font-medium">{header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row[0]}-${index}`} className={cx('border-b border-gray-100', onRow && 'cursor-pointer hover:bg-gray-50')} onClick={() => onRow?.(index)}>
              {row.map((cell, cellIndex) => (
                <td key={`${cell}-${cellIndex}`} className={cx('py-3 pr-4 text-gray-600', cellIndex === 0 && 'font-medium text-gray-900')}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TaskTable({ tasks, onOpen }: { tasks: Task[]; onOpen: (task: Task) => void }) {
  return (
    <div>
      <div className="space-y-3 md:hidden">
        {tasks.map((task) => (
          <button key={task.taskId} className="w-full rounded-lg border border-gray-200 bg-white p-3 text-left" onClick={() => onOpen(task)}>
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 text-sm font-semibold leading-5 text-gray-900">{task.title}</p>
              <PriorityBadge priority={task.priority} />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <StatusBadge tone={statusTone(task.status)}>{taskStatusLabels[task.status]}</StatusBadge>
              <StatusBadge tone="gray">{task.source}</StatusBadge>
            </div>
            <p className="mt-2 break-words text-xs leading-5 text-gray-600">{task.relatedUrl ?? '无关联页面'}</p>
            <p className="mt-1 text-xs font-medium text-primary-700">{task.nextAction}</p>
          </button>
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs text-gray-500">
              {['任务标题', '来源', '优先级', '状态', '关联页面', '下一步动作'].map((header) => <th key={header} className="py-3 pr-4 font-medium">{header}</th>)}
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.taskId} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 pr-4 font-medium text-gray-900"><button className="text-left hover:text-primary-700" onClick={() => onOpen(task)}>{task.title}</button></td>
                <td className="py-3 pr-4 text-gray-600">{task.source}</td>
                <td className="py-3 pr-4"><PriorityBadge priority={task.priority} /></td>
                <td className="py-3 pr-4"><StatusBadge tone={statusTone(task.status)}>{taskStatusLabels[task.status]}</StatusBadge></td>
                <td className="py-3 pr-4 text-gray-600">{task.relatedUrl ?? '无'}</td>
                <td className="py-3 pr-4 text-gray-600">{task.nextAction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function FilterBar({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 md:flex-row md:items-center">{children}</div>
}

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="relative min-w-0 flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input className="min-h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  )
}

function Segmented({ value, options, onChange }: { value: string; options: Array<[string, string]>; onChange: (value: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-lg bg-gray-100 p-1">
      {options.map(([optionValue, label]) => (
        <button key={optionValue} className={cx('min-h-8 rounded-md px-3 text-xs font-medium transition', value === optionValue ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600 hover:text-gray-900')} onClick={() => onChange(optionValue)}>
          {label}
        </button>
      ))}
    </div>
  )
}

function EmptyState({ title, text, action, onClick }: { title: string; text: string; action?: string; onClick?: () => void }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
      <CircleDashed className="mx-auto h-8 w-8 text-gray-400" />
      <p className="mt-3 font-semibold text-gray-900">{title}</p>
      <p className="mx-auto mt-1 max-w-lg text-sm leading-6 text-gray-600">{text}</p>
      {action && <div className="mt-4"><Button tone="secondary" onClick={onClick}>{action}</Button></div>}
    </div>
  )
}

function ProgressRows({ rows }: { rows: Array<[string, number, string]> }) {
  return (
    <div className="space-y-3">
      {rows.map(([label, value, detail]) => (
        <div key={label}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">{label}</span>
            <span className="text-gray-500">{detail}</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100">
            <div className="h-2 rounded-full bg-primary-500" style={{ width: `${Math.max(4, Math.min(value, 100))}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function BoundaryCard({ title, items, tone }: { title: string; items: string[]; tone: Tone }) {
  return (
    <div className={cx('rounded-lg border p-3', tone === 'red' ? 'border-danger-100 bg-danger-50' : tone === 'orange' ? 'border-warning-100 bg-warning-50' : 'border-success-100 bg-success-50')}>
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <ul className="mt-2 space-y-1">
        {items.map((item) => <li key={item} className="text-xs leading-5 text-gray-700">{item}</li>)}
      </ul>
    </div>
  )
}

function Notice({ title, text, tone }: { title: string; text: string; tone: Tone }) {
  return (
    <div className={cx('rounded-lg border p-4', tone === 'orange' ? 'border-warning-100 bg-warning-50' : 'border-primary-100 bg-primary-50')}>
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <p className="mt-1 text-sm leading-6 text-gray-700">{text}</p>
    </div>
  )
}

function MiniFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-gray-50 px-2 py-1">
      <p className="text-[11px] text-gray-500">{label}</p>
      <p className="mt-0.5 text-xs font-medium text-gray-800">{value}</p>
    </div>
  )
}

function CodePreview({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-950 p-3">
      <p className="text-xs font-semibold text-gray-300">{title}</p>
      <pre className="mt-2 overflow-x-auto text-xs leading-5 text-gray-100">{value}</pre>
    </div>
  )
}

function MockForm({ fields }: { fields: string[] }) {
  return (
    <div className="space-y-3">
      {fields.map((field) => (
        <label key={field} className="block">
          <span className="text-xs font-medium text-gray-600">{field}</span>
          <input className="mt-1 min-h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100" defaultValue={`演示${field}`} />
        </label>
      ))}
    </div>
  )
}

function GroupedCards({ items, onOpen }: { items: Record<string, AuditFinding[]>; onOpen: (title: string) => void }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {Object.entries(items).map(([title, findings]) => (
        <button key={title} className="rounded-lg border border-gray-200 bg-white p-4 text-left transition hover:border-primary-200 hover:bg-primary-50" onClick={() => onOpen(title)}>
          <p className="font-semibold text-gray-900">{title}</p>
          <p className="mt-2 text-sm text-gray-600">{findings.length} 个问题</p>
          <div className="mt-3 flex gap-2">
            <StatusBadge tone="red">{findings.filter((item) => item.severity === 'high').length} 高风险</StatusBadge>
            <StatusBadge tone="orange">{findings.filter((item) => item.requiresEvidence).length} 需证据</StatusBadge>
          </div>
        </button>
      ))}
    </div>
  )
}

function DetailDrawer({ drawer, onClose }: { drawer: DrawerState | null; onClose: () => void }) {
  if (!drawer) return null
  return (
    <div className="fixed inset-0 z-40">
      <button className="absolute inset-0 bg-gray-950/40" onClick={onClose} aria-label="关闭详情抽屉" />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-white shadow-xl" role="dialog" aria-modal="true" aria-label={drawer.title}>
        <div className="border-b border-gray-200 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              {drawer.eyebrow && <p className="text-xs font-semibold text-primary-700">{drawer.eyebrow}</p>}
              <h2 className="mt-1 text-xl font-semibold text-gray-950">{drawer.title}</h2>
              {drawer.description && <p className="mt-2 text-sm leading-6 text-gray-600">{drawer.description}</p>}
            </div>
            <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" onClick={onClose} aria-label="关闭详情抽屉">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">{drawer.content}</div>
        {drawer.actions && drawer.actions.length > 0 && (
          <div className="flex flex-wrap gap-2 border-t border-gray-200 p-4">
            {drawer.actions.map((action) => (
              <Button key={action.label} tone={action.tone === 'red' ? 'danger' : action.tone === 'blue' || action.tone === 'green' ? 'primary' : 'secondary'} icon={action.icon} onClick={action.onClick}>
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </aside>
    </div>
  )
}

function Modal({ modal, onClose }: { modal: ModalState | null; onClose: () => void }) {
  if (!modal) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-gray-950/45" onClick={onClose} aria-label="关闭弹窗" />
      <section className="relative max-h-[86vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl" role="dialog" aria-modal="true" aria-label={modal.title}>
        <div className="border-b border-gray-200 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-950">{modal.title}</h2>
              {modal.description && <p className="mt-2 text-sm leading-6 text-gray-600">{modal.description}</p>}
            </div>
            <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" onClick={onClose} aria-label="关闭弹窗">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="p-5">{modal.content}</div>
        <div className="flex justify-end gap-2 border-t border-gray-200 p-4">
          <Button tone="secondary" onClick={onClose}>取消</Button>
          {modal.primaryLabel && <Button onClick={() => { modal.onPrimary?.(); onClose() }}>{modal.primaryLabel}</Button>}
        </div>
      </section>
    </div>
  )
}

function ConfirmDialog({ confirm, onClose }: { confirm: ConfirmState | null; onClose: () => void }) {
  if (!confirm) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-gray-950/50" onClick={onClose} aria-label="取消确认" />
      <section className="relative w-full max-w-md rounded-lg bg-white p-5 shadow-xl" role="dialog" aria-modal="true" aria-label={confirm.title}>
        <h2 className="text-lg font-semibold text-gray-950">{confirm.title}</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">{confirm.description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button tone="secondary" onClick={onClose}>取消</Button>
          <Button onClick={() => { confirm.onConfirm(); onClose() }}>{confirm.confirmLabel}</Button>
        </div>
      </section>
    </div>
  )
}

function ToastStack({ toasts, onDismiss }: { toasts: ToastState[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-[70] space-y-2" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className="flex min-w-80 items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          <div className={cx('flex h-8 w-8 items-center justify-center rounded-lg', toneBg(toast.tone))}>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <p className="flex-1 text-sm font-medium text-gray-800">{toast.message}</p>
          <button className="rounded-md p-1 text-gray-400 hover:bg-gray-100" onClick={() => onDismiss(toast.id)} aria-label="关闭提示">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

function toneBg(tone: Tone) {
  if (tone === 'green') return 'bg-success-50 text-success-700'
  if (tone === 'orange') return 'bg-warning-50 text-warning-700'
  if (tone === 'red') return 'bg-danger-50 text-danger-700'
  if (tone === 'purple') return 'bg-purple-50 text-purple-700'
  if (tone === 'blue') return 'bg-primary-50 text-primary-700'
  return 'bg-gray-50 text-gray-700'
}

function statusTone(status: Task['status']): Tone {
  if (status === 'done' || status === 'approved') return 'green'
  if (status === 'blocked' || status === 'needs_review') return 'orange'
  if (status === 'in_progress') return 'blue'
  if (status === 'cancelled') return 'gray'
  return 'gray'
}

function keywordTone(status: Keyword['status']): Tone {
  if (status === 'approved' || status === 'assigned_existing_page') return 'green'
  if (status === 'pending_review' || status === 'hold') return 'orange'
  if (status === 'rejected') return 'red'
  if (status === 'unused_valid' || status === 'super_clustered') return 'blue'
  return 'gray'
}

function groupBy<T, K extends keyof T>(items: T[], key: K) {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const value = String(item[key])
    acc[value] = acc[value] ?? []
    acc[value].push(item)
    return acc
  }, {})
}

export default App
