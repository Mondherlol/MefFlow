export function getStatusText(status) {
  if (!status) return "—";
  switch (String(status).toLowerCase()) {
    case "confirme": return "Confirmé";
    case "termine": return "Terminé";
    case "encours": return "En cours";
    case "annule": return "Annulé";
    default: return String(status).replace(/_/g, " ");
  }
}

export function getStatusStyle(status) {
  const s = (status || "").toLowerCase();
  if (s === "termine") return { 
    badge: "bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-800 border border-emerald-200",
    bar: "bg-gradient-to-b from-emerald-400 to-emerald-500",
    icon: "text-emerald-600"
  };
  if (s === "encours") return { 
    badge: "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border border-blue-200",
    bar: "bg-gradient-to-b from-blue-400 to-blue-500",
    icon: "text-blue-600"
  };
  if (s === "annule") return { 
    badge: "bg-gradient-to-r from-rose-50 to-rose-100 text-rose-800 border border-rose-200",
    bar: "bg-gradient-to-b from-rose-400 to-rose-500",
    icon: "text-rose-600"
  };
  if (s === "confirme") return { 
    badge: "bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 border border-amber-200",
    bar: "bg-gradient-to-b from-amber-400 to-amber-500",
    icon: "text-amber-600"
  };
  return { 
    badge: "bg-gradient-to-r from-slate-50 to-slate-100 text-slate-800 border border-slate-200",
    bar: "bg-gradient-to-b from-slate-300 to-slate-400",
    icon: "text-slate-600"
  };
}

export function capitalizeWords(str) {
  return String(str).split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function formatLongDate(d) {
  try {
    const opts = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const s = d.toLocaleDateString('fr-FR', opts);
    return capitalizeWords(s);
  } catch (e) {
    return d.toISOString().slice(0,10);
  }
}

export function getRelativeTag(d) {
  const now = new Date();
  const diffMs = now - d;
  const absMs = Math.abs(diffMs);
  const sec = Math.round(absMs / 1000);
  const min = Math.round(sec / 60);
  const hrs = Math.round(min / 60);
  const days = Math.round(hrs / 24);

  if (diffMs >= 0) {
    if (sec < 60) return "à l'instant";
    if (min < 60) return `il y a ${min} ${min === 1 ? 'minute' : 'minutes'}`;
    if (hrs < 24) return `il y a ${hrs} ${hrs === 1 ? 'heure' : 'heures'}`;
    if (days === 1) return 'hier';
    if (days < 30) return `il y a ${days} ${days === 1 ? 'jour' : 'jours'}`;
    const months = Math.round(days / 30);
    if (months < 12) return `il y a ${months} ${months === 1 ? 'mois' : 'mois'}`;
    const years = Math.round(months / 12);
    return `il y a ${years} ${years === 1 ? 'an' : 'ans'}`;
  } else {
    if (sec < 60) return 'bientôt';
    if (min < 60) return `dans ${min} ${min === 1 ? 'minute' : 'minutes'}`;
    if (hrs < 24) return `dans ${hrs} ${hrs === 1 ? 'heure' : 'heures'}`;
    if (days === 1) return 'demain';
    return `dans ${days} ${days === 1 ? 'jour' : 'jours'}`;
  }
}
