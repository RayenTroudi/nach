import { Interface } from "readline";

interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  categoryId: string;
  isPublished: boolean;
  chapters: Chapter[];
  attachments: any[];
}

interface Chapter {
  id: string;
  courseId: string;
  title: string;
  description: string;
  videoUrl: string;
  isPublished: boolean;
  muxData: any;
  isFree?: boolean;
}

export interface CourseProps {
  categoryId: string;
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export interface DescriptionFormProps {
  initialData: Course;
  courseId: string;
}

export interface CategoryFormProps {
  initialData: Course;
  courseId: string;
  options: { label: string; value: string }[];
}

export interface ImageFormProps {
  initialData: Course;
  courseId: string;
}

export interface TitleFormProps {
  initialData: {
    title: string;
  };
  courseId: string;
}

export interface ChaptersFormProps {
  initialData: Course & { chapters: Chapter[] };
  courseId: string;
}

export interface ChaptersListProps {
  items: Chapter[];
  onReorder: (updateData: { id: string; position: number }[]) => void;
  onEdit: (id: string) => void;
}

export interface ChapterAccessFormProps {
  initialData: Chapter;
  courseId: string;
  chapterId: string;
}

export interface ChapterDescriptionFormProps {
  initialData: Chapter;
  courseId: string;
  chapterId: string;
}

export interface ChapterVideoFormProps {
  initialData: Chapter & { muxData?: MuxData | null };
  courseId: string;
  chapterId: string;
}

export interface MessagesListProps {
  messages: Array<{
    id: number;
    sender: string;
    timestamp: string;
    messagePreview: string;
    isRead: boolean;
    senderPhoto: string;
  }>;
  onMessageSelect: (message: any) => void;
}

export interface MessageDiscussionsProps {
  discussions: Array<{
    id: number;
    senderName: string;
    senderProfilePicture: string;
    messageContent: string;
    timestamp: string;
    isCurrentUser: boolean;
  }>;
}

export interface DiscussionMessageProps {
  senderName: string;
  senderProfilePicture: string;
  messageContent: string;
  timestamp: string;
  isCurrentUser: boolean;
}

export interface MessageProps {
  sender: string;
  timestamp: string;
  messagePreview: string;
  isRead: boolean;
  senderPhoto: string;
}

export interface MessageDetailProps {
  selectedMessage: {
    sender: string;
    timestamp: string;
    messageContent: string;
  } | null;
}

export interface MessageInputBoxProps {
  onSend: (message: string) => void;
}

export interface UserCoursesProps {
  instructor: any;
  _id: string;
  thumbnail: string;
  instructorName: string;
  title: string;
  hours?: number;
  students?: string[];
  price: number;
  priceOff?: number;
  category: {
    name: string;
    _id: string;
    courses: string[];
    updatedAt: Date;
  };
  rating: number;
  picture: string | null;
}

export interface Category {
  _id: string;
  name: string;
  courses: string[];
  updatedAt: Date;
}
export interface CourseQuery {
  category?: { $in?: string[] };
  language?: { $in?: string[] };
  rating?: { $in?: number[] };
  price?: {
    $eq?: number;
    $gt?: number;
  };
  level?: { $in?: string[] };
}

export interface CourseCardProps {
  timePosted: string;
  students: [];
  level: string;
  sections: [];
  quizzes: number;
  regularPrice: number;
  price: number;
  title: string;
  thumbnail: string;
  instructor?: { username: string; about: string; picture: string };
}

export interface TabsComponentProps {
  overview: string;
  sections: [];
  instructor: { username: string; about: string; picture: string };
  faqs: any[];
  reviews: any[];
}

export interface addCourseCommentParams {
  courseId: String;
  userId: String;
  content: string;
}

export type IntegrationType = {
  icon: string;
  platform: string;
  description: string;
  showCase?: string[];
};
