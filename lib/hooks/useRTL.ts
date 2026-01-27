import { useLocale } from 'next-intl';

/**
 * Hook to get RTL-aware margin classes
 * @returns Object with helper functions for RTL-aware spacing
 */
export function useRTL() {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return {
    isRTL,
    locale,
    /**
     * Get margin-right for LTR, margin-left for RTL
     * @param size - Tailwind spacing size (e.g., '2', '4', '6')
     */
    mr: (size: string) => isRTL ? `ml-${size}` : `mr-${size}`,
    /**
     * Get margin-left for LTR, margin-right for RTL
     * @param size - Tailwind spacing size (e.g., '2', '4', '6')
     */
    ml: (size: string) => isRTL ? `mr-${size}` : `ml-${size}`,
  };
}

/**
 * Get RTL-aware margin class based on locale
 * @param locale - Current locale
 * @param side - 'r' for right or 'l' for left
 * @param size - Tailwind spacing size
 */
export function getRTLMargin(locale: string, side: 'r' | 'l', size: string): string {
  const isRTL = locale === 'ar';
  
  if (side === 'r') {
    return isRTL ? `ml-${size}` : `mr-${size}`;
  } else {
    return isRTL ? `mr-${size}` : `ml-${size}`;
  }
}
