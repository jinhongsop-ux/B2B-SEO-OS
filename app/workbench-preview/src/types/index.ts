// ===== Project =====
export interface Project {
  projectId: string;
  projectName: string;
  domain: string;
  company: string;
  industry: string;
  targetMarkets: string[];
  supplierIdentity: string;
  coreProducts: string[];
  targetCustomers: string[];
  primaryConversionGoal: string;
  currentStage: string;
  safetyMode: 'read_only';
}

export interface ProjectProfile extends Project {
  createdAt: string;
  updatedAt: string;
}

export interface SiteConnection {
  mode: 'local_mock_read_only';
  readOnly: boolean;
  storesCredentials: boolean;
  wordpressWritesEnabled: boolean;
  uploadsMedia: boolean;
  autoPublishes: boolean;
  domain?: string;
  status?: string;
  lastCheckedAt: string | null;
  notes?: string;
}

// ===== WordPress Snapshot =====
export interface WordPressSnapshot {
  snapshotAt: string;
  pageCount: number;
  postCount: number;
  productCount: number;
  mediaCount: number;
  menuCount: number;
  formCount: number;
  seoFieldCount: number;
  detectedPageTypes: string[];
  detectedForms: string[];
  trustPages: string[];
  seoFields: string[];
  anomalies: string[];
}

export interface WpPage {
  pageId: string;
  wpId: number;
  type: 'page' | 'post' | 'product';
  status: 'publish' | 'draft' | 'private';
  url: string;
  slug: string;
  title: string;
  seoTitle: string;
  metaDescription: string;
  h1: string;
  pageType: string;
  wordCount: number;
  primaryKeyword: string | null;
  suggestedPrimaryKeyword: string | null;
  auditIssueCount: number;
  repairTaskCount: number;
  internalLinkStatus: string;
  modifiedAt: string;
  primaryCta: string;
  formsDetected: string[];
  headings: { level: number; text: string }[];
}

export interface SiteReadSnapshot extends WordPressSnapshot {
  snapshotId: string;
  projectId: string;
  domain: string;
  mode: 'local_mock_read_only' | 'external_agent_artifact';
  pages: WpPage[];
  humanReviewItems: string[];
  sourceArtifactId?: string;
}

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
  parsedObjects: {
    siteReadSnapshot?: SiteReadSnapshot;
    [key: string]: unknown;
  };
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

export type WorkflowStepStatus = 'locked' | 'ready' | 'running' | 'waiting_review' | 'done' | 'blocked'

export interface WorkflowStep {
  stepId: string;
  order: number;
  label: string;
  route: string;
  output: string;
  humanReviewPoint: string;
  readyAction: string;
  status: WorkflowStepStatus;
  blocker: string;
}

export interface WorkflowState {
  steps: WorkflowStep[];
  currentStepId: string;
  currentStepLabel: string;
  currentRoute: string;
  completedCount: number;
  totalCount: number;
  nextAction: string;
  safetyBoundary: {
    aiApiEnabled: boolean;
    wordpressWritesEnabled: boolean;
    storesCredentials: boolean;
    mode: string;
  };
  updatedAt: string;
}

export interface WorkspaceArtifact {
  artifactId: string;
  type: string;
  title: string;
  stepLabel: string;
  sourceId: string;
  route: string;
  createdAt: string;
}

export interface WorkspaceState {
  project: ProjectProfile | null;
  siteConnection: SiteConnection;
  latestSnapshot: SiteReadSnapshot | null;
  snapshotHistory: Array<{
    snapshotId: string;
    snapshotAt: string;
    domain: string;
    pageCount: number;
    postCount: number;
    productCount: number;
    mediaCount: number;
    mode: 'local_mock_read_only' | 'external_agent_artifact';
  }>;
  artifacts: WorkspaceArtifact[];
  taskPacks: AgentTaskPack[];
  externalArtifacts: ExternalArtifact[];
  ingestionRuns: IngestionRun[];
}

// ===== Audit Finding =====
export interface AuditFinding {
  findingId: string;
  source: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  url: string;
  pageId: string | null;
  title: string;
  description: string;
  evidence: string;
  impact: string;
  recommendedAction: string;
  requiresKeywordData: boolean;
  requiresEvidence: boolean;
  requiresHumanReview: boolean;
  canCreateTask: boolean;
  status: 'open' | 'in_progress' | 'resolved' | 'dismissed';
}

// ===== Keyword =====
export interface Keyword {
  keywordId: string;
  keyword: string;
  volume: number;
  kd: number;
  sourceTool: string;
  sourceFile: string;
  seedGroup: string;
  aiIntent: string;
  aiPageType: string;
  aiRelevant: boolean;
  isBrandTerm: boolean;
  isPlatformTerm: boolean;
  isB2CTerm: boolean;
  cleaningReason: string;
  aiConfidence: number;
  status: 'raw_imported' | 'script_cleaned' | 'ai_cleaned' | 'pending_review' | 'approved' | 'rejected' | 'duplicate_intent' | 'hold' | 'assigned_existing_page' | 'unused_valid' | 'super_clustered';
  assignedPageId: string | null;
  assignedUrl: string | null;
  isUsed: boolean;
  isValidUnused: boolean;
  reviewNotes: string;
}

// ===== Task =====
export interface Task {
  taskId: string;
  taskType: string;
  title: string;
  description: string;
  source: string;
  sourceObjectIds: string[];
  priority: 'p0' | 'p1' | 'p2' | 'p3';
  priorityScore: number;
  status: 'todo' | 'in_progress' | 'needs_review' | 'approved' | 'done' | 'blocked' | 'cancelled';
  relatedUrl: string | null;
  relatedPageId: string | null;
  relatedKeywordIds: string[];
  relatedEvidenceIds: string[];
  requiresHumanReview: boolean;
  blockedReason: string;
  acceptanceCriteria: string[];
  nextAction: string;
  whyItMatters: string;
  createdAt: string;
  updatedAt: string;
}

