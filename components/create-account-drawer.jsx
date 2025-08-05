// components/create-account-drawer.jsx
"use client";

import { useState } from "react";
import { createAccount } from "@/actions/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function CreateAccountDrawer({ children }) {
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [type, setType] = useState("CHECKING");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAccount({
        name,
        balance: parseFloat(balance),
        type,
        isDefault: false,
      });
      toast.success("Account created successfully");
      setName("");
      setBalance("");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      {children}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Account Name"
          required
        />
        <Input
          type="number"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
          placeholder="Initial Balance"
          required
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="CHECKING">Checking</option>
          <option value="SAVINGS">Savings</option>
        </select>
        <Button type="submit">Create Account</Button>
      </form>
    </div>
  );
}
