export const SkeletonCard = () => (
  <div className="border border-[color:var(--nf-border)] bg-[color:var(--nf-surface)]">
    <div className="aspect-[3/4] nf-skeleton" />
    <div className="p-4 space-y-2">
      <div className="h-3 w-16 nf-skeleton" />
      <div className="h-5 w-4/5 nf-skeleton" />
      <div className="h-3 w-1/2 nf-skeleton" />
    </div>
  </div>
);
