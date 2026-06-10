import type { ReactNode } from 'react'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Database,
  ExternalLink,
  FileArchive,
  FileText,
  Gauge,
  Home,
  Layers3,
  Library,
  Link2,
  Lock,
  Map,
  PlayCircle,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  Wrench,
} from 'lucide-react'

type Tone = 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray'

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ')

const toc = [
  { href: '#what-is-it', label: '这是什么' },
  { href: '#roles', label: '角色与分工' },
  { href: '#first-run', label: '第一次使用' },
  { href: '#workspace-map', label: '工作区地图' },
  { href: '#daily-flow', label: '日常工作流' },
  { href: '#keyword-flow', label: '关键词教程' },
  { href: '#page-repair', label: '页面修复教程' },
  { href: '#content-flow', label: '内容运营教程' },
  { href: '#delivery-flow', label: '交付与复盘' },
  { href: '#safety', label: '安全边界' },
  { href: '#acceptance', label: '验收清单' },
  { href: '#sources', label: '方案来源' },
  { href: '#faq', label: '常见问题' },
  { href: '#glossary', label: '术语表' },
]

const workspaceLinks = [
  { href: '/overview', label: '项目总览', icon: Home, description: '看项目状态、风险、待办和下一步。' },
  { href: '/project-center', label: '项目中心 / 数据源', icon: Database, description: '确认项目资料、WordPress 读取结果和数据来源。' },
  { href: '/audit', label: 'SEO 诊断', icon: Gauge, description: '查看前台问题、风险级别、证据和修复建议。' },
  { href: '/keywords', label: '页面与关键词', icon: Map, description: '导入、清洗、审核、分配关键词。' },
  { href: '/trust', label: '供应商可信度', icon: ShieldCheck, description: '管理公司能力、证书、工厂、质检等可信证据。' },
  { href: '/content', label: '内容运营', icon: FileText, description: '把未使用有效词变成内容机会和生产简报。' },
  { href: '/tasks', label: '任务中心', icon: ClipboardList, description: '把诊断、关键词、内容事项变成可执行任务。' },
  { href: '/assets', label: '资料与素材库', icon: Library, description: '整理图片、PDF、证书、规格表和可用素材。' },
  { href: '/delivery', label: '交付中心', icon: FileArchive, description: '导出页面修复包、任务包和内容交接包。' },
  { href: '/ai-workbench', label: 'AI 工作台', icon: Sparkles, description: '查看提示词契约、输入输出和人工审核点。' },
  { href: '/settings', label: '设置 / 系统状态', icon: Settings, description: '确认只读模式、连接状态和本地安全边界。' },
]

const firstRunSteps = [
  {
    title: '先确认项目是不是 B2B WordPress 独立站',
    body: '本系统只服务 B2B 外贸独立站的站内 SEO 运营。它不做 Shopify、CRM、外链采购，也不替你判断供应商真假。',
    link: '/overview',
    linkLabel: '查看项目总览',
  },
  {
    title: '读取网站，建立当前网站快照',
    body: '读取页面、文章、产品、分类、媒体、SEO 字段、表单和站点结构。教程里提到的所有诊断和修复，都从这个快照开始。',
    link: '/project-center',
    linkLabel: '进入数据源',
  },
  {
    title: '先做网站诊断，再做关键词',
    body: '不要一开始就塞关键词。先知道页面缺什么、信任证据缺什么、CTA 和内链哪里断了，再决定关键词应该去哪里。',
    link: '/audit',
    linkLabel: '进入 SEO 诊断',
  },
  {
    title: '补齐 B2B 上下文和证据',
    body: '把公司介绍、产品目录、规格表、质检流程、工厂照片、证书等资料放进系统。AI 可以帮你整理，但事实边界要人工确认。',
    link: '/trust',
    linkLabel: '进入可信度中心',
  },
  {
    title: '导入关键词 CSV，进入审核和分配',
    body: 'Semrush、Ahrefs、Google Keyword Planner、GSC 或人工表格都可以作为来源。系统会合并、去重、清洗和打标。',
    link: '/keywords',
    linkLabel: '进入关键词工作区',
  },
]

