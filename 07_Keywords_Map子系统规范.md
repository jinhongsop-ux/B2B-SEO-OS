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
