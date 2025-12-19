# i18n Quick Reference Card

## 🚀 Essential Commands

```bash
# Start development server
npm run dev

# Test different locales
http://localhost:3000       # Arabic (default)
http://localhost:3000/en    # English
http://localhost:3000/de    # German
```

---

## 📝 Most Common Patterns

### Pattern 1: Simple Translation
```tsx
'use client';
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('common');
  return <button>{t('save')}</button>;
}
```

### Pattern 2: Multiple Namespaces
```tsx
const tCommon = useTranslations('common');
const tAuth = useTranslations('auth');
const tForms = useTranslations('forms');
```

### Pattern 3: Get Current Locale
```tsx
import { useLocale } from 'next-intl';

const locale = useLocale(); // 'ar', 'en', or 'de'
```

### Pattern 4: Check if RTL
```tsx
import { useLocale } from 'next-intl';
import { isRTL } from '@/lib/utils/rtl';

const locale = useLocale();
const rtl = isRTL(locale as any); // true for Arabic
```

---

## 📦 Translation Namespaces

| Namespace | Use For |
|-----------|---------|
| `common` | Buttons, actions, general UI |
| `navigation` | Menu items, links |
| `auth` | Authentication pages |
| `courses` | Course-related content |
| `forms` | Form labels, inputs |
| `dashboard` | Dashboard UI |
| `booking` | Booking system |
| `payment` | Payment flow |
| `messages` | System messages |
| `footer` | Footer content |
| `errors` | Error messages |

---

## 🔤 Common Translation Keys

### Common Namespace
```tsx
t('welcome')    // "مرحباً بك" / "Welcome"
t('home')       // "الرئيسية" / "Home"
t('save')       // "حفظ" / "Save"
t('cancel')     // "إلغاء" / "Cancel"
t('submit')     // "إرسال" / "Submit"
t('loading')    // "جاري التحميل..." / "Loading..."
t('search')     // "بحث" / "Search"
```

### Navigation Namespace
```tsx
t('dashboard')   // "لوحة التحكم" / "Dashboard"
t('courses')     // "الدورات" / "Courses"
t('myLearning')  // "دوراتي" / "My Learning"
```

### Auth Namespace
```tsx
t('signIn')      // "تسجيل الدخول" / "Sign In"
t('signUp')      // "إنشاء حساب" / "Sign Up"
t('email')       // "البريد الإلكتروني" / "Email"
t('password')    // "كلمة المرور" / "Password"
```

---

## 🎨 RTL Utilities

```tsx
import { 
  isRTL, 
  getDirection, 
  getTextAlign,
  getMarginStart,
  getMarginEnd
} from '@/lib/utils/rtl';
import { useLocale } from 'next-intl';

const locale = useLocale();

// Usage
<div dir={getDirection(locale as any)}>
  <p className={getTextAlign(locale as any)}>Text</p>
  <button className={getMarginStart(locale as any, '4')}>
    Button
  </button>
</div>
```

---

## 🌐 Language Switcher

```tsx
// Add to your navigation
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';

<LanguageSwitcher />
```

**Variants available:**
- `LanguageSwitcher` - Dropdown with hover
- `LanguageSwitcherSimple` - Horizontal buttons
- `LanguageSwitcherWithFlags` - With flag emojis

---

## 🔗 Locale-Aware Links

```tsx
import Link from 'next/link';
import { useLocale } from 'next-intl';

const locale = useLocale();
const href = locale === 'ar' ? '/courses' : `/${locale}/courses`;

<Link href={href}>Courses</Link>
```

---

## 📄 File Locations

| What | Where |
|------|-------|
| Translations | `messages/*.json` |
| i18n Config | `i18n.ts` |
| Middleware | `middleware.ts` |
| Locale Layout | `app/[locale]/layout.tsx` |
| RTL Utils | `lib/utils/rtl.ts` |
| Examples | `lib/i18n-examples.tsx` |
| Switcher | `components/shared/LanguageSwitcher.tsx` |

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| `I18N_IMPLEMENTATION_SUMMARY.md` | ✨ **START HERE** - Overview |
| `docs/I18N_GUIDE.md` | Complete guide |
| `docs/I18N_MIGRATION_CHECKLIST.md` | Migration steps |
| `docs/I18N_MIGRATION_EXAMPLES.md` | Code examples |

---

## ✅ Quick Checklist

### To Start Using i18n:
- [ ] Add `LanguageSwitcher` to your header/nav
- [ ] Test switching between ar/en/de
- [ ] Pick one component to migrate
- [ ] Add translations for that component
- [ ] Test and repeat!

### Before Deploying:
- [ ] Language switcher is visible
- [ ] All three languages work
- [ ] RTL works for Arabic
- [ ] Authentication still works
- [ ] Forms still submit correctly
- [ ] No console errors

---

## 🆘 Emergency Help

### Something broke?
1. Check browser console for errors
2. Verify translation key exists in `messages/*.json`
3. Check component is in `app/[locale]` routes
4. Try clearing cache: `rm -rf .next && npm run dev`

### Need to revert?
All your old code still works! Just don't use the translation hooks and keep your hardcoded strings.

---

## 💡 Pro Tips

1. **Server Components** are simpler (no 'use client' needed)
2. **Start small** - migrate one component at a time
3. **Use TypeScript** - you'll get autocomplete for translation keys
4. **Test RTL** - especially for forms and layouts
5. **Keep keys organized** - use appropriate namespaces

---

**Quick Start**: Add `LanguageSwitcher` → Test languages → Migrate components one by one

**Remember**: No rush! The system supports progressive adoption. 🚀
