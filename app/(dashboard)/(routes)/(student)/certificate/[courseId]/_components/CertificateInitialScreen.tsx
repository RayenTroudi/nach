"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { TCourse, TUser, TUserProgress } from "@/types/models.types";
import React, { useRef } from "react";
import Certificate from "./Certificate";
import { Course } from "@/components/shared";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRouter } from "next/navigation";

type Props = {
  user: TUser;
  course: TCourse;
  userProgress: TUserProgress;
};

const CertificateInitialScreen = ({ user, course, userProgress }: Props) => {
  const router = useRouter();
  const certificateRef = useRef<HTMLDivElement>(null);

  const onDownloadCertificate = async () => {
    const canvas = await html2canvas(certificateRef.current!);
    const imageData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("l", "px", [1000, 670]);
    pdf.addImage(imageData, "PNG", 0, 0, 1000, 667);

    pdf.save(
      `WELEARN_PLATFORM_${course.title}_${user.username}_CERTIFICATE.pdf`
    );
  };
  return (
    <div className="w-[90%] py-16 mx-auto flex flex-col gap-4 md:flex-row">
      <div className="  w-full md:w-[360px] h-calc(100vh-80px) flex flex-col gap-y-6 ">
        <h2 className="text-xl md:text-2xl font-semibold bg-black text-white dark:bg-white dark:text-black px-4 py-3">
          Certificate Recipient:
        </h2>
        <div className="flex gap-x-2">
          <Avatar className="size-14 border">
            <AvatarImage src={user.picture!} alt={user.username} />
            <AvatarFallback>
              <Skeleton />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-y-1">
            <p className="text-lg font-bold">
              {" "}
              {user.username || `${user.firstName} ${user.lastName}`}{" "}
            </p>
            <span className="text-slate-500 dark:text-slate-400 text-sm">
              {" "}
              {user.email}{" "}
            </span>
          </div>
        </div>
        <h2 className="text-xl md:text-2xl font-semibold  bg-black text-white dark:bg-white dark:text-black px-4 py-3">
          About The Course:
        </h2>
        <Course
          course={course}
          withFramerMotionAnimation={false}
          showWishlistHeart={false}
          className="!pointer-events-none !rounded-none"
        />
        {userProgress.isCompleted ? (
          <Button
            onClick={onDownloadCertificate}
            className="rounded-none bg-black text-white dark:bg-white dark:text-black flex items-center justify-center gap-2"
          >
            <Download size={16} />
            <span>Download Certificate</span>
          </Button>
        ) : null}
      </div>
      {userProgress.isCompleted ? (
        <Certificate
          user={user}
          course={course}
          certificateRef={certificateRef}
        />
      ) : (
        <div className="h-calc(100vh-80px)  flex-1   flex items-center pt-20 flex-col gap-y-10">
          <h1 className="text-center  font-bold text-3xl">
            You need to complete all the lectures in order to download the
            certificate
          </h1>
          <p className="w-[90%] text-slate-500 text-xl font-light text-center mx-auto">
            Once you have completed the course, you can download the certificate
            from the course page, by clicking the download certificate button
          </p>

          <Button
            onClick={() => router.push(`/my-learning/${course._id}`)}
            className="bg-primaryColor hover:bg-primaryColor text-slate-50 rounded-none w-full md:w-[60%] mx-auto"
          >
            Go Back to Course
          </Button>
        </div>
      )}
    </div>
  );
};

export default CertificateInitialScreen;
