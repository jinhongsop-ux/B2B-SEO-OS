# Agent Workflow Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first working loop for “站点接入与读取”: generate an AgentTaskPack, accept an external AI Artifact, run program-side ingestion, require human review, and advance the workflow while preserving the existing thick UI.

**Architecture:** Add a workflow execution layer beside the existing local workspace store. `TaskPack`, `Artifact`, and `IngestionRun` live in `workspace-state.json`; the backend exposes focused APIs; the existing React app consumes those APIs through small client helpers and inserts a stage action panel into `/project-center`.

**Tech Stack:** Node built-in `http/fs/path`, local JSON persistence, React 18, Vite, TypeScript, existing contract tests with Node `assert`, Playwright for browser checks.

---

## File Structure

- Modify `app/workbench-preview/server/workspace-store.mjs`
  - Add persistent arrays: `taskPacks`, `ingestionRuns`.
  - Normalize legacy states that do not have these arrays.

- Create `app/workbench-preview/server/agent-workflow-actions.mjs`
  - Owns `generateTaskPack`, `submitArtifact`, `runArtifactIngestion`, and `reviewIngestionRun`.
  - Keeps site-reading business rules out of `api-server.mjs`.

- Modify `app/workbench-preview/server/site-reading-actions.mjs`
  - Add `applyApprovedSiteReadIngestion`.
  - Keep existing local mock snapshot endpoint temporarily for compatibility.

- Modify `app/workbench-preview/server/api-server.mjs`
  - Add REST endpoints for task packs, artifacts, ingestion runs, and review.
  - Keep existing APIs intact.

- Modify `app/workbench-preview/src/types/index.ts`
  - Add `AgentTaskPack`, `Artifact`, `IngestionRun`, validation types, and expanded `WorkspaceState`.

- Modify `app/workbench-preview/src/api/workspace.ts`
  - Add client helpers for the new APIs.

- Modify `app/workbench-preview/src/App.tsx`
  - Preserve thick UI.
  - Add `StageActionPanel`, `TaskPackPreview`, `ArtifactImportPanel`, `IngestionResultPanel`, `ReviewGate`.
  - Insert the panel into `ProjectCenterPage`.
  - Update settings and top-bar wording to clarify dual AI roles.

- Create `app/workbench-preview/tests/agent-workflow-contract.test.mjs`
  - TDD contract for the first complete loop.

- Modify `app/workbench-preview/package.json`
  - Add the new contract test to `test:all`.

- Optionally modify `app/workbench-preview/tests/ai_workbench_e2e.py`
  - Verify the UI path only after backend and page wiring are green.

---

## Task 1: Backend Contract Test For Site Read Agent Workflow

**Files:**
- Create: `app/workbench-preview/tests/agent-workflow-contract.test.mjs`
- Modify: `app/workbench-preview/package.json`

- [ ] **Step 1: Write the failing API test**

Create `app/workbench-preview/tests/agent-workflow-contract.test.mjs` with a focused end-to-end contract:

```js
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(__dirname, '..')
const serverFile = path.join(appRoot, 'server', 'api-server.mjs')

const port = Number(process.env.TEST_AGENT_WORKFLOW_PORT || 4313)
const baseUrl = `http://127.0.0.1:${port}`
const runtimeDir = await mkdtemp(path.join(os.tmpdir(), 'b2b-seo-os-agent-workflow-'))

let server

