# DreadVault — Premium Horror Game Database

A cinematic, atmospheric discovery platform for horror video games. Built as a portfolio-grade
React application on top of the [RAWG Video Games API](https://rawg.io/apidocs). Inspired by
Silent Hill, Resident Evil, Dead Space, and Alan Wake.

> Three visual themes are available: **Fog**, **Blood**, and **Eldritch**. Cycle through them
> from the top-right of the navbar.

---

## Recent Updates

- Featured **Outlast 2** in the homepage hero with a fixed DreadVault tagline.
- Expanded game comparisons with rating counts, average playtime, ESRB ratings, developers, and publishers.
- Hid scrollbar visuals across the app while preserving mouse, touch, and keyboard scrolling.
- Improved the responsive game details hero and back-navigation layout.
- Added A New Theme (Elditch)
- Added trailers for select supported games.
- Improved responsiveness across desktop and mobile devices for a smoother browsing experience on different screen sizes.
- Added more information to the Game Details section for a more comprehensive game overview.
- Added navigation buttons to browse through game screenshots more easily.
- Improved button responsiveness for smoother and more consistent interactions across devices.
- Fixed search filtering to display only horror games, preventing results from unrelated genres such as sports.

 ---

##  Features

- **Home** — Outlast 2 featured hero, trending / top-rated / recent / upcoming carousels, genre & platform strips, featured collection bento grid
- **Browse** — genre / platform / release-year / rating filters, sorting, "load more" pagination
- **Game Details** — responsive hero with back navigation, rating and platform details, rating count, playtime, ESRB rating, trailer player, screenshots gallery with lightbox, related games, stores, and official website
- **Live Search** — debounced RAWG queries, keyboard-driven modal (⌘/Ctrl+K), highlighted matches
- **Favorites** — hearts on every card, persisted in `localStorage`
- **Recently Viewed** — auto-tracked as you explore
- **Collections** — user-made lists (create, rename, delete), stored locally
- **Compare Games** — side-by-side ratings, release date, rating count, average playtime, ESRB rating, genres, platforms, Metacritic score, developers, and publishers
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
- npm (included with Node.js)

### 1. Clone & install
```bash
git clone <your-repo-url> dreadvault
cd dreadvault/frontend
npm install
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
npm start
```
The app is served on [http://localhost:3000](http://localhost:3000).

### 4. Production build
```bash
npm run build
```
Bundles the app into `frontend/build/`.

---

## ▲ DreadVault — Live Deployment

**Live Website:** https://dreadvault.vercel.app

DreadVault is deployed on Vercel and built with React.

### Deployment Configuration
- **Platform:** Vercel
- **Framework:** Create React App
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `build`
- **Environment Variable:** `REACT_APP_RAWG_API_KEY`

### Local Development
1. Clone the repository.
2. Navigate to the frontend directory.
3. Install dependencies.
4. Configure your RAWG API key in the environment file.
5. Start the development server.

The RAWG API key should not be committed to the repository.

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
