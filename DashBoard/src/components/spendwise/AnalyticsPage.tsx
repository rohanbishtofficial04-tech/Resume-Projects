"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Input } from "@/components/ui/input";
import { FinancePageLoading, PageHeading, StatCard, SectionTitle, useFinanceHydrated } from "@/components/spendwise/Shared";
import { useSpendWise } from "@/components/spendwise/SpendWiseProvider";
import { ArrowDownLeft, ArrowUpRight, CircleDollarSign, ReceiptText } from "lucide-react";
import { formatCurrency, getTotals } from "@/lib/spendwise";

function monthSeries(transactions: ReturnType<typeof useSpendWise>["data"]["transactions"]) {
  const months = new Map<string, { income: number; expense: number }>();
  for (const transaction of transactions) {
    const key = transaction.date.slice(0, 7);
    const totals = months.get(key) ?? { income: 0, expense: 0 };
    totals[transaction.type] += transaction.amount;
    months.set(key, totals);
  }
  return [...months.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, totals]) => ({
    month: new Date(`${key}-01T12:00:00`).toLocaleDateString(undefined, { month: "short", year: "2-digit" }),
    income: totals.income,
    expenses: totals.expense,
    savings: totals.income - totals.expense,
  }));
}

export default function AnalyticsPage() {
  const { data } = useSpendWise();
  const hydrated = useFinanceHydrated();
  const today = new Date();
  const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, 1);
  const dateValue = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const [from, setFrom] = useState(dateValue(sixMonthsAgo));
  const [to, setTo] = useState(dateValue(today));
  const filtered = useMemo(() => data.transactions.filter((item) => item.date >= from && item.date <= to), [data.transactions, from, to]);
  const totals = getTotals(filtered);
  const currency = data.settings.currency;
  const formatAmount = (amount: number) => formatCurrency(amount, currency, data.settings.fractionDigits);
  const chartData = monthSeries(filtered);
  const categoryData = data.categories.filter((category) => category.type === "expense").map((category) => ({
    name: category.name,
    amount: filtered.filter((transaction) => transaction.type === "expense" && transaction.categoryId === category.id).reduce((sum, item) => sum + item.amount, 0),
    color: category.color,
  })).filter((category) => category.amount > 0).sort((a, b) => b.amount - a.amount);

  if (!hydrated) return <FinancePageLoading />;

  return <div className="mx-auto max-w-[1440px] pb-10">
    <PageHeading eyebrow="Understand your money" title="Analytics" description="Explore your income, expenses, and savings over time." />
    <section className="mb-5 flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
      <div className="mr-auto"><h2 className="text-sm font-semibold">Date range</h2><p className="mt-1 text-xs text-muted-foreground">Charts and summaries update to match your selection.</p></div>
      <label className="space-y-1 text-xs text-muted-foreground">From<Input aria-label="Analytics start date" type="date" value={from} max={to} onChange={(event) => setFrom(event.target.value)} className="h-9 w-[150px]" /></label>
      <label className="space-y-1 text-xs text-muted-foreground">To<Input aria-label="Analytics end date" type="date" value={to} min={from} onChange={(event) => setTo(event.target.value)} className="h-9 w-[150px]" /></label>
    </section>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Income" value={formatAmount(totals.income)} detail="Selected date range" icon={<ArrowDownLeft className="size-4" />} tone="green" />
      <StatCard title="Expenses" value={formatAmount(totals.expense)} detail="Selected date range" icon={<ArrowUpRight className="size-4" />} tone="orange" />
      <StatCard title="Net savings" value={formatAmount(totals.income - totals.expense)} detail="Income minus expenses" icon={<CircleDollarSign className="size-4" />} tone="blue" />
      <StatCard title="Transactions" value={String(filtered.length)} detail="In the selected date range" icon={<ReceiptText className="size-4" />} />
    </section>
    <section className="mt-5 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
      <article className="rounded-xl border bg-card p-5">
        <SectionTitle title="Income & expense trends" description="Monthly cash flow within the selected period" />
        {filtered.length ? <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} width={58} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} tickFormatter={(value: number) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value)} />
              <Tooltip cursor={false} formatter={(value) => formatAmount(Number(value))} contentStyle={{ background: "var(--popover)", borderColor: "var(--border)", borderRadius: 12, color: "var(--popover-foreground)" }} labelStyle={{ color: "var(--popover-foreground)" }} itemStyle={{ color: "var(--popover-foreground)" }} />
              <Line dataKey="income" name="Income" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line dataKey="expenses" name="Expenses" stroke="#94a3b8" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div> : <div className="grid h-[300px] place-items-center text-center text-sm text-muted-foreground">No transaction data in this date range.</div>}
        <div className="mt-2 flex justify-center gap-5 text-xs text-muted-foreground"><span className="flex items-center gap-2"><i className="size-2.5 rounded-full bg-emerald-500" />Income</span><span className="flex items-center gap-2"><i className="size-2.5 rounded-full bg-slate-400" />Expenses</span></div>
      </article>
      <article className="rounded-xl border bg-card p-5">
        <SectionTitle title="Spending by category" description="Expense totals in this date range" />
        {categoryData.length ? <>
          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="amount" nameKey="name" innerRadius={56} outerRadius={88} paddingAngle={3} stroke="none">
                  {categoryData.map((item) => <Cell key={item.name} fill={item.color} />)}
                </Pie>
                <Tooltip cursor={false} formatter={(value) => formatAmount(Number(value))} contentStyle={{ background: "var(--popover)", borderColor: "var(--border)", borderRadius: 12, color: "var(--popover-foreground)" }} labelStyle={{ color: "var(--popover-foreground)" }} itemStyle={{ color: "var(--popover-foreground)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="max-h-44 space-y-3 overflow-y-auto">
            {categoryData.map((item) => <div key={item.name} className="flex items-center justify-between gap-3 text-sm"><span className="flex items-center gap-2"><i className="size-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span><span className="font-medium tabular-nums">{formatAmount(item.amount)}</span></div>)}
          </div>
        </> : <div className="grid h-[300px] place-items-center text-center text-sm text-muted-foreground">No expense data in this date range.</div>}
      </article>
    </section>
    <article className="mt-5 rounded-xl border bg-card p-5">
      <SectionTitle title="Monthly savings" description="Income minus expenses by month" />
      {filtered.length ? <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} width={58} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} tickFormatter={(value: number) => value >= 1000 || value <= -1000 ? `${(value / 1000).toFixed(1)}k` : String(value)} />
            <Tooltip cursor={false} formatter={(value) => formatAmount(Number(value))} contentStyle={{ background: "var(--popover)", borderColor: "var(--border)", borderRadius: 12, color: "var(--popover-foreground)" }} labelStyle={{ color: "var(--popover-foreground)" }} itemStyle={{ color: "var(--popover-foreground)" }} />
            <Bar dataKey="savings" name="Net savings" fill="#22c55e" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div> : <div className="grid h-[260px] place-items-center text-center text-sm text-muted-foreground">No transaction data in this date range.</div>}
      {categoryData.length > 0 && <p className="mt-3 text-xs text-muted-foreground">Top spending category: <span className="font-medium text-foreground">{categoryData[0].name}</span></p>}
    </article>
  </div>;
}
