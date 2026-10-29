"use client";

import { useEffect, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Pencil, Search, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSpendWise } from "@/components/spendwise/SpendWiseProvider";
import {
  formatCurrency,
  getCategory,
  type Transaction,
  type TransactionType,
} from "@/lib/spendwise";

export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function useFinanceHydrated() {
  const { ready } = useSpendWise();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted && ready;
}

export function FinancePageLoading() {
  return <div role="status" aria-label="Loading saved finance data" aria-busy="true" className="mx-auto min-h-64 max-w-[1440px]" />;
}

function todayString() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function TransactionDialog({
  open,
  onClose,
  transaction,
  initialType = "expense",
}: {
  open: boolean;
  onClose: () => void;
  transaction?: Transaction;
  initialType?: TransactionType;
}) {
  const { data, saveTransaction } = useSpendWise();
  const [error, setError] = useState("");
  const [type, setType] = useState<TransactionType>(transaction?.type ?? initialType);
  const categories = data.categories.filter((category) => category.type === type);
  const [name, setName] = useState(transaction?.name ?? "");
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : "");
  const [categoryId, setCategoryId] = useState(transaction?.categoryId ?? "");
  const [date, setDate] = useState(transaction?.date ?? todayString());
  const [paymentMethod, setPaymentMethod] = useState(transaction?.paymentMethod ?? "Credit card");

  if (!open) return null;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedAmount = Number(amount);
    if (!name.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0 ||
      !date || Number.isNaN(new Date(`${date}T12:00:00`).getTime()) ||
      !categories.some((category) => category.id === categoryId) || !paymentMethod.trim()) {
      setError("Enter a name, positive amount, valid date, category, and payment method.");
      return;
    }
    saveTransaction({
      id: transaction?.id ?? crypto.randomUUID(),
      name: name.trim(),
      amount: parsedAmount,
      categoryId,
      date,
      paymentMethod: paymentMethod.trim(),
      type,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-black/50 p-4" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section role="dialog" aria-modal="true" aria-labelledby="transaction-dialog-title" className="my-auto w-full max-w-lg rounded-2xl border bg-card p-6 shadow-xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="transaction-dialog-title" className="text-lg font-semibold">{transaction ? "Edit transaction" : "Add transaction"}</h2>
            <p className="mt-1 text-sm text-muted-foreground">Keep your finances up to date.</p>
          </div>
          <Button type="button" variant="ghost" size="icon" aria-label="Close dialog" onClick={onClose}><X className="size-4" /></Button>
        </div>
        <form className="space-y-4" onSubmit={submit}>
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
            {(["expense", "income"] as const).map((kind) => (
              <button key={kind} type="button" disabled={Boolean(transaction)} onClick={() => {
                if (kind !== type) {
                  setType(kind);
                  setCategoryId("");
                  setError("");
                }
              }} className={`rounded-md px-3 py-2 text-sm font-medium capitalize ${kind === type ? "bg-background shadow-sm" : "text-muted-foreground"}`}>
                {kind}
              </button>
            ))}
          </div>
          <label className="block space-y-1.5 text-sm font-medium">Name
            <Input required maxLength={80} autoFocus placeholder={type === "income" ? "e.g. Monthly salary" : "e.g. Grocery shopping"} value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label className="block space-y-1.5 text-sm font-medium">Amount
            <Input required type="number" min="0.01" step="0.01" inputMode="decimal" placeholder="0.00" value={amount} onChange={(event) => setAmount(event.target.value)} />
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5 text-sm font-medium">Category
              <select required value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                <option value="">Select category</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </label>
            <label className="block space-y-1.5 text-sm font-medium">Date
              <Input required type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </label>
          </div>
          <label className="block space-y-1.5 text-sm font-medium">Payment method
            <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
              {["Credit card", "Debit card", "Cash", "Bank transfer", "Direct debit", "Other"].map((method) => <option key={method}>{method}</option>)}
            </select>
          </label>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{transaction ? "Save changes" : "Add transaction"}</Button>
          </div>
        </form>
      </section>
    </div>
  );
}

