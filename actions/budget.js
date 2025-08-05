// actions/budget.js
"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getBudget() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const budget = await db.budget.findFirst({
      where: { userId: user.id },
    });

    return budget
      ? { success: true, data: budget }
      : { success: false, data: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateBudget(amount) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const budget = await db.budget.upsert({
      where: { userId: user.id },
      update: { amount },
      create: { userId: user.id, amount },
    });

    revalidatePath("/dashboard");
    return { success: true, data: budget };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
