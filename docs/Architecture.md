# CampusAccess – System Architecture

## Overview
CampusAccess converts one learning document into multiple personalized accessible formats for students with dyslexia, low vision, ADHD and other learning differences.

## Flow
1. **Upload / Sample Selection** – User drags a PDF/TXT/TMD file or loads a bundled sample textbook.
2. **Parsing & Extraction** – Text is split into chapters/sections (`parseTextIntoSections`). Scanned/low-text PDFs fall back to a bundled verified sample (honest fallback, no fabricated content).
3. **AccessPersona Personalization** – Presets (Standard, Low Vision, Focus Reading, Audio First) set contrast, font size, line spacing, bionic reading, reading ruler and speech rate.
4. **Accessible Output Tabs** – Smart Reader (bionic text), Vision & Math Braille (.BRF export), ADHD Flashcards, Multilingual Simplifier (Telugu/Hindi).
5. **SourceTrace Verification** – Every section shows its exact extracted source quote + page citation so nothing is hallucinated.
6. **Read Aloud** – Web Speech API TTS with adjustable speed.

## Components
- `server.ts` – Express + Vite middleware; REST APIs for documents, summarize/explain/chat (Gemini with graceful bundled fallbacks), preferences, progress.
- `src/App.tsx` – Auth gate (Cutora login → privacy gate → workspace), toolbar, split-screen workspace.
- `src/components/` – Login hero, document preview, accessible output tabs, SourceTrace modal, chatbot drawer.
- `src/utils/accessibilityLogic.ts` – Personas, bionic tokenizer, Braille (.BRF) generator, section parser, payload validation.
- `src/firebase.ts` – Firebase Auth (Google) + Firestore sync for preferences and reading progress.
- `src/data/sampleMaterials.ts` – Bundled multi-chapter sample textbooks.

## Persistence
- Local: localStorage (prefs, progress, session)
- Express in-memory store (fallback)
- Firestore cloud sync (authenticated + email-verified users only)
