// Clerk localization using official @clerk/localizations package
// Ref: https://clerk.com/docs/components/customization/localization
import { deDE, arSA } from "@clerk/localizations";

// English (US) is the default, no need to import

// We can extend the official localizations with custom translations
export const clerkLocalizationDeDE = {
  ...deDE,
  userButton: {
    ...(deDE.userButton || {}),
    action__signOut: "Abmelden",
  },
};

export const clerkLocalizationArSA = {
  ...arSA,
  userButton: {
    ...(arSA.userButton || {}),
    action__signOut: "تسجيل الخروج",
  },
};

// English is the default, we'll return undefined to let Clerk use its built-in English
export const clerkLocalizationEnUS = {
  userButton: {
    action__signOut: "Sign out",
  },
};

export const clerkLocalizations = {
  "en-US": clerkLocalizationEnUS,
  "de-DE": clerkLocalizationDeDE,
  "ar-SA": clerkLocalizationArSA,
} as const;

export type ClerkLocale = keyof typeof clerkLocalizations;

export function getClerkLocalization(locale: string) {
  // Map common locale codes to Clerk's expected format
  const localeMap: Record<string, ClerkLocale> = {
    "en": "en-US",
    "de": "de-DE",
    "ar": "ar-SA",
  };
  
  const normalizedLocale = (localeMap[locale] || "en-US") as ClerkLocale;
  return clerkLocalizations[normalizedLocale];
}
