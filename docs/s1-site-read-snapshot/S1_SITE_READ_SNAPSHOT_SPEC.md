# B2B SEO OS — S1 WordPress 网站读取定稿

> Workflow Step: `S1_SITE_READ`  
> Artifact Schema: `site_read_snapshot_v1`  
> Status: confirmed / 定稿  
> Date: 2026-06-11  
> Scope: WordPress B2B 外贸独立站读取快照，不做审计判断，不做 WordPress 写入。

---

## 1. S1 阶段定位

S1 的名称是：**WordPress 网站读取 / Site Read Snapshot**。

S1 的目标不是审计，也不是判断网站好坏，而是把目标 WordPress B2B 外贸独立站的公开网站结构读取出来，形成一个可被系统解析、可被人工审核、可写入 `ProjectKnowledgeBase` 的结构化网站快照。

S1 只回答一个问题：

> 当前网站实际有哪些页面？每个页面是什么类型？页面基础 SEO 与结构字段是什么？这些页面从哪里被发现？是否存在明显读取异常？

S1 完成后，系统才进入 S2 网站现状审计。

---

## 2. S1 在整体工作流中的位置

前置条件：

- S0 `ProjectProfile` 已填写完成。
- 必填字段通过系统校验。
- 用户点击“确认启动项目”。
- `WorkflowState` 已推进到 S1。

S1 完成后解锁：

- S2 网站现状审计。

S1 不直接进入关键词、内容、修复任务或 Content Engine。

---

## 3. S1 输入来源

S1 的任务包由系统基于 `ProjectProfile` 自动生成。

主要注入字段包括：

```ts
ProjectProfile {
  domain: string
  company: string
  industry: string
  targetMarkets: string[]
  supplierIdentity: string
  coreProducts: string[]
  targetCustomers: string[]
  primaryConversionGoal: string
  knownCompetitors: string[]
  knownImportantPages: string[]
  specialConcerns: string

  wordpressAccess: 'frontend_only' | 'readonly_api' | 'admin_access'
  seoPlugin: 'yoast' | 'rankmath' | 'aioseo' | 'unknown' | 'none'
  hasWooCommerce: boolean
  estimatedPageCount: 'under_20' | '20_to_100' | 'over_100'
  searchLanguages: string[]
  productType: 'standard' | 'oem' | 'odm' | 'mixed'
}
```

其中对 S1 影响最大的字段是：

```ts
wordpressAccess
seoPlugin
hasWooCommerce
estimatedPageCount
knownImportantPages
domain
```

---

## 4. S1 执行方式

S1 采用外部智能体执行模式。

完整闭环如下：

1. 用户进入 S1。
2. 系统生成 `AgentTaskPack`。
3. 用户复制任务包。
4. 用户交给 ChatGPT / Claude / OpenClaw 等外部智能体。
5. 外部智能体执行只读读取任务。
6. 外部智能体输出 `site_read_snapshot_v1`。
7. 用户上传 JSON 或 ZIP 文件。
8. 系统保存 raw Artifact。
9. 系统解析、校验、提示 error / warning。
10. 用户进入人工审核界面。
11. 审核通过后写入 `ProjectKnowledgeBase.siteReadSnapshot`。
12. `WorkflowState` 推进到 S2。

---

## 5. S1 读取边界

S1 必须遵守只读原则。

允许：

- 读取公开前台页面。
- 读取 `sitemap.xml`。
- 读取 `robots.txt`。
- 读取主导航、页脚导航、首页内链。
- 低频访问页面 HTML。
- 在有权限时读取 WordPress REST API 的只读数据。
- 在有权限时读取页面、文章、产品、分类、SEO 插件可见字段。

禁止：

- 修改 WordPress 内容。
- 创建草稿。
- 发布文章。
- 上传媒体。
- 修改插件配置。
- 修改主题配置。
- 修改 SEO 设置。
- 修改菜单。
- 修改表单。
- 修改数据库。
- 提交真实客户询盘。
- 压力测试。
- 漏洞利用。
- 暴力破解。
- 暴露 Cookie、Token、API Key 或客户隐私数据。

---

## 6. S1 读取策略

S1 采用：**前台为主，API 辅助**。

