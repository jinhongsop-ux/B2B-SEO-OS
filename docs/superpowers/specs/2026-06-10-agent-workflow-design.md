# B2B SEO OS 智能体工作流改造设计

日期：2026-06-10  
状态：已确认方向，等待按计划实现  
适用范围：`D:\b2b-seo-os-product-docs-v0.2`

## 目标

B2B SEO OS 的产品定位调整为：面向外部智能体执行的 AI 工作流编排、回填解析、质量判定和项目推进系统。

程序不承担完整的网页抓取、联网搜索、深度 SEO 调研和长链路执行。复杂执行由 ChatGPT、Claude、OpenClaw 或同等级外部智能体完成。程序负责把用户输入和项目上下文编译成可执行任务包，并把外部智能体回填的结果转化为本项目可用的数据结构。

标准闭环：

```text
用户输入原始数据/信息
→ 程序内 AI 根据元提示词生成 AgentTaskPack
→ 用户复制给外部执行层 AI
→ 外部 AI 输出固定格式 Artifact
→ 用户回填 Artifact
→ 程序内 AI 解析、校验、结构化、存档
→ 人工审核
→ 判断数据是否充足
→ 推进到下一阶段
```

## 设计原则

1. 保留现有厚 UI，不重做空壳。
2. 保留主流程顺序，只替换执行机制。
3. 每个模块都必须有输入、任务包、回填、解析、审核、产出物、推进条件。
4. 程序内 AI 只负责前置编译和后置归档，不伪装成全能执行智能体。
5. 所有进入正式工作区的数据都必须可追踪来源、可人工审核、可回滚或标记无效。
6. 不写 WordPress，不保存站点密码，不自动发布内容。

## 双 AI 层

### 任务包生成 AI

输入：

- 用户填写的原始数据
- 当前 WorkspaceState
- 当前 WorkflowStep
- Prompt Registry 中的元提示词
- 本阶段输出契约

输出：

- `AgentTaskPack`
- 适用于 ChatGPT / Claude / OpenClaw / 通用智能体的提示词版本
- 执行边界
- 期望 Artifact 格式
- 人工检查清单

### 回填解析 AI

输入：

- 外部 AI 回填的 `Artifact`
- 当前项目数据契约
- 阶段完成条件
- 当前工作区已有数据

输出：

- `IngestionRun`
- 结构化字段映射
- 校验结果
- 缺失项
- 风险项
- 人工审核项
- 是否允许推进下一步
- 建议写入的正式数据对象

## 核心数据对象

### AgentTaskPack

用于外部执行层 AI 的任务包。

字段：

- `taskPackId`
- `workflowStepId`
- `taskType`
- `targetAgent`
- `sourceInputs`
- `projectContextSnapshot`
- `promptMarkdown`
- `expectedArtifactSchema`
- `forbiddenActions`
- `humanChecklist`
- `createdAt`
- `status`

状态：

```text
draft / ready_to_copy / copied / artifact_returned / ingested / archived
```

### Artifact

外部智能体回填的结果。

字段：

- `artifactId`
- `taskPackId`
- `workflowStepId`
- `format`
- `rawContent`
- `attachments`
- `submittedAt`
- `submittedBy`
- `sourceAgent`
- `status`

状态：

```text
submitted / parsing / parsed / parse_failed / reviewed / rejected
```

### IngestionRun

程序内 AI 对 Artifact 的解析、校验和归档建议。

字段：

- `ingestionRunId`
- `artifactId`
- `workflowStepId`
- `parserPromptId`
- `status`
- `parsedObjects`
- `validationResult`
- `qualityScore`
- `missingFields`
- `humanReviewItems`
- `canAdvance`
- `writePlan`
- `reviewDecision`
- `createdAt`
- `reviewedAt`

状态：

```text
queued / running / waiting_review / approved / rejected / failed
```

### WorkspaceState

继续作为项目事实库和产出物集合。后续模块只读取已审核通过的数据。

包含：

- `project`
- `siteReadSnapshots`
- `auditFindings`
- `b2bContext`
- `keywordLibrary`
- `keywordAssignments`
- `pageRepairPackages`
- `contentHandoffs`
- `deliveryReports`
- `taskPacks`
- `artifacts`
- `ingestionRuns`
- `workflow`

## 页面改造策略

不删除现有页面能力。每个页面加入统一阶段操作面板，替换原本“内部 AI 直接运行”式按钮。

### 保留页面

- `/overview` 项目总览
- `/project-center` 项目中心 / 数据源中心
- `/audit` SEO 诊断
- `/keywords` 页面与关键词
- `/trust` B2B 知识库
- `/content` 内容运营 / Content Engine
- `/tasks` 任务中心
- `/assets` 资料与素材库
- `/delivery` 交付中心
- `/ai-workbench` 智能体任务中心
- `/settings` 设置
- `/tutorial` 教程

### 新增通用组件

#### StageActionPanel

每个主流程页面顶部的操作面板。

显示：

- 当前阶段
- 前置条件
- 当前已有产出物
- 任务包状态
- Artifact 回填状态
- 解析校验状态
- 人工审核状态
- 下一步是否可推进

动作：

