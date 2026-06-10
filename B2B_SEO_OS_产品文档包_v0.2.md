# B2B SEO OS 产品文档包 v0.2

> 合并版 Master Markdown。



---

# 00_README_文档索引.md


# B2B SEO OS 产品文档包索引

> 版本：v0.2  
> 状态：产品定义 + 开发前规格文档。  
> 适用范围：B2B SEO OS / WordPress B2B 独立站站内 SEO 运营工作台。

## 1. 本文档包解决什么问题

这套文档用于把当前项目从“后端模块堆叠”重新拉回“用户工作流驱动”的产品定义。它不是代码任务，也不是 Codex 指令。它的目标是先固定产品边界、SOP、数据对象、页面工作区、AI/Agent 执行方式和后续开发路线。

当前基准判断：

```text
B2B SEO OS 是一个只面向 WordPress B2B 外贸独立站的站内 SEO 运营系统。
它先读取和审计现有网站，再建立 B2B 上下文和关键词数据库。
关键词经过导入、脚本清洗、AI 清洗、人工审核和页面分配后，才用于页面修复。
未使用关键词再进入超级聚类和内容生产。
系统所有读取、分析和执行动作，都由 AI + Prompt + Agent 能力驱动。
产品本体负责 UI、数据状态、任务流和人工审核边界。
```

## 2. 文档清单

| 文件 | 作用 |
|---|---|
| 01_产品边界与核心原则.md | 固定做什么、不做什么，避免继续扩大边界。 |
| 02_新版SOP主流程_v0.1.md | 定义从接手 WordPress 网站到交付监控的完整流程。 |
| 03_用户工作流与前端工作区.md | 从 SOP 反推 11 个前端工作区，而不是从页面堆功能。 |
| 04_WordPress网站读取与审计规范.md | 定义怎么读取现有网站、怎么做前台/授权审计。 |
| 05_B2B上下文与证据库规范.md | 定义公司、产品线、能力、证据、事实边界如何管理。 |
| 06_关键词数据库_导入清洗审核分配流程.md | 定义关键词导入、清洗、入库、审核、分配、未使用词池。 |
| 07_Keywords_Map子系统规范.md | 定义关键词地图作为目录级子系统，而不是简单表格。 |
| 08_页面修复任务与优化包规范.md | 定义页面什么时候适合植入词，什么时候不强求。 |
| 09_内容运营与Content_Engine对接规范.md | 定义 OS 与 Content Engine 的边界和上下文交接。 |
| 10_AI_Agent执行层与提示词内置规范.md | 定义 AI/Prompt/Agent/脚本如何被程序调度。 |
| 11_数据契约与状态机.md | 定义核心数据对象、状态流转和字段。 |
| 12_Codex开发路线图_不加多余动作.md | 后续给 Codex 的阶段路线，但不是马上执行。 |
| 13_验收标准与测试清单.md | 判断每个阶段是否真的做成产品。 |
| 14_前端逐页布局与交互说明.md | 细化 11 个工作区首屏、模块、动作、空状态和交互。 |
| 15_WordPress只读同步字段契约.md | 定义 WordPress Pages、Posts、Products、Media、SEO、Forms 等只读字段。 |
| 16_关键词CSV导入字段映射与清洗规则.md | 定义 Semrush/Ahrefs/GKP/GSC/手工 CSV 如何映射、合并、去重、入库。 |
| 17_AI提示词输入输出契约.md | 定义内置 Prompt / Agent 的输入、输出 JSON、人工确认和失败处理。 |
| 18_SEO审计问题分类与任务生成规则.md | 定义审计 finding 分类、severity、任务生成和合并规则。 |
| 19_任务中心与优先级规则.md | 定义任务类型、状态、优先级、队列和子系统关联。 |
| 20_页面修复包示例.md | 用虚拟 B2B 产品页展示页面修复包颗粒度。 |
| 21_Demo项目完整工作流样例.md | 用完整 Demo 跑通 S0-S14。 |
| 22_现有代码模块与新版SOP对照表.md | 约束旧工程 foundation 如何迁移到新版 SOP。 |
| 23_本地数据安全与权限边界.md | 定义本地存储、WordPress 凭据、AI 请求和导出包安全边界。 |

## 3. 使用顺序

```text
先读：01、02、14
再读：04、15、06、16、17、18、19
然后读：07、08、09、20、21
最后读：22、23、12、13
```

## 4. 重要纠偏

```text
只做 WordPress B2B 独立站。
不做供应商选择或供应商真假验证。
不做 Shopify / Webflow / 多站点 / CRM / 外链。
审计在关键词前面，因为要先读取已有网站结构。
关键词导入清洗是程序内置核心能力。
AI 清洗只打标不删除。
关键词先入总词库，人工审核后才分配。
只有适合页面的关键词才进入页面修复。
不适合页面的关键词不强行植入。
未使用有效词才进入超级聚类。
Content Engine 是内容生产执行器，不直接并入 OS。
所有 AI / Agent 输出都必须可审查，不自动写 WordPress。
```



---

# 01_产品边界与核心原则.md


# 产品边界与核心原则

> 版本：v0.1  
> 状态：产品定义文档，不是开发指令。  
> 适用范围：B2B SEO OS / WordPress B2B 独立站站内 SEO 运营工作台。

## 1. 产品一句话定义

B2B SEO OS 是一个面向单个 WordPress B2B 外贸独立站的站内 SEO 运营工作台。它帮助没有专业 SEO 能力的运营人员读取网站现状、审计问题、建立关键词数据库、分配关键词、修复页面、管理供应商上下文、交接内容生产，并形成 QA 与交付闭环。

## 2. 只做什么

系统只做这些事情：

```text
1. 接入单个 WordPress B2B 独立站。
2. 读取现有网站页面、文章、产品、媒体、内链、SEO 字段和转化入口。
3. 审计网站站内 SEO、B2B 信息架构、内容质量、信任资产和询盘路径。
4. 建立 B2B 上下文库：公司、产品线、能力、证据、事实边界。
5. 生成种子词库，支持人工外部工具挖词。
6. 内置关键词 CSV 合并、去重、标准化和 AI+规则清洗。
7. 建立总关键词数据库和 Keywords Map 关系层。
8. 支持人工审核、分配关键词到现有页面。
9. 根据审计结果和关键词分配生成页面修复任务。
10. 对未使用关键词做超级聚类，生成新页面和内容任务。
11. 输出 Content Engine 可用的上下文包。
12. 做人工 QA、发布前审查包、交付包和持续监控任务。
```

## 3. 明确不做什么

```text
1. 不做 Shopify、Webflow、自研 CMS、多 CMS 兼容。
2. 不做多站点后台或 agency 批量管理。
3. 不做供应商选择、供应商验证、供应商真假评级。
4. 不做外链建设、PBN 管理、社媒运营、广告投放。
5. 不做 CRM 全流程、销售跟进系统、邮件营销系统。
6. 不做自动发布、自动改 WordPress、自动提交真实询盘。
7. 不自动确认 MOQ、产能、交期、证书、案例、客户名称。
8. 不扩展常规 B2B 功能，例如报价管理、订单管理、库存管理。
9. 不把 Content Engine 直接并入 OS。
10. 不把 AI 对话框当作产品本体。
```

## 4. 核心产品原则

### 原则 1：现有网站优先

系统面对的大多数是已有网站，不是纯新站。第一步必须是读取现状与审计，而不是直接生成理想架构。

### 原则 2：关键词必须先进数据库

多个 CSV 导入后，先合并去重，AI+规则清洗，再进入总词库。关键词不能直接进入超级聚类，也不能直接强行塞进页面。

### 原则 3：人工审核是关键词分配门槛

每个关键词必须有状态。只有人工审核为有效、且适合现有页面的关键词，才能用于页面修复。

### 原则 4：页面不适合就不强求

页面修复时，如果现有页面不适合某个关键词，就不为了 SEO 硬塞。关键词应回到未使用词池，后续用于新页面或内容规划。

### 原则 5：供应商证据库不是供应商验证

客户本身就是供应商。系统要做的是整理和约束可使用的公司事实、能力、证据和素材，避免 AI 乱写。

### 原则 6：AI 是执行层，不是最终决策层

AI 可以读取、解释、建议、聚类、生成、检查，但不能自动确认事实、自动发布、自动修改真实网站。

## 5. 产品成功标准

一个非技术 B2B 运营人员打开系统后，应能看懂：

```text
这个网站现在有什么页面；
哪些页面有问题；
有哪些关键词还没整理；
哪些关键词已经可用于现有页面；
哪些页面该修；
哪些词需要新页面或内容；
哪些公司能力可以写；
哪些事实不能写；
下一步任务是什么。
```

如果前端让用户看到的是工程模块、JSON 文件、命令行输出和复杂状态码，而不是这些业务答案，就说明产品失败。



---

# 02_新版SOP主流程_v0.1.md


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



---

# 03_用户工作流与前端工作区.md


# 用户工作流与前端工作区

> 版本：v0.1  
> 状态：产品定义文档，不是开发指令。  
> 适用范围：B2B SEO OS / WordPress B2B 独立站站内 SEO 运营工作台。

## 1. 前端不是 11 个数据面板

前端的目标不是展示所有数据，而是让非技术用户知道：当前项目处于哪一步、下一步做什么、哪些数据缺失、哪些任务要处理。

## 2. 建议保留 11 个一级工作区

这 11 个页面可以保留，但要重新定义为工作区，不是普通页面。

```text
1. 项目总览
2. 项目中心 / 数据源中心
3. WordPress 读取与网站现状
4. SEO 审计
5. 页面与关键词 / Keywords Map
6. B2B 上下文与证据库
7. 内容运营
8. 任务中心
9. 资料与素材库
10. AI 工作台
11. 交付中心 / 设置与系统状态
```

原来的“供应商可信度”建议改名为“B2B 上下文与证据库”，避免误解成供应商筛选。

## 3. 项目总览

### 首屏必须回答

```text
网站是否已读取？
审计是否完成？
关键词库是否已建立？
有多少关键词待审核？
有多少页面需要修复？
有多少未使用关键词等待聚类？
下一步最应该做什么？
```

### 核心模块

```text
项目状态卡
执行流程进度条
下一步任务
风险提醒
缺失资料提醒
关键词状态摘要
页面修复进度
```

## 4. 项目中心 / 数据源中心

### 目标

管理域名、WordPress 连接、权限、数据源、导入文件。

### 首屏

```text
WordPress 连接状态
只读读取状态
已导入 CSV 文件
已导入公司资料
已导入产品线资料
数据最后更新时间
```

## 5. WordPress 读取与网站现状

### 目标

让用户先看清网站现在有什么。

### 模块

```text
页面列表
产品列表
文章列表
URL 架构树
导航与页脚
页面类型识别
媒体与 ALT 状态
表单与 CTA 入口
```

## 6. SEO 审计

### 目标

显示现有网站问题，但不直接强行进入关键词修复。

### 模块

```text
审计概览
页面问题
B2B 信息架构问题
技术 SEO 问题
信任缺口
转化路径问题
移动端 / 速度风险
修复建议草稿
```

## 7. 页面与关键词 / Keywords Map

### 目标

这是项目核心子系统。它不是关键词表，而是页面、关键词、集群、内链、状态之间的关系管理。

### 首屏

```text
总关键词数
待审核关键词数
已分配关键词数
未使用有效关键词数
疑似蚕食风险
已覆盖页面数
缺口页面机会数
```

### 二级模块

```text
关键词总库
关键词审核
页面分配
未使用词池
超级聚类
页面关键词视图
关键词集群视图
内链建议
蚕食风险
```

## 8. B2B 上下文与证据库

### 目标

管理公司事实、产品线、能力、证据和不能写的内容。

### 模块

```text
公司档案
产品线与规格
能力边界
证书与报告
工厂 / 设备 / QC 素材
案例
FAQ 证据映射
不能声明内容
缺失证据任务
```

## 9. 内容运营

### 目标

管理从未使用词池、超级聚类、页面缺口进入内容生产的任务。

### 模块

```text
内容机会
Brief 生成
Content Engine 交接包
草稿状态
QA 状态
发布前审查包
```

## 10. 任务中心

### 目标

把所有子系统的问题变成可执行任务。

### 来源

```text
网站审计
关键词审核
页面修复
证据缺失
内容生产
QA
交付
```

## 11. 资料与素材库

### 目标

管理图片、PDF、证书、产品资料、案例资料和它们可用于哪些页面。

## 12. AI 工作台

### 目标

不是聊天窗口，而是显示 AI/Agent 执行任务。

### 模块

```text
提示词模板库
Agent 任务队列
执行记录
失败重试
人工确认点
输出审查
```

## 13. 交付中心 / 设置与系统状态

### 目标

