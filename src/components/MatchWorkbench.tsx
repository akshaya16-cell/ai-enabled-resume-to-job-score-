import { useState, type ChangeEvent, type DragEvent } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Loader2,
  Printer,
  RotateCcw,
  SlidersHorizontal,
  TrendingUp,
  Upload,
  XCircle,
} from 'lucide-react';
import { DEFAULT_WEIGHTS, ROLE_PRESETS } from '../data/presets';
import type {
  DimensionScores,
  ExtractDocumentResponse,
  FitVerdict,
  MatchAnalysisResult,
  RequirementEvidence,
  RequirementStatus,
  RubricWeights,
} from '../types/match';

interface MatchWorkbenchProps {
  activeResult: MatchAnalysisResult | null;
  onResultGenerated: (result: MatchAnalysisResult) => void;
}

type ReportTab = 'matrix' | 'seeker' | 'recruiter';

function normalizeWeights(weights: RubricWeights): RubricWeights {
  const sum =
    weights.coreSkills +
    weights.experienceImpact +
    weights.domainAlignment +
    weights.leadershipCommunication;
  if (sum <= 0) {
    return { ...DEFAULT_WEIGHTS };
  }
  const core = Math.round((weights.coreSkills / sum) * 100);
  const exp = Math.round((weights.experienceImpact / sum) * 100);
  const dom = Math.round((weights.domainAlignment / sum) * 100);
  const lead = Math.max(0, 100 - core - exp - dom);
  return {
    coreSkills: core,
    experienceImpact: exp,
    domainAlignment: dom,
    leadershipCommunication: lead,
  };
}

function computeRubricScore(scores: DimensionScores, weights: RubricWeights): number {
  return Math.round(
    (scores.coreSkills * weights.coreSkills +
      scores.experienceImpact * weights.experienceImpact +
      scores.domainAlignment * weights.domainAlignment +
      scores.leadershipCommunication * weights.leadershipCommunication) /
      100
  );
}

function computeCoverageScore(matrix: RequirementEvidence[]): number {
  if (!matrix.length) return 50;
  let earned = 0;
  let possible = 0;
  for (const item of matrix) {
    const reqWeight = item.importance === 'Must Have' ? 2 : 1;
    possible += reqWeight;
    if (item.status === 'Matched') earned += reqWeight;
    else if (item.status === 'Partial') earned += reqWeight * 0.5;
  }
  return possible === 0 ? 50 : Math.round((earned / possible) * 100);
}

function determineVerdict(score: number): FitVerdict {
  if (score >= 85) return 'Strong Fit';
  if (score >= 70) return 'Competitive Fit';
  if (score >= 50) return 'Partial Fit';
  return 'Low Alignment';
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = typeof reader.result === 'string' ? reader.result : '';
      resolve(resultStr.includes(',') ? resultStr.split(',')[1] : resultStr);
    };
    reader.onerror = () => reject(new Error(`Could not read file "${file.name}".`));
    reader.readAsDataURL(file);
  });
}

function VerdictIndicator({ verdict }: { verdict: FitVerdict }) {
  if (verdict === 'Strong Fit') {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
        <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
        Strong Fit
      </span>
    );
  }
  if (verdict === 'Competitive Fit') {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700">
        <TrendingUp className="w-4 h-4 shrink-0" aria-hidden="true" />
        Competitive Fit
      </span>
    );
  }
  if (verdict === 'Partial Fit') {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700">
        <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
        Partial Fit
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-700">
      <XCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
      Low Alignment
    </span>
  );
}

function StatusCell({ status }: { status: RequirementStatus }) {
  if (status === 'Matched') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 whitespace-nowrap">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        Matched
      </span>
    );
  }
  if (status === 'Partial') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 whitespace-nowrap">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        Partial
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 whitespace-nowrap">
      <XCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      Missing
    </span>
  );
}

