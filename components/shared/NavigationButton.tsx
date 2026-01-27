"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Spinner from "./Spinner";

interface NavigationButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export default function NavigationButton({
  href,
  children,
  className,
  size = "default",
  variant = "default",
}: NavigationButtonProps) {
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    setIsNavigating(true);
    router.push(href);
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isNavigating}
      size={size}
      variant={variant}
      className={className}
    >
      {isNavigating ? (
        <Spinner size={20} />
      ) : (
        children
      )}
    </Button>
  );
}
