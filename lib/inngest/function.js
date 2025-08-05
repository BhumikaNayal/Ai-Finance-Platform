import { inngest } from "./client";

export const processRecurringTransaction = inngest.createFunction(
  { id: "process-recurring-transaction" },
  { event: "finance/transaction.recurring" },
  async ({ event }) => {
    // Process recurring transaction logic
    console.log("Processing recurring transaction:", event.data);
  }
);

export const triggerRecurringTransactions = inngest.createFunction(
  { id: "trigger-recurring-transactions" },
  { cron: "0 0 * * *" }, // Daily at midnight
  async () => {
    // Trigger recurring transactions logic
    console.log("Triggering recurring transactions check");
  }
);

export const generateMonthlyReports = inngest.createFunction(
  { id: "generate-monthly-reports" },
  { cron: "0 0 1 * *" }, // First day of each month
  async () => {
    // Generate monthly reports logic
    console.log("Generating monthly reports");
  }
);

export const checkBudgetAlerts = inngest.createFunction(
  { id: "check-budget-alerts" },
  { cron: "0 9 * * *" }, // Daily at 9 AM
  async () => {
    // Check budget alerts logic
    console.log("Checking budget alerts");
  }
);
