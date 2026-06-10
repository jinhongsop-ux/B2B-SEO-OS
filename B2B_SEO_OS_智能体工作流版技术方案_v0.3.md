# B2B SEO OS 智能体工作流版技术方案 v0.3

## 0. 版本结论

B2B SEO OS v0.3 的产品方向正式从“系统内置 AI SEO 工具”调整为：

> B2B SEO OS 是一个面向 ChatGPT、Claude、OpenClaw 等外部智能体的 B2B WordPress 站内 SEO 工作流管理辅助系统。

系统不再把“网页抓取、联网搜索、竞品调研、多页面浏览、复杂推理”作为自身内置能力。系统负责把这些外部智能体任务变成可复制、可约束、可回填、可审核、可沉淀、可继续推进的标准化工作流。

当前 v0.2 原型不废弃。它沉淀为 v0.3 的前端框架、页面壳、交互经验、本地后端基础、Prompt Registry 雏形和 WorkflowState 雏形。但原有“点击按钮后系统直接模拟生成业务结果”的逻辑需要重构为“生成任务包、外部执行、回填 Artifact、人工审核后入库”。

---

## 1. 当前项目状态

### 1.1 项目路径

```text
D:\b2b-seo-os-product-docs-v0.2\app\workbench-preview
```

### 1.2 当前技术栈

```text
前端：Vite + React + TypeScript
后端：Node 内置 http/fs/path
本地存储：JSON 文件
前端端口：3001
后端端口：4310
API 代理：/api/* → http://127.0.0.1:4310
```

### 1.3 当前脚本

```text
npm run frontend
npm run backend
npm run workbench-preview
npm run test:api
npm run test:site-reading
npm run test:all
npm run build
```

### 1.4 已实现能力

当前 v0.2 原型已经具备：

```text
Overview 页面壳
Project Center 页面壳
AI Workbench 页面壳
Settings 页面
Tutorial 页面
Prompt Registry 初版
AgentRun 初版
本地 JSON 持久化
本地后端 health/prompts/agent-runs API
workspace-state.json 初版
WorkflowState 初版
站点接入与读取模拟闭环初版
```

当前已经新增过的第一步 API：

```text
GET /api/workspace
GET /api/workflow
POST /api/project
POST /api/site-read-snapshots
GET /api/site-read-snapshots/latest
```

这些 API 的现状：

```text
POST /api/project 可保存项目档案
POST /api/site-read-snapshots 会由系统本地模拟生成站点快照
Overview 会根据 workspace 状态推进到“网站现状审计”
```

### 1.5 当前实现需要迁移的地方

v0.3 中不再保留“系统自己生成模拟业务结果”作为正式业务逻辑。因此：

```text
POST /api/site-read-snapshots
GET /api/site-read-snapshots/latest
server/site-reading-actions.mjs
tests/site-reading-contract.test.mjs
Project Center 的“生成本地读取快照”交互
Overview 对“本地生成快照即完成”的判断
```

都需要迁移为：

```text
生成站点读取 AgentTaskPack
复制给外部智能体
导入 site_read_snapshot Artifact
解析并校验
人工审核
审核通过后写入 ProjectKnowledgeBase.siteReadSnapshot
WorkflowState 推进
```

---

## 2. 新产品定位

### 2.1 产品本质

B2B SEO OS 是一个只面向 WordPress B2B 外贸独立站的 SEO 工作流管理系统。

它不是：

```text
不是自动网页抓取器
不是内置浏览器 Agent
不是 AI 写文章工具
不是 WordPress 发布器
不是多站点后台
不是 Shopify / Webflow 适配器
不是 CRM
不是外链系统
不是广告投放系统
不是自动化发布系统
```

它是：

```text
外部智能体任务管理器
Prompt 任务包生成器
Artifact 回填解析器
B2B SEO 项目知识库
关键词地图管理器
Content Engine 交接控制台
人工审核与交付看板
```

### 2.2 目标用户

目标用户不是纯技术人员，而是：

```text
B2B 外贸站负责人
SEO 运营人员
内容负责人
独立站顾问
使用 ChatGPT / Claude / OpenClaw 做调研和分析的人
```

他们的问题不是“没有 AI”，而是：

