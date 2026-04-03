import mongoose, { Schema, Document } from "mongoose";

export interface IAIInsight extends Document {
  userId: mongoose.Types.ObjectId;
  message: string;
  type: "info" | "warning" | "growth";
  createdAt: Date;
}

const AIInsightSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["info", "warning", "growth"], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AIInsight = mongoose.models.AIInsight || mongoose.model<IAIInsight>("AIInsight", AIInsightSchema);