export function TransactionTable({
  transactions,
  compact = false,
  onEdit,
}: {
  transactions: Transaction[];
  compact?: boolean;
  onEdit?: (transaction: Transaction) => void;
}) {
  const { data, deleteTransaction } = useSpendWise();
  const currency = data.settings.currency;
  const fractionDigits = data.settings.fractionDigits;
  if (!transactions.length) {
    return <div className="rounded-xl border border-dashed py-12 text-center">
      <div className="mx-auto mb-3 grid size-11 place-items-center rounded-full bg-muted"><Search className="size-5 text-muted-foreground" /></div>
      <p className="font-medium">No transactions found</p>
      <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or add a new transaction.</p>
    </div>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead><tr className="border-b text-xs text-muted-foreground">
          <th className="px-3 py-3 font-medium">Transaction</th>
          <th className="px-3 py-3 font-medium">Category</th>
          {!compact && <th className="px-3 py-3 font-medium">Payment</th>}
          <th className="px-3 py-3 font-medium">Date</th>
          <th className="px-3 py-3 text-right font-medium">Amount</th>
          {!compact && <th className="w-16 px-3 py-3" />}
        </tr></thead>
        <tbody>
          {transactions.map((transaction) => {
            const category = getCategory(data, transaction.categoryId);
            return <tr key={transaction.id} className="border-b last:border-0">
              <td className="px-3 py-3.5">
                <div className="flex items-center gap-3">
                  <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${transaction.type === "income" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-foreground"}`}>
                    {transaction.type === "income" ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
                  </span>
                  <div><p className="font-medium">{transaction.name}</p><p className="text-xs capitalize text-muted-foreground">{transaction.type}</p></div>
                </div>
              </td>
              <td className="px-3 py-3.5"><span className="inline-flex items-center gap-2"><i className="size-2 rounded-full" style={{ backgroundColor: category?.color }} />{category?.name ?? "Uncategorized"}</span></td>
              {!compact && <td className="px-3 py-3.5 text-muted-foreground">{transaction.paymentMethod}</td>}
              <td className="px-3 py-3.5 text-muted-foreground">{new Date(`${transaction.date}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: compact ? undefined : "numeric" })}</td>
              <td className={`px-3 py-3.5 text-right font-semibold tabular-nums ${transaction.type === "income" ? "text-emerald-600" : ""}`}>
                {transaction.type === "income" ? "+" : "−"}{formatCurrency(transaction.amount, currency, fractionDigits)}
              </td>
              {!compact && <td className="px-3 py-3.5 text-right">
                <div className="flex justify-end gap-1">
                  {onEdit && <Button variant="ghost" size="icon" aria-label={`Edit ${transaction.name}`} onClick={() => onEdit(transaction)}><Pencil className="size-4" /></Button>}
                  <Button variant="ghost" size="icon" aria-label={`Delete ${transaction.name}`} onClick={() => {
                    if (window.confirm(`Delete "${transaction.name}"?`)) deleteTransaction(transaction.id);
                  }}><Trash2 className="size-4 text-muted-foreground" /></Button>
                </div>
              </td>}
            </tr>;
          })}
        </tbody>
      </table>
    </div>
  );
}

export function TransactionSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return <div className="relative w-full sm:max-w-xs">
    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    <Input aria-label="Search transactions by name" placeholder="Search transactions..." value={value} onChange={(event) => onChange(event.target.value)} className="pl-9" />
  </div>;
}

export function StatCard({
  title,
  value,
  detail,
  icon,
  tone = "default",
  action,
}: {
  title: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
  tone?: "default" | "green" | "orange" | "blue";
  action?: React.ReactNode;
}) {
  const tones = {
    default: "bg-muted text-foreground",
    green: "bg-emerald-500/10 text-emerald-600",
    orange: "bg-orange-500/10 text-orange-600",
    blue: "bg-blue-500/10 text-blue-600",
  };
  return <article className="rounded-xl border bg-card p-5">
    <div className="flex items-start justify-between">
      <p className="text-sm text-muted-foreground">{title}</p>
      <span className={`grid size-9 place-items-center rounded-lg ${tones[tone]}`}>{icon}</span>
    </div>
    <p className="mt-4 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
    <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
      <p className="text-xs text-muted-foreground">{detail}</p>
      {action}
    </div>
  </article>;
}

export function SectionTitle({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return <div className="mb-5 flex items-center justify-between gap-3">
    <div><h2 className="font-semibold">{title}</h2>{description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}</div>
    {action}
  </div>;
}
