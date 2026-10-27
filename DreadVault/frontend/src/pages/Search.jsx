import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSearch } from "@/services/games";
import { useDebounce } from "@/hooks/useDebounce";
import { GameGrid } from "@/components/GameGrid";
import { TID } from "@/constants/testIds";
import { Search as SearchIcon } from "lucide-react";

export default function Search() {
  const [params, setParams] = useSearchParams();
  const initial = params.get("q") || "";
  const [q, setQ] = useState(initial);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounced = useDebounce(q, 350);
  const navigate = useNavigate();

  useEffect(() => {
    setParams(debounced ? { q: debounced } : {}, { replace: true });
    if (!debounced) {
      setGames([]);
      return;
    }
    let cancel = false;
    setLoading(true);
    getSearch({ query: debounced, page_size: 20 })
      .then((data) => {
        if (!cancel) setGames(data?.results || []);
      })
      .finally(() => !cancel && setLoading(false));
    return () => {
      cancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-10 pt-14 pb-24">
      <p className="font-brand text-[11px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">Search</p>
      <h1 className="font-display text-5xl md:text-6xl mt-1 tracking-tight">Find your fear</h1>

      <div className="mt-8 flex items-center gap-3 border border-[color:var(--nf-border)] px-4 py-3 bg-[color:var(--nf-surface)]">
        <SearchIcon className="h-5 w-5 text-[color:var(--nf-text-dim)]" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Silent Hill, Alan Wake, Signalis…"
          className="flex-1 bg-transparent outline-none font-display text-2xl md:text-3xl placeholder:text-white/25"
          onKeyDown={(e) => {
            if (e.key === "Escape") navigate(-1);
          }}
        />
      </div>

      <div className="mt-12">
        <GameGrid
          games={games}
          loading={loading}
          emptyLabel={q ? "No echoes returned." : "Type a name to begin."}
        />
      </div>
    </div>
  );
}
