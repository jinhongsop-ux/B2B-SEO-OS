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
