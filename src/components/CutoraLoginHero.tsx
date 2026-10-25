import React, { useState, useEffect } from 'react';
import { signInWithGooglePopup, User } from '../firebase';

export interface AuthenticatedSession {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  authMethod: 'firebase-google' | 'cutora-credentials';
  emailVerified: boolean;
}

interface CutoraLoginHeroProps {
  onLoginSuccess: (session: AuthenticatedSession) => void;
  onSkipToWorkspace?: () => void;
}

const SLIDES = [
  {
    line1: 'One Document.',
    line2: 'Every Learner.',
    subline:
      'Turn dense textbooks, scanned notes, and diagrams into Bionic Reading, Braille (.BRF), flashcards, and multilingual explanations — personalized to how each student learns best.',
    accent: 'Every Learner.',
  },
  {
    line1: 'Read With Your Ears.',
    line2: 'Skim With Your Eyes.',
    subline:
      'Browser-based read-aloud at 0.5x–2x speed, bionic word-bolding that guides the eye, and a reading ruler that follows your focus. No installs needed.',
    accent: 'Your Eyes.',
  },
  {
    line1: 'Every Claim Checked.',
    line2: 'Zero Hallucination.',
    subline:
      'SourceTrace™ shows the exact extracted passage and PDF page behind every converted section — so students verify the content, not just trust the AI.',
    accent: 'Zero Hallucination.',
  },
];

const SRC_PHRASE = 'Quantum tunneling lets particles cross barriers they cannot overcome classically.';

function tokenizePhrase(phrase: string) {
  return phrase.split(' ').map((word) => {
    const bold = Math.max(1, Math.ceil(word.length * 0.5));
    return { prefix: word.slice(0, bold), suffix: word.slice(bold) };
  });
}

const PREVIEWS: { num: string; label: string; accent: string }[] = [
  { num: '01', label: 'Bionic Reading', accent: 'text-amber-300' },
  { num: '02', label: 'Braille .BRF', accent: 'text-teal-300' },
  { num: '03', label: 'Focus Flashcard', accent: 'text-amber-300' },
  { num: '04', label: 'Telugu తెలుగు', accent: 'text-teal-300' },
];

const BIONIC_TOKENS = tokenizePhrase(SRC_PHRASE);
const BRAILLE_LINE = '⠟⠥⠁⠝⠞⠥⠍ ⠞⠥⠝⠝⠑⠇⠊⠝⠛ ⠁⠇⠇⠕⠺⠎ ⠃⠁⠗⠗⠊⠑⠗⠎';

