"use server";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import mongoose from "mongoose";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// Create Budget model if it doesn't exist
const budgetSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  userId: { type: String, required: true, unique: true },
  lastAlertSent: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Budget = mongoose.models.Budget || mongoose.model("Budget", budgetSchema);

export async function getBudget() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await connectDB();

    const user = await User.findOne({ clerkUserId: userId });
    if (!user) throw new Error("User not found");

    const budget = await Budget.findOne({ userId: user._id });

    return budget
      ? { success: true, data: budget.toObject() }
      : { success: false, data: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateBudget(amount) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await connectDB();

    const user = await User.findOne({ clerkUserId: userId });
    if (!user) throw new Error("User not found");

    const budget = await Budget.findOneAndUpdate(
      { userId: user._id },
      {
        amount,
        updatedAt: new Date(),
      },
      {
        upsert: true,
        new: true,
      }
    );

    revalidatePath("/dashboard");
    return { success: true, data: budget.toObject() };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
