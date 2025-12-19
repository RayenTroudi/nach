'use server';

import { cookies } from 'next/headers';
import { type Locale, locales } from '@/i18n';

const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

export async function setLocale(locale: Locale) {
  if (!locales.includes(locale)) {
    throw new Error(`Invalid locale: ${locale}`);
  }
  
  cookies().set(LOCALE_COOKIE_NAME, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
  });
  
  return { success: true };
}
