"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, Moon, Sun, UserRound } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSpendWise } from "@/components/spendwise/SpendWiseProvider";
import { FinancePageLoading, useFinanceHydrated } from "@/components/spendwise/Shared";
import { formatCurrency, getBudgetSpent, getCategory } from "@/lib/spendwise";

const titles: Record<string, string> = {
  "/": "Overview",
  "/transactions": "Transactions",
  "/budgets": "Budgets",
  "/analytics": "Analytics",
  "/categories": "Categories",
  "/settings": "Settings",
  "/profile": "Profile",
  "/about": "About",
};

export default function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { data } = useSpendWise();
  const hydrated = useFinanceHydrated();
  const accountName = data.settings.displayName.trim() || "Personal account";
  const budgetAlerts = data.budgets.flatMap((budget) => {
    const spent = getBudgetSpent(data.transactions, budget.categoryId);
    const percent = spent / budget.limit * 100;
    if (percent < data.settings.budgetAlertThreshold) return [];
    return [{
      id: budget.id,
      categoryName: getCategory(data, budget.categoryId)?.name ?? "Category",
      spent,
      limit: budget.limit,
      percent,
    }];
  });
  const formatAmount = (amount: number) => formatCurrency(amount, data.settings.currency, data.settings.fractionDigits);
  return <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur sm:px-7">
    <div className="flex items-center gap-3"><SidebarTrigger /><span className="text-sm font-medium">{titles[pathname] ?? "SpendWise"}</span></div>
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={budgetAlerts.length ? `Notifications: ${budgetAlerts.length} budget alerts` : "Notifications"} className="relative">
            <Bell className="size-4" />
            {budgetAlerts.length > 0 && <span aria-hidden="true" className="absolute right-0 top-0 grid min-h-4 min-w-4 translate-x-1/4 -translate-y-1/4 place-items-center rounded-full border-2 border-background bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground">{budgetAlerts.length > 9 ? "9+" : budgetAlerts.length}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" sideOffset={8} className="w-80">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold">Notifications</h2>
              <p className="mt-1 text-xs text-muted-foreground">Alerts start at {data.settings.budgetAlertThreshold}% of a monthly limit</p>
            </div>
            {budgetAlerts.length > 0 && <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">{budgetAlerts.length}</span>}
          </div>
          {!hydrated ? <FinancePageLoading /> : budgetAlerts.length ? <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto">
            {budgetAlerts.map((alert) => <li key={alert.id} className="rounded-lg border p-3">
              <p className="text-sm font-medium">{alert.categoryName} budget {alert.percent > 100 ? "exceeded" : alert.percent === 100 ? "reached" : "approaching its limit"}</p>
              <p className="mt-1 text-xs text-muted-foreground">{formatAmount(alert.spent)} of {formatAmount(alert.limit)} ({Math.round(alert.percent)}%)</p>
            </li>)}
          </ul> : <p className="mt-4 rounded-lg bg-muted p-3 text-sm text-muted-foreground">No budget alerts this month.</p>}
          <Button asChild variant="link" className="mt-3 h-auto p-0 text-sm">
            <Link href="/budgets">View budgets</Link>
          </Button>
        </PopoverContent>
      </Popover>
      <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
        <Sun className="size-4 dark:hidden" /><Moon className="hidden size-4 dark:block" />
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Open profile details for ${accountName}`} className="rounded-full">
            <span className="grid size-8 place-items-center rounded-full bg-primary/10 text-primary"><UserRound className="size-4" /></span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" sideOffset={8} className="w-80">
          {!hydrated ? <FinancePageLoading /> : <>
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><UserRound className="size-5" /></span>
              <div className="min-w-0">
                <p className="truncate font-semibold">{accountName}</p>
                <p className="truncate text-sm text-muted-foreground">{data.settings.email || "Personal SpendWise account"}</p>
              </div>
            </div>
            <Button asChild variant="link" className="mt-3 h-auto p-0 text-sm">
              <Link href="/profile">View profile</Link>
            </Button>
          </>}
        </PopoverContent>
      </Popover>
    </div>
  </header>;
}
