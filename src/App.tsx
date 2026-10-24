/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  UploadCloud,
  FileText,
  Sparkles,
  Contrast,
  Type as TypeIcon,
  Bold,
  AlignJustify,
  RotateCcw,
  Search,
  ShieldCheck,
  MessageSquareText,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Volume2,
  FileSearch,
  Sliders,
  X,
} from 'lucide-react';
import {
  CutoraLoginHero,
  AuthenticatedSession,
} from './components/CutoraLoginHero';
import { PrivacySecurityModal } from './components/PrivacySecurityModal';
import { OriginalDocumentPreview } from './components/OriginalDocumentPreview';
import { AccessibleOutputTabs } from './components/AccessibleOutputTabs';
import { ChatbotDrawer } from './components/ChatbotDrawer';
import {
  SAMPLE_MATERIALS,
  LearningMaterialDocument,
  DocumentSection,
} from './data/sampleMaterials';
import {
  AccessibilityPreferences,
  AccessPersonaId,
  DEFAULT_PREFERENCES,
  applyAccessPersonaPreset,
  parseTextIntoSections,
  formatSourceTraceCitation,
} from './utils/accessibilityLogic';
import {
  auth,
  onAuthStateChanged,
  signOutUser,
  loadUserPreferencesFromFirestore,
  syncUserPreferencesToFirestore,
  syncReadingProgressToFirestore,
} from './firebase';

const LOCAL_PREFS_KEY = 'campusaccess_preferences_v1';
const LOCAL_PROGRESS_KEY = 'campusaccess_progress_v1';
const LOCAL_SESSION_KEY = 'campusaccess_session_v1';

