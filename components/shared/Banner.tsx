"use client";
import {
  AlertTriangle,
  CheckCircleIcon,
  RocketIcon,
  XCircle,
} from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const bannerVariants = cva(
  "border text-center p-4 text-sm flex items-center w-full",
  {
    variants: {
      variant: {
        info: "bg-slate-200/80 text-slate-900 font-semibold",
        warning: "bg-yellow-100 border-yellow-200 text-slate-900 font-semibold",
        success: "bg-[#065f46] border-emerald-800 text-slate-200 font-semibold",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

interface Props extends VariantProps<typeof bannerVariants> {
  label: string;
}

const iconMap = {
  warning: AlertTriangle,
  success: CheckCircleIcon,
  destructive: XCircle,
  info: RocketIcon,
};

const Banner = ({ label, variant }: Props) => {
  const Icon = iconMap[variant || "info"];
  return (
    <div className={cn(bannerVariants({ variant }), "")}>
      <Icon className="flex-shrink-0 w-6 h-6 mr-2" />
      <p className="text-md lg:text-lg">{label}</p>
    </div>
  );
};

export default Banner;
