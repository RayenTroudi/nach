import { CourseLevelEnum, CourseStatusEnum, CourseTypeEnum } from "@/lib/enums";

export type TUser = {
  _id: string;
  clerkId: string;
  stripeId?: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  picture?: string;
  isAdmin?: boolean;
  wallet?: number;
  aboutMe?: string;
  interests?: string[];
  createdCourses?: TCourse[];
  enrolledCourses?: TCourse[];
  ownChatRooms?: TCourseChatRoom[];
  joinedChatRooms?: TCourseChatRoom[];
  privateChatRooms?: TPrivateChatRoom[];
  withdrawTransactions?: TWithdrawTransaction[];
  createdAt: Date;
  socialLinks?: {
    website?: string;
    linkedin?: string;
    youtube?: string;
    github?: string;
  };
};

export type TWithdrawTransaction = {
  _id: string;
  user: TUser;
  amount: number;
  stripeId: string;
  transferId: string;
  createdAt: Date;
};

export type TCourseChatRoom = {
  _id: string;
  courseId: TCourse;
  students?: TUser[];
  instructorAdmin: TUser;
  messages?: TChatRoomMessage[];
  cratedAt: Date;
};

export type TPrivateChatRoom = {
  _id: string;
  courseId: TCourse;
  student: TUser;
  instructor: TUser;
  messages?: TPrivateChatMessage[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type TChatRoomMessage = {
  _id: string;
  chatRoomId: TCourseChatRoom;
  senderId: TUser;
  content: string;
  createdAt: Date;
};

export type TPrivateChatMessage = {
  _id: string;
  privateChatRoomId: TPrivateChatRoom;
  senderId: TUser;
  content: string;
  createdAt: Date;
};

export type TFeedback = {
  _id: string;
  course: TCourse;
  user: TUser;
  rating: number;
  comment: string;
  createdAt: Date;
};

export type TCourse = {
  _id: string;
  title: string;
  description?: string;
  level?: CourseLevelEnum;
  language?: string;
  welcomeMessage?: string;
  congratsMessage?: string;
  feedbacks: TFeedback[];
  price?: number;
  currency?: string;
  completed?: boolean;
  thumbnail?: string;
  isPublished?: boolean;
  status?: CourseStatusEnum;
  courseType?: CourseTypeEnum;
  faqVideo?: string;
  instructor: TUser;
  category: TCategory;
  exam?: TExam;
  keywords: string[];
  students?: TUser[];
  sections?: TSection[];
  purchases?: TPurchase[];
  comments?: TComment[];
  createdAt: Date;
};

export type TCategory = {
  _id: string;
  name: string;
  courses: TCourse[];
  createdAt: Date;
};

export type TSection = {
  _id: string;
  title: string;
  videos?: TVideo[];
  attachments?: TAttachment[];
  sectionThumbnail?: string;
  position?: number;
  course: TCourse;
  isPublished?: boolean;
  createdAt: Date;
};

export type TAttachment = {
  _id: string;
  title: string;
  url: string;
  section: TSection;
  createdAt: Date;
};

export type TVideo = {
  _id: string;
  title: string;
  videoUrl?: string;
  position?: number;
  isPublished?: boolean;
  isFree: boolean;
  sectionId: TSection;
  muxData?: TMuxData;
  userProgress?: TUserProgress[];
  createdAt: Date;
};

export type TUserProgress = {
  _id: string;
  userId: TUser;
  courseId: TCourse;
  progress: number;
  isCompleted?: boolean;
  createdAt: Date;
};

export type TMuxData = {
  _id: string;
  assetId: string;
  playbackId?: string;
  video: TVideo;
  createdAt: Date;
};

export type TExam = {
  _id: string;
  title: string;
  examUrl: string;
  courseId: TCourse;
  passedUsers?: TUser[];
  createdAt: Date;
};

export type TComment = {
  _id: string;
  title: string;
  content: string;
  user: TUser;
  course: TCourse;
  replies?: TReply[];
  createdAt: Date;
};

export type TReply = {
  _id: string;
  owner: TUser;
  title: string;
  content: string;
  comment: TComment;
  createdAt: Date;
};

export type TPurchase = {
  _id: string;
  userId: TUser;
  courseId: TCourse;
  createdAt: Date;
};

export type TUserCourseVideoCompleted = {
  _id: string;
  userId: TUser;
  courseId: TCourse;
  videoId: TVideo;
};

export type TMuxData = {
  assetId: string;
  playbackId?: string;
  video: TVideo;
};

export type TDocument = {
  _id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  category: string;
  tags?: string[];
  uploadedBy: TUser;
  isPublic: boolean;
  downloads: number;
  price?: number;
  currency?: string;
  isForSale?: boolean;
  purchases?: TDocumentPurchase[];
  createdAt: Date;
  updatedAt: Date;
};

export type TDocumentBundle = {
  _id: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  thumbnail?: string;
  documents: TDocument[];
  uploadedBy: TUser;
  isPublished: boolean;
  category: string;
  tags?: string[];
  purchases?: TDocumentPurchase[];
  createdAt: Date;
  updatedAt: Date;
};

export type TDocumentPurchase = {
  _id: string;
  userId: TUser;
  itemType: "document" | "bundle";
  itemId: string;
  amount: number;
  currency: string;
  paymentMethod?: "stripe" | "bank_transfer";
  paymentStatus: "pending" | "completed" | "rejected";
  paymentProofUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};