交付中心输出页面修复包、内容包、关键词包、审计报告。设置中心管理模型、Prompt、权限、WordPress 连接、文件路径。



---

# 04_WordPress网站读取与审计规范.md


# WordPress 网站读取与审计规范

> 版本：v0.1  
> 状态：产品定义文档，不是开发指令。  
> 适用范围：B2B SEO OS / WordPress B2B 独立站站内 SEO 运营工作台。

## 1. 基本原则

系统只接 WordPress B2B 独立站。读取和审计默认只读，不修改内容，不提交真实询盘，不发布，不上传媒体。

## 2. 读取方式分层

### L1：公开前台读取

适合没有后台权限时。

读取：

```text
首页
导航
页脚
公开页面
公开文章
公开产品页
sitemap.xml
robots.txt
可见 SEO Title / Meta / H1
可见 CTA
可见表单结构
图片 ALT
内链
```

### L2：WordPress 只读读取

适合有后台/API 权限时。

读取：

```text
Pages
Posts
Products
Categories
Tags
Media
Menus
SEO metadata
Custom fields / ACF
Form plugin configuration summary
Modified date
Author / status / draft/published
```

### L3：授权深度读取

后续阶段可接入 GSC、GA4、GTM、表单数据，但第一阶段不强求。

## 3. 网站现状建模输出

```json
{
  "siteId": "example-com",
  "domain": "example.com",
  "platform": "wordpress",
  "snapshotAt": "2026-06-09T00:00:00Z",
  "pages": [],
  "posts": [],
  "products": [],
  "media": [],
  "menus": [],
  "forms": [],
  "seoMeta": [],
  "internalLinks": [],
  "trustPages": [],
  "ctaEntries": []
}
```

## 4. 页面类型识别

系统需要识别这些页面类型：

```text
home
product_category
product_detail
solution
application
custom_oem
capability
quality_control
certification
about
case_study
resource
blog
faq
contact
rfq
download
privacy_terms
unknown
```

识别可以由规则 + AI 完成。规则先看 URL、标题、菜单位置；AI 再根据正文摘要判断。

## 5. 审计模式

### 模式 A：公开前台快速审计

适合无权限客户。覆盖：

```text
页面结构
B2B 信息架构
首页表达
产品页内容
CTA 与询盘路径
表单入口
技术 SEO 基础
移动端可读性风险
内容薄弱
信任资产缺失
内链问题
```

### 模式 B：WordPress 只读深度审计

在模式 A 基础上增加：

```text
后台页面状态
草稿 / 已发布状态
SEO 插件字段
媒体库 ALT
ACF 字段完整度
分类/标签混乱
表单配置可见风险
页面更新时间
```

### 模式 C：数据增强审计

后续接入 GSC/GA4 后增加：

```text
收录
曝光
排名
CTR
着陆页表现
询盘来源页面
转化事件
```

## 6. 审计输出结构

```json
{
  "findingId": "finding_001",
  "source": "site_audit",
  "severity": "high",
  "category": "b2b_information_architecture",
  "pageUrl": "/products/",
  "pageType": "product_category",
  "problem": "产品分类页只有图片和产品名，缺少规格、应用和询盘入口。",
  "whyItMatters": "采购用户无法判断产品是否符合需求，也无法快速询盘。",
  "recommendedAction": "补充产品线说明、参数表、应用场景、FAQ 和 Request a Quote CTA。",
  "requiresHumanInput": true,
  "relatedEvidenceNeeded": ["product-line-record", "capability"],
  "canCreateTask": true
}
```

## 7. 审计与关键词的关系

审计在关键词之前执行。它先告诉系统网站现状和问题。但最终页面修复要等关键词数据库审核分配后再执行。审计结果只生成初始修复建议和任务草稿，不直接决定关键词植入。

## 8. 安全边界

```text
不修改 WordPress 内容
不发布页面
不上传媒体
不提交真实表单
不删除内容
不改插件设置
不做压力测试
不暴力破解
不读取或输出敏感数据
```



---

# 05_B2B上下文与证据库规范.md


# B2B 上下文与证据库规范

> 版本：v0.1  
> 状态：产品定义文档，不是开发指令。  
> 适用范围：B2B SEO OS / WordPress B2B 独立站站内 SEO 运营工作台。

## 1. 定位

B2B 上下文与证据库不是供应商验证系统，也不是 CRM。它用于管理客户作为供应商自身已有的事实、能力、产品线、证据素材和内容风险边界。

## 2. 为什么必须有证据库

B2B 内容不能靠 AI 自由发挥。产品页、解决方案页、案例页、FAQ、About、QC、Certificate、RFQ 页面都需要真实上下文。没有证据的内容只能写成“可支持 / 可讨论 / 需人工补充”，不能写成确定承诺。

## 3. 核心对象

### company-profile

```json
{
  "companyName": "",
  "legalName": "",
  "supplierIdentity": "factory | trading_company | factory_trading | oem_odm | wholesaler | solution_provider",
  "targetMarkets": [],
  "targetBuyerRoles": [],
  "positioning": "",
  "coreValuePropositions": [],
  "mustSay": [],
  "mustNotSay": []
}
```

### product-line-record

```json
{
  "productLineId": "",
  "name": "",
  "category": "",
  "mainProducts": [],
  "specifications": [],
  "materials": [],
  "applications": [],
  "customOptions": [],
  "moq": "",
  "leadTime": "",
  "samplePolicy": "",
  "relatedPages": []
}
```

### capability

```json
{
  "productCapabilities": [],
  "customizationCapabilities": [],
  "manufacturingCapabilities": [],
  "qualityControl": [],
  "certifications": [],
  "samplePolicy": "",
  "leadTime": "",
  "packaging": [],
  "shipping": [],
  "salesSupport": []
}
```

### trust-evidence

```json
{
  "factoryImages": [],
  "equipmentImages": [],
  "qcImages": [],
  "certificates": [],
  "testReports": [],
  "caseStudies": [],
  "teamInfo": [],
  "processAssets": [],
  "publicClaims": [],
  "needsEvidence": [],
  "doNotClaim": []
}
```

## 4. 证据状态

每条证据或声明必须有状态：

```text
confirmed 可直接使用
needs_human_review 需人工确认
needs_evidence 需要补证据
do_not_claim 不建议声明
expired 已过期
private_not_public 可内部使用但不公开
```

## 5. 页面引用关系

证据库必须能回答：

```text
这张工厂图可以放在哪些页面？
这个证书能支撑哪些产品线？
这个案例是否可公开？
这个 MOQ 是否适用于全部产品？
这个 Lead Time 是常规范围还是个别项目？
这个能力声明是否有证据？
```

## 6. AI 使用规则

AI 可以：

```text
整理证据
提取字段
识别缺口
建议页面使用位置
提醒风险
生成安全表达
```

AI 不可以：

```text
虚构证书
虚构客户
虚构案例
编造工厂规模
编造产能
编造交期
把未确认内容写成事实
```

## 7. 与其他子系统关系

```text
网站审计：判断页面是否缺信任内容。
关键词分配：判断某个关键词是否有足够证据支撑。
页面修复：把证据模块加入对应页面。
Content Engine：写作时注入可信上下文。
QA：检查是否越过事实边界。
交付中心：输出证据缺口和补充清单。
```



---

# 06_关键词数据库_导入清洗审核分配流程.md


# 关键词数据库：导入、清洗、审核、分配流程

> 版本：v0.1  
> 状态：产品定义文档，不是开发指令。  
> 适用范围：B2B SEO OS / WordPress B2B 独立站站内 SEO 运营工作台。

## 1. 关键词流程总原则

关键词调研不是全自动。系统负责种子词生成、CSV 合并清洗、AI+规则清洗、总词库管理、审核分配和未使用词池。人工负责外部工具挖词和最终审核。

## 2. 流程图

```text
种子词生成
→ 人工工具挖词
→ 上传多个 CSV
→ 内置脚本合并去重
→ AI + 规则清洗
→ 写入总关键词数据库
→ 人工审核
→ 分配到现有页面 / 排除 / 未使用
→ 已分配词进入页面修复
→ 未使用有效词进入超级聚类
```

## 3. CSV 导入最低字段

```text
keyword
volume
kd
cpc
intent
source_sheet
source_tool
seed_group
country
notes
```

必填字段只有 keyword 和 source_sheet。其他字段可以为空。

## 4. 第一层清洗：脚本机械清洗

程序内置能力：

```text
1. 合并多个 CSV / Excel。
2. keyword trim 去空格。
3. 统一大小写，默认小写。
4. 删除完全重复 keyword。
5. 同一 keyword 多来源合并 source_sheet。
6. 保留最大 volume、最小 KD，或按规则保留来源优先级。
7. 标记空 keyword、乱码、非目标语言。
8. 输出 keyword-master-raw。
```

## 5. 第二层清洗：AI + 规则清洗

AI 只做建议，不直接删除。

标记字段：

```text
is_brand_term
is_platform_term
is_b2c_term
is_irrelevant
is_duplicate_intent
likely_intent
likely_page_type
buyer_stage
cleaning_reason
ai_confidence
```

输出：keyword-master-cleaned。

## 6. 入库状态

关键词进入数据库后，状态不应直接是可用，而是：

```text
pending_review
```

## 7. 关键词状态机

```text
raw_imported
→ script_cleaned
→ ai_cleaned
→ pending_review
→ approved
→ assigned_existing_page
→ used_in_page_repair
```

其他分支：

```text
pending_review → rejected
pending_review → duplicate_intent
pending_review → hold
approved → unused_valid
unused_valid → super_clustered
super_clustered → new_page_task
super_clustered → content_engine_task
super_clustered → faq_task
```

## 8. 人工审核界面要问的问题

每个关键词至少要判断：

```text
这个词是否相关？
是否有 B2B 采购意图？
是否更像 B2C / 平台 / 品牌词？
是否已有页面可以承接？
承接页面是否真的适合？
是否应该新建页面？
是否应该进入 Content Engine？
是否应暂时保留？
```

## 9. 分配规则

### 可以分配到现有页面

满足：

```text
页面主题与关键词意图一致。
页面类型匹配。
页面能补充足够内容。
关键词不会破坏页面定位。
不会和已有页面抢词。
```

### 不应分配到现有页面

出现：

```text
关键词意图和页面不一致。
页面只是勉强相关。
现有页面没有对应产品线或证据。
该词更适合新页面。
该词更适合博客/FAQ/Guide。
```

## 10. 超级聚类触发条件

超级聚类只处理：

```text
approved = true
assignedPage = null
status = unused_valid
not rejected
not duplicate_intent
not low_value
```

不能对全部词库直接聚类，否则会把已适合现有页面的词重新打散。

## 11. 数据库字段建议

```json
{
  "keywordId": "kw_001",
  "keyword": "custom metal parts supplier",
  "volume": 320,
  "kd": 18,
  "sourceSheets": ["semrush", "competitor-a"],
  "seedGroup": "supplier_identity",
  "aiIntent": "supplier_commercial",
  "manualIntent": "supplier_commercial",
  "likelyPageType": "capability",
  "status": "pending_review",
  "assignedUrl": null,
  "isUsed": false,
  "isValidUnused": false,
  "reviewNotes": "",
  "createdAt": "",
  "updatedAt": ""
}
```



---

# 07_Keywords_Map子系统规范.md


# Keywords Map 子系统规范

> 版本：v0.1  
> 状态：产品定义文档，不是开发指令。  
> 适用范围：B2B SEO OS / WordPress B2B 独立站站内 SEO 运营工作台。

## 1. 定位

Keywords Map 是 B2B SEO OS 的目录级核心系统，不是一个关键词表页面。它负责管理“关键词、页面、搜索意图、页面类型、集群、内链、蚕食风险、内容缺口”的关系。

## 2. 它解决的问题

```text
哪个关键词由哪个页面承接？
哪个页面的主关键词是什么？
哪些词已经使用？
哪些词有效但未使用？
哪些词适合新页面？
哪些词适合 Content Engine？
哪些页面存在关键词蚕食？
哪些页面需要内链？
哪些关键词没有证据支撑？
```

## 3. 与关键词数据库的关系

关键词数据库存每个词的状态。Keywords Map 负责把关键词和页面关系可视化。

```text
Keyword Database = 词资产池
Keywords Map = 词与页面的关系地图
```

## 4. 主要视图

### 4.1 关键词总库视图

显示所有关键词及状态。

字段：

```text
keyword
volume
kd
source
status
intent
page type
assigned url
used / unused
review notes
```

### 4.2 页面关键词视图

从页面角度看：

```text
URL
页面类型
当前 Title
当前 H1
已分配主关键词
已分配次关键词
可修复关键词
不建议植入关键词
相关审计问题
修复任务
```

### 4.3 未使用词池

