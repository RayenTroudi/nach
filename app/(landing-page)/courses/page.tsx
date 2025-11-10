import { Metadata } from "next";
import CoursesContent from "./_components";

export const metadata: Metadata = {
  title: "All Courses | Germany Formation",
  description: "Explore all our courses to help you succeed in Germany. From language learning to career preparation.",
};

export default function CoursesPage() {
  return <CoursesContent />;
}
