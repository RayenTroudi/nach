/**
 * Type definitions for next-intl translations
 * This provides autocomplete and type safety for translation keys
 */

type Messages = typeof import('../messages/ar.json');

declare global {
  // Use type safe message keys with `next-intl`
  interface IntlMessages extends Messages {}
}