export const CutoraLoginHero: React.FC<CutoraLoginHeroProps> = ({
  onLoginSuccess,
  onSkipToWorkspace,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeDot, setActiveDot] = useState(0);
  const [previewIdx, setPreviewIdx] = useState(0);
  const [formMessage, setFormMessage] = useState<{ type: 'error' | 'info'; text: string } | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-advance hero slides every 6s and conversion preview every 2.8s
  useEffect(() => {
    const t = setInterval(() => setActiveDot((d) => (d + 1) % SLIDES.length), 6000);
    const p = setInterval(() => setPreviewIdx((d) => (d + 1) % PREVIEWS.length), 2800);
    return () => {
      clearInterval(t);
      clearInterval(p);
    };
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormMessage(null);

    // One-click demo entry: any credentials (or empty) enter demo workspace
    const trimmedEmail = email.trim() || 'scholar@campus.edu';

    setIsSubmitting(true);
    const namePart = trimmedEmail.split('@')[0].replace(/[._-]/g, ' ');
    const displayName = namePart
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(' ');

    onLoginSuccess({
      uid: `user_${trimmedEmail.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 48)}`,
      email: trimmedEmail,
      displayName: displayName || 'Campus Scholar',
      authMethod: 'cutora-credentials',
      emailVerified: false,
    });
  };

  const handleGoogleLogin = async () => {
    setFormMessage(null);
    setIsSubmitting(true);
    try {
      const fbUser: User = await signInWithGooglePopup();
      onLoginSuccess({
        uid: fbUser.uid,
        email: fbUser.email || 'scholar@campus.edu',
        displayName: fbUser.displayName || 'Verified Campus Scholar',
        photoURL: fbUser.photoURL,
        authMethod: 'firebase-google',
        emailVerified: fbUser.emailVerified,
      });
    } catch (err: unknown) {
      setIsSubmitting(false);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('popup-closed-by-user')) {
        setFormMessage({
          type: 'info',
          text: 'Google sign-in was closed. Try again, or use the demo button.',
        });
      } else {
        setFormMessage({
          type: 'info',
          text: 'Google OAuth unavailable here. Entering with a demo session...',
        });
        setTimeout(() => {
          onLoginSuccess({
            uid: 'google_verified_scholar',
            email: email.trim() || 'scholar@campus.edu',
            displayName: 'Campus Scholar',
            authMethod: 'cutora-credentials',
            emailVerified: false,
          });
        }, 650);
      }
    }
  };

  const current = SLIDES[activeDot] || SLIDES[0];

  return (
    <div
      className="relative w-screen min-h-dvh overflow-hidden select-none bg-[#0B0F1A] flex flex-col lg:flex-row items-stretch"
      style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}
    >
      {/* Ambient background: layered gradients (pure CSS, no external assets) */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 15% 85%, rgba(245,158,11,0.16), transparent 60%),' +
              'radial-gradient(ellipse 70% 55% at 85% 15%, rgba(45,212,191,0.13), transparent 55%),' +
              'radial-gradient(ellipse 50% 40% at 60% 90%, rgba(139,92,246,0.10), transparent 60%)',
          }}
        />
        {/* faint grid */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse 70% 60% at 30% 40%, black, transparent)',
          }}
        />
        {/* decorative floating braille glyphs */}
        <div
          className="absolute font-mono text-white/[0.06] leading-none pointer-events-none"
          style={{ fontSize: 'min(220px, 22vw)', top: '6%', left: '40%' }}
        >
          ⠑⠁⠧
        </div>
        <div
          className="absolute font-mono text-white/[0.05] leading-none pointer-events-none"
          style={{ fontSize: 'min(150px, 14vw)', bottom: '12%', left: '4%' }}
        >
          ⠇⠑⠁⠗⠝
        </div>
      </div>

      {/* ===== LEFT: Hero ===== */}
      <div className="relative z-10 flex-1 flex flex-col justify-between px-7 sm:px-12 lg:px-16 py-10">
        {/* Brand */}
        <div className="flex items-center justify-between cutora-fade-up" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-2xl shadow-lg"
              style={{
                width: 46,
                height: 46,
                background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 60%, #D97706 100%)',
                boxShadow: '0 8px 24px rgba(245,158,11,0.35)',
              }}
            >
              {/* graduation-cap mark */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0B0F1A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10 12 5 2 10l10 5 10-5z" fill="#0B0F1A" />
                <path d="M6 12.5V17c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" />
              </svg>
            </div>
            <div className="leading-tight">
              <span className="block text-white font-extrabold text-xl tracking-tight">
                Campus<span className="text-amber-400">Access</span>
              </span>
              <span className="block text-white/50 text-[11px] font-semibold tracking-widest uppercase">
                Accessible Learning Converter
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onSkipToWorkspace) {
                onSkipToWorkspace();
              } else {
                setFormMessage({
                  type: 'info',
                  text: 'Use the demo button on the right to jump straight into the workspace.',
                });
              }
            }}
            className="group hidden sm:inline-flex items-center gap-1.5 text-white/70 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 rounded-full px-4 py-2 text-xs font-semibold cursor-pointer transition-colors"
          >
            Live Demo
            <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
          </button>
        </div>

        {/* Headline block */}
        <div className="mt-10 lg:mt-0 max-w-2xl">
          {/* Bionic reading headline chip */}
          <div
            className="inline-flex flex-col gap-1.5 mb-5 cutora-fade-up"
            style={{ animationDelay: '0.15s' }}
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300/80">
              One paragraph · four accessible outputs
            </span>
          </div>

          {/* LIVE CONVERSION DEMO — the product showing itself */}
          <div
            className="max-w-xl rounded-2xl border border-white/12 bg-white/[0.045] backdrop-blur cutora-fade-up overflow-hidden"
            style={{ animationDelay: '0.22s' }}
          >
            {/* fake window bar */}
            <div className="flex items-center gap-1.5 px-4 pt-3">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400/70" />
              <span className="ml-2 text-[9px] font-mono uppercase tracking-widest text-white/35">
                IC26_Physics_Scan.pdf · Ch3 Sec3.2 · p.38
              </span>
            </div>

            <div className="px-4 py-3.5">
              {/* input line */}
              <div className="text-[11px] text-white/40 mb-1.5 font-medium">Original scan</div>
              <p className="text-[13px] leading-relaxed text-white/55 line-through decoration-white/20">
                {SRC_PHRASE}
              </p>

              {/* transform arrow */}
              <div className="flex items-center gap-2 my-2.5">
                <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-amber-400/50" />
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-amber-400">
                  ↓ AccessibleConvert™
                </span>
                <div className="flex-1 h-px bg-gradient-to-l from-white/20 to-amber-400/50" />
              </div>

              {/* output preview */}
              <div key={previewIdx} className="cutora-fade-up" style={{ animationDuration: '0.4s' }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-white/40 font-medium">Output</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${PREVIEWS[previewIdx].accent}`}>
                    {PREVIEWS[previewIdx].num} · {PREVIEWS[previewIdx].label}
                  </span>
                </div>

                {previewIdx === 0 && (
                  <p className="text-[14px] leading-relaxed text-white/90">
                    {BIONIC_TOKENS.map((t, i) => (
                      <span key={i}>
                        <strong className="font-extrabold text-amber-300">{t.prefix}</strong>
                        <span className="text-white/65">{t.suffix}</span>{' '}
                      </span>
                    ))}
                  </p>
                )}
                {previewIdx === 1 && (
                  <p className="font-mono text-[17px] leading-relaxed tracking-[0.08em] break-words text-white/85">
                    <span className="text-white/30 text-[12px] mr-2">out:</span>
                    {BRAILLE_LINE}
                  </p>
                )}
                {previewIdx === 2 && (
                  <div className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-3.5 py-2.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                      Q · Checkpoint 2/12
                    </div>
                    <div className="text-[13px] text-white/85 mt-0.5">
                      Why can't the particle be blocked by the barrier?
                    </div>
                    <div className="text-[11px] text-teal-300/90 mt-1">
                      A. Its wavefunction decays inside but never reaches zero.
                    </div>
                  </div>
                )}
                {previewIdx === 3 && (
                  <p className="text-[15px] leading-relaxed text-white/90">
                    <span className="text-white/30 text-[12px] mr-2 font-medium">తెలుగు:</span>
                    భాష్పగ్రాహ్యము గట్టు కలిసిన ప్రతి భాగాన్ని కుదించి సులభ భాషలో వివరించబడుతుంది.
                  </p>
                )}
              </div>
            </div>

            {/* preview dots */}
            <div className="flex items-center justify-center gap-1.5 pb-3">
              {PREVIEWS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Preview output ${i + 1}`}
                  onClick={() => setPreviewIdx(i)}
                  className="cursor-pointer border-0 p-0 transition-all duration-300"
                  style={{
                    width: previewIdx === i ? 20 : 7,
                    height: 7,
                    borderRadius: 999,
                    backgroundColor: previewIdx === i ? '#F59E0B' : 'rgba(255,255,255,0.25)',
                  }}
                />
              ))}
            </div>
          </div>

          <h1
            className="text-white font-bold m-0"
            style={{
              fontSize: 'clamp(2.4rem, 5.2vw, 4.2rem)',
              lineHeight: 1.06,
              letterSpacing: '-0.03em',
            }}
          >
            <span className="overflow-hidden block">
              <span className="cutora-wipe-line" style={{ animationDelay: '0.2s' }}>
                {current.line1}
              </span>
            </span>
            <span className="overflow-hidden block">
              <span
                className="cutora-wipe-line"
                style={{
                  animationDelay: '0.3s',
                  background: 'linear-gradient(90deg, #FBBF24, #F59E0B 55%, #2DD4BF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {current.line2}
              </span>
            </span>
          </h1>

          <p
            key={activeDot}
            className="text-white/70 mt-5 max-w-xl text-[15px] sm:text-base leading-relaxed cutora-fade-up"
            style={{ animationDelay: '0.4s' }}
          >
            {current.subline}
          </p>

          {/* trust row */}
          <div className="flex flex-wrap items-center gap-2 mt-7 cutora-fade-up" style={{ animationDelay: '0.5s' }}>
            {['Bionic Reading', 'Braille .BRF', 'Focus Flashcards', 'Read-Aloud', 'SourceTrace™'].map(
              (chip) => (
                <span
                  key={chip}
                  className="text-[11px] font-semibold text-white/80 border border-white/15 bg-white/[0.05] rounded-full px-3 py-1.5"
                >
                  {chip}
                </span>
              )
            )}
          </div>

          {/* dots */}
          <div className="flex items-center gap-2 mt-8" role="tablist" aria-label="Hero slides">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={activeDot === i}
                aria-label={`Slide ${i + 1}`}
                onClick={() => setActiveDot(i)}
                className="cursor-pointer border-0 p-0 transition-all duration-300"
                style={{
                  width: activeDot === i ? 30 : 9,
                  height: 9,
                  borderRadius: 999,
                  backgroundColor: activeDot === i ? '#F59E0B' : 'rgba(255,255,255,0.3)',
                }}
              />
            ))}
          </div>
        </div>

        {/* bottom stats strip */}
        <div
          className="hidden md:flex items-center gap-8 mt-10 cutora-fade-up"
          style={{ animationDelay: '0.6s' }}
        >
          {[
            ['4', 'Accessible Output Modes'],
            ['3', 'Languages + Simplified English'],
            ['100%', 'AI-Offline Capable (Bundled Fallbacks)'],
          ].map(([num, label]) => (
            <div key={label} className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-amber-400">{num}</span>
              <span className="text-[11px] text-white/55 font-medium leading-tight max-w-[140px]">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== RIGHT: Login card ===== */}
      <div className="relative z-10 flex items-center justify-center px-5 pb-10 lg:py-12 lg:pr-14">
        <div
          className="w-full cutora-card-rise"
          style={{
            maxWidth: 430,
            background: 'rgba(255,255,255,0.97)',
            borderRadius: 24,
            boxShadow: '0 30px 80px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.6) inset',
            padding: '36px 34px',
          }}
        >
          <h2 className="text-slate-900 m-0" style={{ fontSize: 28, fontWeight: 750, letterSpacing: '-0.02em' }}>
            Enter the Workspace
          </h2>
          <p className="text-slate-500 mt-1.5 text-sm">
            Sign in to your personalized accessibility profile.
          </p>

          {formMessage && (
            <div
              role="alert"
              className={`mt-4 px-3.5 py-2.5 rounded-xl text-xs font-medium ${
                formMessage.type === 'error'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-amber-50 text-amber-900 border border-amber-200'
              }`}
            >
              {formMessage.text}
            </div>
          )}

          <form onSubmit={handleFormSubmit} noValidate className="mt-6">
            <label htmlFor="cutora-email-input" className="block text-slate-800 text-[13px] font-semibold mb-1.5">
              Campus Email
            </label>
            <input
              id="cutora-email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@campus.edu"
              autoComplete="email"
              className="w-full bg-white text-slate-900 placeholder-slate-400 border border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15 focus:outline-none px-4 rounded-xl h-12 text-sm transition-all"
            />

            <label htmlFor="cutora-password-input" className="block text-slate-800 text-[13px] font-semibold mt-4 mb-1.5">
              Password
            </label>
            <div className="relative flex items-center">
              <input
                id="cutora-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Any password works for the demo"
                autoComplete="current-password"
                className="w-full bg-white text-slate-900 placeholder-slate-400 border border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15 focus:outline-none pl-4 pr-12 rounded-xl h-12 text-sm transition-all"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 text-slate-400 hover:text-slate-700 p-1.5 bg-transparent border-0 cursor-pointer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                  {showPassword && <line x1="2" y1="2" x2="22" y2="22" />}
                </svg>
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-7 h-12 rounded-xl bg-slate-950 hover:bg-slate-900 disabled:opacity-60 text-amber-400 font-bold text-[15px] cursor-pointer border-0 flex items-center justify-center gap-2 transition-colors"
              style={{ boxShadow: '0 10px 28px rgba(2,6,23,0.35)' }}
            >
              {isSubmitting ? 'Preparing your workspace…' : 'Enter Demo Workspace'}
              <span aria-hidden>→</span>
            </button>
          </form>

          <div className="flex items-center gap-3 mt-6 mb-5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-slate-400 text-xs font-medium">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleGoogleLogin}
            className="w-full h-12 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-300 rounded-xl flex items-center justify-center gap-3 cursor-pointer text-sm font-semibold transition-colors"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z" />
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.7z" />
              <path fill="#FBBC05" d="M5.3 14.8c-.2-.8-.4-1.8-.4-2.8s.2-2 .4-2.8L1.6 6.4C.6 8.4 0 10.6 0 12s.6 3.6 1.6 5.6l3.7-2.8z" />
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5l-3.7 2.8C3.5 19.9 7.4 23 12 23z" />
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-slate-400 text-xs mt-6 leading-relaxed">
            Demo build — no data leaves this device unauthenticated.
            <br />Google sign-in syncs preferences privately to Firestore.
          </p>
        </div>
      </div>
    </div>
  );
};
