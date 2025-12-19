/**
 * Utility functions for RTL (Right-to-Left) support
 */

import { Locale } from '@/i18n';

/**
 * Check if a locale uses RTL text direction
 */
export function isRTL(locale: Locale): boolean {
  return locale === 'ar';
}

/**
 * Get text direction for a locale
 */
export function getDirection(locale: Locale): 'rtl' | 'ltr' {
  return isRTL(locale) ? 'rtl' : 'ltr';
}

/**
 * Get text alignment based on locale
 * For RTL: right alignment, for LTR: left alignment
 */
export function getTextAlign(locale: Locale): 'text-right' | 'text-left' {
  return isRTL(locale) ? 'text-right' : 'text-left';
}

/**
 * Get flex direction class based on locale
 * For RTL: reverse direction, for LTR: normal direction
 */
export function getFlexDirection(locale: Locale, reverse?: boolean): string {
  const shouldReverse = isRTL(locale) !== !!reverse;
  return shouldReverse ? 'flex-row-reverse' : 'flex-row';
}

/**
 * Get margin/padding start class based on locale
 */
export function getMarginStart(locale: Locale, size: string): string {
  return isRTL(locale) ? `mr-${size}` : `ml-${size}`;
}

export function getMarginEnd(locale: Locale, size: string): string {
  return isRTL(locale) ? `ml-${size}` : `mr-${size}`;
}

export function getPaddingStart(locale: Locale, size: string): string {
  return isRTL(locale) ? `pr-${size}` : `pl-${size}`;
}

export function getPaddingEnd(locale: Locale, size: string): string {
  return isRTL(locale) ? `pl-${size}` : `pr-${size}`;
}

/**
 * Get border radius classes for RTL
 */
export function getBorderRadiusStart(locale: Locale, size: string): string {
  return isRTL(locale) 
    ? `rounded-r-${size}` 
    : `rounded-l-${size}`;
}

export function getBorderRadiusEnd(locale: Locale, size: string): string {
  return isRTL(locale) 
    ? `rounded-l-${size}` 
    : `rounded-r-${size}`;
}
