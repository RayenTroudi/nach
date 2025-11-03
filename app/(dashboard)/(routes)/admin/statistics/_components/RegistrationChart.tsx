"use client";

import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { getAllUsers } from "@/lib/actions/user.action";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useTheme } from "@/contexts/ThemeProvider";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const getLast7Days = () => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const last7Days = [];
  const currentDate = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() - i);
    const dayName = days[date.getDay()];
    const dayDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    last7Days.push(`${dayName} ${dayDate}`);
  }

  return last7Days;
};

const getLast30Days = () => {
  const last30Days = [];
  const currentDate = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() - i);
    const dayDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    last30Days.push(dayDate);
  }

  return last30Days;
};

const getLast12Months = () => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const last12Months = [];
  const currentDate = new Date();

  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setMonth(currentDate.getMonth() - i);
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();
    last12Months.push(`${monthName} ${year}`);
  }

  return last12Months;
};

const processData = (users: any[], period: string) => {
  let daysToTrack: number;
  let registrationsPerDay: number[];

  switch (period) {
    case "week":
      daysToTrack = 7;
      registrationsPerDay = Array(daysToTrack).fill(0);
      users.forEach((user) => {
        const registrationDate = new Date(user.createdAt).getTime();
        const currentDate = new Date().getTime();
        const dayNumber = Math.floor(
          (currentDate - registrationDate) / (24 * 60 * 60 * 1000)
        );
        if (dayNumber < daysToTrack) {
          registrationsPerDay[daysToTrack - dayNumber - 1] += 1;
        }
      });
      return registrationsPerDay;
    case "month":
      daysToTrack = 30;
      registrationsPerDay = Array(daysToTrack).fill(0);
      users.forEach((user) => {
        const registrationDate = new Date(user.createdAt).getTime();
        const currentDate = new Date().getTime();
        const dayNumber = Math.floor(
          (currentDate - registrationDate) / (24 * 60 * 60 * 1000)
        );
        if (dayNumber < daysToTrack) {
          registrationsPerDay[daysToTrack - dayNumber - 1] += 1;
        }
      });
      return registrationsPerDay;
    case "year":
      daysToTrack = 12;
      registrationsPerDay = Array(daysToTrack).fill(0);
      users.forEach((user) => {
        const registrationDate = new Date(user.createdAt);
        const currentDate = new Date();
        const monthDiff =
          (currentDate.getFullYear() - registrationDate.getFullYear()) * 12 +
          (currentDate.getMonth() - registrationDate.getMonth());
        if (monthDiff < daysToTrack) {
          registrationsPerDay[daysToTrack - monthDiff - 1] += 1;
        }
      });
      return registrationsPerDay;
    default:
      return [];
  }
};

const RegistrationChart = () => {
  const { mode } = useTheme();
  const isDarkMode = mode === "dark";
  const [period, setPeriod] = useState("week");
  const [chartData, setChartData] = useState<any>({
    labels: getLast7Days(),
    datasets: [
      {
        label: "Registrations",
        data: Array(7).fill(0),
        fill: true,
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
        pointBackgroundColor: "rgba(153, 102, 255, 1)",
      },
    ],
  });

  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        const users = await getAllUsers();
        const registrationsPerPeriod = processData(users, period);
        let labels: any;
        switch (period) {
          case "week":
            labels = getLast7Days();
            break;
          case "month":
            labels = getLast30Days();
            break;
          case "year":
            labels = getLast12Months();
            break;
          default:
            labels = [];
        }

        setChartData({
          labels: labels,
          datasets: [
            {
              label: "Registrations",
              data: registrationsPerPeriod,
              fill: true,
              backgroundColor: "rgba(153, 102, 255, 0.2)",
              borderColor: "rgba(153, 102, 255, 1)",
              borderWidth: 1,
              pointBackgroundColor: "rgba(153, 102, 255, 1)",
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchAndProcessData();
  }, [period]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `Registrations - ${
          period.charAt(0).toUpperCase() + period.slice(1)
        }`,
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: "Users",
        },
        ticks: {
          stepSize: 1,
        },
        grid: {
          color: isDarkMode ? "rgba(203, 213, 225, 0.2)" : "rgba(0, 0, 0, 0.1)",
        },
      },
      x: {
        grid: {
          color: isDarkMode ? "rgba(203, 213, 225, 0.2)" : "rgba(0, 0, 0, 0.1)",
        },
      },
    },
  };

  return (
    <div>
      <Tabs defaultValue="week" onValueChange={(value) => setPeriod(value)}>
        <TabsList className="bg-transparent">
          <TabsTrigger value="week">Per week</TabsTrigger>
          <TabsTrigger value="month">Per month</TabsTrigger>
          <TabsTrigger value="year">Per year</TabsTrigger>
        </TabsList>
      </Tabs>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default RegistrationChart;
