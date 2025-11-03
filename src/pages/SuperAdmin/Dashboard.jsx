// src/pages/superadmin/SuperAdminDashboard.jsx
import { useMemo, useState } from "react";
import {
  Building2,
  UsersRound,
  Activity,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  MoreHorizontal,
  Globe,
  ShieldCheck,
  Mail,
  Ban,
  PlayCircle,
  PauseCircle,
  ArrowUpRight,
  Settings,
  MoreHorizontalIcon,
} from "lucide-react";

/* ---------- Tokens (thème clair bleu/orange) ---------- */
const tokens = {
  page: "bg-gradient-to-b from-sky-50 via-white to-white text-slate-800",
  border: "border-slate-200",
  card: "rounded-2xl border border-slate-200 bg-white shadow-sm",
  cardHover: "transition hover:shadow-md",
  pill: "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs",
  brandGrad: "bg-gradient-to-r from-sky-600 to-indigo-600",
  orangeBtn: "bg-orange-500 hover:bg-orange-600 text-white",
  ghostBtn:
    "bg-transparent text-sky-800 hover:bg-sky-50 hover:text-sky-900 underline decoration-orange-300/80 underline-offset-4",
  rowHover: "hover:bg-sky-50/60",
  stickyHead: "sticky top-0 z-10 bg-slate-50/95 backdrop-blur",
  focus: "focus:outline-none focus:ring-2 focus:ring-sky-200",
};

/* ---------- Composants ---------- */
function Section({ title, right, children, className = "" }) {
  return (
    <section className={`space-y-4 ${className} mt-8`}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        {right}
      </div>
      <div>{children}</div>
    </section>
  );
}

function StatCard({ icon, label, value, sub }) {
  return (
    <div className={`${tokens.card} ${tokens.cardHover} p-5`}>
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-sky-100 to-indigo-100 text-sky-700 ring-1 ring-sky-200">
          {icon}
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
          <div className="text-2xl font-semibold leading-tight">{value}</div>
          {sub ? <div className="text-xs text-slate-500">{sub}</div> : null}
        </div>
      </div>
    </div>
  );
}

function Badge({ color = "blue", children }) {
  const map = {
    blue: "bg-sky-50 text-sky-800 border-sky-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    gray: "bg-slate-50 text-slate-700 border-slate-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    red: "bg-rose-50 text-rose-700 border-rose-200",
  };
  return <span className={`${tokens.pill} border ${map[color]}`}>{children}</span>;
}

