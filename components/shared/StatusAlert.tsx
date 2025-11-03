import React from "react";
import { Alert, AlertDescription } from "../ui/alert";
import { ExclamationTriangleIcon, RocketIcon } from "@radix-ui/react-icons";
import { CourseStatusEnum } from "@/lib/models/course.model";
import Banner from "./Banner";

const StatusAlert = ({ status }: { status: string }) => {
  return (
    <>
      {status === CourseStatusEnum.Draft ? (
        <Banner
          label=" Whether you're updating an existing course or creating a new
            one, it will be unpublished until you submit it for review and the
            changes are approved."
          variant="info"
        />
      ) : null}
      {status === CourseStatusEnum.Pending ? (
        <Banner
          label="Your course has been submitted for review. You will be notified
            about the status within 24 to 48 hours. Thank you for your patience."
          variant={"warning"}
        />
      ) : null}

      {status === CourseStatusEnum.Rejected ? (
        <Banner
          label="Your course submission has been reviewed and unfortunately, it did
            not meet our guidelines. Please revise and resubmit. Thank you for
            your understanding."
          variant={"destructive"}
        />
      ) : null}
      {status === CourseStatusEnum.Approved ? (
        <Banner
          label=" Your course has been reviewed and approved. You can now publish it and make it available for students."
          variant={"success"}
        />
      ) : null}
    </>
  );
};

export default StatusAlert;
