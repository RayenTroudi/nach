"use client";
import { useEffect, useState, useCallback } from "react";
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

  const onCopyToClipboardHandler = useCallback(() => {
    navigator.clipboard.writeText(data.toString());
    scnToast({
      title: "Copied to clipboard",
      variant: "success",
    });
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }, [data]);
  
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
    </div>
  );
};

export default Preview;
