"use client";

import { useSpendWise } from "@/components/spendwise/SpendWiseProvider";

export default function StorageNotice() {
  const { storageError } = useSpendWise();
  if (!storageError) return null;
  return <div role="alert" className="mx-4 mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive sm:mx-7">{storageError}</div>;
}
