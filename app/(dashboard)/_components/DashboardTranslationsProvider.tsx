"use client";
import { useEffect, useState } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getLocaleFromCookie } from "@/lib/locale-client";

export default function DashboardTranslationsProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<any>(null);
  const [locale, setLocale] = useState<string>("ar");

  useEffect(() => {
    const currentLocale = getLocaleFromCookie();
    setLocale(currentLocale);
    
    import(`@/messages/${currentLocale}.json`).then((msgs) => {
      setMessages(msgs.default);
    });
  }, []);

  if (!messages) {
    return (
      <div className="p-6 w-full flex items-center justify-center">
        <div className="text-slate-950 dark:text-slate-200">Loading...</div>
      </div>
    );
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
