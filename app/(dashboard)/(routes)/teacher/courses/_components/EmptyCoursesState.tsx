"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import NoCoursesAnimation from "@/components/shared/animations/NoCourses";
import { PlusCircle } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "next/navigation";

interface EmptyCoursesStateProps {
  username: string;
}

export function EmptyCoursesState({ username }: EmptyCoursesStateProps) {
  const t = useTranslations("teacher.courses");
  const locale = useLocale();
  const pathname = usePathname();
  
  const pathnameHasLocale = pathname.startsWith('/ar/') || pathname.startsWith('/en/') || pathname.startsWith('/de/');
  const href = pathnameHasLocale ? `/${locale}/teacher/courses/manage` : '/teacher/courses/manage';

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="w-full p-4 border border-input rounded-md flex justify-center items-center">
        <div className="flex flex-col justify-center items-center gap-y-3">
          <h1 className="text-3xl font-bold text-slate-950 dark:text-slate-200 text-center">
            {t('greeting')}{" "}
            <span className="text-brand-red-500"> {username} </span>
          </h1>
          <p className="text-md lg:text-lg text-slate-700 dark:text-slate-300 text-center">
            {t('startCreating')}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-y-2">
        <NoCoursesAnimation />
        <Link
          href={href}
          className="w-full flex items-center justify-center"
        >
          <Button className="w-full  md:w-[400px] flex items-center gap-x-2 h-[48px] bg-brand-red-500 font-semibold hover:bg-brand-red-600 opacity-90 hover:opacity-100 text-slate-50">
            <PlusCircle size={20} className="text-slate-50" />
            <p className="">{t('createNewCourse')}</p>
          </Button>
        </Link>
      </div>
    </div>
  );
}
