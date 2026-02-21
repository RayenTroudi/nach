import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import MyConsultationsClient from "./MyConsultationsClient";

const MyConsultationsPage = async () => {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <MyConsultationsClient serverUserId={userId} />;
};

export default MyConsultationsPage;