// ===== Evidence =====
export interface Evidence {
  evidenceId: string;
  name: string;
  type: string;
  applicablePages: string[];
  supportedClaims: string[];
  confirmed: boolean;
  canUseInContent: boolean;
  fileStatus: string;
  riskNotes: string;
}

// ===== Asset =====
export interface Asset {
  assetId: string;
  name: string;
  type: string;
  purpose: string;
  relatedPages: string[];
  relatedEvidence: string[];
  altStatus: 'missing' | 'has_alt' | 'needs_review';
  currentAlt: string;
  suggestedAlt: string;
  canUseInContent: boolean;
  confirmed: boolean;
}

// ===== Content Opportunity =====
export interface ContentOpportunity {
  opportunityId: string;
  title: string;
  sourceKeywords: string[];
  cluster: string;
  suggestedContentType: string;
  targetPage: string;
  internalLinkTargets: string[];
  needsEvidence: boolean;
  status: 'idea' | 'brief_pending' | 'handoff_ready' | 'sent' | 'draft_done' | 'qa' | 'published';
  handoffPackage: ContentHandoff | null;
}

export interface ContentHandoff {
  handoffId: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  searchIntent: string;
  targetAudience: string[];
  relatedProductPages: string[];
  relatedSolutionPages: string[];
  relatedTrustPages: string[];
  internalLinkTargets: string[];
  mustNotSay: string[];
  qaRules: string[];
  ctaGoal: string;
}

// ===== Delivery Package =====
export interface DeliveryPackage {
  packageId: string;
  name: string;
  type: string;
  includedModules: string[];
  status: 'draft' | 'ready' | 'exported';
  createdAt: string;
  relatedTasks: string[];
  uncompletedRisks: string[];
  humanReviewItems: string[];
}

// ===== AI Prompt Contract =====
export interface AiPromptContract {
  promptId: string;
  name: string;
  category: string;
  version: string;
  description: string;
  inputFields: string[];
  outputFields: string[];
  requiresHumanReview: boolean;
  canCreateTasks: boolean;
  canWriteWordPress: boolean;
  status: 'active' | 'draft' | 'deprecated';
  lastRunAt: string | null;
  failureHandling: string;
}

// ===== Prompt Registry / Agent Runs =====
export interface PromptDefinition {
  promptId: string;
  name: string;
  category: string;
  version: string;
  status: 'active' | 'draft' | 'deprecated';
  purpose: string;
  inputFields: string[];
  outputFields: string[];
  requiresHumanReview: boolean;
  canCreateTasks: boolean;
  canWriteWordPress: boolean;
  markdownTemplate?: string;
  jsonSchemaSummary?: Record<string, unknown>;
  failureHandling?: string;
  humanReviewItems?: string[];
}

export interface BackendHealth {
  ok: boolean;
  service: string;
  mode: 'manual_mock';
  aiApiEnabled: boolean;
  wordpressWritesEnabled: boolean;
  runtimeDir: string;
  promptCount: number;
}

export interface PromptInputEnvelope {
  runId: string;
  promptId: string;
  projectId: string;
  siteId: string;
  inputContext: Record<string, unknown>;
  userInstruction: string;
  safetyBoundary: {
    readOnly: boolean;
    noAutoPublish: boolean;
    commercialFactsNeedHumanConfirmation: boolean;
    canWriteWordPress: boolean;
    canCallAiApi: boolean;
  };
  createdAt: string;
}

export interface PromptOutputEnvelope {
  runId: string;
  promptId: string;
  status: 'success' | 'partial' | 'failed';
  summaryMarkdown: string;
  structuredOutput: Record<string, unknown>;
  humanReviewRequired: boolean;
  humanReviewItems: string[];
  taskCandidates: Array<Record<string, unknown>>;
  warnings: string[];
  sourceObjectIds: string[];
  createdAt: string;
}

export interface ManualPromptPackage {
  packageId: string;
  promptId: string;
  copyFormat: 'markdown';
  markdown: string;
  inputPreview: Record<string, number>;
  createdAt: string;
}

export type AgentRunStatus = 'queued' | 'running' | 'waiting_for_human' | 'done' | 'failed' | 'cancelled'
export type HumanReviewDecision = 'approved' | 'rejected' | 'revision_needed'

export interface AgentRun {
  runId: string;
  taskType: string;
  promptId: string;
  promptName: string;
  promptVersion: string;
  model: 'manual_mock';
  contextPreset: string;
  inputSources?: string[];
  inputEnvelope?: PromptInputEnvelope;
  manualPromptPackage?: ManualPromptPackage;
  outputEnvelope?: PromptOutputEnvelope;
  status: AgentRunStatus;
  humanReviewRequired: boolean;
  humanReview: {
    decision: 'pending' | HumanReviewDecision;
    reviewer: string;
    notes: string;
    reviewedAt: string | null;
  };
  summaryMarkdown?: string;
  createdAt: string;
  updatedAt: string;
}

// ===== Super Cluster =====
export interface SuperCluster {
  clusterId: string;
  clusterName: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  searchIntent: string;
  recommendedPageType: string;
  recommendedUrl: string;
  recommendedAction: 'new_page_task' | 'content_engine_task' | 'faq_task' | 'hold';
  needsEvidence: boolean;
  internalLinkTargets: string[];
  recommendedCta: string;
  reason: string;
}
