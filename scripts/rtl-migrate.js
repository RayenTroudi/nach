#!/usr/bin/env node

/**
 * RTL Migration Script
 * Automatically converts physical properties to logical properties
 * 
 * Usage:
 *   node scripts/rtl-migrate.js components/shared/Navbar.tsx
 *   node scripts/rtl-migrate.js components/shared/
 */

const fs = require('fs');
const path = require('path');

// Mapping of physical to logical properties
const REPLACEMENTS = [
  // Margins
  { pattern: /\bml-(\d+)/g, replacement: 'ms-$1', description: 'margin-left → margin-inline-start' },
  { pattern: /\bmr-(\d+)/g, replacement: 'me-$1', description: 'margin-right → margin-inline-end' },
  { pattern: /\b-ml-(\d+)/g, replacement: '-ms-$1', description: 'negative margin-left' },
  { pattern: /\b-mr-(\d+)/g, replacement: '-me-$1', description: 'negative margin-right' },
  
  // Paddings
  { pattern: /\bpl-(\d+)/g, replacement: 'ps-$1', description: 'padding-left → padding-inline-start' },
  { pattern: /\bpr-(\d+)/g, replacement: 'pe-$1', description: 'padding-right → padding-inline-end' },
  
  // Borders
  { pattern: /\bborder-l-(\d+)/g, replacement: 'border-s-$1', description: 'border-left → border-inline-start' },
  { pattern: /\bborder-r-(\d+)/g, replacement: 'border-e-$1', description: 'border-right → border-inline-end' },
  { pattern: /\bborder-l\b/g, replacement: 'border-s', description: 'border-left' },
  { pattern: /\bborder-r\b/g, replacement: 'border-e', description: 'border-right' },
  
  // Positioning
  { pattern: /\bleft-(\d+)/g, replacement: 'start-$1', description: 'left → start' },
  { pattern: /\bright-(\d+)/g, replacement: 'end-$1', description: 'right → end' },
  { pattern: /\b-left-(\d+)/g, replacement: '-start-$1', description: 'negative left' },
  { pattern: /\b-right-(\d+)/g, replacement: '-end-$1', description: 'negative right' },
  
  // Border radius
  { pattern: /\brounded-l-(\w+)/g, replacement: 'rounded-s-$1', description: 'rounded-left → rounded-start' },
  { pattern: /\brounded-r-(\w+)/g, replacement: 'rounded-e-$1', description: 'rounded-right → rounded-end' },
  { pattern: /\brounded-tl-(\w+)/g, replacement: 'rounded-ss-$1', description: 'rounded-top-left → rounded-start-start' },
  { pattern: /\brounded-tr-(\w+)/g, replacement: 'rounded-se-$1', description: 'rounded-top-right → rounded-start-end' },
  { pattern: /\brounded-bl-(\w+)/g, replacement: 'rounded-es-$1', description: 'rounded-bottom-left → rounded-end-start' },
  { pattern: /\brounded-br-(\w+)/g, replacement: 'rounded-ee-$1', description: 'rounded-bottom-right → rounded-end-end' },
];

// Issues that need manual review
const MANUAL_REVIEW = [
  { pattern: /text-left/g, suggestion: 'text-start or conditional with rtl', description: 'Text alignment' },
  { pattern: /text-right/g, suggestion: 'text-end or conditional with rtl', description: 'Text alignment' },
  { pattern: /justify-start/g, suggestion: 'Review if needs RTL adjustment', description: 'Flexbox justify' },
  { pattern: /justify-end/g, suggestion: 'Review if needs RTL adjustment', description: 'Flexbox justify' },
  { pattern: /items-start/g, suggestion: 'Review if needs RTL adjustment', description: 'Flexbox align' },
  { pattern: /items-end/g, suggestion: 'Review if needs RTL adjustment', description: 'Flexbox align' },
  { pattern: /flex-row-reverse/g, suggestion: 'Conditional based on rtl', description: 'Flex direction' },
  { pattern: /space-x-/g, suggestion: 'Add rtl:space-x-reverse or use gap', description: 'Horizontal spacing' },
];