只显示有效、已审核、未使用的词。

用途：进入超级聚类。

### 4.4 集群视图

超级聚类后出现。

```text
cluster name
cluster intent
primary keyword
secondary keywords
recommended page type
recommended url
content priority
related products
related evidence
```

### 4.5 蚕食风险视图

检测：

```text
多个页面分配同一主意图
博客抢产品词
产品页抢解决方案词
解决方案页和应用页重叠
同一关键词多个 URL 都想承接
```

### 4.6 内链视图

展示：

```text
从博客到商业页
从产品页到 RFQ
从 Solution 到产品线
从 FAQ 到 Contact
从 Capability 到证书 / QC
```

## 5. 页面类型标准

```text
home
product_category
product_detail
custom_oem
solution
application
capability
quality_control
certification
case_study
resource
blog
faq
rfq
contact
```

## 6. 关键词状态在 Map 中的含义

```text
pending_review：不可用于修复。
approved：可进入分配。
assigned_existing_page：可用于页面修复。
used_in_page_repair：已用于修复包。
unused_valid：进入未使用词池。
super_clustered：已聚类为新页面或内容机会。
content_engine_task：已转内容生产。
rejected：隐藏或保留归档。
```

## 7. 首屏摘要指标

```text
总关键词数
待审核关键词数
已分配关键词数
未使用有效关键词数
已覆盖页面数
缺口页面机会数
疑似蚕食风险数
可进入 Content Engine 数
```

## 8. 关键交互

```text
批量审核关键词
分配关键词到页面
取消分配
标记不适合现有页面
推入未使用词池
触发超级聚类
从聚类生成新页面任务
从聚类生成 Content Engine 任务
查看某页面的关键词使用历史
```

## 9. 不允许的交互

```text
未审核关键词直接用于页面修复。
所有词一键超级聚类。
AI 自动覆盖人工分配。
AI 自动把词塞入不适合页面。
```



---

# 08_页面修复任务与优化包规范.md


# 页面修复任务与优化包规范

> 版本：v0.1  
> 状态：产品定义文档，不是开发指令。  
> 适用范围：B2B SEO OS / WordPress B2B 独立站站内 SEO 运营工作台。

## 1. 页面修复的定位

页面修复不是单纯改 Title 和 Meta。它是把“审计发现 + 已分配关键词 + B2B 上下文 + 证据库”组合成可执行页面优化包。

## 2. 页面修复触发条件

必须同时满足：

```text
该页面已被 WordPress 读取。
该页面已有审计发现，或用户手动标记需要优化。
该页面有适合的已审核关键词，或只做非关键词类修复。
相关事实和证据边界已确认。
```

## 3. 不强行植入关键词规则

如果关键词不适合现有页面，系统必须允许：

```text
不分配
取消分配
转入未使用词池
生成新页面机会
进入 Content Engine
```

页面修复不能为了覆盖关键词而破坏页面定位。

## 4. 页面修复任务字段

```json
{
  "taskId": "task_page_repair_001",
  "url": "/products/custom-metal-parts/",
  "pageType": "product_category",
  "sourceFindings": ["finding_001"],
  "assignedKeywords": ["kw_001", "kw_002"],
  "notRecommendedKeywords": ["kw_009"],
  "repairGoal": "让产品线页承接 custom metal parts supplier，并补充规格、应用、定制和 RFQ CTA。",
  "titleSuggestion": "",
  "metaSuggestion": "",
  "h1Suggestion": "",
  "contentModulesToAdd": [],
  "evidenceNeeded": [],
  "internalLinksToAdd": [],
  "ctaSuggestion": "",
  "humanReviewRequired": true,
  "status": "draft"
}
```

## 5. 页面优化包结构

每个页面输出：

```text
1. 页面当前状态摘要
2. 当前问题
3. 目标页面定位
4. 可承接关键词
5. 不建议植入关键词
6. SEO Title 建议
7. Meta Description 建议
8. H1 建议
9. 页面模块补充建议
10. 需要使用的 B2B 证据
11. 内链建议
12. CTA 建议
13. 图片 ALT 建议
14. Schema / FAQ 建议
15. 人工确认事项
16. 发布前检查清单
```

## 6. 常见修复动作

```text
重写 Title / Meta
修正 H1
调整页面首屏表达
补产品参数表
补应用场景
补材料 / 工艺 / 定制信息
补 MOQ / lead time / sample policy
补 QC / certification / factory evidence
补 FAQ
补 CTA
补内链
补图片 ALT
拆分页面
合并重复页面
标记不适合关键词
```

## 7. 页面修复状态

```text
draft
needs_human_input
ready_for_review
approved
exported
applied_manually
verified
```

## 8. QA 检查

页面修复包必须检查：

```text
关键词是否自然
页面意图是否清楚
是否虚构事实
是否缺少证据
是否有 RFQ / Contact 路径
是否链接到相关商业页
是否链接到相关信任页
是否出现 DTC 促销话术
是否形成新的蚕食风险
```



---

# 09_内容运营与Content_Engine对接规范.md


# 内容运营与 Content Engine 对接规范

> 版本：v0.1  
> 状态：产品定义文档，不是开发指令。  
> 适用范围：B2B SEO OS / WordPress B2B 独立站站内 SEO 运营工作台。

## 1. 边界

B2B SEO OS 不直接吞并 Content Engine。OS 负责决定做什么内容、为什么做、使用哪些上下文、链接到哪里。Content Engine 负责 brief、outline、draft、HTML、QA、发布包等内容生产执行。

## 2. 什么内容进入 Content Engine

只有这些类型适合进入：

```text
Supplier Guide
Material Comparison
Application Guide
Custom Guide
QC Guide
FAQ Cluster
Case Study
Cost / Lead Time Guide
Buying Guide
Troubleshooting Guide
Resource Article
```

不进入 Content Engine 的内容：

```text
现有产品页修复
核心商业页结构改造
需要大量人工确认的证书/案例页
WordPress 设置修改
表单配置修改
```

## 3. 触发来源

```text
未使用词池超级聚类
审计发现内容缺口
页面修复后仍缺资源内容
GSC 后续查询词
用户手动创建内容任务
```

## 4. OS 输出给 Content Engine 的上下文包

```json
{
  "handoffId": "handoff_001",
  "targetContentType": "supplier_guide",
  "primaryKeyword": "custom metal parts supplier",
  "secondaryKeywords": [],
  "searchIntent": "supplier_selection",
  "buyerStage": "supplier_shortlisting",
  "targetAudience": ["procurement manager", "brand owner"],
  "relatedProductPages": [],
  "relatedSolutionPages": [],
  "relatedTrustPages": [],
  "internalLinkTargets": [],
  "companyProfile": {},
  "capability": {},
  "trustEvidence": {},
  "brandVoice": {},
  "mustSay": [],
  "mustNotSay": [],
  "factBoundaries": [],
  "qaRules": [],
  "ctaGoal": "Request a Quote"
}
```

## 5. Content Engine 回传给 OS

```json
{
  "handoffId": "handoff_001",
  "briefStatus": "done",
  "outlineStatus": "done",
  "draftStatus": "done",
  "qaStatus": "needs_review",
  "htmlPath": "outputs/custom-metal-parts-supplier.html",
  "dataPackPath": "outputs/custom-metal-parts-supplier-data-pack.json",
  "qaReport": {},
  "publishReviewPackage": {}
}
```

## 6. QA 必查

Content Engine 产物必须回到 OS 过 QA：

```text
是否使用了未确认事实
是否虚构客户案例
是否虚构证书
是否夸大 MOQ / 交期 / 产能
是否链接到产品线页
是否链接到信任页
是否避免关键词蚕食
CTA 是否适合 B2B
是否符合品牌语言
```

## 7. 文章发布后的回写

发布后，OS 需要更新：

```text
keyword status = content_published
links.json / internal link map
content inventory
GSC submit log
related page internal links
```

第一阶段可以只做“导出发布包”，不做自动发布。



---

# 10_AI_Agent执行层与提示词内置规范.md


# AI / Agent 执行层与提示词内置规范

> 版本：v0.1  
> 状态：产品定义文档，不是开发指令。  
> 适用范围：B2B SEO OS / WordPress B2B 独立站站内 SEO 运营工作台。

## 1. 定位

AI / Agent 执行层不是一个普通聊天页。它是系统背后的执行能力，负责读取、分析、解释、清洗、聚类、生成、检查和整理。但产品本体必须管理 UI、状态、任务、数据和人工确认边界。

## 2. 三种能力

### 2.1 脚本能力

适合确定性任务：

```text
CSV 合并
去重
字段标准化
状态更新
文件导出
JSON 校验
报告打包
```

### 2.2 Prompt 能力

适合结构化分析：

```text
网站审计
页面类型判断
B2B 上下文整理
关键词 AI 清洗
关键词超级聚类
页面修复建议
Brief 生成
QA 检查
```

### 2.3 Agent 能力

适合需要工具调用的任务：

```text
读取 WordPress
抓取前台页面
读取 sitemap
解析页面结构
检查表单入口
读取文件库
执行多步审计
生成修复包
```

## 3. 内置提示词库

系统应内置这些 Prompt：

```text
wordpress-site-reading-agent.md
front-stage-b2b-audit.md
authorized-wordpress-audit.md
b2b-context-extraction.md
seed-keyword-generation.md
keyword-ai-cleaning.md
unused-keyword-super-clustering.md
page-repair-package-generation.md
content-engine-handoff-generation.md
qa-review.md
delivery-package-generation.md
```

## 4. AI 输出必须结构化

所有 Prompt 输出都应该同时有：

```text
人类可读 Markdown
机器可读 JSON
任务可读 action list
```

例如审计输出不仅是报告，还要生成 findings.json。

## 5. 人工确认门槛

必须人工确认：

```text
WordPress 写入
页面发布
证书使用
客户案例使用
MOQ / 产能 / 交期
公司规模
真实工厂声明
删除或合并页面
关键词最终分配
```

AI 可以建议，但不能自动确认。

## 6. Agent 执行记录

每次 AI / Agent 执行都要记录：

```json
{
  "runId": "run_001",
  "taskType": "keyword_ai_cleaning",
  "inputSources": [],
  "promptVersion": "v0.1",
  "model": "",
  "status": "done",
  "outputFiles": [],
  "humanReviewRequired": true,
  "createdAt": ""
}
```

## 7. 可插拔设计

短期可以手动复制 Prompt 到外部 Agent。中期接入 API。长期形成 Agent Adapter 层：

```text
OpenAI API
Claude API
Codex
Claude Code
本地模型
手动导出 Prompt
```

产品数据结构不依赖单一模型。



---

# 11_数据契约与状态机.md


# 数据契约与状态机

> 版本：v0.1  
> 状态：产品定义文档，不是开发指令。  
> 适用范围：B2B SEO OS / WordPress B2B 独立站站内 SEO 运营工作台。

## 1. 核心数据对象

```text
Project
WordPressSnapshot
Page
Post
Product
Media
FormEntry
AuditFinding
B2BContext
ProductLine
Capability
TrustEvidence
Keyword
KeywordSource
KeywordAssignment
KeywordCluster
PageRepairTask
ContentHandoff
QAReview
DeliveryPackage
AgentRun
```

## 2. Project

```json
{
  "projectId": "proj_001",
  "domain": "example.com",
  "platform": "wordpress",
  "siteType": "factory_trading",
  "targetMarkets": [],
  "primaryConversionGoal": "Request a Quote",
  "status": "active"
}
```

## 3. Page

```json
{
  "pageId": "page_001",
  "url": "/products/",
  "wpId": 123,
  "title": "",
  "h1": "",
  "metaDescription": "",
  "pageType": "product_category",
  "status": "published",
  "modifiedAt": "",
  "primaryKeywordId": null,
  "secondaryKeywordIds": [],
  "auditFindingIds": [],
  "repairTaskIds": []
}
```

## 4. Keyword

```json
{
  "keywordId": "kw_001",
  "keyword": "",
  "volume": null,
  "kd": null,
  "sources": [],
  "seedGroup": "",
  "aiIntent": "",
  "manualIntent": "",
  "likelyPageType": "",
  "manualPageType": "",
  "status": "pending_review",
  "assignedPageId": null,
  "isUsed": false,
  "isValidUnused": false,
  "reviewNotes": ""
}
```

## 5. Keyword 状态机

```text
raw_imported
→ script_cleaned
→ ai_cleaned
→ pending_review
→ approved
→ assigned_existing_page
→ used_in_page_repair
```

分支：

```text
pending_review → rejected
pending_review → duplicate_intent
pending_review → hold
approved → unused_valid
unused_valid → super_clustered
super_clustered → new_page_task
super_clustered → content_engine_task
```

## 6. AuditFinding

