import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquareText,
  X,
  Send,
  Volume2,
  Sparkles,
  Bot,
  User as UserIcon,
} from 'lucide-react';
import {
  DocumentSection,
  LearningMaterialDocument,
} from '../data/sampleMaterials';
import { apiUrl } from '../api';

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  timestamp: string;
}

interface ChatbotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  document: LearningMaterialDocument;
  activeSection: DocumentSection;
  highContrast: boolean;
  onSpeakText: (text: string) => void;
}

export const ChatbotDrawer: React.FC<ChatbotDrawerProps> = ({
  isOpen,
  onClose,
  document,
  activeSection,
  highContrast,
  onSpeakText,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      text: `Hello! I am your CampusAccess AI Study & Accessibility Tutor. I have loaded "${document.shortLabel}" (currently on Section ${activeSection.sectionCode}: ${activeSection.title}). Ask me any question about formulas, diagrams, exam prep, Telugu/Hindi translations, or any general academic topic!`,
      timestamp: 'Active Context',
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === 'welcome-msg'
          ? {
              ...msg,
              text: `Hello! I am your CampusAccess AI Study & Accessibility Tutor. I have loaded "${document.shortLabel}" (currently on Section ${activeSection.sectionCode}: ${activeSection.title}). Ask me any question about formulas, diagrams, exam prep, Telugu/Hindi translations, or any general academic topic!`,
            }
          : msg
      )
    );
  }, [document.shortLabel, activeSection.sectionCode, activeSection.title]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const buildAccurateLocalAnswer = (question: string): string => {
    const q = question.toLowerCase();
    if (q.includes('formula') || q.includes('equation') || q.includes('math') || q.includes('calculate')) {
      return `For Section ${activeSection.sectionCode} (${activeSection.title}), the core formula is:\n\n${activeSection.formula.raw}\n\nPlain-Language Meaning:\n"${activeSection.formula.spokenPlainLanguage}"\n\nKey Step-by-Step Breakdown:\n${activeSection.formula.stepByStepDerivation.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
    }
    if (q.includes('diagram') || q.includes('figure') || q.includes('graph') || q.includes('visual')) {
      return `Here is the spatial breakdown of "${activeSection.diagram.title}":\n\nOverview: ${activeSection.diagram.spatialSummary}\n\nStep-by-Step Walkthrough:\n${activeSection.diagram.naturalLanguageSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
    }
    if (q.includes('telugu') || q.includes('తెలుగు')) {
      const te = activeSection.multilingual.te;
      return `${te.heading}\n\nవివరణ (Explanation):\n${te.explanation}\n\nఉదాహరణ (Analogy):\n${te.analogy}`;
    }
    if (q.includes('hindi') || q.includes('हिन्दी') || q.includes('हिंदी')) {
      const hi = activeSection.multilingual.hi;
      return `${hi.heading}\n\nस्पष्टीकरण (Explanation):\n${hi.explanation}\n\nउदाहरण (Analogy):\n${hi.analogy}`;
    }
    if (q.includes('quiz') || q.includes('question') || q.includes('test') || q.includes('exam')) {
      return `Here are practice questions for Section ${activeSection.sectionCode} (${activeSection.title}):\n\n${activeSection.explainSamples.practiceQuestions
        .map((pq, i) => `Q${i + 1}: ${pq.question}\nAnswer: ${pq.answer}`)
        .join('\n\n')}`;
    }
    if (q.includes('simple') || q.includes('easy') || q.includes('explain') || q.includes('summary') || q.includes('what is')) {
      return `Simple Explanation of ${activeSection.title} (Section ${activeSection.sectionCode}):\n\n${activeSection.explainSamples.simplify}\n\nKey Summary Points:\n${activeSection.explainSamples.summarize.map((s) => `• ${s}`).join('\n')}\n\nCore Takeaway: ${activeSection.keyTakeaway}`;
    }
    return `Regarding "${question}" in the context of ${document.shortLabel} (Section ${activeSection.sectionCode}: ${activeSection.title}):\n\n1. Core Principle: ${activeSection.keyTakeaway}\n2. Simple Analogy: ${activeSection.explainSamples.simplify}\n3. Formula Reference: ${activeSection.formula.raw} (${activeSection.formula.spokenPlainLanguage})\n4. SourceTrace Citation: PDF Page ${activeSection.pageNumber ?? 'N/A'}.`;
  };

  const handleSendQuestion = async (customPrompt?: string) => {
    const textToSend = (customPrompt ?? input).trim();
    if (!textToSend || isSending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setIsSending(true);

    let replyText = '';
    try {
      const response = await fetch(apiUrl('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          context: {
            documentTitle: document.title,
            sectionCode: activeSection.sectionCode,
            sectionTitle: activeSection.title,
            pageNumber: activeSection.pageNumber,
            paragraphs: activeSection.accessibleParagraphs,
            formula: activeSection.formula,
            diagram: activeSection.diagram,
            keyTakeaway: activeSection.keyTakeaway,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.reply) {
          replyText = data.reply;
        }
      }
    } catch {
      // Fallback handled below
    }

    if (!replyText) {
      replyText = buildAccurateLocalAnswer(textToSend);
    }

    const botMsg: ChatMessage = {
      id: `bot-${Date.now()}`,
      role: 'assistant',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, botMsg]);
    setIsSending(false);
  };

  if (!isOpen) return null;

  const quickPrompts = [
    `Explain Section ${activeSection.sectionCode} in simple everyday words`,
    `Break down the math formula ${activeSection.formula.raw.split(' ')[0]} step-by-step`,
    `Describe the diagram for a blind student`,
    `Give me a practice quiz question on this section`,
    `Explain this concept in Telugu and Hindi`,
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="campusaccess-chatbot-title"
    >
      <div
        className={`w-full max-w-lg h-full flex flex-col border-l shadow-2xl ${
          highContrast
            ? 'bg-slate-950 border-amber-400 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between gap-3 ${
            highContrast
              ? 'bg-slate-900 border-amber-400/60'
              : 'bg-slate-900 text-white border-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 id="campusaccess-chatbot-title" className="text-sm font-bold">
                CampusAccess AI Study & Accessibility Tutor
              </h2>
              <p className="text-[11px] text-slate-300">
                Active Context: Sec {activeSection.sectionCode} · {activeSection.title}
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close AI Tutor Chatbot"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Prompts Strip */}
        <div
          className={`px-4 py-2.5 border-b flex items-center gap-1.5 overflow-x-auto ${
            highContrast ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendQuestion(qp)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap cursor-pointer border ${
                highContrast
                  ? 'bg-slate-950 border-amber-400/60 text-amber-300 hover:bg-slate-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-teal-500'
              }`}
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${
                m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  m.role === 'user'
                    ? 'bg-violet-700 text-white'
                    : highContrast
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-teal-700 text-white'
                }`}
              >
                {m.role === 'user' ? (
                  <UserIcon className="w-4 h-4" />
                ) : (
                  <MessageSquareText className="w-4 h-4" />
                )}
              </div>

              <div
                className={`max-w-[84%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed border ${
                  m.role === 'user'
                    ? highContrast
                      ? 'bg-violet-950 border-violet-400 text-white'
                      : 'bg-slate-900 text-white border-slate-900'
                    : highContrast
                    ? 'bg-slate-900 border-slate-700 text-slate-100'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
                <div className="mt-2 pt-1.5 border-t border-slate-200/40 flex items-center justify-between gap-3 text-[10px] opacity-75">
                  <span>{m.timestamp}</span>
                  {m.role === 'assistant' && (
                    <button
                      type="button"
                      onClick={() => onSpeakText(m.text)}
                      className="inline-flex items-center gap-1 font-semibold underline cursor-pointer bg-transparent border-0 p-0"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Read Aloud</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isSending && (
            <div className="text-xs font-medium text-slate-500 px-2">
              CampusAccess AI Tutor is analyzing your question...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuestion();
          }}
          className={`p-3.5 border-t flex items-center gap-2 ${
            highContrast ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <label htmlFor="chatbot-query-input" className="sr-only">
            Ask a question to CampusAccess AI Tutor
          </label>
          <input
            id="chatbot-query-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask any question about formulas, chapters, or concepts..."
            className={`flex-1 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border focus:outline-none ${
              highContrast
                ? 'bg-slate-950 border-slate-700 text-white focus:border-amber-400'
                : 'bg-white border-slate-300 text-slate-900 focus:border-teal-600'
            }`}
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            aria-label="Send question"
            className={`px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40 ${
              highContrast
                ? 'bg-amber-400 text-slate-950'
                : 'bg-teal-700 text-white hover:bg-teal-800'
            }`}
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
