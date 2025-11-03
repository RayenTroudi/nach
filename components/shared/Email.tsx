import {
  Body,
  Html,
  Container,
  Tailwind,
  Text,
  Button,
  Img,
  Link,
  Heading,
  Head,
  Row,
  Column,
  CodeBlock,
  dracula,
  CodeInline,
} from "@react-email/components";
import { CourseStatusEnum } from "@/lib/models/course.model";
import { TCourse } from "@/types/models.types";

export const Email = ({
  status,
  course,
  message,
  mode,
}: {
  status: string;
  course: TCourse;
  message: string;
  mode: string;
}) => {
  return (
    <Tailwind
      config={{
        theme: {
          extend: {
            colors: {
              brand: "#FF782D",
            },
          },
        },
      }}
    >
      <Html>
        <Head>
          <title>Welearn Platform</title>
        </Head>

        <Body className={`w-full `}>
          <Container
            className={`w-full  p-8 shadow-lg rounded-lg flex flex-col gap-20 items-start border-[2px] border-input ${
              mode === "dark"
                ? "bg-slate-950 text-slate-200"
                : "bg-slate-100 text-slate-950"
            }`}
          >
            <Heading className="w-full flex items-center justify-between">
              <Link
                href="https://welearn-elearning-platform.vercel.app/"
                className="flex items-center gap-x-0.5 "
              >
                <Row
                  className={`text-2xl  font-bold ${
                    mode === "dark" ? "text-slate-200" : "text-slate-900"
                  }`}
                >
                  <Column
                    className={`mr-0.5 ${
                      mode === "dark" ? "text-slate-200" : "text-slate-950"
                    }`}
                  >
                    We
                  </Column>
                  <Column className="text-brand text-3xl mt-0.5">l</Column>
                  <Column
                    className={` ${
                      mode === "dark" ? "text-slate-200" : "text-slate-950"
                    }`}
                  >
                    earn
                  </Column>
                </Row>
              </Link>
            </Heading>
            <Row className="mb-4">
              <Column className="text-slate-500 font-normal text-md">
                Hey {course.instructor.username} !
              </Column>
            </Row>
            <Row className="w-full my-2">
              <Img
                src={course.thumbnail!}
                alt="course-thumbnail"
                className="w-full h-60 rounded-md object-cover"
              />
            </Row>
            <Row
              className={`${
                mode === "dark" ? "text-slate-300" : "text-slate-700"
              } text-lg`}
            >
              <Row className="w-full">
                <Column className=" font-bold text-brand">
                  {course.title}
                </Column>
              </Row>
              <Row className="w-full">
                <Column
                  className={`font-semibold ${
                    mode === "dark" ? "text-slate-200" : "text-slate-900"
                  }`}
                >
                  Course has been {status[0].toUpperCase() + status.slice(1)}
                </Column>
              </Row>
            </Row>
            <Text
              className={`${
                mode === "dark" ? "text-slate-300" : "text-slate-700"
              } text-[16px]`}
            >
              {message}
            </Text>
            <Button
              href={`${process.env.NEXT_PUBLIC_SERVER_URL}/teacher/courses/manage/${course._id}`}
              className="bg-brand w-full py-3 font-bold leading-4 text-slate-200 text-center rounded-sm"
            >
              {status === CourseStatusEnum.Approved
                ? "Publish Your Course"
                : "Edit Your Course"}
            </Button>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
};

export default Email;
