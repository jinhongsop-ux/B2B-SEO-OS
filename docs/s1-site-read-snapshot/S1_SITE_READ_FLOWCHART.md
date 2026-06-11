# B2B SEO OS — S1 可视化流程图

> Workflow Step: `S1_SITE_READ`  
> 配套文档：`S1_SITE_READ_SNAPSHOT_SPEC.md`  
> 重点：展示 S1 内部数据引用、外部 AI 交互逻辑、Artifact 回填、Parser/Validator 校验、KnowledgeBase 写入与 WorkflowState 推进。

---

## 1. 图示目标

S1 不是“系统自己爬站”，也不是“系统内置 AI 自动审计”。

S1 的产品逻辑是：

> B2B SEO OS 根据项目档案生成标准化任务包，用户把任务包交给外部智能体执行，外部智能体只读读取 WordPress 网站并返回结构化文件，系统再保存原始 Artifact、解析校验、人工审核，最后写入项目知识库并推进工作流。

因此，S1 必须同时展示 4 条线：

1. **系统内部数据线**：`ProjectProfile`、`PromptTemplateRegistry`、`WorkflowState`、`ArtifactStore`、`ProjectKnowledgeBase`。
2. **用户操作线**：复制任务包、交给外部 AI、上传回填文件、人工审核。
3. **外部 AI 执行线**：ChatGPT / Claude / OpenClaw 根据任务包读取网站并输出 `site_read_snapshot_v1`。
4. **目标网站读取线**：公开前台、sitemap、robots、导航、页脚、首页内链、可选 WordPress API。

---

## 2. S1 总流程图：系统数据引用 + 外部 AI 闭环

```mermaid
flowchart TD
  START["S0 已完成：项目接入信息已确认"] --> WS_READY["WorkflowState：S1 ready"]

  subgraph SYS["B2B SEO OS 系统内部"]
    PP["ProjectProfile\n项目档案\n- domain\n- company\n- industry\n- targetMarkets\n- wordpressAccess\n- seoPlugin\n- hasWooCommerce\n- estimatedPageCount\n- knownImportantPages"]

    PTR["PromptTemplateRegistry\nS1 PromptTemplate\n- 只读安全边界\n- 页面结构识别\n- URL 发现规则\n- 输出 JSON Schema"]

    WS_READY

    ATP["AgentTaskPack\n外部智能体任务包\n由 ProjectProfile + S1 PromptTemplate 生成"]

    ASTORE["ArtifactStore\n保存用户上传的原始文件\n- JSON\n- ZIP\n- raw_notes.md\n永久保留"]

    PARSER["Parser / Validator\n解析与校验\n- schemaVersion\n- site 字段\n- pages 数组\n- error / warning 分级"]

    PREVIEW["结构化预览\n- 页面数量\n- 页面类型分布\n- status 统计\n- anomalies\n- error / warning"]

    KB["ProjectKnowledgeBase.siteReadSnapshot\n写入最新版结构化网站快照\n只保留当前版"]

    WS_DONE["WorkflowState：S1 completed\n解锁 S2 网站现状审计"]
  end

  subgraph USER["用户操作层"]
    U1["用户确认 S1 输入"]
    U2["用户复制 AgentTaskPack"]
    U3["用户交给外部智能体执行"]
    U4["用户上传 JSON / ZIP 回填文件"]
    U5["用户人工审核\n抽查首页、核心产品页、Contact/RFQ、About/Factory、Blog/Resource"]
    U6["用户点击：确认写入 KnowledgeBase 并进入 S2"]
  end

  subgraph AI["外部智能体执行层"]
    AI1["ChatGPT / Claude / OpenClaw\n接收任务包"]
    AI2["按只读边界执行读取\n不修改网站、不提交真实表单、不做攻击性测试"]
    AI3["输出 site_read_snapshot_v1\n或 ZIP 文件包"]
  end

  subgraph SITE["目标 WordPress B2B 网站"]
    W1["公开前台页面"]
    W2["sitemap.xml"]
    W3["robots.txt"]
    W4["主导航 / 页脚导航 / 首页内链"]
    W5["可选 WordPress REST API\n仅 readonly_api / admin_access 时使用"]
  end

  WS_READY --> U1
  PP --> ATP
  PTR --> ATP
  WS_READY --> ATP
  U1 --> U2
  ATP --> U2
  U2 --> U3
  U3 --> AI1
  AI1 --> AI2
  AI2 --> W1
  AI2 --> W2
  AI2 --> W3
  AI2 --> W4
  AI2 -. "有只读/API权限时补充" .-> W5
  W1 --> AI3
  W2 --> AI3
  W3 --> AI3
  W4 --> AI3
  W5 -. "API 仅补充，不覆盖前台" .-> AI3
  AI3 --> U4
  U4 --> ASTORE
  ASTORE --> PARSER
  PARSER --> CHECK{是否存在阻塞性 error?}
  CHECK -- "是" --> BLOCK["阻塞：提示用户补跑或修正\n不能写入 KnowledgeBase"]
  BLOCK --> U3
  CHECK -- "否，仅 warning 或无问题" --> PREVIEW
  PREVIEW --> U5
  U5 --> REVIEW{人工审核 checklist 是否完成?}
  REVIEW -- "否" --> U5
  REVIEW -- "是" --> U6
  U6 --> KB
  KB --> WS_DONE
```

