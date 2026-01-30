import { models, model, Schema, Document } from "mongoose";

interface IPrivateChatMessage extends Document {
  privateChatRoomId: Schema.Types.ObjectId;
  senderId: Schema.Types.ObjectId;
  content: string;
}

const PrivateChatMessageSchema = new Schema(
  {
    privateChatRoomId: { type: Schema.Types.ObjectId, ref: "PrivateChatRoom", required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

// Force delete cached model to ensure schema updates are applied
if (models?.PrivateChatMessage) {
  delete models.PrivateChatMessage;
}

const PrivateChatMessage = model("PrivateChatMessage", PrivateChatMessageSchema);

export default PrivateChatMessage;
