import mongoose, { Schema, Document } from "mongoose";

export interface IExecution extends Document {
  userId: mongoose.Types.ObjectId;
  habits: {
    name: string;
    completedDates: Date[]; // Dates when this habit was checked off
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ExecutionSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    habits: [
      {
        name: { type: String, required: true },
        completedDates: [{ type: Date }],
      },
    ],
  },
  { timestamps: true }
);

export const Execution = mongoose.models.Execution || mongoose.model<IExecution>("Execution", ExecutionSchema);
