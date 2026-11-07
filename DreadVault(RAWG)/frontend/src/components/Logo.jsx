import { Skull } from "lucide-react";

export const Logo = ({ className = "" }) => (
  <div className={`flex items-center gap-2 ${className}`} aria-label="DreadVault">
    <Skull className="h-5 w-5 text-[color:var(--nf-accent)]" strokeWidth={1.4} />
    <span className="font-brand text-xs tracking-[0.26em] font-medium uppercase text-[color:var(--nf-text)]">DreadVault</span>
  </div>
);
