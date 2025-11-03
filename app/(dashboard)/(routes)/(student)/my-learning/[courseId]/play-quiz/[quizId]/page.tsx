import { getQuizById } from "@/lib/actions/quiz.action";
import { TQuiz, TUser } from "@/types/models.types";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { InitialScreen } from "./_components";
import { getUserByClerkId } from "@/lib/actions";

const PlayCourseQuizIdPage = async ({
  params,
}: {
  params: { quizId: string };
}) => {
  const { userId } = auth();

  if (!userId) return redirect("/sign-in");

  let quiz: TQuiz = {} as TQuiz;
  let user: TUser = {} as TUser;
  try {
    user = await getUserByClerkId({ clerkId: userId! });
    quiz = await getQuizById(params.quizId);
  } catch (error: any) {}

  return <InitialScreen quiz={quiz} student={user} />;
};

export default PlayCourseQuizIdPage;
