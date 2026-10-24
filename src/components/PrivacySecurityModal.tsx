import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  FileCheck2,
  EyeOff,
  Server,
  CheckCircle2,
  ArrowRight,
  LogOut,
} from 'lucide-react';
import { AuthenticatedSession } from './CutoraLoginHero';

interface PrivacySecurityModalProps {
  session: AuthenticatedSession;
  onAcceptPrivacyAndEnter: () => void;
  onLogout: () => void;
  isStandaloneGate?: boolean;
  onCloseModal?: () => void;
}

export const PrivacySecurityModal: React.FC<PrivacySecurityModalProps> = ({
  session,
  onAcceptPrivacyAndEnter,
  onLogout,
  isStandaloneGate = true,
  onCloseModal,
}) => {
  const [acknowledgedTerms, setAcknowledgedTerms] = useState(true);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-security-title"
    >
      <div className="w-full max-w-3xl bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-auto">
        {/* Top Banner */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 id="privacy-security-title" className="text-lg font-bold tracking-tight">
                CampusAccess Privacy Policy & Zero-Trust Security Architecture
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Signed in as <span className="font-semibold text-amber-400">{session.email}</span> · Problem ID: IC26-02-05
              </p>
            </div>
          </div>

          {!isStandaloneGate && onCloseModal && (
            <button
              type="button"
              onClick={onCloseModal}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg"
            >
              Close
            </button>
          )}
        </div>

        {/* Policy Body */}
        <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto">
          <p className="text-sm text-slate-600 leading-relaxed">
            Welcome to <strong>CampusAccess: Accessible Learning Material Converter</strong>. Before entering the conversion workspace, please review and accept our student data protection, document handling, and cloud security safeguards.
          </p>

          {/* 4 Security Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2.5 text-slate-900 font-semibold text-sm">
                <Lock className="w-4 h-4 text-teal-600 shrink-0" />
                <span>1. Zero-Trust Firebase & ABAC Rules</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                All accessibility preferences and reading checkpoints stored in Cloud Firestore are isolated by strict owner UID verification (<code className="font-mono text-[11px] bg-slate-200/70 px-1 rounded">request.auth.uid == userId</code>) and schema boundary validation.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2.5 text-slate-900 font-semibold text-sm">
                <EyeOff className="w-4 h-4 text-violet-600 shrink-0" />
                <span>2. Private PDF & Lecture Processing</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Uploaded PDF textbooks, handwritten lecture scans, and classroom audio transcripts are never exposed on public URLs. Temporary upload buffers are sanitized and restricted to your active session.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2.5 text-slate-900 font-semibold text-sm">
                <Server className="w-4 h-4 text-amber-600 shrink-0" />
                <span>3. Server-Side AI Proxy Protection</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                All Gemini AI requests (Explain-To-Me, Multilingual Simplifier, and AI Tutor Chatbot) execute strictly through server-side Express endpoints (<code className="font-mono text-[11px] bg-slate-200/70 px-1 rounded">/api/*</code>). API keys are never exposed in client code.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2.5 text-slate-900 font-semibold text-sm">
                <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>4. Honest SourceTrace & Verification</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Every converted section preserves verifiable PDF page references via SourceTrace. When a page citation is absent from an uploaded source, CampusAccess explicitly displays <em>“Reference unavailable”</em> rather than fabricating citations.
              </p>
            </div>
          </div>

          {/* Compliance Checklist Box */}
          <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={acknowledgedTerms}
                onChange={(e) => setAcknowledgedTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-teal-700 rounded cursor-pointer"
              />
              <span className="text-xs text-slate-800 leading-relaxed font-medium">
                I have reviewed and accept the <strong>CampusAccess Privacy Policy & Security Terms</strong> (FERPA Educational Data Privacy, WCAG 2.1 AA/AAA Accessibility Standards, and Session Persistence).
              </span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>

          <button
            type="button"
            disabled={!acknowledgedTerms}
            onClick={onAcceptPrivacyAndEnter}
            className="inline-flex items-center gap-2.5 px-6 py-3 text-sm font-bold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-50 rounded-xl shadow-md cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Accept & Open CampusAccess Interface</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
