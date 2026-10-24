import React, { useState, useEffect } from 'react';
import {
  BookOpenCheck,
  Eye,
  BrainCircuit,
  Languages,
  Volume2,
  Pause,
  Play,
  Square,
  Download,
  Sparkles,
  CheckSquare,
  RotateCcw,
  FileSearch,
  CheckCircle2,
  HelpCircle,
  ListChecks,
} from 'lucide-react';
import {
  DocumentSection,
  LearningMaterialDocument,
} from '../data/sampleMaterials';
import {
  AccessibilityPreferences,
  SupportedLanguage,
  tokenizeBionicText,
  generateBrfDocument,
  convertToUnicodeBraille,
  formatSourceTraceCitation,
} from '../utils/accessibilityLogic';

export type OutputTabId = 'reader' | 'vision-math' | 'adhd-mindmap' | 'multilingual';

interface AccessibleOutputTabsProps {
  document: LearningMaterialDocument;
  activeSection: DocumentSection;
  preferences: AccessibilityPreferences;
  searchQuery: string;
  completedCheckpoints: string[];
  speechState: 'idle' | 'playing' | 'paused';
  speechSupported: boolean;
  speechStatusMessage: string | null;
  onPlaySpeech: (customText?: string, langCode?: string) => void;
  onPauseSpeech: () => void;
  onResumeSpeech: () => void;
  onStopSpeech: () => void;
  onUpdatePreferences: (partial: Partial<AccessibilityPreferences>) => void;
  onToggleCheckpoint: (checkpointId: string) => void;
  onOpenSourceTrace: (section: DocumentSection) => void;
}

