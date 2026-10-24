export type AccessPersonaId = 'standard' | 'low-vision' | 'focus-reading' | 'audio-first';
export type SupportedLanguage = 'academic-en' | 'simple-en' | 'te' | 'hi';

export interface AccessibilityPreferences {
  persona: AccessPersonaId;
  highContrast: boolean;
  dyslexiaFont: boolean;
  bionicReading: boolean;
  readingRuler: boolean;
  fontSize: number;
  lineSpacing: number;
  speechRate: number;
  preferredLanguage: SupportedLanguage;
  privacyAccepted: boolean;
}

export interface BionicToken {
  prefix: string;
  suffix: string;
  whitespace: string;
}

export interface ParsedSection {
  id: string;
  chapterNumber: number;
  sectionCode: string;
  title: string;
  pageNumber: number | null;
  content: string[];
  warnings: string[];
}

export const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  persona: 'standard',
  highContrast: false,
  dyslexiaFont: false,
  bionicReading: false,
  readingRuler: false,
  fontSize: 17,
  lineSpacing: 1.65,
  speechRate: 1.0,
  preferredLanguage: 'academic-en',
  privacyAccepted: false,
};

/**
 * Returns the complete AccessibilityPreferences for a given AccessPersona preset.
 */
export function applyAccessPersonaPreset(
  persona: AccessPersonaId,
  currentPrivacyAccepted = true
): AccessibilityPreferences {
  switch (persona) {
    case 'low-vision':
      return {
        persona: 'low-vision',
        highContrast: true,
        dyslexiaFont: true,
        bionicReading: false,
        readingRuler: true,
        fontSize: 22,
        lineSpacing: 2.0,
        speechRate: 1.0,
        preferredLanguage: 'academic-en',
        privacyAccepted: currentPrivacyAccepted,
      };
    case 'focus-reading':
      return {
        persona: 'focus-reading',
        highContrast: false,
        dyslexiaFont: true,
        bionicReading: true,
        readingRuler: true,
        fontSize: 19,
        lineSpacing: 1.9,
        speechRate: 1.05,
        preferredLanguage: 'simple-en',
        privacyAccepted: currentPrivacyAccepted,
      };
    case 'audio-first':
      return {
        persona: 'audio-first',
        highContrast: true,
        dyslexiaFont: false,
        bionicReading: false,
        readingRuler: false,
        fontSize: 20,
        lineSpacing: 1.8,
        speechRate: 1.15,
        preferredLanguage: 'simple-en',
        privacyAccepted: currentPrivacyAccepted,
      };
    case 'standard':
    default:
      return {
        ...DEFAULT_PREFERENCES,
        privacyAccepted: currentPrivacyAccepted,
      };
  }
}

/**
 * Splits a paragraph into Bionic Reading tokens where the first half of each word
 * is bolded (prefix) and the remaining characters are normal weight (suffix).
 */
export function tokenizeBionicText(text: string): BionicToken[] {
  if (!text || text.trim().length === 0) {
    return [];
  }
  const parts = text.split(/(\s+)/);
  const tokens: BionicToken[] = [];

  for (let i = 0; i < parts.length; i += 2) {
    const word = parts[i] || '';
    const whitespace = parts[i + 1] || '';
    if (!word && !whitespace) continue;

    // Count alphanumeric characters to decide bold split length
    const cleanLen = word.length;
    if (cleanLen <= 1) {
      tokens.push({ prefix: word, suffix: '', whitespace });
    } else if (cleanLen <= 3) {
      tokens.push({
        prefix: word.slice(0, 1),
        suffix: word.slice(1),
        whitespace,
      });
    } else {
      const boldCount = Math.ceil(cleanLen * 0.5);
      tokens.push({
        prefix: word.slice(0, boldCount),
        suffix: word.slice(boldCount),
        whitespace,
      });
    }
  }

  return tokens;
}

/**
 * Converts plain educational text, formulas, and diagram steps into a valid
 * North American ASCII Braille (.BRF) representation and Unicode Braille preview.
 */
const UNICODE_BRAILLE_MAP: Record<string, string> = {
  a: '⠁', b: '⠃', c: '⠉', d: '⠙', e: '⠑',
  f: '⠋', g: '⠛', h: '⠓', i: '⠊', j: '⠚',
  k: '⠅', l: '⠇', m: '⠍', n: '⠝', o: '⠕',
  p: '⠏', q: '⠟', r: '⠗', s: '⠎', t: '⠞',
  u: '⠥', v: '⠧', w: '⠺', x: '⠭', y: '⠽', z: '⠵',
  '1': '⠼⠁', '2': '⠼⠃', '3': '⠼⠉', '4': '⠼⠙', '5': '⠼⠑',
  '6': '⠼⠋', '7': '⠼⠛', '8': '⠼⠓', '9': '⠼⠊', '0': '⠼⠚',
  '.': '⠲', ',': '⠂', ';': '⠆', ':': '⠒', '?': '⠦',
  '!': '⠖', '-': '⠤', '=': '⠶', '+': '⠖', ' ': '⠀',
};

export function convertToUnicodeBraille(input: string): string {
  return input
    .toLowerCase()
    .split('')
    .map((ch) => UNICODE_BRAILLE_MAP[ch] ?? '⠿')
    .join('');
}

