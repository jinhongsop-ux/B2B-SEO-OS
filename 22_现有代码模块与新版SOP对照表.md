# 现有代码模块与新版 SOP 对照表

> 版本：v0.2  
> 状态：迁移规划文档。  
> 注意：具体文件名和实现需以当前 GitHub 分支实际代码为准。本文件用于约束重构方向，避免 Codex 继续按旧工程模块扩展。

## 1. 总原则

当前工程已有 foundation、Workbench UI、SEO audit、task、supplier trust、keyword architecture、content brief、handoff、draft review、delivery export 等基础。新版 SOP 改变了产品主顺序：

```text
旧倾向：从 foundation 模块堆功能
新顺序：WordPress 读取 → 现有网站审计 → B2B 上下文 → 关键词库 → 审核分配 → 页面修复 → 未使用词聚类 → Content Engine → QA / 交付
```

## 2. 保留但需要重命名 / 重排的模块

| 现有能力 | 新 SOP 位置 | 处理建议 |
|---|---|---|
| workspace initialization | S0 项目接入 | 保留，改成项目工作区初始化 |
| mock WordPress sync | S1 WordPress 读取 | 保留 mock，但命名为 wp snapshot demo |
| SEO audit | S2 现有网站审计 | 保留，但审计在关键词流程前运行 |
| task orchestration | 全流程 | 保留，升级为任务中心 |
| asset / SOP index | S3 / 资料库 | 保留，改成 B2B 证据与素材索引 |
| site intake | S0 / S3 | 保留，拆成项目档案 + B2B 上下文 |
| supplier trust | S3 / S9 / QA | 保留但改名为 B2B 上下文与证据库，不做供应商验证 |
| keyword architecture | S6-S10 | 保留并重构为关键词数据库 + Keywords Map |
| content handoff | S12 | 保留，只接收未使用词和内容候选任务 |
| draft review / editor review | S13 QA | 保留为 QA 子流程 |
| publish review package | S13 | 保留为发布前审查包，仍是 dry-run |
| delivery export | S13 | 保留为交付中心 |
| Workbench UI | 全局 | 保留但按 11 个工作区重新组织 |

## 3. 需要冻结或降级为辅助的模块

```text
WordPress approval boundary / approval record / implementation gate
decision prompt / transition gate / authorization matrix
```

这些属于安全辅助 guardrails，不应该扩展成普通用户可见的产品工作区。可保留为系统状态和安全边界检查。

## 4. 需要新增或重构的核心模块

### 4.1 WordPress 只读同步契约

现有 mock sync 需要向真实只读同步演进：

```text
pages
posts
products
media
menus
seo-meta
forms
acf hints
```

但第一阶段仍保持只读。

### 4.2 关键词导入清洗模块

这是新版 SOP 的核心新增能力：

```text
多 CSV 上传
字段映射
合并去重
sourceRecords 保留
AI 打标
入总词库 pending_review
```

### 4.3 人工关键词审核与分配模块

必须补齐：

```text
关键词审核台
页面候选推荐
人工分配
不适合页面则回到未使用池
```

### 4.4 未使用词超级聚类模块

只读取 unused_valid，不读取全词库。

### 4.5 页面修复包模块

结合：

```text
审计 finding
已分配关键词
B2B 证据库
页面当前内容
```

输出 dry-run 页面优化包。

## 5. 旧模块到新数据对象映射

| 新数据对象 | 来源 |
|---|---|
| project-profile | site intake / workspace init |
| wp-site-snapshot | mock wp sync / future wp readonly |
| audit-finding | SEO audit |
| b2b-context | supplier trust + site intake + asset index |
| keyword-record | keyword architecture 重构 |
| page-keyword-assignment | 新增 |
| unused-keyword-cluster | 新增 |
| page-repair-task | task orchestration + audit + keyword assignment |
| content-engine-handoff | content handoff |
| qa-review | draft/editor/publish review |
| delivery-package | delivery export |

## 6. Workbench UI 重排建议

旧 UI 如果按模块展示，应重排为：

```text
项目总览
项目中心 / 数据源中心
SEO 诊断
页面与关键词
供应商可信度
内容运营
任务中心
资料与素材库
交付中心
AI 工作台
设置 / 系统状态
```

其中“页面与关键词”必须成为完整工作区，而不是一个表格页面。

## 7. Codex 重构注意事项

```text
不要删除旧 foundation，先在新文档指导下重排前端和数据契约。
不要加入 Shopify / Webflow / 多站点。
不要加入自动发布。
不要把 Content Engine 合并进 OS。
不要把供应商可信度做成验证供应商。
不要把超级聚类放在关键词入库前。
不要让未审核关键词进入页面修复。
```

## 8. 第一轮代码对照检查清单

让 Codex 读取当前项目后，先输出：

```text
哪些模块已经存在
哪些模块可复用
哪些模块和新版 SOP 顺序冲突
哪些前端页面需要改名或重排
哪些数据文件需要新增
哪些命令需要保留
哪些模块应冻结不扩展
```

不要让 Codex 直接开发。
