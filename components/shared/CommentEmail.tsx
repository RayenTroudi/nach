import React from "react";
import parse from "html-react-parser";

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
} from "@react-email/components";
import { CourseStatusEnum } from "@/lib/enums";
import { TComment, TCourse, TUser } from "@/types/models.types";
import Preview from "./editor/Preview";

interface Props {
  user: TUser;
  course: TCourse;
  comment: TComment;
  mode: string;
}

export const CommentEmail = ({ user, course, comment, mode }: Props) => {
  return (
    <Tailwind
      config={{
        theme: {
          extend: {
            colors: {
              brand: "#DD0000",
            },
          },
        },
      }}
    >
      <Html>
        <Head>
          <title>GermanPath Platform</title>
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
                <Column
                  className={`${
                    mode === "dark" ? "text-slate-50" : "text-slate-950"
                  } text-[14px]`}
                >
                  <span className="text-brand-red-500 font-bold">
                    {user.username}
                  </span>{" "}
                  has commented on your
                  <span className="text-brand-red-500 font-bold ">
                    {" "}
                    {course.title}{" "}
                  </span>
                  course{" "}
                </Column>
              </Row>
            </Row>
            <Text
              className={`${
                mode === "dark" ? "text-slate-300" : "text-slate-700"
              } text-[16px] font-bold`}
            >
              {comment.title}
            </Text>

            {comment.content ? (
              <CodeBlock
                code={comment.content.replace(
                  /<pre[^>]*>|<\/pre>|<code[^>]*>|<\/code>/g,
                  ""
                )}
                lineNumbers
                theme={dracula}
                language="javascript"
              />
            ) : null}

            <Button
              href={`${process.env.NEXT_PUBLIC_SERVER_URL}/teacher/courses/manage/${course._id}`}
              className="bg-brand w-full py-3 font-bold leading-4 text-slate-200 text-center rounded-sm"
            >
              Reply to comment
            </Button>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
};

export default CommentEmail;