### 6.1 `frontend_only`

如果：

```ts
wordpressAccess = 'frontend_only'
```

则任务包只要求外部智能体读取：

1. `sitemap.xml`
2. `robots.txt`
3. 首页
4. 主导航
5. 页脚导航
6. 首页内部链接
7. sitemap 中出现的公开页面
8. 导航和 crawl 发现但 sitemap 未收录的页面

### 6.2 `readonly_api` / `admin_access`

如果：

```ts
wordpressAccess = 'readonly_api' | 'admin_access'
```

则任务包仍以前台读取为主，但允许额外读取：

1. WordPress REST API 页面列表。
2. WordPress REST API 文章列表。
3. WooCommerce 产品列表，如果 `hasWooCommerce = true`。
4. 分类、标签、产品分类。
5. 可见 SEO 字段，例如 Yoast / RankMath / AIOSEO 暴露字段。
6. 页面状态，如 published、draft、private、noindex 等只读信息。

API 读取只能作为补充，不覆盖前台真实可见结果。

---

## 7. URL 发现规则

S1 的 URL 发现顺序：

1. 先读取 `sitemap.xml`。
2. 再读取主导航。
3. 再读取页脚导航。
4. 再读取首页内部链接。
5. 再补充 `knownImportantPages`。
6. 如果有 API 权限，再读取 WordPress API 中的页面、文章、产品列表。
7. 合并去重。
8. 标注每个 URL 的主要来源 `detectedFrom`。
9. 对异常页面写入 `anomalies`。

URL 来源枚举：

```ts
type DetectedFrom =
  | 'sitemap'
  | 'navigation'
  | 'footer'
  | 'crawl'
```

如果某个页面只存在于 API 中，但公开前台没有入口，不直接进入主要 pages 列表，而是写入 `anomalies`。

---

## 8. 页面类型枚举

每个页面必须归类为以下类型之一：

```ts
type PageType =
  | 'home'
  | 'product_category'
  | 'product_detail'
  | 'industry'
  | 'solution'
  | 'case'
  | 'about'
  | 'factory'
  | 'contact'
  | 'rfq'
  | 'blog'
  | 'faq'
  | 'download'
  | 'privacy'
  | 'other'
```

如果外部智能体无法判断页面类型，应使用：

```ts
pageType: 'other'
```

并在 `anomalies` 中说明原因。

---

## 9. S1 输出格式

S1 标准输出为：

```ts
site_read_snapshot_v1
```

顶层结构：

```ts
{
  schemaVersion: 'site_read_snapshot_v1'
  domain: string
  generatedAt: string
  source: {
    taskPackId: string
    agentName?: string
    executedAt?: string
  }
  site: SiteSnapshot
  pages: PageSnapshot[]
  anomalies: SiteReadAnomaly[]
  rawNotes?: string
}
```

---

## 10. site 级别字段

```ts
type SiteSnapshot = {
  domain: string
  seoPlugin: string
  hasWooCommerce: boolean
  menus: object
  sitemapUrl: string
  robotsTxtStatus: string
  trustPages: string[]
  anomalies: Array<{
    type: string
    url: string
    description: string
  }>
}
```

说明：

- `seoPlugin` 优先来自 `ProjectProfile`，其次来自外部智能体观察。
- `hasWooCommerce` 优先来自 `ProjectProfile`，其次来自外部智能体观察。
- `menus` 保存主导航、页脚导航、移动端菜单等结构。
- `trustPages` 保存 About、Factory、Capability、Certificate、Case、Contact、FAQ、Download 等信任资产页面。
- `anomalies` 保存站点级异常。

---

## 11. page 级别字段

```ts
type PageSnapshot = {
  url: string
  pageType:
    | 'home'
    | 'product_category'
    | 'product_detail'
    | 'industry'
    | 'solution'
    | 'case'
    | 'about'
    | 'factory'
    | 'contact'
    | 'rfq'
    | 'blog'
    | 'faq'
    | 'download'
    | 'privacy'
    | 'other'

  title: string
  h1: string
  metaDescription: string
  h2List: string[]
  primaryCta: string
  formsDetected: string[]
  internalLinks: Array<{
    url: string
    anchorText: string
  }>
  detectedFrom:
    | 'sitemap'
    | 'navigation'
    | 'crawl'
    | 'footer'
  status:
    | 'public'
    | 'noindex'
    | 'redirect'
    | '404'
}
```

