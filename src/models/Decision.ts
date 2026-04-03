import mongoose, { Schema, Document } from "mongoose";

export interface IDecision extends Document {
  userId: mongoose.Types.ObjectId;
  scenarioInput: string;
  scoreImpact: number; // Could be negative or positive
  riskLevel: "Low" | "Medium" | "High";
  recoveryTime: string; // e.g., "3 months", "1 year"
  createdAt: Date;
}

const DecisionSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    scenarioInput: { type: String, required: true },
    scoreImpact: { type: Number, required: true },
    riskLevel: { type: String, enum: ["Low", "Medium", "High"], required: true },
    recoveryTime: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Decision = mongoose.models.Decision || mongoose.model<IDecision>("Decision", DecisionSchema);
