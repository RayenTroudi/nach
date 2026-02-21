import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import MyResumeClient from "./MyResumeClient";

const MyResumePage = async () => {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <MyResumeClient serverUserId={userId} />;
};

export default MyResumePage;
