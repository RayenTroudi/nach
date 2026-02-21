import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AvailabilityClient from "./AvailabilityClient";

const AvailabilityPage = async () => {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <AvailabilityClient serverUserId={userId} />;
};

export default AvailabilityPage;
