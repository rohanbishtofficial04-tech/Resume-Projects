"use client";

import { useState } from "react";
import { AlertTriangle, Pencil, Plus, Target, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { FinancePageLoading, PageHeading, useFinanceHydrated } from "@/components/spendwise/Shared";
import { useSpendWise } from "@/components/spendwise/SpendWiseProvider";
import { formatCurrency, getBudgetSpent, getCategory, type Budget } from "@/lib/spendwise";

function BudgetDialog({ open, onClose, budget }: { open: boolean; onClose: () => void; budget?: Budget }) {
  const { data, saveBudget } = useSpendWise();
  const [categoryId, setCategoryId] = useState(budget?.categoryId ?? "");
  const [limit, setLimit] = useState(budget ? String(budget.limit) : "");
  const [error, setError] = useState("");
  const categories = data.categories.filter((category) => category.type === "expense");
  const used = new Set(data.budgets.filter((item) => item.id !== budget?.id).map((item) => item.categoryId));
  if (!open) return null;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(limit);
    if (!categories.some((item) => item.id === categoryId) || !Number.isFinite(amount) || amount <= 0) {
      setError("Choose a spending category and enter a positive monthly limit.");
      return;
    }
    if (used.has(categoryId)) {
      setError("A budget already exists for this category.");
      return;
    }
    saveBudget({ id: budget?.id ?? crypto.randomUUID(), categoryId, limit: amount });
    onClose();
  }

  return <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-black/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="budget-dialog-title" className="my-auto w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl">
      <h2 id="budget-dialog-title" className="text-lg font-semibold">{budget ? "Edit budget" : "Create a budget"}</h2>
      <p className="mb-5 mt-1 text-sm text-muted-foreground">Set a monthly spending limit for a category.</p>
      <form className="space-y-4" onSubmit={submit}>
        <label className="block space-y-1.5 text-sm font-medium">Category
          <select required value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
            <option value="">Select category</option>{categories.map((category) => <option key={category.id} value={category.id} disabled={used.has(category.id)}>{category.name}</option>)}
          </select>
        </label>
        <label className="block space-y-1.5 text-sm font-medium">Monthly limit
          <Input required type="number" min="0.01" step="0.01" inputMode="decimal" placeholder="0.00" value={limit} onChange={(event) => setLimit(event.target.value)} />
        </label>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit">{budget ? "Save changes" : "Create budget"}</Button></div>
      </form>
    </section>
  </div>;
}

export default function BudgetsPage() {
  const { data, deleteBudget } = useSpendWise();
  const hydrated = useFinanceHydrated();
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<Budget | undefined>();
  const currency = data.settings.currency;
  const formatAmount = (amount: number) => formatCurrency(amount, currency, data.settings.fractionDigits);
  const totalLimit = data.budgets.reduce((sum, item) => sum + item.limit, 0);
  const totalSpent = data.budgets.reduce((sum, item) => sum + getBudgetSpent(data.transactions, item.categoryId), 0);

  if (!hydrated) return <FinancePageLoading />;

  return <div className="mx-auto max-w-[1200px] pb-10">
    <PageHeading eyebrow="Spend with intention" title="Budgets" description="Set category limits and keep your monthly spending on track."
      action={<Button onClick={() => { setEditing(undefined); setDialog(true); }}><Plus className="mr-2 size-4" />Create budget</Button>} />
    <div className="mb-5 grid gap-4 sm:grid-cols-3">
      <article className="min-w-0 rounded-xl border bg-card p-5"><p className="text-sm text-muted-foreground">Total budgeted</p><p className="mt-3 text-2xl font-semibold">{formatAmount(totalLimit)}</p><p className="mt-1 text-xs text-muted-foreground">Across {data.budgets.length} categories</p></article>
      <article className="min-w-0 rounded-xl border bg-card p-5"><p className="text-sm text-muted-foreground">Total spent</p><p className="mt-3 text-2xl font-semibold">{formatAmount(totalSpent)}</p><p className="mt-1 text-xs text-muted-foreground">Based on this month’s expenses</p></article>
      <article className="min-w-0 rounded-xl border bg-card p-5"><p className="text-sm text-muted-foreground">Remaining</p><p className={`mt-3 text-2xl font-semibold ${totalLimit - totalSpent < 0 ? "text-destructive" : ""}`}>{formatAmount(totalLimit - totalSpent)}</p><p className="mt-1 text-xs text-muted-foreground">Budgeted amount minus spending</p></article>
    </div>
    {data.budgets.length ? <section className="grid gap-4 md:grid-cols-2">
      {data.budgets.map((budget) => {
        const category = getCategory(data, budget.categoryId);
        const spent = getBudgetSpent(data.transactions, budget.categoryId);
        const percent = spent / budget.limit * 100;
        const over = percent > 100;
        const close = percent >= 80 && !over;
        return <article key={budget.id} className="min-w-0 rounded-xl border bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted" style={{ color: category?.color }}><Target className="size-5" /></span>
              <div className="min-w-0"><h2 className="truncate font-semibold">{category?.name ?? "Uncategorized"}</h2><p className="mt-0.5 truncate text-xs text-muted-foreground">Monthly spending limit</p></div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" aria-label={`Edit ${category?.name} budget`} onClick={() => { setEditing(budget); setDialog(true); }}><Pencil className="size-4" /></Button>
              <Button variant="ghost" size="icon" aria-label={`Delete ${category?.name} budget`} onClick={() => { if (window.confirm(`Delete the ${category?.name ?? "category"} budget?`)) deleteBudget(budget.id); }}><Trash2 className="size-4 text-muted-foreground" /></Button>
            </div>
          </div>
          <div className="mt-6 flex items-end justify-between"><div><p className="text-xs text-muted-foreground">Spent</p><p className="mt-1 text-lg font-semibold">{formatAmount(spent)}</p></div><div className="text-right"><p className="text-xs text-muted-foreground">Monthly limit</p><p className="mt-1 text-lg font-semibold">{formatAmount(budget.limit)}</p></div></div>
          <Progress value={Math.min(percent, 100)} aria-label={`${category?.name ?? "Category"} budget ${Math.round(percent)}% used`} className={`mt-3 ${over ? "[&>div]:bg-destructive" : close ? "[&>div]:bg-amber-500" : ""}`} />
          <p className={`mt-2 flex items-center gap-1.5 text-xs ${over ? "text-destructive" : close ? "text-amber-600" : "text-muted-foreground"}`}>
            {(over || close) && <AlertTriangle className="size-3.5" />}
            {over ? `${formatAmount(spent - budget.limit)} over budget` : close ? `${Math.round(percent)}% used · approaching limit` : `${formatAmount(budget.limit - spent)} remaining`}
          </p>
        </article>;
      })}
    </section> : <div className="rounded-xl border border-dashed bg-card py-16 text-center"><Target className="mx-auto size-9 text-muted-foreground" /><h2 className="mt-3 font-semibold">No budgets yet</h2><p className="mt-1 text-sm text-muted-foreground">Create a category budget to start tracking your spending.</p><Button className="mt-5" onClick={() => setDialog(true)}><Plus className="mr-2 size-4" />Create your first budget</Button></div>}
    <BudgetDialog key={editing?.id ?? String(dialog)} open={dialog} onClose={() => { setDialog(false); setEditing(undefined); }} budget={editing} />
  </div>;
}