---

## 3. S1 数据流图：哪些内部对象被读取、生成、保存、推进

```mermaid
flowchart LR
  PP["ProjectProfile\nS0 项目档案"] --> G1["生成 S1 AgentTaskPack"]
  PT["S1 PromptTemplate\n任务模板"] --> G1
  WS["WorkflowState\n当前步骤 = S1 ready"] --> G1

  G1 --> PACK["AgentTaskPack\n用户可复制任务包"]
  PACK --> OUTAI["外部 AI 执行结果\nsite_read_snapshot_v1.json\n或 site_read_snapshot_v1.zip"]

  OUTAI --> RAW["ArtifactStore\n保存 raw Artifact\n永久保留"]
  RAW --> PV["Parser / Validator\n解析字段 + 校验 Schema"]

  PV --> ERR["error 列表\n核心字段缺失 / 文件不可解析 / schema 错误"]
  PV --> WARN["warning 列表\n次要字段缺失 / 站点级字段不完整"]
  PV --> SNAP["Parsed SiteReadSnapshot\n结构化网站快照草稿"]

  ERR --> DECIDE{是否仍有阻塞性 error?}
  SNAP --> DECIDE
  WARN --> DECIDE

  DECIDE -- "有 error" --> STOP["停止推进\n要求补跑或人工修正"]
  DECIDE -- "无 error" --> REVIEW["HumanReviewChecklist_S1\n页面抽查审核"]

  REVIEW --> KB["ProjectKnowledgeBase.siteReadSnapshot\n覆盖写入最新版"]
  KB --> NEXT["WorkflowState\nS1 completed → S2 unlocked"]
```

---

## 4. S1 外部 AI 交互图：系统不直接调用 AI，用户作为桥接层

```mermaid
sequenceDiagram
  participant 系统 as B2B SEO OS 系统
  participant 用户 as 用户
  participant AI as 外部智能体<br/>ChatGPT / Claude / OpenClaw
  participant 网站 as WordPress B2B 网站

  系统->>系统: 读取 ProjectProfile
  系统->>系统: 读取 S1 PromptTemplate
  系统->>系统: 生成 AgentTaskPack
  系统->>用户: 展示可复制任务包
  用户->>AI: 复制任务包并交给外部智能体
  AI->>网站: 只读读取 sitemap.xml、robots.txt、导航、页脚、页面 HTML
  alt 有 readonly_api / admin_access
    AI->>网站: 只读读取 WordPress REST API 作为补充
  end
  网站-->>AI: 返回公开页面结构与可见字段
  AI-->>用户: 输出 site_read_snapshot_v1 JSON 或 ZIP
  用户->>系统: 上传 JSON / ZIP Artifact
  系统->>系统: 保存 raw Artifact 到 ArtifactStore
  系统->>系统: Parser / Validator 解析并校验
  alt 存在阻塞性 error
    系统-->>用户: 提示补跑或修正，不能进入 S2
  else 仅 warning 或无问题
    系统-->>用户: 展示结构化预览和人工审核 checklist
    用户->>系统: 完成页面抽查并确认写入
    系统->>系统: 写入 ProjectKnowledgeBase.siteReadSnapshot
    系统->>系统: WorkflowState 推进到 S1 completed
    系统-->>用户: 解锁 S2 网站现状审计
  end
```

---

## 5. S1 Artifact 与 KnowledgeBase 关系图

```mermaid
flowchart TD
  UPLOAD["用户上传回填文件\nJSON 或 ZIP"] --> RAW["ArtifactStore\n原始 Artifact 永久保存"]

  RAW --> PARSE["解析器 Parser\n统一解析为 site_read_snapshot_v1"]
  PARSE --> VALIDATE["校验器 Validator\nerror / warning 分级"]

  VALIDATE --> PASS{是否可进入人工审核?}
  PASS -- "否：parse_failed 或 blocking error" --> RETRY["用户补跑 / 修正后重新上传"]
  RETRY --> UPLOAD

  PASS -- "是：无 blocking error" --> REVIEW["人工审核\n抽查核心页面 + 查看 anomalies + 接受 warning"]
  REVIEW --> WRITE["写入 ProjectKnowledgeBase.siteReadSnapshot"]

  WRITE --> LATEST["结构化快照只保留最新版"]
  RAW --> HISTORY["raw Artifact 保留历史版本\n用于追溯或重新解析"]

  LATEST --> S2["S2 读取最新版 siteReadSnapshot\n开始网站现状审计"]
```

