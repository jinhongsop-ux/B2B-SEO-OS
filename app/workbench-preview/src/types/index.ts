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
  // D0 扩展字段
  leadGoal?: LeadGoal;
  techStack?: TechStack;
  searchLanguages?: string[];
  productType?: string;
  specialConcerns?: string;
  knownCompetitors?: string[];
  knownImportantPages?: string[];
  wordpressAccess?: 'has_admin' | 'has_editor' | 'frontend_only' | 'none';
  seoPlugin?: string;
  hasWooCommerce?: boolean;
  estimatedPageCount?: number;
}

export interface LeadGoal {
  primaryGoal: string;
  secondaryGoals: string[];
  rfqFormFields: string[];
  conversionPaths: Array<{
    pageType: string;
    primaryCTA: string;
    formType: string;
  }>;
}

export interface TechStack {
  cms: 'wordpress';
  pageBuilder: 'elementor' | 'gutenberg' | 'other' | '';
  ecommerceMode: 'woocommerce_catalog' | 'woocommerce_quote' | 'none' | '';
  acfEnabled: boolean;
  formPlugin: string;
  trackingStack: {
    gtm: boolean;
    ga4: boolean;
    gsc: boolean;
  };
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
  mode: AiMode;
  aiApiEnabled: boolean;
  aiProvider: AiProvider;
  aiModel: string;
  aiApiKeyConfigured: boolean;
  wordpressWritesEnabled: boolean;
  runtimeDir: string;
  promptCount: number;
}

export type AiMode = 'manual_mock' | 'real_api'
export type AiProvider = 'openai_compatible' | 'xiaomi_mimo' | 'custom'

