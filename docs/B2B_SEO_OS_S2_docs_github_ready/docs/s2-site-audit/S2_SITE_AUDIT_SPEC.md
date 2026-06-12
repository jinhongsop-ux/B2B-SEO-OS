# B2B SEO OS — S2 网站现状审计完整确认稿

> Workflow Step: `S2_SITE_AUDIT`  
> Artifact Schema: `site_audit_report_v1`  
> Status: confirmed / 定稿  
> 定位：S2 是诊断层，不是读取层，也不是执行层。S2 不评分、不人工审核、不直接生成任务、不写 WordPress。

---

## 1. 阶段定位

S2 的目标是基于 S0 `ProjectProfile`、S1 `SiteReadSnapshot` 和原始 B2B 审计提示词，对 WordPress B2B 外贸独立站做结构化诊断，输出可被系统解析、可写入 `ProjectKnowledgeBase`、可供后续 S3 / S9 / S11 使用的审计结果。

```txt
S1 = 读取层
S2 = 诊断层
S9 / S11 = 执行层
```

S2 只回答一个问题：

> 当前网站存在哪些影响 B2B SEO、转化、信任、性能、表单、CMS/API/安全和数据追踪的问题？

---

## 2. 前置条件与后续解锁

前置条件：

- S0 `ProjectProfile` 已完成。
- S1 `SiteReadSnapshot` 已写入 `ProjectKnowledgeBase`。
- `WorkflowState` 已推进到 S2。

S2 完成后解锁：

- S3 B2B 上下文与证据库建立。

---

## 3. 输入来源

S2 AgentTaskPack 基于 3 类输入生成：

```ts
S2Input {
  projectProfile: ProjectProfile
  siteReadSnapshot: ProjectKnowledgeBase.siteReadSnapshot
  auditPromptBase: OriginalB2BAuditPrompt
}
```

### 3.1 ProjectProfile

来自 S0，提供业务上下文，包括：

- domain
- company
- industry
- targetMarkets
- supplierIdentity
- coreProducts
- targetCustomers
- primaryConversionGoal
- knownCompetitors
- knownImportantPages
- specialConcerns
- wordpressAccess
- seoPlugin
- hasWooCommerce
- estimatedPageCount
- searchLanguages
- productType

### 3.2 S1 SiteReadSnapshot

来自 S1，是 S2 的网站结构底稿。

S2 不重新做完整 URL 发现，而是以 S1 的 `pages[]`、`site`、`anomalies[]` 作为主要审计范围。

### 3.3 原始 B2B 审计提示词

S2 使用用户已有的 B2B 网站全栈审计提示词作为审计框架来源，但改造成结构化 JSON 输出。

保留审计维度：

- B2B 信息架构
- 首页表达
- 产品 / 服务体系
- 转化路径
- 信任感与内容质量
- 技术 SEO
- 页面性能与移动端体验
- 表单与询盘链路
- CMS / API / 安全
- 数据追踪

不保留：

- 评分表
- P0 / P1 / P2 / P3
- Markdown 长报告作为可信结果
- 30 天路线图
- 任务池

---

## 4. 执行闭环

S2 继续采用外部智能体执行模式：

1. 用户进入 S2。
2. 系统读取 `ProjectProfile`。
3. 系统读取 S1 `SiteReadSnapshot`。
4. 系统读取 S2 `PromptTemplate`。
5. 系统生成 S2 `AgentTaskPack`。
6. 用户复制任务包。
7. 用户交给 ChatGPT / Claude / OpenClaw 等外部智能体。
8. 外部智能体基于 S1 页面清单和审计框架执行只读审计。
9. 外部智能体只输出 `site_audit_report_v1.json`。
10. 用户上传 JSON。
11. 系统保存 raw Artifact。
12. 系统解析与校验 JSON。
13. 校验通过后直接写入 `ProjectKnowledgeBase`。
14. `WorkflowState` 推进到 `S2 completed`。
15. S3 解锁。

