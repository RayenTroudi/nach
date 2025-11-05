"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { getAllCategories } from "@/lib/actions/category.action";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu";
import { useTheme } from "@/contexts/ThemeProvider";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BestSellerCourseChart = ({ courses }: { courses: any[] }) => {
  const { mode } = useTheme();
  const isDarkMode = mode === "dark";

  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<string>("Development");
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [
      {
        label: "Revenue (USD)",
        data: [],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await getAllCategories();
        setCategories(categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const processChartData = useCallback((category: string) => {
    const filteredCourses = courses.filter(
      (course) => course.category.name === category
    );
    const sortedCourses = filteredCourses
      .map((course) => ({
        ...course,
        revenue: course.purchases.length * course.price,
      }))
      .sort((a, b) => b.revenue - a.revenue);
    const top5Courses = sortedCourses.slice(0, 5);

    return {
      labels: top5Courses.map((course) =>
        course.title.length > 10
          ? course.title.slice(0, 10) + "..."
          : course.title
      ),
      datasets: [
        {
          label: "Revenue (USD)",
          data: top5Courses.map((course) => course.revenue),
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
      fullTitles: top5Courses.map((course) => course.title),
    };
  }, [courses]);

  useEffect(() => {
    if (selectedCategory) {
      setChartData(processChartData(selectedCategory));
    }
  }, [selectedCategory, processChartData]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
        },
      },
      title: {
        display: true,
        text: `Top 5 Best-Selling Courses in ${selectedCategory}`,
        color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const fullTitle = chartData.fullTitles[context.dataIndex];
            return `${fullTitle}: $${context.raw}`;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          stepSize: 100,
          callback: function (value: string | number) {
            return `$${value}`;
          },
          color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
        },
        grid: {
          color: isDarkMode ? "rgba(203, 213, 225, 0.2)" : "rgba(0, 0, 0, 0.1)",
        },
      },
      x: {
        ticks: {
          color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
        },
        grid: {
          color: isDarkMode ? "rgba(203, 213, 225, 0.2)" : "rgba(0, 0, 0, 0.1)",
        },
      },
    },
  };

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-2 border rounded">{selectedCategory}</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white dark:bg-slate-950">
          {categories.map((category) => (
            <DropdownMenuItem
              key={category._id}
              onClick={() => setSelectedCategory(category.name)}
              className="p-2 dark:hover:bg-slate-600 hover:bg-slate-200 cursor-pointer"
            >
              {category.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedCategory && <Bar data={chartData} options={options} />}
    </div>
  );
};

export default BestSellerCourseChart;