const dailyFlow = [
  '打开项目总览，先看红色风险、待人工确认、待交付事项。',
  '进入 SEO 诊断，处理高风险页面问题，例如缺 CTA、缺规格表、缺信任页、ALT 缺失。',
  '进入页面与关键词，审核待处理关键词，只把适合现有页面的词分配给页面。',
  '进入任务中心，把诊断问题和关键词分配结果转成具体任务。',
  '进入资料与素材库，确认修复页面需要的证据、图片、规格表是否齐全。',
  '进入交付中心，导出页面修复包或内容交接包，交给执行人员。',
]

const roles = [
  {
    title: '老板 / 项目负责人',
    focus: '看项目是否在正确方向上推进。',
    actions: ['看项目总览和交付中心', '确认优先级和风险', '决定哪些事实可以公开'],
  },
  {
    title: 'SEO 运营',
    focus: '负责诊断、关键词审核和页面分配。',
    actions: ['处理 SEO 诊断', '审核关键词状态', '生成页面修复任务'],
  },
  {
    title: '内容负责人',
    focus: '把未使用有效词变成内容机会。',
    actions: ['查看内容运营', '确认内容简报', '检查素材和证据是否够用'],
  },
  {
    title: '网站执行人员',
    focus: '按交付包修改页面。',
    actions: ['读取页面修复包', '按任务中心推进', '把需要确认的问题反馈回来'],
  },
  {
    title: '资料 / 销售同事',
    focus: '补齐产品、证书、工厂、交期等事实。',
    actions: ['上传资料和素材', '确认可写事实', '标记不能公开的信息'],
  },
  {
    title: '开发 / 系统维护',
    focus: '确认连接、安全和数据状态。',
    actions: ['查看设置页', '确认只读边界', '处理系统连接和导出问题'],
  },
]

const keywordStatuses = [
  { name: 'pending_review', meaning: '待人工审核', action: '判断是否相关、是否 B2B、是否值得保留。' },
  { name: 'assigned_existing_page', meaning: '已分配到现有页面', action: '可以进入页面修复包。' },
  { name: 'unused_valid', meaning: '未使用有效词', action: '不强塞进现有页面，进入聚类和内容机会。' },
  { name: 'duplicate_intent', meaning: '重复意图', action: '和已有词表达同一需求，合并保留主词。' },
  { name: 'rejected', meaning: '已排除', action: 'B2C、平台词、无关材料词或不适合项目的词。' },
  { name: 'hold', meaning: '保留观察', action: '暂时不确定，后面结合页面或数据再判断。' },
]

const workspaceGuide = [
  {
    title: '项目总览',
    href: '/overview',
    icon: Home,
    tone: 'blue' as const,
    useFor: '每天开工第一眼看这里。',
    userDoes: ['看项目读取状态和风险摘要', '确认下一步该处理诊断、关键词还是交付', '从总览跳到当前最重要的工作区'],
  },
  {
    title: '项目中心 / 数据源',
    href: '/project-center',
    icon: Database,
    tone: 'gray' as const,
    useFor: '管理项目资料和 WordPress 读取快照。',
    userDoes: ['核对网站基本信息、行业、市场和产品线', '查看页面、文章、产品、媒体等读取结果', '确认数据来源是否可信、是否需要重新读取'],
  },
  {
    title: 'SEO 诊断',
    href: '/audit',
    icon: Gauge,
    tone: 'red' as const,
    useFor: '把网站问题变成可修复事项。',
    userDoes: ['按严重程度查看问题', '看证据和影响页面', '把问题生成任务或加入页面修复包'],
  },
  {
    title: '页面与关键词',
    href: '/keywords',
    icon: Map,
    tone: 'green' as const,
    useFor: '关键词数据库、页面分配和未使用词池。',
    userDoes: ['导入 CSV 并清洗', '审核关键词是否适合 B2B', '把关键词分配给页面，或放入未使用有效词池'],
  },
  {
    title: '供应商可信度',
    href: '/trust',
    icon: ShieldCheck,
    tone: 'purple' as const,
    useFor: '避免页面内容空、虚、夸张。',
    userDoes: ['整理工厂、证书、质检、交期、产品能力', '确认哪些事实可以写、哪些需要确认、哪些不能写', '给页面修复和内容生产提供证据'],
  },
  {
    title: '任务中心',
    href: '/tasks',
    icon: ClipboardList,
    tone: 'orange' as const,
    useFor: '把发现的问题排优先级并推进。',
    userDoes: ['按 P0/P1/P2 查看任务', '确认任务来源和关联页面', '标记进行中、待审核、已完成'],
  },
  {
    title: '内容运营',
    href: '/content',
    icon: FileText,
    tone: 'blue' as const,
    useFor: '把未使用有效词变成内容计划。',
    userDoes: ['查看内容机会', '确认是否需要交给 Content Engine', '生成面向执行人员的内容简报'],
  },
  {
    title: '资料与素材库',
    href: '/assets',
    icon: Library,
    tone: 'gray' as const,
    useFor: '管理页面修复所需证据。',
    userDoes: ['查看产品图、工厂图、PDF、证书、规格表', '确认素材能否公开使用', '把素材绑定到页面或任务'],
  },
  {
    title: '交付中心',
    href: '/delivery',
    icon: FileArchive,
    tone: 'green' as const,
    useFor: '把工作结果交给执行和复盘。',
    userDoes: ['导出页面修复包', '导出关键词审核和任务清单', '导出内容生产交接包'],
  },
  {
    title: 'AI 工作台',
    href: '/ai-workbench',
    icon: Sparkles,
    tone: 'purple' as const,
    useFor: '理解 AI 在做什么。',
    userDoes: ['查看 Prompt 输入输出契约', '确认 AI 只建议、不自动发布', '定位失败原因和人工审核点'],
  },
  {
    title: '设置 / 系统状态',
    href: '/settings',
    icon: Settings,
    tone: 'gray' as const,
    useFor: '确认系统安全和运行状态。',
    userDoes: ['检查只读模式', '查看 AI 调用和 WordPress 写入是否关闭', '确认导出和本地数据状态'],
  },
]