---

## 5. 明确不做的事情

S2 不做：

- 不评分。
- 不输出综合评分。
- 不输出 0–10 分。
- 不输出 P0/P1/P2/P3。
- 不设置人工审核。
- 不直接生成任务池。
- 不生成 `taskCandidates`。
- 不写 WordPress。
- 不创建草稿。
- 不发布内容。
- 不上传媒体。
- 不提交真实表单。
- 不修改 CMS、插件、API、服务器、数据库、DNS 或 CDN。
- 不做攻击性测试。
- 不做漏洞利用。
- 不做压力测试。
- 不输出 Markdown 审计报告作为可信来源。

---

## 6. 输出格式

S2 只要求外部 AI 输出一个 JSON 文件：

```txt
site_audit_report_v1.json
```

JSON 是唯一可信结果。系统前端负责把 JSON 渲染成可读报告。

不要求：

- Markdown 报告
- 截图包
- HTML snippet
- API 原始返回
- 额外 raw notes

---

## 7. Schema 顶层结构

```ts
type SiteAuditReportV1 = {
  schemaVersion: 'site_audit_report_v1'
  generatedAt: string

  source: {
    taskPackId: string
    agentName?: string
    basedOn: {
      projectProfileVersion?: string
      siteReadSnapshotArtifactId?: string
      siteReadSnapshotImportedAt?: string
    }
  }

  inputSummary?: {
    domain: string
    company: string
    pageCount: number
    auditedPageCount: number
    skippedPageCount?: number
  }

  summary: SiteAuditSummary
  moduleReports: SiteAuditModuleReport[]
  findings: SiteAuditFinding[]
  limitations?: string[]
}
```

---

## 8. summary

```ts
type SiteAuditSummary = {
  overallStatus: string
  keyProblems: string[]
  keyOpportunities: string[]
  blockingFindingsCount: number
  normalFindingsCount: number
  nextStageNotes?: string
}
```

说明：

- `overallStatus` 是文字判断，不是评分。
- `keyProblems` 保存最关键问题。
- `keyOpportunities` 保存明显机会点。
- `blockingFindingsCount` / `normalFindingsCount` 只做数量统计，不做评分。

---

## 9. category 分类体系

S2 采用适合单人执行的 10 个审计模块：

```ts
type SiteAuditCategory =
  | 'site_structure'          // 网站结构
  | 'homepage'                // 首页
  | 'product_service_pages'   // 产品/服务页
  | 'conversion_path'         // 转化路径
  | 'trust_content'           // 信任与内容
  | 'technical_seo'           // 技术 SEO
  | 'performance_mobile'      // 性能与移动端
  | 'forms_leads'             // 表单与询盘
  | 'cms_api_security'        // CMS/API/安全
  | 'tracking_analytics'      // 数据追踪
```

不设置 `ownerType`，因为当前产品是单人执行使用，不按团队分工。

---

## 10. moduleReports

```ts
type SiteAuditModuleReport = {
  category: SiteAuditCategory
  title: string
  overview: string
  findingIds: string[]
  notes?: string[]
}
```

规则：

- 不包含 score。
- 不包含评分等级。
- 只做模块概览和 findings 引用。
- 前端通过 `findingIds` 聚合展示对应问题。

---

## 11. findings

`findings[]` 是 S2 最重要的数据结构。

```ts
type SiteAuditFinding = {
  id: string
  category: SiteAuditCategory
  priority: 'blocking' | 'normal'

  problem: string
  affectedUrls: string[]
  locationDescription?: string

  evidence: Array<{
    url: string
    note: string
  }>

  impact: string
  recommendedAction: string
  requiresDeveloper: boolean

  relatedS1PageUrls?: string[]
  status: 'detected'
}
```

---

## 12. priority 规则

S2 不使用 P0/P1/P2/P3，只使用两级优先级：

