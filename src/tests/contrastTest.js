/**
 * Automated WCAG Contrast Verification Test
 * Asserts that all text color to background pairs achieve at least 4.5:1 contrast ratio.
 */

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function getLuminance({ r, g, b }) {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastRatio(hex1, hex2) {
  const lum1 = getLuminance(hexToRgb(hex1));
  const lum2 = getLuminance(hexToRgb(hex2));
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

export function runContrastTests() {
  const tests = [
    // Light mode
    { name: 'Light Ink on Light Bg', fg: '#251A30', bg: '#FAF7F5', min: 4.5 },
    { name: 'Light Ink on Surface', fg: '#251A30', bg: '#FFFFFF', min: 4.5 },
    { name: 'Light Plum on Light Bg', fg: '#8A388F', bg: '#FAF7F5', min: 4.5 },
    { name: 'White on Primary Plum Button', fg: '#FFFFFF', bg: '#8A388F', min: 4.5 },
    { name: 'Muted Ink on Light Bg', fg: '#6F5E7B', bg: '#FAF7F5', min: 4.5 },

    // Dark mode
    { name: 'Dark Ink on Dark Bg', fg: '#F7F1FA', bg: '#140E1B', min: 4.5 },
    { name: 'Dark Ink on Dark Surface', fg: '#F7F1FA', bg: '#21172B', min: 4.5 },
    { name: 'Dark Plum on Dark Bg', fg: '#D89FE3', bg: '#140E1B', min: 4.5 },
    { name: 'Dark Muted on Dark Bg', fg: '#A997BA', bg: '#140E1B', min: 4.5 },
    { name: 'Dark Bg text on Dark Plum Button', fg: '#140E1B', bg: '#D89FE3', min: 4.5 },
  ];

  let allPassed = true;
  const results = [];

  for (const t of tests) {
    const ratio = getContrastRatio(t.fg, t.bg);
    const passed = ratio >= t.min;
    if (!passed) allPassed = false;
    results.push({
      ...t,
      ratio: ratio.toFixed(2),
      passed,
    });
  }

  return { allPassed, results };
}

if (process.argv[1]?.endsWith('contrastTest.js')) {
  const { allPassed, results } = runContrastTests();
  console.log('--- Contrast Test Results ---');
  results.forEach((r) => {
    console.log(`${r.passed ? '✓' : '✗'} ${r.name}: ${r.ratio}:1 (Required: ${r.min}:1)`);
  });
  process.exit(allPassed ? 0 : 1);
}