const repairPackage = [
  { label: '页面基本信息', value: 'URL、页面类型、当前标题、当前 H1、现有 CTA。' },
  { label: '诊断问题', value: '这个页面为什么要修，例如缺规格表、缺内链、缺 RFQ CTA。' },
  { label: '关键词分配', value: '哪些词适合这个页面，哪些词不应该强行塞进来。' },
  { label: '可写事实', value: '来自证据库的公司能力、产品参数、证书、工厂或质检信息。' },
  { label: '修改建议', value: '标题、段落、规格模块、FAQ、内链、图片 ALT、CTA 的具体建议。' },
  { label: '人工确认点', value: '不确定的产能、证书范围、交期、测试标准等必须人工确认。' },
]

const faq = [
  {
    question: '我不懂 SEO，可以直接用吗？',
    answer: '可以。你只需要按工作流确认事实、审核关键词、处理任务。系统会把专业判断拆成“要不要保留、分配到哪里、是否需要证据、能否交付”这类选择。',
  },
  {
    question: '为什么不能一键把关键词全部写进页面？',
    answer: 'B2B 页面最怕不相关和过度优化。一个词只有和页面产品、采购意图、证据资料都匹配时，才适合进入页面修复。',
  },
  {
    question: 'AI 生成的内容可以直接发布吗？',
    answer: '当前产品原则是不自动发布 WordPress。AI 输出要先进入人工审核，尤其是涉及证书、产能、质保、测试标准、交期等事实。',
  },
  {
    question: '未使用有效词是不是浪费了？',
    answer: '不是。它们通常不适合现有页面，但可能适合新专题、新文章、采购指南或 FAQ。系统会把它们送到超级聚类和内容运营。',
  },
  {
    question: '如果数据不全，应该先做什么？',
    answer: '先补 B2B 证据库和素材库。没有证据时，页面修复只能改结构和基础 SEO，不能写过度承诺。',
  },
]

const glossary = [
  ['WordPress 快照', '系统读取网站后形成的页面、文章、产品、媒体、SEO 字段和表单结构记录。'],
  ['只读模式', '系统可以读取和分析网站，但不会自动写入或发布内容。'],
  ['B2B 上下文', '公司类型、产品线、市场、客户、能力、证据、事实边界等背景信息。'],
  ['证据库', '能支撑页面内容的资料，例如证书、工厂照片、产品目录、规格表、检测报告。'],
  ['关键词总库', '所有导入、清洗、合并后的关键词集合。'],
  ['人工审核', '由人确认关键词、AI 输出、事实边界、页面修复建议是否可用。'],
  ['页面修复包', '给执行人员使用的页面级优化说明，包含问题、关键词、事实、建议和确认点。'],
  ['Content Engine', '内容生产执行器，接收 OS 的上下文和简报，不负责站内 SEO 总流程。'],
]

