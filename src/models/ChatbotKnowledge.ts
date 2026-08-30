import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChatbotKnowledge extends Document {
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatbotKnowledgeSchema: Schema = new Schema(
  {
    question: {
      type: String,
      required: [true, 'Question is required'],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, 'Answer is required'],
      trim: true,
    },
    category: {
      type: String,
      default: 'General',
      enum: ['General', 'Skills', 'Projects', 'Experience', 'Availability', 'Rates', 'Personal'],
    },
    keywords: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: 'chatbot_knowledge',
  }
);

const ChatbotKnowledge: Model<IChatbotKnowledge> =
  mongoose.models.ChatbotKnowledge ||
  mongoose.model<IChatbotKnowledge>('ChatbotKnowledge', ChatbotKnowledgeSchema);

export default ChatbotKnowledge;
