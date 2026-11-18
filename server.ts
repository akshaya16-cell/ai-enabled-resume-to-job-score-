import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import mammoth from 'mammoth';
import path from 'path';
import { extractText } from 'unpdf';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import type {
  DimensionScores,
  ExtractDocumentResponse,
  FitVerdict,
  MatchAnalysisResult,
  MatchRequestPayload,
  RequirementEvidence,
  RubricWeights,
} from './src/types/match.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please configure GEMINI_API_KEY in the Settings > Secrets panel.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function normalizeWeights(weights?: Partial<RubricWeights>): RubricWeights {
  const raw: RubricWeights = {
    coreSkills: Math.max(0, Number(weights?.coreSkills ?? 40)),
    experienceImpact: Math.max(0, Number(weights?.experienceImpact ?? 25)),
    domainAlignment: Math.max(0, Number(weights?.domainAlignment ?? 20)),
    leadershipCommunication: Math.max(0, Number(weights?.leadershipCommunication ?? 15)),
  };
  const sum =
    raw.coreSkills +
    raw.experienceImpact +
    raw.domainAlignment +
    raw.leadershipCommunication;

  if (sum <= 0) {
    return {
      coreSkills: 40,
      experienceImpact: 25,
      domainAlignment: 20,
      leadershipCommunication: 15,
    };
  }

  const core = Math.round((raw.coreSkills / sum) * 100);
  const exp = Math.round((raw.experienceImpact / sum) * 100);
  const dom = Math.round((raw.domainAlignment / sum) * 100);
  const lead = Math.max(0, 100 - core - exp - dom);

  return {
    coreSkills: core,
    experienceImpact: exp,
    domainAlignment: dom,
    leadershipCommunication: lead,
  };
}

function clampScore(value: unknown): number {
  const n = Number(value);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function computeRubricScore(scores: DimensionScores, weights: RubricWeights): number {
  const total =
    (scores.coreSkills * weights.coreSkills +
      scores.experienceImpact * weights.experienceImpact +
      scores.domainAlignment * weights.domainAlignment +
      scores.leadershipCommunication * weights.leadershipCommunication) /
    100;
  return clampScore(total);
}

function computeCoverageScore(matrix: RequirementEvidence[]): number {
  if (!matrix.length) return 50;
  let earned = 0;
  let possible = 0;
  for (const item of matrix) {
    const reqWeight = item.importance === 'Must Have' ? 2 : 1;
    possible += reqWeight;
    if (item.status === 'Matched') {
      earned += reqWeight;
    } else if (item.status === 'Partial') {
      earned += reqWeight * 0.5;
    }
  }
  if (possible === 0) return 50;
  return clampScore((earned / possible) * 100);
}

function determineVerdict(score: number): FitVerdict {
  if (score >= 85) return 'Strong Fit';
  if (score >= 70) return 'Competitive Fit';
  if (score >= 50) return 'Partial Fit';
  return 'Low Alignment';
}

function cosineSimilarity(a: number[], b: number[]): number | null {
  if (!a.length || !b.length || a.length !== b.length) return null;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0) return null;
  return Number(Math.max(0, Math.min(1, dot / denom)).toFixed(2));
}

async function parseUploadedDocument(file: {
  fileName: string;
  mimeType: string;
  data: string;
}): Promise<ExtractDocumentResponse> {
  const lowerName = file.fileName.toLowerCase();
  const buffer = Buffer.from(file.data, 'base64');

  if (lowerName.endsWith('.txt') || lowerName.endsWith('.md') || file.mimeType.startsWith('text/')) {
    const text = buffer.toString('utf8').replace(/\r\n/g, '\n').trim();
    return {
      text,
      fileName: file.fileName,
      format: 'text',
      characterCount: text.length,
      pageCount: null,
      usedOcrFallback: false,
    };
  }

  if (
    lowerName.endsWith('.docx') ||
    file.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const result = await mammoth.extractRawText({ buffer });
    const text = (result.value ?? '').replace(/\n{3,}/g, '\n\n').trim();
    return {
      text,
      fileName: file.fileName,
      format: 'docx',
      characterCount: text.length,
      pageCount: null,
      usedOcrFallback: false,
    };
  }

  if (lowerName.endsWith('.pdf') || file.mimeType === 'application/pdf') {
    let extracted = '';
    let totalPages: number | null = null;
    try {
      const pdfResult = await extractText(new Uint8Array(buffer), { mergePages: true });
      extracted = typeof pdfResult.text === 'string' ? pdfResult.text.trim() : '';
      totalPages = typeof pdfResult.totalPages === 'number' ? pdfResult.totalPages : null;
    } catch (pdfErr) {
      console.warn('Primary PDF text extraction failed, trying multimodal OCR:', pdfErr);
    }

    if (extracted.length >= 80) {
      return {
        text: extracted,
        fileName: file.fileName,
        format: 'pdf',
        characterCount: extracted.length,
        pageCount: totalPages,
        usedOcrFallback: false,
      };
    }

    // Scanned or image-only PDF fallback via Gemini multimodal extraction
    const ai = getGeminiClient();
    const ocrResponse = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'application/pdf', data: file.data } },
            {
              text: 'Extract all readable text from this document accurately in reading order. Preserve headings, dates, job titles, skills, and bullet points as plain text. Return only the extracted document text with no extra commentary.',
            },
          ],
        },
      ],
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    const ocrText = (ocrResponse.text ?? '').trim();
    return {
      text: ocrText,
      fileName: file.fileName,
      format: 'pdf',
      characterCount: ocrText.length,
      pageCount: totalPages,
      usedOcrFallback: true,
    };
  }

  throw new Error('Unsupported file format. Please upload a PDF (.pdf), Word (.docx), TXT (.txt), or Markdown (.md) file.');
}

