# Real-World Migration Example

This document shows a practical example of migrating an existing component to use translations.

## Example: Migrating a Button Component

### BEFORE (Original Component - Still Works!)

```tsx
// components/shared/SaveButton.tsx
'use client';

interface SaveButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

export function SaveButton({ onClick, isLoading }: SaveButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
    >
      {isLoading ? 'Saving...' : 'Save Changes'}
    </button>
  );
}
```

### AFTER (With Translations)

```tsx
// components/shared/SaveButton.tsx
'use client';

import { useTranslations } from 'next-intl';

interface SaveButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

export function SaveButton({ onClick, isLoading }: SaveButtonProps) {
  const t = useTranslations('common');
  
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
    >
      {isLoading ? t('loading') : t('save')}
    </button>
  );
}
```

**Changes Made:**
1. ✅ Added `import { useTranslations } from 'next-intl';`
2. ✅ Added `const t = useTranslations('common');` inside component
3. ✅ Replaced `'Saving...'` with `t('loading')`
4. ✅ Replaced `'Save Changes'` with `t('save')`
5. ✅ No changes to props, logic, or styling

---

## Example: Migrating a Form Component

### BEFORE

```tsx
// components/forms/ContactForm.tsx
'use client';

import { useState } from 'react';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit logic...
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name">Full Name</label>
        <input
          id="name"
          type="text"
          placeholder="Enter your name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div>
        <label htmlFor="message">Your Message</label>
        <textarea
          id="message"
          placeholder="Write your message here"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          required
        />
      </div>

      <button type="submit">Send Message</button>
    </form>
  );
}
```

### AFTER (With Translations)

```tsx
// components/forms/ContactForm.tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function ContactForm() {
  const t = useTranslations('forms');
  const tCommon = useTranslations('common');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit logic...
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name">{t('fullName')}</label>
        <input
          id="name"
          type="text"
          placeholder={t('fullName')}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <label htmlFor="email">{t('email')}</label>
        <input
          id="email"
          type="email"
          placeholder={t('email')}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div>
        <label htmlFor="message">{t('message')}</label>
        <textarea
          id="message"
          placeholder={t('message')}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          required
        />
      </div>

      <button type="submit">{tCommon('submit')}</button>
    </form>
  );
}
```

**Changes Made:**
1. ✅ Added translation imports
2. ✅ Used two namespaces: `forms` and `common`
3. ✅ All labels translated
4. ✅ All placeholders translated
5. ✅ Button text translated
6. ✅ Form logic unchanged
7. ✅ Event handlers unchanged

---

## Example: Migrating a Navigation Component

### BEFORE

```tsx
// components/shared/MainNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function MainNav() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Home' },
    { href: '/courses', label: 'Courses' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' }
  ];

  return (
    <nav className="flex gap-6">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={pathname === link.href ? 'text-red-500' : 'text-gray-700'}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
```

### AFTER (With Translations)

```tsx
// components/shared/MainNav.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';

export function MainNav() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('common');

  // Build links with locale awareness
  const links = [
    { href: '/', translationKey: 'home' },
    { href: '/courses', translationKey: 'courses' },
    { href: '/about', translationKey: 'about' },
    { href: '/contact', translationKey: 'contact' }
  ];

  // Helper to get localized href
  const getLocalizedHref = (href: string) => {
    return locale === 'ar' ? href : `/${locale}${href}`;
  };

  return (
    <nav className="flex gap-6">
      {links.map((link) => {
        const localizedHref = getLocalizedHref(link.href);
        const isActive = pathname === localizedHref;
        
        return (
          <Link
            key={link.href}
            href={localizedHref}
            className={isActive ? 'text-red-500' : 'text-gray-700'}
          >
            {t(link.translationKey as any)}
          </Link>
        );
      })}
    </nav>
  );
}
```

**Changes Made:**
1. ✅ Added translation hooks
2. ✅ Changed from hardcoded labels to translation keys
3. ✅ Made links locale-aware
4. ✅ Active state detection updated for locale paths
5. ✅ Navigation logic preserved

---

## Example: Backward Compatible Migration

Sometimes you want to support both old and new usage. Here's how:

### Smart Component (Supports Both)

```tsx
'use client';

import { useTranslations } from 'next-intl';

interface SmartButtonProps {
  // Old way - still supported
  label?: string;
  
  // New way - preferred
  translationKey?: string;
  translationNamespace?: string;
  
  onClick?: () => void;
  className?: string;
}

export function SmartButton({
  label,
  translationKey,
  translationNamespace = 'common',
  onClick,
  className
}: SmartButtonProps) {
  const t = useTranslations(translationNamespace);
  
  // Use translation if provided, otherwise use label
  const displayText = translationKey ? t(translationKey as any) : label;
  
  return (
    <button onClick={onClick} className={className}>
      {displayText}
    </button>
  );
}

// BOTH WORK:
// Old: <SmartButton label="Click Me" />
// New: <SmartButton translationKey="submit" />
```

---

## Example: Adding RTL Support

### Component with RTL Awareness

```tsx
'use client';

import { useTranslations, useLocale } from 'next-intl';
import { isRTL, getTextAlign, getMarginStart } from '@/lib/utils/rtl';

export function ProductCard() {
  const t = useTranslations('courses');
  const locale = useLocale();
  const rtl = isRTL(locale as any);

  return (
    <div className={`p-4 border rounded ${getTextAlign(locale as any)}`}>
      <div className={`flex ${rtl ? 'flex-row-reverse' : 'flex-row'} gap-4`}>
        <img src="/product.jpg" alt="Product" className="w-20 h-20" />
        <div>
          <h3 className="font-bold">{t('title')}</h3>
          <p className="text-gray-600">{t('description')}</p>
          <button className={getMarginStart(locale as any, '4')}>
            {t('enroll')}
          </button>
        </div>
      </div>
    </div>
  );
}
```

**RTL Features:**
- ✅ Text alignment adapts
- ✅ Flex direction reverses for Arabic
- ✅ Margins flip for RTL
- ✅ Automatic based on locale

---

## Example: Server Component (No 'use client')

```tsx
// app/[locale]/courses/page.tsx
import { useTranslations } from 'next-intl';

export default function CoursesPage() {
  const t = useTranslations('courses');

  return (
    <div>
      <h1>{t('allCourses')}</h1>
      <p>{t('description')}</p>
      {/* Rest of component */}
    </div>
  );
}
```

**Note**: Server components are even simpler - no 'use client' needed!

---

## Quick Reference: Common Replacements

| Before | After | Translation Key |
|--------|-------|----------------|
| `"Home"` | `t('home')` | `common.home` |
| `"Save"` | `t('save')` | `common.save` |
| `"Loading..."` | `t('loading')` | `common.loading` |
| `"Submit"` | `t('submit')` | `common.submit` |
| `"Cancel"` | `t('cancel')` | `common.cancel` |
| `"Email"` | `t('email')` | `forms.email` |
| `"Password"` | `t('password')` | `auth.password` |
| `"Sign In"` | `t('signIn')` | `auth.signIn` |
| `"All Courses"` | `t('allCourses')` | `courses.allCourses` |

---

## Testing Your Migration

After migrating a component, test:

1. **Component renders**: `npm run dev` and check visually
2. **All languages**: Switch between ar, en, de
3. **RTL layout**: Check Arabic layout
4. **Functionality**: All buttons/forms work
5. **No errors**: Check browser console

---

## Next Steps

1. Pick one small component from your app
2. Follow the pattern above
3. Test thoroughly
4. Move to the next component
5. Repeat!

**Remember**: You can migrate incrementally. There's no rush to translate everything at once!
