import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import React from "react";
import InitialScreen from "../_components/InitialScreen";
import PageLoader from "../_components/PageLoader";
const DynamicHeader = dynamic(() => import("@/components/shared/Header"), {
  loading: () => <Skeleton className="w-full h-[80px]" />,
});

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <PageLoader />
      <InitialScreen>
        <DynamicHeader />
        <div className="  flex items-center justify-center mt-8">
          {children}
        </div>
      </InitialScreen>
    </>
  );
};

export default AuthLayout;
