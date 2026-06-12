# D0-D8 执行手册 与 S0-S14 系统工作流 融合映射

> 版本：v1.0
> 状态：产品规划文档
> 适用范围：B2B SEO OS — 将 D0-D8 人机协作 SOP 融入 S0-S14 系统管理化工作流

---

## 一、概览

### 1.1 两套体系的定位

| 维度 | D0-D8（doc2 / 执行手册） | S0-S14（doc1 / 系统工作流） |
|------|--------------------------|---------------------------|
| 本质 | 人机协作 SOP + Prompt 驱动 | 系统管理化工作流 + AgentTaskPack 驱动 |
| 执行者 | 人工 + ChatGPT/Claude 对话 | 系统生成任务包 → 外部智能体执行 → 回填 → 审核 |
| 数据沉淀 | 聊天记录、手动导出 | ProjectKnowledgeBase + Artifact + HumanReview |
| 产出物 | business-model.json、knowledge-b2b.json、keyword CSV 等 | PromptTemplate、AgentTaskPack、Artifact、结构化数据 |
| 状态管理 | 人工记忆 + 文档 | WorkflowState 自动推进 |
| 审核机制 | 人工在对话中判断 | HumanReview Gate 结构化审核 |

### 1.2 融合目标

将 D0-D8 的**内容深度**（业务定位、行业认知、品牌证据、关键词策略、产品线框架、方案内容、信任体系、监控报告）注入 S0-S14 的**系统骨架**（任务包生成、Artifact 回填、审核门禁、知识库沉淀、工作流推进），实现：

1. **D-stage 内容** 变成 **S-stage AgentTaskPack 模板**
2. **D-stage 数据对象** 变成 **ProjectKnowledgeBase 字段**
3. **D-stage 人工检查项** 变成 **HumanReview checklist**
4. **D-stage Prompt** 变成 **PromptTemplate 注册表条目**

### 1.3 融合原则

```text
1. S0-S14 系统骨架不变，D0-D8 内容作为"血肉"注入。
2. D-stage Prompt 不直接执行，而是包装为 AgentTaskPack 由外部智能体执行。
3. D-stage 数据对象必须经过 Artifact 导入 → 校验 → 人工审核 → 写入 KnowledgeBase。
4. D-stage 中已有的人工检查项，直接映射到 HumanReview.checkedItems。
5. D0-D8 中不涉及 S-stage 的内容（如 D0 的技术选型建议），作为辅助信息保留。
```

---

## 二、完整映射总表

| D-Stage | S-Stage | 融合方式 | 需合并的数据对象 | 人工检查项来源 | Prompt 状态 |
|---------|---------|---------|-----------------|---------------|------------|
| D0 业务定位与技术栈 | S0 项目接入 | D0 输入字段注入 ProjectProfile；D0a 输出转为 ProjectProfile 补充字段 | business-model.json, lead-goal.json → ProjectProfile; site-architecture → ProjectProfile.knownImportantPages | D0 能力边界红线 → S0 HumanReview checklist | d0a 需新模板；d0b 需新模板 |
| D1 行业与采购认知 | S3 B2B 上下文 | D1 行业认知输出注入 B2BContext.industryKnowledge | knowledge-b2b.json, procurement-map → B2BContext | D1 采购决策链确认 → S3 HumanReview checklist | d1a, d1b 需新模板 |
| D2 品牌与供应商品牌 | S3 B2B 上下文 | D2 品牌定位、语音、能力、证据分别注入 B2BContext 子对象 | company-profile, brand-voice-b2b, capability, trust-evidence → B2BContext | D2 mustSay/mustNotSay → S3 HumanReview checklist | d2a, d2b, d2c 需新模板 |
| D3 SEO 关键词与页面架构 | S4 种子词 + S5 挖词 + S8 分配 | D3 种子词计划 → S4 SeedKeywordPlan；D3 聚类逻辑 → S8 分配建议；D3 内链计划 → S9 修复建议 | seed-keyword-plan → SeedKeywordGroup; keyword-clustering → KeywordAssignments; links.json → PageRepairPackage | D3 关键词分配确认 → S8 HumanReview checklist | d3-0 需新模板；d3 需新模板 |
| D4 产品线与能力页 | S3 证据库 + S9 页面修复 | D4 产品线记录 → S3 product-line-record；D4 数据包 → S9 PageRepairPackage 输入 | product-line-record → B2BContext.productLines; page-data-pack → PageRepairPackage.modulesToAdd | D4 产品信息确认 → S3 + S9 HumanReview | d4a, d4c, d4d 需新模板 |
| D5 方案中心建设 | S10 聚类 + S11 新页面任务 | D5 Solution Hub 内容规划 → S10 unused-keyword-super-clustering 输出的 solution_hub 类任务 | solution-hub-plan → ContentOpportunities | D5 方案页定位确认 → S11 HumanReview | d5a, d5b 需新模板 |
| D6 信任与转化体系 | S2 审计 + S9 页面修复 | D6 信任审计 → S2 trust-gap-findings 扩展；D6 信任页生成 → S9 修复任务 | trust-evidence → AuditFinding(trust_gap); trust-page-generator → PageRepairPackage | D6 信任声明确认 → S2 + S9 HumanReview | d6a 需新模板；d6b 需新模板 |
| D7 内容工厂 | S12 Content Engine 交接 | D7 内容体系 → S12 handoff 包；D7 文章生产 → S12 brief → outline → draft 流程 | content-system → ContentHandoffPackage | D7 内容 QA → S12 + S13 HumanReview | d7 需新模板 |
| D8 SEO+Lead 监控 | S14 持续监控 | D8 报告结构 → S14 MonitoringReport 模板 | seo-lead-report → MonitoringReport | D8 数据确认 → S14 HumanReview | d8 需新模板 |

