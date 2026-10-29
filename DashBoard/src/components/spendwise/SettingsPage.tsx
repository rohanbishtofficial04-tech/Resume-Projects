"use client";

import { useState } from "react";
import { AlertTriangle, Database, Moon, Sun, Trash2 } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FinancePageLoading, PageHeading, useFinanceHydrated } from "@/components/spendwise/Shared";
import { useSpendWise } from "@/components/spendwise/SpendWiseProvider";
import { CURRENCIES, formatCurrency } from "@/lib/spendwise";

export default function SettingsPage() {
  const { data, updateSettings, clearFinancialData, loadDemoData } = useSpendWise();
  const hydrated = useFinanceHydrated();
  const { theme, setTheme } = useTheme();
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDemoData, setConfirmDemoData] = useState(false);

  if (!hydrated) return <FinancePageLoading />;

  return <div className="mx-auto max-w-[900px] pb-10">
    <PageHeading eyebrow="Make it yours" title="Settings" description="Choose how SpendWise looks and displays your finances." />
    <div className="space-y-5">
      <section className="rounded-xl border bg-card p-5 sm:p-6">
        <h2 className="font-semibold">Preferences</h2>
        <p className="mt-1 text-sm text-muted-foreground">Your choices are saved in this browser.</p>
        <div className="mt-5 divide-y">
          <div className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"><div><p className="text-sm font-medium">Preferred currency</p><p className="mt-1 text-xs text-muted-foreground">Used for all monetary values throughout the app.</p></div>
            <select aria-label="Preferred currency" value={data.settings.currency} onChange={(event) => updateSettings({ currency: event.target.value })} className="h-10 w-full rounded-md border bg-background px-3 text-sm sm:w-56">
              {CURRENCIES.map((currency) => <option key={currency.code} value={currency.code}>{currency.code} · {currency.label}</option>)}
            </select>
          </div>
          <div className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"><div><p className="text-sm font-medium">Starting account balance</p><p className="mt-1 text-xs text-muted-foreground">Included in total balance, not monthly income.</p></div>
            <Input aria-label="Starting account balance" type="number" min="0" step="0.01" inputMode="decimal" value={data.settings.openingBalance} onChange={(event) => {
              const balance = event.currentTarget.valueAsNumber;
              if (Number.isFinite(balance) && balance >= 0) updateSettings({ openingBalance: balance });
            }} className="w-full sm:w-56" />
          </div>
          <div className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"><div><p className="text-sm font-medium">Budget alert threshold</p><p className="mt-1 text-xs text-muted-foreground">Show an in-app alert from 1% to 99% of a monthly category limit. Default: 80%.</p></div>
            <label className="flex w-full items-center gap-2 sm:w-56">
              <Input aria-label="Budget alert threshold percentage" type="number" min="1" max="99" step="1" inputMode="numeric" value={data.settings.budgetAlertThreshold} onChange={(event) => {
                const threshold = event.currentTarget.valueAsNumber;
                if (Number.isInteger(threshold) && threshold >= 1 && threshold <= 99) updateSettings({ budgetAlertThreshold: threshold });
              }} />
              <span className="text-sm text-muted-foreground">%</span>
            </label>
          </div>
          <div className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"><div><p className="text-sm font-medium">Appearance</p><p className="mt-1 text-xs text-muted-foreground">Select a light, dark, or system theme.</p></div>
            <select aria-label="Theme preference" value={theme ?? "system"} onChange={(event) => setTheme(event.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm sm:w-56">
              <option value="light">Light</option><option value="dark">Dark</option><option value="system">System</option>
            </select>
          </div>
          <div className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"><div><p className="text-sm font-medium">Decimal places</p><p className="mt-1 text-xs text-muted-foreground">Choose how amounts appear across the dashboard, transactions, budgets, and analytics.</p></div>
            <div className="flex items-center gap-3">
              <select aria-label="Amount decimal places" value={data.settings.fractionDigits} onChange={(event) => {
                const fractionDigits = Number(event.target.value);
                if (fractionDigits === 0 || fractionDigits === 2) updateSettings({ fractionDigits });
              }} className="h-10 w-full rounded-md border bg-background px-3 text-sm sm:w-44">
                <option value="2">2 decimal places</option><option value="0">No decimals</option>
              </select>
              <span aria-live="polite" className="min-w-[7rem] rounded-md bg-muted px-3 py-2 text-center text-sm font-medium">{formatCurrency(1234.56, data.settings.currency, data.settings.fractionDigits)}</span>
            </div>
          </div>
        </div>
      </section>
      <section className="rounded-xl border bg-card p-5 sm:p-6">
        <h2 className="font-semibold">Explore with demo data</h2>
        <p className="mt-1 text-sm text-muted-foreground">Load sample transactions and budgets to explore the dashboard. Your categories, preferences, and profile will be kept.</p>
        <Button className="mt-5 bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500" onClick={() => setConfirmDemoData(true)}><Database className="mr-2 size-4" />Load demo data</Button>
      </section>
      <section className="rounded-xl border border-destructive/30 bg-card p-5 sm:p-6">
        <div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-destructive/10 text-destructive"><AlertTriangle className="size-4" /></span><div><h2 className="font-semibold">Clear financial data</h2><p className="mt-1 text-sm text-muted-foreground">Remove all transactions and budgets while keeping your categories. Your currency returns to INR and starting balance to ₹0.</p></div></div>
        <Button variant="destructive" className="mt-5" onClick={() => setConfirmReset(true)}><Trash2 className="mr-2 size-4" />Clear data</Button>
      </section>
      <p className="flex items-center gap-2 text-xs text-muted-foreground"><Sun className="size-3.5 dark:hidden" /><Moon className="hidden size-3.5 dark:block" />Your data stays in this browser and is not sent to a server.</p>
    </div>
    {confirmReset && <div className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirmReset(false); }}>
      <section role="alertdialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-description" className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl">
        <div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-destructive/10 text-destructive"><AlertTriangle className="size-4" /></span><div>
          <h2 id="reset-title" className="font-semibold">Clear all transactions and budgets?</h2>
          <p id="reset-description" className="mt-2 text-sm text-muted-foreground">This removes your financial records from this browser. Categories will remain available. This action can’t be undone.</p>
        </div></div>
        <div className="mt-6 flex flex-wrap justify-end gap-2"><Button variant="outline" onClick={() => setConfirmReset(false)}>Keep my data</Button><Button variant="destructive" onClick={() => { clearFinancialData(); setConfirmReset(false); }}>Yes, clear data</Button></div>
      </section>
    </div>}
    {confirmDemoData && <div className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirmDemoData(false); }}>
      <section role="alertdialog" aria-modal="true" aria-labelledby="demo-data-title" aria-describedby="demo-data-description" className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl">
        <div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Database className="size-4" /></span><div>
          <h2 id="demo-data-title" className="font-semibold">Load sample transactions and budgets?</h2>
          <p id="demo-data-description" className="mt-2 text-sm text-muted-foreground">This replaces your current transactions and budgets with sample data. Your categories, preferences, and profile will be kept.</p>
        </div></div>
        <div className="mt-6 flex flex-wrap justify-end gap-2"><Button variant="outline" onClick={() => setConfirmDemoData(false)}>Cancel</Button><Button className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500" onClick={() => { loadDemoData(); setConfirmDemoData(false); }}>Load demo data</Button></div>
      </section>
    </div>}
  </div>;
}
