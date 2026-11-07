import { Link } from "react-router-dom";
import { Github, ExternalLink, Skull } from "lucide-react";

export const Footer = () => (
  <footer className="mt-24 border-t border-white/5">
    <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-14 grid gap-10 md:grid-cols-12">
      <div className="md:col-span-4">
        <div className="flex items-center gap-2">
          <Skull className="h-5 w-5" strokeWidth={1.4} />
          <span className="font-brand text-sm">DreadVault</span>
        </div>
        <p className="mt-4 max-w-sm text-sm text-[color:var(--nf-text-dim)] leading-relaxed">
          A cinematic discovery vault for the horror genre. Curated from the RAWG catalog —
          designed for those who prefer their games with a pulse and a scream.
        </p>
      </div>

      <div className="md:col-span-2">
        <p className="font-brand text-[11px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">Discover</p>
        <ul className="mt-4 space-y-2 text-sm">
          <li><Link className="hover:text-[color:var(--nf-accent-strong)]" to="/browse">Browse</Link></li>
          <li><Link className="hover:text-[color:var(--nf-accent-strong)]" to="/random">Random</Link></li>
          <li><Link className="hover:text-[color:var(--nf-accent-strong)]" to="/compare">Compare</Link></li>
        </ul>
      </div>

      <div className="md:col-span-2">
        <p className="font-brand text-[11px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">Library</p>
        <ul className="mt-4 space-y-2 text-sm">
          <li><Link className="hover:text-[color:var(--nf-accent-strong)]" to="/favorites">Favorites</Link></li>
          <li><Link className="hover:text-[color:var(--nf-accent-strong)]" to="/collections">Collections</Link></li>
          <li><Link className="hover:text-[color:var(--nf-accent-strong)]" to="/about">About</Link></li>
        </ul>
      </div>

      <div className="md:col-span-4">
        <p className="font-brand text-[11px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">Powered by</p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <a
            className="inline-flex items-center gap-1.5 hover:text-[color:var(--nf-accent-strong)]"
            href="https://rawg.io/apidocs"
            target="_blank"
            rel="noreferrer"
          >
            RAWG Video Games API <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <a
            className="inline-flex items-center gap-1.5 hover:text-[color:var(--nf-accent-strong)]"
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
          >
            <Github className="h-3.5 w-3.5" /> GitHub
          </a>
        </div>
        <p className="mt-6 text-xs text-[color:var(--nf-text-dim)]">
          © {new Date().getFullYear()} DreadVault. Not affiliated with any game publisher.
        </p>
      </div>
    </div>
  </footer>
);
