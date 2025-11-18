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
import NowPanel from "../../components/Reception/NowPanel";
import UpcomingPanel from "../../components/Reception/UpcomingPanel";
import toast from "react-hot-toast";
import api from "../../api/axios";
import HistoriqueSection from "../../components/Reception/HistoriqueSection/HistoriqueSection";
import EditConsultationFloatingForm from "../../components/Reception/EditConsultationFloatingForm";


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
  const [pastToday, setPastToday] = useState([]);
  const [editingConsultation, setEditingConsultation] = useState(null);
  const [loadingAction, setLoadingAction] = useState("");

  // stats / notifications 
  const stats = {
    patients: 1245,
    requests: 12, // nombre de demandes en attente
    doctors: 18,
  };

  async function fetchConsultations() {
    try {
      setLoadingConsultations(true);
      const res = await api.get(`/api/consultations/?clinic_id=${clinic.id}&date=${new Date().toISOString().slice(0,10)}&perPage=1000`);
      const data = res.data?.data || res.data || null;
      console.log("Consultations chargées :", data);

      // store full consultations for later use (history, detailed lists)
      setConsultations(data || []);

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

  // Mettre à jour les listes dérivées lorsque `consultations` change
  useEffect(() => {
    console.log(" Liste des consultations mise à jour :", consultations);
      // Mettre dans now celles dans environ 1H Max
      const now = new Date();
      const filtered = consultations.filter(c => {
        const heureDebut = c.heure_debut;
        const consultTime = new Date(`${c.date}T${heureDebut}`);
        const diffMinutes = (consultTime - now) / 60000;
        return ((diffMinutes >= -30 && diffMinutes <= 60) && c.statusConsultation == "confirme" ) || c.statusConsultation == "encours";
      });
      setNowConsultations(filtered);    

       // Mettre ceux passés aujourd'hui dans pastToday
      const pastTodayFiltered = consultations
        .filter(c => {
          const t = c.heure_debut || "00:00";
          const ct = new Date(`${c.date}T${t}`);
          return ct < now && c.statusConsultation !== "encours" || (c.statusConsultation === "termine" || c.statusConsultation === "annuler");
        })
        .sort((a,b) => {
          const ta = new Date(`${a.date}T${a.heure_debut || "00:00"}`).getTime();
          const tb = new Date(`${b.date}T${b.heure_debut || "00:00"}`).getTime();
          return tb - ta; // most recent first
        });
      setPastToday(pastTodayFiltered);

      // Mettre ceux à venir dans upcoming — exclure ceux déjà listés dans `nowConsultations`
      const nowIds = new Set(filtered.map(n => n.id).filter(Boolean));
      const upcomingFiltered = consultations.filter(c => {
        const heureDebut = c.heure_debut;
        const consultTime = new Date(`${c.date}T${heureDebut}`);
        if (!(consultTime > now)) return false;
        if (c.id && nowIds.has(c.id)) return false;
        if( c.statusConsultation !== "confirme") return false;
        return true;
      });
      setUpcoming(upcomingFiltered);


  }, [consultations]);


  // Helpers
  const updateConsultation = (id, patch) => {
    setConsultations(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  };



  const handleCheckIn = async (id) => {
    // Disable button and show loader until server responds
    setLoadingAction(`checkin-${id}`);
    try {
      const res = await api.patch(`/api/consultations/${id}/check-in/`);
      const data = res?.data?.data || res?.data || null;
      if (data) {
        updateConsultation(id, data);
      } 
      toast.success("Check-in effectué");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du check-in");
    } finally {
      setLoadingAction("");
    }
  
  };

  const handleCheckOut = async (id) => {
    setLoadingAction(`checkout-${id}`);
    try {
      const res = await api.patch(`/api/consultations/${id}/check-out/`);
      const data = res?.data?.data || res?.data || null;
      if (data) {
        updateConsultation(id, data);
      }
      toast.success("Check-out effectué");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du check-out");
    } finally {
      setLoadingAction("");
    }
  };

  const handleCancel = async (id) => {
    const ok = window.confirm("Annuler le rendez-vous ?");
    if (!ok) return;
    setLoadingAction(`cancel-${id}`);
    try {
      const res = await api.patch(`/api/consultations/${id}/cancel/`);
      const data = res?.data?.data || res?.data || null;
      if (data) {
        updateConsultation(id, data);
      } else {
        updateConsultation(id, { statusConsultation: "annuler", status: "cancelled" });
      }
      toast.success("Rendez-vous annulé");
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'annulation");
    } finally {
      setLoadingAction("");
    }
  };

  const handlePostpone = (id) => {
    const c = consultations.find(x => x.id === id);
    if (!c) return toast.error("Rendez-vous introuvable");
    setEditingConsultation(c);
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

        {/* two columns: now / upcoming (split into components) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NowPanel
            consultations={nowConsultations}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            onPostpone={handlePostpone}
            onCancel={handleCancel}
            accent={primaryColor}
            loadingAction={loadingAction}
            loadingConsultations={loadingConsultations}
          />

          <UpcomingPanel
            consultations={upcoming}
            onPostpone={handlePostpone}
            onCancel={handleCancel}
            accent={primaryColor}
            loadingAction={loadingAction}
            loadingConsultations={loadingConsultations}
          />
        </section>

        {/* HISTORIQUE DE LA JOURNEE */}
        <HistoriqueSection pastToday={pastToday} onCancel={(id) => handleCancel(id)} onPostpone={(id) => handlePostpone(id)} loadingAction={loadingAction}  loadingConsultations={loadingConsultations} />

        {/* Edit modal for postponing/editing consultations */}
        {editingConsultation && (
          <EditConsultationFloatingForm
            consultation={editingConsultation}
            onClose={() => setEditingConsultation(null)}
            onSaved={(result, serverData) => {
              try {
                const original = result?.original;
                const modified = result?.modified || {};
                const saved = serverData || modified;
                const id = saved?.id || original?.id;
                const todayYMD = new Date().toISOString().slice(0,10);
                if (!id) return;
                if (saved?.date === todayYMD) {
                  // update in-place
                  updateConsultation(id, saved);
                } else {
                  // removed from today's list
                  setConsultations(prev => prev.filter(c => c.id !== id));
                }
                setEditingConsultation(null);
                toast.success("Consultation mise à jour");
              } catch (err) {
                console.error(err);
                toast.error("Erreur lors de la mise à jour");
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