const acceptanceGroups = [
  {
    title: '项目接入合格',
    items: ['项目类型明确是 WordPress B2B 独立站', '行业、目标市场、产品线和主转化目标已填写', '只读模式和数据边界已经确认'],
  },
  {
    title: '诊断合格',
    items: ['高风险问题有证据和影响页面', '问题能转成任务或修复包', '不把关键词问题提前混入基础诊断'],
  },
  {
    title: '关键词合格',
    items: ['CSV 来源被保留', '关键词经过清洗和人工审核', '分配到页面的词与页面主题、采购意图和证据匹配'],
  },
  {
    title: '页面修复合格',
    items: ['页面修复包包含问题、关键词、证据、建议和确认点', '没有无证据的夸张承诺', '执行人员能按包修改页面'],
  },
  {
    title: '内容交接合格',
    items: ['未使用有效词进入聚类或内容机会', '内容简报包含 B2B 上下文和事实边界', 'Content Engine 不越权决定站内 SEO 策略'],
  },
  {
    title: '交付合格',
    items: ['导出包不含敏感凭据', '任务状态清楚', '复盘能看出风险、关键词和交付进展'],
  },
]

const sourceMap = [
  ['产品边界与核心原则', '明确只做 WordPress B2B 站内 SEO，不做外链、CRM、自动发布。'],
  ['新版 SOP 主流程', '整理成本教程的第一次使用、日常工作流、交付复盘顺序。'],
  ['用户工作流与前端工作区', '对应 11 个工作区说明和快捷入口。'],
  ['WordPress 读取与审计规范', '对应项目中心、SEO 诊断、页面问题证据。'],
  ['B2B 上下文与证据库规范', '对应供应商可信度、资料与素材库、事实边界。'],
  ['关键词导入清洗审核分配流程', '对应关键词状态、CSV 导入、人工审核和页面分配教程。'],
  ['页面修复任务与优化包规范', '对应页面修复包构成和不可写内容。'],
  ['内容运营与 Content Engine 对接规范', '对应未使用有效词、聚类和内容交接教程。'],
  ['AI 提示词输入输出契约', '对应 AI 工作台、人工审核点和失败处理。'],
  ['验收标准与测试清单', '对应本教程的验收清单和验证口径。'],
  ['本地数据安全与权限边界', '对应只读模式、导出包和敏感信息边界。'],
]

