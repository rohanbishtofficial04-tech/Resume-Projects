import { BarChart3, Layers, ShieldCheck, Wallet, Zap } from "lucide-react";

const principles = [
  {
    icon: Layers,
    title: "Clear",
    description: "Income, expenses, and budgets stay organized in one workspace.",
  },
  {
    icon: Zap,
    title: "Actionable",
    description: "Charts and budget alerts turn your entries into useful feedback.",
  },
  {
    icon: ShieldCheck,
    title: "Private",
    description: "Your finance data stays in this browser, not on a SpendWise server.",
  },
];

const technologies = [
  { name: "Next.js 15", role: "App framework" },
  { name: "React 19", role: "UI runtime" },
  { name: "TypeScript", role: "Type safety" },
  { name: "Tailwind CSS 4", role: "Styling" },
  { name: "shadcn/ui + Radix", role: "UI components" },
  { name: "Recharts", role: "Data visualization" },
  { name: "Lucide React", role: "Icons" },
  { name: "localStorage", role: "On-device persistence" },
];

export default function AboutPage() {
  return <div className="mx-auto max-w-[1200px] pb-10 pt-5 sm:pt-8">
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Colophon</p>
    <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">About SpendWise</h1>

    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
      <div>
        <div className="max-w-3xl space-y-4 text-base leading-relaxed text-muted-foreground">
          <p>SpendWise is a personal finance workspace for tracking everyday income and expenses, setting practical budgets, and seeing how your money changes over time.</p>
          <p>Record transactions to power your dashboard and reports. Budget progress follows your current-month spending, and the notification bell calls attention to budgets approaching or exceeding their limits. Choose the approach threshold in Settings. Sample data is available to help you explore before adding your own.</p>
          <p>Your financial records and profile are stored in this browser. SpendWise has no account system or finance-data backend.</p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {principles.map(({ icon: Icon, title, description }) => <article key={title} className="rounded-xl border bg-card p-4 sm:p-5">
            <Icon className="size-5 text-primary" strokeWidth={1.6} aria-hidden="true" />
            <h2 className="mt-3 text-lg font-semibold">{title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
          </article>)}
        </div>
      </div>

      <aside className="space-y-4">
        <section className="rounded-xl border bg-card p-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Built with</h2>
          <ul className="mt-4 space-y-3">
            {technologies.map((technology) => <li key={technology.name} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium">{technology.name}</span>
              <span className="text-right text-xs text-muted-foreground">{technology.role}</span>
            </li>)}
          </ul>
        </section>
        <section className="rounded-xl border bg-card p-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Project</h2>
          <div className="mt-3 flex items-start gap-3">
            <Wallet className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-muted-foreground">A browser-based personal finance tracker. Data is saved locally and remains under your control.</p>
          </div>
          <div className="mt-4 flex items-start gap-3">
            <BarChart3 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-muted-foreground">Made to help make daily spending and longer-term trends easier to understand.</p>
          </div>
        </section>
      </aside>
    </div>
  </div>;
}