```ts
priority: 'blocking' | 'normal'
```

### blocking

表示必须优先处理的问题，例如：

- 核心页面无法访问。
- Contact / RFQ / Inquiry 表单无法打开。
- 关键页面 noindex。
- robots / sitemap 严重阻断收录。
- 主要转化入口断裂。
- 明显丢线索风险。
- 明显安全暴露。
- 移动端无法完成联系动作。
- API / 表单链路明显失败。

### normal

表示普通修复项，可以后续逐步处理，例如：

- 内容空泛。
- 信任资产不足。
- FAQ 缺失。
- Schema 不完整。
- 内链弱。
- 产品页参数不足。
- 首页表达不清晰但不阻塞访问。
- 数据追踪不完善。
- 性能可优化但不影响基本使用。

---

## 13. evidence 规则

S2 evidence 采用最小化设计：

```ts
evidence: {
  url: string
  note: string
}[]
```

不要求：

- HTML snippet
- 截图
- API 返回内容
- 控制台日志
- 原始 JSON 片段

原因：

- 当前产品是单人执行使用。
- 用户不需要理解底层技术细节。
- 过多技术证据会增加认知负担。
- 原始 AI 输出已经保存在 ArtifactStore，必要时可追溯。

---

## 14. recommendedAction

每个 finding 必须给出可执行修复建议。

要求：

- 不写空泛建议。
- 不只写“优化内容”。
- 必须说明应该补什么、改什么、检查什么。
- 不直接生成任务池。
- 不生成 `taskCandidates`。

---

## 15. requiresDeveloper

S2 保留：

```ts
requiresDeveloper: boolean
```

用于判断是否需要开发介入。

不保留：

```ts
ownerType
assignedTeam
assignee
```

因为当前产品面向单人执行，不做团队分派。

---

## 16. Artifact 保存策略

S2 上传的原始 JSON 保存到 ArtifactStore：

```ts
Artifact {
  id: string
  workflowStep: 'S2_SITE_AUDIT'
  artifactType: 'site_audit_report_json'
  originalFileName: 'site_audit_report_v1.json'
  fileType: 'json'
  uploadedAt: string
  parseStatus: 'pending' | 'parsed' | 'failed'
  rawFilePath: string
}
```

策略：

- raw JSON 原始文件保留。
- 不保存 Markdown 报告。
- 不保存额外笔记。
- `ProjectKnowledgeBase` 只保存最新版结构化结果。
- 历史追溯依赖 `ArtifactStore`。

---

## 17. ProjectKnowledgeBase 写入结构

```ts
ProjectKnowledgeBase {
  siteAuditReport: {
    schemaVersion: 'site_audit_report_v1'
    sourceArtifactId: string
    importedAt: string
    generatedAt: string
    summary: SiteAuditSummary
    moduleReports: SiteAuditModuleReport[]
    findings: SiteAuditFinding[]
    limitations?: string[]
  }
}
```

注意：

- `ProjectKnowledgeBase.siteAuditReport` 只保存最新版。
- 新的 S2 审计结果入库后覆盖旧版结构化结果。
- 原始 JSON 历史由 `ArtifactStore` 保存。

---

## 18. 解析与校验规则

### 18.1 核心字段严格

以下字段缺失时，S2 `parse_failed`，不能推进：

```ts
schemaVersion
generatedAt
source
summary
moduleReports[]
findings[]
```

每个 finding 至少必须包含：

```ts
id
category
priority
problem
affectedUrls
recommendedAction
```

每个 moduleReport 至少必须包含：

```ts
category
title
overview
findingIds
```

### 18.2 非核心字段宽松

以下字段缺失时，不阻塞 S2，可记录 warning 并补默认值：

```ts
inputSummary
limitations
locationDescription
evidence
impact
requiresDeveloper
relatedS1PageUrls
status
```

默认补值：

```ts
evidence: []
impact: 'unknown'
requiresDeveloper: false
status: 'detected'
```

