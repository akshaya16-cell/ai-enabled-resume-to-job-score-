export type FitVerdict =
  | 'Strong Fit'
  | 'Competitive Fit'
  | 'Partial Fit'
  | 'Low Alignment';

export type RequirementStatus = 'Matched' | 'Partial' | 'Missing';

export type RequirementImportance = 'Must Have' | 'Preferred';

export interface RubricWeights {
  coreSkills: number;
  experienceImpact: number;
  domainAlignment: number;
  leadershipCommunication: number;
}

export interface DimensionScores {
  coreSkills: number;
  experienceImpact: number;
  domainAlignment: number;
  leadershipCommunication: number;
}

export interface DimensionRationales {
  coreSkills: string;
  experienceImpact: string;
  domainAlignment: string;
  leadershipCommunication: string;
}

export interface RequirementEvidence {
  requirement: string;
  category: string;
  importance: RequirementImportance;
  status: RequirementStatus;
  evidence: string;
}

export interface BulletRewrite {
  original: string;
  improved: string;
  rationale: string;
}

export interface PipelineTelemetry {
  model: string;
  embeddingModel: string | null;
  vectorSimilarity: number | null;
  coverageScore: number;
  rubricScore: number;
  inferenceMs: number;
  evaluatedAt: string;
  inputFormat: 'text' | 'pdf' | 'docx';
  extractedCharacters: number;
  pageCount: number | null;
}

export interface MatchAnalysisResult {
  id: string;
  candidateName: string;
  detectedRole: string;
  targetRole: string;
  overallScore: number;
  fitVerdict: FitVerdict;
  executiveSummary: string;
  dimensionScores: DimensionScores;
  dimensionRationales: DimensionRationales;
  weightsUsed: RubricWeights;
  requirementsMatrix: RequirementEvidence[];
  matchedSkills: string[];
  missingSkills: string[];
  candidateRecommendations: string[];
  bulletRewrites: BulletRewrite[];
  recruiterInterviewProbes: string[];
  telemetry: PipelineTelemetry;
  source?: 'live' | 'baseline';
}

export interface UploadedDocumentPayload {
  fileName: string;
  mimeType: string;
  data: string;
}

export interface ExtractDocumentResponse {
  text: string;
  fileName: string;
  format: 'pdf' | 'docx' | 'text';
  characterCount: number;
  pageCount: number | null;
  usedOcrFallback: boolean;
}

export interface MatchRequestPayload {
  resumeText?: string;
  resumeFile?: UploadedDocumentPayload;
  jobDescription: string;
  weights: RubricWeights;
  candidateLabel?: string;
  targetRole?: string;
}

export interface RolePreset {
  id: string;
  label: string;
  industry: string;
  targetRole: string;
  candidateName: string;
  jobDescription: string;
  resumeText: string;
  weights: RubricWeights;
  baselineResult: MatchAnalysisResult;
}

export interface CloudPipelineStage {
  index: string;
  title: string;
  cloudLayer: string;
  aiComponent: string;
  summary: string;
  mechanism: string;
  inputContract: string;
  outputContract: string;
  latencyTarget: string;
}
