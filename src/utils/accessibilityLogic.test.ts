import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyAccessPersonaPreset,
  tokenizeBionicText,
  convertToUnicodeBraille,
  generateBrfDocument,
  parseTextIntoSections,
  formatSourceTraceCitation,
  validateUserPreferencePayload,
  DEFAULT_PREFERENCES,
} from './accessibilityLogic';

test('applyAccessPersonaPreset returns distinct accessible settings per preset', () => {
  const lowVision = applyAccessPersonaPreset('low-vision', true);
  assert.equal(lowVision.highContrast, true);
  assert.equal(lowVision.fontSize, 22);
  assert.equal(lowVision.readingRuler, true);

  const focusReading = applyAccessPersonaPreset('focus-reading', true);
  assert.equal(focusReading.bionicReading, true);
  assert.equal(focusReading.dyslexiaFont, true);
  assert.equal(focusReading.preferredLanguage, 'simple-en');

  const audioFirst = applyAccessPersonaPreset('audio-first', true);
  assert.equal(audioFirst.speechRate, 1.15);
  assert.equal(audioFirst.highContrast, true);

  const resetStandard = applyAccessPersonaPreset('standard', true);
  assert.equal(resetStandard.fontSize, DEFAULT_PREFERENCES.fontSize);
  assert.equal(resetStandard.highContrast, false);
});

test('tokenizeBionicText splits words into bold prefix and regular suffix', () => {
  const tokens = tokenizeBionicText('Quantum tunneling');
  assert.equal(tokens.length, 2);
  assert.equal(tokens[0].prefix, 'Quan');
  assert.equal(tokens[0].suffix, 'tum');
  assert.equal(tokens[0].whitespace, ' ');
  assert.equal(tokens[1].prefix, 'tunne');
  assert.equal(tokens[1].suffix, 'ling');
});

test('generateBrfDocument and convertToUnicodeBraille produce valid Braille output', () => {
  const unicode = convertToUnicodeBraille('abc 123');
  assert.ok(unicode.includes('⠁⠃⠉'));

  const brf = generateBrfDocument({
    documentTitle: 'Physics 101',
    sectionTitle: 'Section 3.2 Wave Equation',
    formulaRaw: 'E = h * f',
    formulaExplanation: 'Energy equals Planck constant times frequency',
    diagramTitle: 'Potential Barrier',
    diagramSteps: ['Incident wave approaches barrier', 'Exponential decay inside barrier'],
  });

  assert.ok(brf.includes('CAMPUSACCESS BRAILLE READY FORMAT (.BRF) EXPORT'));
  assert.ok(brf.includes('SECTION 3.2 WAVE EQUATION'));
  assert.ok(brf.includes('STEP 1: INCIDENT WAVE APPROACHES BARRIER'));
});

test('parseTextIntoSections warns on scanned/empty text and extracts structured headings on valid text', () => {
  const emptyResult = parseTextIntoSections('short', 'scanned_page.pdf');
  assert.equal(emptyResult.sections.length, 0);
  assert.equal(emptyResult.warnings.length, 1);

  const validText = [
    'Page 4',
    'Chapter 3: Quantum Mechanics',
    'Particles exhibit wave-particle duality across atomic scales and barrier potentials.',
    'Page 12',
    '3.2 Tunneling Across Potential Barriers',
    'When a matter wave encounters a finite potential energy barrier, part of the wave function penetrates.',
  ].join('\n');

  const parsed = parseTextIntoSections(validText, 'textbook.pdf');
  assert.equal(parsed.warnings.length, 0);
  assert.equal(parsed.sections.length, 2);
  assert.equal(parsed.sections[1].sectionCode, '3.2');
  assert.equal(parsed.sections[1].pageNumber, 12);
});

test('formatSourceTraceCitation never fabricates missing page numbers', () => {
  assert.equal(formatSourceTraceCitation(18, 'Applied Physics'), 'Applied Physics · PDF Page 18');
  assert.equal(formatSourceTraceCitation(null, 'Applied Physics'), 'Reference unavailable');
  assert.equal(formatSourceTraceCitation(undefined, 'Applied Physics'), 'Reference unavailable');
});

test('validateUserPreferencePayload blocks Dirty Dozen invalid payloads', () => {
  const valid = validateUserPreferencePayload('user_123', DEFAULT_PREFERENCES);
  assert.equal(valid.valid, true);

  const badId = validateUserPreferencePayload('bad$id!@#', DEFAULT_PREFERENCES);
  assert.equal(badId.valid, false);

  const poisonedFontSize = validateUserPreferencePayload('user_123', {
    ...DEFAULT_PREFERENCES,
    fontSize: 999,
  });
  assert.equal(poisonedFontSize.valid, false);
});
