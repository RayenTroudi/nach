import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import React, { Suspense } from "react";
import InitialScreen from "../_components/InitialScreen";

export const dynamic = "force-dynamic";

const DynamicHeader = dynamic(() => import("@/components/shared/Header"), {
  loading: () => <Skeleton className="w-full h-[80px]" />,
  ssr: true,
});

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <InitialScreen>
      <DynamicHeader />
      <Suspense fallback={
        <div className="flex items-center justify-center mt-8 min-h-[500px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red-500"></div>
        </div>
      }>
        <div className="flex items-center justify-center mt-8">
          {children}
        </div>
      </Suspense>
    </InitialScreen>
  );
};

export default AuthLayout;
