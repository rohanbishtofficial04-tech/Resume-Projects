import { Monitor, Gamepad2, Gamepad, Joystick, Apple, Smartphone, Terminal, Circle } from "lucide-react";

const ICONS = { Monitor, Gamepad2, Gamepad, Joystick, Apple, Smartphone, Terminal, Circle };

const iconFor = (slug = "") => {
  const s = slug.toLowerCase();
  if (s.includes("pc") || s.includes("windows")) return "Monitor";
  if (s.includes("playstation")) return "Gamepad2";
  if (s.includes("xbox")) return "Gamepad";
  if (s.includes("nintendo") || s.includes("switch")) return "Joystick";
  if (s.includes("mac") || s.includes("apple") || s.includes("ios")) return "Apple";
  if (s.includes("linux")) return "Terminal";
  if (s.includes("android")) return "Smartphone";
  return "Circle";
};

export const PlatformBadges = ({ platforms = [], max = 5 }) => {
  const seen = new Set();
  const items = [];
  for (const p of platforms) {
    const slug = p?.platform?.slug || p?.slug || "";
    const key = iconFor(slug);
    if (!seen.has(key)) {
      seen.add(key);
      items.push({ key, name: p?.platform?.name || p?.name || slug });
    }
    if (items.length >= max) break;
  }
  if (items.length === 0) return null;
  return (
    <div className="flex items-center gap-1.5 text-[color:var(--nf-text-dim)]">
      {items.map(({ key, name }) => {
        const Icon = ICONS[key] || Circle;
        return <Icon key={key} className="h-3 w-3" strokeWidth={1.5} aria-label={name} />;
      })}
    </div>
  );
};
