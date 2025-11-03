import QueryProvider from "@/components/providers/QueryProvider";
import { Footer } from "@/components/shared";
const DynamicHeader = dynamic(() => import("@/components/shared/Header"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-[80px]" />,
});
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import React from "react";
import InitialScreen from "../_components/InitialScreen";
import PageLoader from "../_components/PageLoader";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <PageLoader />
      <InitialScreen>
        <DynamicHeader />
        <QueryProvider>{children}</QueryProvider>
        <Footer />
      </InitialScreen>
    </>
  );
};

export default RootLayout;