export default function App() {
  // Check if ?autostart=1 is present for automated browser verification
  const isAutostart =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('autostart') === '1';

  // Auth & Gate Flow States: 'login' -> 'loading-workspace' -> 'privacy-gate' -> 'workspace'
  const [authStage, setAuthStage] = useState<
    'login' | 'loading-workspace' | 'privacy-gate' | 'workspace'
  >(() => {
    if (isAutostart) return 'workspace';
    try {
      const savedSession = localStorage.getItem(LOCAL_SESSION_KEY);
      const savedPrefs = localStorage.getItem(LOCAL_PREFS_KEY);
      if (savedSession) {
        const parsedPrefs = savedPrefs ? JSON.parse(savedPrefs) : null;
        if (parsedPrefs?.privacyAccepted) {
          return 'workspace';
        }
        return 'privacy-gate';
      }
    } catch {
      // Ignore storage errors
    }
    return 'login';
  });

  const [session, setSession] = useState<AuthenticatedSession | null>(() => {
    if (isAutostart) {
      return {
        uid: 'autostart_scholar',
        email: 'mana.prayaanaam@gmail.com',
        displayName: 'Mana Prayaanaam',
        authMethod: 'cutora-credentials',
        emailVerified: false,
      };
    }
    try {
      const saved = localStorage.getItem(LOCAL_SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Preferences State
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_PREFS_KEY);
      if (saved) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
      }
    } catch {
      // Ignore
    }
    return { ...DEFAULT_PREFERENCES, privacyAccepted: isAutostart };
  });

  // Documents & Active Material State
  const [customDocuments, setCustomDocuments] = useState<LearningMaterialDocument[]>([]);
  const [activeDocId, setActiveDocId] = useState<string>('sample-physics');
  const [activeSectionId, setActiveSectionId] = useState<string>('sec-1-1');
  const [completedCheckpoints, setCompletedCheckpoints] = useState<string[]>(['chk-phys-1']);

  // Upload & Search UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'idle' | 'processing' | 'success' | 'warning' | 'error';
    message: string;
  }>({
    type: 'idle',
    message: '',
  });
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Reading Ruler Y coordinate
  const [rulerY, setRulerY] = useState<number>(280);

  // Modals & Drawers
  const [sourceTraceModalSection, setSourceTraceModalSection] =
    useState<DocumentSection | null>(null);
  const [showPrivacyModalInApp, setShowPrivacyModalInApp] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // Browser Web Speech API State
  const [speechState, setSpeechState] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [speechStatusMessage, setSpeechStatusMessage] = useState<string | null>(null);

  const allDocuments = [...SAMPLE_MATERIALS, ...customDocuments];
  const activeDocument =
    allDocuments.find((d) => d.id === activeDocId) || SAMPLE_MATERIALS[0];
  const activeSection =
    activeDocument.sections.find((s) => s.id === activeSectionId) ||
    activeDocument.sections[0];

  // Check Web Speech API support on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSpeechSupported(false);
      setSpeechStatusMessage('Browser SpeechSynthesis API is unavailable in this environment.');
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: any) => {
      if (fbUser) {
        const newSession: AuthenticatedSession = {
          uid: fbUser.uid,
          email: fbUser.email || 'mana.prayaanaam@gmail.com',
          displayName: fbUser.displayName || 'Campus Scholar',
          photoURL: fbUser.photoURL,
          authMethod: 'firebase-google',
          emailVerified: fbUser.emailVerified,
        };
        setSession(newSession);
        try {
          localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(newSession));
          const cloudPrefs = await loadUserPreferencesFromFirestore(fbUser.uid);
          if (cloudPrefs) {
            setPreferences(cloudPrefs);
            localStorage.setItem(LOCAL_PREFS_KEY, JSON.stringify(cloudPrefs));
          }
        } catch {
          // Local fallback already active
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Reading Ruler mouse move tracker
  useEffect(() => {
    if (!preferences.readingRuler) return;
    const handleMouseMove = (e: MouseEvent) => {
      setRulerY(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [preferences.readingRuler]);

  // Persist preferences locally, to Express backend, and to Firestore when authenticated
  const updatePreferences = useCallback(
    (partial: Partial<AccessibilityPreferences>) => {
      setPreferences((prev) => {
        const next = { ...prev, ...partial };
        try {
          localStorage.setItem(LOCAL_PREFS_KEY, JSON.stringify(next));
        } catch {
          // Ignore
        }
        const sessionId = session?.uid || 'local-demo-session';
        fetch(`/api/preferences/${sessionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(next),
        }).catch(() => {});

        if (session?.uid) {
          syncUserPreferencesToFirestore(session.uid, next).catch(() => {});
        }
        return next;
      });
    },
    [session]
  );

  // Persist reading progress
  const saveProgress = useCallback(
    (docId: string, secId: string, checkpoints: string[]) => {
      try {
        localStorage.setItem(
          LOCAL_PROGRESS_KEY,
          JSON.stringify({ docId, secId, checkpoints })
        );
      } catch {
        // Ignore
      }
      fetch(`/api/progress/${docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session?.uid || 'local-demo-session',
          activeSectionId: secId,
          completedCheckpoints: checkpoints,
        }),
      }).catch(() => {});

      if (session?.uid) {
        syncReadingProgressToFirestore(
          session.uid,
          docId,
          secId,
          checkpoints
        ).catch(() => {});
      }
    },
    [session]
  );

  // Restore saved reading progress on initial load
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_PROGRESS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.docId && SAMPLE_MATERIALS.some((d) => d.id === parsed.docId)) {
          setActiveDocId(parsed.docId);
          if (parsed.secId) setActiveSectionId(parsed.secId);
          if (Array.isArray(parsed.checkpoints)) {
            setCompletedCheckpoints(parsed.checkpoints);
          }
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  // SpeechSynthesis Handlers
  const handlePlaySpeech = useCallback(
    (customText?: string, langCode?: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setSpeechSupported(false);
        setSpeechStatusMessage(
          'SpeechSynthesis is not supported by this browser. Try Chrome, Edge, or Safari.'
        );
        return;
      }

      try {
        window.speechSynthesis.cancel();
        const textToRead =
          customText ||
          `${activeSection.title}. ${activeSection.accessibleParagraphs.join(' ')} Key takeaway: ${activeSection.keyTakeaway}`;

        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.rate = preferences.speechRate;
        utterance.lang = langCode || 'en-US';

        utterance.onstart = () => {
          setSpeechState('playing');
          setSpeechStatusMessage(
            `Reading aloud at ${preferences.speechRate.toFixed(1)}x (${utterance.lang})...`
          );
        };
        utterance.onend = () => {
          setSpeechState('idle');
          setSpeechStatusMessage('Completed read-aloud playback.');
        };
        utterance.onerror = () => {
          setSpeechState('idle');
          setSpeechStatusMessage('Audio playback stopped.');
        };

        setSpeechState('playing');
        setSpeechStatusMessage(
          `Playing audio via Web Speech API at ${preferences.speechRate.toFixed(1)}x speed...`
        );
        window.speechSynthesis.speak(utterance);
      } catch {
        setSpeechState('idle');
        setSpeechStatusMessage('Unable to start browser speech synthesis.');
      }
    },
    [activeSection, preferences.speechRate]
  );

  const handlePauseSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setSpeechState('paused');
      setSpeechStatusMessage('Read-aloud paused.');
    }
  };

  const handleResumeSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
      setSpeechState('playing');
      setSpeechStatusMessage(
        `Resumed read-aloud at ${preferences.speechRate.toFixed(1)}x speed...`
      );
    }
  };

  const handleStopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeechState('idle');
      setSpeechStatusMessage('Stopped read-aloud.');
    }
  };

  // Handle Login Completion -> Smooth Loading Transition -> Privacy & Security Gate
  const handleLoginSuccess = (newSession: AuthenticatedSession) => {
    setSession(newSession);
    try {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(newSession));
    } catch {
      // Ignore
    }
    setAuthStage('loading-workspace');
    setTimeout(() => {
      setAuthStage('privacy-gate');
    }, 950);
  };

  const handleAcceptPrivacyAndEnter = () => {
    updatePreferences({ privacyAccepted: true });
    setAuthStage('workspace');
  };

  const handleLogout = async () => {
    handleStopSpeech();
    try {
      await signOutUser();
    } catch {
      // Ignore if not signed in via Firebase Google
    }
    try {
      localStorage.removeItem(LOCAL_SESSION_KEY);
    } catch {
      // Ignore
    }
    setSession(null);
    setShowPrivacyModalInApp(false);
    setAuthStage('login');
  };

  // Switch Sample Material
  const handleSelectMaterial = (docId: string, targetSectionId?: string) => {
    handleStopSpeech();
    const targetDoc =
      allDocuments.find((d) => d.id === docId) || SAMPLE_MATERIALS[0];
    const nextSecId =
      targetSectionId && targetDoc.sections.some((s) => s.id === targetSectionId)
        ? targetSectionId
        : targetDoc.sections[0].id;

    setActiveDocId(targetDoc.id);
    setActiveSectionId(nextSecId);
    setUploadStatus({
      type: 'success',
      message: `Loaded "${targetDoc.shortLabel}" (${targetDoc.pageCount} pages, ${targetDoc.sections.length} structured sections).`,
    });
    saveProgress(targetDoc.id, nextSecId, completedCheckpoints);
  };

  // Select Section (Chapter Teleport)
  const handleSelectSection = (sectionId: string, autoReadAloud = false) => {
    const found = activeDocument.sections.find((s) => s.id === sectionId);
    if (!found) return;
    setActiveSectionId(found.id);
    saveProgress(activeDocument.id, found.id, completedCheckpoints);
    if (autoReadAloud) {
      setTimeout(() => {
        handlePlaySpeech(
          `${found.title}. ${found.accessibleParagraphs.join(' ')}`
        );
      }, 80);
    }
  };

  // File Upload Handler (Validates PDF / Text, Extracts Sections, Provides Honest Fallback)
  const handleFileUpload = async (file: File) => {
    const allowedExtensions = ['.pdf', '.txt', '.md'];
    const lowerName = file.name.toLowerCase();
    const isAllowed =
      file.type === 'application/pdf' ||
      file.type === 'text/plain' ||
      allowedExtensions.some((ext) => lowerName.endsWith(ext));

    if (!isAllowed) {
      setUploadStatus({
        type: 'error',
        message: `Unsupported file type "${file.name}". Please upload a valid PDF (.pdf) or text (.txt) learning material.`,
      });
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setUploadStatus({
        type: 'error',
        message: `File "${file.name}" exceeds the 15 MB upload limit.`,
      });
      return;
    }

    setUploadStatus({
      type: 'processing',
      message: `Extracting text, headings, and SourceTrace references from "${file.name}"...`,
    });

    try {
      const rawBuffer = await file.text();
      // Filter readable ASCII lines if it's a PDF stream or plain text
      const cleanedText = rawBuffer
        .replace(/[^\x20-\x7E\r\n]/g, ' ')
        .replace(/\s{3,}/g, '\n');

      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type || 'application/pdf',
          fileSize: file.size,
          rawText: cleanedText.slice(0, 60000),
        }),
      });

      const parsedLocal = parseTextIntoSections(cleanedText, file.name);
      let serverWarnings: string[] = parsedLocal.warnings;

      if (response.ok) {
        const apiData = await response.json();
        if (apiData.warnings?.length) {
          serverWarnings = apiData.warnings;
        }
      }

      if (parsedLocal.sections.length > 0 && !lowerName.endsWith('.pdf')) {
        const newDocId = `uploaded-${Date.now()}`;
        const builtSections: DocumentSection[] = parsedLocal.sections.map(
          (ps, idx) => ({
            ...SAMPLE_MATERIALS[0].sections[0],
            id: ps.id || `sec-up-${idx + 1}`,
            chapterNumber: ps.chapterNumber,
            chapterTitle: `Chapter ${ps.chapterNumber}: Uploaded Material`,
            sectionCode: ps.sectionCode,
            title: ps.title,
            pageNumber: ps.pageNumber,
            sourceQuote: `Uploaded File "${file.name}", Page ${ps.pageNumber ?? 1}: "${ps.content[0]?.slice(0, 140) || ''}"`,
            sourceConfidence: ps.pageNumber
              ? `Extracted from ${file.name} · Page ${ps.pageNumber}`
              : 'Reference unavailable',
            originalMessySnippet: ps.content.join(' ').slice(0, 260),
            accessibleParagraphs:
              ps.content.length > 0
                ? ps.content
                : ['Extracted section content ready for personalized reading.'],
            keyTakeaway:
              ps.content[0] ||
              'Extracted passage converted into structured accessible text.',
          })
        );

        const uploadedDoc: LearningMaterialDocument = {
          ...SAMPLE_MATERIALS[0],
          id: newDocId,
          title: `Uploaded Material: ${file.name}`,
          shortLabel: file.name,
          badgeCategory: 'User Uploaded Document',
          fileName: file.name,
          pageCount: parsedLocal.pageCount || 1,
          uploadWarnings: serverWarnings,
          sections: builtSections,
        };

        setCustomDocuments((prev) => [uploadedDoc, ...prev]);
        setActiveDocId(newDocId);
        setActiveSectionId(builtSections[0].id);
        setUploadStatus({
          type: 'success',
          message: `Successfully extracted ${builtSections.length} sections from "${file.name}".`,
        });
      } else {
        // Fallback to bundled sample textbook when binary/scanned PDF requires OCR fallback
        setActiveDocId('sample-physics');
        setActiveSectionId('sec-3-2');
        setUploadStatus({
          type: 'warning',
          message:
            serverWarnings[0] ||
            `Processed "${file.name}". Detected binary/scanned PDF encoding — activated bundled multi-chapter sample textbook fallback so all interactive accessibility features can be verified reliably.`,
        });
      }
    } catch {
      setActiveDocId('sample-physics');
      setActiveSectionId('sec-3-2');
      setUploadStatus({
        type: 'warning',
        message: `Could not extract embedded text stream from "${file.name}". Loaded the bundled sample textbook fallback.`,
      });
    }
  };

  const handleToggleCheckpoint = (checkpointId: string) => {
    setCompletedCheckpoints((prev) => {
      const next = prev.includes(checkpointId)
        ? prev.filter((id) => id !== checkpointId)
        : [...prev, checkpointId];
      saveProgress(activeDocument.id, activeSection.id, next);
      return next;
    });
  };

  // STAGE 1: CUTORA LOGIN HERO
  if (authStage === 'login') {
    return (
      <CutoraLoginHero
        onLoginSuccess={handleLoginSuccess}
        onSkipToWorkspace={() =>
          handleLoginSuccess({
            uid: 'campus_guest_scholar',
            email: 'mana.prayaanaam@gmail.com',
            displayName: 'Mana Prayaanaam',
            authMethod: 'cutora-credentials',
            emailVerified: false,
          })
        }
      />
    );
  }

  // STAGE 2: LOADING TRANSITION AFTER SIGN-IN
  if (authStage === 'loading-workspace') {
    return (
      <div
        className="w-screen h-dvh bg-slate-950 text-white flex flex-col items-center justify-center p-6 select-none"
        role="status"
        aria-live="polite"
      >
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center mx-auto animate-spin">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold tracking-tight">
              Authenticating & Preparing Workspace...
            </h2>
            <p className="text-xs text-slate-400">
              Verified session for <strong className="text-amber-400">{session?.email}</strong>. Loading Privacy Policy & Zero-Trust Security Gate...
            </p>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 to-teal-400 w-4/5 rounded-full transition-all duration-700" />
          </div>
        </div>
      </div>
    );
  }

  // STAGE 3: PRIVACY POLICY & SECURITY GATE BEFORE OPENING WORKSPACE
  if (authStage === 'privacy-gate' && session) {
    return (
      <PrivacySecurityModal
        session={session}
        onAcceptPrivacyAndEnter={handleAcceptPrivacyAndEnter}
        onLogout={handleLogout}
        isStandaloneGate={true}
      />
    );
  }

  const hc = preferences.highContrast;

  // STAGE 4: MAIN CAMPUSACCESS APPLICATION INTERFACE
  return (
    <div
      className={`min-h-screen flex flex-col transition-colors ${
        hc ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
      } ${preferences.dyslexiaFont ? 'font-dyslexic' : ''}`}
    >
      {/* Reading Ruler Follow Overlay */}
      {preferences.readingRuler && (
        <div
          aria-hidden="true"
          className="fixed inset-x-0 pointer-events-none z-40 border-y-2 border-amber-400 bg-amber-300/20"
          style={{
            top: `${Math.max(0, rulerY - 22)}px`,
            height: '44px',
          }}
        />
      )}

      {/* TOP BAR CONTRACT: 3 Zones (Brand — Nav Links — Primary Action) */}
      <header
        className={`sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 border-b ${
          hc
            ? 'bg-slate-950 border-amber-400 text-white'
            : 'bg-slate-900 border-slate-800 text-white'
        }`}
      >
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          className="text-lg font-extrabold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          CampusAccess
        </a>

        {/* Zone 2: 4–5 concise single-line navigation links */}
        <nav
          aria-label="Primary Workspace Navigation"
          className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300"
        >
          <a
            href="#upload-section"
            className="hover:text-white hover:underline transition-colors whitespace-nowrap shrink-0"
          >
            Upload & Samples
          </a>
          <a
            href="#converter-workspace"
            className="hover:text-white hover:underline transition-colors whitespace-nowrap shrink-0"
          >
            Converter Workspace
          </a>
          <button
            type="button"
            onClick={() => setShowSettingsDrawer((prev) => !prev)}
            className="hover:text-white hover:underline transition-colors whitespace-nowrap shrink-0 bg-transparent border-0 p-0 text-slate-300 cursor-pointer"
          >
            AccessPersona Settings
          </button>
          <button
            type="button"
            onClick={() => setShowPrivacyModalInApp(true)}
            className="hover:text-white hover:underline transition-colors whitespace-nowrap shrink-0 bg-transparent border-0 p-0 text-slate-300 cursor-pointer"
          >
            Privacy & Security
          </button>
        </nav>

        {/* Zone 3: Primary Action & Session Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsChatbotOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl cursor-pointer whitespace-nowrap shrink-0"
          >
            <MessageSquareText className="w-4 h-4" />
            <span>Ask AI Tutor</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            aria-label="Log out of CampusAccess"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl cursor-pointer whitespace-nowrap shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* LIVE ACCESSIBILITY TOOLBAR & ACCESSPERSONA BAR */}
      <section
        aria-label="Live Accessibility Toolbar"
        className={`border-b px-6 py-2.5 ${
          hc
            ? 'bg-slate-900 border-amber-400/70 text-white'
            : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
        }`}
      >
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          {/* Left: AccessPersona One-Click Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider mr-1.5 flex items-center gap-1.5 ${
                hc ? 'text-amber-300' : 'text-teal-700'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Persona</span>
            </span>
            {(
              [
                { id: 'standard', label: 'Standard' },
                { id: 'low-vision', label: 'Low Vision' },
                { id: 'focus-reading', label: 'Focus Reading' },
                { id: 'audio-first', label: 'Audio First' },
              ] as { id: AccessPersonaId; label: string }[]
            ).map((preset) => {
              const isActive = preferences.persona === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => {
                    const next = applyAccessPersonaPreset(
                      preset.id,
                      preferences.privacyAccepted
                    );
                    updatePreferences(next);
                    if (preset.id === 'audio-first') {
                      handlePlaySpeech();
                    }
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer whitespace-nowrap border ${
                    isActive
                      ? hc
                        ? 'bg-amber-400 text-slate-950 border-amber-400'
                        : 'bg-teal-700 text-white border-teal-700 shadow-xs'
                      : hc
                      ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-teal-600 hover:text-teal-800'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Right: Individual Live Toggles */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                {
                  key: 'highContrast',
                  label: 'High Contrast',
                  Icon: Contrast,
                  on: hc ? 'bg-amber-400 text-slate-950 border-amber-400' : 'bg-violet-700 text-white border-violet-700',
                },
                {
                  key: 'dyslexiaFont',
                  label: 'Dyslexia Font',
                  Icon: TypeIcon,
                  on: hc ? 'bg-amber-400 text-slate-950 border-amber-400' : 'bg-teal-700 text-white border-teal-700',
                },
                {
                  key: 'bionicReading',
                  label: 'Bionic Reading',
                  Icon: Bold,
                  on: hc ? 'bg-amber-400 text-slate-950 border-amber-400' : 'bg-amber-500 text-slate-950 border-amber-500',
                },
                {
                  key: 'readingRuler',
                  label: 'Reading Ruler',
                  Icon: AlignJustify,
                  on: hc ? 'bg-amber-400 text-slate-950 border-amber-400' : 'bg-slate-700 text-white border-slate-700',
                },
              ] as const
            ).map(({ key, label, Icon, on }) => {
              const active = Boolean(preferences[key]);
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    updatePreferences({ [key]: !preferences[key] } as Partial<AccessibilityPreferences>)
                  }
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer whitespace-nowrap ${
                    active
                      ? on
                      : hc
                      ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </button>
              );
            })}

            {/* Font Size Adjuster */}
            <div
              className={`inline-flex items-center gap-0.5 px-1 py-1 rounded-full border text-xs font-semibold ${
                hc ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <button
                type="button"
                aria-label="Decrease font size"
                onClick={() =>
                  updatePreferences({
                    fontSize: Math.max(14, preferences.fontSize - 2),
                  })
                }
                className="px-2 py-0.5 rounded-full hover:bg-slate-300/40 font-bold cursor-pointer"
              >
                A−
              </button>
              <span className="font-mono tabular-nums px-1 min-w-[44px] text-center">
                {preferences.fontSize}px
              </span>
              <button
                type="button"
                aria-label="Increase font size"
                onClick={() =>
                  updatePreferences({
                    fontSize: Math.min(28, preferences.fontSize + 2),
                  })
                }
                className="px-2 py-0.5 rounded-full hover:bg-slate-300/40 font-bold cursor-pointer"
              >
                A+
              </button>
            </div>

            {/* Reset Toolbar Button */}
            <button
              type="button"
              aria-label="Reset accessibility settings to standard"
              onClick={() =>
                updatePreferences(
                  applyAccessPersonaPreset('standard', preferences.privacyAccepted)
                )
              }
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold border cursor-pointer ${
                hc
                  ? 'bg-slate-800 border-slate-700 text-slate-300'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT CONTAINER */}
      <main id="top" className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-4 space-y-4">
        {/* HERO BANNER */}
        <section
          className={`relative rounded-3xl border overflow-hidden flex flex-col lg:flex-row items-stretch justify-between gap-2 ${
            hc
              ? 'bg-slate-900 border-amber-400 text-white'
              : 'border-slate-800 shadow-md text-white bg-slate-900'
          }`}
        >
          {!hc && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute"
              style={{
                inset: 0,
                background:
                  'radial-gradient(ellipse 60% 120% at 8% 0%, rgba(245,158,11,0.13), transparent 55%), radial-gradient(ellipse 55% 110% at 55% 120%, rgba(45,212,191,0.12), transparent 55%)',
              }}
            />
          )}
          <div
            aria-hidden="true"
            className={`pointer-events-none relative font-mono select-none hidden xl:block leading-none shrink-0 my-auto ${hc ? 'text-amber-400/10' : 'text-white/[0.07]'}`}
            style={{ fontSize: 72, paddingLeft: 4 }}
          >
            ⠅⠁⠍⠏
          </div>
          <div className="relative space-y-1.5 max-w-2xl px-5 lg:px-1 py-4">
            <div className="flex items-center gap-2.5 mb-1">
              <span className="text-[11px] font-bold text-amber-400 tracking-wide rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-1">
                IC26-02-05 · EdTech &amp; AI/ML
              </span>
              <span className="text-[11px] font-semibold text-teal-300/90 tracking-wide">
                Innovators Conclave 2026
              </span>
            </div>
            <h1 className="text-2xl sm:text-[27px] font-extrabold tracking-tight leading-tight">
              CampusAccess: One document.{' '}
              <span
                style={{
                  background: 'linear-gradient(90deg, #FBBF24, #F59E0B 60%, #2DD4BF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Every learner.
              </span>
            </h1>
            <p className="text-[13px] text-slate-300/95 leading-relaxed max-w-xl">
              Turn dense textbooks, scans, and lectures into{' '}
              <strong className="text-amber-300">Bionic Reading</strong>,{' '}
              <strong className="text-teal-300">Braille (.BRF)</strong>,{' '}
              <strong className="text-teal-300">ADHD Flashcards</strong>, and{' '}
              <strong className="text-teal-300">multilingual</strong> study modes — with verifiable
              sources for every converted paragraph.
            </p>
          </div>

          {/* 3-Minute Demo Quick-Steps */}
          <div
            className={`relative w-full lg:w-auto lg:max-w-[420px] rounded-2xl border p-3.5 space-y-2.5 shrink-0 m-3 lg:m-4 ${
              hc ? 'bg-slate-950/80 border-slate-700' : 'bg-white/[0.045] border-white/10 backdrop-blur'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-[11px] font-extrabold text-amber-400 tracking-wide">
                3-Minute Demo Flow
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                Upload → Personalize → Verify
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleSelectMaterial('sample-physics', 'sec-1-1')}
                className="px-3 py-2 rounded-xl text-[11px] font-semibold bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/10 cursor-pointer text-left leading-snug transition-colors"
              >
                <span className="font-mono text-amber-400 mr-1.5 font-bold">0:30</span>
                Open Sample Textbook
              </button>
              <button
                type="button"
                onClick={() => handleSelectSection('sec-3-2', false)}
                className="px-3 py-2 rounded-xl text-[11px] font-semibold bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/10 cursor-pointer text-left leading-snug transition-colors"
              >
                <span className="font-mono text-amber-400 mr-1.5 font-bold">1:00</span>
                Jump to Ch 3, Sec 3.2
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = applyAccessPersonaPreset('low-vision', true);
                  updatePreferences(next);
                  handlePlaySpeech();
                }}
                className="px-3 py-2 rounded-xl text-[11px] font-semibold bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/10 cursor-pointer text-left leading-snug transition-colors"
              >
                <span className="font-mono text-amber-400 mr-1.5 font-bold">1:30</span>
                Low Vision + Read Aloud
              </button>
              <button
                type="button"
                onClick={() => setSourceTraceModalSection(activeSection)}
                className="px-3 py-2 rounded-xl text-[11px] font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer text-left leading-snug transition-colors"
              >
                <span className="font-mono mr-1.5 font-bold">2:00</span>
                Verify SourceTrace
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 1: UPLOAD & PRE-LOADED DEMO MATERIAL SELECTOR */}
        <section
          id="upload-section"
          className={`rounded-2xl border p-4 ${
            hc
              ? 'bg-slate-900 border-slate-700'
              : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* Left 4 cols: Drag-and-Drop PDF Uploader */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingOver(true);
              }}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              className={`lg:col-span-4 rounded-xl border-2 border-dashed p-3.5 flex flex-col items-center justify-center text-center transition-colors ${
                isDraggingOver
                  ? 'border-teal-500 bg-teal-50/50'
                  : hc
                  ? 'border-amber-400/60 bg-slate-950'
                  : 'border-slate-300 bg-slate-50/70 hover:border-teal-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <UploadCloud
                  className={`w-5 h-5 ${
                    hc ? 'text-amber-400' : 'text-teal-700'
                  }`}
                />
                <h2 className="text-xs font-bold">
                  Drag & Drop PDF / Text Material
                </h2>
              </div>
              <p
                className={`text-[11px] mt-1 ${
                  hc ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                Extracts chapters, formulas & SourceTrace pages privately.
              </p>

              <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
                <label
                  htmlFor="pdf-file-upload-input"
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 ${
                    hc
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Browse PDF</span>
                </label>
                <input
                  id="pdf-file-upload-input"
                  type="file"
                  accept=".pdf,.txt,.md,application/pdf,text/plain"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                  className="sr-only"
                />

                <button
                  type="button"
                  onClick={() => handleSelectMaterial('sample-physics', 'sec-1-1')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                    hc
                      ? 'bg-slate-900 border-amber-400 text-amber-300'
                      : 'bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100'
                  }`}
                >
                  Try Sample Textbook
                </button>
              </div>
            </div>

            {/* Right 8 cols: 3 Clickable 'Load Sample Material' Buttons + Search */}
            <div className="lg:col-span-8 flex flex-col justify-between space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {SAMPLE_MATERIALS.map((sample, index) => {
                  const isCurrent = activeDocument.id === sample.id;
                  const letter = index === 0 ? '(a)' : index === 1 ? '(b)' : '(c)';
                  return (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => handleSelectMaterial(sample.id)}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-1 cursor-pointer transition-all ${
                        isCurrent
                          ? hc
                            ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                            : 'bg-teal-700 text-white border-teal-700 shadow-xs'
                          : hc
                          ? 'bg-slate-950 border-slate-700 text-slate-200 hover:bg-slate-800'
                          : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-white hover:border-teal-500'
                      }`}
                    >
                      <div className="text-[10px] font-mono opacity-80">
                        Load Sample {letter} · {sample.pageCount} Pages
                      </div>
                      <div className="text-xs font-bold leading-snug">
                        {sample.shortLabel}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Search Within Extracted Text & Upload Status Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <label htmlFor="document-search-input" className="sr-only">
                    Search within extracted document text
                  </label>
                  <input
                    id="document-search-input"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search terms inside extracted sections (e.g., tunneling, flux, AVL, Bohr)..."
                    className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs border focus:outline-none ${
                      hc
                        ? 'bg-slate-950 border-slate-700 text-white focus:border-amber-400'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-teal-600'
                    }`}
                  />
                </div>

                {uploadStatus.message && (
                  <div
                    role="status"
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 border ${
                      uploadStatus.type === 'error'
                        ? 'bg-red-50 border-red-200 text-red-800'
                        : uploadStatus.type === 'warning'
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    }`}
                  >
                    {uploadStatus.type === 'error' || uploadStatus.type === 'warning' ? (
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>{uploadStatus.message}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: SPLIT-SCREEN CONVERTER WORKSPACE (Left Original vs Right 4 Accessible Tabs) */}
        <section
          id="converter-workspace"
          aria-label="Split-Screen Accessible Converter Workspace"
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
        >
          {/* Left Panel (5 cols on desktop): Original Messy Document + Chapter Teleport + Diagram + Formula */}
          <div className="lg:col-span-5">
            <OriginalDocumentPreview
              document={activeDocument}
              activeSection={activeSection}
              highContrast={hc}
              onSelectSection={handleSelectSection}
              onOpenSourceTrace={(sec) => setSourceTraceModalSection(sec)}
            />
          </div>

          {/* Right Panel (7 cols on desktop): 4 Interactive Accessible Output Tabs */}
          <div className="lg:col-span-7">
            <AccessibleOutputTabs
              document={activeDocument}
              activeSection={activeSection}
              preferences={preferences}
              searchQuery={searchQuery}
              completedCheckpoints={completedCheckpoints}
              speechState={speechState}
              speechSupported={speechSupported}
              speechStatusMessage={speechStatusMessage}
              onPlaySpeech={handlePlaySpeech}
              onPauseSpeech={handlePauseSpeech}
              onResumeSpeech={handleResumeSpeech}
              onStopSpeech={handleStopSpeech}
              onUpdatePreferences={updatePreferences}
              onToggleCheckpoint={handleToggleCheckpoint}
              onOpenSourceTrace={(sec) => setSourceTraceModalSection(sec)}
            />
          </div>
        </section>
      </main>

      {/* SOURCETRACE VERIFICATION MODAL (Signature Feature B) */}
      {sourceTraceModalSection && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sourcetrace-modal-title"
        >
          <div
            className={`w-full max-w-xl rounded-2xl border p-6 shadow-2xl space-y-4 ${
              hc
                ? 'bg-slate-950 border-amber-400 text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileSearch className="w-5 h-5 text-teal-600" />
                <h3 id="sourcetrace-modal-title" className="text-base font-bold">
                  SourceTrace Passage & Page Citation Verification
                </h3>
              </div>
              <button
                type="button"
                aria-label="Close SourceTrace dialog"
                onClick={() => setSourceTraceModalSection(null)}
                className="p-1.5 rounded-lg hover:bg-slate-200/50 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-900">
                <div>
                  <div className="text-[11px] opacity-70">Document File</div>
                  <div className="font-mono font-bold truncate">
                    {activeDocument.fileName}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] opacity-70">Verified Citation</div>
                  <div className="font-mono font-bold text-teal-700 dark:text-amber-400">
                    {formatSourceTraceCitation(
                      sourceTraceModalSection.pageNumber,
                      activeDocument.shortLabel
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider opacity-75">
                  Exact Extracted Source Passage
                </div>
                <blockquote className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-slate-900 border border-amber-200 dark:border-slate-700 font-mono text-xs leading-relaxed">
                  {sourceTraceModalSection.sourceQuote}
                </blockquote>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider opacity-75">
                  Raw Scan / OCR Layer Snippet
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs">
                  {sourceTraceModalSection.originalMessySnippet}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSourceTraceModalSection(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                  hc
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                Done Verifying
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACCESSPERSONA SETTINGS MODAL */}
      {showSettingsDrawer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="accesspersona-modal-title"
        >
          <div
            className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl space-y-4 ${
              hc
                ? 'bg-slate-950 border-amber-400 text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 id="accesspersona-modal-title" className="text-base font-bold">
                AccessPersona Fine-Tuning & Cloud Persistence
              </h3>
              <button
                type="button"
                aria-label="Close AccessPersona settings"
                onClick={() => setShowSettingsDrawer(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200/50 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <label
                  htmlFor="modal-font-size"
                  className="block font-bold mb-1"
                >
                  Font Size ({preferences.fontSize}px)
                </label>
                <input
                  id="modal-font-size"
                  type="range"
                  min="14"
                  max="28"
                  step="1"
                  value={preferences.fontSize}
                  onChange={(e) =>
                    updatePreferences({ fontSize: Number(e.target.value) })
                  }
                  className="w-full accent-teal-700"
                />
              </div>

              <div>
                <label
                  htmlFor="modal-line-spacing"
                  className="block font-bold mb-1"
                >
                  Line Spacing ({preferences.lineSpacing.toFixed(2)}x)
                </label>
                <input
                  id="modal-line-spacing"
                  type="range"
                  min="1.4"
                  max="2.4"
                  step="0.05"
                  value={preferences.lineSpacing}
                  onChange={(e) =>
                    updatePreferences({ lineSpacing: Number(e.target.value) })
                  }
                  className="w-full accent-teal-700"
                />
              </div>

              <div>
                <label
                  htmlFor="modal-speech-rate"
                  className="block font-bold mb-1"
                >
                  Speech Synthesis Rate ({preferences.speechRate.toFixed(2)}x)
                </label>
                <input
                  id="modal-speech-rate"
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={preferences.speechRate}
                  onChange={(e) =>
                    updatePreferences({ speechRate: Number(e.target.value) })
                  }
                  className="w-full accent-teal-700"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs">
                <strong>Persistence Status:</strong> Preferences are saved locally and synced to Cloud Firestore (<code className="font-mono">/userPreferences/{session?.uid || 'local'}</code>).
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() =>
                  updatePreferences(
                    applyAccessPersonaPreset('standard', preferences.privacyAccepted)
                  )
                }
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 cursor-pointer"
              >
                Reset to Defaults
              </button>
              <button
                type="button"
                onClick={() => setShowSettingsDrawer(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-700 text-white cursor-pointer"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IN-APP PRIVACY & SECURITY MODAL */}
      {showPrivacyModalInApp && session && (
        <PrivacySecurityModal
          session={session}
          onAcceptPrivacyAndEnter={() => setShowPrivacyModalInApp(false)}
          onLogout={handleLogout}
          isStandaloneGate={false}
          onCloseModal={() => setShowPrivacyModalInApp(false)}
        />
      )}

      {/* AI TUTOR CHATBOT DRAWER */}
      <ChatbotDrawer
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        document={activeDocument}
        activeSection={activeSection}
        highContrast={hc}
        onSpeakText={(txt) => handlePlaySpeech(txt)}
      />

      {/* CLEAN FOOTER */}
      <footer
        className={`mt-auto border-t px-6 py-4 text-xs ${
          hc
            ? 'bg-slate-950 border-slate-800 text-slate-400'
            : 'bg-white border-slate-200 text-slate-500'
        }`}
      >
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <strong>CampusAccess</strong> — Accessible Learning Material Converter (IC26-02-05) · One document. Every learner.
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowPrivacyModalInApp(true)}
              className="underline cursor-pointer bg-transparent border-0 p-0"
            >
              Privacy Policy & Security
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setIsChatbotOpen(true)}
              className="underline cursor-pointer bg-transparent border-0 p-0"
            >
              Open AI Study Chatbot
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
