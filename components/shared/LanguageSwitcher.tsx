"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setLocale } from "@/lib/actions/locale.action";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Languages, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const languages = [
  { code: 'ar', name: 'العربية', nativeName: 'العربية' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'de', name: 'Deutsch', nativeName: 'Deutsch' },
];

export function LanguageSwitcher() {
  const router = useRouter();
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const [currentLocale, setCurrentLocale] = useState(locale || 'ar');

  useEffect(() => {
    setCurrentLocale(locale || 'ar');
  }, [locale]);

  const handleLocaleChange = (newLocale: string) => {
    if (newLocale === currentLocale) return;
    
    startTransition(async () => {
      await setLocale(newLocale as 'ar' | 'en' | 'de');
      setCurrentLocale(newLocale);
      // Force a hard refresh to reload all translations
      window.location.reload();
    });
  };

  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          name="language-switcher"
          variant="ghost"
          className={cn(
            "ml-2 hover:bg-slate-200/50 dark:hover:bg-slate-900/50 px-3 py-2 transition-all",
            isPending && "opacity-50 cursor-not-allowed"
          )}
          disabled={isPending}
        >
          <Languages className="w-[18px] h-[18px] mr-1.5" />
          <span className="text-sm font-medium uppercase tracking-wider">
            {currentLanguage.code}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end"
        sideOffset={8}
        className="w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg rounded-lg p-1"
      >
        {languages.map((language) => {
          const isActive = language.code === currentLocale;
          return (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLocaleChange(language.code)}
              className={cn(
                "flex items-center justify-between gap-2 cursor-pointer rounded-md px-3 py-2 my-0.5 transition-all",
                isActive 
                  ? "bg-brand-red-50 dark:bg-brand-red-950/30 text-brand-red-600 dark:text-brand-red-400" 
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              )}
            >
              <div className="flex items-center gap-2 flex-1">
                <span className="text-xs font-bold uppercase tracking-wider min-w-[24px]">
                  {language.code}
                </span>
                <span className={cn(
                  "text-sm font-medium",
                  isActive && "font-semibold"
                )}>
                  {language.nativeName}
                </span>
              </div>
              {isActive && (
                <Check className="w-3.5 h-3.5 flex-shrink-0" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LanguageSwitcher;

