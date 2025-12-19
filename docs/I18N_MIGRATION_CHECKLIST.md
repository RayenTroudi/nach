# i18n Migration Checklist

## ✅ Installation Complete

- [x] Installed next-intl package
- [x] Created translation files (ar, en, de)
- [x] Configured i18n.ts
- [x] Updated middleware.ts
- [x] Updated next.config.mjs
- [x] Created [locale] layout
- [x] Added RTL utilities
- [x] Created language switcher components

---

## 📋 Progressive Migration Steps

### Phase 1: Setup (COMPLETED ✅)
- [x] Install and configure next-intl
- [x] Add translation files
- [x] Create locale-aware routing
- [x] Add language switcher component

### Phase 2: Critical Components (TODO)
Choose 2-3 high-visibility components to migrate first:

- [ ] Navigation/Header component
- [ ] Footer component
- [ ] Main homepage
- [ ] Authentication pages (sign-in/sign-up)

### Phase 3: Common Components (TODO)
Migrate frequently-used shared components:

- [ ] Buttons
- [ ] Forms
- [ ] Modals
- [ ] Cards
- [ ] Alerts/Toasts

### Phase 4: Feature Pages (TODO)
Migrate main feature sections:

- [ ] Courses listing page
- [ ] Course detail page
- [ ] Dashboard
- [ ] Booking system
- [ ] Payment pages

### Phase 5: Admin & Settings (TODO)
Lower priority sections:

- [ ] Admin panel
- [ ] User settings
- [ ] Profile pages
- [ ] Analytics/Reports

---

## 🎯 Component Migration Template

When migrating a component, follow these steps:

### 1. Identify Translation Keys
```typescript
// Before:
<button>Save Changes</button>
<h1>Welcome to GermanPath</h1>

// Identify keys needed:
// - common.save
// - common.welcome
```

### 2. Add to Translation Files (if not exists)
```json
// messages/ar.json
{
  "common": {
    "save": "حفظ التغييرات",
    "welcome": "مرحباً بك في GermanPath"
  }
}
```

### 3. Update Component
```typescript
// Add 'use client' if interactive
'use client';

import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('common');
  
  return (
    <>
      <button>{t('save')}</button>
      <h1>{t('welcome')}</h1>
    </>
  );
}
```

### 4. Test
- [ ] Component renders correctly
- [ ] Translations show in all languages (ar, en, de)
- [ ] RTL works properly for Arabic
- [ ] No console errors
- [ ] Existing functionality preserved

---

## 🔍 Testing Checklist

### Manual Testing
- [ ] Open app in Arabic (default): `http://localhost:3000`
- [ ] Switch to English: `http://localhost:3000/en`
- [ ] Switch to German: `http://localhost:3000/de`
- [ ] Verify RTL layout works in Arabic
- [ ] Verify LTR layout works in English/German
- [ ] Test language switcher component
- [ ] Navigate between pages (locale persists)
- [ ] Test authentication flow
- [ ] Test API calls (should not be affected)

### Component Testing
For each migrated component:
- [ ] Text displays in correct language
- [ ] RTL layout correct for Arabic
- [ ] Buttons/links work
- [ ] Forms submit correctly
- [ ] No hardcoded strings remain

### Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

---

## 📝 Priority Components to Migrate

### High Priority (Do First)
1. **Navigation/Header** - Visible on every page
2. **Footer** - Visible on every page
3. **Homepage** - First impression
4. **Language Switcher** - Critical for UX

### Medium Priority (Do Next)
5. **Course Cards** - Core feature
6. **Sign In/Sign Up Forms** - Important flow
7. **Dashboard** - User-facing
8. **Common Buttons** - Reusable

### Low Priority (Do Later)
9. **Admin Pages** - Less traffic
10. **Settings Pages** - Lower visibility
11. **Error Pages** - Edge cases

---

## 🚀 How to Add Language Switcher to Your App

### Option 1: Add to Navigation Header
```tsx
// In your header/navigation component
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';

export function Header() {
  return (
    <header>
      <nav>
        {/* Your existing nav items */}
        <LanguageSwitcher />
      </nav>
    </header>
  );
}
```

### Option 2: Add to Footer
```tsx
// In your footer component
import { LanguageSwitcherSimple } from '@/components/shared/LanguageSwitcher';

export function Footer() {
  return (
    <footer>
      {/* Your existing footer content */}
      <div className="mt-4">
        <LanguageSwitcherSimple />
      </div>
    </footer>
  );
}
```

---

## 🛠️ Common Migration Patterns

### Pattern 1: Simple Text Replacement
```tsx
// Before
<h1>Welcome</h1>

// After
const t = useTranslations('common');
<h1>{t('welcome')}</h1>
```

### Pattern 2: Dynamic Content
```tsx
// Before
<p>You have {count} courses</p>

// After - Add to translation:
// "coursesCount": "لديك {count} دورة"

const t = useTranslations('dashboard');
<p>{t('coursesCount', { count })}</p>
```

### Pattern 3: Conditional Text
```tsx
// Before
<button>{isLoading ? 'Loading...' : 'Submit'}</button>

// After
const t = useTranslations('common');
<button>{isLoading ? t('loading') : t('submit')}</button>
```

### Pattern 4: Placeholder Text
```tsx
// Before
<input placeholder="Enter your email" />

// After
const t = useTranslations('forms');
<input placeholder={t('email')} />
```

---

## ⚠️ Common Pitfalls to Avoid

### ❌ Don't Do This:
```tsx
// Don't translate API endpoints
const response = await fetch(`/api/${t('courses')}`); // WRONG

// Don't translate data keys
const user = { [t('name')]: 'John' }; // WRONG

// Don't translate in middleware/API routes
// Translation is for UI only
```

### ✅ Do This Instead:
```tsx
// Keep API logic untranslated
const response = await fetch('/api/courses'); // CORRECT

// Translate only display text
<h1>{t('courses')}</h1> // CORRECT
```

---

## 📊 Translation Coverage Tracking

Track your progress:

### Components Migrated: 0 / 50
- [ ] Header (0%)
- [ ] Footer (0%)
- [ ] Homepage (0%)
- [ ] Navigation (0%)
- [ ] Auth forms (0%)

### Translation Files Completeness
- [x] Common translations (100% - complete)
- [x] Navigation translations (100% - complete)
- [x] Auth translations (100% - complete)
- [x] Course translations (100% - complete)
- [ ] Custom business translations (0% - add as needed)

---

## 🆘 Need Help?

### Documentation
- Main guide: `docs/I18N_GUIDE.md`
- Examples: `lib/i18n-examples.tsx`
- RTL utilities: `lib/utils/rtl.ts`

### Resources
- [next-intl docs](https://next-intl-docs.vercel.app/)
- [Next.js i18n routing](https://nextjs.org/docs/app/building-your-application/routing/internationalization)

---

**Last Updated**: Initial setup complete
**Status**: ✅ Ready for progressive migration
