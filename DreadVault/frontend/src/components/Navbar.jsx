import { NavLink, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Search, Menu, X, Skull } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TID } from "@/constants/testIds";
import { ThemeToggle } from "./ThemeToggle";
import { SearchOverlay } from "./SearchOverlay";

const links = [
  { to: "/", label: "Home", tid: TID.navHome, end: true },
  { to: "/browse", label: "Browse", tid: TID.navBrowse },
  { to: "/favorites", label: "Favorites", tid: TID.navFavorites },
  { to: "/collections", label: "Collections", tid: TID.navCollections },
  { to: "/random", label: "Random", tid: TID.navRandom },
  { to: "/compare", label: "Compare", tid: TID.navCompare },
  { to: "/about", label: "About", tid: TID.navAbout },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header
        data-testid={TID.navRoot}
        className={`fixed top-0 inset-x-0 z-40 transition-colors duration-500 ${
          scrolled ? "bg-black/70 backdrop-blur-2xl border-b border-white/5" : "bg-transparent"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2 group" aria-label="DreadVault home">
            <Skull className="h-5 w-5 text-[color:var(--nf-accent)] group-hover:text-[color:var(--nf-accent-strong)] transition-colors" strokeWidth={1.4} />
            <span className="font-brand text-xs tracking-[0.26em] font-medium text-[color:var(--nf-text)] uppercase">DreadVault</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                data-testid={l.tid}
                className={({ isActive }) =>
                  `font-brand text-[11px] tracking-[0.18em] px-3 py-2 transition-colors ${
                    isActive
                      ? "text-[color:var(--nf-accent-strong)]"
                      : "text-[color:var(--nf-text-dim)] hover:text-[color:var(--nf-text)]"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              data-testid={TID.navSearchToggle}
              onClick={() => setSearchOpen(true)}
              className="p-2 border border-transparent hover:border-[color:var(--nf-border)] transition-colors"
              aria-label="Open search"
            >
              <Search className="h-4 w-4" />
            </button>
            <ThemeToggle />
            <button
              data-testid={TID.navMobileToggle}
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 border border-transparent hover:border-[color:var(--nf-border)]"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-white/5 bg-black/90 backdrop-blur-xl overflow-hidden"
            >
              <div className="px-6 py-4 flex flex-col">
                {links.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.end}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `font-brand text-xs tracking-[0.18em] py-3 border-b border-white/5 ${
                        isActive ? "text-[color:var(--nf-accent-strong)]" : "text-[color:var(--nf-text-dim)]"
                      }`
                    }
                  >
                    {l.label}
                  </NavLink>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={(slug) => {
          setSearchOpen(false);
          navigate(`/game/${slug}`);
        }}
      />
    </>
  );
};
