import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["INCOME", "EXPENSE"], required: true },
    amount: { type: Number, required: true },
    description: { type: String, default: "" },
    date: { type: Date, default: Date.now },
    category: { type: String, required: true },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isRecurring: { type: Boolean, default: false },
    recurringInterval: {
      type: String,
      enum: ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"],
      required: false,
    },
    lastProcessed: { type: Date },
    nextRecurringDate: { type: Date },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "COMPLETED",
    },
    receiptUrl: { type: String },
  },
  { timestamps: true }
);

// Add indexes for better performance
transactionSchema.index({ userId: 1 });
transactionSchema.index({ accountId: 1 });
transactionSchema.index({ date: -1 });

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", transactionSchema);
