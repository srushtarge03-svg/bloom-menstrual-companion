/**
 * Automated Emoji Lint Test
 * Fails the test if any Unicode emoji character is detected in source or content files.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// Standard Unicode Emoji regex pattern
export const EMOJI_REGEX = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/u;

function checkFileForEmojis(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const violations = [];

  lines.forEach((line, lineIndex) => {
    if (EMOJI_REGEX.test(line)) {
      const match = line.match(EMOJI_REGEX);
      violations.push({
        line: lineIndex + 1,
        match: match ? match[0] : 'unknown',
        snippet: line.trim(),
      });
    }
  });

  return violations;
}

function getAllFiles(dir, extensions = ['.json', '.ts', '.tsx', '.js', '.html']) {
  let results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist') {
        results = results.concat(getAllFiles(fullPath, extensions));
      }
    } else if (entry.isFile()) {
      if (extensions.some((ext) => entry.name.endsWith(ext))) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

export function runEmojiLint() {
  const targetDirs = [
    path.join(rootDir, 'public', 'locales'),
    path.join(rootDir, 'src'),
    path.join(rootDir, 'netlify'),
  ];

  let filesToCheck = [];
  targetDirs.forEach((d) => {
    filesToCheck = filesToCheck.concat(getAllFiles(d));
  });

  // Also check index.html and preview.html
  ['index.html', 'preview.html'].forEach((f) => {
    const p = path.join(rootDir, f);
    if (fs.existsSync(p)) filesToCheck.push(p);
  });

  const totalViolations = [];

  for (const file of filesToCheck) {
    // Skip this lint script itself since it defines the regex patterns
    if (file.endsWith('emojiLintTest.js')) continue;

    const fileViolations = checkFileForEmojis(file);
    if (fileViolations.length > 0) {
      totalViolations.push({
        file: path.relative(rootDir, file),
        violations: fileViolations,
      });
    }
  }

  return {
    passed: totalViolations.length === 0,
    totalFiles: filesToCheck.length,
    totalViolations,
  };
}

if (process.argv[1]?.endsWith('emojiLintTest.js')) {
  console.log('--- Emoji Lint Test ---');
  const result = runEmojiLint();
  console.log(`Scanned ${result.totalFiles} files.`);

  if (result.passed) {
    console.log('✓ PASS: Zero emojis detected across all scanned files.');
    process.exit(0);
  } else {
    console.error(`✗ FAIL: Emojis detected in ${result.totalViolations.length} files:`);
    result.totalViolations.forEach((tv) => {
      console.error(`\nFile: ${tv.file}`);
      tv.violations.forEach((v) => {
        console.error(`  Line ${v.line}: [${v.match}] "${v.snippet}"`);
      });
    });
    process.exit(1);
  }
}
