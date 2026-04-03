import mongoose, { Schema, Document } from "mongoose";

export interface IGoal extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  progress: number; // e.g. 0-100 percentage
  deadline: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    progress: { type: Number, required: true, default: 0, min: 0, max: 100 },
    deadline: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Goal = mongoose.models.Goal || mongoose.model<IGoal>("Goal", GoalSchema);
