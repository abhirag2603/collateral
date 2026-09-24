import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  jobTitle?: string;
  industry?: string;
  bio?: string;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional since Google users won't have one
    jobTitle: { type: String, default: "User" },
    industry: { type: String, default: "" },
    bio: { type: String, default: "" },
    onboardingCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
