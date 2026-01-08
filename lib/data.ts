import {
  BarChart2,
  CircleDollarSign,
  GraduationCap,
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
    labelKey: "navigation.home",
    href: "/",
  },
  {
    icon: GraduationCap,
    labelKey: "navigation.myLearning",
    href: "/my-learning",
  },
  {
    icon: Calendar,
    labelKey: "navigation.myMeetings",
    href: "/my-meetings",
  },
  {
    icon: FileCheck,
    labelKey: "navigation.myResume",
    href: "/my-resume",
  },
  {
    icon: ShoppingCart,
    labelKey: "navigation.myCart",
    href: "/cart",
  },
  {
    icon: MessagesSquare,
    labelKey: "navigation.chatRooms",
    href: "/chat-rooms",
  },
  {
    icon: Settings,
    labelKey: "navigation.manageMyAccount",
    href: "/manage",
  },
];
export const teacherRoutes = [
  {
    icon: Home,
    labelKey: "navigation.courses",
    href: "/teacher/courses",
  },
  {
    icon: FileText,
    labelKey: "navigation.documents",
    href: "/teacher/documents",
  },
  {
    icon: FileCheck,
    labelKey: "navigation.resumeRequests",
    href: "/teacher/resume-requests",
  },
  {
    icon: MessagesSquare,
    labelKey: "navigation.chatRooms",
    href: "/teacher/chat-rooms",
  },
  {
    icon: BarChart2,
    labelKey: "navigation.statistics",
    href: "/teacher/statistics",
  },
];
export const adminRoutes = [
  {
    icon: Table,
    labelKey: "navigation.categories",
    href: "/admin/categories",
  },
  {
    icon: FileText,
    labelKey: "navigation.paymentProofs",
    href: "/admin/payment-proofs",
  },
  {
    icon: Calendar,
    labelKey: "navigation.meetingBookings",
    href: "/admin/bookings",
  },
  {
    icon: FileCheck,
    labelKey: "navigation.resumePayments",
    href: "/admin/resume-payments",
  },
  {
    icon: Video,
    labelKey: "navigation.myConsultations",
    href: "/admin/my-consultations",
  },
  {
    icon: BarChart2,
    labelKey: "navigation.statistics",
    href: "/admin/statistics",
  },
];
