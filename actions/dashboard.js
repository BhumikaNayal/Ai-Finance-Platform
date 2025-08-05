"use server";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Account from "@/models/Account";
import Transaction from "@/models/Transaction";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getUserAccounts() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await connectDB();

  const user = await User.findOne({ clerkUserId: userId });
  if (!user) {
    throw new Error("User not found");
  }

  try {
    const accounts = await Account.find({ userId: user._id }).sort({
      createdAt: -1,
    });

    // Get transaction counts for each account
    const accountsWithCounts = await Promise.all(
      accounts.map(async (account) => {
        const transactionCount = await Transaction.countDocuments({
          accountId: account._id,
        });

        return {
          ...account.toObject(),
          id: account._id.toString(), // Convert ObjectId to string for consistency
          _count: {
            transactions: transactionCount,
          },
        };
      })
    );

    return accountsWithCounts;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

export async function createAccount(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await connectDB();

    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      throw new Error("User not found");
    }

    const balanceFloat = parseFloat(data.balance);
    if (isNaN(balanceFloat)) {
      throw new Error("Invalid balance amount");
    }

    const existingAccounts = await Account.find({ userId: user._id });
    const shouldBeDefault =
      existingAccounts.length === 0 ? true : data.isDefault;

    if (shouldBeDefault) {
      await Account.updateMany(
        { userId: user._id, isDefault: true },
        { isDefault: false }
      );
    }

    const account = await Account.create({
      ...data,
      balance: balanceFloat,
      userId: user._id,
      isDefault: shouldBeDefault,
    });

    revalidatePath("/dashboard");
    return {
      success: true,
      data: {
        ...account.toObject(),
        id: account._id.toString(),
      },
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getDashboardData() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await connectDB();

  const user = await User.findOne({ clerkUserId: userId });
  if (!user) {
    throw new Error("User not found");
  }

  const transactions = await Transaction.find({ userId: user._id }).sort({
    date: -1,
  });

  return transactions.map((t) => ({
    ...t.toObject(),
    id: t._id.toString(),
    accountId: t.accountId.toString(),
  }));
}
