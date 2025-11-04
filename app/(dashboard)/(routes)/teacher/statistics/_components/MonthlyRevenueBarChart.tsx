"use client";

import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { ICourse } from "@/lib/models/course.model";
import { countMonthlyPurchasesForCourse } from "@/lib/actions/course.action";
import { TooltipItem } from "chart.js";
import { useTheme } from "@/contexts/ThemeProvider";

interface Props {
  courses: ICourse[];
}

const MonthlyRevenueBarChart: React.FC<Props> = ({ courses }) => {
  const { mode } = useTheme();
  const isDarkMode = mode === "dark";

  const [datasets, setDatasets] = useState<any[]>([]);
  const [totalMaxRevenue, setTotalMaxRevenue] = useState(0);

  const backgroundColors = [
    "rgba(255, 99, 132, 0.5)",
    "rgba(54, 162, 235, 0.5)",
    "rgba(255, 206, 86, 0.5)",
    "rgba(75, 192, 192, 0.5)",
    "rgba(153, 102, 255, 0.5)",
    "rgba(255, 159, 64, 0.5)",
  ];

  useEffect(() => {
    const fetchPurchaseData = async () => {
      const currentYear = new Date().getFullYear();
      const courseRevenues: number[] = [];

      const purchaseDatasets = await Promise.all(
        courses.map(async (course, index) => {
          const monthlyPurchases = await countMonthlyPurchasesForCourse(
            course._id
          );
          const monthlyRevenues = new Array(12).fill(null);

          monthlyPurchases.forEach((purchase) => {
            const purchaseMonth = Number(purchase.month) - 1;
            if (purchase.year === currentYear) {
              monthlyRevenues[purchaseMonth] =
                (monthlyRevenues[purchaseMonth] ?? 0) +
                purchase.count * (course.price ?? 0);
            }
          });

          courseRevenues.push(
            ...(monthlyRevenues.filter((rev) => rev !== null) as number[])
          );

          return {
            label: course.title,
            data: monthlyRevenues,
            backgroundColor: backgroundColors[index % backgroundColors.length],
            borderColor: backgroundColors[index % backgroundColors.length],
            borderWidth: 1,
          };
        })
      );

      const totalMaxRevenue =
        courseRevenues.reduce((sum, revenue) => sum + revenue, 0) + 20;
      setDatasets(purchaseDatasets);
      setTotalMaxRevenue(totalMaxRevenue);
    };

    fetchPurchaseData();
  }, [courses, backgroundColors]);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const data = {
    labels: months,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        align: "start" as const,
        labels: {
          boxWidth: 20,
          color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem: TooltipItem<"bar">) {
            const label = tooltipItem.dataset.label ?? "Unknown course";
            const value = tooltipItem.raw as number;
            return `${label}: $${value.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: totalMaxRevenue,
        ticks: {
          callback: function (value: any) {
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
      <h2 className="text-xl font-bold">Monthly Revenue by Course</h2>
      <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-screen">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default MonthlyRevenueBarChart;
