import { useState } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { MatchWorkbench } from './components/MatchWorkbench';
import { ROLE_PRESETS } from './data/presets';
import type { MatchAnalysisResult } from './types/match';

export default function App() {
  const [activeResult, setActiveResult] = useState<MatchAnalysisResult | null>(
    ROLE_PRESETS[0].baselineResult
  );

  const jumpToAnalyzer = () => {
    const el = document.getElementById('analyzer');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header onJumpToAnalyzer={jumpToAnalyzer} />

      <main className="flex-1">
        <HeroSection onStartAnalyze={jumpToAnalyzer} />
        <MatchWorkbench
          activeResult={activeResult}
          onResultGenerated={setActiveResult}
        />
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span
              className="text-lg font-bold tracking-tight text-slate-900"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              ResumeScore
            </span>
            <p className="mt-1 text-xs text-slate-500">
              AI-enabled resume-to-job match scoring powered by cloud document parsing and rubric
              evaluation.
            </p>
          </div>

          <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-6 text-xs font-medium text-slate-600">
            <a href="#upload-inputs" className="hover:text-slate-900 transition-colors whitespace-nowrap">
              Upload Resume
            </a>
            <a href="#match-report" className="hover:text-slate-900 transition-colors whitespace-nowrap">
              Match Report
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
