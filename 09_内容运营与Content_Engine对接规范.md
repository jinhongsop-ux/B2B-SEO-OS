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
