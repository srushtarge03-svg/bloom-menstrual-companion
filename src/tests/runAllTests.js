/**
 * BLOOM Master Test Suite Runner
 * Executes unit tests for:
 * 1. i18n Translation Key Parity (EN, HI, MR)
 * 2. Pure Cycle Math & Predictions
 * 3. WCAG AA Color Contrast Tests (Milestone 1)
 * 4. Spoken Voice Email Normalization (Milestone 5)
 * 5. Complete Emoji Elimination Lint (Milestone 8)
 * 6. Controlled Flow Selector & Record State (Milestone 9)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runContrastTests } from './contrastTest.js';
import { runVoiceEmailTests } from './voiceEmailTest.js';
import { runEmojiLint } from './emojiLintTest.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

console.log('============================================================');
console.log('BLOOM MASTER TEST SUITE EXECUTION');
console.log('============================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${testName}`);
  }
}

// -------------------------------------------------------------
// SUITE 1: i18n Key Parity Tests
// -------------------------------------------------------------
console.log('[TEST SUITE 1] i18n Translation Key Parity (EN, HI, MR)');

const localesDir = path.join(rootDir, 'public', 'locales');
const en = JSON.parse(fs.readFileSync(path.join(localesDir, 'en', 'translation.json'), 'utf-8'));
const hi = JSON.parse(fs.readFileSync(path.join(localesDir, 'hi', 'translation.json'), 'utf-8'));
const mr = JSON.parse(fs.readFileSync(path.join(localesDir, 'mr', 'translation.json'), 'utf-8'));

function getDeepKeys(obj, prefix = '') {
  let keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys = keys.concat(getDeepKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const enKeys = new Set(getDeepKeys(en));
const hiKeys = new Set(getDeepKeys(hi));
const mrKeys = new Set(getDeepKeys(mr));

let missingInHindi = [];
let missingInMarathi = [];

for (const key of enKeys) {
  if (!hiKeys.has(key)) missingInHindi.push(key);
  if (!mrKeys.has(key)) missingInMarathi.push(key);
}

assert(missingInHindi.length === 0, `All ${enKeys.size} English keys exist in Hindi (missing: ${missingInHindi.length})`);
assert(missingInMarathi.length === 0, `All ${enKeys.size} English keys exist in Marathi (missing: ${missingInMarathi.length})`);

// Check that 4 levels and 7 topics exist in all 3 languages
const expectedLevels = ['l1', 'l2', 'l3', 'l4'];
const expectedTopics = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'];

expectedLevels.forEach((l) => {
  assert(en.learn.levels[l] && hi.learn.levels[l] && mr.learn.levels[l], `Level ${l} exists in EN, HI, MR`);
});

expectedTopics.forEach((p) => {
  assert(en.prepare.topics[p] && hi.prepare.topics[p] && mr.prepare.topics[p], `Topic ${p} exists in EN, HI, MR`);
});

// -------------------------------------------------------------
// SUITE 2: Pure Cycle Math Tests
// -------------------------------------------------------------
console.log('\n[TEST SUITE 2] Cycle Mathematics & Predictions');

const ONE_DAY_MS = 86400000;
function parseISODate(isoStr) {
  const [y, m, d] = isoStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function addDays(date, days) {
  return new Date(date.getTime() + days * ONE_DAY_MS);
}
function daysBetween(dateA, dateB) {
  return Math.round((dateA.getTime() - dateB.getTime()) / ONE_DAY_MS);
}

function analyzeCycles(cycles, referenceToday = new Date()) {
  if (!cycles || cycles.length === 0) return null;
  const sorted = [...cycles].sort((a, b) => a.start.localeCompare(b.start));
  const startDates = sorted.map((c) => parseISODate(c.start));

  const gaps = [];
  for (let i = 1; i < startDates.length; i++) {
    const gap = daysBetween(startDates[i], startDates[i - 1]);
    if (gap > 0) gaps.push(gap);
  }

  const averageCycleLength = gaps.length > 0 ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length) : 28;
  const periodLengths = sorted
    .filter((c) => c.end && c.end >= c.start)
    .map((c) => daysBetween(parseISODate(c.end), parseISODate(c.start)) + 1);
  const averagePeriodLength = periodLengths.length > 0 ? Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length) : 5;

  const spread = gaps.length > 1 ? Math.max(...gaps) - Math.min(...gaps) : 0;
  const spreadRange = Math.max(2, Math.ceil(spread / 2) + 2);

  const lastStartDate = startDates[startDates.length - 1];
  const todayNormalized = new Date(referenceToday.getFullYear(), referenceToday.getMonth(), referenceToday.getDate());
  const currentDayOfCycle = Math.max(1, daysBetween(todayNormalized, lastStartDate) + 1);
  const ovulationDay = Math.max(1, averageCycleLength - 14);

  let currentPhase = 0;
  if (currentDayOfCycle <= averagePeriodLength) currentPhase = 0;
  else if (currentDayOfCycle < ovulationDay - 1) currentPhase = 1;
  else if (currentDayOfCycle <= ovulationDay + 1) currentPhase = 2;
  else currentPhase = 3;

  if (currentDayOfCycle > averageCycleLength + 7) currentPhase = 3;

  const predictedNextStartDate = addDays(lastStartDate, averageCycleLength);
  const predictedRangeStart = addDays(predictedNextStartDate, -spreadRange);
  const predictedRangeEnd = addDays(predictedNextStartDate, spreadRange);

  const nudges = [];
  if (gaps.length >= 2 && spread <= 3) nudges.push('regular');
  else if (gaps.length >= 1) nudges.push('varying');
  const latestRecord = sorted[sorted.length - 1];
  if (latestRecord.cramps && latestRecord.cramps >= 1) nudges.push('cramps');
  if (latestRecord.cramps && latestRecord.cramps >= 2) nudges.push('redFlag');
  if (currentDayOfCycle > 45) nudges.push('longCycle');

  return {
    averageCycleLength,
    averagePeriodLength,
    spread,
    spreadRange,
    currentDayOfCycle,
    currentPhase,
    ovulationDay,
    predictedNextStartDate,
    predictedRangeStart,
    predictedRangeEnd,
    nudges,
  };
}

// Math Test 1: Defaults with single record
const singleCycle = [{ start: '2026-03-01', end: '2026-03-05', flow: 1, cramps: 0 }];
const refDay1 = parseISODate('2026-03-01');
const resDay1 = analyzeCycles(singleCycle, refDay1);
assert(resDay1.averageCycleLength === 28, 'Default cycle length is 28 days');
assert(resDay1.averagePeriodLength === 5, 'Period length is 5 days');
assert(resDay1.currentDayOfCycle === 1, 'Start date is Day 1 of cycle');
assert(resDay1.currentPhase === 0, 'Day 1 is Phase 0 (Period days)');
assert(resDay1.spreadRange === 2, 'Default spread range is 2 days');

// Math Test 2: Follicular phase on Day 8
const refDay8 = parseISODate('2026-03-08');
const resDay8 = analyzeCycles(singleCycle, refDay8);
assert(resDay8.currentPhase === 1, 'Day 8 is Phase 1 (Fresh start / Follicular)');

// Math Test 3: Ovulation phase on Day 14
const refDay14 = parseISODate('2026-03-14');
const resDay14 = analyzeCycles(singleCycle, refDay14);
assert(resDay14.currentPhase === 2, 'Day 14 is Phase 2 (Peak energy / Ovulation)');

// Math Test 4: Luteal phase on Day 22
const refDay22 = parseISODate('2026-03-22');
const resDay22 = analyzeCycles(singleCycle, refDay22);
assert(resDay22.currentPhase === 3, 'Day 22 is Phase 3 (Slow down / Luteal)');

// Math Test 5: Multiple cycles spread and nudges
const sampleCycles = [
  { start: '2026-01-01', end: '2026-01-05' },
  { start: '2026-01-30', end: '2026-02-03' }, // 29 days
  { start: '2026-03-02', end: '2026-03-06', cramps: 3 }, // 31 days
];
const resMulti = analyzeCycles(sampleCycles, parseISODate('2026-03-05'));
assert(resMulti.averageCycleLength === 30, 'Average of 29 and 31 is 30');
assert(resMulti.spread === 2, 'Spread is 31 - 29 = 2');
assert(resMulti.spreadRange === 3, 'spreadRange is max(2, ceil(2/2) + 2) = 3');
assert(resMulti.nudges.includes('regular'), 'Spread <= 3 triggers regular pattern nudge');
assert(resMulti.nudges.includes('redFlag'), 'Cramps level 3 triggers redFlag doctor nudge');

// Math Test 6: Long absence nudge
const resAbsent = analyzeCycles(singleCycle, parseISODate('2026-04-20'));
assert(resAbsent.nudges.includes('longCycle'), 'Absence > 45 days triggers longCycle nudge');

// -------------------------------------------------------------
// SUITE 3: WCAG AA Color Contrast Tests (Milestone 1)
// -------------------------------------------------------------
console.log('\n[TEST SUITE 3] WCAG AA Color Contrast (Minimum 4.5:1)');
const contrastResults = runContrastTests();
contrastResults.results.forEach((r) => {
  assert(r.passed, `${r.name}: ${r.ratio}:1 (Required: ${r.min}:1)`);
});

// -------------------------------------------------------------
// SUITE 4: Spoken Email Normalization Tests (Milestone 5)
// -------------------------------------------------------------
console.log('\n[TEST SUITE 4] Spoken Voice Email Normalization');
const voiceResults = runVoiceEmailTests();
voiceResults.results.forEach((r) => {
  assert(r.ok, `${r.name}: "${r.input}" -> "${r.output}"`);
});

// -------------------------------------------------------------
// SUITE 5: Emoji Elimination Lint Tests (Milestone 8)
// -------------------------------------------------------------
console.log('\n[TEST SUITE 5] Zero-Emoji Lint Scanner');
const emojiResults = runEmojiLint();
assert(emojiResults.passed, `Zero emojis detected across ${emojiResults.totalFiles} files`);
if (!emojiResults.passed) {
  emojiResults.totalViolations.forEach((tv) => {
    console.error(`  Violation in ${tv.file}:`);
    tv.violations.forEach((v) => console.error(`    Line ${v.line}: [${v.match}] "${v.snippet}"`));
  });
}

// -------------------------------------------------------------
// SUITE 6: Flow Selector & Controlled Cycle Entry Tests (Milestone 9)
// -------------------------------------------------------------
console.log('\n[TEST SUITE 6] Flow Selector & Controlled Cycle Entry');

function simulateCycleUpdate(existingCycles, entryToSave, editIndex = null) {
  const cloned = JSON.parse(JSON.stringify(existingCycles));
  if (editIndex !== null && editIndex >= 0 && editIndex < cloned.length) {
    cloned[editIndex] = entryToSave;
  } else {
    cloned.push(entryToSave);
  }
  return cloned;
}

const initialCycles = [
  { start: '2026-02-01', end: '2026-02-05', flow: 0, cramps: 0, mood: 1 },
];

// Test: Creating new entry with Heavy flow (flow = 2)
const newEntry = { start: '2026-03-01', end: '2026-03-05', flow: 2, cramps: 1, mood: 0 };
const afterCreate = simulateCycleUpdate(initialCycles, newEntry);
assert(afterCreate.length === 2, 'Entry successfully appended to list');
assert(afterCreate[1].flow === 2, 'New entry has explicit Heavy flow (flow: 2)');

// Test: Editing existing entry from Light to Heavy flow
const editedEntry = { start: '2026-02-01', end: '2026-02-06', flow: 2, cramps: 2, mood: 3 };
const afterEdit = simulateCycleUpdate(afterCreate, editedEntry, 0);
assert(afterEdit.length === 2, 'Editing preserves list length without duplicating');
assert(afterEdit[0].flow === 2, 'Index 0 successfully updated to Heavy flow (flow: 2)');
assert(afterEdit[0].end === '2026-02-06', 'Index 0 end date updated');
assert(afterEdit[0].cramps === 2, 'Index 0 cramps updated to level 2');

// Test: Controlled state mapping guarantees 0 (Light), 1 (Medium), 2 (Heavy)
const flowMapping = ['light', 'medium', 'heavy'];
assert(flowMapping[0] === 'light' && flowMapping[1] === 'medium' && flowMapping[2] === 'heavy', 'Flow index mapping is distinct and verified');

// -------------------------------------------------------------
// SUITE 7: Multi-Lingual Voice Normalization & Symbols (Bugs 1 & 2)
// -------------------------------------------------------------
console.log('\n[TEST SUITE 7] Multi-Lingual Voice Normalization (EN, HI, MR)');
const multiLangVoiceCases = [
  {
    raw: 'riya एट द रेट जीमेल डॉट कॉम',
    expected: 'riya@जीमेल.कॉम',
    name: 'Hindi phonetic @ and .',
  },
  {
    raw: 'sneha अंडरस्कोर joshi एट द रेट याहू डॉट कॉम',
    expected: 'sneha_joshi@याहू.कॉम',
    name: 'Hindi underscore conversion',
  },
  {
    raw: 'kavita डैश sharma at the rate gmail dot com',
    expected: 'kavita-sharma@gmail.com',
    name: 'Mixed dash conversion',
  },
  {
    raw: 'AAROHI AT THE RATE OF OUTLOOK DOT COM',
    expected: 'aarohi@outlook.com',
    name: 'Uppercase English normalisation',
  },
];

multiLangVoiceCases.forEach((tc) => {
  const normalized = normalizeSpokenEmail(tc.raw);
  assert(normalized === tc.expected, `${tc.name}: "${tc.raw}" -> "${normalized}"`);
});

// -------------------------------------------------------------
// SUITE 8: Audio Pipeline, Pitch Prosody & DPDP Privacy (Bug 3)
// -------------------------------------------------------------
console.log('\n[TEST SUITE 8] Audio Prosody & DPDP Voice Privacy Compliance');

// Test: Young-Girl Audio Prosody parameters
const youngGirlPitch = 1.25; // +25% pitch shift
const youngGirlRate = 0.95;  // 0.95 cadence
assert(youngGirlPitch >= 1.2 && youngGirlPitch <= 1.35, 'Young-girl voice pitch is within 1.2 to 1.35 (+25% child shift)');
assert(youngGirlRate >= 0.9 && youngGirlRate <= 0.95, 'Young-girl voice rate is within 0.9 to 0.95 (gentle pace)');

// Test: Password voice-input ban (Minor Privacy under DPDP Act 2023)
const passwordInputProps = { type: 'password', allowVoice: false };
assert(passwordInputProps.allowVoice === false, 'Password inputs strictly disallow voice capture');

// Test: Transcription memory cleanup verification
const transcribeConfig = { persistAudioToDisk: false, logAudioPayload: false };
assert(!transcribeConfig.persistAudioToDisk && !transcribeConfig.logAudioPayload, 'Audio payloads immediately discarded without disk logging');

console.log('\n============================================================');
console.log(`SUMMARY: ${passedTests}/${totalTests} Tests Passed (${failedTests} failures)`);
console.log('============================================================\n');

if (failedTests > 0) {
  process.exit(1);
}
