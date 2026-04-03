import mongoose, { Schema, Document } from "mongoose";

export interface IScoreSnapshot extends Document {
  userId: mongoose.Types.ObjectId;
  totalScore: number;
  breakdown: {
    financial: number;
    skill: number;
    execution: number;
    opportunity: number;
    risk: number;
  };
  createdAt: Date;
}

const ScoreSnapshotSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    totalScore: { type: Number, required: true },
    breakdown: {
      financial: { type: Number, required: true },
      skill: { type: Number, required: true },
      execution: { type: Number, required: true },
      opportunity: { type: Number, required: true },
      risk: { type: Number, required: true },
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const ScoreSnapshot =
  mongoose.models.ScoreSnapshot || mongoose.model<IScoreSnapshot>("ScoreSnapshot", ScoreSnapshotSchema);
