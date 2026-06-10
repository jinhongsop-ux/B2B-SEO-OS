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
