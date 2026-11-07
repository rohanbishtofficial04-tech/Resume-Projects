import { isMockMode } from "@/services/games";
import { TID } from "@/constants/testIds";
import { AlertTriangle } from "lucide-react";

export const MissingKeyBanner = () => {
  if (!isMockMode()) return null;
  return (
    <div
      data-testid={TID.missingKeyBanner}
      className="fixed top-16 inset-x-0 z-30 bg-black/80 backdrop-blur-md border-b border-white/10 px-6 py-2"
    >
      <div className="max-w-[1440px] mx-auto flex items-center gap-3 text-xs">
        <AlertTriangle className="h-3.5 w-3.5 text-[color:var(--nf-accent)]" />
        <p className="text-[color:var(--nf-text-dim)] font-brand tracking-[0.16em] uppercase text-[10px]">
          Demo mode — add REACT_APP_RAWG_API_KEY in <code className="text-[color:var(--nf-text)]">frontend/.env</code> for live data.
        </p>
      </div>
    </div>
  );
};
