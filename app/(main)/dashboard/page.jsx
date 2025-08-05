import { getUserAccounts, getDashboardData } from "@/actions/dashboard";
import { getBudget } from "@/actions/budget";
import CreateAccountDrawer from "@/components/create-account-drawer.jsx";
import { BudgetProgress } from "@/app/_components/budget-progress";
import { DashboardOverview } from "@/app/_components/transaction-overview";
import { AccountCard } from "@/app/_components/account-card";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default async function DashboardPage() {
  const accounts = await getUserAccounts();
  const transactions = await getDashboardData();
  const budgetResult = await getBudget();
  const initialBudget = budgetResult.success ? budgetResult.data : null;
  const currentExpenses = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="px-5 space-y-6">
      <BudgetProgress
        initialBudget={initialBudget}
        currentExpenses={currentExpenses}
      />
      <DashboardOverview accounts={accounts} transactions={transactions} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))}
        <CreateAccountDrawer>
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
            <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full py-8">
              <Plus className="h-10 w-10 mb-2" />
              <p className="text-sm font-medium">Add New Account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>
      </div>
    </div>
  );
}
