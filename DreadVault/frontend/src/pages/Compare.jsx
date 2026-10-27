import { useState, useEffect } from "react";
import { getSearch, getBrowse } from "@/services/games";
import { useDebounce } from "@/hooks/useDebounce";
import { TID } from "@/constants/testIds";
import { formatYear } from "@/utils/format";
import { RatingBadge } from "@/components/RatingBadge";
import { Search as SearchIcon, X } from "lucide-react";
import { Link } from "react-router-dom";

const SLOTS = ["A", "B"];

const useOptions = () => {
  const [q, setQ] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounced = useDebounce(q, 300);
  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!debounced.trim()) {
        setLoading(true);
        const data = await getBrowse({ page_size: 12, ordering: "-added" });
        if (!cancel) {
          setOptions(data?.results || []);
          setLoading(false);
        }
        return;
      }
      setLoading(true);
      const data = await getSearch({ query: debounced, page_size: 10 });
      if (!cancel) {
        setOptions(data?.results || []);
        setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [debounced]);
  return { q, setQ, options, loading };
};

const Picker = ({ slot, selected, onPick, onClear, testId }) => {
  const { q, setQ, options, loading } = useOptions();
  if (selected) {
    return (
      <div className="border border-[color:var(--nf-border)] bg-[color:var(--nf-surface)]">
        <div className="relative aspect-[16/9] overflow-hidden">
          <img src={selected.background_image} alt={selected.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <button
            onClick={onClear}
            className="absolute top-2 right-2 p-1.5 bg-black/70 border border-white/10"
            aria-label="Clear slot"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="absolute bottom-3 left-4 right-4">
            <p className="font-brand text-[10px] tracking-[0.3em] text-[color:var(--nf-accent)]">Slot {slot}</p>
            <h3 className="font-display text-2xl md:text-3xl leading-tight mt-1">{selected.name}</h3>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div data-testid={testId} className="border border-dashed border-[color:var(--nf-border)] bg-[color:var(--nf-surface)] p-4">
      <p className="font-brand text-[10px] tracking-[0.3em] text-[color:var(--nf-text-dim)]">Slot {slot}</p>
      <div className="mt-2 flex items-center gap-2 border border-[color:var(--nf-border)] px-3 py-2">
        <SearchIcon className="h-4 w-4 text-[color:var(--nf-text-dim)]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search a game to compare…"
          className="flex-1 bg-transparent outline-none text-sm"
        />
      </div>
      <ul className="mt-3 max-h-64 overflow-y-auto divide-y divide-white/5">
        {loading && <li className="py-3 text-xs text-[color:var(--nf-text-dim)]">Searching…</li>}
        {!loading &&
          options.map((g) => (
            <li key={g.id}>
              <button
                onClick={() => onPick(g)}
                className="w-full flex items-center gap-3 py-2 text-left hover:bg-black/40 px-1"
              >
                <div className="h-10 w-16 flex-shrink-0 overflow-hidden bg-black">
                  {g.background_image && <img src={g.background_image} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm truncate">{g.name}</p>
                  <p className="font-brand text-[10px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">
                    {formatYear(g.released)}
                  </p>
                </div>
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
};

const Row = ({ label, a, b }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 border-t border-[color:var(--nf-border)] items-center">
    <p className="col-span-2 sm:col-span-1 font-brand text-[10px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">{label}</p>
    <div className="text-sm">{a}</div>
    <div className="text-sm">{b}</div>
  </div>
);

const gen = (g) => (g?.genres || []).map((x) => x.name).join(", ") || "—";
const pl = (g) => (g?.parent_platforms || g?.platforms || []).map((p) => p.platform?.name || p.name).join(", ") || "—";

export default function Compare() {
  const [a, setA] = useState(null);
  const [b, setB] = useState(null);

  return (
    <div data-testid={TID.comparePage} className="max-w-[1440px] mx-auto px-6 md:px-10 pt-14 pb-24">
      <div className="mb-10">
        <p className="font-brand text-[11px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">Side by Side</p>
        <h1 className="font-display text-5xl md:text-6xl mt-1 tracking-tight">Compare Games</h1>
        <p className="mt-3 text-[color:var(--nf-text-dim)] text-sm max-w-xl">
          Weigh two horrors against each other. Pick a game for each slot to see the specs stacked.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Picker slot={SLOTS[0]} selected={a} onPick={setA} onClear={() => setA(null)} testId={TID.compareSelectA} />
        <Picker slot={SLOTS[1]} selected={b} onPick={setB} onClear={() => setB(null)} testId={TID.compareSelectB} />
      </div>

      {(a || b) && (
        <section className="mt-10">
          <Row
            label="Title"
            a={a ? <Link to={`/game/${a.slug}`} className="font-display text-xl">{a.name}</Link> : "—"}
            b={b ? <Link to={`/game/${b.slug}`} className="font-display text-xl">{b.name}</Link> : "—"}
          />
          <Row label="Rating" a={a ? <RatingBadge value={a.rating} metacritic={a.metacritic} compact /> : "—"} b={b ? <RatingBadge value={b.rating} metacritic={b.metacritic} compact /> : "—"} />
          <Row label="Released" a={a?.released || "—"} b={b?.released || "—"} />
          <Row label="Genres" a={gen(a)} b={gen(b)} />
          <Row label="Platforms" a={pl(a)} b={pl(b)} />
          <Row label="Metacritic" a={a?.metacritic || "—"} b={b?.metacritic || "—"} />
        </section>
      )}
    </div>
  );
}