async function main() {
  server = spawn(process.execPath, [serverFile], {
    cwd: appRoot,
    env: { ...process.env, PORT: String(port), B2B_SEO_OS_RUNTIME_DIR: runtimeDir },
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  await waitForHealth()

  const noProjectPack = await postJson('/api/task-packs/generate', {
    workflowStepId: 'site_connection_reading',
    taskType: 'site_read',
    targetAgent: 'chatgpt',
  })
  assert.equal(noProjectPack.status, 409)
  assert.equal(noProjectPack.body.error.code, 'prerequisite_missing')
  assert.match(noProjectPack.body.error.message, /项目档案/)

  await postJson('/api/project', {
    projectName: '测试工业供应商',
    domain: 'example-b2b.com',
    company: '测试工业有限公司',
    industry: '工业零部件',
    targetMarkets: ['美国', '欧洲'],
    coreProducts: ['CNC 零件', '金属冲压件'],
    targetCustomers: ['采购经理', 'OEM 工程团队'],
    primaryConversionGoal: '提交询盘',
  })

  const taskPackResponse = await postJson('/api/task-packs/generate', {
    workflowStepId: 'site_connection_reading',
    taskType: 'site_read',
    targetAgent: 'openclaw',
    userInput: '请优先读取首页、产品页、关于我们、联系页和资源文章。',
  })
  assert.equal(taskPackResponse.status, 201)
  assert.equal(taskPackResponse.body.taskPack.workflowStepId, 'site_connection_reading')
  assert.equal(taskPackResponse.body.taskPack.taskType, 'site_read')
  assert.equal(taskPackResponse.body.taskPack.targetAgent, 'openclaw')
  assert.match(taskPackResponse.body.taskPack.promptMarkdown, /site_read_snapshot_v1/)
  assert.match(taskPackResponse.body.taskPack.promptMarkdown, /禁止写入 WordPress/)
  assert.ok(taskPackResponse.body.taskPack.expectedArtifactSchema.requiredFields.includes('pages'))

  const taskPackId = taskPackResponse.body.taskPack.taskPackId
  const taskPacks = await getJson('/api/task-packs')
  assert.equal(taskPacks.taskPacks.length, 1)
  assert.equal(taskPacks.taskPacks[0].taskPackId, taskPackId)

  const badArtifact = await postJson('/api/artifacts', {
    taskPackId,
    sourceAgent: 'openclaw',
    format: 'json',
    rawContent: '{',
  })
  assert.equal(badArtifact.status, 400)
  assert.equal(badArtifact.body.error.code, 'invalid_artifact')

  const artifactResponse = await postJson('/api/artifacts', {
    taskPackId,
    sourceAgent: 'openclaw',
    format: 'json',
    rawContent: JSON.stringify({
      schemaVersion: 'site_read_snapshot_v1',
      domain: 'https://example-b2b.com',
      pages: [
        {
          url: '/',
          title: '测试工业有限公司',
          pageType: '首页',
          type: 'page',
          h1: '测试工业有限公司',
          metaDescription: '工业零部件供应商。',
          wordCount: 800,
          formsDetected: ['RFQ Form'],
        },
      ],
      menus: ['Main Menu'],
      forms: ['RFQ Form'],
      seoFields: ['SEO Title', 'Meta Description', 'H1'],
      anomalies: ['部分图片 ALT 为空'],
      humanReviewItems: ['确认抓取页面是否完整。'],
    }),
  })
  assert.equal(artifactResponse.status, 201)
  assert.equal(artifactResponse.body.artifact.taskPackId, taskPackId)

  const ingestionResponse = await postJson('/api/ingestion-runs', {
    artifactId: artifactResponse.body.artifact.artifactId,
  })
  assert.equal(ingestionResponse.status, 201)
  assert.equal(ingestionResponse.body.ingestionRun.status, 'waiting_review')
  assert.equal(ingestionResponse.body.ingestionRun.validationResult.valid, true)
  assert.equal(ingestionResponse.body.ingestionRun.canAdvance, true)
  assert.equal(ingestionResponse.body.ingestionRun.parsedObjects.siteReadSnapshot.pages.length, 1)

  const reviewResponse = await postJson(`/api/ingestion-runs/${ingestionResponse.body.ingestionRun.ingestionRunId}/review`, {
    decision: 'approved',
    reviewer: 'operator',
    notes: '页面读取结果可以进入审计阶段。',
  })
  assert.equal(reviewResponse.status, 200)
  assert.equal(reviewResponse.body.ingestionRun.status, 'approved')
  assert.equal(reviewResponse.body.workflow.currentStepId, 'audit')
  assert.equal(reviewResponse.body.workspace.latestSnapshot.pages[0].url, '/')

  const persisted = JSON.parse(await readFile(path.join(runtimeDir, 'workspace-state.json'), 'utf8'))
  assert.equal(persisted.taskPacks.length, 1)
  assert.equal(persisted.artifacts.length, 3)
  assert.equal(persisted.ingestionRuns.length, 1)
  assert.equal(persisted.siteReadSnapshots.length, 1)
}

async function waitForHealth() {
  const startedAt = Date.now()
  while (Date.now() - startedAt < 7000) {
    if (server.exitCode !== null) throw new Error('server exited before health check passed')
    try {
      const response = await fetch(`${baseUrl}/api/health`)
      if (response.ok) return
    } catch {
      await delay(100)
    }
  }
  throw new Error('server did not become ready')
}

async function getJson(route) {
  const response = await fetch(`${baseUrl}${route}`)
  assert.equal(response.status, 200)
  return response.json()
}

async function postJson(route, body) {
  const response = await fetch(`${baseUrl}${route}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return { status: response.status, body: await response.json() }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

try {
  await main()
} finally {
  if (server && server.exitCode === null) server.kill()
  await rm(runtimeDir, { recursive: true, force: true })
}
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
cd app/workbench-preview
node tests/agent-workflow-contract.test.mjs
```

Expected: FAIL with `not_found` or missing `/api/task-packs/generate`, proving the new workflow API does not exist yet.

- [ ] **Step 3: Add the test to `test:all`**

Update `app/workbench-preview/package.json`:

```json
"test:agent-workflow": "node tests/agent-workflow-contract.test.mjs",
"test:all": "npm run test:api && npm run test:site-reading && npm run test:agent-workflow"
```

- [ ] **Step 4: Do not commit until implementation is green**

The failing test stays local until Task 3 passes.

---

## Task 2: Workspace Types And Persistence

**Files:**
- Modify: `app/workbench-preview/server/workspace-store.mjs`
- Modify: `app/workbench-preview/src/types/index.ts`

- [ ] **Step 1: Extend server workspace defaults**

Add to `DEFAULT_WORKSPACE_STATE`:

```js
taskPacks: [],
ingestionRuns: [],
```

Also add `taskPacks` and `ingestionRuns` to the array-normalization list.

- [ ] **Step 2: Extend TypeScript types**

Add these exported types to `app/workbench-preview/src/types/index.ts`:

```ts
export type AgentTaskPackStatus = 'draft' | 'ready_to_copy' | 'copied' | 'artifact_returned' | 'ingested' | 'archived'
export type ArtifactStatus = 'submitted' | 'parsing' | 'parsed' | 'parse_failed' | 'reviewed' | 'rejected'
export type IngestionRunStatus = 'queued' | 'running' | 'waiting_review' | 'approved' | 'rejected' | 'failed'

export interface AgentTaskPack {
  taskPackId: string;
  workflowStepId: string;
  taskType: string;
  targetAgent: string;
  sourceInputs: Record<string, unknown>;
  projectContextSnapshot: Record<string, unknown>;
  promptMarkdown: string;
  expectedArtifactSchema: {
    schemaName: string;
    requiredFields: string[];
    format: string;
  };
  forbiddenActions: string[];
  humanChecklist: string[];
  status: AgentTaskPackStatus;
  createdAt: string;
}

export interface ExternalArtifact {
  artifactId: string;
  taskPackId: string;
  workflowStepId: string;
  format: 'json' | 'markdown' | 'csv' | 'mixed_text';
  rawContent: string;
  sourceAgent: string;
  status: ArtifactStatus;
  submittedAt: string;
}

export interface IngestionRun {
  ingestionRunId: string;
  artifactId: string;
  taskPackId: string;
  workflowStepId: string;
  parserPromptId: string;
  status: IngestionRunStatus;
  parsedObjects: Record<string, unknown>;
  validationResult: {
    valid: boolean;
    qualityScore: number;
    missingFields: string[];
    warnings: string[];
  };
  humanReviewItems: string[];
  canAdvance: boolean;
  writePlan: Array<{ target: string; action: string; summary: string }>;
  reviewDecision: null | {
    decision: 'approved' | 'rejected';
    reviewer: string;
    notes: string;
    reviewedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

Extend `WorkspaceState`:

```ts
taskPacks: AgentTaskPack[];
artifacts: WorkspaceArtifact[];
externalArtifacts: ExternalArtifact[];
ingestionRuns: IngestionRun[];
```

If naming `artifacts` conflicts with existing `WorkspaceArtifact`, keep existing `artifacts` for output references and use `externalArtifacts` for external AI returns.

- [ ] **Step 3: Run TypeScript build**

Run:

```bash
cd app/workbench-preview
npm run build
```

Expected: PASS after all type references are adjusted.

---

## Task 3: Backend Workflow Actions And APIs

**Files:**
- Create: `app/workbench-preview/server/agent-workflow-actions.mjs`
- Modify: `app/workbench-preview/server/site-reading-actions.mjs`
- Modify: `app/workbench-preview/server/api-server.mjs`

- [ ] **Step 1: Implement `AgentWorkflowError`**

In `agent-workflow-actions.mjs`:

```js
export class AgentWorkflowError extends Error {
  constructor(statusCode, code, message) {
    super(message)
    this.statusCode = statusCode
    this.code = code
  }
}
```

- [ ] **Step 2: Implement `generateTaskPack` for `site_read`**

Behavior:

- Require `state.project`.
- Accept only `workflowStepId === 'site_connection_reading'` and `taskType === 'site_read'` in phase 1.
- Create Chinese Markdown prompt with:
  - 项目上下文
  - 执行目标
  - 禁止事项
  - 输出 JSON Schema: `site_read_snapshot_v1`
  - 人工检查清单
- Push to `state.taskPacks`.
- Add a lightweight `WorkspaceArtifact` reference with type `agent_task_pack`.

- [ ] **Step 3: Implement `submitArtifact`**

Behavior:

- Require existing task pack.
- Require non-empty `rawContent`.
- If `format === 'json'`, parse JSON immediately and return `invalid_artifact` on invalid JSON.
- Store in `state.externalArtifacts`.
- Mark matching task pack as `artifact_returned`.

- [ ] **Step 4: Implement `runArtifactIngestion`**

Behavior:

- Require artifact exists.
- For phase 1, only support `workflowStepId === 'site_connection_reading'`.
- Parse JSON content.
- Validate:
  - `pages` is a non-empty array.
  - Each page has `url`, `title`, `pageType`.
  - `schemaVersion` is `site_read_snapshot_v1`.
- Convert to `SiteReadSnapshot` shape but do not write it to `siteReadSnapshots` yet.
- Create `IngestionRun` with `status: 'waiting_review'`.
- Set `canAdvance` only when validation is valid.
- Mark artifact as `parsed`.
- Mark task pack as `ingested`.

- [ ] **Step 5: Implement `reviewIngestionRun`**

Behavior:

- Require existing ingestion run.
- Require decision is `approved` or `rejected`.
- If rejected: mark run `rejected`, mark artifact `rejected`, do not write snapshot.
- If approved and `canAdvance` is false: return `409 cannot_advance`.
- If approved and valid: write parsed `SiteReadSnapshot` to `state.siteReadSnapshots`, add `site_read_snapshot` artifact reference, mark run `approved`, mark artifact `reviewed`.

- [ ] **Step 6: Add API routes**

Add routes:

```text
POST /api/task-packs/generate
GET /api/task-packs
GET /api/task-packs/:taskPackId
POST /api/artifacts
GET /api/artifacts
POST /api/ingestion-runs
GET /api/ingestion-runs
GET /api/ingestion-runs/:ingestionRunId
POST /api/ingestion-runs/:ingestionRunId/review
```

Every error response must use:

```json
{
  "error": {
    "code": "中文或英文稳定代码",
    "message": "中文说明"
  }
}
```

- [ ] **Step 7: Run RED test again until GREEN**

Run:

```bash
cd app/workbench-preview
node tests/agent-workflow-contract.test.mjs
```

Expected: PASS.

- [ ] **Step 8: Run all backend tests**

Run:

```bash
cd app/workbench-preview
npm run test:all
```

Expected: PASS.

- [ ] **Step 9: Commit backend workflow layer**

```bash
git add app/workbench-preview/server app/workbench-preview/src/types/index.ts app/workbench-preview/tests/agent-workflow-contract.test.mjs app/workbench-preview/package.json
git commit -m "feat: add site read agent workflow APIs"
```

---

## Task 4: Frontend API Client And Project Center Wiring

**Files:**
- Modify: `app/workbench-preview/src/api/workspace.ts`
- Modify: `app/workbench-preview/src/App.tsx`

- [ ] **Step 1: Add frontend API helpers**

Add to `workspace.ts`:

```ts
export async function generateTaskPack(input: {
  workflowStepId: string;
  taskType: string;
  targetAgent: string;
  userInput?: string;
}) {
  return requestJson<WorkspaceResponse & { taskPack: AgentTaskPack }>('/api/task-packs/generate', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function submitArtifact(input: {
  taskPackId: string;
  sourceAgent: string;
  format: 'json' | 'markdown' | 'csv' | 'mixed_text';
  rawContent: string;
}) {
  return requestJson<WorkspaceResponse & { artifact: ExternalArtifact }>('/api/artifacts', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function runArtifactIngestion(input: { artifactId: string }) {
  return requestJson<WorkspaceResponse & { ingestionRun: IngestionRun }>('/api/ingestion-runs', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function reviewIngestionRun(ingestionRunId: string, input: {
  decision: 'approved' | 'rejected';
  reviewer: string;
  notes: string;
}) {
  return requestJson<WorkspaceResponse & { ingestionRun: IngestionRun }>(`/api/ingestion-runs/${encodeURIComponent(ingestionRunId)}/review`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
```

- [ ] **Step 2: Add stage state in `App.tsx`**

Add state near existing workspace state:

```ts
const [siteReadTaskPack, setSiteReadTaskPack] = useState<AgentTaskPack | null>(null)
const [siteReadArtifactText, setSiteReadArtifactText] = useState('')
const [siteReadArtifact, setSiteReadArtifact] = useState<ExternalArtifact | null>(null)
const [siteReadIngestion, setSiteReadIngestion] = useState<IngestionRun | null>(null)
const [siteReadAgent, setSiteReadAgent] = useState('openclaw')
```

- [ ] **Step 3: Add handlers**

Add handlers:

```ts
async function createSiteReadTaskPack() {
  setWorkspaceBusy(true)
  try {
    const response = await generateTaskPack({
      workflowStepId: 'site_connection_reading',
      taskType: 'site_read',
      targetAgent: siteReadAgent,
      userInput: '请读取公开页面并输出 site_read_snapshot_v1。',
    })
    setWorkspace(response.workspace)
    setWorkflow(response.workflow)
    setSiteReadTaskPack(response.taskPack)
    showToast('已生成站点读取任务包')
  } catch (error) {
    setWorkspaceError(error instanceof Error ? error.message : '生成任务包失败。')
  } finally {
    setWorkspaceBusy(false)
  }
}
```

Use the same pattern for submit, ingest, approve, and reject.

- [ ] **Step 4: Insert `StageActionPanel` in `ProjectCenterPage`**

Place it above the existing project form.

It must show:

- `生成站点读取任务包`
- `复制任务包`
- `回填 Artifact`
- `AI 解析校验`
- `人工批准入库`
- `驳回并保留原文`

- [ ] **Step 5: Preserve existing local mock snapshot action**

Keep the old “生成本地模拟读取快照” as a secondary/debug action labeled:

```text
开发预览：生成本地模拟快照
```

Do not make it the primary workflow path.

- [ ] **Step 6: Run build**

Run:

```bash
cd app/workbench-preview
npm run build
```

Expected: PASS.

---

## Task 5: Global Copy And Settings Corrections

**Files:**
- Modify: `app/workbench-preview/src/App.tsx`
- Modify: `app/workbench-preview/src/Tutorial.tsx`

- [ ] **Step 1: Top bar language**

Update wording to communicate:

```text
程序内 AI：任务包生成 / 回填解析
外部智能体：抓取 / 搜索 / 审计 / 调研
WordPress 写入：关闭
```

- [ ] **Step 2: AI Workbench page title**

Keep route `/ai-workbench`, but update visible title to:

```text
智能体任务中心
```

Subtitle:

```text
这里管理程序内 AI 生成的任务包、外部智能体回填的 Artifact，以及回填解析和人工审核记录。
```

- [ ] **Step 3: Settings boundary**

Settings must show:

```text
程序内 AI API：用于任务包生成和 Artifact 解析
复杂执行：由 ChatGPT / Claude / OpenClaw 等外部智能体完成
网页抓取：外部智能体完成
联网搜索：外部智能体完成
WordPress 写入：关闭
自动发布：关闭
```

- [ ] **Step 4: Tutorial first-use flow**

Update tutorial so first module says:

```text
填写项目档案 → 生成站点读取任务包 → 复制给外部智能体 → 回填 site_read_snapshot_v1 → 程序内 AI 解析校验 → 人工审核 → 进入网站审计
```

- [ ] **Step 5: Run build**

Run:

```bash
cd app/workbench-preview
npm run build
```

Expected: PASS.

---

## Task 6: Browser Verification

**Files:**
- Create or modify: `app/workbench-preview/tests/agent_workflow_e2e.py`

- [ ] **Step 1: Write Playwright verification**

The browser test should:

- Open `/project-center`.
- Confirm existing thick UI still has project center content.
- Save project profile if empty.
- Click `生成站点读取任务包`.
- Confirm `site_read_snapshot_v1` appears.
- Paste valid JSON Artifact.
- Click `AI 解析校验`.
- Confirm quality or validation result appears.
- Click `人工批准入库`.
- Confirm Overview or workflow status moves to website audit.

- [ ] **Step 2: Run the browser test**

Run while preview service is active:

```bash
cd app/workbench-preview
python tests/agent_workflow_e2e.py
```

Expected: PASS.

- [ ] **Step 3: Run full verification**

Run:

```bash
cd app/workbench-preview
npm run test:all
npm run build
```

Expected: PASS.

- [ ] **Step 4: Commit frontend workflow wiring**

```bash
git add app/workbench-preview/src app/workbench-preview/tests app/workbench-preview/package.json
git commit -m "feat: wire site read workflow into project center"
```

---

## Task 7: Push And Check GitHub

**Files:**
- No file changes.

- [ ] **Step 1: Check clean state**

Run:

```bash
git status -sb
```

Expected:

```text
## main...origin/main
```

or ahead by local commits only.

- [ ] **Step 2: Push**

Run:

```bash
git push
```

Expected: remote `main` updates without force.

- [ ] **Step 3: Confirm latest commit**

Run:

```bash
gh api repos/jinhongsop-ux/B2B-SEO-OS/commits/main --jq '{sha:.sha, message:.commit.message, url:.html_url}'
```

Expected: latest message is the final phase 1 commit.

---

## Self-Review

Spec coverage:

- AgentTaskPack generation: Task 1, Task 3, Task 4.
- Artifact return/import: Task 1, Task 3, Task 4.
- Program-side AI parsing and validation: Task 1, Task 3.
- Human review and stage advance: Task 1, Task 3, Task 4.
- Preserve thick UI: Task 4, Task 5, Task 6.
- Settings/tutorial wording: Task 5.
- Verification: Task 1, Task 3, Task 6.

Placeholder scan:

- No unfinished placeholder markers or unspecified implementation steps are intentionally left.

Scope check:

- This plan intentionally implements only global correction and the first workflow module. Later modules will reuse the same `TaskPack → Artifact → IngestionRun → ReviewGate` pattern.
