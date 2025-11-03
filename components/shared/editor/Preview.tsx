"use client";
import { useEffect, useState } from "react";
import Prism from "prismjs";
import parse from "html-react-parser";

import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-aspnet";
import "prismjs/components/prism-sass";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-solidity";
import "prismjs/components/prism-json";
import "prismjs/components/prism-dart";
import "prismjs/components/prism-ruby";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-r";
import "prismjs/components/prism-kotlin";
import "prismjs/components/prism-go";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-mongodb";
import "prismjs/plugins/line-numbers/prism-line-numbers.js";
import "prismjs/plugins/line-numbers/prism-line-numbers.css";
import { Button } from "@/components/ui/button";
import { CheckIcon, ClipboardIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { scnToast } from "@/components/ui/use-toast";

interface Props {
  data: string;
}

const Preview = ({ data }: Props) => {
  const [copied, setCopied] = useState<boolean>(false);

  const onCopyToClipboardHandler = () => {
    navigator.clipboard.writeText(data.toString());
    scnToast({
      title: "Copied to clipboard",
      variant: "success",
    });
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  useEffect(() => {
    Prism.highlightAll();
  }, []);

  useEffect(() => {
    const handleCopy = (e: KeyboardEvent) => {
      if (e.key === "c" && e.ctrlKey) {
        onCopyToClipboardHandler();
      }
    };

    window.addEventListener("keydown", handleCopy);
    return () => window.removeEventListener("keydown", handleCopy);
  }, [onCopyToClipboardHandler]);
  return (
    <div className="relative">
      {parse(data)}

      <Button
        className={cn(
          "absolute top-2 right-2 size-8 bg-transparent border-2 border-input hover:bg-gray-500 dark:hover:bg-input rounded-lg transition-all duration-300 ease-in-out",
          copied &&
            "bg-[#065f46] pointer-events-none text-slate-50 hover:bg-[#065f46] border-[#065f46]"
        )}
        onClick={onCopyToClipboardHandler}
      >
        {copied ? (
          <CheckIcon className="flex-shrink-0 size-5 text-slate-50" />
        ) : (
          <ClipboardIcon className="flex-shrink-0 size-4 text-slate-50" />
        )}
      </Button>
    </div>
  );
};

export default Preview;