```json
{
  "findingId": "finding_001",
  "category": "trust_gap",
  "severity": "high",
  "pageId": "page_001",
  "problem": "",
  "whyItMatters": "",
  "recommendedAction": "",
  "requiresHumanInput": true,
  "status": "open"
}
```

## 7. PageRepairTask 状态机

```text
draft
→ needs_human_input
→ ready_for_review
→ approved
→ exported
→ applied_manually
→ verified
```

## 8. ContentHandoff 状态机

```text
draft
→ ready_for_content_engine
→ sent
→ brief_done
→ draft_done
→ qa_needed
→ approved
→ publish_review_exported
```

## 9. AgentRun 状态机

```text
queued
→ running
→ waiting_for_human
→ done
→ failed
→ cancelled
```

## 10. 数据原则

```text
所有 AI 输出都要可追踪。
所有人工修改都要保留历史。
所有关键词分配都要可撤销。
所有事实声明都要能追溯证据。
所有页面修复都要能追溯到审计发现和关键词分配。
```



---

# 12_Codex开发路线图_不加多余动作.md


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



---

# 13_验收标准与测试清单.md


# 验收标准与测试清单

> 版本：v0.1  
> 状态：产品定义文档，不是开发指令。  
> 适用范围：B2B SEO OS / WordPress B2B 独立站站内 SEO 运营工作台。

## 1. 产品验收总标准

系统不是看“模块有没有”，而是看用户能不能按工作流完成：

```text
读取 WordPress 网站
看懂现有问题
建立关键词数据库
审核并分配关键词
修复适合的页面
不强行植入不适合的词
对未使用词聚类
生成内容任务
完成 QA 和交付
```

## 2. 前端验收

```text
用户打开项目总览，能看到当前处于哪一步。
用户能看到 WordPress 是否已读取。
用户能看到审计是否完成。
用户能看到关键词库导入和清洗状态。
用户能看到待审核、已分配、未使用关键词数量。
用户能进入某个页面查看适合和不适合的关键词。
用户能看到页面修复任务来自哪些审计问题和关键词分配。
```

## 3. 关键词库验收

```text
可以上传多个 CSV。
可以合并并去重。
可以保留 source_sheet。
可以进行 AI+规则标记。
清洗后先进入总词库。
未审核词不能用于页面修复。
已分配词能关联页面。
未使用有效词能进入未使用词池。
超级聚类只处理未使用词池。
```

## 4. 审计验收

```text
审计能输出页面问题。
审计能输出 B2B 信息架构问题。
审计能输出信任缺口。
审计能输出转化路径问题。
审计能输出技术 SEO 基础问题。
审计结果能生成任务草稿。
审计不会直接自动改页面。
```

## 5. 页面修复验收

```text
页面修复包能显示当前问题。
页面修复包能显示适合植入的关键词。
页面修复包能显示不建议植入的关键词。
页面修复包能提出 Title、Meta、H1、模块、CTA、内链建议。
页面修复包能标注需要人工补充的证据。
页面修复包能导出，但不能自动发布。
```

## 6. B2B 证据库验收

```text
能录入公司资料、产品线、规格、能力、证书、案例。
能标记 confirmed / needs_evidence / do_not_claim。
AI 不能把 needs_evidence 写成 confirmed。
页面修复和 Content Engine 能引用证据库。
QA 能检查内容是否越过事实边界。
```

## 7. Content Engine 对接验收

```text
OS 能输出 handoff 包。
handoff 包包含关键词、搜索意图、相关页面、证据、品牌语言、QA 规则。
Content Engine 回传后，OS 能显示 brief / draft / QA 状态。
不把 Content Engine 代码合并进 OS。
```

## 8. 禁止项验收

任何阶段出现以下内容都算偏离：

```text
自动发布 WordPress
自动确认商业事实
供应商真假验证
多站点后台
Shopify/Webflow 泛平台支持
外链管理
CRM 销售跟进
广告投放
未经审核的一键改页面
```



---

# 14_前端逐页布局与交互说明.md


# 前端逐页布局与交互说明

> 版本：v0.2  
> 状态：开发前规格文档。  
> 适用范围：B2B SEO OS / WordPress B2B 独立站站内 SEO 运营工作台。

## 1. 设计原则

本系统前端不是工程数据面板，而是运营执行工作台。页面必须让非技术用户一眼知道：

```text
当前网站处于什么状态
最大问题是什么
下一步该做什么
哪些内容需要人工确认
哪些动作只是生成本地建议，不会写入 WordPress
```

核心约束：

```text
只服务一个 WordPress B2B 站
先读取和审计已有网站
关键词先入库、清洗、审核、分配
只有适合页面的关键词才进入页面修复
未使用关键词再进入超级聚类和内容生产
不自动发布、不自动改 WordPress、不自动确认商业事实
```

## 2. 全局界面框架

### 2.1 左侧导航分组

```text
一、项目启动
- 项目总览
- 项目中心 / 数据源中心

二、站内 SEO 工作流
- SEO 诊断
- 页面与关键词
- 供应商可信度
- 内容运营
- 任务中心

三、资料与交付
- 资料与素材库
- 交付中心

四、系统能力
- AI 工作台
- 设置 / 系统状态
```

### 2.2 顶部状态栏

所有页面顶部应固定展示：

```text
当前项目名称 / 域名
WordPress 连接状态
最近读取时间
当前运行模式：Mock / 前台只读 / WordPress 只读 / 手动导入
AI 执行状态：未配置 / 可用 / 失败
待人工确认数量
```

### 2.3 右侧通用 Drawer

系统应有三个通用抽屉：

```text
详情 Drawer：查看页面、关键词、任务、证据的详情
任务 Drawer：从任意对象生成或查看任务
AI 解释 Drawer：展示 AI 分析依据、输入上下文、输出 JSON、人工确认项
```

### 2.4 统一空状态

空状态必须告诉用户下一步做什么，不显示空表格。

示例：

```text
还没有 WordPress 读取数据
→ 连接 WordPress 只读接口
→ 或上传 sitemap / 页面导出文件
→ 或使用 Mock Demo 体验
```

## 3. 工作区 1：项目总览

### 3.1 业务目标

让用户打开系统后知道：这个站当前能不能开始优化，卡在哪里，下一步应该做什么。

### 3.2 首屏模块

```text
项目状态卡：域名、行业、目标市场、WordPress 状态
执行进度条：读取 → 审计 → 上下文 → 词库 → 分配 → 修复 → 内容 → 交付
今日建议动作：只显示 1-3 个最重要动作
风险概览：SEO / 关键词 / 信任 / 转化 / 数据源
待人工确认：关键词审核、证据确认、页面修复包确认
```

### 3.3 二级模块

```text
最近读取摘要
最近审计摘要
关键词数据库摘要
页面修复进度
内容生产进度
交付包状态
```

### 3.4 可触发动作

```text
开始 WordPress 读取
查看审计报告
进入关键词审核
查看高优先级任务
导出当前项目状态摘要
```

## 4. 工作区 2：项目中心 / 数据源中心

### 4.1 业务目标

管理项目基本信息和所有输入来源。

### 4.2 首屏模块

```text
项目档案：公司、域名、行业、目标市场、主转化目标
WordPress 连接状态
数据源清单：WordPress / CSV / 文档 / 图片 / 手动资料 / AI Prompt
权限状态：无权限 / 前台只读 / WordPress 只读 / 管理员但仅使用只读
```

### 4.3 二级模块

```text
项目资料表单
WordPress 连接配置
CSV 导入区
B2B 上下文资料上传区
执行日志
数据源新鲜度
```

### 4.4 可触发动作

```text
保存项目档案
测试 WordPress 只读连接
运行网站读取
上传关键词 CSV
上传公司 / 产品线 / 证据资料
刷新数据源状态
```

### 4.5 关键限制

这里不提供任何“发布”“写入 WordPress”“修改页面”按钮。

## 5. 工作区 3：SEO 诊断

### 5.1 业务目标

在关键词分配前先理解现有网站问题。

### 5.2 首屏模块

```text
审计运行状态
网站结构问题摘要
B2B 信息架构问题摘要
信任与转化问题摘要
技术 SEO 基础问题摘要
高优先级问题 Top 10
```

### 5.3 二级模块

```text
审计报告视图
问题队列
页面问题矩阵
信任缺口
转化路径检查
技术 SEO 检查
移动端 / 性能风险
```

### 5.4 可触发动作

```text
运行前台只读审计
运行 WordPress 只读审计
把问题生成任务
打开页面详情
标记问题为无需处理
请求 AI 解释问题
```

### 5.5 重要交互

审计产生的是“初始修复建议”。页面关键词植入必须等关键词数据库审核分配后再做。

## 6. 工作区 4：页面与关键词

### 6.1 业务目标

这是 Keywords Map 子系统的入口，管理页面、关键词、集群、内链和蚕食。

### 6.2 首屏模块

```text
页面总数 / 已有关键词分配页面数
关键词总数 / 待审核 / 已分配 / 未使用有效词
当前最大蚕食风险
待审核关键词队列
待分配关键词队列
未使用词池状态
```

### 6.3 二级模块

```text
页面地图
关键词数据库
关键词审核台
关键词分配台
未使用词池
超级聚类结果
内链关系图
蚕食风险列表
```

### 6.4 关键词审核台交互

每一行关键词应提供：

```text
通过
排除
标记为重复意图
分配到现有页面
标记为未使用有效词
保留观察
```

### 6.5 页面分配交互

当用户把关键词分配给页面时，系统必须提示：

```text
页面主题是否匹配
页面类型是否匹配
是否存在更适合页面
是否会造成蚕食
是否缺少支撑证据
是否建议不强行植入
```

### 6.6 可触发动作

```text
上传关键词 CSV
运行合并去重脚本
运行 AI 清洗
审核关键词
分配关键词
运行未使用词超级聚类
生成页面修复任务
生成 Content Engine 任务
```

## 7. 工作区 5：供应商可信度

### 7.1 业务目标

管理 B2B 上下文和证据，不做供应商验证。

### 7.2 首屏模块

```text
公司资料完整度
产品线资料完整度
能力资料完整度
证据素材数量
缺失证据提醒
高风险声明提醒
```

### 7.3 二级模块

```text
公司资料
产品线与规格
能力与边界
证书 / 报告
案例 / 出口市场
工厂 / 设备 / QC / 包装素材
品牌语言与禁用表达
证据与页面关联
```

### 7.4 可触发动作

```text
上传证据
提取结构化事实
标记事实可信等级
关联到页面
关联到内容任务
生成证据补充任务
```

### 7.5 关键限制

系统只判断“当前内容是否有证据支撑”，不判断客户是不是合格供应商。

## 8. 工作区 6：内容运营

### 8.1 业务目标

承接未使用关键词、超级聚类结果和内容生产任务。

### 8.2 首屏模块

```text
待进入 Content Engine 的任务
未使用词聚类摘要
可新建商业页面机会
可生成采购辅助内容机会
Content Engine 交接状态
```

### 8.3 二级模块

```text
内容机会列表
页面建设机会
Content Engine Handoff 包
Brief 队列
QA 队列
发布前审查包
```

### 8.4 可触发动作

```text
生成 Content Engine 上下文包
生成 Brief
查看内链目标
查看证据要求
标记交接完成
导出内容任务包
```

## 9. 工作区 7：任务中心

### 9.1 业务目标

把所有子系统的输出变成可执行任务。

### 9.2 首屏模块

```text
今日优先任务
待人工确认任务
页面修复任务
关键词审核任务
证据补充任务
内容交接任务
QA 未通过任务
```

### 9.3 视图

```text
按优先级
按来源
按状态
按页面
按关键词
按交付阶段
```

### 9.4 可触发动作

```text
认领任务
标记进行中
标记需补资料
打开关联页面
打开关联关键词
打开关联证据
导出任务清单
```

## 10. 工作区 8：资料与素材库

### 10.1 业务目标

管理本地文件、图片、证书、案例、关键词文件、审计文件和交付素材。

### 10.2 二级模块

```text
文件总览
图片素材
证书 / 报告
案例素材
产品资料
关键词导入文件
审计输出文件
Content Engine 输出文件
```

### 10.3 可触发动作

```text
上传文件
自动分类
关联到公司 / 产品线 / 页面 / 任务
生成 ALT 建议
标记敏感文件
```

## 11. 工作区 9：交付中心

### 11.1 业务目标

把已完成的修复、内容、关键词、证据、QA 结果整理成客户可审查交付包。

### 11.2 首屏模块

```text
本轮完成页面
本轮完成关键词分配
本轮完成修复包
本轮完成内容包
QA 状态
交付包生成状态
```

### 11.3 可触发动作

```text
生成页面修复交付包
生成关键词地图交付包
生成 Content Engine 交接包
生成 QA 报告
导出 ZIP
```

