"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, CalendarDays, CircleDollarSign, Pencil, Plus, Sparkles, Wallet, X } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { FinancePageLoading, PageHeading, SectionTitle, StatCard, TransactionDialog, TransactionTable, useFinanceHydrated } from "@/components/spendwise/Shared";
import { useSpendWise } from "@/components/spendwise/SpendWiseProvider";
import { formatCurrency, getBudgetSpent, getCategory, getTotals, isSameMonth } from "@/lib/spendwise";

function OpeningBalanceDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data, updateSettings } = useSpendWise();
  const [amount, setAmount] = useState(String(data.settings.openingBalance));
  const [error, setError] = useState("");

  if (!open) return null;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const balance = Number(amount);
    if (!Number.isFinite(balance) || balance < 0) {
      setError("Enter a valid starting balance of zero or more.");
      return;
    }
    updateSettings({ openingBalance: balance });
    onClose();
  }

  return <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-black/50 p-4" onMouseDown={(event) => {
    if (event.target === event.currentTarget) onClose();
  }}>
    <section role="dialog" aria-modal="true" aria-labelledby="balance-dialog-title" className="my-auto w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 id="balance-dialog-title" className="text-lg font-semibold">Set your starting balance</h2>
          <p className="mt-1 text-sm text-muted-foreground">Enter your account balance before the transactions you track here.</p>
        </div>
        <Button type="button" variant="ghost" size="icon" aria-label="Close dialog" onClick={onClose}><X className="size-4" /></Button>
      </div>
      <form className="space-y-4" onSubmit={submit}>
        <label className="block space-y-1.5 text-sm font-medium" htmlFor="opening-balance">Starting balance ({data.settings.currency})
          <Input id="opening-balance" aria-label="Starting balance" type="number" min="0" step="0.01" inputMode="decimal" autoFocus value={amount} onChange={(event) => setAmount(event.target.value)} />
        </label>
        <p className="text-xs text-muted-foreground">This updates Total balance only. It isn’t counted as income or monthly savings.</p>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save balance</Button>
        </div>
      </form>
    </section>
  </div>;
}

function monthSeries(transactions: ReturnType<typeof useSpendWise>["data"]["transactions"]) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (6 - index));
    const monthTransactions = transactions.filter((item) => {
      const current = new Date(`${item.date}T12:00:00`);
      return current.getFullYear() === date.getFullYear() && current.getMonth() === date.getMonth();
    });
    const totals = getTotals(monthTransactions);
    return { month: date.toLocaleDateString(undefined, { month: "short", year: "2-digit" }), income: totals.income, expenses: totals.expense };
  });
}