说明：

- `h2List` 保留，用于后续关键词地图、页面子主题判断。
- `internalLinks` 必须保留 `anchorText`，用于后续内链优化。
- `primaryCta` 只记录页面上最主要的 CTA，不在 S1 判断好坏。
- `formsDetected` 只记录表单存在与类型，不测试真实提交。
- `status` 只记录页面当前可见状态，不做 SEO 判断。

---

## 12. anomalies 级别字段

```ts
type SiteReadAnomaly = {
  type:
    | 'sitemap_url_404'
    | 'sitemap_url_redirect'
    | 'navigation_url_404'
    | 'api_only_page'
    | 'frontend_api_conflict'
    | 'missing_core_field'
    | 'unknown_page_type'
    | 'duplicate_url'
    | 'blocked_by_robots'
    | 'read_failed'
    | 'other'

  severity: 'error' | 'warning'
  url?: string
  field?: string
  description: string
  evidence?: string
  suggestedAction?: string
}
```

典型 anomalies：

- sitemap 中存在但前台 404。
- sitemap 中存在但跳转。
- 导航链接 404。
- API 中存在页面但前台无入口。
- 前台 title 与 API title 不一致。
- 前台页面 public，但 API 显示 noindex。
- 页面类型无法判断。
- title / h1 缺失。
- 页面读取失败。

---

## 13. 前台与 API 冲突处理策略

当前台读取结果和 API 读取结果不一致时，采用：

> 前台优先 + 冲突记录

规则：

1. 页面展示字段以前台真实访问结果为准。
2. API 仅作为补充信息来源。
3. API 不直接覆盖前台字段。
4. 冲突必须写入 `anomalies`。
5. 冲突交给 S2 做正式判断。

示例：

```ts
{
  type: 'frontend_api_conflict',
  severity: 'warning',
  url: 'https://example.com/product-a/',
  field: 'title',
  description: 'Frontend title and WordPress API title are different.',
  evidence: 'frontend: Product A | api: Product A - Draft SEO Title',
  suggestedAction: 'Review in S2 audit.'
}
```

---

## 14. 回填文件支持

S1 支持两种上传方式。

### 14.1 单个 JSON 文件

适合小站。

文件名建议：

```txt
site_read_snapshot_v1.json
```

内容为完整的 `site_read_snapshot_v1`。

### 14.2 ZIP 文件包

适合大站、分批读取、外部智能体拆分输出。

ZIP 内部建议结构：

```txt
site_read_snapshot_v1.zip
├─ site.json
├─ pages.json
├─ anomalies.json
└─ raw_notes.md
```

系统导入后统一解析成：

```ts
site_read_snapshot_v1
```

---

## 15. Artifact 保存策略

S1 上传的原始文件必须永久保存到 `ArtifactStore`。

```ts
Artifact {
  id: string
  workflowStep: 'S1_SITE_READ'
  artifactType: 'site_read_snapshot_upload'
  originalFileName: string
  fileType: 'json' | 'zip'
  uploadedAt: string
  parseStatus: 'pending' | 'parsed' | 'failed'
  rawFilePath: string
}
```

策略：

- raw Artifact 永久保留。
- 结构化 SiteReadSnapshot 只保留最新版。
- 新版本导入成功后覆盖 `ProjectKnowledgeBase.siteReadSnapshot`。
- 旧 raw Artifact 可用于重新解析和追溯。

---

## 16. ProjectKnowledgeBase 写入结构

S1 审核通过后写入：

```ts
ProjectKnowledgeBase {
  siteReadSnapshot: {
    schemaVersion: 'site_read_snapshot_v1'
    sourceArtifactId: string
    importedAt: string
    importedBy: string
    pageCount: number
    warningCount: number
    errorCount: number
    site: SiteSnapshot
    pages: PageSnapshot[]
    anomalies: SiteReadAnomaly[]
  }
}
```

注意：