```text
AI 执行结果散落在聊天窗口里
Prompt 不统一
返回格式不稳定
每一步结果无法沉淀
不知道下一步该做什么
关键词、页面、内容、任务之间无法串联
人工审核过程没有状态管理
交付材料难以整理
```

B2B SEO OS 的价值是把这些外部智能体执行能力沉淀为可管理的项目资产。

---

## 3. v0.2 与 v0.3 的核心差异

| 维度 | v0.2 | v0.3 |
|---|---|---|
| 产品定位 | 内置 AI SEO 工作台 | 外部智能体工作流管理系统 |
| AI 执行 | 系统内部 mock 或调用 API | ChatGPT / Claude / OpenClaw 外部执行 |
| Prompt Registry | 内部 AI 调用模板 | 外部智能体任务包模板 |
| AI Workbench | 内部运行入口 | Agent Task Center / Prompt & Artifact Workbench |
| 站点读取 | 系统模拟生成快照 | 外部智能体返回快照，系统导入 |
| 审计结果 | 系统生成 | 外部智能体生成，系统解析审核 |
| 关键词调研 | 系统可能自动生成 | 系统生成种子词和调研任务，用户/外部智能体回填 |
| 后端职责 | 调 AI、生成结果 | 生成任务包、导入 Artifact、校验、审核、入库 |
| AI API | 可能是核心 | 可选辅助，不负责复杂执行 |
| 用户行为 | 点按钮等结果 | 复制任务包、外部执行、回填、审核 |

---

## 4. 新整体架构

### 4.1 架构总览

```text
React / Vite 前端
  ↓
本地 Node API
  ↓
本地 JSON Workspace
  ↓
PromptTemplate Registry
  ↓
AgentTaskPack Generator
  ↓
用户复制任务包到 ChatGPT / Claude / OpenClaw
  ↓
外部智能体执行网页抓取、搜索、分析、整理
  ↓
用户粘贴或上传返回结果
  ↓
Artifact Importer
  ↓
Artifact Parser / Validator
  ↓
Human Review Gate
  ↓
ProjectKnowledgeBase
  ↓
WorkflowState 推进
  ↓
业务页面展示、关键词地图、Content Engine、交付中心
```

### 4.2 子系统边界

#### 前端

负责：

```text
项目资料录入
当前流程展示
任务包生成与复制
Artifact 粘贴/上传
解析结果预览
人工审核
关键词地图管理
Content Engine 交接
交付报告查看
教程与状态说明
```

不负责：

```text
直接抓网页
直接调用外部智能体
自动发布 WordPress
自动改页面
```

#### 本地后端

负责：

```text
本地 JSON 读写
PromptTemplate 渲染
AgentTaskPack 生成
Artifact 存储
JSON / Markdown / CSV 解析
Schema 校验
HumanReview 状态
WorkflowState 推导
ProjectKnowledgeBase 更新
```

不负责：

```text
内置浏览器 Agent
网页自动抓取
联网搜索
真实 WordPress 写入
真实 AI Agent 多步执行
```

#### 外部智能体

负责：

```text
网页抓取
联网搜索
竞品调研
长链路推理
页面理解
B2B 业务判断
审计报告生成
页面修复建议
内容机会整理
```

外部智能体必须按任务包要求返回固定格式结果。

---

## 5. 核心工作流

### 5.1 通用闭环

每个业务步骤统一为：

```text
1. 用户确认当前输入
2. 系统生成 AgentTaskPack
3. 用户复制任务包
4. 用户交给 ChatGPT / Claude / OpenClaw
5. 外部智能体执行
6. 用户回填 JSON / Markdown / CSV
7. 系统保存 raw Artifact
8. 系统解析与校验
9. 系统展示结构化预览
10. 用户人工审核
11. 审核通过后写入 ProjectKnowledgeBase
12. WorkflowState 推进到下一步
```

### 5.2 新主流程

v0.3 的流程拆成 13 个业务模块：

```text
1. 项目档案
2. 站点读取
3. 网站现状审计
4. B2B 上下文建立
5. 种子词生成
6. 关键词调研回填
7. 关键词导入与清洗
8. 关键词地图与人工分配
9. 页面修复包
10. 未使用词聚类
11. Content Engine 交接
12. QA 与交付报告
13. 全流程串联
```

