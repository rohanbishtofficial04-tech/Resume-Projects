import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { MainLayout } from "@/layouts/MainLayout";

import Home from "@/pages/Home";
import Browse from "@/pages/Browse";
import GameDetails from "@/pages/GameDetails";
import Favorites from "@/pages/Favorites";
import Collections from "@/pages/Collections";
import Compare from "@/pages/Compare";
import Random from "@/pages/Random";
import Search from "@/pages/Search";
import About from "@/pages/About";
import NotFound from "@/pages/NotFound";

import { ThemeProvider } from "@/context/ThemeContext";
import { LibraryProvider } from "@/context/LibraryContext";

function App() {
  return (
    <ThemeProvider>
      <LibraryProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/game/:slug" element={<GameDetails />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/random" element={<Random />} />
              <Route path="/search" element={<Search />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </LibraryProvider>
    </ThemeProvider>
  );
}

export default App;