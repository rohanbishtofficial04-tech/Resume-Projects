# DreadVault — Premium Horror Game Database

A cinematic, atmospheric discovery platform for horror video games. Built as a portfolio-grade
React application on top of the [RAWG Video Games API](https://rawg.io/apidocs). Inspired by
Silent Hill, Resident Evil, Dead Space, and Alan Wake.

> Three visual themes are available: **Fog**, **Blood**, and **Eldritch**. Cycle through them
> from the top-right of the navbar.

## Updates

- Added the dark-purple **Eldritch** theme and a subtle ambient background glow that follows the active theme.
- Improved search behavior and the responsive mobile experience.

---

##  Features

- **Home** — hero banner, trending / top-rated / recent / upcoming carousels, genre & platform strips, featured collection bento grid
- **Browse** — genre / platform / release-year / rating filters, sorting, "load more" pagination
- **Game Details** — hero, screenshots gallery with lightbox, trailer player, related games, stores, official website
- **Live Search** — debounced RAWG queries, keyboard-driven modal (⌘/Ctrl+K), highlighted matches
- **Favorites** — hearts on every card, persisted in `localStorage`
- **Recently Viewed** — auto-tracked as you explore
- **Collections** — user-made lists (create, rename, delete), stored locally
- **Compare Games** — side-by-side spec table
- **Random Horror Generator** — "Dare to Play" roulette with cinematic build-up
- **Theme Customization** — Fog / Blood / Eldritch theme toggle
- **404, offline detection, missing-API-key demo mode**
- **Accessibility** — semantic HTML, keyboard nav, ARIA labels, `prefers-reduced-motion`
- **Performance** — `React.lazy` code splitting, lazy-loaded images, memoized providers, debounced input
- **Motion** — Framer Motion page transitions, staggered card reveals, hover parallax
- **Data-testid coverage** — every interactive & informational element is wired for automated QA

---

##  Tech Stack

| Layer            | Technology                              |
| ---------------- | --------------------------------------- |
| UI runtime       | React 19                                |
| Routing          | React Router 7                          |
| Styling          | Tailwind CSS 3                          |
| Motion           | Framer Motion 11                        |
| HTTP             | Axios                                   |
| Icons            | Lucide React                            |
| Toasts           | Sonner                                  |
| Data             | RAWG Video Games API                    |
| Persistence      | Browser `localStorage`                  |

---

##  Project Structure

```
frontend/
├── public/
│   └── index.html                    # Google Fonts preconnects, title, PostHog stub
└── src/
    ├── App.js                        # Router + lazy routes + providers
    ├── index.css                     # Theme tokens, grain, vignette, buttons, skeletons
    ├── index.js                      # ReactDOM entry
    ├── components/
    │   ├── Navbar.jsx                # Sticky glassmorphic nav
    │   ├── Footer.jsx
    │   ├── ThemeToggle.jsx           # Cycles through Fog, Blood, and Eldritch
    │   ├── SearchOverlay.jsx         # ⌘K live search modal
    │   ├── GameCard.jsx
    │   ├── GameGrid.jsx
    │   ├── GameCarousel.jsx
    │   ├── RatingBadge.jsx
    │   ├── PlatformBadges.jsx
    │   ├── SkeletonCard.jsx
    │   ├── ScrollToTop.jsx
    │   ├── OfflineBanner.jsx
    │   └── MissingKeyBanner.jsx
    ├── constants/
    │   └── testIds.js                # Central registry of data-testid values
    ├── context/
    │   ├── ThemeContext.jsx          # Fog / Blood / Eldritch
    │   └── LibraryContext.jsx        # Favorites + recent + collections
    ├── hooks/
    │   ├── useDebounce.js
    │   ├── useOnlineStatus.js
    │   └── useScrollToTop.js
    ├── layouts/
    │   └── MainLayout.jsx
    ├── pages/
    │   ├── Home.jsx
    │   ├── Browse.jsx
    │   ├── GameDetails.jsx
    │   ├── Favorites.jsx
    │   ├── Collections.jsx
    │   ├── Random.jsx
    │   ├── Compare.jsx
    │   ├── Search.jsx
    │   ├── About.jsx
    │   └── NotFound.jsx
    ├── services/
    │   ├── rawgApi.js                # Raw RAWG endpoints
    │   ├── mockData.js               # Fallback used when API key is absent
    │   └── games.js                  # Wrapper that switches live ↔ mock
    └── utils/
        └── format.js                 # Date / rating helpers
```

---

##  Getting Started

### Prerequisites
- Node 18+
- Yarn (this project uses yarn workspaces)

### 1. Clone & install
```bash
git clone <your-repo-url> dreadvault
cd dreadvault/frontend
yarn install
```

### 2. Configure your RAWG API key
1. Sign up at [rawg.io/apidocs](https://rawg.io/apidocs) — the key is free.
2. Copy `.env.example` to `.env` and fill in the key:

```bash
cp .env.example .env
```

```dotenv
REACT_APP_RAWG_API_KEY=your_rawg_api_key_here
```

>  **No key?** The app still runs in **Demo Mode** using bundled sample data.
> A banner will show at the top until you add a real key.

### 3. Run locally
```bash
yarn start
```
The app is served on [http://localhost:3000](http://localhost:3000).

### 4. Production build
```bash
yarn build
```
Bundles the app into `frontend/build/`.

---

## ▲ Deploying to Vercel

1. Push this repository to GitHub.
2. Import the repo into [Vercel](https://vercel.com/new).
3. Set the **Root Directory** to `frontend`.
4. Framework preset: **Create React App**.
5. Add environment variable `REACT_APP_RAWG_API_KEY` in Vercel → Project → Settings → Environment Variables.
6. Deploy.

A `vercel.json` at the repo root also handles SPA routing (rewrites everything to `index.html`).

---

##  Testing Notes

Every interactive element carries a stable `data-testid`. The registry lives in
[`src/constants/testIds.js`](frontend/src/constants/testIds.js). This makes the app
straightforward to drive with Playwright, Cypress, or the platform's testing agent.

---

##   Credits

- Game data — [RAWG Video Games API](https://rawg.io/apidocs)
- Fonts — Cormorant Garamond, Oswald, IBM Plex Sans (Google Fonts)
- Icons — [Lucide](https://lucide.dev)
- Imagery — [Pexels](https://pexels.com)

Not affiliated with any game publisher, developer, or platform. All trademarks belong to their respective owners.

---

##  License

MIT — do whatever you need to. A star or a mention is appreciated.
