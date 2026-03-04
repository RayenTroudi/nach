import { auth } from "@clerk/nextjs/server";
import DocumentsClient from "./DocumentsClient";

export default async function DocumentsPage() {
  const { userId } = auth();
  const isSignedIn = !!userId;

  return <DocumentsClient isSignedIn={isSignedIn} />;
}
