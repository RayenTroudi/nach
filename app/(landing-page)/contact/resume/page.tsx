import { auth } from "@clerk/nextjs/server";
import ResumeRequestClient from "./ResumeRequestClient";

export default async function ResumeRequestPage() {
  const { userId } = auth();

  return <ResumeRequestClient serverUserId={userId} />;
}
