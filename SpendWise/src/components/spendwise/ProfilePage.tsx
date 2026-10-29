"use client";

import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FinancePageLoading, PageHeading, useFinanceHydrated } from "@/components/spendwise/Shared";
import { useSpendWise } from "@/components/spendwise/SpendWiseProvider";
import type { FinanceSettings } from "@/lib/spendwise";

type ProfileDetails = Pick<FinanceSettings, "displayName" | "email" | "phone" | "location" | "occupation">;

export default function ProfilePage() {
  const { data, updateSettings } = useSpendWise();
  const hydrated = useFinanceHydrated();
  const displayName = data.settings.displayName.trim();
  const [draft, setDraft] = useState<ProfileDetails>(() => ({
    displayName: data.settings.displayName,
    email: data.settings.email,
    phone: data.settings.phone,
    location: data.settings.location,
    occupation: data.settings.occupation,
  }));
  const savedProfile: ProfileDetails = {
    displayName: data.settings.displayName,
    email: data.settings.email,
    phone: data.settings.phone,
    location: data.settings.location,
    occupation: data.settings.occupation,
  };
  const hasChanges = draft.displayName !== savedProfile.displayName ||
    draft.email !== savedProfile.email ||
    draft.phone !== savedProfile.phone ||
    draft.location !== savedProfile.location ||
    draft.occupation !== savedProfile.occupation;

  useEffect(() => {
    setDraft({
      displayName: data.settings.displayName,
      email: data.settings.email,
      phone: data.settings.phone,
      location: data.settings.location,
      occupation: data.settings.occupation,
    });
  }, [data.settings.displayName, data.settings.email, data.settings.phone, data.settings.location, data.settings.occupation]);

  if (!hydrated) return <FinancePageLoading />;

  return <div className="mx-auto max-w-[900px] pb-10">
    <PageHeading eyebrow="Your account" title="Profile" description="Manage your personal and contact details." />
    <section className="rounded-xl border bg-card p-5 sm:p-7">
      <div className="flex items-center gap-4 border-b pb-6">
        <Avatar className="size-16 border">
          <AvatarFallback aria-label="Default profile placeholder" className="bg-primary/10 text-primary">
            <UserRound className="size-7" aria-hidden="true" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-lg font-semibold">{displayName || "Personal account"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{data.settings.email || "Add an email address below"}</p>
        </div>
      </div>
      <div className="mt-6 max-w-xl">
        <h3 className="font-semibold">Personal details</h3>
        <p className="mt-1 text-sm text-muted-foreground">All fields are optional. Save your changes when you’re ready.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5 text-sm font-medium">Display name
            <Input aria-label="Profile display name" maxLength={60} placeholder="e.g. Rohan" value={draft.displayName} onChange={(event) => setDraft({ ...draft, displayName: event.target.value })} />
          </label>
          <label className="block space-y-1.5 text-sm font-medium">Email address
            <Input aria-label="Profile email address" type="email" maxLength={254} placeholder="you@example.com" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} />
          </label>
          <label className="block space-y-1.5 text-sm font-medium">Phone number
            <Input aria-label="Profile phone number" type="tel" autoComplete="tel" maxLength={30} placeholder="e.g. +91 98765 43210" value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} />
          </label>
          <label className="block space-y-1.5 text-sm font-medium">Location
            <Input aria-label="Profile location" autoComplete="address-level2" maxLength={80} placeholder="e.g. Bengaluru, India" value={draft.location} onChange={(event) => setDraft({ ...draft, location: event.target.value })} />
          </label>
          <label className="block space-y-1.5 text-sm font-medium sm:col-span-2">Occupation
            <Input aria-label="Profile occupation" autoComplete="organization-title" maxLength={80} placeholder="e.g. Student, Software engineer" value={draft.occupation} onChange={(event) => setDraft({ ...draft, occupation: event.target.value })} />
          </label>
        </div>
        {hasChanges && <div className="mt-5 flex justify-end">
          <Button onClick={() => updateSettings(draft)}>Save changes</Button>
        </div>}
      </div>
    </section>
  </div>;
}
