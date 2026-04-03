import mongoose, { Schema, Document } from "mongoose";

export interface ISkill extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  level: number; // e.g. 1-100 or 1-10
  marketDemand: number; // e.g. 1-100 representing how valuable this is
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    level: { type: Number, required: true, min: 0, max: 100 },
    marketDemand: { type: Number, required: true, min: 0, max: 100 },
  },
  { timestamps: true }
);

export const Skill = mongoose.models.Skill || mongoose.model<ISkill>("Skill", SkillSchema);