function Button({ children, variant = "primary", className = "", ...rest }) {
  const variants = {
    primary: `${tokens.brandGrad} text-white hover:from-sky-500 hover:to-indigo-500`,
    outline:
      "border border-slate-300 bg-white hover:bg-slate-50 text-slate-800",
    ghost: tokens.ghostBtn,
    orange: tokens.orangeBtn,
    subtle: "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200",
    icon:
      "h-9 w-9 grid place-items-center rounded-lg border border-slate-200 bg-white hover:bg-sky-50 text-slate-700",
  };
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/* Mini chart SVG (barres) – aucun package */
function UsageChart({ points = [], className = "" }) {
  const max = Math.max(1, ...points);
  const bars = points.map((v, i) => {
    const h = Math.round((v / max) * 42) + 2;
    return (
      <rect
        key={i}
        x={i * 12 + 4}
        y={48 - h}
        width="8"
        height={h}
        rx="2"
        className="fill-sky-500/80"
      />
    );
  });
  return (
    <svg viewBox="0 0 140 50" className={`w-full ${className}`}>
      <rect x="0" y="0" width="140" height="50" rx="10" className="fill-sky-50" />
      {bars}
    </svg>
  );
}

/* ---------- Données statiques d'exemple ---------- */
const PENDING = [
  { id: "REQ-1032", clinic: "Clinique Horizon", admin: "nadia.s@horizon.tn", createdAt: "2025-10-30", note: "Dermato & imagerie" },
  { id: "REQ-1033", clinic: "Centre Azur", admin: "amel.r@azur.tn", createdAt: "2025-11-01", note: "Pédiatrie" },
];

const CLINICS = [
  { id: "CL-001", name: "Clinique Azur",    domain: "azur.medflow.tn",    users: 42, status: "active", uptime: "99.96%", lastIncident: "Il y a 21 j", usage: [12, 18, 22, 25, 20, 27, 30, 28] },
  { id: "CL-002", name: "Horizon Médical",  domain: "horizon.medflow.tn", users: 31, status: "active", uptime: "99.91%", lastIncident: "Il y a 34 j", usage: [6, 10, 12, 12, 15, 17, 18, 16] },
  { id: "CL-003", name: "Cardio+",          domain: "cardioplus.medflow.tn", users: 19, status: "paused", uptime: "99.88%", lastIncident: "Il y a 12 j", usage: [2, 4, 5, 7, 6, 5, 4, 3] },
];

export default function SuperAdminDashboard() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    return CLINICS.filter((c) => {
      const okStatus = status === "all" ? true : c.status === status;
      const q = query.trim().toLowerCase();
      const okQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.domain.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q);
      return okStatus && okQuery;
    });
  }, [query, status]);

  return (
    <main className={`min-h-screen ${tokens.page}`}>
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs text-sky-800">
              <ShieldCheck className="h-3.5 w-3.5" /> Espace Super Admin
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Console de supervision</h1>
            <p className="text-sm text-slate-600">Gérez les cliniques, validez les demandes et suivez l’utilisation.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* <Button variant="orange" className={tokens.focus}>
              Créer une clinique
            </Button> */}
            <Button variant="orange" className={`hidden sm:inline-flex ${tokens.focus}`}>
              <PlayCircle className="h-4 w-4" />
              Démarrer une démo
            </Button>
            <Button variant="outline" className={tokens.focus}>
              <Globe className="h-4 w-4" />
              État global
            </Button>
          </div>
        </div>

        {/* KPI */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<Building2 className="h-5 w-5" />} label="Cliniques actives" value="24" sub="+3 ce mois" />
          <StatCard icon={<Clock className="h-5 w-5" />}     label="Demandes en attente" value={PENDING.length} sub="Réponse moyenne 12h" />
          <StatCard icon={<UsersRound className="h-5 w-5" />} label="Utilisateurs totaux" value="1 124" sub="+86 cette semaine" />
          <StatCard icon={<Activity className="h-5 w-5" />}   label="Disponibilité globale" value="99.93%" sub="30j glissants" />
        </div>

        {/* Demandes de création */}
        <Section
          title="Demandes de création de clinique"
          right={<Button variant="outline" className={tokens.focus}><Filter className="h-4 w-4" /> Filtrer</Button>}
        >
          <div className={`${tokens.card} ${tokens.cardHover} overflow-hidden`}>
            <div className={`grid grid-cols-12 gap-4 border-b border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 ${tokens.stickyHead}`}>
              <div className="col-span-2">ID</div>
              <div className="col-span-3">Clinique</div>
              <div className="col-span-3">Admin</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            <ul className="divide-y divide-slate-200">
              {PENDING.map((r) => (
                <li key={r.id} className={`grid grid-cols-12 gap-4 px-4 py-3 text-sm ${tokens.rowHover}`}>
                  <div className="col-span-2"><Badge color="orange">{r.id}</Badge></div>
                  <div className="col-span-3 font-medium">{r.clinic}</div>
                  <div className="col-span-3 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="truncate">{r.admin}</span>
                  </div>
                  <div className="col-span-2">{r.createdAt}</div>
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <Button variant="primary" className="px-3 py-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      Valider
                    </Button>
                    <Button variant="subtle" className="px-3 py-1.5">Détails</Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* Gestion des cliniques */}
        <Section
          title="Gestion des cliniques"
          right={
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher (nom, domaine, id)…"
                  className={`h-10 w-64 rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-sm ${tokens.focus}`}
                />
              </div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={`h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm ${tokens.focus}`}
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actives</option>
                <option value="paused">En pause</option>
              </select>
            </div>
          }
        >
          <div className={`${tokens.card} ${tokens.cardHover} overflow-hidden`}>
            <div className={`grid grid-cols-12 gap-4 border-b border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 ${tokens.stickyHead}`}>
              <div className="col-span-4">Clinique</div>
              <div className="col-span-2">Domaine</div>
              <div className="col-span-2">Utilisateurs</div>
              <div className="col-span-4 text-right">Actions</div>
            </div>
            <ul className="divide-y divide-slate-200">
              {filtered.map((c) => (
                <li key={c.id} className={`grid grid-cols-12 gap-4 px-4 py-3 text-sm ${tokens.rowHover}`}>
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-sky-100 text-sky-800 ring-1 ring-sky-200">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium leading-tight">{c.name}</div>
                      <div className="text-xs text-slate-500">{c.id}</div>
                    </div>
                    {c.status === "active" ? (
                      <Badge color="green">Active</Badge>
                    ) : (
                      <Badge color="gray">En pause</Badge>
                    )}
                  </div>

                  <div className="col-span-2 flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-slate-400" />
                      <span className="truncate text-slate-700">{c.domain}</span>
                    </div>
                  </div>

                  <div className="col-span-1 flex items-center gap-2">{c.users}</div>

                  <div className="col-span-5 flex items-center justify-end gap-2">
                    <Button variant="subtle" className="px-3 py-1.5">
                      <UsersRound className="h-4 w-4" /> Admins
                    </Button>
                    <Button variant="subtle" className="px-3 py-1.5">
                      <Settings  className="h-4 w-4" /> Gérer
                    </Button>
                    {c.status === "active" ? (
                      <Button variant="outline" className="px-3 py-1.5" title="Mettre en pause">
                        <PauseCircle className="h-4 w-4" /> Mettre en pause
                      </Button>
                    ) : (
                      <Button variant="primary" className="px-3 py-1.5" title="Réactiver">
                        <PlayCircle className="h-4 w-4" /> Réactiver
                      </Button>
                    )}
                    <Button variant="outline" className="px-3 py-1.5"
                     title="Plus">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* Usage par clinique */}
        <Section
          title="Utilisation de l’app par clinique"
          right={<Button variant="ghost" className="text-sm">Voir tout <ArrowUpRight className="h-4 w-4" /></Button>}
        >
          <div className="grid gap-4 md:grid-cols-3">
            {CLINICS.map((c) => (
              <div key={c.id} className={`${tokens.card} ${tokens.cardHover} p-4`}>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-sky-100 text-sky-800 ring-1 ring-sky-200">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium leading-tight">{c.name}</div>
                      <div className="text-xs text-slate-500">{c.domain}</div>
                    </div>
                  </div>
                  {c.status === "active" ? <Badge color="green">Active</Badge> : <Badge color="gray">En pause</Badge>}
                </div>

                <UsageChart points={c.usage} className="mt-2" />

                <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-1">
                    <UsersRound className="h-4 w-4 text-slate-400" />
                    {c.users} utilisateurs
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="h-4 w-4 text-emerald-600" />
                    Uptime {c.uptime}
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <Button variant="subtle" className="px-3 py-1.5 text-xs">Admins</Button>
                  <Button variant="subtle" className="px-3 py-1.5 text-xs">Paramètres</Button>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Bandeau bas (actions rapides) */}
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className={`${tokens.card} ${tokens.cardHover} p-6`}>
            <h3 className="text-base font-semibold">Créer une clinique manuellement</h3>
            <p className="mt-1 text-sm text-slate-600">Renseignez les informations et attribuez un sous-domaine.</p>
            <div className="mt-4 flex gap-2">
              <Button variant="orange" className={tokens.focus}>Nouveau tenant</Button>
              <Button variant="outline" className={tokens.focus}>Voir demandes</Button>
            </div>
          </div>
          <div className={`${tokens.card} ${tokens.cardHover} p-6`}>
            <h3 className="text-base font-semibold">Mettre une clinique en maintenance</h3>
            <p className="mt-1 text-sm text-slate-600">Informer les utilisateurs et geler les actions critiques.</p>
            <div className="mt-4 flex gap-2">
              <Button variant="orange" className={tokens.focus}>
                <Ban className="h-4 w-4" /> Activer maintenance
              </Button>
              <Button variant="outline" className={tokens.focus}>Paramètres</Button>
            </div>
          </div>
        </div>

        {/* Légende & aide */}
        <div className="mt-8 text-xs text-slate-500">
          <p className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            Les données affichées sont fictives pour la démonstration.
          </p>
        </div>
      </div>
    </main>
  );
}
