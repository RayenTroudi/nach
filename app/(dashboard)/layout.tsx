import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import React from "react";
import InitialScreen from "../_components/InitialScreen";
import PageLoader from "../_components/PageLoader";

const Header = dynamic(() => import("@/components/shared/Header"), {
  loading: () => <Skeleton className="w-full h-[80px]" />,
});

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <PageLoader />

      <InitialScreen>
        <Header />
        {children}
      </InitialScreen>
    </>
  );
};

export default DashboardLayout;
