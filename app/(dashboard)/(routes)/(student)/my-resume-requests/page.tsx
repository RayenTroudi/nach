import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import MyResumeRequestsClient from "./MyResumeRequestsClient";

const MyResumeRequestsPage = async () => {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <MyResumeRequestsClient serverUserId={userId} />;
};

export default MyResumeRequestsPage;
