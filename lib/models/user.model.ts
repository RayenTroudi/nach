import { Schema, models, model, Document } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
  stripeId?: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  picture?: string;
  isAdmin?: boolean;
  wallet?: number;
  interests?: string[];
  createdCourses?: Schema.Types.ObjectId[];
  enrolledCourses?: Schema.Types.ObjectId[];
  purchasedDocuments?: Schema.Types.ObjectId[];
  purchasedDocumentBundles?: Schema.Types.ObjectId[];
  ownChatRooms?: Schema.Types.ObjectId[];
  joinedChatRooms?: Schema.Types.ObjectId[];
  privateChatRooms?: Schema.Types.ObjectId[];
  withdrawTransactions?: Schema.Types.ObjectId[];
  aboutMe?: string;
  socialLinks?: {
    website?: string;
    linkedin?: string;
    youtube?: string;
    github?: string;
  };
}

export const UserSchema = new Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    stripeId: {
      type: String,
      default: null,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    picture: {
      type: String,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    wallet: {
      type: Number,
      default: 0,
    },
    interests: [
      {
        type: String,
        default: [],
      },
    ],
    createdCourses: [
      {
        type: Schema.Types.ObjectId,
        ref: "Course",
        default: [],
      },
    ],
    enrolledCourses: [
      {
        type: Schema.Types.ObjectId,
        ref: "Course",
        default: [],
      },
    ],
    purchasedDocuments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Document",
        default: [],
      },
    ],
    purchasedDocumentBundles: [
      {
        type: Schema.Types.ObjectId,
        ref: "DocumentBundle",
        default: [],
      },
    ],
    ownChatRooms: [
      {
        type: Schema.Types.ObjectId,
        ref: "CourseChatRoom",
        default: [],
      },
    ],
    joinedChatRooms: [
      {
        type: Schema.Types.ObjectId,
        ref: "CourseChatRoom",
        default: [],
      },
    ],
    privateChatRooms: [
      {
        type: Schema.Types.ObjectId,
        ref: "PrivateChatRoom",
        default: [],
      },
    ],
    withdrawTransactions: [
      {
        type: Schema.Types.ObjectId,
        ref: "WithdrawTransaction",
        default: [],
      },
    ],
    aboutMe: {
      type: String,
    },
    socialLinks: {
      website: {
        type: String,
      },
      linkedin: {
        type: String,
      },
      youtube: {
        type: String,
      },
      github: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

// Force delete cached model to ensure schema updates are applied
if (models.User) {
  delete models.User;
}

const User = model("User", UserSchema);

export default User;