## 12. 工作区 10：AI 工作台

### 12.1 业务目标

管理 AI / Prompt / Agent 的执行，而不是替代业务页面。

### 12.2 二级模块

```text
Prompt Registry
Agent 运行记录
输入上下文预览
输出 JSON 预览
失败重试
人工确认队列
```

### 12.3 可触发动作

```text
运行指定 Prompt
查看输入上下文
查看输出结构
重新运行
保存结果到对应子系统
```

### 12.4 关键限制

AI 工作台不能直接改 WordPress，不能直接确认商业事实。

## 13. 工作区 11：设置 / 系统状态

### 13.1 业务目标

管理本地配置、模型配置、权限、数据目录、运行状态。

### 13.2 二级模块

```text
本地工作区路径
WordPress 连接
AI 模型配置
Prompt 开关
安全边界
导出设置
日志设置
```

## 14. 页面交互验收标准

```text
用户无需理解工程目录也能知道下一步做什么。
任何页面都有明确空状态。
所有 AI 输出都有人工确认入口。
所有 WordPress 动作默认为只读。
关键词不会在未审核前进入页面修复。
未使用词才进入超级聚类。
Content Engine 只接收内容生产任务，不接管 OS 总流程。
```



---

# 15_WordPress只读同步字段契约.md


# WordPress 只读同步字段契约

> 版本：v0.2  
> 状态：开发前规格文档。  
> 适用范围：只接 WordPress B2B 独立站。

## 1. 总原则

第一阶段只做 WordPress 只读同步，不做任何写入。

禁止动作：

```text
不创建页面
不更新页面
不删除页面
不发布文章
不上传媒体
不修改 SEO 字段
不修改菜单
不修改表单
不修改插件设置
不触发真实询盘提交
```

## 2. 数据来源模式

系统应支持四种读取模式：

```text
mock_demo：本地 mock 数据，用于演示
frontend_readonly：公开前台读取，适合无后台权限
wp_rest_readonly：WordPress REST API 只读
manual_import：用户上传 sitemap、页面导出、CSV 或 HTML 文件
```

## 3. WordPress 连接对象

```json
{
  "siteUrl": "https://example.com",
  "mode": "wp_rest_readonly",
  "authType": "application_password | basic | none | manual",
  "hasWooCommerce": true,
  "hasACF": false,
  "seoPlugin": "yoast | rankmath | aioseo | unknown | none",
  "lastSyncedAt": "",
  "syncStatus": "not_connected | connected | failed | partial"
}
```

敏感信息必须保存在本地 `.env` 或本地安全配置中，不进入导出包。

## 4. Site 基础字段

```json
{
  "siteId": "site_001",
  "siteUrl": "",
  "siteName": "",
  "homeUrl": "",
  "language": "en",
  "targetMarket": "United States",
  "timezone": "",
  "wordpressVersion": "unknown",
  "theme": "unknown",
  "builder": "Elementor | Gutenberg | WPBakery | unknown",
  "generatedAt": ""
}
```

## 5. Page / Post 统一字段

Pages 和 Posts 应进入统一内容对象表，字段如下：

```json
{
  "wpId": 123,
  "type": "page | post | product",
  "status": "publish | draft | private | unknown",
  "url": "",
  "slug": "",
  "titleRendered": "",
  "seoTitle": "",
  "metaDescription": "",
  "h1": "",
  "headings": [{"level": 2, "text": ""}],
  "excerpt": "",
  "contentText": "",
  "contentHtmlHash": "",
  "wordCount": 0,
  "modifiedAt": "",
  "createdAt": "",
  "author": "",
  "template": "",
  "detectedPageType": "home | product_line | product_detail | solution | application | capability | trust | blog | contact | other",
  "primaryCta": "",
  "formsDetected": [],
  "internalLinksOut": [],
  "internalLinksInCount": 0,
  "mediaRefs": [],
  "source": "wp_rest | frontend | manual"
}
```

## 6. WooCommerce Product 字段

如果使用 WooCommerce 询盘模式，读取产品但不做电商下单逻辑。

```json
{
  "productId": 123,
  "url": "",
  "name": "",
  "slug": "",
  "sku": "",
  "categories": [],
  "tags": [],
  "shortDescription": "",
  "description": "",
  "attributes": [
    {"name": "Material", "value": "Stainless Steel"}
  ],
  "images": [],
  "relatedProducts": [],
  "priceVisible": false,
  "inquiryCtaDetected": false,
  "acfFields": {},
  "modifiedAt": ""
}
```

不强制读取价格。B2B 站可能没有价格或只做询盘。

## 7. Taxonomy 字段

```json
{
  "taxonomy": "category | product_cat | post_tag | custom",
  "termId": 12,
  "name": "",
  "slug": "",
  "url": "",
  "description": "",
  "count": 0,
  "parent": null,
  "detectedPurpose": "product_line | blog_cluster | application | unknown"
}
```

## 8. Media 字段

```json
{
  "mediaId": 321,
  "url": "",
  "filename": "",
  "mimeType": "image/jpeg",
  "altText": "",
  "caption": "",
  "title": "",
  "description": "",
  "width": 0,
  "height": 0,
  "fileSize": null,
  "attachedTo": [],
  "detectedAssetType": "product | factory | certificate | case | team | qc | unknown"
}
```

## 9. Menu / Navigation 字段

WordPress 菜单可能无法通过标准 REST 稳定读取。第一阶段可通过前台解析导航。

```json
{
  "menuId": "primary-nav",
  "location": "header | footer | mobile | unknown",
  "items": [
    {"label": "Products", "url": "/products/", "depth": 0, "parentLabel": null}
  ],
  "source": "frontend_parse | wp_rest | manual"
}
```

## 10. SEO 插件字段

插件字段兼容策略：

```text
Yoast：优先读取 yoast_head_json 或可用 REST 字段
Rank Math：优先读取 rank_math_title / description，如可用
AIOSEO：优先读取 aioseo 字段，如可用
未知插件：用前台 head 解析 title / meta description / canonical
```

统一输出：

```json
{
  "url": "",
  "titleTag": "",
  "metaDescription": "",
  "canonical": "",
  "robotsMeta": "",
  "ogTitle": "",
  "ogDescription": "",
  "schemaTypes": [],
  "source": "plugin | frontend_head | manual"
}
```

## 11. ACF 字段

第一阶段不要求识别全部 ACF 业务语义，只做原样保存和基础分类。

```json
{
  "objectType": "page | post | product",
  "objectId": 123,
  "acf": {
    "moq": "",
    "lead_time": "",
    "download_file": ""
  },
  "normalizedHints": {
    "moq": "",
    "leadTime": "",
    "certifications": [],
    "downloads": []
  }
}
```

## 12. 表单与询盘入口字段

第一阶段只读取前台可见结构，不提交真实表单。

```json
{
  "formId": "form_contact_001",
  "pageUrl": "",
  "formType": "contact | rfq | product_inquiry | catalog_download | sample_request | unknown",
  "fields": [
    {"label": "Email", "name": "email", "type": "email", "required": true}
  ],
  "hasFileUpload": false,
  "hasProductContext": false,
  "hasCountryField": false,
  "hasCompanyField": false,
  "submitButtonText": "Submit",
  "privacyNoticeVisible": false,
  "source": "frontend_parse"
}
```

## 13. 同步输出文件

```text
wordpress/latest-snapshot.json
wordpress/pages.json
wordpress/posts.json
wordpress/products.json
wordpress/taxonomies.json
wordpress/media.json
wordpress/menus.json
wordpress/seo-meta.json
wordpress/forms.json
wordpress/sync-report.md
```

## 14. 同步失败处理

每个失败都要进入 `sync-report.md`：

```json
{
  "area": "products",
  "status": "partial_failed",
  "reason": "WooCommerce REST not available",
  "impact": "Product attributes cannot be read from backend; frontend fallback required.",
  "nextAction": "Use frontend_readonly or ask user for product CSV export."
}
```

## 15. 验收标准

```text
无 WordPress 权限时，系统仍能通过前台读取建立基础页面地图。
有 WordPress 只读权限时，系统能读取页面、文章、媒体、基础 SEO 字段。
WooCommerce 不存在时，不报错，只标记为未启用。
SEO 插件不确定时，使用前台 head 解析兜底。
所有读取结果都有 source 和 lastSyncedAt。
任何读取流程都不会写入 WordPress。
```



---

# 16_关键词CSV导入字段映射与清洗规则.md


# 关键词 CSV 导入字段映射与清洗规则

> 版本：v0.2  
> 状态：开发前规格文档。  
> 适用范围：关键词数据库、内置清洗脚本、AI 清洗、人工审核。

## 1. 总原则

关键词流程不是一键自动调研。系统流程为：

```text
系统生成种子词
→ 人工用工具挖关键词
→ 上传多个 CSV / Excel
→ 程序内置脚本合并去重
→ AI + 规则清洗并打标
→ 写入总关键词数据库
→ 人工审核和分配
→ 适合现有页面的词进入页面修复
→ 未使用有效词进入超级聚类
```

## 2. 标准关键词字段

所有来源最终映射到统一字段：

```text
keyword
normalizedKeyword
volume
kd
cpc
intent
country
language
sourceTool
sourceFile
sourceSheet
seedGroup
competitorDomain
serpFeature
urlFromTool
rawRowJson
importBatchId
notes
```

最低要求：

```text
keyword 必填
sourceFile 必填
其他字段可空
```

## 3. 支持来源

第一阶段支持：

```text
Semrush Keyword Magic / Organic Research
Ahrefs Keywords Explorer / Organic Keywords
Google Keyword Planner
Google Search Console 查询导出，如用户有
People Also Ask / AlsoAsked 手工整理
Google Suggest 手工整理
手工 CSV
```

## 4. Semrush 字段映射

| Semrush 字段 | 标准字段 | 说明 |
|---|---|---|
| Keyword | keyword | 必填 |
| Volume | volume | 整数 |
| KD % / Keyword Difficulty | kd | 0-100 |
| CPC | cpc | 可空 |
| Intent | intent | 可保留原值 |
| SERP Features | serpFeature | 可序列化 |
| URL | urlFromTool | Organic Research 时可用 |
| Position | notes | 竞争对手排名可进入 notes |

## 5. Ahrefs 字段映射

| Ahrefs 字段 | 标准字段 | 说明 |
|---|---|---|
| Keyword | keyword | 必填 |
| Volume | volume | 整数 |
| KD | kd | 0-100 |
| CPC | cpc | 可空 |
| Traffic Potential | notes | 先放 notes |
| Parent Topic | seedGroup / notes | 可作为聚类参考 |
| URL | urlFromTool | 竞争对手页面 |

## 6. Google Keyword Planner 映射

| GKP 字段 | 标准字段 | 说明 |
|---|---|---|
| Keyword | keyword | 必填 |
| Avg. monthly searches | volume | 区间要保留原值，也可取中位估算 |
| Competition | kd / notes | 不等同于 SEO KD，不能直接当 KD |
| Top of page bid low/high | cpc / notes | 可保留 |

## 7. GSC 查询导出映射

| GSC 字段 | 标准字段 | 说明 |
|---|---|---|
| Query | keyword | 必填 |
| Clicks | notes | 保留 |
| Impressions | volume / notes | 不等同搜索量，可单独字段 impressions |
| CTR | notes | 保留 |
| Position | notes | 保留 |
| Page | urlFromTool | 可用于已有页面关键词线索 |

GSC 来源的词应优先用于现有页面修复，但仍需人工审核。

## 8. 手工 CSV 最低模板

```csv
keyword,volume,kd,cpc,intent,country,source_tool,source_sheet,seed_group,notes
custom metal parts supplier,320,18,,commercial,US,manual,seed_product,supplier_identity,
```

## 9. 批次导入规则

每次上传形成一个 importBatch：

```json
{
  "importBatchId": "batch_2026_06_09_001",
  "files": ["semrush.csv", "ahrefs.csv"],
  "targetMarket": "US",
  "language": "en",
  "createdAt": "",
  "createdBy": "user"
}
```

## 10. 机械清洗规则

程序内置脚本执行：

```text
去掉首尾空格
多个空格合并为一个
统一小写作为 normalizedKeyword
删除空 keyword
删除纯符号、明显乱码
保留原始 keyword
同 normalizedKeyword 合并为一条主记录
不同来源记录进入 sourceRecords 数组
```

## 11. 重复合并规则

同一个 normalizedKeyword 多次出现：

```json
{
  "keyword": "custom metal parts supplier",
  "sourceRecords": [
    {"sourceTool": "semrush", "volume": 320, "kd": 18},
    {"sourceTool": "ahrefs", "volume": 250, "kd": 12}
  ],
  "volumeStrategy": "max",
  "volume": 320,
  "kdStrategy": "min_non_empty",
  "kd": 12
}
```

