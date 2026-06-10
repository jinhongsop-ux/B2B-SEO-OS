# Codex 开发路线图：不加多余动作

> 版本：v0.1  
> 状态：产品定义文档，不是开发指令。  
> 适用范围：B2B SEO OS / WordPress B2B 独立站站内 SEO 运营工作台。

## 1. 总原则

此文档是后续开发路线，不是当前立即执行指令。每个阶段给 Codex 时都必须强调：不加多余动作，不扩展边界，不引入未讨论的新功能。

## 2. 开发顺序

### Phase 0：文档冻结

目标：把当前文档放入仓库 docs/product-v0.1/。

不做代码重构。

### Phase 1：前端工作区骨架

目标：重建 Workbench IA，让 11 个工作区按新 SOP 展示。

只做静态 / mock UI。

验收：用户能一眼看到流程：读取 → 审计 → 关键词库 → 审核分配 → 页面修复 → 未使用词聚类 → 内容生产。

### Phase 2：数据模型与本地 mock 数据

目标：建立 Project、Page、Keyword、Finding、Task、Evidence 等本地 JSON mock 数据。

不接真实 WordPress。

### Phase 3：关键词数据库基础

目标：实现 CSV 导入、合并、去重、状态字段、关键词总库 UI。

不做超级聚类。

### Phase 4：关键词审核与分配

目标：支持人工审核关键词、分配到现有页面、标记未使用词池。

不自动修改页面。

### Phase 5：WordPress 读取规划

目标：定义只读读取接口和 mock snapshot。

不做真实写入。

### Phase 6：网站审计结果接入

目标：把审计 Prompt 输出结构转为 findings 和 tasks。

不做自动修复。

### Phase 7：页面修复包

目标：根据审计结果 + 已分配关键词 + 证据库，生成页面修复任务和导出包。

不写入 WordPress。

### Phase 8：未使用词超级聚类

目标：只对 unused_valid 词池做聚类，生成新页面机会和 Content Engine 候选任务。

### Phase 9：Content Engine Handoff

目标：导出 Content Engine 上下文包，接收回传状态。

不把 Content Engine 合并进 OS。

### Phase 10：AI / Agent Adapter

目标：把提示词、脚本和 Agent 执行记录产品化。

先做手动导出 Prompt，再考虑 API。

## 3. 每次给 Codex 的固定边界

```text
不要添加新业务方向。
不要添加多站点。
不要添加非 WordPress 平台。
不要添加自动发布。
不要添加供应商验证。
不要添加 CRM。
不要添加外链模块。
不要添加真实 WordPress 写入。
只完成本阶段明确任务。
```

## 4. 第一条 Codex 指令模板

```text
本阶段只做文档入库和 Workbench 信息架构重排准备。
不要改后端业务逻辑。
不要新增外部依赖。
不要引入真实 WordPress 连接。
不要实现 AI 调用。
请在 docs/product-v0.1/ 下加入本轮产品文档，并更新 README 的产品规划入口。
完成后只汇报变更文件和验证命令。
```
