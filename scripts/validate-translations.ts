/**
 * Translation Validation Script
 * Scans all translation files and code for missing translations
 */

import * as fs from 'fs';
import * as path from 'path';

interface TranslationObject {
  [key: string]: string | TranslationObject;
}

interface MissingTranslation {
  key: string;
  missingIn: string[];
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

function loadTranslations(locale: string): Record<string, string> {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
  const content = fs.readFileSync(filePath, 'utf-8');
  const json = JSON.parse(content);
  return flattenObject(json);
}

function findMissingTranslations(): MissingTranslation[] {
  const translations: Record<string, Record<string, string>> = {};
  
  // Load all translations
  for (const locale of LOCALES) {
    translations[locale] = loadTranslations(locale);
  }
  
  // Find all unique keys
  const allKeys = new Set<string>();
  for (const locale of LOCALES) {
    Object.keys(translations[locale]).forEach(key => allKeys.add(key));
  }
  
  // Find missing translations
  const missing: MissingTranslation[] = [];
  
  for (const key of Array.from(allKeys).sort()) {
    const missingIn: string[] = [];
    
    for (const locale of LOCALES) {
      if (!translations[locale][key] || translations[locale][key].trim() === '') {
        missingIn.push(locale);
      }
    }
    
    if (missingIn.length > 0) {
      missing.push({ key, missingIn });
    }
  }
  
  return missing;
}

function analyzeTranslationCoverage() {
  console.log('🔍 Analyzing translation coverage...\n');
  
  const missing = findMissingTranslations();
  
  if (missing.length === 0) {
    console.log('✅ All translations are complete!\n');
    return true;
  }
  
  console.log(`❌ Found ${missing.length} missing translations:\n`);
  
  const byLocale: Record<string, string[]> = {
    ar: [],
    en: [],
    de: []
  };
  
  missing.forEach(({ key, missingIn }) => {
    missingIn.forEach(locale => {
      byLocale[locale].push(key);
    });
  });
  
  for (const locale of LOCALES) {
    if (byLocale[locale].length > 0) {
      console.log(`\n📋 Missing in ${locale.toUpperCase()} (${byLocale[locale].length}):`);
      byLocale[locale].slice(0, 20).forEach(key => {
        console.log(`   - ${key}`);
      });
      if (byLocale[locale].length > 20) {
        console.log(`   ... and ${byLocale[locale].length - 20} more`);
      }
    }
  }
  
  return false;
}

function scanCodeForTranslationKeys(): Set<string> {
  const keys = new Set<string>();
  const codeDir = path.join(process.cwd(), 'app');
  
  function scanDirectory(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        
        // Match t('key') or t("key")
        const matches = Array.from(content.matchAll(/t\(['"]([^'"]+)['"]\)/g));
        for (const match of matches) {
          keys.add(match[1]);
        }
      }
    }
  }
  
  if (fs.existsSync(codeDir)) {
    scanDirectory(codeDir);
  }
  
  return keys;
}

// Run validation
if (require.main === module) {
  const isComplete = analyzeTranslationCoverage();
  process.exit(isComplete ? 0 : 1);
}

export { findMissingTranslations, analyzeTranslationCoverage, scanCodeForTranslationKeys };