- `KnowledgeBase` 中只保存当前最新结构化快照。
- `ArtifactStore` 中保存所有上传历史。
- S2 只读取 `KnowledgeBase` 中的最新快照。

---

## 17. 解析与校验规则

系统导入后执行以下校验。

### 17.1 文件级校验

必须满足：

- 文件可读取。
- JSON 格式合法，或 ZIP 可解压。
- `schemaVersion = site_read_snapshot_v1`。
- 存在 `site`。
- 存在 `pages`。
- `pages` 是数组。

不满足则导入失败。

### 17.2 页面级 error 字段

以下字段缺失或非法时，该页面标记为 error：

```ts
url
pageType
title
h1
status
detectedFrom
```

处理规则：

- 页面级 error 不写入正式 pages。
- 进入错误列表。
- 用户需要补跑或手动修正后才能确认。

### 17.3 页面级 warning 字段

以下字段缺失时标记为 warning：

```ts
metaDescription
h2List
primaryCta
formsDetected
internalLinks
```

处理规则：

- 页面仍可入库。
- 字段允许为 `null`、`unknown` 或空数组。
- 审核界面提示用户该页面信息不完整。
- 用户可选择接受 warning 并继续推进。

### 17.4 站点级 warning 字段

以下字段缺失时标记为 warning：

```ts
menus
sitemapUrl
robotsTxtStatus
trustPages
```

处理规则：

- 不阻止入库。
- 但审核界面必须提示。

---

## 18. S1 不完整输出处理策略

S1 采用“按严重程度分级”。

规则：

- 核心字段缺失 = error。
- 次要字段缺失 = warning。
- error 必须处理后才能进入 S2。
- warning 可以由用户人工确认后继续推进。

这意味着：

- 不因为少量 `metaDescription`、`h2List`、`internalLinks` 缺失而卡死流程。
- 也不允许缺少 `url`、`pageType`、`title`、`h1` 的页面进入核心知识库。

---

## 19. 人工审核方式

S1 使用“页面抽查审核”。

审核界面包含：

1. 导入总览。
2. 页面数量。
3. 页面类型分布。
4. error 数量。
5. warning 数量。
6. anomalies 列表。
7. 页面表格。
8. 核心页面抽查入口。

用户至少应抽查：

- 首页。
- 核心产品 / 服务分类页。
- 核心产品 / 服务详情页。
- About / Company 页面。
- Factory / Capability 页面，如存在。
- Contact / RFQ 页面。
- Blog / Resource 页面，如存在。

用户不需要逐页确认。

---

## 20. 人工审核 checklist

```ts
HumanReviewChecklist_S1 = [
  {
    id: 's1_import_success',
    label: '确认文件已成功导入并完成解析',
    required: true
  },
  {
    id: 's1_no_blocking_errors',
    label: '确认不存在阻塞性 error，或已完成修正',
    required: true
  },
  {
    id: 's1_home_checked',
    label: '确认首页 URL、title、h1、pageType 基本正确',
    required: true
  },
  {
    id: 's1_core_pages_checked',
    label: '确认核心产品/服务页已抽查',
    required: true
  },
  {
    id: 's1_contact_checked',
    label: '确认 Contact/RFQ 页面已抽查',
    required: true
  },
  {
    id: 's1_anomalies_reviewed',
    label: '确认 anomalies 已查看',
    required: true
  },
  {
    id: 's1_warnings_accepted',
    label: '确认 warning 可接受，后续交给 S2 继续判断',
    required: true
  }
]
```

---

## 21. S1 UI 模块

S1 页面建议分为 5 个区域。

### 21.1 当前项目输入确认

展示来自 S0 的关键输入：

- domain
- company
- industry
- targetMarkets
- coreProducts
- wordpressAccess
- seoPlugin
- hasWooCommerce
- estimatedPageCount

### 21.2 AgentTaskPack 生成区

包含：

- 任务包标题。
- 当前任务目标。
- 只读安全边界。
- 读取步骤。
- 输出 JSON schema。
- 复制任务包按钮。

### 21.3 Artifact 上传区

支持：

- 上传 JSON。
- 上传 ZIP。
- 显示上传历史。
- 显示 `parseStatus`。

### 21.4 解析结果预览区

展示：

