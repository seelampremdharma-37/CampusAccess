import React, { useState } from 'react';
import {
  BookOpen,
  Compass,
  FileSearch,
  Sparkles,
  Volume2,
  Eye,
  FileWarning,
  Layers,
} from 'lucide-react';
import {
  DocumentSection,
  LearningMaterialDocument,
} from '../data/sampleMaterials';
import { formatSourceTraceCitation } from '../utils/accessibilityLogic';

interface OriginalDocumentPreviewProps {
  document: LearningMaterialDocument;
  activeSection: DocumentSection;
  highContrast: boolean;
  onSelectSection: (sectionId: string, autoReadAloud?: boolean) => void;
  onOpenSourceTrace: (section: DocumentSection) => void;
}

export const OriginalDocumentPreview: React.FC<OriginalDocumentPreviewProps> = ({
  document,
  activeSection,
  highContrast,
  onSelectSection,
  onOpenSourceTrace,
}) => {
  const [viewMode, setViewMode] = useState<'messy-scan' | 'clean-vector'>('messy-scan');
  const [selectedDiagramStep, setSelectedDiagramStep] = useState<number>(0);

  const renderInteractiveSvgDiagram = () => {
    const type = activeSection.diagram.type;

    if (type === 'physics-barrier') {
      return (
        <svg
          viewBox="0 0 600 220"
          className="w-full h-auto rounded-xl border border-slate-300 bg-slate-950 text-white"
          role="img"
          aria-label={activeSection.diagram.title}
        >
          {/* Grid lines */}
          <line x1="30" y1="185" x2="570" y2="185" stroke="#475569" strokeWidth="1.5" />
          <line x1="30" y1="25" x2="30" y2="185" stroke="#475569" strokeWidth="1.5" />

          {/* Region Labels */}
          <text x="85" y="42" fill="#38bdf8" fontSize="11" fontWeight="700">
            Region I: Incident ψ_I(x)
          </text>
          <text x="242" y="42" fill="#fbbf24" fontSize="11" fontWeight="700">
            Region II: Barrier V₀ (0 ≤ x ≤ L)
          </text>
          <text x="430" y="42" fill="#2dd4bf" fontSize="11" fontWeight="700">
            Region III: Tunneling ψ_III(x)
          </text>

          {/* Potential Barrier Wall V_0 */}
          <rect
            x="230"
            y="52"
            width="130"
            height="133"
            fill="rgba(245, 158, 11, 0.18)"
            stroke="#f59e0b"
            strokeWidth="2"
          />
          <text x="265" y="172" fill="#fcd34d" fontSize="11" fontFamily="monospace">
            Width L (E &lt; V₀)
          </text>

          {/* Particle Energy Line E */}
          <line
            x1="30"
            y1="115"
            x2="570"
            y2="115"
            stroke="#94a3b8"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <text x="38" y="108" fill="#cbd5e1" fontSize="10" fontFamily="monospace">
            Energy E
          </text>

          {/* Incident High-Amplitude Wave (Region I) */}
          <path
            d="M 35 115 Q 60 45, 85 115 T 135 115 T 185 115 Q 208 45, 230 82"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3.2"
          />

          {/* Exponential Decay Curve Inside Barrier (Region II: e^-kx) */}
          <path
            d="M 230 82 Q 285 102, 360 107"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="3.5"
          />
          <text x="250" y="92" fill="#fde68a" fontSize="11" fontFamily="monospace">
            ψ ∝ e^(-κx)
          </text>

          {/* Transmitted Lower-Amplitude Wave (Region III) */}
          <path
            d="M 360 107 Q 385 88, 410 115 T 460 115 T 510 115 T 560 115"
            fill="none"
            stroke="#2dd4bf"
            strokeWidth="2.8"
          />
        </svg>
      );
    }

    if (type === 'avl-tree') {
      return (
        <svg
          viewBox="0 0 600 220"
          className="w-full h-auto rounded-xl border border-slate-300 bg-slate-950 text-white"
          role="img"
          aria-label={activeSection.diagram.title}
        >
          {/* Left: Unbalanced Tree */}
          <text x="45" y="32" fill="#f87171" fontSize="12" fontWeight="700">
            Before Rotation (Unbalanced BF = +2)
          </text>
          <line x1="160" y1="65" x2="110" y2="115" stroke="#94a3b8" strokeWidth="2.5" />
          <line x1="110" y1="115" x2="65" y2="165" stroke="#94a3b8" strokeWidth="2.5" />

          <circle cx="160" cy="65" r="20" fill="#7f1d1d" stroke="#f87171" strokeWidth="2" />
          <text x="152" y="70" fill="#ffffff" fontSize="12" fontWeight="700">
            30
          </text>
          <text x="186" y="68" fill="#fca5a5" fontSize="10" fontFamily="monospace">
            BF=+2
          </text>

          <circle cx="110" cy="115" r="20" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
          <text x="102" y="120" fill="#ffffff" fontSize="12" fontWeight="700">
            20
          </text>
          <text x="136" y="118" fill="#7dd3fc" fontSize="10" fontFamily="monospace">
            BF=+1
          </text>

          <circle cx="65" cy="165" r="20" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
          <text x="57" y="170" fill="#ffffff" fontSize="12" fontWeight="700">
            10
          </text>

          {/* Arrow in Middle */}
          <path d="M 255 115 L 325 115" stroke="#fbbf24" strokeWidth="3" />
          <polygon points="325,109 338,115 325,121" fill="#fbbf24" />
          <text x="255" y="98" fill="#fde68a" fontSize="11" fontWeight="700">
            O(1) Rotate
          </text>

          {/* Right: Balanced AVL Tree */}
          <text x="365" y="32" fill="#34d399" fontSize="12" fontWeight="700">
            After Rotation (Balanced BF = 0)
          </text>
          <line x1="465" y1="75" x2="405" y2="145" stroke="#34d399" strokeWidth="2.5" />
          <line x1="465" y1="75" x2="525" y2="145" stroke="#34d399" strokeWidth="2.5" />

          <circle cx="465" cy="75" r="22" fill="#064e3b" stroke="#34d399" strokeWidth="2.5" />
          <text x="457" y="80" fill="#ffffff" fontSize="12" fontWeight="700">
            20
          </text>
          <text x="493" y="78" fill="#6ee7b7" fontSize="10" fontFamily="monospace">
            BF=0
          </text>

          <circle cx="405" cy="145" r="20" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
          <text x="397" y="150" fill="#ffffff" fontSize="12" fontWeight="700">
            10
          </text>

          <circle cx="525" cy="145" r="20" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
          <text x="517" y="150" fill="#ffffff" fontSize="12" fontWeight="700">
            30
          </text>
        </svg>
      );
    }

    if (type === 'bohr-oxygen') {
      return (
        <svg
          viewBox="0 0 600 220"
          className="w-full h-auto rounded-xl border border-slate-300 bg-slate-950 text-white"
          role="img"
          aria-label={activeSection.diagram.title}
        >
          {/* Axes */}
          <line x1="55" y1="185" x2="555" y2="185" stroke="#64748b" strokeWidth="2" />
          <line x1="55" y1="25" x2="55" y2="185" stroke="#64748b" strokeWidth="2" />
          <text x="235" y="208" fill="#cbd5e1" fontSize="11">
            Oxygen Partial Pressure pO₂ (mmHg) →
          </text>
          <text x="15" y="38" fill="#cbd5e1" fontSize="11">
            O₂ Sat %
          </text>

          {/* Normal pH 7.4 Curve (Left / Solid Teal) */}
          <path
            d="M 55 185 C 125 180, 165 65, 290 45 L 535 35"
            fill="none"
            stroke="#2dd4bf"
            strokeWidth="3.2"
          />
          <text x="165" y="52" fill="#2dd4bf" fontSize="11" fontWeight="700">
            Normal Blood (pH 7.4)
          </text>

          {/* Exercising Bohr Shift pH 7.2 Curve (Right / Dashed Amber) */}
          <path
            d="M 55 185 C 165 182, 235 105, 360 55 L 535 38"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="3.2"
            strokeDasharray="6 4"
          />
          <text x="310" y="95" fill="#fbbf24" fontSize="11" fontWeight="700">
            Bohr Right Shift (pH 7.2, High CO₂)
          </text>

          {/* Tissue pO2 = 40 mmHg Delta Marker */}
          <line x1="220" y1="68" x2="220" y2="122" stroke="#f43f5e" strokeWidth="2.5" />
          <circle cx="220" cy="68" r="4" fill="#2dd4bf" />
          <circle cx="220" cy="122" r="4" fill="#fbbf24" />
          <text x="228" y="102" fill="#fda4af" fontSize="10" fontFamily="monospace">
            +23% O₂ Released @ 40 mmHg
          </text>
        </svg>
      );
    }

    // Default: electromagnetic-flux / oscillator diagram
    return (
      <svg
        viewBox="0 0 600 220"
        className="w-full h-auto rounded-xl border border-slate-300 bg-slate-950 text-white"
        role="img"
        aria-label={activeSection.diagram.title}
      >
        {/* Bar Magnet / Force Source */}
        <rect x="40" y="82" width="115" height="52" rx="6" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
        <rect x="105" y="82" width="50" height="52" rx="4" fill="#dc2626" />
        <text x="55" y="113" fill="#e2e8f0" fontSize="13" fontWeight="700">
          S
        </text>
        <text x="124" y="113" fill="#ffffff" fontSize="13" fontWeight="700">
          N
        </text>
        <text x="45" y="68" fill="#38bdf8" fontSize="11" fontWeight="700">
          Velocity v →
        </text>

        {/* Magnetic Flux Lines */}
        <path d="M 160 95 Q 230 70, 310 85" fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="5 3" />
        <path d="M 160 108 L 320 108" fill="none" stroke="#fbbf24" strokeWidth="2.5" />
        <path d="M 160 122 Q 230 145, 310 130" fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="5 3" />

        {/* Solenoid Wire Loops */}
        <ellipse cx="310" cy="108" rx="22" ry="55" fill="none" stroke="#2dd4bf" strokeWidth="3" />
        <ellipse cx="338" cy="108" rx="22" ry="55" fill="none" stroke="#2dd4bf" strokeWidth="3" />
        <ellipse cx="366" cy="108" rx="22" ry="55" fill="none" stroke="#2dd4bf" strokeWidth="3" />
        <text x="295" y="42" fill="#2dd4bf" fontSize="11" fontWeight="700">
          N-Turn Conducting Coil (Φ_B)
        </text>

        {/* Galvanometer Output */}
        <circle cx="505" cy="108" r="38" fill="#0f172a" stroke="#a855f7" strokeWidth="2.5" />
        <line x1="505" y1="120" x2="524" y2="85" stroke="#fbbf24" strokeWidth="2.5" />
        <text x="476" y="165" fill="#e9d5ff" fontSize="11" fontFamily="monospace">
          ε = -N dΦ_B/dt
        </text>
      </svg>
    );
  };

  return (
    <div
      className={`rounded-2xl border p-5 flex flex-col gap-5 ${
        highContrast
          ? 'bg-slate-950 border-amber-400 text-white'
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      {/* Top Header: Left Panel Title + View Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className={`w-4 h-4 ${highContrast ? 'text-amber-400' : 'text-teal-700'}`} />
            <h2 className="text-base font-bold tracking-tight">
              Original Source & Chapter Teleport
            </h2>
          </div>
          <p className={`text-xs mt-0.5 ${highContrast ? 'text-slate-300' : 'text-slate-500'}`}>
            {document.fileName} · {document.pageCount} pages · {document.sourceFormat}
          </p>
        </div>

        {/* Toggle between Messy Scan Preview & Clean Structural View */}
        <div
          className={`flex items-center gap-1 p-1 rounded-lg border ${
            highContrast ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-200'
          }`}
        >
          <button
            type="button"
            onClick={() => setViewMode('messy-scan')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md cursor-pointer whitespace-nowrap ${
              viewMode === 'messy-scan'
                ? highContrast
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-white text-slate-900 shadow-xs'
                : highContrast
                ? 'text-slate-300'
                : 'text-slate-600'
            }`}
          >
            Original Scan View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('clean-vector')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md cursor-pointer whitespace-nowrap ${
              viewMode === 'clean-vector'
                ? highContrast
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-white text-slate-900 shadow-xs'
                : highContrast
                ? 'text-slate-300'
                : 'text-slate-600'
            }`}
          >
            Extracted Structure
          </button>
        </div>
      </div>

      {/* Signature Feature A: CHAPTER TELEPORT Table of Contents */}
      <div
        className={`rounded-xl p-3.5 border ${
          highContrast ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <Compass className={`w-4 h-4 ${highContrast ? 'text-amber-400' : 'text-violet-700'}`} />
            <span className="text-xs font-bold">
              Chapter Teleport (Click any section to jump)
            </span>
          </div>

          {/* Competition Demo 1:00 Target Shortcut: Jump to Chapter 3, Section 3.2 */}
          <button
            type="button"
            onClick={() => onSelectSection('sec-3-2', false)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
              highContrast
                ? 'bg-amber-400 text-slate-950'
                : 'bg-violet-700 text-white hover:bg-violet-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Jump to Ch 3, Sec 3.2</span>
          </button>
        </div>

        <nav aria-label="Document chapters and sections" className="space-y-1.5">
          {document.sections.map((sec) => {
            const isSelected = sec.id === activeSection.id;
            return (
              <div key={sec.id} className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onSelectSection(sec.id, false)}
                  className={`flex-1 text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                    isSelected
                      ? highContrast
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'bg-teal-700 text-white font-semibold shadow-xs'
                      : highContrast
                      ? 'bg-slate-800/80 text-slate-200 hover:bg-slate-800'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  <span className="truncate">
                    Ch {sec.chapterNumber} · Sec {sec.sectionCode}: {sec.title}
                  </span>
                  <span
                    className={`font-mono text-[11px] shrink-0 ${
                      isSelected
                        ? highContrast
                          ? 'text-slate-950'
                          : 'text-teal-100'
                        : highContrast
                        ? 'text-amber-300'
                        : 'text-slate-500'
                    }`}
                  >
                    {sec.pageNumber ? `p.${sec.pageNumber}` : 'N/A'}
                  </span>
                </button>

                <button
                  type="button"
                  title={`Teleport to Section ${sec.sectionCode} and start Read-Aloud`}
                  aria-label={`Read aloud Section ${sec.sectionCode}`}
                  onClick={() => onSelectSection(sec.id, true)}
                  className={`p-2 rounded-lg border cursor-pointer shrink-0 ${
                    highContrast
                      ? 'bg-slate-800 border-slate-600 text-amber-300 hover:bg-slate-700'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-teal-50 hover:text-teal-700'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Original Document Paper Simulation Box */}
      <div
        className={`rounded-xl border p-4 space-y-4 ${
          viewMode === 'messy-scan'
            ? highContrast
              ? 'bg-slate-900 border-amber-400/60'
              : 'bg-[#f7f4eb] border-amber-300/80 text-slate-800'
            : highContrast
            ? 'bg-slate-900 border-slate-700'
            : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 font-semibold">
            <FileWarning className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {viewMode === 'messy-scan'
                ? 'Raw Unconverted Input (Low-Contrast Scan / Unstructured Notes)'
                : 'Extracted Section Metadata & Visual Assets'}
            </span>
          </div>
          <span className="font-mono text-[11px] opacity-80">
            {formatSourceTraceCitation(activeSection.pageNumber, document.shortLabel)}
          </span>
        </div>

        {/* Simulated Messy Scan Snippet */}
        <div
          className={`p-3.5 rounded-lg font-mono text-xs leading-relaxed border ${
            viewMode === 'messy-scan'
              ? highContrast
                ? 'bg-black text-amber-200 border-amber-500/40 italic'
                : 'bg-amber-100/50 text-slate-700 border-amber-300/70 italic'
              : highContrast
              ? 'bg-slate-950 text-slate-200 border-slate-800'
              : 'bg-white text-slate-800 border-slate-200'
          }`}
        >
          {activeSection.originalMessySnippet}
        </div>

        {/* Interactive Diagram Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-teal-600" />
              <span>{activeSection.diagram.title}</span>
            </span>
            <span className="text-[11px] opacity-75">Interactive Vector Reconstruction</span>
          </div>

          {renderInteractiveSvgDiagram()}

          <p className={`text-xs ${highContrast ? 'text-slate-300' : 'text-slate-600'}`}>
            {activeSection.diagram.caption}
          </p>

          {/* Interactive Step Inspector Buttons for Diagram */}
          <div className="pt-1 flex flex-wrap gap-1.5">
            {activeSection.diagram.naturalLanguageSteps.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedDiagramStep(idx)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                  selectedDiagramStep === idx
                    ? highContrast
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-900 text-white'
                    : highContrast
                    ? 'bg-slate-800 text-slate-300'
                    : 'bg-white text-slate-700 border border-slate-300'
                }`}
              >
                Inspect Region {idx + 1}
              </button>
            ))}
          </div>
          <div
            className={`p-2.5 rounded-lg text-xs border ${
              highContrast
                ? 'bg-slate-950 border-slate-700 text-amber-200'
                : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            {activeSection.diagram.naturalLanguageSteps[selectedDiagramStep] ||
              activeSection.diagram.naturalLanguageSteps[0]}
          </div>
        </div>

        {/* Original Mathematical Formula Box */}
        <div
          className={`p-3.5 rounded-xl border ${
            highContrast
              ? 'bg-slate-950 border-amber-400/60 text-amber-300'
              : 'bg-slate-900 border-slate-800 text-teal-300'
          }`}
        >
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
            Detected Mathematical Notation (Section {activeSection.sectionCode})
          </div>
          <div className="font-mono text-sm sm:text-base font-bold overflow-x-auto">
            {activeSection.formula.raw}
          </div>
        </div>

        {/* Signature Feature B: SOURCETRACE Action */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="text-xs">
            <span className="font-semibold">SourceTrace Status: </span>
            <span className={highContrast ? 'text-amber-300' : 'text-teal-700 font-medium'}>
              {activeSection.sourceConfidence}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onOpenSourceTrace(activeSection)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer ${
              highContrast
                ? 'bg-amber-400 text-slate-950'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            <FileSearch className="w-3.5 h-3.5" />
            <span>
              View Source ({activeSection.pageNumber ? `Page ${activeSection.pageNumber}` : 'Reference unavailable'})
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
