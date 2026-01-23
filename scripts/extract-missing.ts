/**
 * Extract Missing Translation Keys
 * Generates a comprehensive list of missing translations
 */

import * as fs from 'fs';
import * as path from 'path';

interface TranslationObject {
  [key: string]: string | TranslationObject;
}

const MESSAGES_DIR = path.join(process.cwd(), 'messages');
const LOCALES = ['ar', 'en', 'de'];

function flattenObject(obj: TranslationObject, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = String(value);
    }
  }
  
  return result;
}

function unflattenObject(flattened: Record<string, string>): TranslationObject {
  const result: TranslationObject = {};
  
  for (const [key, value] of Object.entries(flattened)) {
    const parts = key.split('.');
    let current: any = result;
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in current)) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    
    current[parts[parts.length - 1]] = value;
  }
  
  return result;
}

function loadTranslations(locale: string): Record<string, string> {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
  const content = fs.readFileSync(filePath, 'utf-8');
  const json = JSON.parse(content);
  return flattenObject(json);
}

function loadTranslationObject(locale: string): TranslationObject {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

function extractMissingKeys() {
  const translations: Record<string, Record<string, string>> = {};
  
  // Load all translations
  for (const locale of LOCALES) {
    translations[locale] = loadTranslations(locale);
  }
  
  // Arabic has most keys - use as reference
  const referenceKeys = Object.keys(translations['ar']);
  
  const missingByLocale: Record<string, Set<string>> = {
    en: new Set(),
    de: new Set()
  };
  
  // Find missing keys in EN and DE
  for (const key of referenceKeys) {
    if (!translations['en'][key] || translations['en'][key].trim() === '') {
      missingByLocale['en'].add(key);
    }
    if (!translations['de'][key] || translations['de'][key].trim() === '') {
      missingByLocale['de'].add(key);
    }
  }
  
  console.log('📊 Missing Translation Summary:');
  console.log(`   EN: ${missingByLocale['en'].size} keys`);
  console.log(`   DE: ${missingByLocale['de'].size} keys`);
  
  // Export to JSON for processing
  const output = {
    missingInEn: Array.from(missingByLocale['en']).sort(),
    missingInDe: Array.from(missingByLocale['de']).sort(),
    referenceTranslations: {} as Record<string, string>
  };
  
  // Get Arabic reference values
  const allMissingKeys = new Set([...Array.from(missingByLocale['en']), ...Array.from(missingByLocale['de'])]);
  for (const key of Array.from(allMissingKeys)) {
    output.referenceTranslations[key] = translations['ar'][key];
  }
  
  const outputPath = path.join(process.cwd(), 'scripts', 'missing-translations.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  
  console.log(`\n✅ Exported missing keys to: ${outputPath}`);
  
  return output;
}

if (require.main === module) {
  extractMissingKeys();
}

export { extractMissingKeys, unflattenObject };
