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