---

## 三、逐阶段详细融合

### 3.1 S0 项目接入 ← D0 业务定位与技术栈

**S-stage 描述：** 建立项目档案，确认 WordPress B2B 站，确认本轮执行范围。输出 ProjectProfile、connection-status、first-run-scope。

**D-stage 输入：**
- D0a 业务定位 Prompt：行业、目标市场、供应链身份、OEM/ODM、证书、案例、产品
- D0b 站点架构 Prompt：页面优先级（P0/P1/P2）、转化路径、技术方案

**融合方法：**

| D0 输出 | ProjectKnowledgeBase 目标字段 | 融合方式 |
|---------|------------------------------|---------|
| 站点类型判断（Factory/Trading/OEM） | `ProjectProfile.supplierIdentity` | D0a 输出自动填充，人工确认 |
| 目标客户与采购角色 | `ProjectProfile.targetCustomers` | D0a 输出列表，人工审核 |
| 核心转化目标 | `ProjectProfile.primaryConversionGoal` | D0a 输出主/次转化目标 |
| 价值主张初判 | `ProjectProfile` 扩展字段 `valueProposition` | 新增字段 |
| 能力边界与风险红线 | `B2BContext.claimBoundaries`（预填） | D0a 输出灌入 S3 初始值 |
| 建站优先级 P0/P1/P2 | `ProjectProfile.knownImportantPages` | D0b 输出页面清单 |
| 技术方案建议 | 辅助信息，不入库 | 仅作为 Tutorial 提示 |

**新增 HumanReview 检查项：**
- [ ] 确认供应链身份判断是否准确
- [ ] 确认主转化目标选择
- [ ] 确认能力边界红线
- [ ] 确认页面优先级排序

**Prompt 模板映射：**

| D0 Prompt 文件 | PromptTemplate ID | Task Pack Category |
|---------------|-------------------|-------------------|
| `d0a-business-positioning.md` | `d0a_business_positioning_v1` | `project_setup` |
| `d0b-site-architecture.md` | `d0b_site_architecture_v1` | `project_setup` |

---

### 3.2 S1 WordPress 网站读取

**S-stage 描述：** 读取现有网站结构，形成 SiteReadSnapshot。不判断好坏。

**D-stage 对应：** D0-D8 中无直接对应阶段。D0 的站点架构是"理想架构"，S1 是"实际读取"。

**融合方法：** S1 保持原系统逻辑不变。D0 的 `site-architecture` 输出仅作为 S1 AgentTaskPack 的 `knownImportantPages` 参考，帮助系统识别重要页面。

**D0 数据注入 S1：**
- `D0b.knownImportantPages` → `AgentTaskPack.inputContext.knownImportantPages`
- `D0a.supplierIdentity` → `AgentTaskPack.inputContext.supplierIdentity`（辅助页面类型识别）

---

### 3.3 S2 现有网站审计 ← D6a 信任与转化审计

**S-stage 描述：** 先判断现有网站问题，再做关键词流程。输出 audit-findings、trust-gap-findings、conversion-gap-findings、technical-findings。

**D-stage 输入：**
- D6a 信任与转化审计 Prompt：10 个诊断维度（身份可信度、产品参数完整度、OEM 能力、QC 证据、证书风险、案例可信度、转化路径、页脚政策、廉价感、SEO 意图匹配）

**融合方法：**

| D6a 诊断维度 | S2 AuditFinding.category 扩展 | 融合方式 |
|-------------|------------------------------|---------|
| 公司身份可信度 | `trust_gap` → 细化 `company_identity_trust` | D6a 维度注入 S2 审计 Prompt |
| 产品线与参数完整度 | `missing_product_specs` | 直接映射 |
| 定制/OEM 能力表达 | `custom_capability_unclear` | 新增 category |
| 质量控制与证据 | `trust_gap` → `qc_evidence_missing` | 细化 |
| 证书/合规声明风险 | `overclaim_risk` | 直接映射 |
| 案例与应用场景可信度 | `case_credibility_risk` | 新增 category |
| 转化路径 | `cta_missing`, `cta_not_b2b`, `contact_path_too_deep` | 直接映射 |
| 页脚政策完整度 | `footer_completeness` | 新增 category |
| 文案廉价感 | `content_quality` → `copywriting_risk` | 细化 |
| SEO 意图匹配 | `page_keyword_mismatch` | 新增 category |

**D6a 扩展输出（合并到 S2 输出）：**

| D6a 输出 | S2 目标对象 | 融合方式 |
|---------|------------|---------|
| 虚假与高风险声明排查 | `AuditFinding(overclaim_risk)` | 每条声明生成一个 Finding |
| 缺失信任页面清单 | `AuditFinding(trust_page_missing)` | 每个缺失页生成一个 Finding |
| 询盘路径诊断 | `AuditFinding(conversion_gap)` | 直接映射 |
| 当天修复待办 | `initial-repair-suggestions.json` 扩展 | 注入优先级为 critical/high 的建议 |

