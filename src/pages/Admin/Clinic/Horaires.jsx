import React, { useMemo, useRef, useState, useEffect } from "react";
import AdminTemplate from "../../../components/Admin/AdminTemplate";
import { useClinic } from "../../../context/clinicContext";
import {
  Calendar,
  Save,
  Plus,
  Copy,
  ClipboardPaste,
  Clock,
  Phone,
  AlertTriangle,
  Trash2,
  Pencil,
  Check,
  X,
  LockKeyhole,
} from "lucide-react";
import toast from "react-hot-toast";

// ------------------------------
// Helpers time <-> minutes
// ------------------------------
const toMin = (hhmm) => {
  const [h, m] = (hhmm || "00:00").split(":").map(Number);
  return h * 60 + m;
};
const toHHMM = (min) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

const sortSlots = (slots = []) => [...slots].sort((a, b) => toMin(a.start) - toMin(b.start));
const hasOverlap = (slots = []) => {
  const s = sortSlots(slots);
  for (let i = 0; i < s.length - 1; i++) if (toMin(s[i].end) > toMin(s[i + 1].start)) return true;
  return false;
};

const DAYS = [
  { id: "mon", label: "Lundi" },
  { id: "tue", label: "Mardi"},
  { id: "wed", label: "Mercredi" },
  { id: "thu", label: "Jeudi" },
  { id: "fri", label: "Vendredi" },
  { id: "sat", label: "Samedi" },
  { id: "sun", label: "Dimanche" },
];

const defaultInterval = () => ({ start: "09:00", end: "17:00" });


import SlotModal from "../../../components/Admin/ManageClinic/Horaires/SlotModal";

// ------------------------------
// Enhanced Emergency Block
// ------------------------------
import EmergencyBlock from "../../../components/Admin/ManageClinic/Horaires/EmergencyBlock";