默认规则：

```text
volume：取最大值，同时保留全部来源值
KD：取最小非空值，同时保留全部来源值
CPC：取最大非空值，同时保留全部来源值
Intent：不覆盖，保留为 sourceIntentRecords，等待 AI / 人工判断
```

## 12. AI + 规则清洗字段

AI 不直接删除关键词，只打标。

```json
{
  "isRelevant": true,
  "isBrandTerm": false,
  "isPlatformTerm": false,
  "isB2CTerm": false,
  "isLocalServiceTerm": false,
  "isCompetitorTerm": false,
  "isDuplicateIntent": false,
  "likelyIntent": "supplier_commercial",
  "likelyPageType": "product_line | product_detail | solution | application | capability | trust | blog | faq | case | reject",
  "buyerStage": "awareness | comparison | supplier_selection | rfq",
  "cleaningReason": "",
  "aiConfidence": 0.82
}
```

## 13. 常见排除标签

```text
irrelevant_non_b2b
b2c_shopping_intent
marketplace_intent
job_seeking
definition_only_low_value
too_broad
brand_only
competitor_brand
wrong_material
wrong_industry
```

排除标签不等于自动删除，用户可恢复。

## 14. 入库状态

入库初始状态：

```text
raw_imported → script_cleaned → ai_cleaned → pending_review
```

人工审核后才可进入：

```text
approved
rejected
duplicate_intent
hold
```

## 15. 分配状态

通过审核的词可进入：

```text
assigned_existing_page
unused_valid
new_page_candidate
content_candidate
faq_candidate
case_candidate
```

规则：

```text
适合现有页面 → assigned_existing_page
不适合现有页面但值得做 → unused_valid
低价值或不相关 → rejected
和已有词同意图 → duplicate_intent
需要后面再看 → hold
```

## 16. 未使用词池

超级聚类只读取：

```text
status = unused_valid
isRelevant = true
assignedUrl is null
not rejected
not duplicate_intent
```

不能对全部词库直接聚类。

## 17. 审核界面列建议

```text
keyword
volume
kd
sourceTool count
seedGroup
AI 相关性
AI 意图
AI 建议页面类型
人工意图
人工页面类型
分配 URL
状态
备注
```

## 18. 验收标准

```text
多个 CSV 上传后能合并成一个总词表。
重复词不会丢失来源记录。
AI 清洗只打标不删除。
所有关键词入库后默认 pending_review。
未审核关键词不能进入页面修复。
只有人工标记 unused_valid 的词才能进入超级聚类。
关键词分配到页面时必须保留人工备注。
```



---

# 17_AI提示词输入输出契约.md


# AI 提示词输入输出契约

> 版本：v0.2  
> 状态：开发前规格文档。  
> 适用范围：AI 工作台、Prompt Registry、Agent 执行层。

## 1. 总原则

AI 是协作执行层，不是自动发布器。所有 AI 输出必须满足：

```text
有明确输入上下文
有明确输出 JSON
有 Markdown 解释给用户看
有人工确认字段
有失败处理
不能自动写 WordPress
不能自动确认 MOQ、交期、证书、案例、产能等商业事实
```

## 2. Prompt Registry 数据结构

```json
{
  "promptId": "keyword-ai-cleaning-v1",
  "name": "关键词 AI 清洗",
  "category": "keyword",
  "version": "v1",
  "inputSchema": {},
  "outputSchema": {},
  "requiresHumanReview": true,
  "canCreateTasks": true,
  "canWriteWordPress": false,
  "status": "active"
}
```

## 3. 通用输入 Envelope

每次 AI 调用必须包装为：

```json
{
  "runId": "run_001",
  "promptId": "",
  "projectId": "",
  "siteId": "",
  "inputContext": {
    "projectProfile": {},
    "wordpressSnapshot": {},
    "b2bContext": {},
    "keywordRecords": [],
    "pageRecords": [],
    "evidenceRecords": [],
    "auditFindings": []
  },
  "userInstruction": "",
  "safetyBoundary": {
    "readOnly": true,
    "noAutoPublish": true,
    "commercialFactsNeedHumanConfirmation": true
  }
}
```

## 4. 通用输出 Envelope

```json
{
  "runId": "run_001",
  "promptId": "",
  "status": "success | partial | failed",
  "summaryMarkdown": "",
  "structuredOutput": {},
  "humanReviewRequired": true,
  "humanReviewItems": [],
  "taskCandidates": [],
  "warnings": [],
  "sourceObjectIds": [],
  "createdAt": ""
}
```

## 5. Prompt：WordPress 网站读取摘要 Agent

### 用途

把读取到的 WordPress 页面、产品、文章、媒体整理成用户看得懂的网站现状。

### 输入

```json
{
  "wordpressSnapshot": {},
  "pages": [],
  "posts": [],
  "products": [],
  "menus": [],
  "media": []
}
```

### 输出

```json
{
  "siteStructureSummary": "",
  "detectedPageTypes": [
    {"url": "", "pageType": "product_line", "confidence": 0.8}
  ],
  "importantPages": [],
  "missingCommonPages": [],
  "navigationIssues": [],
  "nextActions": []
}
```

## 6. Prompt：B2B 前台审计

### 用途

基于公开页面和 WordPress 只读数据做现有网站审计。

### 输入

```json
{
  "projectProfile": {},
  "wordpressSnapshot": {},
  "pageInventory": [],
  "forms": [],
  "seoMeta": []
}
```

### 输出

```json
{
  "overallAssessment": "",
  "findings": [
    {
      "findingId": "finding_001",
      "category": "b2b_information_architecture",
      "severity": "high",
      "url": "",
      "title": "",
      "description": "",
      "evidence": "",
      "recommendedAction": "",
      "requiresHumanReview": false
    }
  ],
  "taskCandidates": []
}
```

## 7. Prompt：B2B 上下文提取

### 用途

从用户上传的公司、产品线、证据资料中提取结构化事实。

### 输入

```json
{
  "uploadedDocs": [],
  "manualCompanyInfo": {},
  "existingWebsiteText": []
}
```

### 输出

```json
{
  "companyProfile": {},
  "productLines": [],
  "capabilities": [],
  "trustEvidence": [],
  "claimBoundaries": [],
  "missingInfo": [],
  "humanReviewItems": [
    {"claim": "Monthly capacity 100000 pcs", "reason": "Needs evidence before use"}
  ]
}
```

## 8. Prompt：种子词库生成

### 用途

根据网站现状、行业、产品线和上下文生成人工挖词起点。

### 输出

```json
{
  "seedGroups": [
    {
      "seedGroupId": "supplier_identity",
      "name": "供应商身份词",
      "seeds": ["metal parts manufacturer", "custom metal parts supplier"],
      "toolInstructions": "Use Semrush Keyword Magic and competitor organic keyword export."
    }
  ],
  "competitorResearchDirections": [],
  "manualMiningChecklist": []
}
```

## 9. Prompt：关键词 AI 清洗

### 用途

对脚本合并去重后的关键词打标，不删除。

### 输入

```json
{
  "projectProfile": {},
  "b2bContext": {},
  "keywordRecords": []
}
```

### 输出

```json
{
  "cleanedKeywords": [
    {
      "keywordId": "kw_001",
      "isRelevant": true,
      "likelyIntent": "supplier_commercial",
      "likelyPageType": "capability",
      "isB2CTerm": false,
      "isPlatformTerm": false,
      "cleaningReason": "Matches B2B supplier search intent.",
      "aiConfidence": 0.86
    }
  ],
  "warnings": []
}
```

## 10. Prompt：关键词页面分配助手

### 用途

辅助人工判断关键词是否适合现有页面。

### 输入

```json
{
  "keyword": {},
  "candidatePages": [],
  "auditFindings": [],
  "b2bContext": {}
}
```

### 输出

```json
{
  "recommendation": "assign | do_not_assign | new_page | content_engine | hold",
  "recommendedUrl": "",
  "reason": "",
  "riskNotes": [],
  "cannibalizationRisk": "low | medium | high",
  "humanDecisionRequired": true
}
```

## 11. Prompt：未使用关键词超级聚类

### 用途

只处理未使用有效词池，生成新页面和内容机会。

### 输入

```json
{
  "unusedValidKeywords": [],
  "existingPageMap": [],
  "b2bContext": {},
  "linkMap": []
}
```

### 输出

```json
{
  "clusters": [
    {
      "clusterId": "cluster_001",
      "clusterName": "OEM metal fabrication",
      "primaryKeyword": "oem metal fabrication supplier",
      "secondaryKeywords": [],
      "recommendedPageType": "capability",
      "recommendedAction": "new_page_task | content_engine_task | faq_task | hold",
      "reason": "No existing capability page can properly target this intent."
    }
  ],
  "taskCandidates": []
}
```

## 12. Prompt：页面修复包生成

### 用途

根据审计结果、已分配关键词和证据库生成页面优化包。

### 输出

```json
{
  "pageRepairPackage": {
    "url": "",
    "assignedKeywords": [],
    "keywordsNotToForce": [],
    "titleSuggestion": "",
    "metaDescriptionSuggestion": "",
    "h1Suggestion": "",
    "contentModulesToAdd": [],
    "internalLinksToAdd": [],
    "evidenceRequired": [],
    "ctaSuggestion": "",
    "humanReviewItems": []
  }
}
```

## 13. Prompt：Content Engine 交接包生成

### 用途

把内容候选任务转成 Content Engine 可执行上下文包。

### 输出

```json
{
  "handoffPackage": {
    "keywordTask": {},
    "targetPageType": "blog | guide | faq | case",
    "relatedPages": [],
    "internalLinkTargets": [],
    "evidenceContext": [],
    "brandVoice": {},
    "qaRules": [],
    "mustNotSay": []
  }
}
```

## 14. Prompt：QA 审查

### 用途

检查页面修复包、内容包是否违反关键词、事实、B2B 采购逻辑。

### 输出

```json
{
  "qaStatus": "pass | warning | fail",
  "hardFails": [],
  "warnings": [],
  "revisionTasks": [],
  "humanReviewItems": []
}
```

## 15. 失败处理

AI 失败时必须保存：

```json
{
  "runId": "",
  "status": "failed",
  "errorType": "invalid_json | missing_context | model_error | timeout",
  "retryable": true,
  "fallbackAction": "show_raw_markdown | ask_user_for_missing_context | manual_mode"
}
```

## 16. 验收标准

```text
每个 AI 执行都有 promptId 和 runId。
每个 AI 输出都有 JSON 结构和 Markdown 摘要。
AI 不直接删除关键词，只打标。
AI 不直接写 WordPress，只生成建议或任务。
商业事实相关输出必须进入人工确认队列。
失败输出不会覆盖原数据。
```



---

# 18_SEO审计问题分类与任务生成规则.md


# SEO 审计问题分类与任务生成规则

> 版本：v0.2  
> 状态：开发前规格文档。  
> 适用范围：SEO 诊断、任务中心、页面修复、证据补充。

## 1. 审计定位

审计必须发生在关键词分配前，用于理解现有 WordPress B2B 站的问题。审计结果在后续关键词审核分配后，才转化为最终页面修复包。

## 2. Finding 数据结构

```json
{
  "findingId": "finding_001",
  "source": "frontend_audit | wp_readonly_audit | ai_audit | manual",
  "category": "b2b_information_architecture",
  "severity": "critical | high | medium | low | info",
  "url": "https://example.com/products/",
  "pageId": "page_001",
  "title": "Product page lacks specifications",
  "description": "",
  "evidence": "",
  "impact": "",
  "recommendedAction": "",
  "requiresKeywordData": true,
  "requiresEvidence": false,
  "requiresHumanReview": false,
  "status": "open"
}
```

## 3. 审计问题分类

### 3.1 WordPress 读取与数据源

```text
wordpress_connection_failed
partial_sync
missing_pages_data
missing_products_data
seo_plugin_unavailable
acf_unavailable
media_read_failed
```

### 3.2 网站结构

```text
unclear_navigation
too_deep_page_structure
missing_product_line_entry
missing_solution_entry
missing_contact_entry
orphan_page
duplicate_page_structure
thin_page
empty_page
```

### 3.3 B2B 信息架构

```text
home_value_proposition_unclear
product_line_unclear
supplier_identity_unclear
target_customer_unclear
application_path_missing
solution_path_missing
capability_path_missing
trust_path_missing
```

### 3.4 页面级 SEO

```text
missing_title
weak_title
duplicate_title
missing_meta_description
weak_meta_description
missing_h1
multiple_confusing_h1
heading_structure_confusing
thin_content
outdated_content
```

### 3.5 产品 / 服务页面

