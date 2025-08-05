import { connectDB } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";

export async function GET() {
  try {
    await connectDB();
    const transactions = await Transaction.find().populate("accountId");
    return Response.json(transactions);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
