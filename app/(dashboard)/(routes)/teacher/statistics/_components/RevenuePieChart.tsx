"use client";

import React from "react";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";
import { ICourse } from "@/lib/models/course.model";
import { useTheme } from "@/contexts/ThemeProvider";

interface Props {
  courses: ICourse[];
}

const generateRandomColor = () => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgba(${r}, ${g}, ${b}, 0.2)`;
};

const RevenuePieChart: React.FC<Props> = ({ courses }) => {
  const { mode } = useTheme();
  const isDarkMode = mode === "dark";

  const backgroundColors = courses.map(() => generateRandomColor());
  const borderColors = backgroundColors.map((color) =>
    color.replace("0.2", "1")
  );

  const data = {
    labels: courses.map((course) => course.title),
    datasets: [
      {
        label: "Revenue by Course",
        data: courses.map(
          (course) => (course.students?.length ?? 0) * (course.price ?? 0)
        ),
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        align: "start" as const,
        labels: {
          boxWidth: 20,
          color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
          padding: 20,
          usePointStyle: true,
        },
      },
    },
  };

  return (
    <div className="w-full p-4">
      <h2 className="text-xl font-bold mb-4">Revenue by Course</h2>
      <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px]">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
};

export default RevenuePieChart;
