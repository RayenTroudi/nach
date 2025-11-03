"use server";
import LeftSideBar from "@/components/shared/LeftSideBar";
import React from "react";
import Card from "@/components/shared/Card";
import { User, BookOpen, DollarSign, GraduationCap } from "lucide-react";
import { getAllPublishedCourses } from "@/lib/actions";
import { redirect } from "next/navigation";
import BestSellerChart from "./_components/BestSellerChart";
import RegistrationChart from "./_components/RegistrationChart";
import BestSellingCourse from "./_components/BestSellingCourse";

const page = async () => {
  let courses;
  try {
    courses = await getAllPublishedCourses();
    console.log("the courses are", courses);
  } catch (error) {
    console.log(error);
    return redirect("/admin/statistics");
  }

  const totalUsers = new Set(
    courses.flatMap((course: any) =>
      course.students.map((student: any) => student._id)
    )
  ).size;

  const totalInstructors = new Set(
    courses.map((course: any) => course.instructor._id)
  ).size;

  const totalCourses = courses.length;

  const platformMonthlyRevenue = courses
    .reduce((total: number, course: any) => {
      return total + course.purchases.length * course.price * 0.1;
    }, 0)
    .toFixed(2);

  const instructorRevenueMap = new Map();
  courses.forEach((course: any) => {
    const instructorId = course.instructor._id;
    const revenue = course.purchases.length * course.price;
    if (instructorRevenueMap.has(instructorId)) {
      instructorRevenueMap.set(
        instructorId,
        instructorRevenueMap.get(instructorId) + revenue
      );
    } else {
      instructorRevenueMap.set(instructorId, revenue);
    }
  });

  const top5BestSellingInstructors = Array.from(instructorRevenueMap.entries())
    .map(([instructorId, revenue]) => {
      const instructor = courses.find(
        (course: any) => course.instructor._id === instructorId
      ).instructor;
      return { ...instructor, revenue };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="flex flex-col md:flex-row">
      <LeftSideBar />
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">Admin Statistics</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card
            label={"Total Users"}
            icon={GraduationCap}
            amount={totalUsers.toString()}
          />
          <Card
            label={"Total Instructors"}
            icon={User}
            amount={totalInstructors.toString()}
          />
          <Card
            label={"Total Courses"}
            icon={BookOpen}
            amount={totalCourses.toString()}
          />
          <Card
            label={"Platform Monthly Revenue"}
            icon={DollarSign}
            amount={`$${platformMonthlyRevenue}`}
          />
        </div>

        <div className="ml-8">
          <BestSellerChart data={top5BestSellingInstructors} />
        </div>

        <div className="mt-8">
          <RegistrationChart />
        </div>
        <div className="ml-8 mt-11">
          <BestSellingCourse courses={courses} />
        </div>
      </div>
    </div>
  );
};

export default page;
