import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeProvider";
import FretLabShell from "@/components/FretLabShell";
import Tuner from "@/pages/Tuner";
import Metronome from "@/pages/Metronome";
import CircleOfFifths from "@/pages/CircleOfFifths";
import ScaleLibrary from "@/pages/ScaleLibrary";
import ChordLibrary from "@/pages/ChordLibrary";
import About from "@/pages/About";

// One <Route> per page in src/pages; BrowserRouter already wraps this in main.tsx.
export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route element={<FretLabShell />}>
          <Route path="/" element={<Navigate to="/tuner" replace />} />
          <Route path="/tuner" element={<Tuner />} />
          <Route path="/metronome" element={<Metronome />} />
          <Route path="/circle-of-fifths" element={<CircleOfFifths />} />
          <Route path="/scales" element={<ScaleLibrary />} />
          <Route path="/chords" element={<ChordLibrary />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Navigate to="/tuner" replace />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}
