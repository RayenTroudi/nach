"use server";

import React from "react";
import RevenuePieChart from "./_components/RevenuePieChart";
import MonthlyRevenueBarChart from "./_components/MonthlyRevenueBarChart";
import Card from "@/components/shared/Card";
import { User, DollarSign, BookOpen } from "lucide-react";
import { getTeacherCourses } from "@/lib/actions/user.action";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import CourseRatingBarChart from "./_components/CourseRatingBarChart";
import { getTranslations } from "next-intl/server";

const StatsPage: React.FC = async () => {
  const t = await getTranslations('dashboard.teacher.statistics');
  const { userId } = auth();
  let teacherCourses;
  try {
    if (userId) {
      teacherCourses = await getTeacherCourses({ clerkId: userId });
    }
  } catch (error) {
    console.log(error);
    return redirect("/teacher/statistics");
  }

  const totalStudents = teacherCourses?.createdCourses?.reduce(
    (acc: number, course: any) => acc + course.students.length,
    0
  );

  const totalCreatedCourses = teacherCourses?.createdCourses?.length || 0;

  return (
    <div className="p-6 bg-transparent rounded-lg shadow-md">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card label={t('totalStudents')} icon={User} amount={totalStudents || 0} />
        <Card
          label={t('walletBalance')}
          icon={DollarSign}
          amount={teacherCourses?.wallet.toFixed(2) || 0}
        />
        <Card
          label={t('totalCreatedCourses')}
          icon={BookOpen}
          amount={totalCreatedCourses}
        />
      </div>

      <div className="mt-8">
        <MonthlyRevenueBarChart
          courses={teacherCourses?.createdCourses || []}
        />
      </div>

      <div className="mt-8">
        <CourseRatingBarChart courses={teacherCourses?.createdCourses || []} />
      </div>

      <RevenuePieChart courses={teacherCourses?.createdCourses || []} />
    </div>
  );
};

export default StatsPage;
