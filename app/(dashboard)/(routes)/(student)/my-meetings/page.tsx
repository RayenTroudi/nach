import { LeftSideBar } from "@/components/shared";
import React from "react";
import { auth } from "@clerk/nextjs/server";
import MyMeetings from "@/components/shared/MyMeetings";
import { redirect } from "next/navigation";
import { getUserBookings } from "@/lib/actions/booking.action";

const MyMeetingsPage = async () => {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const result = await getUserBookings();
  const userBookings = result.success ? result.bookings : [];
  
  return (
    <div className="flex gap-4">
      <LeftSideBar />
      <div className="p-6 w-full">
        <div className="flex flex-col items-start gap-6">
          <MyMeetings bookings={userBookings} />
        </div>
      </div>
    </div>
  );
};
    </div>
  );
};

export default MyMeetingsPage;
