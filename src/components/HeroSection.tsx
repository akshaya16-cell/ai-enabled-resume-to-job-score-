import { ResilientImage } from './ResilientImage';

interface HeroSectionProps {
  onStartAnalyze: () => void;
}

export function HeroSection({ onStartAnalyze }: HeroSectionProps) {
  return (
    <section className="bg-white border-b border-slate-200 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-center">
            <p className="text-xs font-medium text-slate-500 tracking-wide mb-3">
              PDF, DOCX & TXT Support <span aria-hidden="true">·</span> Cloud AI Evaluation{' '}
              <span aria-hidden="true">·</span> Evidence-Backed Scoring
            </p>
            <h1
              className="text-slate-900 font-bold tracking-tight leading-[1.12] text-balance"
              style={{ fontSize: 'clamp(2rem, 3.6vw, 3rem)' }}
            >
              Check how well your resume matches any job description
            </h1>
            <p className="mt-3.5 text-base text-slate-600 leading-relaxed max-w-2xl">
              Upload a PDF, Word, or text resume alongside a target job posting to get an accurate
              match score, requirement-by-requirement breakdown, missing skills list, and tailored
              resume improvements.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-5">
              <button
                type="button"
                onClick={onStartAnalyze}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-700"
              >
                Upload Resume & Score
              </button>
              <a
                href="#match-report"
                className="text-sm font-medium text-slate-700 hover:text-blue-700 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
              >
                View Sample Report
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="h-full min-h-[190px] lg:min-h-[220px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              <ResilientImage
                src="/src/assets/images/hero_talent_workspace_1794992697163.jpg"
                alt="Modern workspace evaluating resume alignment and job match metrics"
                title="ResumeScore Resume Match Workspace"
                className="w-full h-full lg:h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
