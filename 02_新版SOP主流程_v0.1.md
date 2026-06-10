# 新版 SOP 主流程 v0.1

> 版本：v0.1  
> 状态：产品定义文档，不是开发指令。  
> 适用范围：B2B SEO OS / WordPress B2B 独立站站内 SEO 运营工作台。

## 总体主线

```text
S0 项目接入
→ S1 WordPress 网站读取
→ S2 现有网站审计
→ S3 B2B 上下文与证据库建立
→ S4 种子词库生成
→ S5 人工关键词挖掘
→ S6 程序内置关键词清洗
→ S7 总关键词数据库入库
→ S8 人工审核与关键词分配
→ S9 现有页面修复
→ S10 未使用关键词超级聚类
→ S11 新页面 / 内容任务生成
→ S12 Content Engine 交接
→ S13 QA 与交付
→ S14 持续监控
```

## S0：项目接入

### 目标

建立项目档案，确认这是一个 WordPress B2B 站，并确认本轮执行范围。

### 输入

```text
网站域名
WordPress 权限状态
行业 / 产品方向
目标市场
公司名称
核心产品线
主转化目标
当前最关心的问题
已有资料
```

### 输出

```text
project-profile.json
connection-status.json
data-source-status.json
first-run-scope.md
```

### 人工参与点

用户确认站点是不是 WordPress，是否有后台权限，是否只做前台审计，是否允许只读读取 WordPress 数据。

## S1：WordPress 网站读取

### 目标

读取现有网站，而不是假设理想网站结构。

### 读取对象

```text
页面 Pages
文章 Posts
产品 Products，如果使用 WooCommerce
产品分类 Categories
媒体库 Media
SEO Title / Meta Description
H1 / H2 / 正文结构
URL / Slug
导航 / 页脚
内链
CTA
Contact / RFQ 表单入口
About / Factory / QC / Certificates / FAQ / Case 等信任页
```

### 输出

```text
wp-site-snapshot.json
page-inventory.json
content-structure-map.json
current-url-map.json
current-internal-links.json
media-alt-status.json
current-trust-pages.json
```

### AI/Agent 参与

AI Agent 负责读取、解析、摘要、分类页面类型。程序负责保存结构化数据。人工不在这一步逐页判断好坏。

## S2：现有网站审计

### 目标

先判断现有网站问题，再做关键词流程。

### 审计维度

```text
网站结构
B2B 信息架构
首页表达
产品 / 服务页面
转化路径
前台表单与询盘入口
技术 SEO 基础
页面性能风险
移动端体验
内容质量
B2B 信任感
内链结构
资源页 / 案例页 / FAQ 缺失
```

### 输出

```text
site-audit-report.md
audit-findings.json
page-findings.json
trust-gap-findings.json
conversion-gap-findings.json
technical-findings.json
initial-repair-suggestions.json
```

### 重要规则

这一步只生成“初始修复建议”，不直接开始大规模关键词植入。因为关键词数据库还没有建立。

## S3：B2B 上下文与证据库建立

### 目标

把客户公司、产品线、能力、证据、事实边界结构化。

### 输入

```text
公司资料
产品线资料
产品规格
材料 / 工艺 / 应用
OEM / ODM 能力
MOQ / 交期 / 样品政策
QC 流程
证书 / 测试报告
案例 / 出口市场
工厂 / 设备 / 包装 / 运输图片
```

### 输出

```text
company-profile.json
product-line-record.json
capability.json
trust-evidence.json
brand-voice-b2b.json
claim-boundary.json
```

### 重要规则

不验证供应商真假，不判断客户是否合格。只管理“可以写什么、不能写什么、需要证据后才能写什么”。

## S4：生成种子词库

### 目标

根据网站现状、产品线、行业、目标市场、审计发现，生成用于人工挖词的种子词。

### 输出种子词类型

```text
核心产品词
产品规格词
supplier / manufacturer / factory / wholesale 词
OEM / ODM / custom 词
应用场景词
行业词
材料 / 工艺 / 认证词
MOQ / lead time / sample / QC / shipping 采购问题词
竞品反查方向
```

### 输出

```text
seed-keyword-library.json
seed-keyword-action-table.xlsx
tool-mining-checklist.md
```

## S5：人工关键词挖掘

### 目标

人工根据种子词库到外部工具挖词。

### 来源

```text
Semrush / Ahrefs
Google Keyword Planner
Google Suggest
PAA / AlsoAsked
竞品 Organic Keywords
```

### 输出

多个 CSV 或 Excel，暂不直接聚类。

## S6：程序内置关键词清洗

### 第一层：脚本机械清洗

```text
合并多个 CSV
去重
统一大小写
统一空格
保留 source_sheet
保留 volume / KD / CPC / intent 如有
合并重复来源
生成总词表
```

### 第二层：AI + 规则清洗

```text
标记明显无关词
标记品牌词
标记平台词
标记 B2C 词
标记采购意图
初判页面类型
标记疑似重复意图
标记低价值词
```

### 输出

```text
keyword-master-raw.csv
keyword-master-cleaned.csv
keyword-cleaning-report.md
```

## S7：总关键词数据库入库

### 目标

把清洗后关键词作为长期资产写入数据库。

### 关键词初始状态

```text
raw_imported
script_cleaned
ai_cleaned
pending_review
```

### 输出

```text
keywords table
keyword_sources table
keyword_cleaning_logs table
```

## S8：人工审核与关键词分配

### 目标

用户审核关键词，决定关键词怎么处理。

### 处理结果

```text
approved_for_existing_page
rejected
duplicate_intent
needs_new_page
content_engine_candidate
unused_valid
hold
```

### 重要规则

只有 approved_for_existing_page 的词，才可以用于现有页面修复。

## S9：现有页面修复

### 目标

根据审计结果 + 已分配关键词 + B2B 上下文，生成页面修复任务。

### 修复对象

```text
首页
产品线页
产品详情页
Solution / Application 页
Capability / Quality / Certification 页
About / FAQ / Contact / RFQ 页
Blog / Resource 页
```

### 规则

```text
适合现有页面 → 优化植入
不适合现有页面 → 不强行植入
页面定位错 → 改定位或拆分
页面太薄 → 补模块
缺证据 → 要求人补资料
```

## S10：未使用关键词超级聚类

### 触发条件

只处理：

```text
已审核
有效
未使用
未分配到现有页面
值得继续做
```

### 输出

```text
new-page-opportunities.json
pillar-cluster-plan.json
solution-hub-plan.json
content-engine-candidates.json
```

## S11：新页面 / 内容任务生成

### 分流规则

```text
商业页机会 → 产品线页 / Solution 页 / Application 页 / Capability 页
采购辅助内容 → Content Engine
FAQ 问题 → FAQ / Resource
案例相关 → Case Study 任务
暂不适合 → 保留在词库
```

## S12：Content Engine 交接

### 输入给 Content Engine

```text
关键词任务
搜索意图
目标页面类型
相关产品线
相关证据
内链目标
品牌语言
QA 规则
```

### 输出回 OS

```text
brief
outline
draft
html
qa-report
publish-review-package
```

## S13：QA 与交付

检查：事实、证据、关键词、内链、CTA、页面定位、不能写的声明。

## S14：持续监控

跟踪：GSC 收录、曝光、排名、CTR、询盘来源页面、询盘质量、下一轮优化任务。
