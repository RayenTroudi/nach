# Translation Management Scripts

This directory contains automated scripts for managing translations across the platform.

## Scripts

### `validate-translations.ts`
Validates that all translation keys exist across all supported locales (ar, en, de).

```bash
npm run translate:check
```

Exit code 0 = all translations complete
Exit code 1 = missing translations found

### `extract-missing.ts`
Extracts missing translation keys and exports them to `missing-translations.json` for analysis.

```bash
npm run translate:extract
```

### `apply-complete-translations.ts`
Applies a complete set of translations from a predefined map to EN and DE files.

```bash
npx tsx scripts/apply-complete-translations.ts
```

### `add-arabic-translations.ts`
Adds missing Arabic translations that exist in EN/DE.

```bash
npx tsx scripts/add-arabic-translations.ts
```

## Pre-commit Hook

The pre-commit hook automatically validates translations before allowing a commit.

To install:
```bash
# Unix/Linux/Mac
chmod +x scripts/pre-commit
cp scripts/pre-commit .git/hooks/pre-commit

# Windows
copy scripts\pre-commit .git\hooks\pre-commit
```

## CI/CD Integration

The build process automatically validates translations:

```bash
npm run build
# Runs: npm run validate:translations && next build
```

If translations are incomplete, the build will fail.

## Translation Workflow

1. **Add new features** with translation keys
2. **Extract missing keys**: `npm run translate:extract`
3. **Review** `scripts/missing-translations.json`
4. **Add translations** to `messages/{locale}.json`
5. **Validate**: `npm run translate:check`
6. **Commit** (pre-commit hook validates automatically)

## Supported Locales

- **ar**: Arabic (default)
- **en**: English
- **de**: German

## File Structure

```
messages/
├── ar.json  # Arabic translations (reference)
├── en.json  # English translations
└── de.json  # German translations
```

## Prevention Mechanisms

1. **Build-time validation**: Build fails if translations are incomplete
2. **Pre-commit hook**: Prevents committing incomplete translations
3. **NPM scripts**: Easy validation and extraction commands
4. **Automated checks**: CI/CD pipeline integration

## Common Issues

### Missing Translation Keys
Run `npm run translate:extract` to identify missing keys, then add them to the appropriate locale files.

### Format Errors
Ensure all JSON files are properly formatted:
```bash
npx prettier --write messages/*.json
```

### Nested Keys
Use dot notation for nested keys:
```typescript
t('dashboard.admin.resumes.title')
```

Corresponds to:
```json
{
  "dashboard": {
    "admin": {
      "resumes": {
        "title": "Resume Requests"
      }
    }
  }
}
```
