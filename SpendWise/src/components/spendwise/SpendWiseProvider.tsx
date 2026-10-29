"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  createEmptyData,
  createDemoData,
  parseFinanceData,
  STORAGE_KEY,
  withDemoProfileSettings,
  type Budget,
  type Category,
  type FinanceData,
  type FinanceSettings,
  type Transaction,
} from "@/lib/spendwise";

type SpendWiseContextValue = {
  data: FinanceData;
  ready: boolean;
  isDemoMode: boolean;
  dismissedBudgetAlerts: string[];
  storageError: string | null;
  saveTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  saveBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;
  addCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  updateSettings: (settings: Partial<FinanceSettings>) => void;
  loadDemoData: () => void;
  clearFinancialData: () => void;
  dismissBudgetAlert: (id: string) => void;
  dismissBudgetAlerts: (ids: string[]) => void;
};

const SpendWiseContext = createContext<SpendWiseContextValue | null>(null);
const DEMO_MODE_KEY = `${STORAGE_KEY}-demo-mode`;
const DISMISSED_BUDGET_ALERTS_KEY = `${STORAGE_KEY}-dismissed-budget-alerts`;

export function SpendWiseProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<FinanceData>(() => createEmptyData());
  const [ready, setReady] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [dismissedBudgetAlerts, setDismissedBudgetAlerts] = useState<string[]>([]);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [persistAllowed, setPersistAllowed] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      const savedDismissedAlerts = window.localStorage.getItem(DISMISSED_BUDGET_ALERTS_KEY);
      if (savedDismissedAlerts) {
        const parsedDismissedAlerts: unknown = JSON.parse(savedDismissedAlerts);
        if (Array.isArray(parsedDismissedAlerts) && parsedDismissedAlerts.every((id) => typeof id === "string")) {
          setDismissedBudgetAlerts(parsedDismissedAlerts);
        } else {
          console.error("Saved dismissed budget alerts have an invalid format.");
          setStorageError("Saved notification preferences are invalid and could not be restored.");
        }
      }

      if (saved === null) {
        setData(createDemoData());
        setIsDemoMode(true);
        setPersistAllowed(true);
      } else {
        const parsed: unknown = JSON.parse(saved);
        const financeData = parseFinanceData(parsed);
        if (!financeData) {
          setStorageError("Saved finance data is invalid. Your saved data has not been overwritten.");
          setPersistAllowed(false);
        } else {
          const demoMode = window.localStorage.getItem(DEMO_MODE_KEY) !== "false";
          setData(demoMode
            ? { ...financeData, settings: withDemoProfileSettings(financeData.settings) }
            : financeData);
          setIsDemoMode(demoMode);
          setPersistAllowed(true);
        }
      }
    } catch (error) {
      console.error("Could not load SpendWise data from local storage.", error);
      setStorageError("Your saved data could not be loaded. Check browser storage permissions.");
      setPersistAllowed(false);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready || !persistAllowed) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      window.localStorage.setItem(DEMO_MODE_KEY, String(isDemoMode));
      window.localStorage.setItem(DISMISSED_BUDGET_ALERTS_KEY, JSON.stringify(dismissedBudgetAlerts));
      setStorageError(null);
    } catch (error) {
      console.error("Could not save SpendWise data to local storage.", error);
      setStorageError("Changes could not be saved to this browser. Check available storage space.");
    }
  }, [data, dismissedBudgetAlerts, isDemoMode, persistAllowed, ready]);

  const update = useCallback((updater: (current: FinanceData) => FinanceData) => {
    setData((current) => updater(current));
  }, []);

  const value = useMemo<SpendWiseContextValue>(() => ({
    data,
    ready,
    isDemoMode,
    dismissedBudgetAlerts,
    storageError,
    saveTransaction: (transaction) => update((current) => ({
      ...current,
      transactions: [
        transaction,
        ...current.transactions.filter((item) => item.id !== transaction.id),
      ],
    })),
    deleteTransaction: (id) => update((current) => ({
      ...current,
      transactions: current.transactions.filter((item) => item.id !== id),
    })),
    saveBudget: (budget) => update((current) => ({
      ...current,
      budgets: [budget, ...current.budgets.filter((item) => item.id !== budget.id)],
    })),
    deleteBudget: (id) => update((current) => ({
      ...current,
      budgets: current.budgets.filter((item) => item.id !== id),
    })),
    addCategory: (category) => update((current) => ({
      ...current,
      categories: [...current.categories, category],
    })),
    deleteCategory: (id) => update((current) => ({
      ...current,
      categories: current.categories.filter((item) => item.id !== id),
    })),
    updateSettings: (settings) => update((current) => ({
      ...current,
      settings: { ...current.settings, ...settings },
    })),
    loadDemoData: () => {
      setData((current) => createDemoData(current));
      setIsDemoMode(true);
      setDismissedBudgetAlerts([]);
      setPersistAllowed(true);
      setStorageError(null);
    },
    clearFinancialData: () => {
      setData(createEmptyData());
      setIsDemoMode(false);
      setDismissedBudgetAlerts([]);
      setPersistAllowed(true);
      setStorageError(null);
    },
    dismissBudgetAlert: (id) => setDismissedBudgetAlerts((current) => (
      current.includes(id) ? current : [...current, id]
    )),
    dismissBudgetAlerts: (ids) => setDismissedBudgetAlerts((current) => (
      [...new Set([...current, ...ids])]
    )),
  }), [data, dismissedBudgetAlerts, isDemoMode, ready, storageError, update]);

  return <SpendWiseContext.Provider value={value}>{children}</SpendWiseContext.Provider>;
}

export function useSpendWise() {
  const context = useContext(SpendWiseContext);
  if (!context) throw new Error("useSpendWise must be used within SpendWiseProvider");
  return context;
}
