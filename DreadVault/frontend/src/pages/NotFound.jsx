import { Link } from "react-router-dom";
import { TID } from "@/constants/testIds";
import { Ghost } from "lucide-react";

export default function NotFound() {
  return (
    <div
      data-testid={TID.notFoundPage}
      className="max-w-[1440px] mx-auto px-6 md:px-10 min-h-[80vh] grid place-items-center"
    >
      <div className="text-center">
        <Ghost className="h-12 w-12 mx-auto text-[color:var(--nf-text-dim)]" strokeWidth={1.2} />
        <p className="mt-6 font-brand text-[11px] tracking-[0.3em] text-[color:var(--nf-accent)]">Error · 404</p>
        <h1 className="font-display text-6xl md:text-8xl mt-3 tracking-tight">Lost in the fog.</h1>
        <p className="mt-4 text-[color:var(--nf-text-dim)] max-w-md mx-auto">
          The page you were looking for has been swallowed by the dark. Turn back before something notices.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link to="/" className="nf-btn nf-btn-primary">Return home</Link>
          <Link to="/browse" className="nf-btn">Browse the vault</Link>
        </div>
      </div>
    </div>
  );
}
