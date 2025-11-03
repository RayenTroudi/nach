import { models, model, Schema, Document } from "mongoose";

interface IChatRoomMessage extends Document {
  chatRoomId: Schema.Types.ObjectId;
  senderId: Schema.Types.ObjectId;
  content: string;
}

const ChatRoomMessageSchema = new Schema(
  {
    chatRoomId: { type: Schema.Types.ObjectId, ref: "CourseChatRoom" },
    senderId: { type: Schema.Types.ObjectId, ref: "User" },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const ChatRoomMessage =
  models?.ChatRoomMessage || model("ChatRoomMessage", ChatRoomMessageSchema);

export default ChatRoomMessage;
