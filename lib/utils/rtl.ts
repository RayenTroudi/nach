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

/**
 * Hook to use RTL status (client-side)
 */
export function useRTL(): boolean {
  const { useLocale } = require('next-intl');
  const locale = useLocale();
  return isRTL(locale);
}

/**
 * Get icon rotation for RTL (for directional icons like arrows)
 */
export function getIconRotation(locale: Locale, shouldFlip: boolean = true): string {
  if (!shouldFlip) return '';
  return isRTL(locale) ? 'rotate-180' : '';
}

/**
 * Get border side class for RTL
 */
export function getBorderStart(locale: Locale, width: string = '2'): string {
  return isRTL(locale) ? `border-r-${width}` : `border-l-${width}`;
}

export function getBorderEnd(locale: Locale, width: string = '2'): string {
  return isRTL(locale) ? `border-l-${width}` : `border-r-${width}`;
}

/**
 * Get positioning class for RTL (for absolute/fixed elements)
 */
export function getPositionStart(locale: Locale, value: string): string {
  return isRTL(locale) ? `right-${value}` : `left-${value}`;
}

export function getPositionEnd(locale: Locale, value: string): string {
  return isRTL(locale) ? `left-${value}` : `right-${value}`;
}

/**
 * Conditional RTL class helper
 */
export function rtlClass(ltrClass: string, rtlClass: string, locale: Locale): string {
  return isRTL(locale) ? rtlClass : ltrClass;
}

/**
 * Get transform-origin for RTL-aware animations
 */
export function getTransformOrigin(locale: Locale, ltrOrigin: string, rtlOrigin: string): string {
  return isRTL(locale) ? rtlOrigin : ltrOrigin;
}

/**
 * Convert physical properties to logical properties (for Tailwind CSS)
 * This is a migration helper - prefer using logical properties directly
 */
export function toLogicalClass(className: string): string {
  return className
    .replace(/\bml-/g, 'ms-')
    .replace(/\bmr-/g, 'me-')
    .replace(/\bpl-/g, 'ps-')
    .replace(/\bpr-/g, 'pe-')
    .replace(/\b-ml-/g, '-ms-')
    .replace(/\b-mr-/g, '-me-')
    .replace(/\b-pl-/g, '-ps-')
    .replace(/\b-pr-/g, '-pe-');
}
