export const formatDate = (iso) => {
  if (!iso) return "TBA";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
};

export const formatYear = (iso) => {
  if (!iso) return "TBA";
  return iso.slice(0, 4);
};

export const clampText = (str, n = 220) => {
  if (!str) return "";
  const t = str.replace(/\s+/g, " ").trim();
  return t.length > n ? `${t.slice(0, n).trim()}…` : t;
};

export const stripHtml = (html) =>
  html ? html.replace(/<[^>]+>/g, "").replace(/^\s{0,3}#{1,6}\s*/gm, "") : "";

export const ratingColor = (rating) => {
  if (rating >= 4.5) return "var(--nf-accent-strong)";
  if (rating >= 4.0) return "var(--nf-accent)";
  if (rating >= 3.0) return "#d97706";
  return "#7f1d1d";
};

export const metacriticColor = (mc) => {
  if (!mc) return "var(--nf-border)";
  if (mc >= 85) return "#16a34a";
  if (mc >= 70) return "#ca8a04";
  return "#b91c1c";
};

export const highlightMatch = (text, query) => {
  if (!text || !query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return {
    before: text.slice(0, idx),
    match: text.slice(idx, idx + query.length),
    after: text.slice(idx + query.length),
  };
};

export const platformIcon = (slug = "") => {
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
