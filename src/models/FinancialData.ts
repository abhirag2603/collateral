import mongoose, { Schema, Document } from "mongoose";

export interface IFinancialData extends Document {
  userId: mongoose.Types.ObjectId;
  income: number;
  expenses: number;
  savings: number;
  investments: number;
  createdAt: Date;
  updatedAt: Date;
}

const FinancialDataSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    income: { type: Number, required: true, default: 0 },
    expenses: { type: Number, required: true, default: 0 },
    savings: { type: Number, required: true, default: 0 },
    investments: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export const FinancialData =
  mongoose.models.FinancialData || mongoose.model<IFinancialData>("FinancialData", FinancialDataSchema);
