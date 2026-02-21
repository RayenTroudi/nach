import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import MyProofsClient from "./MyProofsClient";

const MyPaymentProofsPage = async () => {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <MyProofsClient serverUserId={userId} />;
};

export default MyPaymentProofsPage;