**新增 HumanReview 检查项：**
- [ ] 确认高风险声明是否属实
- [ ] 确认缺失页面优先级
- [ ] 确认转化路径诊断准确性

**Prompt 模板映射：**

| D Prompt 文件 | PromptTemplate ID | Task Pack Category |
|--------------|-------------------|-------------------|
| `d6a-trust-conversion-audit.md` | `d6a_trust_conversion_audit_v1` | `site_audit` |

---

### 3.4 S3 B2B 上下文与证据库 ← D1 + D2 + D4a

**S-stage 描述：** 把客户公司、产品线、能力、证据、事实边界结构化。输出 company-profile、product-line-record、capability、trust-evidence、brand-voice-b2b、claim-boundary。

**D-stage 输入：**
- D1a 行业认知 Prompt：行业背景、采购链、买家角色、决策因素
- D1b 品类知识 Prompt：产品分类、技术参数、材料、应用场景
- D2a 品牌定位 Prompt：品牌核心定位、差异化价值
- D2b 品牌语言 Prompt：语气、用词、禁用表达
- D2c 能力与证据 Prompt：工厂、QC、证书、案例、交期、MOQ
- D4a 产品线记录 Prompt：产品线结构、规格、材料、应用

**融合方法：**

| D-Stage 输出 | ProjectKnowledgeBase 字段 | 融合方式 |
|-------------|--------------------------|---------|
| D1a 行业背景与采购链 | `B2BContext.industryKnowledge` (新增) | 新增子对象 |
| D1a 买家角色 | `B2BContext.buyerPersonas` (新增) | 新增子对象 |
| D1a 采购决策因素 | `B2BContext.procurementFactors` (新增) | 新增子对象 |
| D1b 产品技术参数 | `B2BContext.productSpecifications` | 注入 productLines |
| D2a 品牌定位 | `B2BContext.companyProfile.positioning` | 直接映射 |
| D2a 差异化价值 | `B2BContext.companyProfile.coreValuePropositions` | 直接映射 |
| D2b 品牌语言 | `B2BContext.brandVoice` | 直接映射 |
| D2b mustSay | `B2BContext.companyProfile.mustSay` | 直接映射 |
| D2b mustNotSay | `B2BContext.companyProfile.mustNotSay` | 直接映射 |
| D2c 工厂/QC/证书/案例 | `B2BContext.trustEvidence` | 直接映射 |
| D2c 能力边界 | `B2BContext.claimBoundaries` | 直接映射 |
| D4a 产品线记录 | `B2BContext.productLines` | 直接映射 |

**S3 B2BContext 扩展后的完整结构：**

```json
{
  "companyProfile": { ... },
  "productLines": [ ... ],
  "capabilities": { ... },
  "trustEvidence": { ... },
  "brandVoice": { ... },
  "claimBoundaries": [ ... ],
  "industryKnowledge": {
    "industryBackground": "",
    "supplyChainPosition": "",
    "marketSize": "",
    "trends": []
  },
  "buyerPersonas": [
    {
      "role": "",
      "companyType": "",
      "procurementGoal": "",
      "coreConcerns": [],
      "triggerPoints": []
    }
  ],
  "procurementFactors": {
    "decisionChain": [],
    "evaluationCriteria": [],
    "commonQuestions": []
  }
}
```

**新增 HumanReview 检查项：**
- [ ] 确认行业认知准确性
- [ ] 确认买家角色列表
- [ ] 确认品牌定位与语言
- [ ] 确认 mustSay / mustNotSay
- [ ] 确认证书/案例/MOQ/产能/交期事实
- [ ] 确认产品线规格

**Prompt 模板映射：**

| D Prompt 文件 | PromptTemplate ID | Task Pack Category |
|--------------|-------------------|-------------------|
| `d1a-industry-cognition.md` | `d1a_industry_cognition_v1` | `b2b_context` |
| `d1b-category-knowledge.md` | `d1b_category_knowledge_v1` | `b2b_context` |
| `d2a-brand-positioning.md` | `d2a_brand_positioning_v1` | `b2b_context` |
| `d2b-brand-voice.md` | `d2b_brand_voice_v1` | `b2b_context` |
| `d2c-capability-evidence.md` | `d2c_capability_evidence_v1` | `b2b_context` |
| `d4a-product-line-record.md` | `d4a_product_line_record_v1` | `b2b_context` |

---

### 3.5 S4 种子词库生成 ← D3 种子词计划

**S-stage 描述：** 根据网站现状、产品线、行业、目标市场、审计发现，生成用于人工挖词的种子词。

**D-stage 输入：**
- D3-0 种子词计划 Prompt：8 个模块 — 产品词矩阵、身份词矩阵、OEM/ODM 词矩阵、应用行业词矩阵、材料/工艺/认证词矩阵、采购问题词、竞品反查清单、工具执行清单

**融合方法：**

