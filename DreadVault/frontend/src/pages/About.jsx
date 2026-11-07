import { Github, ExternalLink, Layers, Zap, Shield } from "lucide-react";
import { TID } from "@/constants/testIds";

const stack = [
  { label: "React", note: "UI runtime" },
  { label: "React Router", note: "Routing" },
  { label: "Tailwind CSS", note: "Design system" },
  { label: "Framer Motion", note: "Motion" },
  { label: "Context API", note: "State" },
  { label: "RAWG API", note: "Data" },
  { label: "Axios", note: "Network" },
  { label: "Lucide", note: "Icons" },
];

export default function About() {
  return (
    <div data-testid={TID.aboutPage} className="max-w-[1440px] mx-auto px-6 md:px-10 pt-14 pb-24">
      <p className="font-brand text-[11px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">Colophon</p>
      <h1 className="font-display text-5xl md:text-6xl mt-1 tracking-tight">About DreadVault</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 text-[color:var(--nf-text-dim)] text-base leading-relaxed">
          <p>
            DreadVault is a cinematic discovery platform for the horror genre — a hand-tuned
            catalog built on top of the RAWG Video Games API. The design borrows from
            survival-horror pillars like Silent Hill's fog and Resident Evil's blood-lit
            corridors, adapted for a modern web experience.
          </p>
          <p className="mt-4">
            Everything you save lives in your browser. There is no account, no tracker
            harvesting your library — only you, the vault, and whatever you choose to bring home from it.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="border border-[color:var(--nf-border)] p-5">
              <Layers className="h-5 w-5 text-[color:var(--nf-accent)]" strokeWidth={1.4} />
              <p className="mt-3 font-display text-xl">Curated</p>
              <p className="mt-1 text-sm text-[color:var(--nf-text-dim)]">Filtered to the horror genre — always.</p>
            </div>
            <div className="border border-[color:var(--nf-border)] p-5">
              <Zap className="h-5 w-5 text-[color:var(--nf-accent)]" strokeWidth={1.4} />
              <p className="mt-3 font-display text-xl">Fast</p>
              <p className="mt-1 text-sm text-[color:var(--nf-text-dim)]">Code-split, lazy-loaded, debounced.</p>
            </div>
            <div className="border border-[color:var(--nf-border)] p-5">
              <Shield className="h-5 w-5 text-[color:var(--nf-accent)]" strokeWidth={1.4} />
              <p className="mt-3 font-display text-xl">Private</p>
              <p className="mt-1 text-sm text-[color:var(--nf-text-dim)]">Favorites stay in localStorage.</p>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="border border-[color:var(--nf-border)] p-5">
            <p className="font-brand text-[10px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">Built with</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {stack.map((s) => (
                <li key={s.label} className="flex items-baseline justify-between gap-2">
                  <span>{s.label}</span>
                  <span className="font-brand text-[10px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">
                    {s.note}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-[color:var(--nf-border)] p-5">
            <p className="font-brand text-[10px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">Developer</p>
            <p className="mt-2 text-sm">Built as a portfolio piece for horror-game enthusiasts.</p>
            <div className="mt-4 flex flex-col gap-2 text-sm">
              <a
                href="https://github.com/rohanbishtofficial04-tech/Resume-Projects/tree/main/DreadVault"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 hover:text-[color:var(--nf-accent-strong)]"
              >
                <Github className="h-3.5 w-3.5" /> GitHub repository <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://rawg.io/apidocs"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 hover:text-[color:var(--nf-accent-strong)]"
              >
                <ExternalLink className="h-3.5 w-3.5" /> RAWG API
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
