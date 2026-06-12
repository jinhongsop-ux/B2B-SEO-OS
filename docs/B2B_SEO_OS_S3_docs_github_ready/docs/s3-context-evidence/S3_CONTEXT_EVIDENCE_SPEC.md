# B2B SEO OS — S3 B2B 上下文与证据库完整确认稿

> Workflow Step: `S3_CONTEXT_EVIDENCE`  
> Artifact Schema: `b2b_context_evidence_v1`  
> Status: confirmed / 定稿  
> 定位：S3 是 B2B 上下文与证据库建立层，不是审计层，也不是内容生成层。S3 把 S0 项目档案、S1 网站快照、S2 审计结果沉淀为后续关键词、页面、内容和修复阶段可复用的业务上下文资产。

---

## 1. 阶段定位

S3 的名称是：**B2B 上下文与证据库建立 / B2B Context & Evidence Base**。

S3 的目标不是重新审计网站，也不是直接生成内容，而是把前面阶段已经得到的信息整理成系统可用的 B2B 业务上下文和证据库。

S3 只回答一个问题：

> 这个 B2B 网站当前有哪些可被后续 SEO、关键词、页面规划、内容 brief、修复建议复用的业务对象、上下文事实和证据？

S3 的定位是上下文沉淀层。

```txt
S0 = 项目档案层
S1 = 网站读取层
S2 = 网站诊断层
S3 = B2B 上下文与证据沉淀层
S4 / S11 / S12 = 后续使用层
```

---

## 2. 前置条件与后续解锁

前置条件：

- S0 `ProjectProfile` 已完成。
- S1 `SiteReadSnapshot` 已写入 `ProjectKnowledgeBase`。
- S2 `SiteAuditReport` 已写入 `ProjectKnowledgeBase`。
- `WorkflowState` 已推进到 S3。

S3 完成后解锁：

- S4 种子词库生成。

S3 的数据后续也会被以下阶段复用：

- S4 种子词库生成
- S8 关键词审核与分配
- S9 现有页面修复
- S10 未使用关键词超级聚类
- S11 新页面 / 内容任务生成
- S12 Content Engine 交接

---

## 3. S3 输入来源

S3 AgentTaskPack 基于以下 3 类输入生成：

```ts
S3Input {
  projectProfile: ProjectProfile
  siteReadSnapshot: ProjectKnowledgeBase.siteReadSnapshot
  siteAuditReport: ProjectKnowledgeBase.siteAuditReport
}
```

### 3.1 ProjectProfile

来自 S0，提供业务基本盘：

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

来自 S1，提供网站结构底稿：

- `site`
- `pages[]`
- `anomalies[]`
- 页面类型
- 页面 URL
- title / h1 / h2List
- primaryCta
- formsDetected
- internalLinks
- trustPages

### 3.3 S2 SiteAuditReport

来自 S2，提供诊断结果：

- `moduleReports[]`
- `findings[]`
- blocking / normal 问题
- affectedUrls
- recommendedAction
- requiresDeveloper
- limitations

S3 不重新做完整爬取，也不重新做完整审计，而是基于 S0/S1/S2 的结构化结果做上下文归纳与证据沉淀。

---

## 4. S3 执行闭环

S3 继续采用外部智能体执行模式：

1. 用户进入 S3。
2. 系统读取 `ProjectProfile`。
3. 系统读取 S1 `SiteReadSnapshot`。
4. 系统读取 S2 `SiteAuditReport`。
5. 系统读取 S3 `PromptTemplate`。
6. 系统生成 S3 `AgentTaskPack`。
7. 用户复制任务包。
8. 用户交给 ChatGPT / Claude / OpenClaw 等外部智能体。
9. 外部智能体整理 B2B 上下文实体和证据项。
10. 外部智能体只输出 `b2b_context_evidence_v1.json`。
11. 用户上传 JSON。
12. 系统保存 raw Artifact。
13. 系统解析与校验 JSON。
14. 校验通过后直接写入 `ProjectKnowledgeBase`。
15. `WorkflowState` 推进到 `S3 completed`。
16. S4 解锁。