| D3 模块 | S4 SeedKeywordGroup 类型 | 融合方式 |
|--------|-------------------------|---------|
| 模块 1：核心产品词 | `seedGroupType: "core_product"` | 直接映射 |
| 模块 2：供应商身份词 | `seedGroupType: "supplier_identity"` | 直接映射 |
| 模块 3：OEM/ODM 词 | `seedGroupType: "custom_oem"` | 直接映射 |
| 模块 4：应用行业词 | `seedGroupType: "application_industry"` | 直接映射 |
| 模块 5：材料/工艺/认证词 | `seedGroupType: "material_process_certification"` | 直接映射 |
| 模块 6：采购问题词 | `seedGroupType: "procurement_question"` | 直接映射 |
| 模块 7：竞品反查清单 | `competitorResearchDirections` | 直接映射 |
| 模块 8：工具执行清单 | `manualMiningChecklist` | 直接映射 |

**S4 输出扩展（来自 D3）：**

```json
{
  "seedGroups": [
    {
      "seedGroupId": "core_product",
      "name": "核心产品词",
      "seeds": ["filter bags", "dust collector cartridges"],
      "tiers": ["T1", "T2", "T3"],
      "toolInstructions": "Use Semrush Keyword Magic with broad match."
    }
  ],
  "competitorResearchDirections": [],
  "manualMiningChecklist": [
    { "tool": "Semrush", "steps": ["..."] },
    { "tool": "Ahrefs", "steps": ["..."] },
    { "tool": "GKP", "steps": ["..."] }
  ],
  "scoringCriteria": {
    "fields": ["searchVolume", "keywordDifficulty", "businessRelevance", "intentMatch"],
    "weights": {}
  }
}
```

**新增 HumanReview 检查项：**
- [ ] 确认种子词分组是否覆盖核心业务
- [ ] 确认竞品反查方向是否合理
- [ ] 确认工具执行清单是否可执行

**Prompt 模板映射：**

| D Prompt 文件 | PromptTemplate ID | Task Pack Category |
|--------------|-------------------|-------------------|
| `d3-0-seed-keyword-plan.md` | `d3_seed_keyword_plan_v1` | `keyword` |
| `d3-scoring-criteria.md` | `d3_scoring_criteria_v1` | `keyword` |

---

### 3.6 S5 人工关键词挖掘

**S-stage 描述：** 人工根据种子词库到外部工具挖词，输出多个 CSV。

**D-stage 对应：** D3 种子词计划的模块 8（工具执行清单）提供具体操作指导。

**融合方法：** S5 保持原系统逻辑。D3 的 `manualMiningChecklist` 作为 S5 AgentTaskPack 的操作指南注入，指导用户如何在 Semrush/Ahrefs/GKP 中执行挖词。

---

### 3.7 S6 程序内置关键词清洗

**S-stage 描述：** 脚本机械清洗 + AI+规则清洗。合并去重、标准化、打标。

**D-stage 对应：** D0-D8 中无独立清洗阶段，但 D3 关键词聚类逻辑隐含了清洗后分类。

**融合方法：** S6 保持原系统逻辑不变。D3 的评分标准（`d3-scoring-criteria.md`）可注入 S6 AI 清洗的 `aiConfidence` 判断依据。

---

### 3.8 S7 总关键词数据库入库

**S-stage 描述：** 清洗后关键词写入数据库，状态为 pending_review。

**D-stage 对应：** 无直接对应。

**融合方法：** S7 保持原系统逻辑不变。

---

### 3.9 S8 人工审核与关键词分配 ← D3 聚类逻辑 + D4b 页面优先级

**S-stage 描述：** 用户审核关键词，决定分配到现有页面、排除、标记未使用等。

**D-stage 输入：**
- D3 关键词聚类 Prompt：关键词到页面的映射逻辑
- D4b 页面优先级评分 Prompt：哪些页面应该优先承接关键词
- D4c 页面数据包 Prompt：每个页面应承接的关键词和内容模块

**融合方法：**

| D-Stage 输出 | S8 KeywordAssignment 字段 | 融合方式 |
|-------------|--------------------------|---------|
| D3 关键词聚类结果 | `KeywordAssignment.recommendedPageType` | 作为 AI 辅助建议注入 |
| D4b 页面优先级分数 | `PageRepairPackage.priorityScore` | 用于排序审核队列 |
| D4c 页面数据包 | `KeywordAssignment.suggestedModules` | 注入审核辅助信息 |

**新增 HumanReview 检查项：**
- [ ] 确认关键词到页面分配是否合理
- [ ] 确认关键词是否适合该页面主题
- [ ] 确认是否会造成蚕食风险
- [ ] 确认不适合现有页面的词是否正确标记为 unused_valid

**Prompt 模板映射：**

| D Prompt 文件 | PromptTemplate ID | Task Pack Category |
|--------------|-------------------|-------------------|
| `d3-keyword-clustering.md` | `d3_keyword_clustering_v1` | `keyword` |
| `d4b-page-priority-scoring.md` | `d4b_page_priority_scoring_v1` | `keyword` |

---

### 3.10 S9 现有页面修复 ← D4 产品线页 + D6b 信任页

**S-stage 描述：** 根据审计结果 + 已分配关键词 + B2B 上下文，生成页面修复任务。

**D-stage 输入：**
- D4c 页面数据包 Prompt：每个页面的具体 SEO 元素和内容模块
- D4d 图片 ALT 生成 Prompt：产品图片的 ALT 文本建议
- D6b 信任页生成 Prompt：About、Factory、QC、Certifications、FAQ 等信任页面内容

**融合方法：**

