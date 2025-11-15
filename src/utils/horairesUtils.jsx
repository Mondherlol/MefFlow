const toMin = (hhmm) => {
  const [h = 0, m = 0] = (hhmm || "00:00").split(":").map(Number);
  return h * 60 + m;
};
const toHHMM = (min) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

const sortSlots = (slots = []) => [...slots].sort((a, b) => toMin(a.start) - toMin(b.start));

const DAYS = [
  { id: 0, label: "Lundi" },
  { id: 1, label: "Mardi" },
  { id: 2, label: "Mercredi" },
  { id: 3, label: "Jeudi" },
  { id: 4, label: "Vendredi" },
  { id: 5, label: "Samedi" },
  { id: 6, label: "Dimanche" },
];

const defaultInterval = () => ({ start: "09:00", end: "17:00" });


export { toMin, toHHMM, sortSlots, DAYS, defaultInterval };