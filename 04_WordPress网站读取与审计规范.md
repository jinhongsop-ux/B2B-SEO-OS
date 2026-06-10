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
