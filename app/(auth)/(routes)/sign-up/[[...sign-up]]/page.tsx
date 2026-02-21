import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SignUpClient from "./SignUpClient";

const SignUpPage = async () => {
  const { userId } = auth();

  // If user is already authenticated, redirect to home
  if (userId) {
    redirect("/");
  }

  return <SignUpClient />;
};

export default SignUpPage;