| D-Stage 输出 | S9 PageRepairPackage 字段 | 融合方式 |
|-------------|--------------------------|---------|
| D4c Title/Meta/H1 建议 | `titleSuggestion`, `metaDescriptionSuggestion`, `h1Suggestion` | 直接映射 |
| D4c 内容模块建议 | `contentModulesToAdd` | 直接映射 |
| D4c RFQ 表单建议 | `ctaSuggestion`, `formSuggestion` | 直接映射 |
| D4c 内链建议 | `internalLinksToAdd` | 直接映射 |
| D4d 图片 ALT | `imageAltSuggestions` | 直接映射 |
| D6b 信任页内容 | 新增 `trustPageRepairTasks` | 新增任务类型 |

**S9 PageRepairPackage 扩展：**

```json
{
  "repairPackageId": "repair_001",
  "url": "",
  "sourceFindingIds": [],
  "assignedKeywords": [],
  "keywordsNotToForce": [],
  "titleSuggestion": "",
  "metaDescriptionSuggestion": "",
  "h1Suggestion": "",
  "contentModulesToAdd": [],
  "imageAltSuggestions": [],
  "internalLinksToAdd": [],
  "evidenceRequired": [],
  "ctaSuggestion": "",
  "formSuggestion": "",
  "trustPageTarget": "",
  "humanReviewItems": []
}
```

**新增 HumanReview 检查项：**
- [ ] 确认 Title/Meta/H1 建议
- [ ] 确认内容模块是否适合页面定位
- [ ] 确认图片 ALT 是否准确
- [ ] 确认内链建议
- [ ] 确认证据需求
- [ ] 确认信任页内容

**Prompt 模板映射：**

| D Prompt 文件 | PromptTemplate ID | Task Pack Category |
|--------------|-------------------|-------------------|
| `d4c-page-data-pack.md` | `d4c_page_data_pack_v1` | `page_repair` |
| `d4d-image-alt-generator.md` | `d4d_image_alt_generator_v1` | `page_repair` |
| `d6b-trust-page-generator.md` | `d6b_trust_page_generator_v1` | `page_repair` |
| `d4-0-product-page-framework.md` | `d4_product_page_framework_v1` | `page_repair` |

---

### 3.11 S10 未使用关键词超级聚类 ← D5 方案中心

**S-stage 描述：** 只处理已审核、有效、未使用、未分配的关键词，生成新页面和内容机会。

**D-stage 输入：**
- D5a 方案中心内容 Prompt：Solution Hub、Application 页面、Buying Guide 的内容框架

**融合方法：**

| D5 输出类型 | S10 UnusedKeywordCluster.recommendedAction | 融合方式 |
|------------|------------------------------------------|---------|
| Solution Hub 规划 | `new_page_task` (solution) | D5a 方案框架注入聚类结果 |
| Application 页面规划 | `new_page_task` (application) | 直接映射 |
| Buying Guide 规划 | `content_engine_task` (buying_guide) | 注入 Content Engine 候选 |
| 材料对比指南 | `content_engine_task` (comparison_guide) | 注入 Content Engine 候选 |

**新增 HumanReview 检查项：**
- [ ] 确认聚类结果的页面类型建议
- [ ] 确认哪些聚类应该新建商业页 vs 交给 Content Engine
- [ ] 确认 Solution Hub / Application 页的主题划分

**Prompt 模板映射：**

| D Prompt 文件 | PromptTemplate ID | Task Pack Category |
|--------------|-------------------|-------------------|
| `d5a-solution-hub-content.md` | `d5a_solution_hub_content_v1` | `content_planning` |

---

### 3.12 S11 新页面 / 内容任务生成

**S-stage 描述：** 按分流规则将聚类结果分为商业页机会、Content Engine 候选、FAQ、Case Study 等。

**D-stage 对应：** D5 方案中心 + D7 内容工厂的规划逻辑。

**融合方法：** S11 保持原分流逻辑。D5 的 Solution Hub / Application 页框架作为 S11 生成商业页任务时的内容模板注入。D7 的内容类型体系（Article Guide、Application Guide 等）作为 S11 分流到 Content Engine 的分类参考。

---

### 3.13 S12 Content Engine 交接 ← D7 内容工厂

**S-stage 描述：** 把内容候选任务转为 Content Engine 可执行的上下文包。

**D-stage 输入：**
- D7 系统化内容工厂 Prompt：内容类型体系、Brief 模板、写作规范
- D7 Prompt 文章生产 Prompt：具体文章的 Prompt 模板

**融合方法：**

| D7 输出 | S12 ContentHandoffPackage 字段 | 融合方式 |
|--------|-------------------------------|---------|
| 内容类型定义 | `targetContentType` | 直接映射 |
| Brief 结构 | `briefTemplate` (新增) | D7 brief 模板注入 |
| 写作规范 | `writingGuidelines` (新增) | D7 品牌语言规范注入 |
| QA 检查清单 | `qaRules` | D7 QA 标准注入 |

**S12 ContentHandoffPackage 扩展：**

```json
{
  "handoffId": "",
  "targetContentType": "supplier_guide | material_comparison | application_guide | buying_guide | faq_cluster | case_study | troubleshooting_guide",
  "primaryKeyword": "",
  "secondaryKeywords": [],
  "searchIntent": "",
  "targetAudience": [],
  "briefTemplate": {
    "sections": ["Introduction", "Key Points", "Product Comparison", "How to Choose", "FAQ", "CTA"],
    "wordCountTarget": "1500-2500",
    "toneOfVoice": "professional_b2b"
  },
  "writingGuidelines": {
    "mustSay": [],
    "mustNotSay": [],
    "brandVoice": {},
    "evidenceToReference": []
  },
  "relatedProductPages": [],
  "internalLinkTargets": [],
  "qaRules": [],
  "ctaGoal": ""
}
```