---

## 6. S1 error / warning 判断图

```mermaid
flowchart TD
  INPUT["Parser / Validator 接收解析结果"] --> FILECHECK{文件级校验是否通过?}

  FILECHECK -- "否" --> PARSEFAILED["parse_failed\n文件不可读 / JSON 非法 / ZIP 不可解压 / schemaVersion 不匹配"]
  PARSEFAILED --> BLOCK1["不能进入人工审核"]

  FILECHECK -- "是" --> PAGECHECK["逐页校验 PageSnapshot 字段"]

  PAGECHECK --> CORE{核心字段是否缺失?\nurl / pageType / title / h1 / status / detectedFrom}
  CORE -- "是" --> ERROR["error\n该页面不可入正式 pages\n必须补跑或人工修正"]
  CORE -- "否" --> SECONDARY{次要字段是否缺失?\nmetaDescription / h2List / primaryCta / formsDetected / internalLinks}

  SECONDARY -- "是" --> WARNING["warning\n页面可入库\n审核界面提示不完整"]
  SECONDARY -- "否" --> OK["通过校验"]

  ERROR --> FINALCHECK{是否仍存在 blocking error?}
  WARNING --> FINALCHECK
  OK --> FINALCHECK

  FINALCHECK -- "有" --> BLOCK2["不能写入 KnowledgeBase"]
  FINALCHECK -- "无" --> REVIEW["进入人工审核"]
```

---

## 7. S1 前台与 API 冲突处理图

```mermaid
flowchart TD
  FRONT["前台读取结果\n真实用户可见页面"] --> COMPARE["与 API 读取结果对比"]
  API["WordPress REST API 结果\n仅作为补充"] --> COMPARE

  COMPARE --> SAME{结果是否一致?}
  SAME -- "一致" --> SAVE["保存页面字段"]
  SAME -- "不一致" --> RULE["处理规则：前台优先 + 冲突记录"]

  RULE --> FRONTWIN["页面展示字段以前台为准"]
  RULE --> ANOMALY["写入 anomalies\n类型：frontend_api_conflict"]

  FRONTWIN --> SNAP["进入 SiteReadSnapshot"]
  ANOMALY --> SNAP
  SNAP --> S2["S2 审计阶段再判断是否为问题"]
```

---

## 8. S1 图中关键对象说明

| 对象 | 所属层 | 作用 | 是否持久化 |
|---|---|---|---|
| `ProjectProfile` | 系统内部数据 | S0 项目档案，是 S1 任务包的上下文输入 | 是 |
| `PromptTemplateRegistry` | 系统内部数据 | 保存 S1 PromptTemplate，定义只读边界、读取步骤、输出格式 | 是 |
| `AgentTaskPack` | 系统生成物 | 用户复制给外部 AI 的标准化任务包 | 可保存执行记录 |
| 外部智能体 | 系统外部 | 执行读取任务，但不直接写入系统 | 否 |
| `site_read_snapshot_v1` | 回填结果 | 外部 AI 输出的结构化网站读取快照 | 原始文件进入 ArtifactStore |
| `ArtifactStore` | 系统内部数据 | 保存上传的 JSON / ZIP / raw notes，永久保留 | 是 |
| `Parser / Validator` | 系统内部逻辑 | 解析 Artifact，校验字段，生成 error / warning | 否，结果可保存 |
| `ProjectKnowledgeBase.siteReadSnapshot` | 系统内部数据 | S1 审核通过后的最新版结构化网站快照 | 是，仅保留最新版 |
| `WorkflowState` | 系统内部数据 | 控制 S1 状态推进和 S2 解锁 | 是 |
| `HumanReviewChecklist_S1` | 人工审核规则 | 要求用户抽查核心页面、确认 warning、查看 anomalies | 是，保存审核结果 |

---

## 9. S1 页面中的推荐视觉结构

```mermaid
flowchart LR
  LEFT["左侧：工作流导航\nS0 项目接入\nS1 网站读取\nS2 网站审计\n..."]

  CENTER["中间：S1 主工作区\n1. 项目输入确认\n2. 生成任务包\n3. 上传 Artifact\n4. 解析预览\n5. 人工审核"]

  RIGHT["右侧：上下文与状态栏\n- 当前 ProjectProfile 摘要\n- WorkflowState\n- Artifact 历史\n- error / warning\n- 下一步条件"]

  LEFT --> CENTER
  CENTER --> RIGHT
```

---

## 10. 一句话总结

S1 的本质不是“爬虫功能”，而是：

> 把外部 AI 对 WordPress B2B 网站的只读读取能力，包装成一个可复制任务包、可回填 Artifact、可解析校验、可人工审核、可写入知识库、可推进状态机的标准化工作流。
