import {
  BarChart2,
  CircleDollarSign,
  GraduationCap,
  Home,
  MessagesSquare,
  Settings,
  Table,
  FileText,
  Calendar,
  Video,
  FileCheck,
  FolderOpen,
  Package,
  ShoppingBag,
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
    icon: Package,
    labelKey: "navigation.myDocuments",
    href: "/student/my-documents",
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
    icon: FolderOpen,
    labelKey: "navigation.documentBundles",
    href: "/teacher/document-bundles",
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
];
export const adminRoutes = [
  {
    icon: FileText,
    labelKey: "navigation.paymentProofs",
    href: "/admin/payment-proofs",
  },
  {
    icon: ShoppingBag,
    labelKey: "navigation.documentPurchases",
    href: "/admin/document-purchases",
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
];
