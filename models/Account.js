import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["CURRENT", "SAVINGS"], required: true },
  balance: { type: Number, required: true, default: 0 },
  isDefault: { type: Boolean, default: false },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Account ||
  mongoose.model("Account", accountSchema);