```text
missing_product_specs
missing_material_info
missing_application_info
missing_custom_option
missing_moq_or_lead_time
missing_related_products
missing_product_inquiry_cta
product_pages_too_similar
image_only_product_page
```

### 3.6 信任与证据

```text
about_page_weak
factory_page_missing
qc_page_missing
certificate_page_missing
case_page_missing
claims_without_evidence
overclaim_risk
missing_download_assets
missing_process_explanation
```

### 3.7 转化路径

```text
cta_missing
cta_not_b2b
contact_path_too_deep
rfq_form_missing
form_fields_incomplete
no_product_context_in_form
file_upload_missing_when_needed
success_message_unclear
privacy_notice_missing
```

### 3.8 内链

```text
important_page_no_internal_links
blog_not_linking_commercial_pages
product_not_linking_solution
solution_not_linking_products
trust_page_not_linked
anchor_text_unclear
```

### 3.9 技术 SEO 基础

```text
robots_block_risk
sitemap_missing
canonical_missing
canonical_conflict
noindex_risk
404_found
redirect_chain
slow_page_risk
mobile_layout_risk
image_alt_missing
schema_missing
```

## 4. Severity 规则

```text
critical：会严重阻断抓取、索引、询盘或事实安全。
high：影响核心商业页面、核心产品线、主要转化路径。
medium：影响页面质量、内链、内容完整度，但不阻断主流程。
low：优化建议，不影响当前阶段推进。
info：提醒、观察项或需要后续数据确认。
```

示例：

```text
首页没有说明公司做什么 → high
所有页面 noindex → critical
产品页缺少 ALT → medium
FAQ 页面暂缺 → low 或 medium，取决于行业
```

## 5. 任务生成规则

每个 finding 不一定生成任务。生成任务前先判断：

```text
是否可执行
是否有明确对象
是否需要关键词审核后再处理
是否需要证据补充
是否只是提醒
```

## 6. Finding → Task 映射

| Finding 类型 | 任务类型 |
|---|---|
| missing_title / weak_title | page_repair |
| missing_product_specs | page_repair + evidence_request |
| claims_without_evidence | evidence_review |
| missing_product_inquiry_cta | conversion_repair |
| important_page_no_internal_links | internal_link_task |
| orphan_page | structure_repair |
| missing_solution_entry | new_page_candidate |
| missing_factory_page | evidence_page_candidate |
| keyword 相关风险 | 等关键词入库后再生成 keyword_assignment_task |

## 7. 延迟生成任务规则

这些 finding 先进入“待关键词数据确认”：

```text
页面定位可能错误
可能存在关键词蚕食
标题关键词不匹配
页面是否需要合并
页面是否需要新建
```

原因：关键词数据库还未审核，不能过早做最终判断。

## 8. 同页问题合并规则

同一个 URL 多个问题应合并为一个页面修复任务包，但保留原 finding。

```json
{
  "taskType": "page_repair",
  "url": "",
  "sourceFindingIds": ["finding_001", "finding_002"],
  "repairAreas": ["title", "content", "cta", "trust_evidence"]
}
```

## 9. 任务优先级规则

优先级分数：

```text
Priority Score = severityScore + pageImportance + conversionImpact + seoImpact + dataReadiness
```

建议权重：

```text
severityScore：critical 50 / high 30 / medium 15 / low 5
pageImportance：首页/产品线/RFQ 20，产品详情/解决方案 15，博客 5
conversionImpact：直接影响询盘 20，间接影响 10
seoImpact：影响索引/主词承接 20，一般页面 SEO 10
数据完整度：资料齐全 10，缺资料 0
```

## 10. 不生成任务的情况

```text
无法确认的问题，只生成提醒。
需要后台权限但当前无权限的问题，只生成数据源请求。
不属于站内 SEO 的问题，不生成任务。
外链、社媒、CRM、广告相关问题不生成任务。
供应商真假验证不生成任务。
```

## 11. 验收标准

```text
每个审计发现有 category、severity、url、evidence。
每个任务能追溯到 finding。
关键词相关修复不会在关键词审核前最终生成。
同一页面多个 finding 会合并为页面修复包。
系统不会把无法确认的问题写成确定结论。
```



---

# 19_任务中心与优先级规则.md


# 任务中心与优先级规则

> 版本：v0.2  
> 状态：开发前规格文档。  
> 适用范围：任务中心、页面修复、关键词审核、内容交接、QA。

## 1. 任务中心定位

任务中心不是简单待办列表，而是把审计、关键词、证据、页面修复、内容运营和交付串起来的执行枢纽。

它回答：

```text
现在最应该做什么
为什么要做
关联哪个页面 / 关键词 / 证据
需要谁确认
做完后进入哪里
```

## 2. Task 数据结构

```json
{
  "taskId": "task_001",
  "taskType": "page_repair",
  "title": "Repair product line page title and CTA",
  "description": "",
  "source": "audit | keyword | evidence | content | qa | delivery | system",
  "sourceObjectIds": [],
  "priority": "p0 | p1 | p2 | p3",
  "priorityScore": 75,
  "status": "todo",
  "relatedUrl": "",
  "relatedPageId": "",
  "relatedKeywordIds": [],
  "relatedEvidenceIds": [],
  "requiresHumanReview": true,
  "blockedReason": "",
  "acceptanceCriteria": [],
  "createdAt": "",
  "updatedAt": ""
}
```

## 3. 任务类型

```text
system_setup：项目 / 数据源 / WordPress 连接
site_reading：网站读取
site_audit：审计
keyword_import：关键词导入
keyword_cleaning：关键词清洗
keyword_review：关键词审核
keyword_assignment：关键词分配
page_repair：页面修复
new_page_candidate：新页面机会
evidence_request：证据补充
evidence_review：事实边界确认
internal_link_task：内链任务
content_engine_handoff：Content Engine 交接
qa_revision：QA 修改
delivery_export：交付导出
```

## 4. 任务状态机

```text
todo
→ in_progress
→ needs_review
→ approved
→ done
```

分支：

```text
todo → blocked
needs_review → revision_needed
revision_needed → in_progress
any → cancelled
any → archived
```

## 5. 优先级定义

```text
P0：阻断主流程或核心页面询盘 / 索引 / 事实安全的问题。
P1：影响核心页面 SEO、关键词承接、B2B 信任和主要转化。
P2：重要但不阻断当前阶段的优化。
P3：观察项、低优先级优化、后续扩展。
```

## 6. 优先级来源

任务优先级由以下因素叠加：

```text
审计 severity
页面重要性
关键词价值
是否直接影响询盘
是否已有足够资料可以执行
是否阻塞后续流程
```

## 7. 页面重要性等级

```text
core_conversion：首页、产品线页、核心产品页、RFQ/Contact、Custom/OEM
commercial_support：Solution、Application、Capability、QC、Certificate、Case
content_support：Blog、Guide、FAQ、Resource
utility：Privacy、Terms、普通标签页
```

## 8. 工作队列

任务中心应提供以下队列：

```text
今日优先
待人工确认
关键词待审核
页面待修复
证据待补充
内容待交接
QA 未通过
交付待导出
```

## 9. 任务详情页

每个任务详情必须展示：

```text
任务目标
为什么生成
关联页面
关联关键词
关联证据
AI 建议
人工确认项
验收标准
下一步动作
```

## 10. 任务与子系统关系

```text
SEO 诊断 → audit / page_repair / evidence_request
页面与关键词 → keyword_review / keyword_assignment / page_repair / content_engine_handoff
供应商可信度 → evidence_request / evidence_review
内容运营 → content_engine_handoff / qa_revision
交付中心 → delivery_export
AI 工作台 → 可生成候选任务，但必须人工确认
```

## 11. 任务生成限制

```text
未审核关键词不能生成页面关键词修复任务。
未确认商业事实不能生成“可发布”内容任务。
无法确认的问题只能生成数据补充任务。
不是站内 SEO 范围的问题不生成任务。
系统不得自动把任务执行到 WordPress。
```

## 12. 验收标准

```text
每个任务都能追溯来源。
每个任务都有明确状态。
每个 P0/P1 任务都有验收标准。
关键词任务不会跳过人工审核。
证据相关任务不会自动确认事实。
任务中心能按页面、关键词、来源、优先级筛选。
```



---

# 20_页面修复包示例.md


# 页面修复包示例

> 版本：v0.2  
> 状态：示例文档。  
> 用途：帮助 Codex 和产品设计理解页面修复任务的颗粒度。

## 1. 示例项目

```text
网站类型：WordPress B2B 工贸一体站
行业：Industrial Air Filtration
目标市场：United States
核心产品线：filter bags, dust collector cartridges, filter cages
主转化目标：Request a Quote
```

## 2. 示例页面

```text
URL：https://example.com/products/high-temperature-filter-bags/
页面类型：产品详情页
当前页面标题：High Temperature Filter Bags
当前问题：内容薄、参数不足、缺少应用场景、CTA 弱、没有 QC / 证据链接
```

## 3. 审计发现

```json
[
  {
    "findingId": "finding_101",
    "category": "missing_product_specs",
    "severity": "high",
    "description": "Product page lacks material, temperature range and application parameters."
  },
  {
    "findingId": "finding_102",
    "category": "missing_product_inquiry_cta",
    "severity": "high",
    "description": "No clear Request a Quote CTA near product information."
  },
  {
    "findingId": "finding_103",
    "category": "trust_page_not_linked",
    "severity": "medium",
    "description": "Page does not link to QC or manufacturing capability evidence."
  }
]
```

## 4. 已审核并适合本页的关键词

```text
primary keyword：high temperature filter bags
secondary keywords：
- industrial high temperature filter bag
- high temperature dust collector filter bags
- pps filter bag for dust collector
```

这些词与页面产品主题、B2B 采购意图、产品参数均匹配，可以植入。

## 5. 不适合强行植入的关键词

```text
baghouse filter bag manufacturer
custom dust collector filter supplier
industrial filtration system supplier
```

原因：

```text
baghouse filter bag manufacturer 更适合产品线页或供应商能力页
custom dust collector filter supplier 更适合 Custom / OEM 能力页
industrial filtration system supplier 过宽，可能需要 Solution 或 Capability 页面
```

规则：不适合本页的词不强行植入，回到未使用词池或分配给更合适页面。

## 6. 页面修复包 JSON 示例

```json
{
  "repairPackageId": "repair_001",
  "url": "https://example.com/products/high-temperature-filter-bags/",
  "pageType": "product_detail",
  "sourceFindingIds": ["finding_101", "finding_102", "finding_103"],
  "assignedKeywords": [
    "high temperature filter bags",
    "industrial high temperature filter bag",
    "high temperature dust collector filter bags",
    "pps filter bag for dust collector"
  ],
  "keywordsNotToForce": [
    "baghouse filter bag manufacturer",
    "custom dust collector filter supplier"
  ],
  "titleSuggestion": "High Temperature Filter Bags for Industrial Dust Collectors",
  "metaDescriptionSuggestion": "Custom high temperature filter bags for industrial dust collection. Available materials include PPS, PTFE and fiberglass with RFQ support for size, temperature and application requirements.",
  "h1Suggestion": "High Temperature Filter Bags for Dust Collector Systems",
  "modulesToAdd": [
    {
      "module": "Product Specification Table",
      "fields": ["Material", "Temperature Range", "Diameter", "Length", "Finish", "Application", "MOQ", "Lead Time"]
    },
    {
      "module": "Applications",
      "items": ["Cement plants", "Steel plants", "Asphalt mixing", "Waste incineration"]
    },
    {
      "module": "Customization Options",
      "items": ["Size", "Material", "Surface treatment", "Top/bottom construction"]
    },
    {
      "module": "Quality Control Note",
      "requiresEvidence": true
    },
    {
      "module": "Request a Quote CTA",
      "placement": "after specs and bottom of page"
    }
  ],
  "internalLinksToAdd": [
    {"targetUrl": "/quality-control/", "anchor": "quality control process"},
    {"targetUrl": "/custom-filter-bags/", "anchor": "custom filter bag manufacturing"},
    {"targetUrl": "/contact/", "anchor": "request a quote"}
  ],
  "evidenceRequired": [
    "material data sheet or product specification source",
    "factory or QC image if quality claim is used",
    "MOQ / lead time confirmation"
  ],
  "humanReviewItems": [
    "Confirm maximum temperature range before publishing.",
    "Confirm whether PPS/PTFE/fiberglass materials are actually supplied.",
    "Confirm MOQ and lead time."
  ],
  "writeBoundary": "dry_run_only"
}
```

## 7. 用户可见修复建议

### 建议 Title

```text
High Temperature Filter Bags for Industrial Dust Collectors
```

### 建议 Meta Description

```text
Custom high temperature filter bags for industrial dust collection. Available materials include PPS, PTFE and fiberglass with RFQ support for size, temperature and application requirements.
```

