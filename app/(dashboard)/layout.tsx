import { Skeleton } from "@/components/ui/skeleton";
import dynamicImport from "next/dynamic";
import React from "react";
import InitialScreen from "../_components/InitialScreen";
import PageLoader from "../_components/PageLoader";
import DashboardTranslationsProvider from "./_components/DashboardTranslationsProvider";
import ClientDebugMonitor from "@/components/shared/ClientDebugMonitor";

export const dynamic = "force-dynamic";

const Header = dynamicImport(() => import("@/components/shared/Header"), {
  loading: () => <Skeleton className="w-full h-[80px]" />,
});

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <ClientDebugMonitor />
      <PageLoader />

      <InitialScreen>
        <Header />
        <div className="pt-[80px]">
          <DashboardTranslationsProvider>
            {children}
          </DashboardTranslationsProvider>
        </div>
      </InitialScreen>
    </>
  );
};

export default DashboardLayout;