---

## 5. 明确不做的事情

S3 不做：

- 不重新审计网站。
- 不重新抓取全站。
- 不生成关键词。
- 不生成文章。
- 不生成页面 brief。
- 不生成修复任务。
- 不生成 taskCandidates。
- 不评分。
- 不做人工作业分配。
- 不输出 Markdown 报告作为可信来源。
- 不写 WordPress。
- 不发布内容。
- 不上传媒体。
- 不修改 CMS、插件、API、服务器、数据库、DNS 或 CDN。
- 不做攻击性测试。

---

## 6. S3 输出格式

S3 只要求外部 AI 输出一个 JSON 文件：

```txt
b2b_context_evidence_v1.json
```

JSON 是唯一可信结果。系统前端负责把 JSON 渲染为可读视图。

不要求：

- Markdown 报告
- CSV
- 截图包
- HTML snippet
- API 原始返回
- 附加 raw notes

---

## 7. Schema 顶层结构

```ts
type B2BContextEvidenceV1 = {
  schemaVersion: 'b2b_context_evidence_v1'
  generatedAt: string

  source: {
    taskPackId: string
    agentName?: string
    basedOn: {
      projectProfileVersion?: string
      siteReadSnapshotArtifactId?: string
      siteAuditReportArtifactId?: string
      siteReadSnapshotImportedAt?: string
      siteAuditReportImportedAt?: string
    }
  }

  contextEntities: ContextEntity[]
  evidenceItems: EvidenceItem[]
  entityEvidenceLinks: EntityEvidenceLink[]
  limitations?: string[]
}
```

S3 不单独生成 summary。前端需要摘要时，可基于 `contextEntities` 和 `evidenceItems` 动态渲染。

---

## 8. ContextEntities：上下文实体

`ContextEntities` 是 S3 的核心对象之一，用来沉淀 B2B 业务对象。

```ts
type ContextEntity = {
  id: string
  entityType: ContextEntityType
  name: string
  description: string

  relatedUrls: string[]
  relatedS1PageUrls?: string[]
  relatedS2FindingIds?: string[]

  confidence: 'explicit' | 'inferred'
  status: 'active'
}
```

### 8.1 entityType 分类

S3 按业务对象类型聚合，而不是按 S2 findings category 聚合。

```ts
type ContextEntityType =
  | 'company'              // 公司 / 品牌
  | 'supplier_identity'    // 供应商身份
  | 'product_line'         // 产品线
  | 'product'              // 具体产品
  | 'service'              // 服务
  | 'capability'           // 能力 / 工厂 / 交付能力
  | 'target_customer'      // 目标客户
  | 'target_market'        // 目标市场
  | 'application'          // 应用场景
  | 'industry'             // 行业
  | 'trust_asset'          // 信任资产
  | 'conversion_asset'     // 转化资产
  | 'content_asset'        // 内容资产
  | 'policy_asset'         // 政策 / 条款 / 售后
  | 'other'
```

### 8.2 confidence 规则

```ts
confidence: 'explicit' | 'inferred'
```

- `explicit`：来自页面明确内容、ProjectProfile 明确输入或 S2 明确诊断。
- `inferred`：由外部 AI 基于上下文合理推断，但没有直接明示。

S3 允许 `inferred`，但必须谨慎，不允许编造不存在的业务能力、认证、案例或客户。

---

## 9. EvidenceItems：证据项

`EvidenceItems` 是 S3 的第二个核心对象，用来保存可追溯证据。

S3 采用最小化证据设计：

```ts
type EvidenceItem = {
  id: string
  evidenceType: EvidenceType
  url: string
  note: string

  sourceStage: 'S0_PROJECT_PROFILE' | 'S1_SITE_READ' | 'S2_SITE_AUDIT'
  relatedS1PageUrl?: string
  relatedS2FindingId?: string
}
```