function Tutorial() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1480px] flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-950">B2B SEO OS 使用教程</p>
              <p className="text-xs text-gray-500">v0.2 落地版产品说明文档</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="/overview"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <Home className="h-4 w-4" />
              返回工作台
            </a>
            <a
              href="#first-run"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <PlayCircle className="h-4 w-4" />
              从第一步开始
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1480px] gap-6 px-4 py-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <nav className="rounded-lg border border-gray-200 bg-white p-4" aria-label="教程目录">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">目录</p>
              <div className="mt-3 space-y-1">
                {toc.map((item) => (
                  <a key={item.href} href={item.href} className="block rounded-md px-2 py-2 text-sm text-gray-600 transition hover:bg-gray-50 hover:text-gray-950">
                    {item.label}
                  </a>
                ))}
              </div>
            </nav>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">工作区快捷入口</p>
              <div className="mt-3 space-y-1">
                {workspaceLinks.slice(0, 7).map((item) => {
                  const Icon = item.icon
                  return (
                    <a key={item.href} href={item.href} className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-gray-600 transition hover:bg-gray-50 hover:text-gray-950">
                      <Icon className="h-4 w-4 text-primary-600" />
                      <span>{item.label}</span>
                    </a>
                  )
                })}
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <article className="space-y-6">
            <section className="rounded-lg border border-gray-200 bg-white p-5 md:p-8">
              <div className="max-w-4xl">
                <p className="text-sm font-semibold text-primary-700">给非技术人员的完整教程</p>
                <h1 className="mt-3 text-3xl font-semibold leading-tight text-gray-950 md:text-4xl">从接手一个 B2B WordPress 网站，到完成 SEO 诊断、关键词分配、页面修复和交付</h1>
                <p className="mt-4 text-base leading-8 text-gray-600">
                  这份教程把项目方案文档整理成可以直接照着做的版本。你不需要懂代码，也不需要知道 Prompt、JSON、状态机是什么意思。只要按步骤确认资料、审核结果、推进任务，就能把一个混乱的 B2B 外贸站整理成可持续运营的 SEO 工作流。
                </p>
              </div>
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <MetricCard label="核心范围" value="WordPress B2B 独立站" />
                <MetricCard label="工作区数量" value="11 个" />
                <MetricCard label="安全原则" value="只读分析，人工确认" />
              </div>
            </section>

            <DocSection id="what-is-it" eyebrow="Product Overview" title="一、这是什么">
              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-4">
                  <p>
                    B2B SEO OS 是一个站内 SEO 运营工作台。它面向已经有 WordPress 网站的 B2B 外贸公司，先读取现有网站，再诊断问题、建立关键词数据库、整理公司和产品证据，最后生成页面修复任务和交付包。
                  </p>
                  <Callout tone="blue" title="一句话理解">
                    它不是写文章工具，也不是网站编辑器。它更像一个 SEO 项目经理，把“网站有什么、缺什么、关键词该去哪、页面怎么修、交付给谁”这几件事串起来。
                  </Callout>
                  <div className="grid gap-3 md:grid-cols-2">
                    <CheckItem title="它会做" items={['读取 WordPress 网站结构', '诊断站内 SEO 问题', '清洗和审核关键词', '生成页面修复包', '整理内容交接包']} />
                    <CheckItem title="它不会做" items={['自动发布 WordPress', '购买外链', '替你确认供应商真假', '管理 CRM 客户', '强行把词塞进页面']} negative />
                  </div>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-950">系统主线</p>
                  <div className="mt-4 space-y-3">
                    {['读取网站', '诊断问题', '建立证据', '清洗关键词', '人工审核', '页面修复', '内容交接', '导出复盘'].map((item, index) => (
                      <div key={item} className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-xs font-semibold text-primary-700 ring-1 ring-gray-200">{index + 1}</span>
                        <span className="text-sm text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DocSection>

            <DocSection id="roles" eyebrow="People" title="二、谁该看这份教程：角色与分工">
              <p>
                这个系统不是只给 SEO 专家使用。一个 B2B 网站项目通常需要负责人、运营、内容、网站执行、销售资料同事一起协作。你可以先找到自己的角色，再看对应工作区。
              </p>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {roles.map((role) => (
                  <div key={role.title} className="rounded-lg border border-gray-200 bg-white p-4">
                    <p className="text-sm font-semibold text-gray-950">{role.title}</p>
                    <p className="mt-2 text-sm leading-6 text-gray-600">{role.focus}</p>
                    <ul className="mt-3 space-y-2">
                      {role.actions.map((item) => (
                        <li key={item} className="flex gap-2 text-sm leading-6 text-gray-600">
                          <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-success-600" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </DocSection>

            <DocSection id="first-run" eyebrow="Quick Start" title="三、第一次使用：按这 5 步走">
              <div className="space-y-3">
                {firstRunSteps.map((step, index) => (
                  <StepCard key={step.title} index={index + 1} title={step.title} body={step.body} link={step.link} linkLabel={step.linkLabel} />
                ))}
              </div>
              <Callout tone="orange" title="新手最容易踩的坑">
                不要从关键词开始。正确顺序是先读网站和诊断，再补证据，最后处理关键词。这样才能知道每个词应该进入现有页面、进入内容计划，还是被排除。
              </Callout>
            </DocSection>

            <DocSection id="workspace-map" eyebrow="Navigation" title="四、工作区地图：每个页面什么时候用">
              <div className="grid gap-4 lg:grid-cols-2">
                {workspaceGuide.map((item) => (
                  <WorkspaceCard key={item.href} {...item} />
                ))}
              </div>
            </DocSection>

            <DocSection id="daily-flow" eyebrow="SOP" title="五、日常工作流：每天怎么推进">
              <p>
                如果你不是开发人员，也不是专业 SEO 顾问，建议每天按下面的顺序处理。这个顺序来自项目 SOP：先看全局状态，再处理高风险，再推进关键词和交付。
              </p>
              <div className="mt-4 rounded-lg border border-gray-200 bg-white">
                {dailyFlow.map((item, index) => (
                  <div key={item} className="flex gap-4 border-b border-gray-100 p-4 last:border-b-0">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary-50 text-sm font-semibold text-primary-700">{index + 1}</span>
                    <p className="text-sm leading-6 text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <SmallTip icon={<Target className="h-4 w-4" />} title="优先级" body="P0/P1 先处理，低风险问题可以排到后面。" />
                <SmallTip icon={<Lock className="h-4 w-4" />} title="事实边界" body="凡是证书、产能、质保、交期，都要有资料支撑。" />
                <SmallTip icon={<Link2 className="h-4 w-4" />} title="链接关系" body="产品页、分类页、博客之间要形成合理内链。" />
              </div>
            </DocSection>

            <DocSection id="keyword-flow" eyebrow="Keywords" title="六、关键词教程：从 CSV 到页面分配">
              <div className="space-y-4">
                <p>
                  关键词工作区是整个系统的核心之一。它不是一个普通表格，而是一个从“导入、清洗、审核、分配、未使用词池、聚类、内容机会”逐步推进的子系统。
                </p>
                <div className="grid gap-3 md:grid-cols-4">
                  <ProcessTile icon={<Upload className="h-4 w-4" />} title="导入" body="上传 CSV，保留来源记录。" />
                  <ProcessTile icon={<Wrench className="h-4 w-4" />} title="清洗" body="合并、去重、统一格式、AI 打标。" />
                  <ProcessTile icon={<Search className="h-4 w-4" />} title="审核" body="人工判断是否相关、是否 B2B。" />
                  <ProcessTile icon={<Map className="h-4 w-4" />} title="分配" body="适合页面才分配，不适合就进入词池。" />
                </div>
                <h3 className="text-lg font-semibold text-gray-950">关键词状态怎么理解</h3>
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="bg-gray-50 text-xs font-semibold text-gray-500">
                      <tr>
                        <th className="px-4 py-3">状态</th>
                        <th className="px-4 py-3">给人看的意思</th>
                        <th className="px-4 py-3">你要做什么</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {keywordStatuses.map((item) => (
                        <tr key={item.name}>
                          <td className="px-4 py-3 font-mono text-xs text-primary-700">{item.name}</td>
                          <td className="px-4 py-3 text-gray-800">{item.meaning}</td>
                          <td className="px-4 py-3 text-gray-600">{item.action}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Callout tone="green" title="判断一个关键词能不能分配给页面">
                  看三件事：这个词是否属于 B2B 采购意图；这个页面是否真的讲这个产品或能力；你是否有足够证据支撑页面内容。如果有任何一项不满足，就不要硬塞。
                </Callout>
                <div className="flex flex-wrap gap-2">
                  <DocButton href="/keywords">进入页面与关键词</DocButton>
                  <DocButton href="/ai-workbench" tone="secondary">查看 AI 清洗契约</DocButton>
                </div>
              </div>
            </DocSection>

            <DocSection id="page-repair" eyebrow="Page Repair" title="七、页面修复教程：什么叫“修一个页面”">
              <p>
                页面修复不是简单改标题，也不是把关键词塞到正文里。一个合格的页面修复包，会告诉执行人员这个页面为什么要修、要补哪些证据、哪些关键词适合放进来、哪些地方需要人工确认。
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {repairPackage.map((item) => (
                  <div key={item.label} className="rounded-lg border border-gray-200 bg-white p-4">
                    <p className="text-sm font-semibold text-gray-950">{item.label}</p>
                    <p className="mt-2 text-sm leading-6 text-gray-600">{item.value}</p>
                  </div>
                ))}
              </div>
              <Callout tone="red" title="不能写的内容">
                没有证据的绝对承诺不要写，例如“保证 5 年寿命”“全球最低价”“所有证书齐全”。如果资料里没有，就标记为需要确认。
              </Callout>
              <div className="flex flex-wrap gap-2">
                <DocButton href="/audit">从诊断问题开始</DocButton>
                <DocButton href="/delivery" tone="secondary">查看交付包</DocButton>
              </div>
            </DocSection>

            <DocSection id="content-flow" eyebrow="Content" title="八、内容运营教程：未使用有效词怎么变成内容机会">
              <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-3">
                  <p>
                    很多好词不适合放到现有页面。例如采购指南、问题型关键词、对比词、应用场景词。这些词不应该被浪费，也不应该硬塞进产品页，而是进入内容运营流程。
                  </p>
                  <Callout tone="purple" title="内容运营的边界">
                    B2B SEO OS 负责把上下文、关键词、证据和内容简报交给 Content Engine。真正的长文生产、编辑和发布，由内容执行流程继续处理。
                  </Callout>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-sm font-semibold text-gray-950">从词到内容的路径</p>
                  <div className="mt-4 space-y-3">
                    {['未使用有效词', '超级聚类', '内容机会', '内容简报', '交给 Content Engine', '人工审核后发布'].map((item, index) => (
                      <div key={item} className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-50 text-xs font-semibold text-purple-700">{index + 1}</span>
                        <span className="text-sm text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <DocButton href="/content">进入内容运营</DocButton>
                <DocButton href="/assets" tone="secondary">检查素材库</DocButton>
              </div>
            </DocSection>

            <DocSection id="delivery-flow" eyebrow="Delivery" title="九、交付与复盘：怎么把工作结果交出去">
              <p>
                交付中心用于把系统里的分析结果变成执行人员能看懂的包。你可以把它理解为“项目经理交接文件”：它不只说问题，还要说页面、证据、关键词、任务状态和人工确认点。
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <DeliveryCard title="页面修复包" items={['页面 URL', '问题证据', '关键词分配', '文案建议', '人工确认点']} />
                <DeliveryCard title="任务清单包" items={['任务优先级', '来源模块', '负责人建议', '状态', '验收标准']} />
                <DeliveryCard title="内容交接包" items={['关键词聚类', '内容角度', 'B2B 上下文', '可用素材', '不可写边界']} />
              </div>
              <Callout tone="blue" title="复盘时看什么">
                看三个问题：高风险问题是否减少；关键词是否从待审核进入可执行状态；交付包是否能让执行人员不用再反复追问背景资料。
              </Callout>
              <DocButton href="/delivery">进入交付中心</DocButton>
            </DocSection>

            <DocSection id="safety" eyebrow="Security" title="十、安全边界：哪些事情必须人工确认">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary-600" />
                    <h3 className="text-base font-semibold text-gray-950">当前原型默认边界</h3>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-600">
                    <li>只读读取 WordPress，不自动写入。</li>
                    <li>AI 输出必须可查看、可追溯、可人工确认。</li>
                    <li>导出包不应包含敏感凭据。</li>
                    <li>涉及事实承诺的内容必须有证据支撑。</li>
                  </ul>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-success-600" />
                    <h3 className="text-base font-semibold text-gray-950">人工确认清单</h3>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-600">
                    <li>证书名称、有效期、适用范围。</li>
                    <li>产能、交期、质保、测试标准。</li>
                    <li>客户案例、出口市场、合作品牌。</li>
                    <li>任何可能构成商业承诺的表达。</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4">
                <DocButton href="/settings">查看系统安全状态</DocButton>
              </div>
            </DocSection>

            <DocSection id="acceptance" eyebrow="Checklist" title="十一、验收清单：做到什么算合格">
              <p>
                下面这份清单可以作为项目复盘和交付验收使用。它不是技术测试清单，而是面向业务和运营的“是否真的能落地”的判断标准。
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {acceptanceGroups.map((group) => (
                  <div key={group.title} className="rounded-lg border border-gray-200 bg-white p-4">
                    <p className="text-sm font-semibold text-gray-950">{group.title}</p>
                    <ul className="mt-3 space-y-2">
                      {group.items.map((item) => (
                        <li key={item} className="flex gap-2 text-sm leading-6 text-gray-600">
                          <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-success-600" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </DocSection>

            <DocSection id="sources" eyebrow="Source Mapping" title="十二、这份教程参考了哪些项目方案">
              <p>
                本页不是从零写出来的说明书，而是把 v0.2 项目方案拆成更适合实际使用的教程。下面是方案内容和本教程落地章节的对应关系。
              </p>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-gray-50 text-xs font-semibold text-gray-500">
                    <tr>
                      <th className="px-4 py-3">方案来源</th>
                      <th className="px-4 py-3">在教程里怎么落地</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {sourceMap.map(([source, landing]) => (
                      <tr key={source}>
                        <td className="px-4 py-3 font-semibold text-gray-900">{source}</td>
                        <td className="px-4 py-3 text-gray-600">{landing}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DocSection>

            <DocSection id="faq" eyebrow="FAQ" title="十三、常见问题">
              <div className="space-y-3">
                {faq.map((item) => (
                  <details key={item.question} className="rounded-lg border border-gray-200 bg-white p-4">
                    <summary className="cursor-pointer text-sm font-semibold text-gray-950">{item.question}</summary>
                    <p className="mt-3 text-sm leading-6 text-gray-600">{item.answer}</p>
                  </details>
                ))}
              </div>
            </DocSection>

            <DocSection id="glossary" eyebrow="Glossary" title="十四、术语表">
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-gray-50 text-xs font-semibold text-gray-500">
                    <tr>
                      <th className="px-4 py-3">术语</th>
                      <th className="px-4 py-3">普通话解释</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {glossary.map(([term, explanation]) => (
                      <tr key={term}>
                        <td className="px-4 py-3 font-semibold text-gray-900">{term}</td>
                        <td className="px-4 py-3 text-gray-600">{explanation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DocSection>
          </article>
        </main>
      </div>
    </div>
  )
}

function DocSection({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 rounded-lg border border-gray-200 bg-gray-50 p-4 md:p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold text-gray-950">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-7 text-gray-600">{children}</div>
    </section>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-semibold text-gray-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-gray-950">{value}</p>
    </div>
  )
}

function Callout({ tone, title, children }: { tone: Tone; title: string; children: ReactNode }) {
  return (
    <div
      className={cx(
        'rounded-lg border p-4',
        tone === 'blue' && 'border-primary-100 bg-primary-50 text-primary-900',
        tone === 'green' && 'border-success-100 bg-success-50 text-success-900',
        tone === 'orange' && 'border-warning-100 bg-warning-50 text-warning-900',
        tone === 'red' && 'border-danger-100 bg-danger-50 text-danger-900',
        tone === 'purple' && 'border-purple-100 bg-purple-50 text-purple-900',
        tone === 'gray' && 'border-gray-200 bg-white text-gray-800',
      )}
    >
      <p className="text-sm font-semibold">{title}</p>
      <div className="mt-2 text-sm leading-6">{children}</div>
    </div>
  )
}

function CheckItem({ title, items, negative = false }: { title: string; items: string[]; negative?: boolean }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-sm font-semibold text-gray-950">{title}</p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-gray-600">
            <CheckCircle2 className={cx('mt-0.5 h-4 w-4 shrink-0', negative ? 'text-gray-400' : 'text-success-600')} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function StepCard({ index, title, body, link, linkLabel }: { index: number; title: string; body: string; link: string; linkLabel: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-sm font-semibold text-white">{index}</span>
          <div>
            <h3 className="text-base font-semibold text-gray-950">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-gray-600">{body}</p>
          </div>
        </div>
        <a href={link} className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
          {linkLabel}
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  )
}

function WorkspaceCard({ title, href, icon: Icon, tone, useFor, userDoes }: { title: string; href: string; icon: typeof Home; tone: Tone; useFor: string; userDoes: string[] }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cx(
              'flex h-10 w-10 items-center justify-center rounded-lg',
              tone === 'blue' && 'bg-primary-50 text-primary-700',
              tone === 'green' && 'bg-success-50 text-success-700',
              tone === 'orange' && 'bg-warning-50 text-warning-700',
              tone === 'red' && 'bg-danger-50 text-danger-700',
              tone === 'purple' && 'bg-purple-50 text-purple-700',
              tone === 'gray' && 'bg-gray-100 text-gray-700',
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-950">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{useFor}</p>
          </div>
        </div>
        <a href={href} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary-700 hover:bg-primary-50">
          打开
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
      <ul className="mt-4 space-y-2">
        {userDoes.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-6 text-gray-600">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-success-600" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SmallTip({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2 text-primary-700">{icon}<p className="text-sm font-semibold text-gray-950">{title}</p></div>
      <p className="mt-2 text-sm leading-6 text-gray-600">{body}</p>
    </div>
  )
}

function ProcessTile({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-700">{icon}</div>
      <p className="mt-3 text-sm font-semibold text-gray-950">{title}</p>
      <p className="mt-1 text-sm leading-6 text-gray-600">{body}</p>
    </div>
  )
}

function DeliveryCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-sm font-semibold text-gray-950">{title}</p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-gray-600">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function DocButton({ href, tone = 'primary', children }: { href: string; tone?: 'primary' | 'secondary'; children: ReactNode }) {
  return (
    <a
      href={href}
      className={cx(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        tone === 'primary' && 'bg-primary-600 text-white hover:bg-primary-700',
        tone === 'secondary' && 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
      )}
    >
      {children}
      <ArrowRight className="h-4 w-4" />
    </a>
  )
}

export default Tutorial