### 5.3 关键词地图与 Content Engine 的集成

关键词地图和 Content Engine 不拆成两个独立工具，而是在同一个 B2B SEO OS 中作为不同页面和模块存在。

底层共享同一个 ProjectKnowledgeBase：

```text
项目档案
  ↓
站点快照
  ↓
审计问题
  ↓
B2B 上下文
  ↓
关键词池
  ↓
关键词分配
  ↓
页面修复包
  ↓
未使用词聚类
  ↓
Content Engine 交接包
  ↓
交付报告
```

关键词地图负责“词到页面”：

```text
种子词
关键词调研回填
关键词导入
合并去重
规则清洗
人工审核
页面分配
主词/辅词
未使用词池
聚类入口
```

Content Engine 负责“页面/主题到内容生产”：

```text
从页面修复包生成写作 Brief
从未使用词聚类生成内容机会
整理目标关键词
整理目标受众
整理必须引用事实
整理禁止说法
整理内链目标
整理 CTA
输出给外部智能体或写手
```

---

## 6. 数据模型

### 6.1 WorkspaceState

```ts
interface WorkspaceState {
  schemaVersion: '0.3';
  project: ProjectProfile | null;
  workflow: WorkflowState;
  promptTemplates: PromptTemplate[];
  agentTaskPacks: AgentTaskPack[];
  artifacts: Artifact[];
  reviews: HumanReview[];
  knowledgeBase: ProjectKnowledgeBase;
  settings: WorkspaceSettings;
  updatedAt: string;
}
```

### 6.2 ProjectProfile

```ts
interface ProjectProfile {
  projectId: string;
  projectName: string;
  domain: string;
  company: string;
  industry: string;
  targetMarkets: string[];
  supplierIdentity: string;
  coreProducts: string[];
  targetCustomers: string[];
  primaryConversionGoal: string;
  knownCompetitors: string[];
  knownImportantPages: string[];
  specialConcerns: string[];
  safetyMode: 'external_agent_read_only';
  createdAt: string;
  updatedAt: string;
}
```

### 6.3 PromptTemplate

```ts
interface PromptTemplate {
  templateId: string;
  name: string;
  workflowStep: WorkflowStepId;
  targetAgent: 'chatgpt' | 'claude' | 'openclaw' | 'generic';
  version: string;
  enabled: boolean;
  purpose: string;
  requiredInputs: string[];
  optionalInputs: string[];
  promptBody: string;
  outputContract: {
    format: 'json' | 'markdown' | 'csv' | 'mixed';
    schemaName: string;
  };
  forbiddenActions: string[];
  failureHandling: string[];
  humanReviewChecklist: string[];
  exampleOutput: unknown;
}
```

### 6.4 AgentTaskPack