### 9.1 evidenceType 分类

```ts
type EvidenceType =
  | 'profile_input'       // 来自项目档案
  | 'page_content'        // 页面内容证据
  | 'site_structure'      // 网站结构证据
  | 'cta_form'            // CTA / 表单证据
  | 'trust_signal'        // 信任信号
  | 'seo_signal'          // SEO 基础信号
  | 'audit_finding'       // S2 诊断发现
  | 'limitation'          // 无法确认 / 权限限制
  | 'other'
```

### 9.2 证据简化原则

S3 evidence 不保存：

- HTML snippet
- 截图
- API 原始返回
- 控制台日志
- 大段 AI 原文

每条证据只保留：

```ts
url: string
note: string
```

理由：

- 当前产品是单人执行使用。
- 过多技术证据会增加认知负担。
- 原始 JSON 已保存在 ArtifactStore，需要追溯时再查看。

---

## 10. EntityEvidenceLinks：实体与证据关联

S3 必须建立上下文实体与证据项的引用关系。

```ts
type EntityEvidenceLink = {
  entityId: string
  evidenceItemId: string
  relationType:
    | 'supported_by'
    | 'mentioned_on'
    | 'affected_by_finding'
    | 'needs_more_evidence'
}
```

作用：

- 让后续 S4 / S11 / S12 能知道某个产品、能力、信任资产来自哪里。
- 让 S9 能知道某个审计问题影响哪些业务对象。
- 让 Content Engine 生成 brief 时可以引用真实上下文，而不是凭空编写。

---

## 11. S3 与 S1 / S2 的引用关系

S3 必须保留与 S1 / S2 的引用映射。

### 11.1 引用 S1 页面

```ts
relatedS1PageUrls?: string[]
```

用于说明某个上下文实体来自哪些页面。

### 11.2 引用 S2 findings

```ts
relatedS2FindingIds?: string[]
```

用于说明某个上下文实体与哪些诊断问题相关。

### 11.3 Evidence 引用来源阶段

```ts
sourceStage:
  | 'S0_PROJECT_PROFILE'
  | 'S1_SITE_READ'
  | 'S2_SITE_AUDIT'
```

用于追溯证据来自项目档案、网站读取，还是审计结果。

---

## 12. Artifact 保存策略

S3 上传的原始 JSON 保存到 ArtifactStore：