function migrateFile(filePath, dryRun = false) {
  console.log(`\n📄 Processing: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  let changeCount = 0;
  const changes = [];
  const reviews = [];
  
  // Apply automatic replacements
  REPLACEMENTS.forEach(({ pattern, replacement, description }) => {
    const matches = content.match(pattern);
    if (matches) {
      const count = matches.length;
      changeCount += count;
      changes.push({ description, count, example: matches[0] });
      content = content.replace(pattern, replacement);
    }
  });
  
  // Check for manual reviews
  MANUAL_REVIEW.forEach(({ pattern, suggestion, description }) => {
    const matches = content.match(pattern);
    if (matches) {
      reviews.push({ description, suggestion, count: matches.length, example: matches[0] });
    }
  });
  
  // Report changes
  if (changeCount > 0) {
    console.log(`\n✅ Found ${changeCount} automatic fix(es):`);
    changes.forEach(({ description, count, example }) => {
      console.log(`   • ${description}: ${count}x (e.g., "${example}")`);
    });
  } else {
    console.log(`✅ No automatic fixes needed`);
  }
  
  // Report manual reviews
  if (reviews.length > 0) {
    console.log(`\n⚠️  Manual review needed for ${reviews.length} pattern(s):`);
    reviews.forEach(({ description, suggestion, count, example }) => {
      console.log(`   • ${description}: ${count}x (e.g., "${example}")`);
      console.log(`     Suggestion: ${suggestion}`);
    });
  }
  
  // Write changes
  if (changeCount > 0 && !dryRun) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`\n💾 Saved changes to ${filePath}`);
  } else if (changeCount > 0 && dryRun) {
    console.log(`\n🔍 DRY RUN - No changes written`);
  }
  
  return { changeCount, reviewCount: reviews.length };
}

function migrateDirectory(dirPath, dryRun = false) {
  console.log(`\n📁 Scanning directory: ${dirPath}`);
  
  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  let totalChanges = 0;
  let totalReviews = 0;
  let filesProcessed = 0;
  
  files.forEach(file => {
    const fullPath = path.join(dirPath, file.name);
    
    if (file.isDirectory()) {
      const result = migrateDirectory(fullPath, dryRun);
      totalChanges += result.changeCount;
      totalReviews += result.reviewCount;
      filesProcessed += result.filesProcessed;
    } else if (file.name.match(/\.(tsx|ts|jsx|js)$/)) {
      const result = migrateFile(fullPath, dryRun);
      if (result) {
        totalChanges += result.changeCount;
        totalReviews += result.reviewCount;
        filesProcessed++;
      }
    }
  });
  
  return { changeCount: totalChanges, reviewCount: totalReviews, filesProcessed };
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🔧 RTL Migration Script

Usage:
  node scripts/rtl-migrate.js [path] [--dry-run]

Examples:
  node scripts/rtl-migrate.js components/shared/Navbar.tsx
  node scripts/rtl-migrate.js components/shared/
  node scripts/rtl-migrate.js components/ --dry-run

Options:
  --dry-run    Preview changes without writing files
  --help       Show this help message
`);
    return;
  }
  
  const dryRun = args.includes('--dry-run');
  const targetPath = args[0];
  
  console.log(`
🚀 RTL Migration Script
======================
Target: ${targetPath}
Mode: ${dryRun ? 'DRY RUN (preview only)' : 'LIVE (will modify files)'}
`);
  
  const fullPath = path.resolve(targetPath);
  const stat = fs.statSync(fullPath);
  
  let result;
  if (stat.isDirectory()) {
    result = migrateDirectory(fullPath, dryRun);
    console.log(`
\n📊 Summary
===========
Files processed: ${result.filesProcessed}
Automatic fixes: ${result.changeCount}
Manual reviews needed: ${result.reviewCount}
`);
  } else {
    result = migrateFile(fullPath, dryRun);
  }
  
  if (dryRun && result.changeCount > 0) {
    console.log(`\n💡 Tip: Run without --dry-run to apply changes`);
  }
  
  if (result.reviewCount > 0) {
    console.log(`\n📚 Next Steps:
1. Review files with ⚠️  warnings
2. Test components in Arabic (http://localhost:3000/ar)
3. Check RTL documentation: docs/RTL_QUICK_REFERENCE.md
`);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { migrateFile, migrateDirectory };
