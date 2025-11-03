"use client";

import React from "react";
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
import { useTheme } from "@/contexts/ThemeProvider";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  data: {
    firstName: string;
    lastName: string;
    revenue: number;
  }[];
}

const BestSellerChart: React.FC<Props> = ({ data }) => {
  const { mode } = useTheme();
  const isDarkMode = mode === "dark";

  const chartData = {
    labels: data.map((item) => `${item.firstName} ${item.lastName}`),
    datasets: [
      {
        label: "Revenue (USD)",
        data: data.map((item) => item.revenue),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

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
        text: "Top 5 Best-Selling Instructors by Revenue",
        color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
      },
    },
    scales: {
      y: {
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

  return <Bar data={chartData} options={options} />;
};

export default BestSellerChart;
