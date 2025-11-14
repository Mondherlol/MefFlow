// ReceptionnistHome.jsx
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  CalendarDays,
  PlusCircle,
  Search,
  Phone,
  Mail,
  Clock,
  Check,
  X,
  Bell
} from "lucide-react";
import { useClinic } from "../../context/clinicContext";
import { useAuth } from "../../context/authContext";
import ActionTile from "../../components/Reception/ActionTile";
import ConsultationRow from "../../components/Reception/ConsultationRow";
import toast from "react-hot-toast";

/**
 * Page d'accueil réceptionniste : amélioration visuelle + actions
 *
 * Remarques :
 * - Cette version utilise un mock de rendez-vous (comme ton exemple).
 * - Les handlers (checkIn / checkOut / postpone / cancel) mettent à jour l'état local et affichent des toasts.
 * - Intègre badge "demandes" dans ActionTile.
 */

export default function ReceptionnistHome() {
  const navigate = useNavigate();
  const { clinic } = useClinic() || {};
  const { user } = useAuth() || {};

  const [query, setQuery] = useState("");

  // theme colors (si ta clinic fournit hex, utilise les — sinon fallback)
  const primaryColor = clinic?.theme?.primaryColor || "#0ea5e9";
  const accentColor = clinic?.theme?.secondaryColor || "#6366f1";

  // sample data enrichi (patient contact + status)
  const now = useMemo(() => new Date(), []);
  const initConsultations = useMemo(() => ([
    {
      id: 1,
      patient: { name: "Marie Dupont", phone: "+216 55 123 456", email: "marie.dupont@example.com" },
      doctor: "Dr. Martin",
      time: new Date(now.getTime() - 10 * 60000).toISOString(),
      status: "scheduled" // scheduled | checked_in | checked_out | cancelled
    },
    {
      id: 2,
      patient: { name: "Ali Ben", phone: "+216 98 222 333", email: "ali.ben@example.com" },
      doctor: "Dr. Durand",
      time: new Date(now.getTime() + 20 * 60000).toISOString(),
      status: "scheduled"
    },
    {
      id: 3,
      patient: { name: "Sophie Legrand", phone: "+216 22 444 555", email: "sophie.legrand@example.com" },
      doctor: "Dr. Martin",
      time: new Date(now.getTime() + 90 * 60000).toISOString(),
      status: "scheduled"
    },
    {
      id: 4,
      patient: { name: "Pauline Moreau", phone: "+216 77 888 999", email: "pauline.moreau@example.com" },
      doctor: "Dr. Bernard",
      time: new Date(now.getTime() + 150 * 60000).toISOString(),
      status: "scheduled"
    }
  ]), [now]);

  const [consultations, setConsultations] = useState(initConsultations);

  // stats / notifications (remplace par tes vrais appels API)
  const stats = {
    patients: 1245,
    requests: 12, // nombre de demandes en attente -> badge
    doctors: 18,
  };

  // Helpers
  const updateConsultation = (id, patch) => {
    setConsultations(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  };

  const handleCheckIn = (id) => {
    updateConsultation(id, { status: "checked_in", checkedInAt: new Date().toISOString() });
    toast.success("Patient enregistré (check-in)");
  };

  const handleCheckOut = (id) => {
    const ok = window.confirm("Marquer comme check-out (fin de visite) ?");
    if (!ok) return;
    updateConsultation(id, { status: "checked_out", checkedOutAt: new Date().toISOString() });
    toast.success("Check-out effectué");
  };

  const handleCancel = (id) => {
    const ok = window.confirm("Annuler le rendez-vous ? Cette action peut être annulée manuellement.");
    if (!ok) return;
    updateConsultation(id, { status: "cancelled" });
    toast("Rendez-vous annulé", { icon: "⚠️" });
  };

  const handlePostpone = (id) => {
    // prompt simple : minutes to postpone
    const minutesStr = window.prompt("Reporter de combien de minutes ?", "15");
    if (!minutesStr) return;
    const minutes = parseInt(minutesStr, 10);
    if (isNaN(minutes) || minutes <= 0) return toast.error("Valeur invalide");
    setConsultations(prev => prev.map(c => {
      if (c.id !== id) return c;
      const newTime = new Date(new Date(c.time).getTime() + minutes * 60000);
      toast.success(`Rendez-vous reporté de ${minutes} min → ${newTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`);
      return { ...c, time: newTime.toISOString(), status: "scheduled" };
    }));
  };

  // search
  function onSearch(e) {
    e?.preventDefault?.();
    const q = (query || "").trim();
    if (!q) return navigate('/receptionnist/search');
    navigate(`/receptionnist/search?q=${encodeURIComponent(q)}`);
  }

  // split lists for "now" and "upcoming"
  const withinNow = (t) => Math.abs(new Date(t) - now) <= 30 * 60000;
  const nowConsultations = consultations.filter(c => withinNow(c.time) && c.status !== "cancelled");
  const upcoming = consultations
    .filter(c => new Date(c.time) > now && c.status !== "cancelled")
    .sort((a,b)=> new Date(a.time) - new Date(b.time));

  return (
    <div className="min-h-[80dvh] bg-gradient-to-b from-slate-50 to-slate-100/60 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* header */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Accueil — Réception</h1>
            <p className="text-sm text-slate-500 mt-1">Gérez patients, rendez-vous et confirmations depuis un seul écran.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-600">
              Bonjour,&nbsp;<span className="font-medium text-slate-900">{user?.full_name || "équipe"}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/receptionnist/requests")}
                className="relative inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white shadow-sm border"
                title="Demandes de RDV"
                style={{ borderColor: "#e6edf3" }}
              >
                <Bell className="w-4 h-4 text-slate-600" />
                <span className="text-sm text-slate-700">Demandes</span>

                {/* badge */}
                {stats.requests > 0 && (
                  <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-semibold leading-none text-white bg-rose-600 rounded-full shadow-sm">
                    {stats.requests}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* top tiles + search */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-150 border border-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Bienvenue</div>
                <div className="text-xl font-semibold">Bonjour, équipe de réception</div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-center px-4 py-2 bg-white rounded-lg shadow-sm">
                  <div className="text-xs text-slate-500">Patients</div>
                  <div className="font-bold text-slate-800">{stats.patients}</div>
                </div>
                <div className="text-center px-4 py-2 bg-white rounded-lg shadow-sm">
                  <div className="text-xs text-slate-500">Demandes</div>
                  <div className="font-bold text-slate-800">{stats.requests}</div>
                </div>
                <div className="text-center px-4 py-2 bg-white rounded-lg shadow-sm">
                  <div className="text-xs text-slate-500">Médecins</div>
                  <div className="font-bold text-slate-800">{stats.doctors}</div>
                </div>
              </div>
            </div>

            {/* recherche */}
            <form onSubmit={onSearch} className="mt-4 flex gap-3">
              <div className="flex-1 relative">
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Rechercher patient par nom, téléphone ou dossier..."
                  className="w-full rounded-lg border px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-opacity-50 bg-white"
                  style={{ borderColor: "#e6edf3" }}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search size={16} />
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-md text-white font-medium shadow hover:brightness-95 transition cursor-pointer"
                style={{ background: primaryColor }}
              >
                Rechercher
              </button>
            </form>
          </div>

          <div className="space-y-3">
            <ActionTile to="/receptionnist/patients/new" title="Créer un patient" desc="Ajouter un nouveau dossier" Icon={PlusCircle} accent={primaryColor} />
            <ActionTile to="/receptionnist/appointments/requests" title="Demandes de RDV" desc="Consulter et valider" Icon={CalendarDays} accent={accentColor} badgeCount={stats.requests} />
            <ActionTile to="/receptionnist/doctors" title="Médecins" desc="Voir emplois du temps" Icon={Users} accent={primaryColor} />
          </div>
        </section>

        {/* two columns: now / upcoming */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* NOW */}
          <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg transition-border duration-150 border border-slate-50">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">Check-ins — Maintenant</h2>
              <Link to="/receptionnist/checkins" className="text-xs font-medium text-slate-600">Voir tout</Link>
            </div>

            {nowConsultations.length ? (
              <div className="space-y-2">
                {nowConsultations.map(c => (
                  <ConsultationRow
                    key={c.id}
                    c={c}
                    onCheckIn={() => handleCheckIn(c.id)}
                    onCheckOut={() => handleCheckOut(c.id)}
                    onPostpone={() => handlePostpone(c.id)}
                    onCancel={() => handleCancel(c.id)}
                    accent={primaryColor}
                  />
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-500">Aucun rendez-vous dans l'intervalle de ±30 minutes.</div>
            )}
          </div>

          {/* UPCOMING */}
          <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg transition-border duration-150 border border-slate-50">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">Prochains rendez-vous</h2>
              <Link to="/receptionnist/appointments" className="text-xs font-medium text-slate-600">Voir la journée</Link>
            </div>

            <div className="space-y-2">
              {upcoming.slice(0, 8).map(c => (
                <ConsultationRow
                  key={c.id}
                  c={c}
                  onCheckIn={() => handleCheckIn(c.id)}
                  onCheckOut={() => handleCheckOut(c.id)}
                  onPostpone={() => handlePostpone(c.id)}
                  onCancel={() => handleCancel(c.id)}
                  accent={primaryColor}
                />
              ))}
              {!upcoming.length && <div className="text-sm text-slate-500">Aucun rendez-vous à venir.</div>}
            </div>
          </div>
        </section>

        <footer className="mt-4 text-sm text-slate-500">Interface de démonstration — connecte tes données réelles pour rendre les actions effectives.</footer>
      </div>
    </div>
  );
}
