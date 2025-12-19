export type Locale = 'ar' | 'en' | 'de';
export const locales: Locale[] = ['ar', 'en', 'de'];
export const defaultLocale: Locale = 'ar';

export function getLocaleFromCookie(): Locale {
  if (typeof document === 'undefined') return defaultLocale;
  
  const cookies = document.cookie.split(';');
  const localeCookie = cookies.find(c => c.trim().startsWith('NEXT_LOCALE='));
  
  if (localeCookie) {
    const locale = localeCookie.split('=')[1];
    if (locales.includes(locale as Locale)) {
      return locale as Locale;
    }
  }
  
  return defaultLocale;
}