**新增 HumanReview 检查项：**
- [ ] 确认 Brief 结构是否完整
- [ ] 确认写作规范是否注入正确
- [ ] 确认 QA 规则覆盖事实安全

**Prompt 模板映射：**

| D Prompt 文件 | PromptTemplate ID | Task Pack Category |
|--------------|-------------------|-------------------|
| `d7-system-content-factory.md` | `d7_system_content_factory_v1` | `content_engine` |
| `d7-prompt-article-production.md` | `d7_article_production_v1` | `content_engine` |
| `d5b-style-html-conversion.md` | `d5b_style_html_conversion_v1` | `content_engine` |

---

### 3.14 S13 QA 与交付

**S-stage 描述：** 检查事实、证据、关键词、内链、CTA、页面定位、不能写的声明。

**D-stage 对应：** D6a 信任审计中的虚假声明排查逻辑 + D7 QA 规则。

**融合方法：** S13 保持原 QA 逻辑。D6a 的 "虚假与高风险声明排查" 维度直接注入 S13 QA 检查项。D7 的内容 QA 规则注入 S13 对 Content Engine 产物的审核。

---

### 3.15 S14 持续监控 ← D8 SEO+Lead 监控

**S-stage 描述：** 跟踪 GSC 收录、曝光、排名、CTR、询盘来源页面、询盘质量、下一轮优化任务。

**D-stage 输入：**
- D8 SEO+Lead 监控报告 Prompt：8 个分析模块 — 周结论、SEO 数据分析、Lead 数据分析、关键词到询盘路径、页面优化清单、内容新增建议、转化追踪问题、下周行动清单

**融合方法：**

| D8 分析模块 | S14 MonitoringReport 字段 | 融合方式 |
|------------|--------------------------|---------|
| 本周结论 | `weeklySummary` | 直接映射 |
| SEO 数据分析 | `seoMetrics` | 直接映射 |
| Lead 数据分析 | `leadMetrics` | 直接映射 |
| 关键词到询盘路径 | `keywordToLeadPath` (新增) | 新增分析维度 |
| 页面优化清单 | `pageOptimizationTasks` | 生成下轮任务 |
| 内容新增建议 | `contentRecommendations` | 注入 S11 下轮候选 |
| 转化追踪问题 | `trackingIssues` (新增) | 新增分析维度 |
| 下周行动清单 | `nextWeekActions` | 直接映射 |

**S14 MonitoringReport 扩展结构：**

```json
{
  "reportId": "",
  "period": { "from": "", "to": "" },
  "weeklySummary": "",
  "seoMetrics": {
    "indexedPages": 0,
    "totalImpressions": 0,
    "totalClicks": 0,
    "averageCtr": 0,
    "topGrowthPages": [],
    "topDeclinePages": [],
    "opportunityPages": []
  },
  "leadMetrics": {
    "totalLeads": 0,
    "qualifiedLeads": 0,
    "leadSources": [],
    "leadByCountry": [],
    "leadByProductLine": [],
    "qualityAssessment": ""
  },
  "keywordToLeadPath": [
    { "keyword": "", "impressions": 0, "clicks": 0, "leads": 0, "leadQuality": "" }
  ],
  "pageOptimizationTasks": [],
  "contentRecommendations": [],
  "trackingIssues": [],
  "nextWeekActions": []
}
```

**新增 HumanReview 检查项：**
- [ ] 确认数据周期和数据来源准确性
- [ ] 确认询盘质量判断
- [ ] 确认下周行动清单优先级

**Prompt 模板映射：**

| D Prompt 文件 | PromptTemplate ID | Task Pack Category |
|--------------|-------------------|-------------------|
| `d8-seo-lead-report.md` | `d8_seo_lead_report_v1` | `monitoring` |

---

## 四、数据对象集成地图