### 建议 H1

```text
High Temperature Filter Bags for Dust Collector Systems
```

## 8. 建议新增页面模块

```text
1. 首屏：一句话说明产品 + RFQ CTA
2. 规格表：材料、温度范围、尺寸、应用、MOQ、交期
3. 应用场景：水泥、钢铁、沥青、焚烧等
4. 定制说明：尺寸、材料、处理方式、结构
5. 质量控制：检测流程或材料确认
6. 相关产品：filter cages / dust collector cartridges
7. CTA：Request a Quote
```

## 9. 交付时不要输出什么

```text
不要写未确认的最高温度
不要写未确认的证书
不要写 guaranteed lifetime
不要写 best / cheapest / number one supplier
不要把 manufacturer 词强塞进产品详情页
不要自动改 WordPress
```

## 10. 验收标准

```text
页面主题没有偏离产品详情。
适合本页的关键词已自然覆盖。
不适合本页的关键词没有强行植入。
B2B 采购信息比原页面更完整。
所有商业事实都列出人工确认项。
内链指向产品线、能力页、QC、Contact。
输出是 dry-run 页面修复包，不是自动发布结果。
```



---

# 21_Demo项目完整工作流样例.md


# Demo 项目完整工作流样例

> 版本：v0.2  
> 状态：示例文档。  
> 用途：用于产品理解、前端 Demo、测试验收。

## 1. Demo 项目设定

```text
项目名称：AeroFilter B2B SEO Demo
域名：https://demo-aerofilter.test
CMS：WordPress + Elementor + WooCommerce 询盘模式
行业：Industrial Air Filtration
目标市场：United States
客户类型：工贸一体 B2B 供应商
主转化目标：Request a Quote
```

## 2. S0 项目接入

用户输入：

```text
域名：demo-aerofilter.test
行业：Industrial Air Filtration
目标市场：United States
公司类型：工贸一体
核心产品线：filter bags, filter cartridges, filter cages
当前问题：网站页面多，但 SEO 和关键词混乱，询盘少
```

系统输出：

```text
project-profile.json
connection-status.json
first-run-scope.md
```

前端显示：项目总览进度停在“待读取 WordPress”。

## 3. S1 WordPress 网站读取

系统读取到：

```text
页面 18 个
文章 24 篇
产品 36 个
产品分类 5 个
媒体 240 个
Contact 页面 1 个
About 页面 1 个
QC 页面缺失
Certificate 页面缺失
```

输出：

```text
wp-site-snapshot.json
page-inventory.json
current-url-map.json
media-alt-status.json
current-trust-pages.json
```

前端显示：页面地图和网站结构树。

## 4. S2 现有网站审计

审计发现：

```text
首页首屏价值主张不清楚
产品页多数缺少规格表
About 页面很空
没有 QC / Certificates 页面
部分产品页没有 RFQ CTA
Blog 和产品页几乎没有内链
图片 ALT 缺失率 72%
```

系统生成初始任务：

```text
补产品页规格信息
补信任页面
补 CTA
补内链
补图片 ALT
```

注意：此时不做关键词植入。

## 5. S3 建立 B2B 上下文与证据库

用户上传：

```text
公司介绍
产品目录 PDF
filter bags 规格表
QC 流程图片
工厂照片
两份检测报告
```

AI 提取后生成：

```text
company-profile.json
product-line-record.json
capability.json
trust-evidence.json
claim-boundary.json
```

人工确认：

```text
可写：OEM sizing, PPS/PTFE material options, 15-day sample lead time
需确认：monthly capacity, ISO certificate scope
不能写：guaranteed 5-year lifespan
```

## 6. S4 生成种子词库

系统生成 seed groups：

```text
filter bag product terms
filter cartridge product terms
supplier identity terms
custom / OEM terms
material terms
application terms
QC / certificate terms
procurement question terms
competitor research directions
```

用户拿这些种子词去外部工具挖词。

## 7. S5 人工关键词挖掘

用户上传：

```text
semrush_filter_bags.csv
ahrefs_competitor_keywords.csv
gkp_industrial_filter_terms.csv
paa_questions.csv
```

## 8. S6 程序内置关键词清洗

脚本执行：

```text
合并 4 个文件
去重
统一小写
保留 sourceRecords
合并 volume / KD
输出 keyword-master-raw
```

AI 清洗：

```text
标记 B2C 词
标记平台词
标记无关材料词
初判搜索意图
初判页面类型
```

输出：

```text
keyword-master-cleaned
```

## 9. S7 总关键词数据库入库

关键词状态：

```text
pending_review：680 个
疑似 B2C：72 个
疑似平台词：41 个
疑似相关 B2B 词：420 个
```

## 10. S8 人工审核与关键词分配

用户审核后：

```text
分配到现有产品线页：42 个
分配到现有产品详情页：78 个
排除：120 个
重复意图：90 个
未使用有效词：210 个
保留观察：140 个
```

示例：

```text
high temperature filter bags → 分配给 /products/high-temperature-filter-bags/
baghouse filter bag manufacturer → 不适合产品详情页，标记未使用有效词
filter bag replacement guide → 标记内容候选
```

## 11. S9 现有页面修复

系统结合审计 + 已分配关键词生成页面修复包：

```text
/products/high-temperature-filter-bags/
/products/dust-collector-filter-cartridges/
/products/filter-cages/
/about-us/
/contact/
```

每个修复包包含：

```text
Title / Meta / H1 建议
适合植入关键词
不适合强行植入关键词
新增内容模块
内链建议
证据需求
人工确认项
```

## 12. S10 未使用关键词超级聚类

输入只有未使用有效词 210 个。

聚类结果：

```text
Custom Filter Bag Manufacturing → 建议新 Capability 页
Baghouse Filter Bag Supplier → 建议产品线 / 供应商页
Filter Bag Material Comparison → Content Engine Guide
How to Choose Dust Collector Filter Bags → Content Engine Guide
Filter Bags for Cement Plants → Application 页面
```

## 13. S11 新页面 / 内容任务生成

系统区分：

```text
商业页面任务：Custom Filter Bag Manufacturing, Cement Plant Filter Bags
内容任务：Material Comparison, Buying Guide, FAQ
```

## 14. S12 Content Engine 交接

对于 Guide 类任务生成 handoff：

```text
目标关键词
搜索意图
目标页面类型
相关产品页
相关内链目标
证据素材
品牌语言
QA 规则
mustNotSay
```

Content Engine 执行内容 brief、大纲、正文、QA、HTML 和发布前审查包。

## 15. S13 QA 与交付

QA 检查：

```text
是否虚构证书
是否夸大交期
是否强行植入关键词
是否缺内链
是否缺 CTA
是否违反 B2B 采购逻辑
```

交付输出：

```text
页面修复包 ZIP
关键词地图导出
Content Engine handoff 包
QA 报告
下一轮任务清单
```

## 16. S14 持续监控

监控项：

```text
GSC 收录
核心页面曝光
关键词状态
页面修复进度
询盘来源页面
下一轮未使用词池
```

## 17. Demo 验收点

```text
系统能从 WordPress 读取现有网站。
审计先于关键词分配。
关键词导入经过脚本清洗和 AI 打标。
关键词先进入总词库 pending_review。
人工审核后才分配页面。
只有未使用有效词进入超级聚类。
页面修复不强塞不适合关键词。
Content Engine 只处理内容生产，不接管 OS。
```



---

# 22_现有代码模块与新版SOP对照表.md


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



---

# 23_本地数据安全与权限边界.md


# 本地数据安全与权限边界

> 版本：v0.2  
> 状态：开发前规格文档。  
> 适用范围：本地优先 B2B SEO OS、WordPress 只读、AI / Agent 执行。

## 1. 总原则

系统处理的是客户 WordPress 网站、关键词数据、公司资料、产品线、证书、案例、能力说明和内容生产上下文。必须默认本地优先、最小权限、只读优先。

## 2. 数据分类

### 2.1 普通项目数据

```text
域名
行业
目标市场
页面 URL
公开页面内容
公开图片 URL
公开 SEO 标题 / 描述
```

### 2.2 商业敏感数据

```text
MOQ
交期
产能
价格区间
供应链能力
客户案例
出口市场
未公开产品资料
产品规格表
```

### 2.3 高敏感数据

```text
WordPress 凭据
API Key
Application Password
客户邮箱
询盘内容
未公开证书
未公开合同
真实客户名称
内部成本
```

## 3. 本地存储原则

```text
workspace/ 保存项目运行数据
.env 保存密钥和凭据
exports/ 保存交付包
logs/ 保存运行日志，但不得记录密钥
```

不得把以下内容写入 Git：

```text
workspace/
.env
exports/
客户上传原始文件
WordPress 凭据
AI API Key
真实客户询盘数据
```

## 4. WordPress 权限边界

第一阶段只允许：

```text
读取 Pages
读取 Posts
读取 Products
读取 Media
读取 SEO meta
读取 Taxonomies
读取公开前台 HTML
```

禁止：

```text
create/update/delete page
publish post
upload media
modify plugin settings
modify menu
modify form
change SEO plugin fields
submit real inquiry
```

## 5. AI 请求边界

AI 请求前必须判断是否包含敏感信息。

默认允许发送：

```text
公开页面内容
关键词
页面标题
公开产品描述
公开公司介绍
```

需要用户确认后才可发送：

```text
未公开产品规格
MOQ / 交期 / 产能
证书文件内容
客户案例细节
内部文档
```

默认不发送：

```text
WordPress 凭据
API Key
客户邮箱
真实询盘内容
内部成本
合同
```

## 6. AI 输出事实边界

AI 不得自动确认：

```text
证书是否真实
客户案例是否真实
产能是否真实
交期是否真实
MOQ 是否真实
工厂是否真实
质量承诺是否成立
```

AI 只能输出：

```text
基于已提供资料，可以这样表达
该声明需要证据
该说法风险较高
建议人工确认
```

## 7. 日志规则

日志允许记录：

```text
运行时间
模块名称
成功 / 失败
错误类型
文件名
对象 ID
```

日志不得记录：

```text
API Key
WordPress 密码
Application Password
完整客户询盘内容
完整证书内容
隐私邮箱列表
```

## 8. 导出包规则

交付包默认包含：

```text
页面修复建议
关键词地图导出
Content Engine handoff
QA 报告
任务完成记录
```

交付包默认不包含：

```text
WordPress 凭据
AI API Key
系统日志
客户原始敏感资料
未使用的内部备注
```

如果需要导出证据文件，必须由用户明确选择。

## 9. 权限状态展示

设置 / 系统状态页必须展示：

```text
WordPress 权限状态
AI Key 配置状态
本地 workspace 路径
最近一次读取时间
最近一次 AI 调用时间
当前是否只读模式
是否存在敏感文件
```

## 10. 失败与回滚

因为第一阶段不写 WordPress，不需要站点回滚。需要的是本地数据版本管理：

```text
每次 WordPress 读取生成 snapshot
每次关键词导入生成 importBatch
每次 AI 输出生成 runId
每次页面修复包生成版本号
```

## 11. 人工确认强制点

以下动作必须人工确认：

```text
关键词正式分配到页面
页面修复包标记通过
证据声明可用于内容
Content Engine handoff 可执行
QA 放行
交付包导出
任何未来 WordPress 写入动作
```

## 12. 验收标准

```text
密钥不进入 Git。
导出包不包含凭据。
日志不包含敏感值。
AI 输出不能自动确认商业事实。
系统默认只读。
所有高风险动作有人工确认。
```



---

# CHANGELOG_v0.2.md


# CHANGELOG v0.2

## 新增文档

```text
14_前端逐页布局与交互说明.md
15_WordPress只读同步字段契约.md
16_关键词CSV导入字段映射与清洗规则.md
17_AI提示词输入输出契约.md
18_SEO审计问题分类与任务生成规则.md
19_任务中心与优先级规则.md
20_页面修复包示例.md
21_Demo项目完整工作流样例.md
22_现有代码模块与新版SOP对照表.md
23_本地数据安全与权限边界.md
```

## 新增模板

```text
templates/wp-page-record-template.json
templates/wordpress-snapshot-template.json
templates/task-record-template.json
templates/ai-prompt-contract-template.json
templates/seo-audit-category-template.json
templates/frontend-workspace-spec-template.json
```

## v0.2 核心补充

```text
补齐前端逐页交互规格。
补齐 WordPress 只读字段契约。
补齐关键词 CSV 导入映射和清洗规则。
补齐 AI Prompt 输入输出契约。
补齐审计 finding 到任务的生成规则。
补齐任务中心状态与优先级。
补齐页面修复包示例和 Demo 工作流。
补齐现有代码模块迁移对照。
补齐本地安全与权限边界。
```
