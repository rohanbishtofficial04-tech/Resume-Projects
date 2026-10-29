"use client";

import { useMemo, useState } from "react";
import { Plus, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FinancePageLoading, PageHeading, TransactionDialog, TransactionSearch, TransactionTable, useFinanceHydrated } from "@/components/spendwise/Shared";
import { useSpendWise } from "@/components/spendwise/SpendWiseProvider";
import type { Transaction, TransactionType } from "@/lib/spendwise";

export default function TransactionsPage() {
  const { data } = useSpendWise();
  const hydrated = useFinanceHydrated();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | TransactionType>("all");
  const [category, setCategory] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState<"date" | "amount">("date");
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc");
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<Transaction | undefined>();

  const transactions = useMemo(() => data.transactions.filter((transaction) =>
    transaction.name.toLowerCase().includes(query.toLowerCase().trim()) &&
    (type === "all" || transaction.type === type) &&
    (category === "all" || transaction.categoryId === category) &&
    (!from || transaction.date >= from) &&
    (!to || transaction.date <= to),
  ).sort((a, b) => {
    const comparison = sort === "date" ? a.date.localeCompare(b.date) : a.amount - b.amount;
    return sortDirection === "desc" ? -comparison : comparison;
  }), [category, data.transactions, from, query, sort, sortDirection, to, type]);

  function edit(transaction: Transaction) {
    setEditing(transaction);
    setDialog(true);
  }
  function closeDialog() {
    setDialog(false);
    setEditing(undefined);
  }

  if (!hydrated) return <FinancePageLoading />;

  return <div className="mx-auto max-w-[1440px] pb-10">
    <PageHeading eyebrow="Your activity" title="Transactions" description="Every dollar in and out, all in one place."
      action={<Button onClick={() => { setEditing(undefined); setDialog(true); }}><Plus className="mr-2 size-4" />Add transaction</Button>} />
    <section className="rounded-xl border bg-card">
      <div className="flex flex-col gap-4 border-b p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="font-semibold">All transactions</h2><p className="mt-1 text-xs text-muted-foreground">{transactions.length} transaction{transactions.length === 1 ? "" : "s"}</p></div>
          <TransactionSearch value={query} onChange={setQuery} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="mr-1 size-4 text-muted-foreground" />
          <select aria-label="Filter by transaction type" value={type} onChange={(event) => setType(event.target.value as "all" | TransactionType)} className="h-9 rounded-md border bg-background px-3 text-sm">
            <option value="all">All types</option><option value="income">Income</option><option value="expense">Expenses</option>
          </select>
          <select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm">
            <option value="all">All categories</option>{data.categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">From <Input aria-label="Start date" type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="h-9 w-[145px]" /></label>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">To <Input aria-label="End date" type="date" value={to} onChange={(event) => setTo(event.target.value)} className="h-9 w-[145px]" /></label>
          <select aria-label="Sort transactions" value={`${sort}-${sortDirection}`} onChange={(event) => {
            const [nextSort, nextDirection] = event.target.value.split("-") as ["date" | "amount", "asc" | "desc"];
            setSort(nextSort);
            setSortDirection(nextDirection);
          }} className="h-9 rounded-md border bg-background px-3 text-sm">
            <option value="date-desc">Newest first</option><option value="date-asc">Oldest first</option><option value="amount-desc">Amount: high to low</option><option value="amount-asc">Amount: low to high</option>
          </select>
        </div>
      </div>
      <div className="p-3 sm:p-4"><TransactionTable transactions={transactions} onEdit={edit} /></div>
    </section>
    <TransactionDialog key={editing?.id ?? String(dialog)} open={dialog} onClose={closeDialog} transaction={editing} />
  </div>;
}
