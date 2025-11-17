// ReceptionnistHome.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  CalendarDays,
  PlusCircle,
  Bell,
  CheckCircle,
  XCircle,
  Clock as ClockIcon
} from "lucide-react";
import SearchBar from "../../components/Reception/SearchBar";
import { useClinic } from "../../context/clinicContext";
import { useAuth } from "../../context/authContext";
import ActionTile from "../../components/Reception/ActionTile";
import ConsultationRow from "../../components/Reception/ConsultationRow";
import toast from "react-hot-toast";
import api from "../../api/axios";


export default function ReceptionnistHome() {
  const navigate = useNavigate();
  const { clinic, theme } = useClinic() || {};
  const { user } = useAuth() || {};

  // theme colors (si ta clinic fournit hex, utilise les — sinon fallback)
  const primaryColor = theme.primaryColor;
  const accentColor = theme.accentColor;

  const [consultations, setConsultations] = useState([]);
  const [loadingConsultations, setLoadingConsultations] = useState(false);
  const [upcoming, setUpcoming] = useState([]);
  const [nowConsultations, setNowConsultations] = useState([]);

  // stats / notifications 
  const stats = {
    patients: 1245,
    requests: 12, // nombre de demandes en attente
    doctors: 18,
  };

  async function fetchConsultations() {
    try {
      setLoadingConsultations(true);
      const res = await api.get(`/api/consultations/?clinic_id=${clinic.id}&date=${new Date().toISOString().slice(0,10)}`);
      const data = res.data?.data || res.data || null;
      console.log("Consultations chargées :", data);

      // store full consultations for later use (history, detailed lists)
      setConsultations(data || []);

      // Mettre dans now celles dans environ 1H Max
      const now = new Date();
      const filtered = data.filter(c => {
        const heureDebut = c.heure_debut;
        const consultTime = new Date(`${c.date}T${heureDebut}`);
        const diffMinutes = (consultTime - now) / 60000;
        return diffMinutes >= -30 && diffMinutes <= 60;
      });
      setNowConsultations(filtered);

      // Mettre ceux à venir dans upcoming
      const upcomingFiltered = data.filter(c => {
        const heureDebut = c.heure_debut;
        const consultTime = new Date(`${c.date}T${heureDebut}`);
        return consultTime > now;
      });
      setUpcoming(upcomingFiltered);

    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger les consultations du jour");
    } finally {
      setLoadingConsultations(false);
    }
  }

  useEffect(() => {
    if (clinic?.id) {
      fetchConsultations();
    }
  }, [clinic?.id]);


  // Helpers
  const updateConsultation = (id, patch) => {
    setConsultations(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  };

  // Derived lists for today's timeline
  const todayYMD = new Date().toISOString().slice(0,10);
  const now = new Date();
  const pastToday = consultations
    .filter(c => c && c.date === todayYMD)
    .filter(c => {
      const t = c.heure_debut || c.start || c.time || "00:00";
      const ct = new Date(`${c.date}T${t}`);
      return ct < now;
    })
    .sort((a,b) => {
      const ta = new Date(`${a.date}T${a.heure_debut || a.start || a.time || "00:00"}`).getTime();
      const tb = new Date(`${b.date}T${b.heure_debut || b.start || b.time || "00:00"}`).getTime();
      return tb - ta; // most recent first
    });

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
                onClick={() => navigate("/reception/requests")}
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

            {/* recherche intégrée */}
            <SearchBar />
          </div>

          <div className="space-y-3">
            <ActionTile to="/reception/patients/new" title="Créer un patient" desc="Ajouter un nouveau dossier" Icon={PlusCircle} accent={primaryColor} />
            <ActionTile to="/reception/requests" title="Demandes de RDV" desc="Consulter et valider" Icon={CalendarDays} accent={accentColor} badgeCount={stats.requests} />
            <ActionTile to="/reception/doctors" title="Médecins" desc="Voir emplois du temps" Icon={Users} accent={primaryColor} />
          </div>
        </section>

        {/* two columns: now / upcoming */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* NOW */}
          <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg transition-border duration-150 border border-slate-50">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">Check-ins — Maintenant</h2>
              <Link to="/reception/checkins" className="text-xs font-medium text-slate-600">Voir tout</Link>
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
              <div className="text-sm text-slate-500">Aucun rendez-vous dans l'intervalle de ± 1 heure.</div>
            )}
          </div>

          {/* UPCOMING */}
          <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg transition-border duration-150 border border-slate-50">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">Prochains rendez-vous de la journée</h2>
              <Link to="/reception/consultations" className="text-xs font-medium text-slate-600">Voir la journée</Link>
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

      </div>
    </div>
  );
}