const MATCH_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    candidateName: {
      type: Type.STRING,
      description: 'Candidate full name extracted from the resume, or file/label name if omitted.',
    },
    detectedRole: {
      type: Type.STRING,
      description: 'Candidate current or most recent job title from the resume.',
    },
    targetRole: {
      type: Type.STRING,
      description: 'Target job title extracted from the job description.',
    },
    executiveSummary: {
      type: Type.STRING,
      description: 'Objective 2-3 sentence summary of alignment, strongest proof points, and main gaps.',
    },
    dimensionScores: {
      type: Type.OBJECT,
      properties: {
        coreSkills: {
          type: Type.INTEGER,
          description: '0-100 score for required hard skills, tools, frameworks, and certifications.',
        },
        experienceImpact: {
          type: Type.INTEGER,
          description: '0-100 score for years of relevant experience, seniority, and quantified impact.',
        },
        domainAlignment: {
          type: Type.INTEGER,
          description: '0-100 score for industry context, role scope, and problem complexity match.',
        },
        leadershipCommunication: {
          type: Type.INTEGER,
          description: '0-100 score for ownership, mentoring, stakeholder partnership, and communication.',
        },
      },
      required: ['coreSkills', 'experienceImpact', 'domainAlignment', 'leadershipCommunication'],
    },
    dimensionRationales: {
      type: Type.OBJECT,
      properties: {
        coreSkills: { type: Type.STRING },
        experienceImpact: { type: Type.STRING },
        domainAlignment: { type: Type.STRING },
        leadershipCommunication: { type: Type.STRING },
      },
      required: ['coreSkills', 'experienceImpact', 'domainAlignment', 'leadershipCommunication'],
    },
    requirementsMatrix: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          requirement: {
            type: Type.STRING,
            description: 'Specific requirement extracted from the job description (concise, under 14 words).',
          },
          category: {
            type: Type.STRING,
            description: 'Short category label (e.g., Core Skills, Experience, Domain, Leadership, Tools).',
          },
          importance: {
            type: Type.STRING,
            description: 'Must be strictly "Must Have" or "Preferred".',
          },
          status: {
            type: Type.STRING,
            description: 'Must be strictly "Matched", "Partial", or "Missing".',
          },
          evidence: {
            type: Type.STRING,
            description: 'Concrete fact/date/metric from the resume proving coverage, or exact gap explanation.',
          },
        },
        required: ['requirement', 'category', 'importance', 'status', 'evidence'],
      },
    },
    matchedSkills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Up to 14 verified skills present in both the resume and job description.',
    },
    missingSkills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Up to 10 required or preferred skills missing or under-evidenced in the resume.',
    },
    candidateRecommendations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '3-4 concrete, truthful improvements the candidate can make to strengthen alignment.',
    },
    bulletRewrites: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          original: { type: Type.STRING },
          improved: { type: Type.STRING },
          rationale: { type: Type.STRING },
        },
        required: ['original', 'improved', 'rationale'],
      },
      description: '1-2 truthful, stronger rewrites of existing resume bullets tailored to the job description.',
    },
    recruiterInterviewProbes: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '2-3 targeted interview questions verifying Partial or Missing requirements.',
    },
  },
  required: [
    'candidateName',
    'detectedRole',
    'targetRole',
    'executiveSummary',
    'dimensionScores',
    'dimensionRationales',
    'requirementsMatrix',
    'matchedSkills',
    'missingSkills',
    'candidateRecommendations',
    'bulletRewrites',
    'recruiterInterviewProbes',
  ],
};

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '16mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'resumescore-match-engine' });
  });

  app.post('/api/extract-document', async (req, res) => {
    try {
      const file = req.body as { fileName?: string; mimeType?: string; data?: string };
      if (!file?.fileName || !file?.data) {
        res.status(400).json({ error: 'Missing file name or file payload.' });
        return;
      }
      const parsed = await parseUploadedDocument({
        fileName: file.fileName,
        mimeType: file.mimeType || '',
        data: file.data,
      });
      if (!parsed.text || parsed.text.length < 20) {
        res.status(422).json({
          error: `Could not read readable text from "${file.fileName}". Please try a non-password-protected PDF, DOCX, or TXT file.`,
        });
        return;
      }
      res.json(parsed);
    } catch (err: unknown) {
      console.error('Document extraction error:', err);
      const message = err instanceof Error ? err.message : 'Failed to parse uploaded document.';
      res.status(400).json({ error: message });
    }
  });

  app.post('/api/match', async (req, res) => {
    const startTime = Date.now();
    try {
      const body = req.body as MatchRequestPayload;
      const jobDescription = (body?.jobDescription ?? '').trim();
      let resumeText = (body?.resumeText ?? '').trim();
      const resumeFile = body?.resumeFile;

      if (!jobDescription || jobDescription.length < 30) {
        res.status(400).json({
          error: 'Please enter or upload a complete job description (at least 30 characters).',
        });
        return;
      }

      let inputFormat: 'text' | 'pdf' | 'docx' = 'text';
      let pageCount: number | null = null;
      let fallbackFileName = body.candidateLabel || '';

      if (resumeFile?.data) {
        fallbackFileName = fallbackFileName || resumeFile.fileName.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ');
        const extracted = await parseUploadedDocument(resumeFile);
        resumeText = extracted.text;
        inputFormat = extracted.format;
        pageCount = extracted.pageCount;
      }

      if (!resumeText || resumeText.length < 30) {
        res.status(400).json({
          error: 'Could not find enough readable resume text. Please paste your resume or upload a readable PDF, DOCX, or TXT file.',
        });
        return;
      }

      const weights = normalizeWeights(body.weights);
      const ai = getGeminiClient();

      // Step 1: Real semantic vector similarity via gemini-embedding-2 on full text (works for PDF, DOCX, TXT!)
      let vectorSimilarity: number | null = null;
      let embeddingModel: string | null = null;
      try {
        const embedResult = await ai.models.embedContent({
          model: 'gemini-embedding-2',
          contents: [resumeText.slice(0, 12000), jobDescription.slice(0, 12000)],
        });
        const vecA = embedResult.embeddings?.[0]?.values;
        const vecB = embedResult.embeddings?.[1]?.values;
        if (vecA && vecB) {
          vectorSimilarity = cosineSimilarity(vecA, vecB);
          embeddingModel = 'gemini-embedding-2';
        }
      } catch (embedErr) {
        console.warn('Embedding step warning:', embedErr instanceof Error ? embedErr.message : embedErr);
      }

      // Step 2: Deep rubric & evidence-grounded evaluation via gemini-4-hydrogen
      const instructionPrompt = `You are a rigorous, fair, multi-industry talent evaluator and hiring calibration analyst.
Evaluate the candidate resume strictly against the provided job description. This system is used across all industries (Software, Product, Data, Cloud, Marketing, Finance, Operations, Healthcare, Design) — evaluate strictly against what THIS job description asks for.

Accuracy & Grounding Rules:
1. Read dates carefully and compute total relevant years of experience accurately (assume current year is 2026 for roles marked "Present" or "Current").
2. Recognize legitimate tool/skill synonyms (e.g., Postgres = PostgreSQL, K8s = Kubernetes, GCP = Google Cloud, React.js = React, Excel/Sheets, B2B SaaS = Enterprise Software). Do NOT penalize valid equivalents as missing.
3. Conversely, do NOT give credit for skills or leadership scope that are not evidenced in the resume. If a requirement asks for 5+ years and the resume has 2 years, mark it Partial or Missing and explain why.
4. Extract 6 to 10 distinct requirements from the job description for requirementsMatrix. Label each strictly as "Must Have" or "Preferred", and strictly as "Matched", "Partial", or "Missing", citing concrete dates, metrics, or facts from the resume.
5. Score each of the 4 dimensions independently from 0 to 100:
   - coreSkills: Required hard skills, tools, software, certifications, and methodologies.
   - experienceImpact: Relevant years of experience, role seniority, and measurable results.
   - domainAlignment: Industry/domain relevance, scale, and problem complexity matching the JD.
   - leadershipCommunication: Ownership, mentoring, cross-functional work, and stakeholder communication.
6. For bulletRewrites, only sharpen existing accomplishments using truthful facts already in the resume. Never invent fake numbers or unverified tools.
${fallbackFileName ? `- If the candidate's name is missing in the resume text, use "${fallbackFileName}".` : ''}`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `CANDIDATE RESUME:\n${resumeText.slice(0, 28000)}\n\nTARGET JOB DESCRIPTION:\n${jobDescription.slice(0, 16000)}`,
              },
            ],
          },
        ],
        config: {
          systemInstruction: instructionPrompt,
          responseMimeType: 'application/json',
          responseSchema: MATCH_RESPONSE_SCHEMA,
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        },
      });

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        throw new Error('Empty response returned from AI evaluation model.');
      }

      const parsed = JSON.parse(rawText);

      const dimensionScores: DimensionScores = {
        coreSkills: clampScore(parsed.dimensionScores?.coreSkills),
        experienceImpact: clampScore(parsed.dimensionScores?.experienceImpact),
        domainAlignment: clampScore(parsed.dimensionScores?.domainAlignment),
        leadershipCommunication: clampScore(parsed.dimensionScores?.leadershipCommunication),
      };

      const requirementsMatrix: RequirementEvidence[] = Array.isArray(parsed.requirementsMatrix)
        ? parsed.requirementsMatrix.map((item: Partial<RequirementEvidence>) => ({
            requirement: String(item.requirement || ''),
            category: String(item.category || 'General'),
            importance: item.importance === 'Preferred' ? 'Preferred' : 'Must Have',
            status:
              item.status === 'Matched' || item.status === 'Partial' || item.status === 'Missing'
                ? item.status
                : 'Partial',
            evidence: String(item.evidence || ''),
          }))
        : [];

      const rubricScore = computeRubricScore(dimensionScores, weights);
      const coverageScore = computeCoverageScore(requirementsMatrix);
      const overallScore = clampScore(rubricScore * 0.7 + coverageScore * 0.3);
      const fitVerdict = determineVerdict(overallScore);

      const result: MatchAnalysisResult = {
        id: `run-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        candidateName: parsed.candidateName || fallbackFileName || 'Candidate Profile',
        detectedRole: parsed.detectedRole || 'Applicant',
        targetRole: parsed.targetRole || body.targetRole || 'Target Role',
        overallScore,
        fitVerdict,
        executiveSummary: parsed.executiveSummary || '',
        dimensionScores,
        dimensionRationales: {
          coreSkills: parsed.dimensionRationales?.coreSkills || '',
          experienceImpact: parsed.dimensionRationales?.experienceImpact || '',
          domainAlignment: parsed.dimensionRationales?.domainAlignment || '',
          leadershipCommunication: parsed.dimensionRationales?.leadershipCommunication || '',
        },
        weightsUsed: weights,
        requirementsMatrix,
        matchedSkills: Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills : [],
        missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
        candidateRecommendations: Array.isArray(parsed.candidateRecommendations)
          ? parsed.candidateRecommendations
          : [],
        bulletRewrites: Array.isArray(parsed.bulletRewrites) ? parsed.bulletRewrites : [],
        recruiterInterviewProbes: Array.isArray(parsed.recruiterInterviewProbes)
          ? parsed.recruiterInterviewProbes
          : [],
        telemetry: {
          model: 'gemini-4-hydrogen',
          embeddingModel,
          vectorSimilarity,
          coverageScore,
          rubricScore,
          inferenceMs: Date.now() - startTime,
          evaluatedAt: new Date().toISOString(),
          inputFormat,
          extractedCharacters: resumeText.length,
          pageCount,
        },
        source: 'live',
      };

      res.json(result);
    } catch (error: unknown) {
      console.error('Match evaluation error:', error);
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to evaluate resume match score against the AI service.';
      const status =
        message.includes('GEMINI_API_KEY')
          ? 500
          : message.includes('429') || message.toLowerCase().includes('quota')
          ? 429
          : 500;
      res.status(status).json({ error: message });
    }
  });

  if (!IS_PRODUCTION) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ResumeScore Match Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