- 生成任务包
- 复制任务包
- 回填 Artifact
- 启动 AI 解析校验
- 人工批准 / 驳回
- 推进下一阶段

#### TaskPackPreview

展示 AgentTaskPack 的 Markdown 内容、输出格式要求、禁止动作和复制按钮。

#### ArtifactImportPanel

支持粘贴 JSON、Markdown、CSV 或混合文本。第一版先保存文本，不处理真实附件。

#### IngestionResultPanel

展示程序内 AI 解析后的结构化结果、字段映射、缺失项、风险项、质量评分和写入计划。

#### ReviewGate

统一人工审核门槛。只有批准后的 IngestionRun 才允许写入正式数据并推动流程状态。

## 后端 API 设计

保留已有 API：

- `GET /api/health`
- `GET /api/workspace`
- `GET /api/workflow`
- `POST /api/project`
- `POST /api/site-read-snapshots`
- `GET /api/prompts`
- `GET /api/agent-runs`
- `POST /api/agent-runs`

新增核心 API：

- `POST /api/task-packs/generate`
- `GET /api/task-packs`
- `GET /api/task-packs/:taskPackId`
- `POST /api/artifacts`
- `GET /api/artifacts`
- `GET /api/artifacts/:artifactId`
- `POST /api/ingestion-runs`
- `GET /api/ingestion-runs`
- `GET /api/ingestion-runs/:ingestionRunId`
- `POST /api/ingestion-runs/:ingestionRunId/review`
- `POST /api/workflow/:stepId/advance`

第一版仍可使用本地 deterministic mock 模拟程序内 AI。真实 AI API 接入要通过统一适配层，不直接散落在页面代码里。

## 第一阶段实现范围

先实现全局框架纠偏和第 1 步“站点接入与读取”闭环。

### 全局框架纠偏

修改：

- 顶部状态栏说明当前执行模式：程序内 AI 负责任务包生成和回填解析，外部智能体负责复杂执行。
- `/ai-workbench` 保留页面，但定位为“智能体任务中心”。
- 设置页显示：
  - 程序内 AI：任务包生成 / Artifact 解析
  - 外部智能体：抓取、搜索、审计、调研
  - WordPress 写入：关闭
  - 自动发布：关闭
- 教程改写为新闭环说明。

### 站点接入与读取

输入：

- 项目名
- 域名
- 公司名
- 行业
- 目标市场
- 核心产品
- 目标客户
- 转化目标

任务包：

- 生成 `site_read` 类型 AgentTaskPack
- 要求外部 AI 读取网站公开页面
- 禁止要求用户提供密码
- 禁止写 WordPress
- 要求输出 `site_read_snapshot_v1`

回填：

- 用户粘贴外部 AI 输出的 Artifact
- 程序内 AI 解析为 `SiteReadSnapshot`

校验：

- 至少 1 个页面
- 每个页面有 URL、标题、页面类型
- 有菜单、表单、SEO 字段或明确缺失说明
- 异常项进入 humanReviewItems

审核：

- 人工确认读取对象正确
- 人工确认无敏感凭据
- 批准后写入正式 workspace

推进：

- 有项目档案
- 有已审核 SiteReadSnapshot
- 至少 1 条页面记录
- 推进到“网站现状审计”

## 测试策略

每一阶段至少覆盖：

- API 空状态
- 生成任务包成功
- 非法输入返回中文错误
- Artifact 回填成功
- 解析校验成功
- 解析失败时保留原始 Artifact
- 人工审核批准后写入 workspace
- 未批准不能推进下一步
- `npm run build`
- `npm run test:all`

第一阶段额外做浏览器验证：

- `/overview` 能看到真实流程状态
- `/project-center` 能完成项目档案保存、任务包生成、Artifact 回填、解析校验、人工审核
- `/ai-workbench` 能看到对应 TaskPack / Artifact / IngestionRun 记录
- `/settings` 执行边界清楚

## 风险与控制

### 风险：再次把厚 UI 改薄

控制：禁止删除现有业务页面。页面改造以插入统一组件、替换按钮语义和接入数据源为主。

### 风险：内部 AI 与外部 AI 职责混淆

控制：所有文案统一使用“程序内 AI”和“外部执行层 AI”。程序内 AI 不宣称能完成抓取、联网搜索和自动发布。

### 风险：Artifact 格式不稳定

控制：回填解析 AI 先接受宽松文本，再输出严格结构；解析失败必须保留原文并给出中文修复提示。

### 风险：数据提前进入正式库

控制：`IngestionRun.reviewDecision === approved` 才能写入正式 workspace。

## 非目标

第一阶段不做：

- 真实 WordPress REST 读取
- WordPress 写入
- 媒体上传
- 自动发布
- 真实网页爬虫
- 真实联网搜索
- 一次性改完 11 个模块
- 大规模拆分 `App.tsx`

## 验收标准

第一阶段完成时，应满足：

1. 现有厚 UI 页面仍可打开。
2. 项目中心能从输入开始走完站点读取闭环。
3. 任务包、Artifact、解析结果和审核记录都有本地持久化。
4. Overview 能根据真实状态显示第 1 步是否完成。
5. 未审核结果不能推进下一步。
6. 设置页和教程清楚说明双 AI 层。
7. 构建和 API 测试通过。
