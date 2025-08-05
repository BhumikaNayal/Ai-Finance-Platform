"use server";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Account from "@/models/Account";
import Transaction from "@/models/Transaction";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getAccountWithTransactions(accountId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await connectDB();

  const user = await User.findOne({ clerkUserId: userId });
  if (!user) throw new Error("User not found");

  const account = await Account.findOne({
    _id: accountId,
    userId: user._id,
  });

  if (!account) return null;

  const transactions = await Transaction.find({
    accountId: account._id,
  }).sort({ date: -1 });

  const transactionCount = await Transaction.countDocuments({
    accountId: account._id,
  });

  return {
    ...account.toObject(),
    id: account._id.toString(),
    transactions: transactions.map((t) => ({
      ...t.toObject(),
      id: t._id.toString(),
      accountId: t.accountId.toString(),
    })),
    _count: {
      transactions: transactionCount,
    },
  };
}

export async function bulkDeleteTransactions(transactionIds) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await connectDB();

    const user = await User.findOne({ clerkUserId: userId });
    if (!user) throw new Error("User not found");

    // Get transactions to calculate balance changes
    const transactions = await Transaction.find({
      _id: { $in: transactionIds },
      userId: user._id,
    });

    // Group transactions by account to update balances
    const accountBalanceChanges = transactions.reduce((acc, transaction) => {
      const change =
        transaction.type === "EXPENSE"
          ? transaction.amount
          : -transaction.amount;
      const accountId = transaction.accountId.toString();
      acc[accountId] = (acc[accountId] || 0) + change;
      return acc;
    }, {});

    // Delete transactions
    await Transaction.deleteMany({
      _id: { $in: transactionIds },
      userId: user._id,
    });

    // Update account balances
    for (const [accountId, balanceChange] of Object.entries(
      accountBalanceChanges
    )) {
      await Account.findByIdAndUpdate(accountId, {
        $inc: { balance: balanceChange },
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/account/[id]");

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateDefaultAccount(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await connectDB();

    const user = await User.findOne({ clerkUserId: userId });
    if (!user) throw new Error("User not found");

    // First, unset any existing default account
    await Account.updateMany(
      {
        userId: user._id,
        isDefault: true,
      },
      { isDefault: false }
    );

    // Then set the new default account
    const account = await Account.findOneAndUpdate(
      {
        _id: accountId,
        userId: user._id,
      },
      { isDefault: true },
      { new: true }
    );

    revalidatePath("/dashboard");
    return {
      success: true,
      data: {
        ...account.toObject(),
        id: account._id.toString(),
      },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