---

## 19. 不需要人工审核

S2 不设置人工审核环节。

原因：

- 单人执行使用，避免增加操作负担。
- S2 只是诊断层，不直接写站、不生成任务。
- JSON 解析通过后即可进入知识库。
- 后续执行阶段仍可人工判断是否处理某个 finding。

流程为：

```txt
上传 JSON
→ 系统解析校验
→ 校验通过
→ 直接写入 ProjectKnowledgeBase
→ 解锁 S3
```

---

## 20. UI 模块

S2 页面建议包含 5 个区域：

1. 当前输入上下文  
   - ProjectProfile 摘要  
   - S1 SiteReadSnapshot 摘要  
   - 页面数量  
   - 页面类型分布  
   - S1 anomalies 摘要  

2. AgentTaskPack 生成区  
   - S2 任务目标  
   - 输入上下文  
   - 审计范围  
   - 输出 JSON Schema  
   - 复制任务包按钮  

3. JSON 上传区  
   - 上传 `site_audit_report_v1.json`  
   - 显示 Artifact 历史  
   - 显示 parseStatus  

4. 解析状态区  
   - parse success / failed  
   - warning 数量  
   - findings 数量  
   - blocking / normal 数量  
   - category 分布  

5. 审计结果浏览区  
   - summary  
   - moduleReports  
   - findings 表格  
   - category 筛选  
   - blocking 筛选  
   - requiresDeveloper 筛选  

不展示评分面板。

---

## 21. WorkflowState 状态机

```ts
type S2State =
  | 'locked'
  | 'ready'
  | 'task_pack_generated'
  | 'artifact_uploaded'
  | 'parse_failed'
  | 'parsed_with_warnings'
  | 'parsed'
  | 'written_to_knowledge_base'
  | 'completed'
```

状态流转：

```txt
S1 completed
↓
S2 ready
↓
task_pack_generated
↓
artifact_uploaded
↓
parse_failed / parsed_with_warnings / parsed
↓
written_to_knowledge_base
↓
S2 completed
↓
S3 unlocked
```

阻塞规则：

- `parse_failed` 不能写入 KnowledgeBase。
- `parsed_with_warnings` 可以写入 KnowledgeBase。
- `parsed` 可以写入 KnowledgeBase。
- 不需要人工审核状态。

---

## 22. S2 完成条件

S2 完成必须同时满足：

1. 已生成 S2 AgentTaskPack。
2. 用户已上传 `site_audit_report_v1.json`。
3. JSON 文件成功解析。
4. 核心字段校验通过。
5. 原始 JSON 已保存到 ArtifactStore。
6. 结构化结果已写入 `ProjectKnowledgeBase.siteAuditReport`。
7. WorkflowState 推进到 `S2 completed`。
8. S3 解锁。

---

## 23. S2 最终确认决策汇总

已确认：

1. S2 任务包基于 ProjectProfile + S1 SiteReadSnapshot + 原始审计提示词。
2. S2 不沿用 `audit_findings_v1`，改用 `site_audit_report_v1`。
3. S2 输出采用混合结构：summary + moduleReports + findings[]。
4. findings 字段采用自定义组合，服务后续 S9/S11/S13。
5. category 按审计模块分类，不按团队分类。
6. category 合并为 10 个适合单人执行的模块。
7. S2 不做评分。
8. S2 不使用 P0/P1/P2/P3。
9. priority 只保留 `blocking` / `normal`。
10. evidence 最小化，仅保留 URL + 简短说明。
11. S2 不直接生成修复任务。
12. S2 外部 AI 只输出 JSON。
13. S2 不需要人工审核。
14. S2 保留 JSON 原始 Artifact。
15. S2 解析规则为核心字段严格，非核心字段宽松。
16. ProjectKnowledgeBase 只保留最新版 siteAuditReport。
17. S2 完成后解锁 S3。