```ts
Artifact {
  id: string
  workflowStep: 'S3_CONTEXT_EVIDENCE'
  artifactType: 'b2b_context_evidence_json'
  originalFileName: 'b2b_context_evidence_v1.json'
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

## 13. ProjectKnowledgeBase 写入结构

S3 校验通过后写入：

```ts
ProjectKnowledgeBase {
  b2bContextEvidence: {
    schemaVersion: 'b2b_context_evidence_v1'
    sourceArtifactId: string
    importedAt: string
    generatedAt: string

    contextEntities: ContextEntity[]
    evidenceItems: EvidenceItem[]
    entityEvidenceLinks: EntityEvidenceLink[]
    limitations?: string[]
  }
}
```

注意：

- `ProjectKnowledgeBase.b2bContextEvidence` 只保存最新版。
- 新的 S3 结果入库后覆盖旧版结构化结果。
- 原始 JSON 历史由 `ArtifactStore` 保存。

---

## 14. 解析与校验规则

### 14.1 核心字段严格

以下字段缺失时，S3 `parse_failed`，不能推进：

```ts
schemaVersion
generatedAt
source
contextEntities[]
evidenceItems[]
entityEvidenceLinks[]
```

每个 `ContextEntity` 至少必须包含：

```ts
id
entityType
name
description
relatedUrls
confidence
status
```

每个 `EvidenceItem` 至少必须包含：

```ts
id
evidenceType
url
note
sourceStage
```

每个 `EntityEvidenceLink` 至少必须包含：

```ts
entityId
evidenceItemId
relationType
```

### 14.2 非核心字段宽松

以下字段缺失时，不阻塞 S3，可记录 warning 并补默认值：

```ts
limitations
relatedS1PageUrls
relatedS2FindingIds
relatedS1PageUrl
relatedS2FindingId
```

默认补值：

```ts
limitations: []
relatedS1PageUrls: []
relatedS2FindingIds: []
```

---

## 15. 不需要人工审核

S3 不设置人工审核环节。

原因：

- S3 是数据沉淀层，不直接写站、不生成任务、不生成内容。
- 单人执行使用，避免增加操作负担。
- JSON 解析通过后即可进入知识库。
- 后续 S4 / S9 / S11 使用时仍可以人工判断某个实体或证据是否有价值。

流程为：

```txt
上传 JSON
→ 系统解析校验
→ 校验通过
→ 直接写入 ProjectKnowledgeBase
→ 解锁 S4
```

---

## 16. S3 UI 模块

S3 页面建议包含 5 个区域：

1. 当前输入上下文  
   - ProjectProfile 摘要  
   - S1 SiteReadSnapshot 摘要  
   - S2 SiteAuditReport 摘要  
   - 可用页面数量  
   - findings 数量  

2. AgentTaskPack 生成区  
   - S3 任务目标  
   - 输入上下文  
   - 输出 JSON Schema  
   - 复制任务包按钮  

3. JSON 上传区  
   - 上传 `b2b_context_evidence_v1.json`  
   - 显示 Artifact 历史  
   - 显示 parseStatus  

4. 解析状态区  
   - parse success / failed  
   - warning 数量  
   - contextEntities 数量  
   - evidenceItems 数量  
   - entityEvidenceLinks 数量  

5. 上下文与证据浏览区  
   - ContextEntities 列表  
   - EvidenceItems 列表  
   - EntityEvidenceLinks 关系视图  
   - 按 entityType 筛选  
   - 按 sourceStage 筛选  
   - 按 confidence 筛选  

---

## 17. WorkflowState 状态机

```ts
type S3State =
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
S2 completed
↓
S3 ready
↓
task_pack_generated
↓
artifact_uploaded
↓
parse_failed / parsed_with_warnings / parsed
↓
written_to_knowledge_base
↓
S3 completed
↓
S4 unlocked
```

阻塞规则：

- `parse_failed` 不能写入 KnowledgeBase。
- `parsed_with_warnings` 可以写入 KnowledgeBase。
- `parsed` 可以写入 KnowledgeBase。
- 不需要人工审核状态。

---

## 18. S3 完成条件

S3 完成必须同时满足：

1. 已生成 S3 AgentTaskPack。
2. 用户已上传 `b2b_context_evidence_v1.json`。
3. JSON 文件成功解析。
4. 核心字段校验通过。
5. 原始 JSON 已保存到 ArtifactStore。
6. 结构化结果已写入 `ProjectKnowledgeBase.b2bContextEvidence`。
7. WorkflowState 推进到 `S3 completed`。
8. S4 解锁。

---

## 19. S3 最终确认决策汇总

已确认：

1. S3 输入来源为 ProjectProfile + S1 SiteReadSnapshot + S2 SiteAuditReport。
2. S3 输出对象为 ContextEntities + EvidenceItems。
3. S3 按业务对象类型组织 ContextEntities。
4. EvidenceItems 采用最小化证据：URL + 简短说明。
5. S3 必须建立 ContextEntities 与 S1 pages / S2 findings / EvidenceItems 的引用关系。
6. S3 只输出 JSON，不输出 Markdown / CSV。
7. S3 不单独生成 summary。
8. S3 不需要人工审核。
9. S3 保留 JSON 原始 Artifact。
10. S3 采用核心字段严格、非核心字段宽松的解析规则。
11. S3 完成条件为 JSON 解析成功、核心字段通过、写入 KnowledgeBase。
12. S3 完成后解锁 S4。