| D0-D8 数据对象 | 目标 KnowledgeBase 字段 | 来源 Stage | 合并说明 |
|---------------|------------------------|-----------|---------|
| business-model.json (D0a) | `ProjectProfile.supplierIdentity`, `targetCustomers`, `primaryConversionGoal` | S0 | 扩展 ProjectProfile |
| lead-goal.json (D0a) | `ProjectProfile.primaryConversionGoal` + 扩展 `conversionGoals[]` | S0 | 新增字段 |
| site-architecture (D0b) | `ProjectProfile.knownImportantPages` | S0 | 直接映射 |
| conversion-path-map (D0b) | `AuditFinding(conversion_gap)` 初始值 | S2 | 注入审计维度 |
| knowledge-b2b.json (D1a) | `B2BContext.industryKnowledge`, `buyerPersonas`, `procurementFactors` | S3 | 新增子对象 |
| procurement-map (D1a) | `B2BContext.procurementFactors` | S3 | 新增子对象 |
| category-knowledge (D1b) | `B2BContext.productSpecifications` | S3 | 注入 productLines |
| company-profile (D2a) | `B2BContext.companyProfile` | S3 | 直接映射 |
| brand-voice-b2b (D2b) | `B2BContext.brandVoice` | S3 | 直接映射 |
| capability (D2c) | `B2BContext.capabilities` | S3 | 直接映射 |
| trust-evidence (D2c) | `B2BContext.trustEvidence` | S3 | 直接映射 |
| seed-keyword-plan (D3-0) | `SeedKeywordGroup[]` | S4 | 直接映射 |
| keyword-clustering (D3) | `KeywordAssignment.recommendedPageType` | S8 | 注入审核辅助 |
| keyword-CSV (D3) | `KeywordRecord[]` | S7 | 经 S6 清洗后入库 |
| links.json (D3) | `PageRepairPackage.internalLinksToAdd` | S9 | 注入修复包 |
| product-line-record (D4a) | `B2BContext.productLines` | S3 | 直接映射 |
| page-data-pack (D4c) | `PageRepairPackage.*` | S9 | 注入修复包字段 |
| solution-hub-plan (D5a) | `ContentOpportunities` (solution 类型) | S11 | 聚类结果分流 |
| trust-audit (D6a) | `AuditFinding[]` (trust/conversion 类型) | S2 | 扩展审计维度 |
| trust-page-content (D6b) | `PageRepairPackage` (trust 类型) | S9 | 新增修复任务 |
| content-system (D7) | `ContentHandoffPackage.briefTemplate`, `writingGuidelines` | S12 | 注入交接包 |
| article-prompt (D7) | `ContentHandoffPackage` 子结构 | S12 | 模板注入 |
| seo-lead-report (D8) | `MonitoringReport` | S14 | 直接映射 |

---

## 五、Prompt 覆盖矩阵

| Prompt ID | 名称 | S-Stage | 已在 Registry? | Task Pack Category |
|-----------|------|---------|---------------|-------------------|
| d0a-business-positioning | 业务定位 | S0 | 否 | project_setup |
| d0b-site-architecture | 站点架构 | S0 | 否 | project_setup |
| d1a-industry-cognition | 行业认知 | S3 | 否 | b2b_context |
| d1b-category-knowledge | 品类知识 | S3 | 否 | b2b_context |
| d2a-brand-positioning | 品牌定位 | S3 | 否 | b2b_context |
| d2b-brand-voice | 品牌语言 | S3 | 否 | b2b_context |
| d2c-capability-evidence | 能力与证据 | S3 | 否 | b2b_context |
| d3-0-seed-keyword-plan | 种子词计划 | S4 | 否 | keyword |
| d3-keyword-clustering | 关键词聚类 | S8 | 否 | keyword |
| d3-scoring-criteria | 评分标准 | S4/S6 | 否 | keyword |
| d4-0-product-page-framework | 产品页框架 | S9 | 否 | page_repair |
| d4a-product-line-record | 产品线记录 | S3 | 否 | b2b_context |
| d4b-page-priority-scoring | 页面优先级 | S8 | 否 | keyword |
| d4c-page-data-pack | 页面数据包 | S9 | 否 | page_repair |
| d4d-image-alt-generator | 图片 ALT | S9 | 否 | page_repair |
| d5a-solution-hub-content | 方案中心内容 | S10/S11 | 否 | content_planning |
| d5b-style-html-conversion | 样式 HTML 转换 | S12 | 否 | content_engine |
| d6a-trust-conversion-audit | 信任转化审计 | S2 | 否 | site_audit |
| d6b-trust-page-generator | 信任页生成 | S9 | 否 | page_repair |
| d7-system-content-factory | 内容工厂体系 | S12 | 否 | content_engine |
| d7-prompt-article-production | 文章生产 | S12 | 否 | content_engine |
| d8-seo-lead-report | SEO+Lead 报告 | S14 | 否 | monitoring |

### 系统原有 Prompt（doc1 已定义）

| Prompt 文件名 | S-Stage | 状态 |
|-------------|---------|------|
| wordpress-site-reading-agent.md | S1 | 已在 Registry |
| front-stage-b2b-audit.md | S2 | 已在 Registry |
| authorized-wordpress-audit.md | S2 | 已在 Registry |
| b2b-context-extraction.md | S3 | 已在 Registry |
| seed-keyword-generation.md | S4 | 已在 Registry |
| keyword-ai-cleaning.md | S6 | 已在 Registry |
| unused-keyword-super-clustering.md | S10 | 已在 Registry |
| page-repair-package-generation.md | S9 | 已在 Registry |
| content-engine-handoff-generation.md | S12 | 已在 Registry |
| qa-review.md | S13 | 已在 Registry |
| delivery-package-generation.md | S13 | 已在 Registry |

### Prompt 合并策略

D0-D8 的 22 个 Prompt 不是每个都需要独立注册。合并规则：

1. **直接新增**：与现有 Registry 无重叠的 D-Prompt（d0a, d0b, d1a, d1b, d2a, d2b, d2c, d3-0, d3, d3-scoring, d4-0, d4a, d4b, d4c, d4d, d5a, d5b, d6a, d6b, d7-system, d7-article, d8）
2. **合并到现有**：
   - `d6a-trust-conversion-audit` 的信任维度合并到 `front-stage-b2b-audit.md`
   - `d3-0-seed-keyword-plan` 的种子词逻辑合并到 `seed-keyword-generation.md`
   - `d6b-trust-page-generator` 的信任页内容合并到 `page-repair-package-generation.md`
