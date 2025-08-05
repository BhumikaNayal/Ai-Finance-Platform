// app/api/inngest/route.js
import { serve } from "inngest/next";
import { auth } from "@clerk/nextjs";

import { inngest } from "@/lib/inngest/client";
import {
  checkBudgetAlerts,
  generateMonthlyReports,
  processRecurringTransaction,
  triggerRecurringTransactions,
} from "@/lib/inngest/function";

const handler = serve({
  client: inngest,
  functions: [
    processRecurringTransaction,
    triggerRecurringTransactions,
    generateMonthlyReports,
    checkBudgetAlerts,
  ],
});

export const GET = handler;
export const POST = async (req) => {
  // Verify user is authenticated
  const { userId } = auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  return handler(req);
};
