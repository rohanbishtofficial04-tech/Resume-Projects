"use client";

import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Plus, Tag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FinancePageLoading, PageHeading, useFinanceHydrated } from "@/components/spendwise/Shared";
import { useSpendWise } from "@/components/spendwise/SpendWiseProvider";
import { formatCurrency, type TransactionType } from "@/lib/spendwise";

const COLORS = ["#f59e0b", "#38bdf8", "#a78bfa", "#fb7185", "#34d399", "#f472b6", "#60a5fa", "#14b8a6"];

export default function CategoriesPage() {
  const { data, addCategory, deleteCategory } = useSpendWise();
  const hydrated = useFinanceHydrated();
  const [name, setName] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const currency = data.settings.currency;
  const formatAmount = (amount: number) => formatCurrency(amount, currency, data.settings.fractionDigits);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError("Enter a category name.");
      return;
    }
    if (data.categories.some((category) => category.type === type && category.name.toLowerCase() === cleanName.toLowerCase())) {
      setError("A category with this name already exists.");
      return;
    }
    addCategory({ id: crypto.randomUUID(), name: cleanName, type, color: COLORS[data.categories.length % COLORS.length] });
    setName("");
    setError("");
    setNotice(`${cleanName} category added.`);
  }

  function removeCategory(id: string, label: string) {
    const inUse = data.transactions.some((item) => item.categoryId === id) || data.budgets.some((item) => item.categoryId === id);
    if (inUse) {
      setNotice(`"${label}" is used by a transaction or budget, so it can’t be deleted yet.`);
      return;
    }
    if (window.confirm(`Delete the "${label}" category?`)) {
      deleteCategory(id);
      setNotice(`${label} category deleted.`);
    }
  }

  if (!hydrated) return <FinancePageLoading />;

  return <div className="mx-auto max-w-[1100px] pb-10">
    <PageHeading eyebrow="Keep things organized" title="Categories" description="Group income and expenses so your reports stay meaningful." />
    <section className="mb-5 rounded-xl border bg-card p-5">
      <h2 className="font-semibold">Add a category</h2>
      <p className="mt-1 text-sm text-muted-foreground">New categories will be available in transaction forms and filters.</p>
      <form onSubmit={submit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="category-name">Category name</label>
        <Input id="category-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Pet care" maxLength={40} className="sm:max-w-sm" />
        <label className="sr-only" htmlFor="category-type">Category type</label>
        <select id="category-type" value={type} onChange={(event) => setType(event.target.value as TransactionType)} className="h-10 rounded-md border bg-background px-3 text-sm"><option value="expense">Expense</option><option value="income">Income</option></select>
        <Button type="submit"><Plus className="mr-2 size-4" />Add category</Button>
      </form>
      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
      {notice && <p aria-live="polite" className="mt-3 text-sm text-muted-foreground">{notice}</p>}
    </section>
    <div className="grid gap-5 lg:grid-cols-2">
      {(["expense", "income"] as const).map((kind) => {
        const categories = data.categories.filter((category) => category.type === kind);
        const Icon = kind === "income" ? ArrowDownLeft : ArrowUpRight;
        return <section key={kind} className="min-w-0 rounded-xl border bg-card p-5">
          <div className="mb-4 flex items-center justify-between"><div><h2 className="font-semibold">{kind === "income" ? "Income categories" : "Expense categories"}</h2><p className="mt-1 text-xs text-muted-foreground">{categories.length} categories</p></div><span className={`grid size-9 place-items-center rounded-lg ${kind === "income" ? "bg-emerald-500/10 text-emerald-600" : "bg-orange-500/10 text-orange-600"}`}><Icon className="size-4" /></span></div>
          <div className="divide-y">
            {categories.map((category) => {
              const total = data.transactions.filter((item) => item.categoryId === category.id).reduce((sum, item) => sum + item.amount, 0);
              const count = data.transactions.filter((item) => item.categoryId === category.id).length;
              return <div key={category.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="flex min-w-0 items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted" style={{ color: category.color }}><Tag className="size-4" /></span><div className="min-w-0"><p className="truncate text-sm font-medium">{category.name}</p><p className="text-xs text-muted-foreground">{count} transaction{count === 1 ? "" : "s"}</p></div></div>
                <div className="ml-auto flex items-center gap-3"><span className="text-sm font-medium tabular-nums">{formatAmount(total)}</span><Button variant="ghost" size="icon" aria-label={`Delete ${category.name}`} onClick={() => removeCategory(category.id, category.name)}><Trash2 className="size-4 text-muted-foreground" /></Button></div>
              </div>;
            })}
          </div>
        </section>;
      })}
    </div>
  </div>;
}
