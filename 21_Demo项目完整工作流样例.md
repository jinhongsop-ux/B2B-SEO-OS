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
