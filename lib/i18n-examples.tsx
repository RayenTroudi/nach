/**
 * Progressive i18n Adoption Guide
 * 
 * This file demonstrates how to safely adopt translations in your components
 * without breaking existing functionality.
 * 
 * NOTE: This file contains multiple independent examples and is for
 * documentation/reference purposes only. Each example section is standalone
 * and would normally be in its own file. Do NOT import this file directly.
 */

// ============================================================================
// EXAMPLE 1: Server Component (Recommended for new components)
// ============================================================================

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

export function ServerComponentExample() {
  const t = useTranslations('common');
  
  return (
    <div>
      <h1>{t('welcome')}</h1>
      <button>{t('save')}</button>
      <button>{t('cancel')}</button>
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: Client Component
// ============================================================================

'use client';

export function ClientComponentExample() {
  const t = useTranslations('navigation');
  
  return (
    <nav>
      <a href="/">{t('home')}</a>
      <a href="/courses">{t('courses')}</a>
      <a href="/dashboard">{t('dashboard')}</a>
    </nav>
  );
}

// ============================================================================
// EXAMPLE 3: Progressive Migration - Keeping Old Component Working
// ============================================================================

'use client';

interface ButtonProps {
  label?: string; // Keep existing prop for backward compatibility
  translationKey?: string; // New optional prop for translations
  onClick?: () => void;
}

export function BackwardCompatibleButton({ 
  label, 
  translationKey,
  onClick 
}: ButtonProps) {
  const t = useTranslations('common');
  
  // Use translation if provided, otherwise fallback to label prop
  const displayText = translationKey ? t(translationKey as any) : label;
  
  return <button onClick={onClick}>{displayText}</button>;
}

// Usage examples:
// Old way still works: <BackwardCompatibleButton label="Save" />
// New way with translations: <BackwardCompatibleButton translationKey="save" />

// ============================================================================
// EXAMPLE 4: Using Multiple Translation Namespaces
// ============================================================================

export function MultiNamespaceExample() {
  const tCommon = useTranslations('common');
  const tAuth = useTranslations('auth');
  const tCourses = useTranslations('courses');
  
  return (
    <div>
      <h1>{tCommon('welcome')}</h1>
      <button>{tAuth('signIn')}</button>
      <p>{tCourses('allCourses')}</p>
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: With Default Values (Fallback)
// ============================================================================

'use client';

export function SafeFallbackExample() {
  const t = useTranslations('common');
  
  // If translation key doesn't exist, it will show the key itself
  // You can also provide a fallback in your translation files
  
  return (
    <div>
      <h1>{t('welcome')}</h1>
      {/* If 'nonExistentKey' doesn't exist, it shows 'nonExistentKey' */}
      <p>{t('nonExistentKey')}</p>
    </div>
  );
}

// ============================================================================
// EXAMPLE 6: Getting Current Locale
// ============================================================================

'use client';

import { isRTL } from '@/lib/utils/rtl';

export function LocaleAwareComponent() {
  const locale = useLocale();
  const rtl = isRTL(locale as any);
  
  return (
    <div className={rtl ? 'text-right' : 'text-left'}>
      <p>Current locale: {locale}</p>
      <p>Is RTL: {rtl ? 'Yes' : 'No'}</p>
    </div>
  );
}

// ============================================================================
// EXAMPLE 7: Language Switcher Component
// ============================================================================

'use client';

import { usePathname, useRouter } from 'next/navigation';
import { locales, type Locale } from '@/i18n';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  
  const handleLocaleChange = (newLocale: Locale) => {
    // Remove current locale from pathname if it exists
    const pathnameWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
    
    // Navigate to the new locale
    const newPath = newLocale === 'ar' 
      ? pathnameWithoutLocale // Arabic is default, no prefix needed
      : `/${newLocale}${pathnameWithoutLocale}`;
    
    router.push(newPath);
  };
  
  return (
    <div className="flex gap-2">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleLocaleChange(loc)}
          className={`px-3 py-1 rounded ${
            locale === loc 
              ? 'bg-brand-red-500 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// EXAMPLE 8: Link Component with Locale Support
// ============================================================================

'use client';

import Link from 'next/link';

interface LocalizedLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function LocalizedLink({ href, children, className }: LocalizedLinkProps) {
  const locale = useLocale();
  
  // Add locale prefix only for non-default locales
  const localizedHref = locale === 'ar' ? href : `/${locale}${href}`;
  
  return (
    <Link href={localizedHref} className={className}>
      {children}
    </Link>
  );
}

// Usage:
// <LocalizedLink href="/courses">View Courses</LocalizedLink>
// This will automatically become "/courses" for Arabic or "/en/courses" for English

// ============================================================================
// EXAMPLE 9: Form with Translations
// ============================================================================

'use client';

import { useState } from 'react';

export function TranslatedForm() {
  const t = useTranslations('forms');
  const tCommon = useTranslations('common');
  const [formData, setFormData] = useState({ email: '', message: '' });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Your form submission logic
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

// ============================================================================
// EXAMPLE 10: RTL-Aware Layout Component
// ============================================================================

'use client';

import { getDirection, getMarginStart, getTextAlign } from '@/lib/utils/rtl';

export function RTLAwareLayout({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const direction = getDirection(locale as any);
  
  return (
    <div 
      dir={direction}
      className={getTextAlign(locale as any)}
    >
      {children}
    </div>
  );
}

// ============================================================================
// HOW TO MIGRATE EXISTING COMPONENTS PROGRESSIVELY:
// ============================================================================

/*
STEP 1: Identify a component to migrate
STEP 2: Add 'use client' directive if it's interactive
STEP 3: Import useTranslations at the top
STEP 4: Replace hardcoded strings with translation calls
STEP 5: Test that component still works
STEP 6: Move to next component

IMPORTANT: 
- Don't migrate all components at once
- Start with small, isolated components
- Keep old routes working by maintaining backward compatibility
- Test thoroughly after each migration
*/

// ============================================================================
// MIGRATION CHECKLIST:
// ============================================================================

/*
✅ Translations work in Server Components
✅ Translations work in Client Components  
✅ Old hardcoded strings still work (backward compatible)
✅ RTL layout applies only for Arabic
✅ Language switcher works
✅ Existing routes still accessible
✅ API routes not affected
✅ Authentication flow not changed
*/
