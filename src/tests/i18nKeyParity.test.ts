import en from '../../public/locales/en/translation.json';
import hi from '../../public/locales/hi/translation.json';
import mr from '../../public/locales/mr/translation.json';

function getDeepKeys(obj: any, prefix = ''): string[] {
  let keys: string[] = [];
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

export function testI18nKeyParity(): { passed: boolean; details: string[] } {
  const enKeys = new Set(getDeepKeys(en));
  const hiKeys = new Set(getDeepKeys(hi));
  const mrKeys = new Set(getDeepKeys(mr));

  const details: string[] = [];

  // Check EN against HI
  for (const key of enKeys) {
    if (!hiKeys.has(key)) {
      details.push(`Key missing in Hindi: ${key}`);
    }
    if (!mrKeys.has(key)) {
      details.push(`Key missing in Marathi: ${key}`);
    }
  }

  // Check HI against EN
  for (const key of hiKeys) {
    if (!enKeys.has(key)) {
      details.push(`Extra key in Hindi not in EN: ${key}`);
    }
  }

  // Check MR against EN
  for (const key of mrKeys) {
    if (!enKeys.has(key)) {
      details.push(`Extra key in Marathi not in EN: ${key}`);
    }
  }

  const passed = details.length === 0;
  return { passed, details };
}

// Self-executing when run directly in node
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('i18nKeyParity')) {
  const result = testI18nKeyParity();
  if (result.passed) {
    console.log('✓ All i18n translation keys are 100% synchronized across EN, HI, and MR.');
  } else {
    console.error('✗ i18n key parity issues:', result.details);
    process.exit(1);
  }
}
