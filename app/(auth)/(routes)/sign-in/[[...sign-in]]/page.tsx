import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SignInClient from "./SignInClient";

const SigninPage = async () => {
  const { userId } = auth();

  // If user is already authenticated, redirect to home
  if (userId) {
    redirect("/");
  }

  return <SignInClient />;
};

export default SigninPage;
