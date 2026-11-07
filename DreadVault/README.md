# DreadVault — Premium Horror Game Database

A cinematic, atmospheric discovery platform for horror video games. Built as a portfolio-grade
React application backed by IGDB, with RAWG as a fallback. Inspired by Silent Hill, Resident Evil,
Dead Space, and Alan Wake. Explore trending and highly rated titles, watch trailers, browse
screenshots, compare games, and uncover hidden gems.

> Three visual themes are available: **Fog**, **Blood**, and **Eldritch**. Cycle through them
> from the top-right of the navbar.

---

## Recent Updates

- Added a separate Express API with IGDB as the primary horror-game provider and RAWG as a server-side fallback.
- Added a seven-game hero carousel with a smooth slide transition, five-second autoplay, and dot navigation. Dead by Daylight is second and The Dark Pictures Anthology: Man of Medan is third.
- Expanded game details with horror themes and keywords, content-rating descriptors, supported languages, release dates by platform, DLC/expansions, franchise timelines, and separate player/critic rating counts. Accessibility details are identified as unavailable when providers do not supply them.
- Added multiplayer/co-op information, game engine metadata, regional age ratings, port/remake/remaster relationships, and categorized official, storefront, and community links when game data providers supply them.
- Added a five-second sliding homepage hero for **Outlast 2**, **Dead by Daylight**, **The Dark Pictures Anthology: Man of Medan**, **Silent Hill 2 (2024)**, **Resident Evil 4 (2023)**, **The Evil Within**, and **Resident Evil 7**. Dot navigation resets the timer, and slides show game details without RAWG heading markers.
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

- **Home** — rotating hero for featured horror games; curated Trending in the Dark and Top Rated Nightmares carousels, recent / upcoming games, genre & platform strips, featured collection bento grid
- **Browse** — genre / platform / release-year / rating filters, sorting, "load more" pagination
- **Game Details** — responsive hero with ratings and platforms, genres and themes, multiplayer modes, game engine, regional age ratings, language and release details, DLC/expansions, ports/remakes/remasters, franchise timelines, trailer and screenshots, related games, and official/store/community links
- **Live Search** — debounced IGDB queries with RAWG fallback, keyboard-driven modal (⌘/Ctrl+K), highlighted matches
- **Favorites** — hearts on every card, persisted in `localStorage`
- **Recently Viewed** — auto-tracked as you explore
- **Collections** — user-made lists (create, rename, delete), stored locally
- **Compare Games** — side-by-side ratings, release date, rating count, average playtime, ESRB rating, genres, platforms, Metacritic score, developers, and publishers
- **Random Horror Generator** — "Dare to Play" roulette with cinematic build-up
- **Theme Customization** — Fog / Blood / Eldritch theme toggle
- **404, offline detection, and clear API-unavailable states**
- **Accessibility** — semantic HTML, keyboard nav, ARIA labels, `prefers-reduced-motion`
- **Performance** — `React.lazy` code splitting, lazy-loaded images, memoized providers, debounced input
- **Motion** — Framer Motion page transitions, staggered card reveals, hover parallax
- **Data-testid coverage** — every interactive & informational element is wired for automated QA

---

##  Tech Stack

| Layer            | Technology                              |
| ---------------- | --------------------------------------- |
| UI runtime       | React 18                                |
| Routing          | React Router 7                          |
| API server       | Express 4                               |
| Styling          | Tailwind CSS 3                          |
| Motion           | Framer Motion 11                        |
| HTTP             | Axios                                   |
| Icons            | Lucide React                            |
| Toasts           | Sonner                                  |
| Data             | IGDB primary, RAWG fallback              |
| Persistence      | Browser `localStorage`                  |

---

##  Project Structure

```
backend/
├── src/
│   ├── config/env.js                  # Server-only environment configuration
│   ├── routes/games.js                # Express API endpoints
│   ├── services/
│   │   ├── igdb.js                    # Twitch OAuth, IGDB queries and caching
│   │   ├── rawg.js                    # RAWG fallback client
│   │   ├── gameService.js             # Provider fallback and response shaping
│   │   └── normalizeGame.js           # Provider-compatible game objects
│   └── server.js
└── .env.example
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
    │   └── games.js                  # Express API facade
    └── utils/
        └── format.js                 # Date / rating helpers
```

---

##  Getting Started

### Prerequisites
- Node 18+
- npm (included with Node.js)

### 1. Configure the backend
```bash
cd backend
npm install
copy .env.example .env
```

Set these variables in `backend/.env`:

```dotenv
PORT=8001
TWITCH_CLIENT_ID=your_twitch_client_id
TWITCH_CLIENT_SECRET=your_twitch_client_secret
RAWG_API_KEY=your_rawg_api_key
FRONTEND_ORIGINS=http://localhost:3000,https://dreadvault.vercel.app
```

Create a Twitch application to obtain the client ID and secret, and get a RAWG key at
[rawg.io/apidocs](https://rawg.io/apidocs). Keep all provider credentials in the backend only.
Start the API with `npm run dev` (or `npm start`) and leave it running.

### 2. Configure and run the frontend

In a second terminal from the repository root:

```bash
cd frontend
npm install
copy .env.example .env
npm start
```

Set `REACT_APP_BACKEND_URL=http://localhost:8001` in `frontend/.env`. If the backend URL is unset
or the API cannot provide data, affected sections show an unavailable message instead of sample data.

### 3. Production build
```bash
npm run build
```
Bundles the app into `build/`.

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
- **Frontend environment variable:** `REACT_APP_BACKEND_URL` (URL of the deployed Express backend)
- **Backend environment variables:** `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`, `RAWG_API_KEY`,
  and `FRONTEND_ORIGINS`

Deploy the backend separately to a Node.js host such as Render or Railway. Set its environment
variables there, including the exact Vercel origin in `FRONTEND_ORIGINS`. Set the frontend's
`REACT_APP_BACKEND_URL` in Vercel to the backend's public base URL, then redeploy. The Express
API exposes `/api/health` for a deployment check. Twitch credentials and tokens never reach the
browser.

---

##  Testing Notes

Every interactive element carries a stable `data-testid`. The registry lives in
[`src/constants/testIds.js`](frontend/src/constants/testIds.js). This makes the app
straightforward to drive with Playwright, Cypress, or the platform's testing agent.

Run the frontend suite with `npm test -- --watchAll=false` from `frontend` and backend tests with
`npm test` from `backend`. You can check backend configuration with `GET /api/health`; a real
provider query tests Twitch authentication and IGDB access. A RAWG fallback is attempted when
IGDB fails or returns an empty result.

---

##   Credits

- Primary game data — [IGDB API](https://api-docs.igdb.com/) via Twitch OAuth
- Fallback game data — [RAWG Video Games API](https://rawg.io/apidocs)
- Fonts — Cormorant Garamond, Oswald, IBM Plex Sans (Google Fonts)
- Icons — [Lucide](https://lucide.dev)
- Imagery — [Pexels](https://pexels.com)

Not affiliated with any game publisher, developer, or platform. All trademarks belong to their respective owners.

---

##  License

MIT — do whatever you need to. A star or a mention is appreciated.
