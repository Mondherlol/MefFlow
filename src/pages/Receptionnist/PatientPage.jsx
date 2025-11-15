// PatientPage.jsx (Design modernisé — plus doux, sans bordures noires)
import React, { useEffect, useState, useMemo } from "react";
import { useClinic } from "../../context/clinicContext";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";
import ReceptionistTemplate from "../../components/Reception/ReceptionTemplate";
import {
  PlusCircle,
  Trash2,
  Edit2,
  CalendarDays,
  Phone,
  X,
  Check,
  Repeat
} from "lucide-react";

/* -------------------------- Petite UI moderne -------------------------- */

function ModalShell({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl mx-4">
        <div className="bg-white/95 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-transparent">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition">
              <X className="w-5 h-5 text-slate-700" />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

function EditModal({ open, initial, onClose, onSave }) {
  const [form, setForm] = useState(initial || {});
  useEffect(() => setForm(initial || {}), [initial]);
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <ModalShell open={open} title="Modifier le patient" onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-500">Nom complet</label>
            <input className="mt-1 w-full rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300" value={form.full_name || ""} onChange={e => set("full_name", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-slate-500">Téléphone</label>
            <input className="mt-1 w-full rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300" value={form.phone || ""} onChange={e => set("phone", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-slate-500">Date de naissance</label>
            <input type="date" className="mt-1 w-full rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300" value={form.date_naissance || ""} onChange={e => set("date_naissance", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-slate-500">Genre</label>
            <input className="mt-1 w-full rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300" value={form.genre || ""} onChange={e => set("genre", e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <input className="col-span-1 rounded-lg px-3 py-2 bg-slate-50" placeholder="Taille (cm)" value={form.height_cm ?? ""} onChange={e=>set("height_cm", e.target.value)} />
          <input className="col-span-1 rounded-lg px-3 py-2 bg-slate-50" placeholder="Poids (kg)" value={form.weight_kg ?? ""} onChange={e=>set("weight_kg", e.target.value)} />
          <input className="col-span-1 rounded-lg px-3 py-2 bg-slate-50" placeholder="Groupe sanguin" value={form.blood_type || ""} onChange={e=>set("blood_type", e.target.value)} />
        </div>

        <div>
          <label className="block text-xs text-slate-500">Adresse</label>
          <input className="mt-1 w-full rounded-lg px-3 py-2 bg-slate-50" value={form.adresse || ""} onChange={e => set("adresse", e.target.value)} />
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition">Annuler</button>
          <button onClick={() => onSave(form)} className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow hover:scale-[1.01] transition">Enregistrer</button>
        </div>
      </div>
    </ModalShell>
  );
}

function ConfirmModal({ open, title, description, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <ModalShell open={open} title={title} onClose={onCancel}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600">{description}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition">Annuler</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-rose-600 text-white shadow hover:opacity-95 transition">Supprimer</button>
        </div>
      </div>
    </ModalShell>
  );
}

function Pill({ children, className = "" }) {
  return <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 ${className}`}>{children}</span>;
}

/* -------------------------- Main -------------------------- */

export default function PatientPage() {
  const { id: patientId } = useParams();
  const { clinic } = useClinic() || {};
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  const [openEdit, setOpenEdit] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  const now = useMemo(() => new Date(), []);
  const sampleConsultations = useMemo(() => ([
    { id: 'c1', time: new Date(now.getTime() - 60*60000).toISOString(), doctor: 'Dr. Martin', status: 'completed' },
    { id: 'c2', time: new Date(now.getTime() + 30*60000).toISOString(), doctor: 'Dr. Durand', status: 'scheduled' },
    { id: 'c3', time: new Date(now.getTime() + 24*3600000).toISOString(), doctor: 'Dr. Bernard', status: 'scheduled' }
  ]), [now]);

  const sampleRequests = useMemo(() => ([
    { id: 'r1', requested_at: new Date(now.getTime() - 2*3600000).toISOString(), reason: 'Douleur thoracique' },
    { id: 'r2', requested_at: new Date(now.getTime() - 24*3600000).toISOString(), reason: 'Rappel vaccination' },
  ]), [now]);

  /* ---------- API ---------- */
  const fetchPatient = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/patients/${patientId}/`);
      setPatient(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger le patient");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!patientId) return;
    fetchPatient();
  }, [patientId]);

  const savePatient = async (payload) => {
    try {
      setPatient(prev => ({ ...prev, ...payload }));
      await api.patch(`/api/patients/${patientId}/`, payload);
      toast.success("Patient mis à jour");
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la mise à jour");
      fetchPatient();
    }
  };

  const deletePatient = async () => {
    try {
      await api.delete(`/api/patients/${patientId}/`);
      toast.success("Patient supprimé");
      navigate('/reception/patients');
    } catch (err) {
      console.error(err);
      toast.error("Impossible de supprimer");
      setOpenDeleteConfirm(false);
    }
  };

  /* ---------- local RDV actions (demo) ---------- */
  const [localConsultations, setLocalConsultations] = useState(sampleConsultations);
  useEffect(()=> setLocalConsultations(sampleConsultations), [sampleConsultations]);

  const updateConsult = (id, patch) => setLocalConsultations(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  const handleCheckIn = (id) => { updateConsult(id, { status: "checked_in", checkedInAt: new Date().toISOString() }); toast.success("Check-in"); };
  const handleCheckOut = (id) => { if (!confirm("Confirmer check-out ?")) return; updateConsult(id, { status: "checked_out", checkedOutAt: new Date().toISOString() }); toast.success("Check-out"); };
  const handlePostpone = (id) => { const m = parseInt(prompt("Reporter de combien de minutes ?", "15"), 10); if (!m || isNaN(m)) return toast.error("Valeur invalide"); setLocalConsultations(prev => prev.map(c => c.id===id ? ({...c, time: new Date(new Date(c.time).getTime()+m*60000).toISOString(), status:'scheduled'}) : c)); toast.success(`Reporté ${m}min`); };
  const handleCancel = (id) => { if (!confirm("Annuler ce rendez-vous ?")) return; updateConsult(id, { status: "cancelled" }); toast("Annulé"); };

  /* ---------- UI ---------- */
  const initials = (patient?.user?.full_name || "??").split(" ").map(s => s[0]).slice(0,2).join("").toUpperCase();

  if (loading) {
    return (
      <ReceptionistTemplate title="Dossier patient" breadcrumbs={[{ label:"Accueil réception", to:"/reception" }, { label:"Patients", to:"/reception/patients" }, { label:"...", current:true }]}>
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="rounded-2xl bg-gradient-to-r from-slate-50 to-white p-6 shadow-lg animate-pulse" />
        </div>
      </ReceptionistTemplate>
    );
  }

  if (!patient) {
    return (
      <ReceptionistTemplate title="Dossier patient" breadcrumbs={[{ label:"Accueil réception", to:"/reception" }, { label:"Patients", to:"/reception/patients" }, { label:"Introuvable", current:true }]}>
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl bg-white p-8 shadow-lg text-center">
            <div className="text-5xl">😕</div>
            <div className="text-xl font-semibold mt-3">Patient introuvable</div>
            <div className="mt-4">
              <button onClick={() => navigate('/reception/patients')} className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition">Retour</button>
            </div>
          </div>
        </div>
      </ReceptionistTemplate>
    );
  }

  return (
    <ReceptionistTemplate title={`Dossier — ${patient.user?.full_name}`} breadcrumbs={[{ label:"Accueil réception", to:"/reception" }, { label:"Patients", to:"/reception/patients" }, { label: patient.user?.full_name || "Dossier", current:true }]}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 bg-white/90 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-2xl font-bold text-indigo-700">
              {initials}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold truncate">{patient.user?.full_name}</h2>
                <Pill className="bg-emerald-100 text-emerald-700">{patient.status || "Actif"}</Pill>
                {patient?.blood_type && <Pill className="bg-sky-100 text-sky-700">Groupe {patient.blood_type}</Pill>}
              </div>
              <div className="text-sm text-slate-500 mt-1 truncate">{patient.user?.phone || "—"}</div>
              <div className="text-xs text-slate-400 mt-1 truncate">{patient.adresse || ""}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setOpenEdit(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white shadow-sm hover:translate-y-0.5 transition">
              <Edit2 className="w-4 h-4 text-slate-700" /> Éditer
            </button>

            <button onClick={() => navigate(`/reception/consultations/new?patientId=${patientId}`)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-linear-to-r from-sky-500 to-sky-600 text-white shadow hover:scale-[1.01] transition">
              <PlusCircle className="w-4 h-4" /> Nouveau RDV
            </button>

            <button onClick={() => setOpenDeleteConfirm(true)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-600 text-white shadow hover:opacity-95 transition">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left info */}
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-4 shadow-md">
              <div className="text-sm font-semibold mb-3">Informations</div>
              <div className="grid grid-cols-2 gap-3">
                <InfoCell label="Téléphone" value={patient.user?.phone || "—"} action={<a href={`tel:${patient.user?.phone}`} className="text-sm text-indigo-600 inline-flex items-center gap-2"> <Phone className="w-4 h-4" /> Appeler</a>} />
                <InfoCell label="Naissance" value={patient.date_naissance || "—"} />
                <InfoCell label="Genre" value={patient.genre || "—"} />
                <InfoCell label="Taille" value={patient.height_cm ? `${patient.height_cm} cm` : "—"} />
                <InfoCell label="Poids" value={patient.weight_kg ? `${patient.weight_kg} kg` : "—"} />
                <InfoCell label="Groupe sanguin" value={patient.blood_type || "—"} />
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold">Allergies & notes</div>
                <button onClick={() => setOpenEdit(true)} className="text-xs text-indigo-600">Modifier</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(patient.allergies && patient.allergies.length) ? patient.allergies.map(a => <span key={a} className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs">{a}</span>) : <div className="text-sm text-slate-500">Aucune</div>}
              </div>
              {patient.notes && <div className="mt-3 text-sm text-slate-700">{patient.notes}</div>}
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-md">
              <div className="text-sm font-semibold mb-3">Actions rapides</div>
              <div className="flex flex-col gap-2">
                <button onClick={() => navigate(`/reception/patients/${patientId}/medical-record`)} className="w-full text-left px-4 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition">Dossier médical</button>
                <button onClick={() => navigate(`/reception/patients/${patientId}/payments`)} className="w-full text-left px-4 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition">Factures & paiements</button>
                <button onClick={() => toast.info("Impression (demo)")} className="w-full text-left px-4 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition">Imprimer résumé</button>
              </div>
            </div>
          </div>

          {/* Right: consultations & demandes */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl bg-white p-4 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold">Consultations & historique</div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-slate-50"><CalendarDays className="w-4 h-4" /> Liste</div>
                </div>
              </div>

              <div className="space-y-3">
                {localConsultations.length ? localConsultations.map(c => (
                  <div key={c.id} className="rounded-xl bg-gradient-to-bl from-white to-slate-50 p-3 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-2 h-12 rounded-md bg-gradient-to-b from-sky-400 to-indigo-400" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{new Date(c.time).toLocaleDateString()} • {new Date(c.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                        <div className="text-xs text-slate-500 truncate">{c.doctor} • {c.status}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {c.status !== "checked_in" && c.status !== "checked_out" && (
                        <button onClick={() => handleCheckIn(c.id)} className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-600 text-white shadow hover:scale-[1.02] transition">
                          <Check className="w-4 h-4" /> Check-in
                        </button>
                      )}

                      {c.status === "checked_in" && (
                        <button onClick={() => handleCheckOut(c.id)} className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-700 text-white shadow hover:opacity-95 transition">
                          <Check className="w-4 h-4" /> Check-out
                        </button>
                      )}

                      <button onClick={() => handlePostpone(c.id)} title="Reporter" className="p-2 rounded-lg bg-white/80 shadow-sm hover:bg-slate-100 transition">
                        <Repeat className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleCancel(c.id)} title="Annuler" className="p-2 rounded-lg bg-white/80 shadow-sm hover:bg-rose-50 transition">
                        <Trash2 className="w-4 h-4 text-rose-600" />
                      </button>
                    </div>
                  </div>
                )) : <div className="text-sm text-slate-500">Aucun historique</div>}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold">Demandes</div>
                <button onClick={() => navigate(`/reception/appointments/requests?patientId=${patientId}`)} className="text-xs text-indigo-600">Voir tout</button>
              </div>
              <div className="space-y-3">
                {sampleRequests.length ? sampleRequests.map(r => (
                  <div key={r.id} className="flex items-center justify-between gap-3 bg-slate-50 rounded-lg p-3">
                    <div>
                      <div className="font-medium text-sm">{r.reason}</div>
                      <div className="text-xs text-slate-500">{new Date(r.requested_at).toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toast.success("Accepté (demo)")} className="px-3 py-1 rounded-lg bg-emerald-600 text-white">Accepter</button>
                      <button onClick={() => toast.error("Refusé (demo)")} className="px-3 py-1 rounded-lg bg-white/80 text-rose-600 border border-transparent hover:bg-rose-50 transition">Refuser</button>
                    </div>
                  </div>
                )) : <div className="text-sm text-slate-500">Aucune demande</div>}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Supprimer le patient</div>
                  <div className="text-xs text-slate-500">Supprimer efface toutes les données associées.</div>
                </div>
                <div>
                  <button onClick={() => setOpenDeleteConfirm(true)} className="px-4 py-2 rounded-lg bg-rose-600 text-white shadow hover:opacity-95 transition">Supprimer</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <EditModal
          open={openEdit}
          initial={{
            full_name: patient.user?.full_name,
            phone: patient.user?.phone,
            date_naissance: patient.date_naissance || "",
            genre: patient.genre || "",
            height_cm: patient.height_cm || "",
            weight_kg: patient.weight_kg || "",
            adresse: patient.adresse || "",
            blood_type: patient.blood_type || ""
          }}
          onClose={() => setOpenEdit(false)}
          onSave={(form) => {
            const payload = {
              date_naissance: form.date_naissance,
              genre: form.genre,
              height_cm: form.height_cm,
              weight_kg: form.weight_kg,
              adresse: form.adresse,
              blood_type: form.blood_type,
              user: { full_name: form.full_name, phone: form.phone }
            };
            savePatient(payload);
            setOpenEdit(false);
          }}
        />

        <ConfirmModal
          open={openDeleteConfirm}
          title="Supprimer le patient"
          description="Cette action est irréversible. Confirmer la suppression ?"
          onCancel={() => setOpenDeleteConfirm(false)}
          onConfirm={() => { deletePatient(); }}
        />
      </div>
    </ReceptionistTemplate>
  );
}

/* ---------- petits composants ---------- */

function InfoCell({ label, value, action }) {
  return (
    <div className="bg-slate-50 rounded-lg p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 flex items-center justify-between gap-2">
        <div className="text-sm font-medium text-slate-800 truncate">{value}</div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
