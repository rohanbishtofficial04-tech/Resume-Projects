import { useLayoutEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeProvider";
import FretLabShell from "@/components/FretLabShell";
import Tuner from "@/pages/Tuner";
import Metronome from "@/pages/Metronome";
import CircleOfFifths from "@/pages/CircleOfFifths";
import ScaleLibrary from "@/pages/ScaleLibrary";
import ChordLibrary from "@/pages/ChordLibrary";
import About from "@/pages/About";
import Home from "@/pages/Home";
import Games from "@/pages/Games";
import ChordGuess from "@/pages/ChordGuess";

// One <Route> per page in src/pages; BrowserRouter already wraps this in main.tsx.
export default function App() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <ThemeProvider>
      <Routes>
        <Route element={<FretLabShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/tuner" element={<Tuner />} />
          <Route path="/metronome" element={<Metronome />} />
          <Route path="/circle-of-fifths" element={<CircleOfFifths />} />
          <Route path="/scales" element={<ScaleLibrary />} />
          <Route path="/chords" element={<ChordLibrary />} />
          <Route path="/games" element={<Games />} />
          <Route path="/games/chord-guess" element={<ChordGuess />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}