export interface AiSettings {
  mode: AiMode;
  provider: AiProvider;
  endpoint: string;
  model: string;
  temperature: number;
  maxTokens: number;
  requestTimeoutMs: number;
  apiKeyConfigured: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AiConnectionTestResult {
  ok: boolean;
  mode: AiMode;
  provider: AiProvider;
  model: string;
  message: string;
  latencyMs: number;
  aiRunId?: string;
}

export interface AiGenerateResult {
  aiRunId: string;
  content: string;
  mode: AiMode;
  provider: AiProvider;
  model: string;
}

export interface AiCallRun {
  aiRunId: string;
  purpose: string;
  mode: AiMode;
  provider: AiProvider;
  model: string;
  status: 'running' | 'done' | 'failed';
  inputMessageCount: number;
  requestPreview: Array<{ role: string; content: string }>;
  outputPreview: string;
  errorMessage: string;
  startedAt: string;
  completedAt: string | null;
  latencyMs: number;
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

// ===== B2B Knowledge Base (D0-D8 integration) =====
export interface KnowledgeBase {
  // S0 - Project Setup
  businessModel: BusinessModel | null;
  // S1 - Site Read
  siteReadSnapshot: SiteReadSnapshot | null;
  // S2 - Site Audit
  siteAuditReport: SiteAuditReport | null;
  // S3 - B2B Context & Evidence
  b2bContextEvidence: B2BContextEvidence | null;
  // D1 - Industry Knowledge
  knowledgeB2B: KnowledgeB2B | null;
  // D2 - Company & Brand
  companyProfile: CompanyProfile | null;
  capability: Capability | null;
  trustEvidence: TrustEvidence | null;
  brandVoiceB2B: BrandVoiceB2B | null;
  // S4 - Seed Keywords
  seedKeywordPlan: SeedKeywordPlan | null;
  // S7 - Keyword Database
  keywordDatabase: KeywordRecord[];
  // S8 - Keyword Assignments
  keywordAssignments: KeywordAssignment[];
  // S9 - Page Fixes
  pageFixPlan: PageFixPlan | null;
  // S10 - Unused Keyword Clusters
  unusedKeywordClusters: ClusterRecord[];
  // S11 - Content Opportunities
  contentOpportunities: ContentOpportunity[];
  // S12 - Content Handoff
  contentHandoffPackages: ContentHandoff[];
  // S13 - QA Reports
  qaReports: QAReport[];
  // S14 - Monitoring
  monitoringReports: MonitoringReport[];
}

export interface BusinessModel {
  siteType: string;
  targetMarket: string[];
  targetBuyerRoles: Array<{
    role: string;
    companyType: string;
    procurementGoal: string;
    coreConcerns: string;
  }>;
  businessModel: string;
  primaryConversionGoal: string;
  secondaryGoals: string[];
  supplyChainIdentity: string;
  valuePropositions: string[];
  riskBoundaries: string[];
  launchPriority: {
    p0: string[];
    p1: string[];
    p2: string[];
  };
}

export interface SiteAuditReport {
  reportId: string;
  summary: string;
  moduleReports: Array<{
    module: string;
    status: string;
    findings: string[];
  }>;
  findings: Array<{
    id: string;
    category: string;
    priority: 'blocking' | 'normal';
    problem: string;
    affectedUrls: string[];
    evidence: Array<{ url: string; note: string }>;
    impact: string;
    recommendedAction: string;
    requiresDeveloper: boolean;
  }>;
  createdAt: string;
}

export interface B2BContextEvidence {
  contextEntities: Array<{
    entityId: string;
    name: string;
    type: string;
    attributes: Record<string, unknown>;
    confidence: 'explicit' | 'inferred';
  }>;
  evidenceItems: Array<{
    evidenceId: string;
    type: string;
    url: string;
    note: string;
  }>;
  entityEvidenceLinks: Array<{
    entityId: string;
    evidenceId: string;
    relation: 'supported_by' | 'mentioned_on' | 'affected_by_finding' | 'needs_more_evidence';
  }>;
}

export interface KnowledgeB2B {
  terminology: Array<{ term: string; definition: string; category: string }>;
  applications: Array<{ industry: string; useCase: string; endProduct: string }>;
  materials: Array<{ name: string; properties: string; commonUses: string[] }>;
  processes: Array<{ name: string; description: string; advantages: string[] }>;
  buyerFAQ: Array<{ question: string; answer: string; category: string }>;
  objections: Array<{ concern: string; mitigation: string; evidenceNeeded: string }>;
  competitorContext: {
    competitors: Array<{
      domain: string;
      positioning: string;
      strengths: string[];
      weaknesses: string[];
    }>;
  };
  procurementJourney: {
    roles: Array<{
      role: string;
      responsibility: string;
      keyConcerns: string[];
    }>;
    selectionCriteria: string[];
  };
}

export interface CompanyProfile {
  siteName: string;
  positioning: {
    oneLineDescription: string;
    industry: string;
    differentiator: string;
  };
  targetAudience: {
    primaryRoles: string[];
    geographicMarkets: string[];
  };
  supplierIdentity: {
    type: string;
    yearsEstablished: number | null;
    employeeCount: number | null;
  };
  coreValuePropositions: Array<{
    proposition: string;
    evidenceStatus: string;
  }>;
  mustSay: string[];
  mustNotSay: string[];
}

export interface Capability {
  productCapabilities: Array<{
    productLine: string;
    materials: string[];
    moq: string;
    leadTime: string;
  }>;
  customizationCapabilities: Array<{
    type: string;
    description: string;
    minimumOrder: string;
  }>;
  qualityControl: {
    system: string;
    inspectionPoints: string[];
    certifications: Array<{ name: string; issuingBody: string; verified: boolean }>;
  };
  samplePolicy: {
    available: boolean;
    freeSamples: boolean;
    sampleLeadTime: string;
  };
}

export interface TrustEvidence {
  factoryImages: Array<{ id: string; description: string; verified: boolean }>;
  certificates: Array<{ id: string; name: string; verified: boolean }>;
  caseStudies: Array<{ id: string; clientIndustry: string; verified: boolean }>;
  publicClaims: Array<{ claim: string; evidenceStatus: string; safeAlternative: string }>;
  needsEvidence: Array<{ claim: string; requiredEvidence: string; priority: string }>;
  doNotClaim: Array<{ claim: string; reason: string }>;
}

export interface BrandVoiceB2B {
  toneOfVoice: {
    overall: string;
    formality: string;
    technicalDepth: string;
  };
  mustSay: Array<{ message: string; applicablePages: string[] }>;
  mustNotSay: Array<{ phrase: string; reason: string; safeAlternative: string }>;
  pageToneRules: Array<{
    pageType: string;
    tone: string;
    doInclude: string[];
    avoid: string[];
  }>;
}

export interface SeedKeywordPlan {
  seedGroups: Array<{
    seedGroupId: string;
    name: string;
    tier: 'T1' | 'T2' | 'T3';
    seeds: Array<{
      keyword: string;
      chineseExplanation: string;
      productLine: string;
      priority: string;
      toolInstruction: string;
    }>;
    toolInstructions: string[];
  }>;
  researchInstructions: string[];
  competitorResearchSeeds: string[];
  negativeDirections: string[];
}

export interface KeywordRecord {
  keywordId: string;
  keyword: string;
  sourceTools: string[];
  volume: number | null;
  kd: number | null;
  competition: number | null;
  cpc: number | null;
  intent: string;
  sourceSeedGroupIds: string[];
  status: string;
  notes: string;
}

export interface KeywordAssignment {
  assignmentId: string;
  keywordId: string;
  status: 'unreviewed' | 'approved' | 'skipped' | 'deferred' | 'assigned_existing_page' | 'assigned_new_opportunity';
  assignedUrl: string | null;
  assignedPageType: string | null;
  reviewerNotes: string;
}

export interface PageFixPlan {
  pageFixes: Array<{
    fixId: string;
    affectedUrl: string;
    targetKeywords: string[];
    relatedFindings: string[];
    recommendedChanges: Array<{
      module: string;
      action: string;
      content: string;
    }>;
    requiresDeveloper: boolean;
    status: 'pending' | 'in_progress' | 'completed';
  }>;
}

export interface ClusterRecord {
  clusterId: string;
  keywords: string[];
  intent: string;
  buyerStage: string;
  suggestedPageType: string;
  businessEntityLinks: string[];
}

export interface QAReport {
  reportId: string;
  targetId: string;
  targetType: string;
  checks: Array<{
    check: string;
    passed: boolean;
    detail: string;
  }>;
  blockingIssues: string[];
  createdAt: string;
}

export interface MonitoringReport {
  reportId: string;
  period: string;
  indexedPages: number;
  queries: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    avgPosition: number;
  }>;
  leadSignals: Array<{
    source: string;
    count: number;
    quality: string;
  }>;
  recommendedNextActions: string[];
  createdAt: string;
}
