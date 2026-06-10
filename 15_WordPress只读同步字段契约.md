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
