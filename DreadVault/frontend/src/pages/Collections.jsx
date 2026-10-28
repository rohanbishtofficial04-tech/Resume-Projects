import { useState } from "react";
import { useLibrary } from "@/context/LibraryContext";
import { GameGrid } from "@/components/GameGrid";
import { TID } from "@/constants/testIds";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function Collections() {
  const {
    collections,
    createCollection,
    deleteCollection,
    renameCollection,
    removeFromCollection,
  } = useLibrary();
  const [name, setName] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [renameId, setRenameId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const active = collections.find((c) => c.id === activeId);

  const create = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const c = createCollection(name);
    setName("");
    if (c) {
      setActiveId(c.id);
      toast(`Collection "${c.name}" created`);
    }
  };

  const handleRename = () => {
    if (!renameId || !renameValue.trim()) return;
    renameCollection(renameId, renameValue);
    setRenameId(null);
    setRenameValue("");
    toast("Collection renamed");
  };

  return (
    <div data-testid={TID.collectionsPage} className="max-w-[1440px] mx-auto px-6 md:px-10 pt-14 pb-24">
      <div className="mb-10">
        <p className="font-brand text-[11px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">Curated by You</p>
        <h1 className="font-display text-5xl md:text-6xl mt-1 tracking-tight">Collections</h1>
        <p className="mt-3 text-[color:var(--nf-text-dim)] text-sm max-w-xl">
          Build personal lists — "Games I'll play with the lights on", "First-person nightmares"… whatever brings you joy or dread.
        </p>
      </div>

      <form onSubmit={create} className="flex flex-wrap gap-2 mb-10">
        <input
          data-testid={TID.collectionInput}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New collection name…"
          className="flex-1 min-w-[220px] bg-[color:var(--nf-surface)] border border-[color:var(--nf-border)] px-4 py-3 text-sm focus:border-[color:var(--nf-accent)] outline-none"
        />
        <button data-testid={TID.collectionCreate} type="submit" className="nf-btn nf-btn-primary">
          <Plus className="h-3.5 w-3.5" /> Create
        </button>
      </form>

      {collections.length === 0 ? (
        <div className="border border-dashed border-[color:var(--nf-border)] p-16 text-center">
          <p className="font-display text-3xl">Empty shelves.</p>
          <p className="mt-2 text-sm text-[color:var(--nf-text-dim)]">
            Create your first collection above, then open any game and use Add to Collection to save it here.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          <aside className="space-y-2">
            {collections.map((c) => (
              <div key={c.id} className="flex items-center gap-1">
                <button
                  onClick={() => setActiveId(c.id)}
                  className={`flex-1 text-left px-3 py-2 border transition-colors ${
                    c.id === activeId
                      ? "border-[color:var(--nf-accent)] bg-[color:var(--nf-surface)]"
                      : "border-[color:var(--nf-border)] hover:border-[color:var(--nf-accent)]"
                  }`}
                >
                  <p className="font-display text-lg leading-tight">{c.name}</p>
                  <p className="font-brand text-[10px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">
                    {c.games.length} game{c.games.length === 1 ? "" : "s"}
                  </p>
                </button>
                <button
                  onClick={() => {
                    setRenameId(c.id);
                    setRenameValue(c.name);
                  }}
                  className="p-2 border border-[color:var(--nf-border)] hover:border-[color:var(--nf-accent)]"
                  aria-label="Rename collection"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  onClick={() => {
                    deleteCollection(c.id);
                    if (activeId === c.id) setActiveId(null);
                    toast("Collection deleted");
                  }}
                  className="p-2 border border-[color:var(--nf-border)] hover:border-[color:var(--nf-danger)] hover:text-[color:var(--nf-danger)]"
                  aria-label="Delete collection"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </aside>

          <section>
            {active ? (
              <>
                <h2 className="font-display text-3xl mb-4">{active.name}</h2>
                {active.games.length === 0 ? (
                  <div className="border border-dashed border-[color:var(--nf-border)] p-10 text-center text-sm text-[color:var(--nf-text-dim)]">
                    No games in this collection yet. From any game card, use the heart to add to favorites — then bring them here in a future update.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {active.games.map((g, i) => (
                      <div key={g.id} className="relative">
                        <div className="border border-[color:var(--nf-border)] bg-[color:var(--nf-surface)]">
                          <div className="relative aspect-[3/4] overflow-hidden">
                            <img src={g.background_image} alt={g.name} className="h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                          </div>
                          <div className="p-3">
                            <p className="font-display text-lg">{g.name}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCollection(active.id, g.id)}
                          className="absolute top-2 right-2 p-1.5 bg-black/70 backdrop-blur border border-white/10 hover:border-[color:var(--nf-danger)]"
                          aria-label="Remove from collection"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="font-brand text-[11px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">
                Select a collection to view its contents.
              </p>
            )}
          </section>
        </div>
      )}

      <AnimatePresence>
        {renameId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl grid place-items-center px-6"
            onClick={() => setRenameId(null)}
          >
            <div
              className="w-full max-w-md bg-[color:var(--nf-surface)] border border-[color:var(--nf-border)] p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-display text-2xl">Rename collection</p>
              <input
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="mt-4 w-full bg-black/40 border border-[color:var(--nf-border)] px-3 py-2 text-sm outline-none focus:border-[color:var(--nf-accent)]"
                autoFocus
              />
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setRenameId(null)} className="nf-btn">
                  Cancel
                </button>
                <button onClick={handleRename} className="nf-btn nf-btn-primary">
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
