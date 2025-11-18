import { useMemo, useState, useEffect } from "react";
import ReceptionistTemplate from "../../components/Reception/ReceptionTemplate";
import {  Search as SearchIcon, RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import ConsultationListCard from "../../components/Reception/ConsultationListCard";
import { useClinic } from "../../context/clinicContext";
import { useNavigate } from "react-router-dom";

export default function Consultations() {
  const navigate = useNavigate();
  const todayDefault = new Date().toISOString().slice(0,10);

  const [date, setDate] = useState(todayDefault);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState("");
  const {clinic} = useClinic();

  // filters
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [hourFilter, setHourFilter] = useState("");
  const [search, setSearch] = useState("");

  // modal state for check-in confirmation
  const [checkInModal, setCheckInModal] = useState({ open: false, consultation: null });

  // doctors from API (clinic)
  const [clinicDoctors, setClinicDoctors] = useState([]);

  useEffect(() => {
    async function fetchDoctors() {
      if (!clinic?.id) return;
      try {
        const res = await api.get(`/api/clinics/${clinic.id}/doctors/`);
        const data = res?.data?.data || res?.data || [];
        setClinicDoctors(data || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchDoctors();
  }, [clinic?.id]);

  // status counts for nice tag filters
  const statusCounts = useMemo(() => {
    const counts = { all: consultations.length };
    consultations.forEach(c => { const s = (c.statusConsultation || c.status || '').toLowerCase(); counts[s] = (counts[s] || 0) + 1; });
    return counts;
  }, [consultations]);

  // fetch consultations for the selected date
  async function fetchConsultations() {
    try {
      setLoading(true);
      const res = await api.get(`/api/consultations/?`, { params: { date, perPage: 1000, clinic_id: clinic?.id } });
      const data = res?.data?.data || res?.data || [];
      setConsultations(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger les consultations");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchConsultations(); }, [date]);

  // helpers to update local state after server actions
  const updateConsultation = (id, patch) => {
    setConsultations(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  };

  // actions
  const handleCheckIn = (c) => {
    setCheckInModal({ open: true, consultation: c });
  };

  const confirmCheckIn = async () => {
    const c = checkInModal.consultation;
    if (!c) return setCheckInModal({ open: false, consultation: null });
    setLoadingAction(`checkin-${c.id}`);
    try {
      const res = await api.patch(`/api/consultations/${c.id}/check-in/`);
      const data = res?.data?.data || res?.data || null;
      if (data) updateConsultation(c.id, data);
      else updateConsultation(c.id, { statusConsultation: 'encours', status: 'checked_in', checkedInAt: new Date().toISOString(), heure_debut: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) });
      toast.success("Check-in effectué — heure mise à jour à maintenant");
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du check-in");
    } finally {
      setLoadingAction("");
      setCheckInModal({ open: false, consultation: null });
    }
  };

  const handleCheckOut = async (id) => {
    setLoadingAction(`checkout-${id}`);
    try {
      const res = await api.patch(`/api/consultations/${id}/check-out/`);
      const data = res?.data?.data || res?.data || null;
      if (data) updateConsultation(id, data);
      else updateConsultation(id, { statusConsultation: 'termine', status: 'checked_out' });
      toast.success('Check-out effectué');
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du check-out');
    } finally { setLoadingAction(""); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Annuler le rendez-vous ?')) return;
    setLoadingAction(`cancel-${id}`);
    try {
      const res = await api.patch(`/api/consultations/${id}/cancel/`);
      const data = res?.data?.data || res?.data || null;
      if (data) updateConsultation(id, data);
      else updateConsultation(id, { statusConsultation: 'annule', status: 'cancelled' });
      toast.success('Rendez-vous annulé');
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de l\'annulation');
    } finally { setLoadingAction(""); }
  };

  const handlePostpone = (id) => {
    // reuse editing modal from parent app if available — here we just show a toast and open edit flow
    const c = consultations.find(x => x.id === id);
    if (!c) return toast.error('Rendez-vous introuvable');
    // open edit — for now navigate to edit route if exists
    navigate(`/reception/consultations/${id}/edit`);
  };

  // client-side filtering & searching
  const filtered = consultations.filter(c => {
    if (doctorFilter !== 'all') {
      const docId = c.doctor?.id || c.doctor_id || c.doctorId || (c.doctor && c.doctor.user_id) || '';
      if (!docId) return false;
      if (String(docId) !== String(doctorFilter)) return false;
    }
    if (statusFilter !== 'all') {
      if ((c.statusConsultation || c.status || '').toLowerCase() !== statusFilter.toLowerCase()) return false;
    }
    if (hourFilter) {
      const selectedHour = String(hourFilter).split(':')[0].padStart(2,'0');
      const consultRaw = String(c.heure_debut || c.time || '');
      const consultHourPart = consultRaw.split(':')[0];
      if (!consultHourPart) return false;
      if (consultHourPart.padStart(2,'0') !== selectedHour) return false;
    }
    if (search) {
      const q = search.trim().toLowerCase();
      const patient = (c.patient?.full_name || c.patient?.user?.full_name || c.patientName || '').toLowerCase();
      const doctor = (c.doctor?.full_name || c.doctorName || '').toLowerCase();
      if (!patient.includes(q) && !doctor.includes(q) && String(c.id).toLowerCase().indexOf(q) === -1) return false;
    }
    return true;
  });

  return (
    <ReceptionistTemplate
      title="Consultations"
      breadcrumbs={[{ label: "Accueil réception", to: "/reception" }, { label: "Consultations", current: true }]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Consultations</h2>
            <p className="text-sm text-slate-500 mt-1">Liste et actions pour une journée donnée.</p>
          </div>
          <div className="flex items-center gap-3">
            <h3>Liste des consultations du : </h3>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-100 bg-white text-sm" />
            à : 
            <select value={hourFilter} onChange={e => setHourFilter(e.target.value)} className="text-sm rounded-lg border border-slate-100 bg-white px-3 py-2 w-34">
              <option value="">Toutes heures</option>
              {Array.from({length: 11}).map((_,i) => {
                const hour = 8 + i; const hh = String(hour).padStart(2,'0') + ':00';
                return <option key={hh} value={hh}>{hh}</option>;
              })}
            </select>
          </div>
        </div>

        {/* filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex items-center gap-2 w-full md:w-auto">

            <select value={doctorFilter} onChange={e => setDoctorFilter(e.target.value)} className="text-sm rounded-lg border border-slate-100 bg-white px-3 py-2">
              <option value="all">Tous les médecins</option>
              {clinicDoctors.map(d => (
                <option key={d.id || d.user_id || d.pk || d._id || d.name} value={d.id || d.user_id || d.pk || d._id || d.name}>{d.full_name || d.name || d.user?.full_name || d.profile?.full_name || d.email || d.id}</option>
              ))}
            </select>

            {/* status tags like historique */}
            <div className="flex items-center gap-2 h-fit justify-center flex-wrap">
              {["all","confirme","encours","termine","annule"].map(s => {
                const label = s === "all" ? "Tous" : s === "confirme" ? "Confirmé" : s === "encours" ? "En cours" : s === "termine" ? "Terminé" : "Annulé";
                const active = statusFilter === s;
                const count = statusCounts[s] || 0;
                const activeClasses = active ? (s === 'all' ? 'bg-sky-500 text-white shadow-sm' : s === 'confirme' ? 'bg-orange-400 text-white shadow-sm' : s === 'termine' ? 'bg-emerald-500 text-white shadow-sm' : s === 'annule' ? 'bg-rose-500 text-white shadow-sm' : 'bg-sky-400 text-white') : 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100';
                return (
                  <button key={s} onClick={() => { setStatusFilter(s); }} className={`text-xs px-3 py-1.5 rounded-full border transition ${active ? activeClasses : 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100'}`} title={`${count} rendez-vous`}>
                    {label} <span className="ml-1 ">({count})</span>
                  </button>
                );
              })}
            </div>


          </div>

          <div className="ml-auto flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher patient, médecin, id..." className="pl-10 pr-3 py-2 w-full rounded-lg border border-slate-100 bg-slate-50 text-sm" />
            </div>
            <button onClick={fetchConsultations} className="px-3 py-2 cursor-pointer hover:bg-slate-200 rounded-md bg-slate-100 text-sm"><RefreshCcw className="w-4 h-4 text-slate-600" /></button>
          </div>
        </div>

        {/* content */}
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-2">
              <div className="h-12 rounded-lg bg-slate-100 animate-pulse" />
              <div className="h-12 rounded-lg bg-slate-100 animate-pulse" />
              <div className="h-12 rounded-lg bg-slate-100 animate-pulse" />
            </div>
          ) : (
            filtered.length ? (
              filtered.map(c => (
                <div key={c.id}>
                  <ConsultationListCard
                    consultation={c}
                    onCheckIn={(cons) => handleCheckIn(cons)}
                    onCheckOut={(id) => handleCheckOut(id)}
                    onPostpone={(id) => handlePostpone(id)}
                    onCancel={(id) => handleCancel(id)}
                    loadingAction={loadingAction}
                    accent="#0ea5e9"
                  />
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-500">Aucune consultation pour ces filtres.</div>
            )
          )}
        </div>

        {/* modal: check-in confirmation */}
        {checkInModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setCheckInModal({ open: false, consultation: null })} />
            <div className="relative bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
              <h3 className="text-lg font-semibold">Confirmer le check-in</h3>
              <p className="text-sm text-slate-600 mt-2">Si vous confirmez, l'heure de début du rendez-vous sera mise à l'heure actuelle et le statut passera en "En cours".</p>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button onClick={() => setCheckInModal({ open: false, consultation: null })} className="px-3 py-2 rounded-md bg-white border">Annuler</button>
                <button onClick={confirmCheckIn} className="px-3 py-2 rounded-md bg-emerald-600 text-white">Confirmer le check-in</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ReceptionistTemplate>
  );
}