export function MatchWorkbench({
  activeResult,
  onResultGenerated,
}: MatchWorkbenchProps) {
  const initialPreset = ROLE_PRESETS[0];
  const [selectedPresetId, setSelectedPresetId] = useState<string>(initialPreset.id);
  const [reportTab, setReportTab] = useState<ReportTab>('matrix');

  const [resumeText, setResumeText] = useState<string>(initialPreset.resumeText);
  const [jobDescription, setJobDescription] = useState<string>(initialPreset.jobDescription);
  const [rawWeights, setRawWeights] = useState<RubricWeights>(initialPreset.weights);
  const [showWeights, setShowWeights] = useState<boolean>(false);

  const [resumeMeta, setResumeMeta] = useState<{
    fileName: string;
    format: string;
    characterCount: number;
    pageCount: number | null;
    usedOcrFallback: boolean;
  } | null>(null);

  const [jdMeta, setJdMeta] = useState<{
    fileName: string;
    characterCount: number;
  } | null>(null);

  const [isExtractingResume, setIsExtractingResume] = useState<boolean>(false);
  const [isExtractingJd, setIsExtractingJd] = useState<boolean>(false);
  const [isDraggingResume, setIsDraggingResume] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  const normalizedWeights = normalizeWeights(rawWeights);

  const handleSelectPreset = (presetId: string) => {
    const preset = ROLE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setSelectedPresetId(preset.id);
    setResumeText(preset.resumeText);
    setJobDescription(preset.jobDescription);
    setRawWeights(preset.weights);
    setResumeMeta(null);
    setJdMeta(null);
    setErrorMessage(null);
    onResultGenerated(preset.baselineResult);
  };

  const handleClearInputs = () => {
    setSelectedPresetId('');
    setResumeText('');
    setJobDescription('');
    setResumeMeta(null);
    setJdMeta(null);
    setErrorMessage(null);
  };

  const extractFileToText = async (file: File): Promise<ExtractDocumentResponse> => {
    if (file.size > 8 * 1024 * 1024) {
      throw new Error(`"${file.name}" exceeds the 8 MB limit.`);
    }
    const lower = file.name.toLowerCase();
    const supported =
      lower.endsWith('.pdf') ||
      lower.endsWith('.docx') ||
      lower.endsWith('.txt') ||
      lower.endsWith('.md') ||
      file.type === 'application/pdf' ||
      file.type.startsWith('text/');
    if (!supported) {
      throw new Error(
        `Unsupported format for "${file.name}". Upload a PDF (.pdf), Word (.docx), TXT (.txt), or Markdown (.md) file.`
      );
    }

    const base64 = await readFileAsBase64(file);
    const res = await fetch('/api/extract-document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        mimeType: file.type,
        data: base64,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || `Failed to read "${file.name}".`);
    }
    return data as ExtractDocumentResponse;
  };

  const processResumeFile = async (file: File) => {
    setErrorMessage(null);
    setIsExtractingResume(true);
    try {
      const extracted = await extractFileToText(file);
      setResumeText(extracted.text);
      setResumeMeta({
        fileName: extracted.fileName,
        format: extracted.format,
        characterCount: extracted.characterCount,
        pageCount: extracted.pageCount,
        usedOcrFallback: extracted.usedOcrFallback,
      });
      setSelectedPresetId('');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to extract resume file.');
    } finally {
      setIsExtractingResume(false);
    }
  };

  const handleResumeFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void processResumeFile(file);
    }
    e.target.value = '';
  };

  const handleResumeDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDraggingResume(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (!files.length) return;
    void processResumeFile(files[0]);
  };

  const handleJdFileInput = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setErrorMessage(null);
    setIsExtractingJd(true);
    try {
      const extracted = await extractFileToText(file);
      setJobDescription(extracted.text);
      setJdMeta({
        fileName: extracted.fileName,
        characterCount: extracted.characterCount,
      });
      setSelectedPresetId('');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to extract job description file.');
    } finally {
      setIsExtractingJd(false);
    }
  };

  const handleWeightChange = (key: keyof RubricWeights, value: number) => {
    const nextRaw = { ...rawWeights, [key]: value };
    setRawWeights(nextRaw);

    if (activeResult) {
      const nextNorm = normalizeWeights(nextRaw);
      const nextRubric = computeRubricScore(activeResult.dimensionScores, nextNorm);
      const nextCoverage =
        activeResult.telemetry.coverageScore ??
        computeCoverageScore(activeResult.requirementsMatrix);
      const nextOverall = Math.round(nextRubric * 0.7 + nextCoverage * 0.3);
      onResultGenerated({
        ...activeResult,
        weightsUsed: nextNorm,
        overallScore: nextOverall,
        fitVerdict: determineVerdict(nextOverall),
        telemetry: {
          ...activeResult.telemetry,
          rubricScore: nextRubric,
          coverageScore: nextCoverage,
        },
      });
    }
  };

  const handleEvaluate = async () => {
    setErrorMessage(null);
    if (jobDescription.trim().length < 30) {
      setErrorMessage('Enter or upload a complete job description (at least 30 characters).');
      return;
    }
    if (resumeText.trim().length < 30) {
      setErrorMessage('Paste your resume or upload a readable PDF, DOCX, or TXT file first.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          jobDescription,
          weights: normalizedWeights,
          candidateLabel: resumeMeta?.fileName.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' '),
        }),
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error || `Evaluation request failed (${res.status}).`);
      }

      const result = payload as MatchAnalysisResult;
      if (resumeMeta) {
        result.telemetry = {
          ...result.telemetry,
          inputFormat:
            resumeMeta.format === 'pdf'
              ? 'pdf'
              : resumeMeta.format === 'docx'
              ? 'docx'
              : 'text',
          pageCount: resumeMeta.pageCount,
          extractedCharacters: resumeMeta.characterCount,
        };
      }
      onResultGenerated(result);
      setReportTab('matrix');
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Unable to reach the cloud AI scoring service. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadJson = () => {
    if (!activeResult) return;
    const blob = new Blob([JSON.stringify(activeResult, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resumescore-match-${activeResult.candidateName.toLowerCase().replace(/\s+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySummary = async () => {
    if (!activeResult) return;
    const text = `${activeResult.candidateName} — ${activeResult.targetRole}
Overall Match Score: ${activeResult.overallScore}/100 (${activeResult.fitVerdict})
Core Skills: ${activeResult.dimensionScores.coreSkills} | Experience: ${activeResult.dimensionScores.experienceImpact} | Domain: ${activeResult.dimensionScores.domainAlignment} | Leadership: ${activeResult.dimensionScores.leadershipCommunication}
Summary: ${activeResult.executiveSummary}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch {
      // Clipboard blocked in restricted context
    }
  };

  const matchedCount = activeResult
    ? activeResult.requirementsMatrix.filter((r) => r.status === 'Matched').length
    : 0;
  const totalReqCount = activeResult ? activeResult.requirementsMatrix.length : 0;

  const dimensionRows = activeResult
    ? [
        {
          key: 'coreSkills' as const,
          label: 'Core Skills & Tools',
          score: activeResult.dimensionScores.coreSkills,
          weight: activeResult.weightsUsed.coreSkills,
          rationale: activeResult.dimensionRationales.coreSkills,
        },
        {
          key: 'experienceImpact' as const,
          label: 'Experience & Impact',
          score: activeResult.dimensionScores.experienceImpact,
          weight: activeResult.weightsUsed.experienceImpact,
          rationale: activeResult.dimensionRationales.experienceImpact,
        },
        {
          key: 'domainAlignment' as const,
          label: 'Domain Alignment',
          score: activeResult.dimensionScores.domainAlignment,
          weight: activeResult.weightsUsed.domainAlignment,
          rationale: activeResult.dimensionRationales.domainAlignment,
        },
        {
          key: 'leadershipCommunication' as const,
          label: 'Leadership & Comms',
          score: activeResult.dimensionScores.leadershipCommunication,
          weight: activeResult.weightsUsed.leadershipCommunication,
          rationale: activeResult.dimensionRationales.leadershipCommunication,
        },
      ]
    : [];

  return (
    <section id="analyzer" className="py-10 sm:py-12 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Preset & Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200 print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 mr-1">Try a sample role:</span>
            <div
              className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 rounded-lg"
              role="group"
              aria-label="Sample role benchmarks"
            >
              {ROLE_PRESETS.map((preset) => {
                const active = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
                      active
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={handleClearInputs}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0 self-start lg:self-auto cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Clear All
          </button>
        </div>

        <div className="mt-7 grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Left Column: Upload & Inputs */}
          <div
            id="upload-inputs"
            className="xl:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-5 print:hidden scroll-mt-20"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="resume-input" className="text-sm font-semibold text-slate-900">
                  1. Candidate Resume
                </label>
                <label className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md cursor-pointer transition-colors whitespace-nowrap shrink-0">
                  <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                  Upload PDF / DOCX / TXT
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
                    onChange={handleResumeFileInput}
                    className="sr-only"
                  />
                </label>
              </div>

              {/* Drag & Drop Zone */}
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingResume(true);
                }}
                onDragLeave={() => setIsDraggingResume(false)}
                onDrop={handleResumeDrop}
                className={`block border border-dashed rounded-lg p-3.5 text-center transition-colors cursor-pointer ${
                  isDraggingResume
                    ? 'border-blue-700 bg-blue-50/70'
                    : 'border-slate-300 bg-slate-50/60 hover:border-blue-700'
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
                  onChange={handleResumeFileInput}
                  className="sr-only"
                />
                {isExtractingResume ? (
                  <span className="inline-flex items-center gap-2 text-xs font-medium text-blue-700">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                    Extracting document text...
                  </span>
                ) : resumeMeta ? (
                  <div className="flex items-center justify-between gap-2 text-left">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {resumeMeta.fileName}
                      </p>
                      <p className="text-xs text-slate-600 font-mono tabular-nums">
                        Parsed {resumeMeta.characterCount.toLocaleString()} chars
                        {resumeMeta.pageCount ? ` · ${resumeMeta.pageCount} pages` : ''}
                        {resumeMeta.usedOcrFallback ? ' · OCR' : ''}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-emerald-700 whitespace-nowrap">
                      Text Verified
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-600">
                    Drop a <strong className="text-slate-800">PDF, DOCX, or TXT</strong> resume
                    here, or edit the text below
                  </span>
                )}
              </label>

              <textarea
                id="resume-input"
                rows={8}
                value={resumeText}
                onChange={(e) => {
                  setResumeText(e.target.value);
                  setSelectedPresetId('');
                }}
                placeholder="Extracted resume text will appear here, or paste your resume directly..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/15 leading-relaxed resize-y"
              />
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Review or edit extracted text anytime</span>
                <span className="font-mono tabular-nums">{resumeText.length} chars</span>
              </div>
            </div>

            {/* Target Job Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="jd-input" className="text-sm font-semibold text-slate-900">
                  2. Target Job Description
                </label>
                <label className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md cursor-pointer transition-colors whitespace-nowrap shrink-0">
                  {isExtractingJd ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  Upload JD File
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
                    onChange={handleJdFileInput}
                    className="sr-only"
                  />
                </label>
              </div>
              {jdMeta && (
                <p className="text-xs text-emerald-700 font-mono tabular-nums">
                  Loaded {jdMeta.fileName} ({jdMeta.characterCount.toLocaleString()} chars)
                </p>
              )}
              <textarea
                id="jd-input"
                rows={7}
                value={jobDescription}
                onChange={(e) => {
                  setJobDescription(e.target.value);
                  setSelectedPresetId('');
                }}
                placeholder="Paste the full job posting (title, responsibilities, required skills, experience)..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/15 leading-relaxed resize-y"
              />
            </div>

            {/* Rubric Weights */}
            <div className="pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowWeights((prev) => !prev)}
                aria-expanded={showWeights}
                className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-slate-900 py-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 rounded-sm"
              >
                <span className="inline-flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-700" aria-hidden="true" />
                  Scoring Weights
                </span>
                <span className="font-mono text-slate-500 tabular-nums">
                  {normalizedWeights.coreSkills}% / {normalizedWeights.experienceImpact}% /{' '}
                  {normalizedWeights.domainAlignment}% / {normalizedWeights.leadershipCommunication}%
                </span>
              </button>

              {showWeights && (
                <div className="mt-4 space-y-3 pt-3 border-t border-slate-100">
                  {(
                    [
                      { key: 'coreSkills', label: 'Core Skills & Tools' },
                      { key: 'experienceImpact', label: 'Experience & Impact' },
                      { key: 'domainAlignment', label: 'Domain Alignment' },
                      { key: 'leadershipCommunication', label: 'Leadership & Comms' },
                    ] as const
                  ).map((item) => (
                    <div key={item.key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <label htmlFor={`weight-${item.key}`} className="text-slate-700 font-medium">
                          {item.label}
                        </label>
                        <span className="font-mono text-slate-900 tabular-nums">
                          {normalizedWeights[item.key]}%
                        </span>
                      </div>
                      <input
                        id={`weight-${item.key}`}
                        type="range"
                        min={5}
                        max={60}
                        step={5}
                        value={rawWeights[item.key]}
                        onChange={(e) => handleWeightChange(item.key, Number(e.target.value))}
                        className="w-full accent-blue-700 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="p-3.5 rounded-lg border border-red-200 bg-red-50 text-xs text-red-800 leading-relaxed"
              >
                {errorMessage}
              </div>
            )}

            <button
              type="button"
              onClick={handleEvaluate}
              disabled={isLoading || isExtractingResume || isExtractingJd}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 rounded-lg transition-colors whitespace-nowrap cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  Analyzing Resume & Job Match...
                </>
              ) : (
                'Calculate Match Score'
              )}
            </button>
          </div>

          {/* Right Column: Match Analysis Report */}
          <div
            id="match-report"
            className="xl:col-span-7 bg-white border border-slate-200 rounded-xl p-6 sm:p-7 print:col-span-12 print:border-none print:p-0 scroll-mt-20"
          >
            {isLoading ? (
              <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading match report">
                <div className="flex items-start justify-between gap-6 pb-6 border-b border-slate-200">
                  <div className="space-y-2.5 flex-1">
                    <div className="h-3 w-48 bg-slate-200 rounded" />
                    <div className="h-6 w-64 bg-slate-200 rounded" />
                    <div className="h-4 w-full bg-slate-100 rounded" />
                    <div className="h-4 w-4/5 bg-slate-100 rounded" />
                  </div>
                  <div className="h-24 w-32 bg-slate-200 rounded-xl shrink-0" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="h-24 bg-slate-100 rounded-lg" />
                  ))}
                </div>
                <div className="space-y-2.5 pt-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div key={n} className="h-11 bg-slate-100 rounded" />
                  ))}
                </div>
              </div>
            ) : !activeResult ? (
              <div className="py-16 text-center space-y-4">
                <p className="text-base font-semibold text-slate-900">Ready to evaluate</p>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Upload a PDF, DOCX, or TXT resume and paste any job description to generate a
                  detailed match report.
                </p>
                <button
                  type="button"
                  onClick={() => handleSelectPreset(ROLE_PRESETS[0].id)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
                >
                  Load Sample Benchmark
                </button>
              </div>
            ) : (
              <div>
                {/* Report Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-200">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>{activeResult.detectedRole}</span>
                      <span aria-hidden="true">·</span>
                      <span>{activeResult.targetRole}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {activeResult.source === 'live' ? 'Live Cloud AI Score' : 'Sample Benchmark'}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      {activeResult.candidateName}
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
                      {activeResult.executiveSummary}
                    </p>
                  </div>

                  <div className="sm:text-right shrink-0 bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 min-w-[190px]">
                    <p className="text-xs font-medium text-slate-500">Overall Match Score</p>
                    <p className="text-4xl font-bold font-mono text-slate-900 tabular-nums mt-1">
                      {activeResult.overallScore}
                      <span className="text-base font-normal text-slate-500">/100</span>
                    </p>
                    <div className="mt-2">
                      <VerdictIndicator verdict={activeResult.fitVerdict} />
                    </div>
                  </div>
                </div>

                {/* Transparent Sub-Metrics Strip */}
                <dl className="grid grid-cols-3 border-b border-slate-200 divide-x divide-slate-200 py-3.5 text-xs">
                  <div className="pr-3">
                    <dt className="text-slate-500">Requirements Met</dt>
                    <dd className="font-mono font-semibold text-slate-900 mt-0.5 tabular-nums">
                      {matchedCount}/{totalReqCount} ({activeResult.telemetry.coverageScore}%)
                    </dd>
                  </div>
                  <div className="px-3">
                    <dt className="text-slate-500">Weighted Rubric</dt>
                    <dd className="font-mono font-semibold text-slate-900 mt-0.5 tabular-nums">
                      {activeResult.telemetry.rubricScore}/100
                    </dd>
                  </div>
                  <div className="pl-3">
                    <dt className="text-slate-500">Semantic Vector Sim</dt>
                    <dd className="font-mono font-semibold text-slate-900 mt-0.5 tabular-nums">
                      {activeResult.telemetry.vectorSimilarity !== null
                        ? `${Math.round(activeResult.telemetry.vectorSimilarity * 100)}% (${activeResult.telemetry.vectorSimilarity.toFixed(2)})`
                        : '—'}
                    </dd>
                  </div>
                </dl>

                {/* 4-Dimension Breakdown */}
                <div className="py-6 border-b border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                    {dimensionRows.map((dim) => (
                      <div key={dim.key} className="space-y-1.5">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-sm font-semibold text-slate-900">{dim.label}</span>
                          <span className="text-xs font-mono text-slate-600 tabular-nums">
                            {dim.score}/100 <span className="text-slate-400">({dim.weight}% wt)</span>
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-sm overflow-hidden">
                          <div
                            className="h-full bg-blue-700 transition-all duration-300"
                            style={{ width: `${dim.score}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{dim.rationale}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Report Sub-Views */}
                <div className="pt-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-5 print:hidden">
                    <div
                      className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200"
                      role="tablist"
                      aria-label="Report details view"
                    >
                      <button
                        type="button"
                        role="tab"
                        aria-selected={reportTab === 'matrix'}
                        onClick={() => setReportTab('matrix')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          reportTab === 'matrix'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Requirements Matrix
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={reportTab === 'seeker'}
                        onClick={() => setReportTab('seeker')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          reportTab === 'seeker'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Job Seeker Tips
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={reportTab === 'recruiter'}
                        onClick={() => setReportTab('recruiter')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          reportTab === 'recruiter'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Interview & Audit
                      </button>
                    </div>
                  </div>

                  {reportTab === 'matrix' && (
                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                            <th className="py-2.5 px-3.5">Job Requirement</th>
                            <th className="py-2.5 px-3">Priority</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3.5">Resume Evidence</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-xs">
                          {activeResult.requirementsMatrix.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3 px-3.5 align-top">
                                <p className="font-medium text-slate-900">{row.requirement}</p>
                                <p className="text-slate-500 mt-0.5">{row.category}</p>
                              </td>
                              <td className="py-3 px-3 align-top text-slate-600 whitespace-nowrap">
                                {row.importance}
                              </td>
                              <td className="py-3 px-3 align-top">
                                <StatusCell status={row.status} />
                              </td>
                              <td className="py-3 px-3.5 align-top text-slate-600 leading-relaxed">
                                {row.evidence}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {reportTab === 'seeker' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border border-slate-200 rounded-lg p-4">
                          <h3 className="text-xs font-semibold text-slate-900 mb-3">
                            Matched Skills ({activeResult.matchedSkills.length})
                          </h3>
                          <ul className="divide-y divide-slate-100 text-xs">
                            {activeResult.matchedSkills.map((skill) => (
                              <li key={skill} className="py-1.5 flex items-center justify-between text-slate-700">
                                <span>{skill}</span>
                                <span className="text-emerald-700 font-medium">Matched</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="border border-slate-200 rounded-lg p-4">
                          <h3 className="text-xs font-semibold text-slate-900 mb-3">
                            Missing / Under-Evidenced ({activeResult.missingSkills.length})
                          </h3>
                          {activeResult.missingSkills.length === 0 ? (
                            <p className="text-xs text-slate-500">All listed requirements covered.</p>
                          ) : (
                            <ul className="divide-y divide-slate-100 text-xs">
                              {activeResult.missingSkills.map((skill) => (
                                <li key={skill} className="py-1.5 flex items-center justify-between text-slate-700">
                                  <span>{skill}</span>
                                  <span className="text-amber-700 font-medium">Gap</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-2.5">
                          How to Improve Your Match Score
                        </h3>
                        <ol className="space-y-2 text-sm text-slate-700">
                          {activeResult.candidateRecommendations.map((rec, i) => (
                            <li key={i} className="flex gap-2.5 leading-relaxed">
                              <span className="font-mono text-xs text-blue-700 font-semibold pt-1 tabular-nums">
                                0{i + 1}.
                              </span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {activeResult.bulletRewrites.length > 0 && (
                        <div className="space-y-3 pt-2 border-t border-slate-200">
                          <h3 className="text-sm font-semibold text-slate-900">
                            Truthful Bullet Rewrites
                          </h3>
                          {activeResult.bulletRewrites.map((rw, idx) => (
                            <div
                              key={idx}
                              className="border border-slate-200 rounded-lg p-4 space-y-2.5 bg-slate-50/60"
                            >
                              <div>
                                <p className="text-xs font-medium text-slate-500">Original Bullet</p>
                                <p className="text-xs text-slate-600 mt-0.5">{rw.original}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-blue-700">
                                  Recommended Revision
                                </p>
                                <p className="text-sm font-medium text-slate-900 mt-0.5">
                                  {rw.improved}
                                </p>
                              </div>
                              <p className="text-xs text-slate-500">Why it helps: {rw.rationale}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {reportTab === 'recruiter' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-2.5">
                          Targeted Interview Verification Questions
                        </h3>
                        <ul className="space-y-2.5 text-sm text-slate-700">
                          {activeResult.recruiterInterviewProbes.map((probe, idx) => (
                            <li
                              key={idx}
                              className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 leading-relaxed"
                            >
                              <span className="font-mono text-xs text-blue-700 mr-2 tabular-nums">
                                Q{idx + 1}.
                              </span>
                              {probe}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
                          <h3 className="text-xs font-semibold text-slate-700">
                            Document & Cloud Inference Audit
                          </h3>
                        </div>
                        <dl className="grid grid-cols-2 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 text-xs">
                          <div className="p-3.5">
                            <dt className="text-slate-500">Input Format</dt>
                            <dd className="font-mono font-medium text-slate-900 mt-1 tabular-nums">
                              {activeResult.telemetry.inputFormat.toUpperCase()} ·{' '}
                              {activeResult.telemetry.extractedCharacters.toLocaleString()} chars
                            </dd>
                          </div>
                          <div className="p-3.5">
                            <dt className="text-slate-500">AI Models</dt>
                            <dd className="font-mono font-medium text-slate-900 mt-1">
                              {activeResult.telemetry.model}
                              {activeResult.telemetry.embeddingModel
                                ? ` + ${activeResult.telemetry.embeddingModel}`
                                : ''}
                            </dd>
                          </div>
                          <div className="p-3.5">
                            <dt className="text-slate-500">Inference Time</dt>
                            <dd className="font-mono font-medium text-slate-900 mt-1 tabular-nums">
                              {activeResult.telemetry.inferenceMs} ms
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  )}

                  {/* Report Actions */}
                  <div className="mt-6 pt-5 border-t border-slate-200 flex flex-wrap items-center justify-end gap-2 print:hidden">
                    <button
                      type="button"
                      onClick={handleCopySummary}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                    >
                      {copiedSummary ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                          Copy Summary
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" aria-hidden="true" />
                      Print / PDF
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadJson}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" aria-hidden="true" />
                      Export JSON
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