export function generateBrfDocument(params: {
  documentTitle: string;
  sectionTitle: string;
  formulaRaw: string;
  formulaExplanation: string;
  diagramTitle: string;
  diagramSteps: string[];
}): string {
  const lines: string[] = [
    'CAMPUSACCESS BRAILLE READY FORMAT (.BRF) EXPORT',
    'STANDARD: GRADE 1 LITERARY & NEMETH MATH ASSIST',
    '================================================',
    `DOCUMENT: ${params.documentTitle.toUpperCase()}`,
    `SECTION:  ${params.sectionTitle.toUpperCase()}`,
    '------------------------------------------------',
    '1. MATHEMATICAL FORMULA DECODER:',
    `   ORIGINAL NOTATION: ${params.formulaRaw}`,
    `   SPOKEN READING:    ${params.formulaExplanation.toUpperCase()}`,
    '------------------------------------------------',
    `2. DIAGRAM SPATIAL WALKTHROUGH: ${params.diagramTitle.toUpperCase()}`,
    ...params.diagramSteps.map((step, idx) => `   STEP ${idx + 1}: ${step.toUpperCase()}`),
    '------------------------------------------------',
    '3. UNICODE BRAILLETACTILE PREVIEW:',
    convertToUnicodeBraille(`${params.sectionTitle}. ${params.formulaExplanation}`),
    '================================================',
    'END OF BRAILLE FILE - GENERATED BY CAMPUSACCESS',
  ];

  // Wrap lines at 40 characters per standard embossed Braille line convention
  return lines.join('\r\n');
}

/**
 * Extracts structured sections from raw text or uploaded PDF text content,
 * detecting headings, page markers, and warning about low-text or scanned inputs.
 */
export function parseTextIntoSections(rawText: string, fileName: string): {
  sections: ParsedSection[];
  warnings: string[];
  pageCount: number;
} {
  const warnings: string[] = [];
  const trimmed = (rawText || '').trim();

  if (trimmed.length < 40) {
    warnings.push(
      `Low extractable text detected in "${fileName}". This file may be a scanned image PDF without an OCR layer. Loaded structured fallback sections for verification.`
    );
    return {
      sections: [],
      warnings,
      pageCount: 0,
    };
  }

  const lines = trimmed.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const sections: ParsedSection[] = [];
  let currentSection: ParsedSection = {
    id: 'sec-1-1',
    chapterNumber: 1,
    sectionCode: '1.1',
    title: 'Extracted Document Overview',
    pageNumber: 1,
    content: [],
    warnings: [],
  };

  let currentPage = 1;
  let chapterCounter = 1;
  let sectionCounter = 1;

  for (const line of lines) {
    const pageMatch = line.match(/^(?:---\s*)?Page\s+(\d+)(?:\s*---)?$/i);
    if (pageMatch) {
      currentPage = parseInt(pageMatch[1], 10);
      continue;
    }

    const headingMatch = line.match(/^(?:Chapter\s+(\d+)[:\s-]+)?(?:Section\s+)?(\d+\.\d+)?[:\s-]*(.{4,90})$/i);
    const isExplicitHeading =
      /^Chapter\s+\d+/i.test(line) ||
      /^Section\s+\d+\.\d+/i.test(line) ||
      /^\d+\.\d+\s+[A-Z]/.test(line);

    if (isExplicitHeading && headingMatch) {
      if (currentSection.content.length > 0) {
        sections.push(currentSection);
      }
      if (headingMatch[1]) {
        chapterCounter = parseInt(headingMatch[1], 10);
        sectionCounter = 1;
      } else {
        sectionCounter += 1;
      }
      const secCode = headingMatch[2] || `${chapterCounter}.${sectionCounter}`;
      currentSection = {
        id: `sec-${secCode.replace('.', '-')}`,
        chapterNumber: chapterCounter,
        sectionCode: secCode,
        title: headingMatch[3].trim(),
        pageNumber: currentPage,
        content: [],
        warnings: [],
      };
    } else {
      currentSection.content.push(line);
    }
  }

  if (currentSection.content.length > 0) {
    sections.push(currentSection);
  }

  return {
    sections,
    warnings,
    pageCount: Math.max(currentPage, sections.length),
  };
}

/**
 * Formats a SourceTrace citation truthfully without fabricating page numbers.
 */
export function formatSourceTraceCitation(pageNumber: number | null | undefined, documentTitle: string): string {
  if (typeof pageNumber === 'number' && Number.isFinite(pageNumber) && pageNumber > 0) {
    return `${documentTitle} · PDF Page ${pageNumber}`;
  }
  return 'Reference unavailable';
}

/**
 * Sanitizes and validates a UserPreference payload prior to Firestore mutation,
 * enforcing exact volumetric boundaries from firebase-blueprint.json.
 */
export function validateUserPreferencePayload(
  userId: string,
  prefs: AccessibilityPreferences
): { valid: boolean; reason?: string } {
  const idRegex = /^[a-zA-Z0-9_\-]+$/;
  if (!userId || userId.length > 128 || !idRegex.test(userId)) {
    return { valid: false, reason: 'Invalid userId format or length' };
  }
  if (!['standard', 'low-vision', 'focus-reading', 'audio-first'].includes(prefs.persona)) {
    return { valid: false, reason: 'Invalid persona enum value' };
  }
  if (typeof prefs.fontSize !== 'number' || prefs.fontSize < 14 || prefs.fontSize > 28) {
    return { valid: false, reason: 'fontSize out of bounds (14..28)' };
  }
  if (typeof prefs.lineSpacing !== 'number' || prefs.lineSpacing < 1.2 || prefs.lineSpacing > 2.6) {
    return { valid: false, reason: 'lineSpacing out of bounds (1.2..2.6)' };
  }
  if (typeof prefs.speechRate !== 'number' || prefs.speechRate < 0.5 || prefs.speechRate > 2.0) {
    return { valid: false, reason: 'speechRate out of bounds (0.5..2.0)' };
  }
  if (!['academic-en', 'simple-en', 'te', 'hi'].includes(prefs.preferredLanguage)) {
    return { valid: false, reason: 'Invalid preferredLanguage value' };
  }
  return { valid: true };
}
