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
import { CourseStatusEnum } from "@/lib/models/course.model";
import { TComment, TCourse, TReply } from "@/types/models.types";
import Preview from "./editor/Preview";

interface Props {
  comment: TComment;
  course: TCourse;
  reply: TReply;
  mode: string;
}

export const ReplyToCommentEmail = ({
  comment,
  course,
  reply,
  mode,
}: Props) => {
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
          <title>GermanPath Platform</title>
        </Head>

        <Body className={`w-full`}>
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
            <Row className="mb-4 w-full">
              <Column className="text-slate-500 font-normal text-md">
                Hey {comment.user.username} !
              </Column>
            </Row>

            <Row
              className={`${
                mode === "dark" ? "text-slate-300" : "text-slate-700"
              } text-lg w-full`}
            >
              <Row className="w-full">
                <Text
                  className={`${
                    mode === "dark" ? "text-slate-400" : "text-slate-600"
                  } text-[14px]`}
                >
                  {reply.owner.username} replied to your comment
                </Text>
              </Row>

              <Row className="w-full">
                <Text className={`text-slate-400 text-[16px] font-bold`}>
                  Comment
                </Text>
              </Row>

              <Row className="w-full">
                <Text
                  className={`${
                    mode === "dark" ? "text-slate-300" : "text-slate-800"
                  } text-[14px] font-bold`}
                >
                  {comment.title}
                </Text>
              </Row>
            </Row>

            <Row className="w-full">
              <Text className={`text-slate-400 text-[16px] font-bold`}>
                Reply
              </Text>
            </Row>

            <Text
              className={`${
                mode === "dark" ? "text-slate-300" : "text-slate-700"
              } text-[16px] font-bold`}
            >
              {reply.title}
            </Text>

            {reply.content ? (
              <CodeBlock
                code={reply.content.replace(
                  /<pre[^>]*>|<\/pre>|<code[^>]*>|<\/code>/g,
                  ""
                )}
                lineNumbers
                theme={dracula}
                language="javascript"
              />
            ) : null}

            <Button
              href={`${process.env.NEXT_PUBLIC_SERVER_URL}/my-learning/${course._id}`}
              className="bg-brand w-full py-3 font-bold leading-4 text-slate-200 text-center rounded-sm"
            >
              Go see other replies
            </Button>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
};

export default ReplyToCommentEmail;
