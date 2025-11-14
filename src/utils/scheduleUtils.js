// Shared schedule utilities
export const toMin = (hhmm) => {
  const [h = 0, m = 0] = (hhmm || "00:00").split(":").map(Number);
  return h * 60 + m;
};

export const toHHMM = (min) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

export const sortSlots = (slots = []) => [...slots].sort((a, b) => toMin(a.start) - toMin(b.start));
export const hasOverlap = (slots = []) => {
  const s = sortSlots(slots);
  for (let i = 0; i < s.length - 1; i++) if (toMin(s[i].end) > toMin(s[i + 1].start)) return true;
  return false;
};

export const DAYS = [
  { id: 0, label: "Lundi" },
  { id: 1, label: "Mardi" },
  { id: 2, label: "Mercredi" },
  { id: 3, label: "Jeudi" },
  { id: 4, label: "Vendredi" },
  { id: 5, label: "Samedi" },
  { id: 6, label: "Dimanche" },
];

export const defaultInterval = () => ({ start: "09:00", end: "17:00" });