export default function DashboardPage() {
  const { data } = useSpendWise();
  const hydrated = useFinanceHydrated();
  const [dialog, setDialog] = useState(false);
  const [balanceDialog, setBalanceDialog] = useState(false);
  const monthTransactions = useMemo(() => data.transactions.filter((item) => isSameMonth(item.date)), [data.transactions]);
  const totals = getTotals(monthTransactions);
  const totalBalance = data.settings.openingBalance + getTotals(data.transactions).income - getTotals(data.transactions).expense;
  const chartData = monthSeries(data.transactions);
  const categoryData = data.categories
    .filter((category) => category.type === "expense")
    .map((category) => ({
      name: category.name,
      amount: monthTransactions.filter((transaction) => transaction.categoryId === category.id).reduce((sum, item) => sum + item.amount, 0),
      color: category.color,
    }))
    .filter((category) => category.amount > 0)
    .sort((a, b) => b.amount - a.amount);
  const recent = [...data.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const currency = data.settings.currency;
  const displayName = data.settings.displayName.trim();
  const formatAmount = (amount: number) => formatCurrency(amount, currency, data.settings.fractionDigits);
  const savingsRate = totals.income > 0 ? Math.max(0, Math.round((totals.income - totals.expense) / totals.income * 100)) : 0;

  if (!hydrated) return <FinancePageLoading />;

  return <div className="mx-auto max-w-[1440px] pb-10">
    <PageHeading eyebrow="Your money, in focus" title={displayName ? <>Good to see you, <span className="font-bold text-primary">{displayName}</span></> : "Good to see you"} description="Here’s how your finances are looking this month."
      action={<Button onClick={() => setDialog(true)}><Plus className="mr-2 size-4" />Add transaction</Button>} />
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Total balance" value={formatAmount(totalBalance)} detail="Opening balance + all-time cash flow" icon={<Wallet className="size-4" />} tone="blue"
        action={<Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-primary" onClick={() => setBalanceDialog(true)}><Pencil className="mr-1 size-3" />{data.settings.openingBalance > 0 ? "Edit balance" : "Set balance"}</Button>} />
      <StatCard title="Monthly income" value={formatAmount(totals.income)} detail="Income received this month" icon={<ArrowDownLeft className="size-4" />} tone="green" />
      <StatCard title="Monthly expenses" value={formatAmount(totals.expense)} detail="Spending so far this month" icon={<ArrowUpRight className="size-4" />} tone="orange" />
      <StatCard title="Monthly savings" value={formatAmount(totals.income - totals.expense)} detail={`${savingsRate}% of this month’s income`} icon={<CircleDollarSign className="size-4" />} />
    </section>

    <section className="mt-6 grid gap-5 xl:grid-cols-[1.65fr_1fr]">
      <article className="min-w-0 rounded-xl border bg-card p-5">
        <SectionTitle title="Income vs. expenses" description="A six-month view of your cash flow" />
        {data.transactions.length ? <>
          <div className="h-[270px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={5} margin={{ left: 0, right: 6, top: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} width={58} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} tickFormatter={(value: number) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value)} />
                <Tooltip cursor={false} formatter={(value) => formatAmount(Number(value))} contentStyle={{ background: "var(--popover)", borderColor: "var(--border)", borderRadius: 12, color: "var(--popover-foreground)" }} labelStyle={{ color: "var(--popover-foreground)" }} itemStyle={{ color: "var(--popover-foreground)" }} />
                <Bar dataKey="income" name="Income" fill="#22c55e" radius={[5, 5, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#94a3b8" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center justify-center gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-2"><i className="size-2.5 rounded-full bg-emerald-500" />Income</span>
            <span className="flex items-center gap-2"><i className="size-2.5 rounded-full bg-slate-400" />Expenses</span>
          </div>
        </> : <div className="grid min-h-[270px] place-items-center text-center text-sm text-muted-foreground">Add transactions to see your income and expenses over time.</div>}
      </article>
      <article className="min-w-0 rounded-xl border bg-card p-5">
        <SectionTitle title="Spending breakdown" description="This month by category" />
        {categoryData.length ? <>
          <div className="mx-auto max-w-[280px]">
            <div className="h-[160px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="amount" nameKey="name" innerRadius={46} outerRadius={68} paddingAngle={3} stroke="none">
                    {categoryData.map((item) => <Cell key={item.name} fill={item.color} />)}
                  </Pie>
                  <Tooltip cursor={false} formatter={(value) => formatAmount(Number(value))} contentStyle={{ background: "var(--popover)", borderColor: "var(--border)", borderRadius: 12, color: "var(--popover-foreground)" }} labelStyle={{ color: "var(--popover-foreground)" }} itemStyle={{ color: "var(--popover-foreground)" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center">
              <p className="text-base font-semibold tabular-nums">{formatAmount(totals.expense)}</p>
              <p className="text-xs text-muted-foreground">spent this month</p>
            </div>
          </div>
          <div className="mt-2 space-y-3">
            {categoryData.slice(0, 4).map((category) => <div key={category.name} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2"><i className="size-2 rounded-full" style={{ backgroundColor: category.color }} />{category.name}</span>
              <span className="font-medium tabular-nums">{formatAmount(category.amount)}</span>
            </div>)}
          </div>
        </> : <div className="grid min-h-[270px] place-items-center text-center text-sm text-muted-foreground">No expenses recorded this month yet.</div>}
      </article>
    </section>

    <section className="mt-5 grid gap-5 xl:grid-cols-[1.55fr_1fr]">
      <article className="min-w-0 rounded-xl border bg-card p-5">
        <SectionTitle title="Recent transactions" description="Your latest income and expenses"
          action={<Button asChild variant="ghost" size="sm"><Link href="/transactions">View all</Link></Button>} />
        <TransactionTable compact transactions={recent} />
      </article>
      <article className="min-w-0 rounded-xl border bg-card p-5">
        <SectionTitle title="Monthly budgets" description="How much you’ve used so far"
          action={<Button asChild variant="ghost" size="sm"><Link href="/budgets">Manage</Link></Button>} />
        <div className="space-y-5">
          {data.budgets.slice(0, 4).map((budget) => {
            const category = getCategory(data, budget.categoryId);
            const spent = getBudgetSpent(data.transactions, budget.categoryId);
            const percent = Math.min(100, spent / budget.limit * 100);
            const over = spent > budget.limit;
            return <div key={budget.id}>
              <div className="mb-2 flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2 font-medium"><i className="size-2 rounded-full" style={{ backgroundColor: category?.color }} />{category?.name ?? "Category"}</span>
                <span className={`text-xs tabular-nums ${over ? "font-medium text-destructive" : "text-muted-foreground"}`}>{formatAmount(spent)} / {formatAmount(budget.limit)}</span>
              </div>
              <Progress value={percent} aria-label={`${category?.name ?? "Category"} budget ${Math.round(percent)}% used`} className={over ? "[&>div]:bg-destructive" : ""} />
            </div>;
          })}
          {!data.budgets.length && <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">No budgets yet. Create one to start tracking.</div>}
        </div>
      </article>
    </section>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-muted/40 p-5">
      <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary"><Sparkles className="size-5" /></span><div><p className="font-medium">You’re building good habits</p><p className="mt-0.5 text-sm text-muted-foreground">Your savings rate this month is {savingsRate}%.</p></div></div>
      <p className="flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays className="size-4" />{new Date().toLocaleDateString(undefined, { month: "long", year: "numeric" })}</p>
    </div>
    <TransactionDialog key={`transaction-${dialog}`} open={dialog} onClose={() => setDialog(false)} />
    <OpeningBalanceDialog key={`balance-${balanceDialog}`} open={balanceDialog} onClose={() => setBalanceDialog(false)} />
  </div>;
}
