import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["CHECKING", "SAVINGS"], required: true }, // Fixed to match your schema
  balance: { type: Number, required: true, default: 0 },
  isDefault: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Changed to ObjectId
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Account ||
  mongoose.model("Account", accountSchema);
