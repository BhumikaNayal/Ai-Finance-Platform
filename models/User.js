import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  clerkUserId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, unique: true },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Prevent model overwrite during hot-reload
export default mongoose.models.User || mongoose.model("User", userSchema);