- 页面总数。
- 页面类型分布。
- public / noindex / redirect / 404 统计。
- error / warning 数量。
- anomalies 摘要。

### 21.5 人工审核区

展示：

- 页面表格。
- anomalies 列表。
- 核心页面抽查 checklist。
- warning 接受确认。
- “写入 KnowledgeBase 并进入 S2”按钮。

---

## 22. S1 WorkflowState 状态机

```ts
type S1State =
  | 'locked'
  | 'ready'
  | 'task_pack_generated'
  | 'artifact_uploaded'
  | 'parse_failed'
  | 'parsed_with_errors'
  | 'parsed_with_warnings'
  | 'pending_human_review'
  | 'approved'
  | 'written_to_knowledge_base'
  | 'completed'
```

状态流转：

```txt
S0 completed
↓
S1 ready
↓
task_pack_generated
↓
artifact_uploaded
↓
parsed_with_errors / parsed_with_warnings
↓
pending_human_review
↓
approved
↓
written_to_knowledge_base
↓
S1 completed
↓
S2 unlocked
```

阻塞规则：

- `parse_failed` 不能进入审核。
- `parsed_with_errors` 不能直接写入 KnowledgeBase。
- `parsed_with_warnings` 可以进入人工审核。
- 人工审核 checklist 未完成，不能推进 S2。

---

## 23. S1 完成条件

S1 完成必须同时满足：

1. 已生成 `AgentTaskPack`。
2. 用户已上传 JSON 或 ZIP Artifact。
3. Artifact 已成功解析。
4. 不存在阻塞性 error。
5. 用户完成 S1 人工审核 checklist。
6. 用户点击“确认写入 KnowledgeBase 并进入 S2”。
7. 系统成功写入 `ProjectKnowledgeBase.siteReadSnapshot`。
8. `WorkflowState` 推进到 `S1 completed`。
9. S2 解锁。

---

## 24. S1 明确不做的事情

S1 不做：

- 不审计网站质量。
- 不判断页面好坏。
- 不给 SEO 修复建议。
- 不给转化建议。
- 不打分。
- 不生成修复任务。
- 不生成关键词。
- 不生成内容 brief。
- 不连接真实 WordPress 写入。
- 不发布。
- 不上传媒体。
- 不提交真实表单。

这些内容后续分别进入：

- S2 网站现状审计。
- S8 关键词分配。
- S9 现有页面修复。
- S11 新页面 / 内容任务生成。
- S12 Content Engine 交接。

---

## 25. S1 PromptTemplate 来源说明

S1 PromptTemplate 从原始 B2B 网站审计提示词中提取以下部分：

1. 项目变量信息。
2. 默认执行原则。
3. 权限与安全边界。
4. 公开前台审计中的“页面结构识别”。

S1 不提取以下内容：

1. B2B 信息架构判断。
2. 首页审计判断。
3. 产品 / 服务质量判断。
4. 转化路径审计。
5. 信任感判断。
6. 技术 SEO 问题判断。
7. 性能审计。
8. 移动端审计。
9. 表单链路风险判断。
10. 后台 CMS 审计。
11. API 风险判断。
12. 安全与合规判断。
13. 数据追踪判断。
14. 30 天修复路线图。
15. 最应该先做的 10 件事。

这些属于 S2 的任务范围。

---

## 26. S1 最终确认决策汇总

已确认：

1. S1 是“读取网站快照”，不是正式审计。
2. 读取策略为：先 sitemap，再导航、页脚、首页内链补充。
3. 每个 URL 需要标注 `detectedFrom`。
4. 页面级字段保留 `h2List`。
5. `internalLinks` 必须带 `anchorText`。
6. sitemap 中有但前台 404 的页面写入 `anomalies`。
7. 回填方式支持 JSON 和 ZIP。
8. 缺失处理采用 error / warning 分级。
9. 人工审核采用页面抽查审核。
10. 结构化快照只保留最新版。
11. raw Artifact 历史永久保留。
12. S1 任务包采用前台为主、API 辅助。
13. 前台和 API 冲突时，前台优先，冲突写入 `anomalies`。
14. S1 审核通过后写入 `ProjectKnowledgeBase`，并解锁 S2。