export const AccessibleOutputTabs: React.FC<AccessibleOutputTabsProps> = ({
  document,
  activeSection,
  preferences,
  searchQuery,
  completedCheckpoints,
  speechState,
  speechSupported,
  speechStatusMessage,
  onPlaySpeech,
  onPauseSpeech,
  onResumeSpeech,
  onStopSpeech,
  onUpdatePreferences,
  onToggleCheckpoint,
  onOpenSourceTrace,
}) => {
  const [activeTab, setActiveTab] = useState<OutputTabId>('reader');
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [spotlightParagraph, setSpotlightParagraph] = useState<number | null>(null);
  const [explainMode, setExplainMode] = useState<'simplify' | 'summarize' | 'questions' | null>(
    null
  );
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainResult, setExplainResult] = useState<{
    source: 'live-gemini-ai' | 'bundled-verified-sample';
    content: string;
  } | null>(null);
  const [brfDownloadedToast, setBrfDownloadedToast] = useState(false);

  // Reset explain result when switching sections
  useEffect(() => {
    setExplainMode(null);
    setExplainResult(null);
  }, [activeSection.id]);

  // Release paragraph spotlight on Escape (keyboard-friendly)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSpotlightParagraph(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const hc = preferences.highContrast;

  const renderInlineContent = (paragraph: string) => {
    const query = searchQuery.trim().toLowerCase();

    if (preferences.bionicReading) {
      const tokens = tokenizeBionicText(paragraph);
      return tokens.map((tok, tIdx) => {
        const fullWord = tok.prefix + tok.suffix;
        const isMatch = query.length > 1 && fullWord.toLowerCase().includes(query);
        return (
          <React.Fragment key={tIdx}>
            <span
              className={
                isMatch
                  ? 'bg-amber-300 text-slate-950 px-0.5 rounded'
                  : undefined
              }
            >
              <strong className={hc ? 'font-extrabold text-amber-300' : 'font-extrabold text-slate-950'}>
                {tok.prefix}
              </strong>
              <span className={hc ? 'text-slate-100' : 'text-slate-700'}>{tok.suffix}</span>
            </span>
            {tok.whitespace}
          </React.Fragment>
        );
      });
    }

    return paragraph;
  };

  const handleExplainAction = async (mode: 'simplify' | 'summarize' | 'questions') => {
    setExplainMode(mode);
    setExplainLoading(true);
    try {
      const endpoint =
        mode === 'summarize'
          ? `/api/documents/${document.id}/summarize`
          : `/api/documents/${document.id}/explain`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: activeSection.id,
          sectionTitle: activeSection.title,
          mode,
          text: activeSection.accessibleParagraphs.join('\n\n'),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.result) {
          setExplainResult({
            source: data.source === 'live-gemini-ai' ? 'live-gemini-ai' : 'bundled-verified-sample',
            content: data.result,
          });
          setExplainLoading(false);
          return;
        }
      }
    } catch {
      // Fallback to verified bundled sample below
    }

    // Clearly labeled sample fallback
    let fallbackText = '';
    if (mode === 'simplify') {
      fallbackText = activeSection.explainSamples.simplify;
    } else if (mode === 'summarize') {
      fallbackText = activeSection.explainSamples.summarize.map((s) => `• ${s}`).join('\n');
    } else {
      fallbackText = activeSection.explainSamples.practiceQuestions
        .map((q, i) => `Q${i + 1}: ${q.question}\nAnswer: ${q.answer}`)
        .join('\n\n');
    }

    setExplainResult({
      source: 'bundled-verified-sample',
      content: fallbackText,
    });
    setExplainLoading(false);
  };

  const handleDownloadBrailleBrf = () => {
    const brfContent = generateBrfDocument({
      documentTitle: document.title,
      sectionTitle: `Section ${activeSection.sectionCode}: ${activeSection.title}`,
      formulaRaw: activeSection.formula.raw,
      formulaExplanation: activeSection.formula.spokenPlainLanguage,
      diagramTitle: activeSection.diagram.title,
      diagramSteps: activeSection.diagram.naturalLanguageSteps,
    });

    const blob = new Blob([brfContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${document.id}_Sec_${activeSection.sectionCode.replace('.', '_')}.brf`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setBrfDownloadedToast(true);
    setTimeout(() => setBrfDownloadedToast(false), 3500);
  };

  const currentLangData =
    activeSection.multilingual[preferences.preferredLanguage] ||
    activeSection.multilingual['academic-en'];

  return (
    <div
      className={`rounded-2xl border p-5 flex flex-col gap-5 ${
        hc
          ? 'bg-slate-950 border-amber-400 text-white'
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      {/* 4 Interactive Tabs Navigation */}
      <div
        role="tablist"
        aria-label="AI Converted Accessible Output Modes"
        className={`grid grid-cols-2 xl:grid-cols-4 gap-1.5 p-1.5 rounded-2xl border ${
          hc ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-200'
        }`}
      >
        {(
          [
            { id: 'reader', icon: BookOpenCheck, label: 'Smart Reader', sub: 'Bionic Read-Aloud' },
            { id: 'vision-math', icon: Eye, label: 'Vision & Math', sub: 'Braille + Diagrams' },
            { id: 'adhd-mindmap', icon: BrainCircuit, label: 'Focus & Flashcards', sub: 'Micro-learning' },
            { id: 'multilingual', icon: Languages, label: 'Multilingual', sub: 'English · Telugu · Hindi' },
          ] as { id: OutputTabId; icon: typeof BookOpenCheck; label: string; sub: string }[]
        ).map(({ id, icon: Icon, label, sub }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-start px-3.5 py-2.5 rounded-xl cursor-pointer text-left border transition-all ${
                active
                  ? hc
                    ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-sm'
                    : 'bg-white border-teal-600 shadow-sm'
                  : hc
                  ? 'bg-transparent border-transparent text-slate-300 hover:bg-slate-800'
                  : 'bg-transparent border-transparent text-slate-500 hover:bg-white/70'
              }`}
            >
              <span className="flex items-center gap-2 text-xs font-extrabold whitespace-nowrap">
                <span
                  className={`font-mono text-[10px] rounded px-1 py-0.5 ${
                    active
                      ? hc
                        ? 'bg-slate-950/15'
                        : 'bg-teal-700 text-white'
                      : hc
                      ? 'bg-slate-800 text-amber-400'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  0{(id === 'reader' ? 1 : id === 'vision-math' ? 2 : id === 'adhd-mindmap' ? 3 : 4).toString()}
                </span>
                <Icon className={`w-4 h-4 shrink-0 ${active && !hc ? 'text-teal-700' : ''}`} />
                {label}
              </span>
              <span className={`text-[10px] font-medium mt-0.5 ${active ? (hc ? 'opacity-80' : 'text-slate-500') : 'opacity-70'}`}>
                {sub}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SMART ACCESSIBLE READER */}
      {activeTab === 'reader' && (
        <div className="space-y-5" role="tabpanel" aria-label="Smart Accessible Reader">
          {/* Native Web Speech API Read-Aloud Audio Player */}
          <div
            className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 ${
              hc
                ? 'bg-slate-900 border-amber-400/70'
                : 'bg-teal-50/60 border-teal-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  hc ? 'bg-amber-400 text-slate-950' : 'bg-teal-700 text-white'
                }`}
              >
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold flex items-center gap-2">
                  <span>Browser Web Speech API Read-Aloud</span>
                  <span className="font-mono text-[11px] opacity-80">
                    ({preferences.speechRate.toFixed(2)}x speed)
                  </span>
                </div>
                <p className={`text-xs ${hc ? 'text-slate-300' : 'text-slate-600'}`}>
                  {speechStatusMessage ||
                    (speechSupported
                      ? `Ready to read Section ${activeSection.sectionCode}: ${activeSection.title}`
                      : 'Web Speech API not detected in this browser environment')}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {speechState !== 'playing' ? (
                <button
                  type="button"
                  onClick={() =>
                    speechState === 'paused' ? onResumeSpeech() : onPlaySpeech()
                  }
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                    hc
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-teal-700 text-white hover:bg-teal-800'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{speechState === 'paused' ? 'Resume Aloud' : 'Listen Aloud'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onPauseSpeech}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 cursor-pointer"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </button>
              )}

              <button
                type="button"
                onClick={onStopSpeech}
                disabled={speechState === 'idle'}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border cursor-pointer disabled:opacity-40 ${
                  hc
                    ? 'bg-slate-800 border-slate-600 text-white'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Square className="w-3.5 h-3.5" />
                <span>Stop</span>
              </button>

              {/* Speech Rate Slider */}
              <div className="flex items-center gap-2 pl-2">
                <label htmlFor="reader-speech-rate" className="text-xs font-semibold whitespace-nowrap">
                  Rate: {preferences.speechRate.toFixed(1)}x
                </label>
                <input
                  id="reader-speech-rate"
                  type="range"
                  min="0.6"
                  max="1.8"
                  step="0.1"
                  value={preferences.speechRate}
                  onChange={(e) =>
                    onUpdatePreferences({ speechRate: parseFloat(e.target.value) })
                  }
                  className="w-20 accent-teal-700 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Active Section Heading & SourceTrace Metadata */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className={hc ? 'text-amber-300 font-semibold' : 'text-teal-700 font-semibold'}>
                {activeSection.chapterTitle} · Section {activeSection.sectionCode}
              </span>
              <button
                type="button"
                onClick={() => onOpenSourceTrace(activeSection)}
                className="inline-flex items-center gap-1 text-xs font-semibold underline cursor-pointer bg-transparent border-0 p-0"
              >
                <FileSearch className="w-3.5 h-3.5" />
                <span>{formatSourceTraceCitation(activeSection.pageNumber, document.shortLabel)}</span>
              </button>
            </div>

            <h3
              className={`text-xl sm:text-2xl font-extrabold tracking-tight ${
                preferences.dyslexiaFont ? 'font-dyslexic' : ''
              }`}
            >
              {activeSection.title}
            </h3>
          </div>

          {/* Main Extracted & Simplified Reading Canvas */}
          <article
            className={`p-5 rounded-xl border ${
              hc
                ? 'bg-slate-900 border-slate-700'
                : 'bg-slate-50/70 border-slate-200/90'
            }`}
          >
            {/* Paragraph Spotlight hint */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider ${
                  hc ? 'text-amber-300/80' : 'text-slate-400'
                }`}
              >
                {spotlightParagraph === null
                  ? 'Tip: click any paragraph to spotlight it for distraction-free reading'
                  : 'Spotlight active — click the paragraph again or Esc to release'}
              </span>
              {spotlightParagraph !== null && (
                <button
                  type="button"
                  onClick={() => setSpotlightParagraph(null)}
                  className={`text-[10px] font-bold rounded-full px-2.5 py-1 cursor-pointer border ${
                    hc
                      ? 'bg-slate-800 border-slate-700 text-slate-200'
                      : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  Clear spotlight
                </button>
              )}
            </div>

            {activeSection.accessibleParagraphs.map((para, idx) => {
              const isSpot = spotlightParagraph === idx;
              const isDimmed = spotlightParagraph !== null && !isSpot;
              return (
                <p
                  key={idx}
                  onClick={() =>
                    setSpotlightParagraph((prev) => (prev === idx ? null : idx))
                  }
                  style={{
                    fontSize: `${preferences.fontSize}px`,
                    lineHeight: preferences.lineSpacing,
                  }}
                  className={`mb-4 ${preferences.dyslexiaFont ? 'font-dyslexic' : ''} cursor-pointer rounded-lg transition-all duration-300 ${
                    hc ? 'text-slate-100' : 'text-slate-800'
                  } ${
                    isSpot
                      ? hc
                        ? 'bg-slate-950 border border-amber-400/60 px-3 py-2 -mx-1'
                        : 'bg-amber-50 border border-teal-400 px-3 py-2 -mx-1 shadow-sm'
                      : isDimmed
                      ? 'opacity-30 hover:opacity-60'
                      : ''
                  }`}
                >
                  {renderInlineContent(para)}
                </p>
              );
            })}

            {/* Key Takeaway Callout */}
            <div
              className={`mt-4 p-4 rounded-xl border ${
                hc
                  ? 'bg-slate-950 border-amber-400 text-amber-200'
                  : 'bg-white border-teal-200 text-slate-900'
              }`}
            >
              <div className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-amber-400 mb-1">
                Core Concept Takeaway
              </div>
              <p
                style={{ fontSize: `${Math.max(15, preferences.fontSize - 1)}px` }}
                className={`font-semibold ${preferences.dyslexiaFont ? 'font-dyslexic' : ''}`}
              >
                {activeSection.keyTakeaway}
              </p>
            </div>
          </article>

          {/* Signature Feature E: EXPLAIN-TO-ME Actions (Simplify, Summarize, Practice Questions) */}
          <div
            className={`p-4 rounded-xl border space-y-3 ${
              hc ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className={`w-4 h-4 ${hc ? 'text-amber-400' : 'text-violet-700'}`} />
                <span className="text-xs font-bold">AI Study Assist</span>
                <span className="text-[10px] font-medium text-slate-400">one-click explanations with verified fallback</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExplainAction('simplify')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    explainMode === 'simplify'
                      ? hc
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-violet-700 text-white'
                      : hc
                      ? 'bg-slate-800 text-slate-200'
                      : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Simplify Concept
                </button>
                <button
                  type="button"
                  onClick={() => handleExplainAction('summarize')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    explainMode === 'summarize'
                      ? hc
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-violet-700 text-white'
                      : hc
                      ? 'bg-slate-800 text-slate-200'
                      : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Summarize Bullet Points
                </button>
                <button
                  type="button"
                  onClick={() => handleExplainAction('questions')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    explainMode === 'questions'
                      ? hc
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-violet-700 text-white'
                      : hc
                      ? 'bg-slate-800 text-slate-200'
                      : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Generate Practice Questions
                </button>
              </div>
            </div>

            {explainLoading && (
              <div className="text-xs font-medium py-3 text-slate-500">
                Generating accessible explanation for Section {activeSection.sectionCode}...
              </div>
            )}

            {explainResult && !explainLoading && (
              <div
                className={`p-3.5 rounded-xl border text-xs sm:text-sm space-y-2 ${
                  hc
                    ? 'bg-slate-950 border-amber-400/50 text-slate-100'
                    : 'bg-white border-violet-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-semibold">
                  <span className={hc ? 'text-amber-300' : 'text-violet-700'}>
                    Source:{' '}
                    {explainResult.source === 'live-gemini-ai'
                      ? 'Live Server-Side Gemini AI Output'
                      : 'Bundled Verified Textbook Sample Output'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onPlaySpeech(explainResult.content)}
                    className="underline cursor-pointer bg-transparent border-0 p-0"
                  >
                    Read Explanation Aloud
                  </button>
                </div>
                <pre
                  className={`whitespace-pre-wrap font-sans leading-relaxed ${
                    preferences.dyslexiaFont ? 'font-dyslexic' : ''
                  }`}
                >
                  {explainResult.content}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AI VISION DIAGRAM & MATH DECODER */}
      {activeTab === 'vision-math' && (
        <div className="space-y-5" role="tabpanel" aria-label="AI Vision Diagram and Math Decoder">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-extrabold">
                AI Vision Diagram & Math Formula Decoder
              </h3>
              <p className={`text-xs ${hc ? 'text-slate-300' : 'text-slate-500'}`}>
                Prepared plain-language spatial descriptions and Nemeth/Literary Braille (.BRF) export for blind & low-vision learners.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  onPlaySpeech(
                    `${activeSection.formula.spokenPlainLanguage}. Diagram walkthrough: ${activeSection.diagram.naturalLanguageSteps.join(' ')}`
                  )
                }
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                  hc
                    ? 'bg-slate-800 text-amber-300 border border-amber-400'
                    : 'bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>Speak Math & Diagram</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadBrailleBrf}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer shadow-xs ${
                  hc
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>Download Braille (.BRF)</span>
              </button>
            </div>
          </div>

          {brfDownloadedToast && (
            <div
              role="status"
              className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Downloaded Braille Ready Format (.BRF) file for Section {activeSection.sectionCode}! Ready for refreshable Braille displays.
              </span>
            </div>
          )}

          {/* Mathematical Formula Natural-Language Decoder */}
          <div
            className={`p-4 rounded-xl border space-y-3 ${
              hc ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-amber-400">
              Part A · Mathematical Formula Spoken Translation
            </div>
            <div className="p-3.5 rounded-lg bg-slate-950 text-teal-300 font-mono text-sm sm:text-base font-bold">
              {activeSection.formula.raw}
            </div>
            <div
              className={`p-3.5 rounded-lg border text-sm leading-relaxed ${
                hc
                  ? 'bg-slate-950 border-slate-700 text-amber-200'
                  : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <strong>Screen-Reader Spoken Form: </strong>“{activeSection.formula.spokenPlainLanguage}”
            </div>

            {/* Variable Symbol Breakdown Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr
                    className={`border-b ${
                      hc ? 'border-slate-700 text-amber-300' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <th className="py-2 pr-3 font-bold">Symbol</th>
                    <th className="py-2 px-3 font-bold">Variable Name</th>
                    <th className="py-2 px-3 font-bold">Physical / Algorithmic Meaning</th>
                    <th className="py-2 pl-3 font-bold text-right">SI Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {activeSection.formula.variables.map((v, i) => (
                    <tr key={i}>
                      <td className="py-2 pr-3 font-mono font-bold text-teal-600 dark:text-amber-400">
                        {v.symbol}
                      </td>
                      <td className="py-2 px-3 font-semibold">{v.name}</td>
                      <td className="py-2 px-3">{v.meaning}</td>
                      <td className="py-2 pl-3 font-mono text-right tabular-nums">{v.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Step-by-Step Vision AI Diagram Walkthrough */}
          <div
            className={`p-4 rounded-xl border space-y-3 ${
              hc ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-amber-400">
                Part B · Step-by-Step Diagram Description for Blind Learners
              </span>
              <span className="text-[11px] opacity-75">Prepared Spatial Breakdown</span>
            </div>

            <p className="text-xs font-medium opacity-85">
              <strong>Spatial Layout Overview:</strong> {activeSection.diagram.spatialSummary}
            </p>

            <ol className="space-y-2.5">
              {activeSection.diagram.naturalLanguageSteps.map((step, index) => (
                <li
                  key={index}
                  className={`p-3 rounded-lg border text-xs sm:text-sm leading-relaxed flex items-start gap-3 ${
                    hc
                      ? 'bg-slate-950 border-slate-800 text-slate-100'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                      hc ? 'bg-amber-400 text-slate-950' : 'bg-teal-700 text-white'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            {/* Live Tactile Unicode Braille Cell Preview */}
            <div
              className={`p-3 rounded-lg border ${
                hc
                  ? 'bg-slate-950 border-slate-800 text-amber-300'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <div className="text-[11px] font-semibold uppercase tracking-wider opacity-75 mb-1">
                Live Refreshable Braille Cell Preview (Grade-1 Unicode)
              </div>
              <div className="font-mono text-base tracking-widest break-all leading-relaxed">
                {convertToUnicodeBraille(
                  `${activeSection.sectionCode} ${activeSection.title} ${activeSection.formula.raw}`
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FOCUS MICRO-LEARNING & MIND MAP */}
      {activeTab === 'adhd-mindmap' && (
        <div className="space-y-5" role="tabpanel" aria-label="Focus Micro-Learning and Mind Map">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-extrabold">
                Focus Micro-Learning Flashcards &amp; Concept Checklist
              </h3>
              <p className={`text-xs ${hc ? 'text-slate-300' : 'text-slate-500'}`}>
                Bite-sized cards, mind-map nodes, and progress checkpoints that cut cognitive
                overload — built for ADHD learners and great for fast revision for everyone.
              </p>
            </div>
            <span className="text-xs font-mono font-bold tabular-nums">
              Checklist Progress: {completedCheckpoints.length} / {document.checklist.length} completed
            </span>
          </div>

          {/* Interactive Flashcards Grid (Click to Flip) */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-amber-400">
              Interactive Summary Flashcards (Click any card to flip Question ↔ Answer)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {document.flashcards.map((card) => {
                const isFlipped = Boolean(flippedCards[card.id]);
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() =>
                      setFlippedCards((prev) => ({ ...prev, [card.id]: !prev[card.id] }))
                    }
                    className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[136px] hover:-translate-y-0.5 hover:shadow-md ${
                      isFlipped
                        ? hc
                          ? 'bg-amber-400/15 border-amber-400 text-amber-200'
                          : 'bg-teal-50/90 border-teal-400 text-slate-900'
                        : hc
                        ? 'bg-slate-900 border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900 hover:border-teal-400'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px] font-semibold opacity-75">
                      <span>{card.category}</span>
                      <span className="inline-flex items-center gap-1 underline">
                        <RotateCcw className="w-3 h-3" />
                        <span>{isFlipped ? 'Answer Side' : 'Question Side'}</span>
                      </span>
                    </div>

                    <p
                      className={`text-xs sm:text-sm font-semibold my-2 leading-relaxed ${
                        preferences.dyslexiaFont ? 'font-dyslexic' : ''
                      }`}
                    >
                      {isFlipped ? card.answer : card.question}
                    </p>

                    <div className="text-[11px] font-medium opacity-70">
                      {isFlipped ? 'Click to return to question' : 'Click to reveal takeaway answer'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Visual Concept Mind Map Hierarchy */}
          <div
            className={`p-4 rounded-xl border space-y-3 ${
              hc ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-amber-400">
              Visual Chapter Mind Map
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {document.mindMap.map((node) => (
                <div
                  key={node.id}
                  className={`p-3 rounded-lg border ${
                    node.role === 'root'
                      ? hc
                        ? 'sm:col-span-2 bg-amber-400 text-slate-950 border-amber-400 font-bold'
                        : 'sm:col-span-2 bg-slate-900 text-white border-slate-900'
                      : hc
                      ? 'bg-slate-950 border-slate-800 text-slate-100'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="text-xs font-bold">{node.title}</div>
                  <div
                    className={`text-xs mt-1 ${
                      node.role === 'root'
                        ? hc
                          ? 'text-slate-900'
                          : 'text-slate-300'
                        : hc
                        ? 'text-slate-300'
                        : 'text-slate-600'
                    }`}
                  >
                    {node.summary}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step-by-Step Interactive Concept Checklist */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-amber-400">
              <ListChecks className="w-4 h-4" />
              <span>Interactive Step-by-Step Concept Checklist</span>
            </div>

            <div className="space-y-2">
              {document.checklist.map((item) => {
                const checked = completedCheckpoints.includes(item.id);
                return (
                  <label
                    key={item.id}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer select-none transition-colors ${
                      checked
                        ? hc
                          ? 'bg-slate-900 border-amber-400 text-amber-200'
                          : 'bg-emerald-50/70 border-emerald-300 text-slate-900'
                        : hc
                        ? 'bg-slate-900 border-slate-700 text-slate-200'
                        : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleCheckpoint(item.id)}
                      className="mt-1 w-4 h-4 accent-teal-700 rounded cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className={`text-xs sm:text-sm font-bold ${checked ? 'line-through opacity-85' : ''}`}>
                        {item.label}
                      </div>
                      <p className={`text-xs mt-0.5 ${hc ? 'text-slate-300' : 'text-slate-600'}`}>
                        {item.detail}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MULTILINGUAL SIMPLIFIER */}
      {activeTab === 'multilingual' && (
        <div className="space-y-5" role="tabpanel" aria-label="Multilingual Simplifier">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-extrabold">
                Multilingual Concept Simplifier
              </h3>
              <p className={`text-xs ${hc ? 'text-slate-300' : 'text-slate-500'}`}>
                Switch between Academic English, Simple English, Telugu (తెలుగు), and Hindi (हिन्दी) with culturally grounded analogies.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                onPlaySpeech(
                  `${currentLangData.heading}. ${currentLangData.explanation}`,
                  currentLangData.voiceLang
                )
              }
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                hc
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-teal-700 text-white hover:bg-teal-800'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>Listen in {currentLangData.languageLabel}</span>
            </button>
          </div>

          {/* 4 Language Toggles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(
              [
                { id: 'academic-en', label: 'Academic English', sub: 'University Level' },
                { id: 'simple-en', label: 'Simple English', sub: 'Plain Everyday' },
                { id: 'te', label: 'తెలుగు (Telugu)', sub: 'Regional STEM' },
                { id: 'hi', label: 'हिन्दी (Hindi)', sub: 'Regional STEM' },
              ] as { id: SupportedLanguage; label: string; sub: string }[]
            ).map((lang) => {
              const isSelected = preferences.preferredLanguage === lang.id;
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => onUpdatePreferences({ preferredLanguage: lang.id })}
                  className={`p-3 rounded-xl border text-left cursor-pointer ${
                    isSelected
                      ? hc
                        ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                        : 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : hc
                      ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
                      : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-white'
                  }`}
                >
                  <div className="text-xs font-bold">{lang.label}</div>
                  <div className="text-[11px] opacity-75 mt-0.5">{lang.sub}</div>
                </button>
              );
            })}
          </div>

          {/* Selected Language Explanation Card */}
          <div
            className={`p-5 rounded-xl border space-y-4 ${
              hc ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-amber-400">
              {currentLangData.nativeName} · Section {activeSection.sectionCode}
            </div>

            <h4 className="text-lg sm:text-xl font-extrabold">{currentLangData.heading}</h4>

            <p
              style={{
                fontSize: `${preferences.fontSize}px`,
                lineHeight: preferences.lineSpacing,
              }}
              className={preferences.dyslexiaFont ? 'font-dyslexic' : ''}
            >
              {currentLangData.explanation}
            </p>

            {/* Real-World Intuitive Analogy */}
            <div
              className={`p-4 rounded-xl border ${
                hc
                  ? 'bg-slate-950 border-amber-400/50 text-amber-200'
                  : 'bg-white border-teal-200 text-slate-800'
              }`}
            >
              <div className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-amber-400 mb-1">
                Intuitive Everyday Analogy
              </div>
              <p className="text-xs sm:text-sm leading-relaxed">{currentLangData.analogy}</p>
            </div>

            {/* Key Bilingual Glossary */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider opacity-75">
                Key Concept Glossary ({currentLangData.languageLabel})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentLangData.keyTerms.map((kt, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border text-xs ${
                      hc
                        ? 'bg-slate-950 border-slate-800 text-slate-100'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="font-bold text-teal-700 dark:text-amber-400">{kt.term}</div>
                    <div className="mt-1 opacity-90">{kt.meaning}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
