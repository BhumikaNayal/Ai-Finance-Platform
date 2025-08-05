// Example in account.js
export async function getAccountWithTransactions(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await connectDB();

    const user = await User.findOne({ clerkUserId: userId });
    if (!user) throw new Error("User not found");

    if (!mongoose.Types.ObjectId.isValid(accountId)) {
      throw new Error("Invalid account ID");
    }

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
  } catch (error) {
    console.error("Error in getAccountWithTransactions:", error);
    throw error;
  }
}
