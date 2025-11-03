"use client";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeProvider";

import { MoonIcon, SunIcon } from "@radix-ui/react-icons";

const ThemeSwitcher = () => {
  const { mode, setMode } = useTheme();
  return (
    <Button
      name="theme-switcher"
      variant="ghost"
      className="ml-2 hover:bg-slate-200/50 dark:hover:bg-slate-900/50 px-2 py-1"
      onClick={() => (mode === "dark" ? setMode("light") : setMode("dark"))}
    >
      {mode === "dark" ? (
        <SunIcon className="size-[20px] flex-shrink" name="sun-icon" />
      ) : (
        <MoonIcon className="size-[20px] flex-shrink " name="moon-icon" />
      )}
    </Button>
  );
};

export default ThemeSwitcher;