export default function HoursPro() {
  const { clinic, theme } = useClinic() || {};


  const initial = React.useMemo(() => {
    return DAYS.reduce((acc, d) => {
      acc[d.id] = { open: d.id !== "sun", slots: d.id === "sun" ? [] : [defaultInterval()] };
      return acc;
    }, {});
  }, []);

  const [hours, setHours] = useState(() => clinic?.hours || initial);
  const [urgent, setUrgent] = useState(() => ({
    mode: clinic?.emergency?.mode || "specific",
    phone: clinic?.emergency?.phone || clinic?.emergency_phone || "",
    slots: clinic?.emergency?.slots || {},
  }));

  const clipboardRef = useRef(null);
  const [modalState, setModalState] = useState({ 
    open: false, 
    dayId: null, 
    index: null, 
    initial: null, 
    dayLabel: "",
    existingSlots: [] 
  });

  React.useEffect(() => {
    window.__openSlotModal = ({ dayLabel, initial, existingSlots = [], onSave, onDelete }) => {
      setModalState({ 
        open: true, 
        externalHandlers: { onSave, onDelete }, 
        dayLabel, 
        initial,
        existingSlots 
      });
    };
    return () => {
      delete window.__openSlotModal;
    };
  }, []);

  const openCreateForDay = (dayId) => {
    const day = hours[dayId];
    const last = day.slots[day.slots.length - 1];
    const start = last ? last.end : "09:00";
    const end = toHHMM(toMin(start) + 120);
    setModalState({ 
      open: true, 
      dayId, 
      index: null, 
      initial: { start, end }, 
      dayLabel: DAYS.find((d) => d.id === dayId)?.label,
      existingSlots: day.slots 
    });
  };

  const openEditSlot = (dayId, index) => {
    const slot = hours[dayId].slots[index];
    setModalState({ 
      open: true, 
      dayId, 
      index, 
      initial: slot, 
      dayLabel: DAYS.find((d) => d.id === dayId)?.label,
      existingSlots: hours[dayId].slots 
    });
  };

  const closeModal = () => setModalState({ 
    open: false, 
    dayId: null, 
    index: null, 
    initial: null, 
    dayLabel: "",
    existingSlots: [] 
  });

  const saveSlotFromModal = (patch) => {
    setHours((prev) => {
      const d = prev[modalState.dayId];
      const slots = [...d.slots];
      if (modalState.index == null) slots.push(patch);
      else slots[modalState.index] = { ...slots[modalState.index], ...patch };
      const sorted = sortSlots(slots);
      return { ...prev, [modalState.dayId]: { ...d, open: true, slots: sorted } };
    });
    closeModal();
  };

  const deleteSlotFromModal = () => {
    setHours((prev) => {
      const d = prev[modalState.dayId];
      const slots = d.slots.filter((_, i) => i !== modalState.index);
      return { ...prev, [modalState.dayId]: { ...d, slots } };
    });
    closeModal();
  };

  const toggleDay = (id) =>
    setHours((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        open: !prev[id].open,
        slots: !prev[id].open ? [defaultInterval()] : [],
      },
    }));

  const copyDay = (id) => {
    clipboardRef.current = { ...hours[id], slots: sortSlots(hours[id].slots) };
    toast.success(`Horaires du ${DAYS.find((d) => d.id === id)?.label} copiés`);
  };

  const pasteDay = (id) => {
    if (!clipboardRef.current) return toast.error("Aucun horaire copié");
    setHours((prev) => ({ ...prev, [id]: { ...clipboardRef.current } }));
    toast.success(`Horaires collés sur le ${DAYS.find((d) => d.id === id)?.label}`);
  };

  const saveAll = async () => {
    await new Promise((r) => setTimeout(r, 500));
    toast.success("Horaires sauvegardés avec succès !");
  };

  return (
    <AdminTemplate
      title="Gestion des horaires"
      breadcrumbs={[
        { label: "Tableau de bord", to: "/admin" },
        { label: "Clinique", to: "/admin/clinique" },
        { label: "Horaires", current: true },
      ]}
    >
      <div className="space-y-6">
        {/* Header avec actions globales */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Horaires d'ouverture</h1>
              <p className="text-slate-600">Configurez les plages horaires de votre clinique</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const allSlots = DAYS.reduce((acc, day) => {
                  acc[day.id] = { open: true, slots: [defaultInterval()] };
                  return acc;
                }, {});
                setHours(allSlots);
                toast.success("Tous les jours ouverts avec horaires par défaut");
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors font-medium"
            >
              Ouvrir tous les jours
            </button>
          </div>
        </div>

        {/* Calendrier principal */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* En-tête du calendrier */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/50">
            {DAYS.map((day) => (
              <div key={day.id} className="relative text-center py-4 font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm font-medium text-slate-600">{day.label}</span>


                </div>
                
                {/* Actions déplacées en bas pour éviter les superpositions */}
              </div>
            ))}
          </div>

          {/* Grille des créneaux */}
          <div className="grid grid-cols-7">
            {DAYS.map((day) => {
              const data = hours[day.id];
              const overlap = hasOverlap(data.slots);
              return (
                <div key={day.id} className="min-h-[160px] p-3 border-r border-slate-200 last:border-r-0 border-b bg-white group">
                  {/* Actions de jour */}
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={() => toggleDay(day.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        data.open
                          ? "bg-green-500 text-white shadow-sm hover:bg-green-600"
                          : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                      }`}
                    >
                      {data.open ? "Ouvert" : "Fermé"}
                    </button>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="p-1.5 rounded-md bg-white border border-slate-300 hover:bg-slate-50 shadow-sm"
                        title="Copier les horaires"
                        onClick={() => copyDay(day.id)}
                      >
                        <Copy className="w-3.5 h-3.5 text-slate-600" />
                      </button>
                      <button
                        className="p-1.5 rounded-md bg-white border border-slate-300 hover:bg-slate-50 shadow-sm"
                        title="Coller les horaires"
                        onClick={() => pasteDay(day.id)}
                      >
                        <ClipboardPaste className="w-3.5 h-3.5 text-slate-600" />
                      </button>
                    </div>
                  </div>

                  {overlap && (
                    <div className="mb-2 flex items-center gap-1.5 text-xs bg-red-50 text-red-700 px-2 py-1 rounded border border-red-200">
                      <AlertTriangle className="w-3 h-3" />
                      Chevauchement
                    </div>
                  )}

                  {data.open ? (
                    <div className="space-y-2">
                      {sortSlots(data.slots).map((slot, i) => (
                        <button
                          key={i}
                          onClick={() => openEditSlot(day.id, i)}
                          className="w-full text-sm bg-blue-50 text-blue-700 rounded-lg px-3 py-2 border border-blue-200 flex items-center justify-between hover:bg-blue-100 transition-colors group/slot"
                        >
                          <span className="font-medium">
                            {slot.start} – {slot.end}
                          </span>
                          <Pencil className="w-3.5 h-3.5 opacity-0 group-hover/slot:opacity-100 transition-opacity" />
                        </button>
                      ))}

                      <button
                        onClick={() => openCreateForDay(day.id)}
                        className="w-full text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 py-2.5 transition-all flex items-center justify-center gap-2 font-medium"
                      >
                        <Plus className="w-4 h-4" /> Ajouter
                      </button>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">
                      <div className="text-center flex justify-center items-center flex-col gap-0">
                        <div className="text-2xl mb-1"><LockKeyhole /></div>
                        <div className="text-xs font-medium">Fermé</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section urgences */}
        <EmergencyBlock value={urgent} onChange={setUrgent} theme={theme} />

        {/* Actions de sauvegarde */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="text-sm text-slate-600">
            <strong>Conseil :</strong> Pensez à sauvegarder après chaque modification
          </div>
          <button
            type="button"
            onClick={saveAll}
            className="inline-flex items-center gap-3 rounded-xl px-8 py-3.5 text-base font-semibold text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105 min-w-[200px] justify-center"
            style={{ 
              backgroundColor: theme.primary,
              background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`
            }}
          >
            <Save className="w-5 h-5" /> 
            <span>Enregistrer les horaires</span>
          </button>
        </div>
      </div>

      {/* Modal central */}
      <SlotModal
        open={modalState.open}
        dayLabel={modalState.dayLabel}
        initial={modalState.initial}
        existingSlots={modalState.existingSlots}
        onClose={closeModal}
        onSave={(v) =>
          modalState.externalHandlers
            ? (modalState.externalHandlers.onSave(v), closeModal())
            : saveSlotFromModal(v)
        }
        onDelete={modalState.index != null ? deleteSlotFromModal : modalState.externalHandlers?.onDelete}
      />
    </AdminTemplate>
  );
}