3. **辅助型 Prompt（不独立注册）**：d3-scoring-criteria 作为 d3-0 的子模块注入

---

## 六、推荐实施顺序

### Phase 1：基础上下文层（对应 v0.3 Phase 1-4）

| 步骤 | 融合任务 | 优先级 | 依赖 |
|------|---------|-------|------|
| 1.1 | D0a/D0b → S0 AgentTaskPack 模板 | P0 | S0 基础已就绪 |
| 1.2 | 扩展 ProjectProfile 增加 D0 字段 | P0 | 1.1 |
| 1.3 | D1a/D1b → S3 行业认知 AgentTaskPack | P0 | S3 基础已就绪 |
| 1.4 | D2a/D2b/D2c → S3 品牌/能力 AgentTaskPack | P0 | S3 基础已就绪 |
| 1.5 | D4a → S3 产品线 AgentTaskPack | P0 | S3 基础已就绪 |
| 1.6 | 扩展 B2BContext 增加 industryKnowledge/buyerPersonas/procurementFactors | P1 | 1.3 |

### Phase 2：审计增强层（对应 v0.3 Phase 3）

| 步骤 | 融合任务 | 优先级 | 依赖 |
|------|---------|-------|------|
| 2.1 | D6a → S2 信任转化审计 AgentTaskPack | P0 | S2 基础已就绪 |
| 2.2 | 扩展 AuditFinding category 列表 | P1 | 2.1 |
| 2.3 | D6a 虚假声明排查维度注入 S13 QA | P1 | 2.1 |

### Phase 3：关键词策略层（对应 v0.3 Phase 5）

| 步骤 | 融合任务 | 优先级 | 依赖 |
|------|---------|-------|------|
| 3.1 | D3-0 → S4 种子词 AgentTaskPack | P0 | S4 基础已就绪 |
| 3.2 | D3 聚类 → S8 关键词分配辅助 | P1 | S8 基础已就绪 |
| 3.3 | D4b → S8 页面优先级辅助 | P1 | 3.2 |

### Phase 4：页面修复与内容层（对应 v0.3 Phase 6）

| 步骤 | 融合任务 | 优先级 | 依赖 |
|------|---------|-------|------|
| 4.1 | D4c/D4d → S9 页面数据包 AgentTaskPack | P0 | S9 基础已就绪 |
| 4.2 | D6b → S9 信任页生成 AgentTaskPack | P0 | S9 基础已就绪 |
| 4.3 | D4-0 → S9 产品页框架模板 | P1 | 4.1 |
| 4.4 | D5a → S10/S11 方案中心内容规划 | P1 | S10/S11 基础已就绪 |

### Phase 5：内容引擎与交付层（对应 v0.3 Phase 6-7）

| 步骤 | 融合任务 | 优先级 | 依赖 |
|------|---------|-------|------|
| 5.1 | D7 → S12 内容工厂 AgentTaskPack | P0 | S12 基础已就绪 |
| 5.2 | D7 Brief 模板注入 ContentHandoffPackage | P1 | 5.1 |
| 5.3 | D5b → S12 HTML 转换模板 | P2 | 5.1 |

### Phase 6：监控层（对应长期运维）

| 步骤 | 融合任务 | 优先级 | 依赖 |
|------|---------|-------|------|
| 6.1 | D8 → S14 监控报告 AgentTaskPack | P1 | S14 基础已就绪 |
| 6.2 | 扩展 MonitoringReport 结构 | P2 | 6.1 |

### 实施总览

```text
Phase 1 (基础上下文)  ──→  Phase 2 (审计增强)  ──→  Phase 3 (关键词策略)
       ↓                        ↓                        ↓
Phase 4 (页面修复)     ──→  Phase 5 (内容引擎)  ──→  Phase 6 (监控)
```

关键依赖链：
- Phase 1 必须先完成，因为 B2BContext 是所有后续阶段的输入
- Phase 2 可与 Phase 1 并行（审计和上下文建立可同时进行）
- Phase 3 必须在 Phase 1 之后（种子词依赖 B2BContext）
- Phase 4 必须在 Phase 2 + Phase 3 之后（页面修复依赖审计 + 关键词分配）
- Phase 5 必须在 Phase 4 之后（Content Engine 依赖页面修复结果）
- Phase 6 可独立启动（监控不依赖其他融合阶段）

---

## 七、关键约束与注意事项

1. **D0-D8 Prompt 不直接执行**：所有 D-stage Prompt 必须包装为 AgentTaskPack，由外部智能体执行后回填 Artifact。
2. **D-stage 数据必须经过审核门禁**：D0-D8 的输出数据不能直接写入 KnowledgeBase，必须经过 Artifact 导入 → 校验 → HumanReview 审核通过。
3. **D0 技术方案建议不入库**：D0 的"技术方案建议"和"第一周执行建议"是辅助指导信息，不作为系统数据对象。
4. **D8 需要外部数据源**：D8 监控报告依赖 GSC/GA4/GTM 数据，这些数据需要用户手动提供或未来通过 API 接入。
5. **B2BContext 扩展需向后兼容**：新增的 `industryKnowledge`、`buyerPersonas`、`procurementFactors` 字段必须是可选字段，不影响现有流程。
6. **Prompt 合并需保持独立性**：被合并到现有 Prompt 的 D-Prompt（如 d6a 合并到 front-stage-b2b-audit）应保留为独立版本，以便不同场景选用。
