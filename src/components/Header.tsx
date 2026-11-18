interface HeaderProps {
  onJumpToAnalyzer: () => void;
}

export function Header({ onJumpToAnalyzer }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        <a
          href="#"
          className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 rounded-sm"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          ResumeScore
        </a>

        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <a
            href="#analyzer"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 rounded-sm"
          >
            Match Tool
          </a>
          <a
            href="#upload-inputs"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 rounded-sm"
          >
            Upload Resume
          </a>
          <a
            href="#match-report"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 rounded-sm"
          >
            Match Report
          </a>
        </nav>

        <div className="shrink-0">
          <button
            type="button"
            onClick={onJumpToAnalyzer}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-700"
          >
            Check Match Score
          </button>
        </div>
      </div>
    </header>
  );
}