```ts
interface AgentTaskPack {
  taskPackId: string;
  projectId: string;
  workflowStep: WorkflowStepId;
  title: string;
  targetAgent: 'chatgpt' | 'claude' | 'openclaw' | 'generic';
  templateId: string;
  taskGoal: string;
  inputContext: Record<string, unknown>;
  fullPrompt: string;
  forbiddenActions: string[];
  returnFormat: {
    type: 'json' | 'markdown' | 'csv' | 'mixed';
    schemaName: string;
  };
  exampleOutput: unknown;
  humanChecklist: string[];
  status: 'draft' | 'copied' | 'waiting_import' | 'imported' | 'reviewed' | 'archived';
  copyCount: number;
  copiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### 6.5 Artifact

```ts
interface Artifact {
  artifactId: string;
  projectId: string;
  sourceTaskPackId: string;
  workflowStep: WorkflowStepId;
  artifactType: 'json' | 'markdown' | 'csv' | 'mixed';
  fileName: string;
  rawText: string;
  rawContentPath: string | null;
  parsedData: unknown;
  parseStatus: 'pending' | 'success' | 'failed' | 'partial';
  validationStatus: 'not_checked' | 'valid' | 'invalid' | 'warning';
  validationErrors: ValidationError[];
  validationWarnings: ValidationWarning[];
  humanReviewStatus: 'pending' | 'approved' | 'rejected' | 'revision_needed';
  importedAt: string;
  reviewedAt: string | null;
}
```

### 6.6 HumanReview

```ts
interface HumanReview {
  reviewId: string;
  projectId: string;
  artifactId: string;
  workflowStep: WorkflowStepId;
  status: 'pending' | 'approved' | 'rejected' | 'revision_needed';
  reviewer: string;
  notes: string;
  checkedItems: Array<{
    label: string;
    checked: boolean;
    required: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}
```

### 6.7 ProjectKnowledgeBase

```ts
interface ProjectKnowledgeBase {
  projectId: string;
  confirmedFacts: BusinessFact[];
  siteReadSnapshot: SiteReadSnapshot | null;
  auditFindings: AuditFinding[];
  b2bContext: B2BContext | null;
  seedKeywordGroups: SeedKeywordGroup[];
  keywordPool: KeywordRecord[];
  keywordAssignments: KeywordAssignment[];
  pageRepairPackages: PageRepairPackage[];
  unusedKeywordClusters: UnusedKeywordCluster[];
  contentOpportunities: ContentOpportunity[];
  contentHandoffs: ContentHandoffPackage[];
  deliveryReports: DeliveryReport[];
  updatedAt: string;
}
```

### 6.8 WorkflowState

```ts
interface WorkflowState {
  currentStep: WorkflowStepId;
  steps: WorkflowStep[];
  completedCount: number;
  totalCount: number;
  nextAction: string;
  updatedAt: string;
}

type WorkflowStepStatus =
  | 'locked'
  | 'ready'
  | 'task_pack_generated'
  | 'waiting_external_agent'
  | 'waiting_import'
  | 'imported'
  | 'pending_review'
  | 'approved'
  | 'revision_needed'
  | 'completed';
```

---

## 7. 本地存储设计

### 7.1 推荐目录

```text
runtime/
  ai-workbench/
    agent-runs.json               # v0.2 保留，后续可迁移
    workspace-state.json          # 工作区主状态
    prompt-templates.json         # 可选，内置模板也可代码种子
    agent-task-packs.json         # 任务包索引
    artifacts.json                # Artifact 索引
    reviews.json                  # 审核记录
    knowledge-base.json           # 项目知识库
    artifacts/
      artifact_xxx/
        raw.json
        raw.md
        raw.csv
        parsed.json
```

### 7.2 存储原则

```text
不保存 WordPress 密码
不保存外部智能体账号
不保存 AI API Key
不写入 WordPress
所有外部返回结果先保存 raw
解析结果和 raw 分开保存
审核通过后才写入 KnowledgeBase
```

---

## 8. API 设计

### 8.1 Workspace

```text
GET /api/workspace
GET /api/workflow
POST /api/project
```

说明：

```text
保留现有 API，但返回结构需要升级到 v0.3。
GET /api/workspace 应返回 project、workflow、knowledgeBase 摘要、最新 taskPack、最新 artifact。
```

### 8.2 PromptTemplate

```text
GET /api/prompt-templates
GET /api/prompt-templates/:templateId
GET /api/prompt-templates?workflowStep=site_read&targetAgent=chatgpt
```

说明：

```text
Prompt Registry 从“内部执行模板”迁移为“外部智能体任务包模板”。
同一 workflowStep 支持 chatgpt、claude、openclaw、generic 多版本。
```

### 8.3 AgentTaskPack

```text
GET /api/agent-task-packs
GET /api/agent-task-packs/:taskPackId
POST /api/agent-task-packs/generate
POST /api/agent-task-packs/:taskPackId/mark-copied
POST /api/agent-task-packs/:taskPackId/archive
```

生成任务包请求：

```json
{
  "workflowStep": "site_read",
  "targetAgent": "chatgpt",
  "templateId": "site_read_chatgpt_v1"
}
```

生成任务包响应：

```json
{
  "taskPack": {
    "taskPackId": "atp_site_read_xxx",
    "workflowStep": "site_read",
    "targetAgent": "chatgpt",
    "fullPrompt": "..."
  },
  "workflow": {}
}
```

### 8.4 Artifact Import

```text
GET /api/artifacts
GET /api/artifacts/:artifactId
POST /api/artifacts/import-text
POST /api/artifacts/import-json
POST /api/artifacts/import-csv
POST /api/artifacts/:artifactId/parse
POST /api/artifacts/:artifactId/validate
```

第一阶段可以先只实现：

```text
POST /api/artifacts/import-text
```

请求：

```json
{
  "sourceTaskPackId": "atp_site_read_xxx",
  "artifactType": "json",
  "rawText": "{...}"
}
```

### 8.5 Review

```text
GET /api/reviews
GET /api/reviews/:reviewId
POST /api/reviews
POST /api/reviews/:reviewId/approve
POST /api/reviews/:reviewId/reject
POST /api/reviews/:reviewId/request-revision
```

审核通过时：

```text
1. 更新 review.status
2. 更新 artifact.humanReviewStatus
3. 调用 applyArtifactToKnowledgeBase
4. 推进 WorkflowState
```

### 8.6 Knowledge Base

```text
GET /api/knowledge-base
GET /api/knowledge-base/site-snapshot
GET /api/knowledge-base/audit-findings
GET /api/knowledge-base/b2b-context
GET /api/knowledge-base/keywords
POST /api/knowledge-base/apply-artifact
```

### 8.7 Keyword Map

关键词模块既使用外部智能体，也保留系统内部管理能力。

```text
POST /api/keywords/import-csv
POST /api/keywords/merge-dedupe
POST /api/keywords/rule-clean
GET /api/keywords
POST /api/keywords/:keywordId/review
POST /api/keywords/:keywordId/assign
POST /api/keywords/:keywordId/mark-unused
```

关键词调研本身不由系统自动完成。系统生成：

```text
种子词任务包
关键词调研说明包
外部工具字段说明
CSV 回填格式
```

用户或外部智能体完成调研后回填 CSV。

---

## 9. 输出格式规范

### 9.1 site_read_snapshot_v1

外部智能体返回站点读取结果时必须使用 JSON：

```json
{
  "schemaName": "site_read_snapshot_v1",
  "domain": "https://example.com",
  "snapshotAt": "2026-06-10T00:00:00Z",
  "accessStatus": "success",
  "siteSummary": "该网站是面向海外采购客户的 B2B 工业零部件 WordPress 网站。",
  "pages": [
    {
      "url": "/",
      "title": "Home",
      "pageType": "home",
      "status": "public",
      "detectedFrom": "navigation",
      "confidence": "high",
      "h1": "Custom Metal Parts Manufacturer",
      "metaDescription": "",
      "primaryCta": "Request a Quote",
      "formsDetected": [],
      "notes": ""
    }
  ],
  "menus": [
    {
      "name": "Main Navigation",
      "items": [
        { "label": "Products", "url": "/products/" }
      ]
    }
  ],
  "forms": [
    {
      "formName": "Contact Form",
      "url": "/contact/",
      "fields": ["name", "email", "message"],
      "purpose": "general_contact"
    }
  ],
  "seoFields": {
    "detectedPlugin": "unknown",
    "pagesMissingTitle": [],
    "pagesMissingMetaDescription": []
  },
  "trustPages": ["/about-us/"],
  "anomalies": [
    {
      "type": "missing_meta",
      "url": "/products/",
      "description": "产品页缺少 Meta Description"
    }
  ],
  "humanReviewItems": [
    "确认是否漏掉重要产品分类页"
  ]
}
```

### 9.2 audit_findings_v1

```json
{
  "schemaName": "audit_findings_v1",
  "sourceSnapshotId": "artifact_site_read_xxx",
  "overallAssessment": "网站具备基础 B2B 结构，但采购信息和信任证据不足。",
  "findings": [
    {
      "findingId": "af_001",
      "severity": "high",
      "category": "homepage_value_proposition",
      "url": "/",
      "title": "首页没有清晰说明目标客户",
      "evidence": "首屏文案缺少 OEM、采购、RFQ 等信息。",
      "impact": "影响非品牌流量转化。",
      "recommendedAction": "重写首页首屏价值主张。",
      "requiresHumanReview": true
    }
  ],
  "humanReviewItems": []
}
```

### 9.3 keyword_research_csv_v1

关键词调研回填推荐 CSV 字段：

```text
keyword,volume,kd,cpc,country,source_tool,source_file,seed_group,serp_intent,notes
```

系统负责：

```text
字段识别
空值检查
完全重复词去重
来源合并
基础规则清洗
人工审核状态管理
```

---

## 10. 前端页面规划

### 10.1 Overview

展示：

```text
当前步骤
已完成步骤
下一步动作
最近任务包
最近 Artifact
待审核项
阻塞原因
安全边界
```

第一阶段状态示例：

```text
项目档案：已完成
站点读取任务包：已生成
站点快照 Artifact：待导入
站点快照审核：未通过
网站现状审计：锁定
```

### 10.2 Project Center

v0.3 第一阶段页面结构：

```text
项目档案表单
只读安全边界
站点读取任务包生成入口
最近任务包状态
site_read_snapshot 回填入口
站点快照解析预览
人工审核面板
```

### 10.3 Agent Task Center

由 AI Workbench 重命名或重新定位。

Tab 建议：

```text
1. 任务包模板
2. 生成任务包
3. 任务包记录
4. 回填 Artifact
5. 解析与校验
6. 人工审核
7. 格式规范
```

### 10.4 Keyword Map

关键词地图页面负责：

```text
种子词任务包
关键词调研说明包
关键词 CSV 回填
关键词总库
规则清洗
人工审核
页面分配
未使用词池
聚类任务包入口
```

### 10.5 Content Engine

Content Engine 页面负责：

```text
内容机会
页面修复包引用
写作 Brief
目标受众
必须引用事实
禁止说法
内链目标
CTA
外部智能体内容任务包
交接状态
```

### 10.6 Tutorial

教程必须面向非技术用户解释：

```text
什么是外部智能体
为什么要复制任务包
如何把任务包交给 ChatGPT
如何把任务包交给 Claude
如何用 OpenClaw 执行网页任务
如何要求返回 JSON
如何粘贴回填
如何处理格式错误
如何人工审核
每一步完成后系统会做什么
```

---

## 11. 第一阶段 MVP：v0.3.1

### 11.1 目标

跑通第一个完整闭环：

```text
项目档案
→ 生成站点读取任务包
→ 复制任务包
→ 外部智能体执行
→ 导入 site_read_snapshot.json
→ 解析与校验
→ 人工审核
→ 写入 ProjectKnowledgeBase.siteReadSnapshot
→ Overview 推进到网站现状审计
```

### 11.2 必做功能

```text
1. WorkspaceState 升级到 v0.3
2. PromptTemplate 模型
3. AgentTaskPack 模型
4. Artifact 模型
5. HumanReview 模型
6. ProjectKnowledgeBase 模型
7. site_read PromptTemplate 种子
8. 站点读取任务包生成 API
9. 任务包复制状态 API
10. Artifact 粘贴导入 API
11. site_read_snapshot_v1 解析器
12. site_read_snapshot_v1 校验器
13. 审核通过后写入 KnowledgeBase
14. Overview 基于审核结果推进
15. Project Center 改为任务包 + 回填闭环
16. Agent Task Center 第一版
17. 教程页补充第一步说明
```

### 11.3 暂不做

```text
真实 AI API
真实网页抓取
真实 WordPress 读取
自动审计
自动关键词调研
复杂文件上传
OCR
Excel 原生解析
多用户权限
云端同步
WordPress 写入
```

---

## 12. 迁移计划

### 12.1 保留

```text
Vite + React 项目
Node 本地后端
Vite /api 代理
Overview 页面壳
Project Center 页面壳
AI Workbench 页面壳
Tutorial 页面壳
Settings 页面壳
Prompt Registry 初版经验
WorkflowState 初版经验
本地 JSON 持久化工具
测试脚本结构
```

### 12.2 重构

```text
AI Workbench → Agent Task Center
PromptDefinition → PromptTemplate
AgentRun → AgentTaskPack + Artifact
site-reading-actions.mjs → site-read task pack generator + artifact parser
POST /api/site-read-snapshots → deprecated 或改为 import endpoint
Overview 完成条件 → 必须基于 approved Artifact
Project Center 快照按钮 → 生成任务包 + 导入回填
```

### 12.3 废弃或降级

```text
mock-executor.mjs 降级为开发演示工具
mock-context.mjs 降级为模板示例上下文
系统模拟生成业务结果的接口不再作为正式路径
```

---

## 13. 实施路线

### Phase 0：技术方向切换

```text
确认 v0.3 技术方案
冻结 v0.2 继续扩展
把现有模拟生成逻辑标记为 legacy/demo
```

### Phase 1：AgentTaskPack + Artifact 底座

```text
新增模型
新增存储
新增 API
新增站点读取模板
新增 Artifact 解析与校验
新增审核状态
```

### Phase 2：站点读取闭环

```text
Project Center 重构
生成任务包
复制任务包
导入 JSON
解析预览
人工审核
Overview 推进
```

### Phase 3：网站审计闭环

```text
基于已确认 site snapshot 生成审计任务包
导入 audit_findings_v1
审核后写入 KnowledgeBase.auditFindings
生成任务候选
```

### Phase 4：B2B 上下文闭环

```text
生成 B2B 上下文任务包
导入 business facts / trust evidence
人工确认商业事实
写入 KnowledgeBase.b2bContext
```

### Phase 5：关键词地图

```text
种子词任务包
关键词调研说明包
CSV 导入
合并去重
规则清洗
人工审核
页面分配
未使用词池
```

### Phase 6：页面修复与 Content Engine

```text
页面修复任务包
页面修复 Artifact 回填
未使用词聚类任务包
内容机会回填
Content Engine 交接包
```

### Phase 7：QA 与交付

```text
QA 任务包
交付报告任务包
导入交付报告
交付中心展示与导出
```

---

## 14. 测试计划

### 14.1 API 测试

必须覆盖：

```text
空 workspace
保存项目档案
生成 AgentTaskPack
标记 copied
导入合法 JSON Artifact
导入非法 JSON Artifact
schema 校验失败
schema 校验成功
人工审核通过
KnowledgeBase 更新
WorkflowState 推进
```

### 14.2 前端测试

必须覆盖：

```text
打开 Overview
打开 Project Center
保存项目档案
生成任务包
复制任务包
粘贴 Artifact JSON
查看解析预览
查看校验错误
批准 Artifact
Overview 推进下一步
Settings 显示外部智能体模式
Tutorial 可解释新流程
```

### 14.3 回归命令

```text
npm run test:all
npm run build
```

v0.3 后建议新增：

```text
npm run test:agent-task-pack
npm run test:artifact-import
npm run test:workflow-v03
```

---

## 15. 风险与取舍

### 15.1 外部智能体输出不稳定

处理：

```text
任务包内强制 JSON schema
提供示例输出
导入时严格校验
失败时显示中文修复建议
允许重新导入
允许人工编辑修正
```

### 15.2 用户不知道如何使用外部智能体

处理：

```text
教程页分 ChatGPT / Claude / OpenClaw
任务包内写清楚操作步骤
回填区提供示例
错误区提供修复提示
每一步都有“我应该复制到哪里”的说明
```

### 15.3 系统不够自动化

接受这个取舍。

v0.3 的目标不是“自动替用户做完 SEO”，而是让复杂智能体工作变成：

```text
可重复
可约束
可回填
可审核
可沉淀
可交付
```

### 15.4 AI API 诱导项目走回 v0.2

规则：

```text
AI API 只能做轻量辅助
不能承担核心网页抓取
不能承担核心联网搜索
不能绕过 Artifact 回填
不能绕过人工审核
不能直接写入 KnowledgeBase 正式区
```

---

## 16. 最终原则

1. 系统不替代外部智能体。
2. 系统管理外部智能体任务。
3. 系统约束外部智能体返回格式。
4. 系统保存所有原始 Artifact。
5. 系统解析并结构化结果。
6. 系统必须保留人工审核。
7. 审核通过后才能推进工作流。
8. AI API 只是辅助，不是核心执行。
9. WordPress 写入继续关闭。
10. 本地 JSON 持久化继续保留。
11. Keyword Map 与 Content Engine 在同一程序内不同页面集成。
12. v0.2 的前端和本地后端经验继续复用。
13. v0.3 的第一目标是跑通“任务包 → 外部执行 → 回填 → 审核 → 推进”的最小闭环。

---

## 17. 一句话总结

B2B SEO OS v0.3 是一个外部智能体工作流管理系统。它的核心价值不是自己完成所有智能任务，而是把 ChatGPT / Claude / OpenClaw 等外部智能体的执行能力，转化为可复制的任务包、可校验的回填格式、可审核的 Artifact、可沉淀的项目知识库，以及可持续推进的 B2B SEO 工作流。
