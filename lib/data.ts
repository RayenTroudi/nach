import {
  BarChart2,
  CircleDollarSign,
  GraduationCap,
  Heart,
  Home,
  MessagesSquare,
  Settings,
  ShoppingCart,
  Table,
  FileText,
  Calendar,
  Video,
  FileCheck,
} from "lucide-react";

export const studentRoutes = [
  {
    icon: Home,
    label: "Home",
    href: "/",
  },
  {
    icon: GraduationCap,

    label: "My learning",
    href: "/my-learning",
  },
  {
    icon: Calendar,
    label: "My Meetings",
    href: "/my-meetings",
  },
  {
    icon: FileCheck,
    label: "My Resume",
    href: "/my-resume",
  },
  {
    icon: ShoppingCart,

    label: "My cart",
    href: "/cart",
  },
  {
    icon: Heart,

    label: "My wishlist",
    href: "/wishlist",
  },
  {
    icon: MessagesSquare,
    label: "Chat Rooms",
    href: "/chat-rooms",
  },
  {
    icon: Settings,
    label: "Manage my account",
    href: "/manage",
  },
];
export const teacherRoutes = [
  {
    icon: Home,

    label: "Courses",
    href: "/teacher/courses",
  },

  {
    icon: FileText,

    label: "Documents",
    href: "/teacher/documents",
  },

  {
    icon: MessagesSquare,

    label: "Chat Rooms",
    href: "/teacher/chat-rooms",
  },

  {
    icon: BarChart2,

    label: "Statistics",
    href: "/teacher/statistics",
  },
];
export const adminRoutes = [
  {
    icon: Table,
    label: "Categories",
    href: "/admin/categories",
  },
  {
    icon: FileText,
    label: "Payment Proofs",
    href: "/admin/payment-proofs",
  },
  {
    icon: Calendar,
    label: "Meeting Bookings",
    href: "/admin/bookings",
  },
  {
    icon: FileCheck,
    label: "Resume Payments",
    href: "/admin/resume-payments",
  },
  {
    icon: Video,
    label: "My Consultations",
    href: "/admin/my-consultations",
  },
  {
    icon: BarChart2,
    label: "Statistics",
    href: "/admin/statistics",
  },
];
