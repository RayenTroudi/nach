/**
 * Hardcoded String Detection
 * Scans codebase for potential hardcoded strings that should be translated
 */

import * as fs from 'fs';
import * as path from 'path';

const SCAN_DIRS = ['app', 'components'];
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.next/,
  /\.git/,
  /dist/,
  /build/,
  /\.test\./,
  /\.spec\./,
];

const IGNORE_STRINGS = new Set([
  // Common code strings that don't need translation
  'utf-8', 'UTF-8', 'className', 'onClick', 'onChange', 'onSubmit',
  'href', 'src', 'alt', 'id', 'name', 'value', 'type', 'placeholder',
  'email', 'password', 'text', 'number', 'date', 'time', 'tel', 'url',
  'POST', 'GET', 'PUT', 'DELETE', 'PATCH',
  'px', 'rem', 'em', '%', 'vh', 'vw',
  'flex', 'grid', 'block', 'inline', 'hidden',
  'true', 'false', 'null', 'undefined',
  // Single letters/numbers
  /^[a-z]$/i,
  /^\d+$/,
  // URLs, emails, paths
  /^https?:\/\//,
  /^\/[a-z0-9\-_\/]*$/i,
  /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i,
]);

interface HardcodedString {
  file: string;
  line: number;
  string: string;
  context: string;
}

function shouldIgnoreString(str: string): boolean {
  if (IGNORE_STRINGS.has(str)) return true;
  
  const ignoreArray = Array.from(IGNORE_STRINGS);
  for (const pattern of ignoreArray) {
    if (pattern instanceof RegExp && pattern.test(str)) {
      return true;
    }
  }
  
  // Ignore very short strings (likely not UI text)
  if (str.length < 3) return true;
  
  // Ignore strings that look like code
  if (/^[a-z][a-zA-Z0-9_]*$/.test(str)) return true; // camelCase
  if (/^[A-Z][A-Z0-9_]*$/.test(str)) return true; // CONSTANT_CASE
  if (/^[a-z-]+$/.test(str)) return true; // kebab-case
  
  return false;
}

function scanFile(filePath: string): HardcodedString[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const hardcoded: HardcodedString[] = [];
  
  lines.forEach((line, index) => {
    // Skip lines with translation function calls
    if (/t\(['"`]/.test(line) || /useTranslations/.test(line)) return;
    
    // Find string literals in JSX
    const jsxStringMatches = Array.from(line.matchAll(/>([^<{]+)</g));
    for (const match of jsxStringMatches) {
      const str = match[1].trim();
      if (str && !shouldIgnoreString(str) && /[a-zA-Z]{3,}/.test(str)) {
        hardcoded.push({
          file: filePath,
          line: index + 1,
          string: str,
          context: line.trim()
        });
      }
    }
    
    // Find string literals in attributes (excluding common ones)
    const attrStringMatches = Array.from(line.matchAll(/(?:title|label|placeholder|aria-label)=["']([^"']+)["']/g));
    for (const match of attrStringMatches) {
      const str = match[1];
      if (str && !shouldIgnoreString(str)) {
        hardcoded.push({
          file: filePath,
          line: index + 1,
          string: str,
          context: line.trim()
        });
      }
    }
  });
  
  return hardcoded;
}

function scanDirectory(dir: string): HardcodedString[] {
  let results: HardcodedString[] = [];
  
  if (!fs.existsSync(dir)) return results;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    // Check if should be excluded
    if (EXCLUDE_PATTERNS.some(pattern => pattern.test(fullPath))) {
      continue;
    }
    
    if (entry.isDirectory()) {
      results = results.concat(scanDirectory(fullPath));
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx'))) {
      results = results.concat(scanFile(fullPath));
    }
  }
  
  return results;
}

function scanForHardcodedStrings() {
  console.log('🔍 Scanning for hardcoded strings...\n');
  
  let allHardcoded: HardcodedString[] = [];
  
  for (const dir of SCAN_DIRS) {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      console.log(`Scanning: ${dir}/`);
      allHardcoded = allHardcoded.concat(scanDirectory(dirPath));
    }
  }
  
  if (allHardcoded.length === 0) {
    console.log('\n✅ No hardcoded strings detected!\n');
    return;
  }
  
  // Group by file
  const byFile = new Map<string, HardcodedString[]>();
  for (const item of allHardcoded) {
    const relativePath = path.relative(process.cwd(), item.file);
    if (!byFile.has(relativePath)) {
      byFile.set(relativePath, []);
    }
    byFile.get(relativePath)!.push(item);
  }
  
  console.log(`\n⚠️  Found ${allHardcoded.length} potential hardcoded strings in ${byFile.size} files:\n`);
  
  // Show top 20 files with most issues
  const sortedFiles = Array.from(byFile.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 20);
  
  for (const [file, items] of sortedFiles) {
    console.log(`\n📄 ${file} (${items.length} issues)`);
    items.slice(0, 3).forEach(item => {
      console.log(`   Line ${item.line}: "${item.string}"`);
    });
    if (items.length > 3) {
      console.log(`   ... and ${items.length - 3} more`);
    }
  }
  
  // Export to JSON
  const outputPath = path.join(process.cwd(), 'scripts', 'hardcoded-strings.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    totalCount: allHardcoded.length,
    filesAffected: byFile.size,
    byFile: Object.fromEntries(byFile)
  }, null, 2));
  
  console.log(`\n📝 Full report exported to: ${outputPath}\n`);
  console.log('⚠️  Note: This scan may include false positives. Review manually.\n');
}

if (require.main === module) {
  scanForHardcodedStrings();
}

export { scanForHardcodedStrings };
