"use client";

import { useLocale } from 'next-intl';
import { ReactNode } from 'react';

interface HeaderWrapperProps {
  children: ReactNode;
  onLocaleChange?: (locale: string, isRTL: boolean) => void;
}

export function HeaderWrapper({ children }: HeaderWrapperProps) {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return (
    <div className={isRTL ? 'rtl' : 'ltr'} dir={isRTL ? 'rtl' : 'ltr'}>
      {children}
    </div>
  );
}
