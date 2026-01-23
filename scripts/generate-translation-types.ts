/**
 * Translation Type Safety
 * Generates TypeScript types from translation keys for compile-time checking
 */

import * as fs from 'fs';
import * as path from 'path';

const MESSAGES_DIR = path.join(process.cwd(), 'messages');
const OUTPUT_FILE = path.join(process.cwd(), 'types', 'translations.d.ts');

interface TranslationObject {
  [key: string]: string | TranslationObject;
}

function flattenObject(obj: TranslationObject, prefix = ''): string[] {
  const keys: string[] = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...flattenObject(value, newKey));
    } else {
      keys.push(newKey);
    }
  }
  
  return keys;
}

function generateTranslationTypes() {
  console.log('🔧 Generating translation types...\n');
  
  // Load reference translations (Arabic)
  const arPath = path.join(MESSAGES_DIR, 'ar.json');
  const arContent = JSON.parse(fs.readFileSync(arPath, 'utf-8'));
  
  // Get all translation keys
  const keys = flattenObject(arContent).sort();
  
  // Generate TypeScript type definition
  const typeDefinition = `/**
 * Auto-generated translation keys
 * Run: npm run translate:types to regenerate
 * DO NOT EDIT MANUALLY
 */

export type TranslationKey = 
${keys.map(key => `  | '${key}'`).join('\n')};

export type Locale = 'ar' | 'en' | 'de';

declare module 'next-intl' {
  interface AppMessages {
${generateNestedInterface(arContent, 2)}
  }
}
`;

  // Ensure types directory exists
  const typesDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(typesDir)) {
    fs.mkdirSync(typesDir, { recursive: true });
  }
  
  // Write type definition
  fs.writeFileSync(OUTPUT_FILE, typeDefinition);
  
  console.log(`✅ Generated ${keys.length} translation key types`);
  console.log(`📝 Written to: ${OUTPUT_FILE}\n`);
}

function generateNestedInterface(obj: TranslationObject, indent: number): string {
  const spaces = '  '.repeat(indent);
  let result = '';
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result += `${spaces}${key}: {\n`;
      result += generateNestedInterface(value, indent + 1);
      result += `${spaces}};\n`;
    } else {
      result += `${spaces}${key}: string;\n`;
    }
  }
  
  return result;
}

if (require.main === module) {
  generateTranslationTypes();
}

export { generateTranslationTypes };
