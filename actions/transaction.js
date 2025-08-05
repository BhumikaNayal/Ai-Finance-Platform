"use server";

import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Account from "@/models/Account";
import Transaction from "@/models/Transaction";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Create Transaction - MongoDB version
export async function createTransaction(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await connectDB();

    const user = await User.findOne({ clerkUserId: userId });
    if (!user) throw new Error("User not found");

    const account = await Account.findById(data.accountId);
    if (!account) throw new Error("Account not found");

    // Calculate new balance
    const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;

    // Create transaction
    const transaction = await Transaction.create({
      ...data,
      userId: user._id,
      nextRecurringDate:
        data.isRecurring && data.recurringInterval
          ? calculateNextRecurringDate(data.date, data.recurringInterval)
          : null,
    });

    // Update account balance
    await Account.findByIdAndUpdate(data.accountId, {
      $inc: { balance: balanceChange },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${data.accountId}`);

    return {
      success: true,
      data: {
        ...transaction.toObject(),
        id: transaction._id.toString(),
        accountId: transaction.accountId.toString(),
      },
    };
  } catch (error) {
    console.error("Transaction creation error:", error);
    return { success: false, error: error.message };
  }
}

export async function getTransaction(id) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await connectDB();

    const user = await User.findOne({ clerkUserId: userId });
    if (!user) throw new Error("User not found");

    const transaction = await Transaction.findOne({
      _id: id,
      userId: user._id,
    });

    if (!transaction) throw new Error("Transaction not found");

    return {
      ...transaction.toObject(),
      id: transaction._id.toString(),
      accountId: transaction.accountId.toString(),
    };
  } catch (error) {
    console.error("Get transaction error:", error);
    throw new Error(error.message);
  }
}

export async function updateTransaction(id, data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await connectDB();

    const user = await User.findOne({ clerkUserId: userId });
    if (!user) throw new Error("User not found");

    // Get original transaction
    const originalTransaction = await Transaction.findOne({
      _id: id,
      userId: user._id,
    });

    if (!originalTransaction) throw new Error("Transaction not found");

    // Calculate balance changes
    const oldBalanceChange =
      originalTransaction.type === "EXPENSE"
        ? -originalTransaction.amount
        : originalTransaction.amount;

    const newBalanceChange =
      data.type === "EXPENSE" ? -data.amount : data.amount;

    const netBalanceChange = newBalanceChange - oldBalanceChange;

    // Update transaction
    const updated = await Transaction.findOneAndUpdate(
      { _id: id, userId: user._id },
      {
        ...data,
        nextRecurringDate:
          data.isRecurring && data.recurringInterval
            ? calculateNextRecurringDate(data.date, data.recurringInterval)
            : null,
      },
      { new: true }
    );

    // Update account balance
    await Account.findByIdAndUpdate(data.accountId, {
      $inc: { balance: netBalanceChange },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${data.accountId}`);

    return {
      success: true,
      data: {
        ...updated.toObject(),
        id: updated._id.toString(),
        accountId: updated.accountId.toString(),
      },
    };
  } catch (error) {
    console.error("Update transaction error:", error);
    return { success: false, error: error.message };
  }
}

// Get User Transactions
export async function getUserTransactions(query = {}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await connectDB();

    const user = await User.findOne({ clerkUserId: userId });
    if (!user) throw new Error("User not found");

    const transactions = await Transaction.find({
      userId: user._id,
      ...query,
    }).sort({ date: -1 });

    return {
      success: true,
      data: transactions.map((t) => ({
        ...t.toObject(),
        id: t._id.toString(),
        accountId: t.accountId.toString(),
      })),
    };
  } catch (error) {
    console.error("Get user transactions error:", error);
    return { success: false, error: error.message };
  }
}

// Scan Receipt
export async function scanReceipt(file) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API key is not configured");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const arrayBuffer = await file.arrayBuffer();
    const base64String = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
      Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If it's not a receipt, return an empty object
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
      const data = JSON.parse(cleanedText);
      return {
        amount: parseFloat(data.amount),
        date: new Date(data.date),
        description: data.description,
        category: data.category,
        merchantName: data.merchantName,
      };
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      throw new Error("Invalid response format from Gemini");
    }
  } catch (error) {
    console.error("Error scanning receipt:", error);
    throw new Error("Failed to scan receipt: " + error.message);
  }
}

// Helper function to calculate next recurring date
function calculateNextRecurringDate(startDate, interval) {
  const date = new Date(startDate);

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date;
}
