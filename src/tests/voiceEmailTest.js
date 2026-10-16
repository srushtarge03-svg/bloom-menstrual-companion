/**
 * Spoken Voice Email Normalization Unit Tests
 */

import { normalizeSpokenEmail } from '../utils/voiceInput.js';

export function runVoiceEmailTests() {
  const cases = [
    {
      input: 'priya at the rate gmail dot com',
      expected: 'priya@gmail.com',
      name: 'Standard English at the rate and dot',
    },
    {
      input: 'AAROHI AT THE RATE OF OUTLOOK DOT COM',
      expected: 'aarohi@outlook.com',
      name: 'Uppercase with at the rate of',
    },
    {
      input: 'swara_sharma at gmail dot com',
      expected: 'swara_sharma@gmail.com',
      name: 'Underscore preservation',
    },
    {
      input: 'anita underscore kaur at the rate yahoo dot com',
      expected: 'anita_kaur@yahoo.com',
      name: 'Spoken underscore conversion',
    },
    {
      input: 'neha dash patel at the rate gmail dot com',
      expected: 'neha-patel@gmail.com',
      name: 'Spoken dash/hyphen conversion',
    },
    {
      input: 'riya एट द रेट जीमेल डॉट कॉम',
      expected: 'riya@जीमेल.कॉम',
      name: 'Hindi phonetic markers normalization',
    },
  ];

  let passed = 0;
  let failed = 0;
  const results = [];

  for (const c of cases) {
    const output = normalizeSpokenEmail(c.input);
    const ok = output === c.expected;
    if (ok) passed++;
    else failed++;
    results.push({ name: c.name, input: c.input, output, expected: c.expected, ok });
  }

  return { passed, failed, results };
}

if (process.argv[1]?.endsWith('voiceEmailTest.js')) {
  const { passed, failed, results } = runVoiceEmailTests();
  console.log('--- Voice Email Normalization Tests ---');
  results.forEach((r) => {
    console.log(`${r.ok ? '✓' : '✗'} ${r.name}`);
    if (!r.ok) {
      console.log(`  Expected: ${r.expected}`);
      console.log(`  Received: ${r.output}`);
    }
  });
  console.log(`Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed === 0 ? 0 : 1);
}
