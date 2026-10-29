"use client";

import { Info, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSpendWise } from "@/components/spendwise/SpendWiseProvider";

export default function DemoModeBanner() {
  const pathname = usePathname();
  const { ready, isDemoMode } = useSpendWise();
  const [dismissed, setDismissed] = useState(false);

  if (!ready || !isDemoMode || dismissed || pathname === "/settings" || pathname === "/about") return null;

  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-between gap-3 border-b border-primary/20 bg-primary/5 px-4 py-3 text-sm sm:px-7"
    >
      <div className="flex items-center gap-2">
        <Info aria-hidden="true" className="size-4 shrink-0 text-primary" />
        <p>
          <span className="font-semibold">Demo mode:</span> You&apos;re viewing
          sample data. Clear it to start fresh with your own.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href="/settings">Go to Settings</Link>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label="Close demo mode banner"
          onClick={() => setDismissed(true)}
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}
