import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChatLog extends Document {
  sessionId: string;
  userMessage: string;
  botResponse: string;
  intent?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChatLogSchema: Schema = new Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    userMessage: {
      type: String,
      required: true,
      trim: true,
    },
    botResponse: {
      type: String,
      required: true,
    },
    intent: {
      type: String,
      default: 'general',
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
    userAgent: {
      type: String,
      default: 'Unknown',
    },
  },
  {
    timestamps: true,
    collection: 'chat_logs',
  }
);

const ChatLog: Model<IChatLog> =
  mongoose.models.ChatLog || mongoose.model<IChatLog>('ChatLog', ChatLogSchema);

export default ChatLog;
