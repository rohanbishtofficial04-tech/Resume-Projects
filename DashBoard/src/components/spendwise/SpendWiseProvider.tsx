"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  createEmptyData,
  createDemoData,
  parseFinanceData,
  STORAGE_KEY,
  type Budget,
  type Category,
  type FinanceData,
  type FinanceSettings,
  type Transaction,
} from "@/lib/spendwise";

type SpendWiseContextValue = {
  data: FinanceData;
  ready: boolean;
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
};

const SpendWiseContext = createContext<SpendWiseContextValue | null>(null);

export function SpendWiseProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<FinanceData>(() => createEmptyData());
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [persistAllowed, setPersistAllowed] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === null) {
        setData(createDemoData());
        setPersistAllowed(true);
      } else {
        const parsed: unknown = JSON.parse(saved);
        const financeData = parseFinanceData(parsed);
        if (!financeData) {
          setStorageError("Saved finance data is invalid. Your saved data has not been overwritten.");
          setPersistAllowed(false);
        } else {
          setData(financeData);
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
      setStorageError(null);
    } catch (error) {
      console.error("Could not save SpendWise data to local storage.", error);
      setStorageError("Changes could not be saved to this browser. Check available storage space.");
    }
  }, [data, persistAllowed, ready]);

  const update = useCallback((updater: (current: FinanceData) => FinanceData) => {
    setData((current) => updater(current));
  }, []);

  const value = useMemo<SpendWiseContextValue>(() => ({
    data,
    ready,
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
      setPersistAllowed(true);
      setStorageError(null);
    },
    clearFinancialData: () => {
      setData(createEmptyData());
      setPersistAllowed(true);
      setStorageError(null);
    },
  }), [data, ready, storageError, update]);

  return <SpendWiseContext.Provider value={value}>{children}</SpendWiseContext.Provider>;
}

export function useSpendWise() {
  const context = useContext(SpendWiseContext);
  if (!context) throw new Error("useSpendWise must be used within SpendWiseProvider");
  return context;
}
