import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["INCOME", "EXPENSE"], required: true },
    amount: { type: Number, required: true },
    description: String,
    date: { type: Date, default: Date.now },
    category: String,
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    userId: { type: String, required: true },
    isRecurring: { type: Boolean, default: false },
    recurringInterval: String,
    lastProcessed: Date,
    nextRecurringDate: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", transactionSchema);
