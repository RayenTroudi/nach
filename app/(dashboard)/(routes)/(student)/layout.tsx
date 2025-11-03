import { Footer } from "@/components/shared";
import React from "react";

const StudentLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <Footer />
    </>
  );
};

export default StudentLayout;
