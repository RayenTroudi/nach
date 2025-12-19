import { cookies } from 'next/headers';

export type Locale = 'ar' | 'en' | 'de';
export const locales: Locale[] = ['ar', 'en', 'de'];
export const defaultLocale: Locale = 'ar';

const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

export async function getLocale(): Promise<Locale> {
  const cookieStore = cookies();
  const locale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  
  if (locale && locales.includes(locale as Locale)) {
    return locale as Locale;
  }
  
  return defaultLocale;
}

export async function getMessages(locale?: Locale) {
  const currentLocale = locale || await getLocale();
  
  try {
    const messages = await import(`@/messages/${currentLocale}.json`);
    return messages.default;
  } catch (error) {
    console.error(`Failed to load messages for locale: ${currentLocale}`, error);
    // Fallback to default locale
    const fallbackMessages = await import(`@/messages/${defaultLocale}.json`);
    return fallbackMessages.default;
  }
}
