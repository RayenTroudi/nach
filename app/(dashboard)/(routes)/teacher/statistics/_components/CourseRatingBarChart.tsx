"use client";

import React from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { TCourse } from "@/types/models.types";
import { useTheme } from "@/contexts/ThemeProvider";

interface Props {
  courses: TCourse[];
}

const CourseRatingBarChart: React.FC<Props> = ({ courses }) => {
  const { mode } = useTheme();

  const sortedCourses = [...courses]
    .filter((course) => course.feedbacks !== undefined)
    .sort((a, b) => b.feedbacks!.length - a.feedbacks!.length);

  const truncateTitle = (title: string) => {
    return title.length > 5 ? `${title.slice(0, 5)}...` : title;
  };

  const courseTitles = sortedCourses.map((course) =>
    truncateTitle(course.title)
  );
  const fullCourseTitles = sortedCourses.map((course) => course.title);
  const courseRatings = sortedCourses.map((course) => course.feedbacks?.length);

  const data = {
    labels: courseTitles,
    datasets: [
      {
        label: "Course Rating",
        data: courseRatings,
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const isDarkMode = mode === "dark";

  const options = {
    responsive: true,
    indexAxis: "y" as const,
    scales: {
      x: {
        beginAtZero: true,
        max: 5,
        ticks: {
          stepSize: 1,
          callback: (value: any) => `${value} ⭐`,
          color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
        },
        grid: {
          color: isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)",
        },
      },
      y: {
        ticks: {
          color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
        },
        grid: {
          color: isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)",
        },
      },
    },
    plugins: {
      legend: {
        display: false,
        labels: {
          color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
        },
      },
      tooltip: {
        backgroundColor: isDarkMode
          ? "rgba(0, 0, 0, 0.7)"
          : "rgba(255, 255, 255, 0.8)",
        titleColor: isDarkMode
          ? "rgba(255, 255, 255, 0.7)"
          : "rgba(0, 0, 0, 0.9)",
        bodyColor: isDarkMode
          ? "rgba(255, 255, 255, 0.7)"
          : "rgba(0, 0, 0, 0.9)",
        callbacks: {
          title: (tooltipItems: any[]) => {
            const index = tooltipItems[0].dataIndex;
            return fullCourseTitles[index];
          },
          label: (tooltipItem: any) => `${tooltipItem.raw} ⭐`,
        },
      },
    },
  };

  return (
    <div className="w-full ">
      <h2 className="text-xl font-bold mb-4">Course Ratings</h2>
      <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-screen">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default CourseRatingBarChart;
