"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ReceiptScanner } from "./receipt-scanner";
import useFetch from "@/hooks/use-fetch";
import { createTransaction, updateTransaction } from "@/actions/transaction";

const TransactionSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1),
  description: z.string().optional(),
  accountId: z.string().min(1),
  date: z.string().min(1),
});

export function AddTransactionForm({
  accounts,
  categories,
  editMode = false,
  initialData = null,
}) {
  const router = useRouter();
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    resolver: zodResolver(TransactionSchema),
    defaultValues: initialData || {
      amount: 0,
      type: "EXPENSE",
      category: "",
      description: "",
      accountId:
        accounts.find((acc) => acc.isDefault)?.id || accounts[0]?.id || "",
      date: new Date().toISOString().split("T")[0],
    },
  });

  const {
    loading: transactionLoading,
    fn: transactionFn,
    data: transactionResult,
  } = useFetch(editMode ? updateTransaction : createTransaction);

  const type = watch("type");

  useEffect(() => {
    if (transactionResult?.success && !transactionLoading) {
      toast.success(
        editMode
          ? "Transaction updated successfully"
          : "Transaction created successfully"
      );
      reset();
      router.push(`/account/${transactionResult.data.accountId}`);
    }
    if (transactionResult?.error) {
      toast.error(transactionResult.error);
    }
  }, [transactionResult, transactionLoading, editMode, reset, router]);

  const onSubmit = async (data) => {
    await transactionFn({
      ...data,
      amount: parseFloat(data.amount),
      id: editMode ? initialData.id : undefined,
    });
  };

  const handleScanComplete = (scannedData) => {
    setValue("amount", scannedData.amount);
    setValue("description", scannedData.description);
    setValue("category", scannedData.category);
    setValue("date", new Date(scannedData.date).toISOString().split("T")[0]);
  };

  const filteredCategories = categories.filter(
    (category) => category.type === type
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="accountId">Account</Label>
          <Select
            value={watch("accountId")}
            onValueChange={(value) => setValue("accountId", value)}
          >
            <SelectTrigger id="accountId">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select
            value={type}
            onValueChange={(value) => setValue("type", value)}
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={watch("category")}
          onValueChange={(value) => setValue("category", value)}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {filteredCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          {...register("amount", { valueAsNumber: true })}
          placeholder="Enter amount"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          {...register("description")}
          placeholder="Enter description"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          {...register("date")}
          placeholder="Select date"
        />
      </div>
      <ReceiptScanner onScanComplete={handleScanComplete} />
      <Button type="submit" disabled={transactionLoading} className="w-full">
        {transactionLoading
          ? editMode
            ? "Updating Transaction..."
            : "Creating Transaction..."
          : editMode
          ? "Update Transaction"
          : "Create Transaction"}
      </Button>
    </form>
  );
}
