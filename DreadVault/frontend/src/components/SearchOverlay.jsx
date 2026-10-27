import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, CornerDownLeft } from "lucide-react";
import { getSearch } from "@/services/games";
import { useDebounce } from "@/hooks/useDebounce";
import { TID } from "@/constants/testIds";
import { highlightMatch } from "@/utils/format";

export const SearchOverlay = ({ open, onClose, onSelect }) => {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const debounced = useDebounce(q, 350);

  useEffect(() => {
    if (!open) {
      setQ("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (!debounced.trim()) {
      setResults([]);
      return;
    }
    let cancel = false;
    setLoading(true);
    getSearch({ query: debounced, page_size: 10 })
      .then((data) => {
        if (!cancel) setResults(data?.results || []);
      })
      .finally(() => !cancel && setLoading(false));
    return () => {
      cancel = true;
    };
  }, [debounced]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          data-testid={TID.searchOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl flex items-start justify-center pt-24 px-6"
          onClick={onClose}
        >
          <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4 border-b border-white/10 pb-4">
              <Search className="h-6 w-6 text-[color:var(--nf-text-dim)]" />
              <input
                data-testid={TID.searchInput}
                autoFocus
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search the shadows…"
                className="flex-1 bg-transparent outline-none font-display text-3xl md:text-4xl placeholder:text-white/25"
              />
              {loading ? <Loader2 className="h-5 w-5 animate-spin text-[color:var(--nf-accent)]" /> : null}
              <button
                data-testid={TID.searchClose}
                onClick={onClose}
                aria-label="Close search"
                className="p-2 border border-transparent hover:border-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div data-testid={TID.searchResults} className="mt-6 max-h-[60vh] overflow-y-auto">
              {results.length === 0 && debounced && !loading ? (
                <div data-testid={TID.searchEmpty} className="py-16 text-center">
                  <p className="font-brand text-xs tracking-[0.2em] text-[color:var(--nf-text-dim)]">
                    No echoes returned. Try another name.
                  </p>
                </div>
              ) : null}

              {!debounced && (
                <p className="pt-6 font-brand text-[11px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">
                  Try: Silent Hill · Resident Evil · Alan Wake · Signalis
                </p>
              )}

              <ul className="mt-4 divide-y divide-white/5">
                {results.map((g) => {
                  const h = highlightMatch(g.name, debounced);
                  return (
                    <li key={g.id}>
                      <button
                        data-testid={TID.searchSuggestion}
                        onClick={() => onSelect(g.slug)}
                        className="w-full flex items-center gap-4 py-3 text-left group"
                      >
                        <div className="h-14 w-20 flex-shrink-0 overflow-hidden bg-[color:var(--nf-surface)]">
                          {g.background_image && (
                            <img src={g.background_image} alt="" className="h-full w-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-display text-lg truncate">
                            {typeof h === "string" ? (
                              h
                            ) : (
                              <>
                                {h.before}
                                <mark className="bg-transparent text-[color:var(--nf-accent-strong)]">
                                  {h.match}
                                </mark>
                                {h.after}
                              </>
                            )}
                          </p>
                          <p className="font-brand text-[10px] tracking-[0.18em] text-[color:var(--nf-text-dim)]">
                            {(g.released || "").slice(0, 4) || "TBA"} · {(g.genres || [])
                              .slice(0, 2)
                              .map((x) => x.name)
                              .join(" / ")}
                          </p>
                        </div>
                        <CornerDownLeft className="h-4 w-4 opacity-0 group-hover:opacity-100 text-[color:var(--nf-accent)] transition-opacity" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
