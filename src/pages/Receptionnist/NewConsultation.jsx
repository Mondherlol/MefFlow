import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import WeekCalendar from "../../components/Calendar/WeekCalendar";
import { useClinic } from "../../context/clinicContext";
import { useAuth } from "../../context/authContext";
import toast from "react-hot-toast";
import FloatingConsultationForm from "../../components/Reception/FloatingConsultationForm";

function getMonday(d) {
    const date = new Date(d);
    const day = (date.getDay() + 6) % 7; // make Monday=0
    date.setDate(date.getDate() - day);
    date.setHours(0, 0, 0, 0);
    return date;
}

function formatDateYMD(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

export default function NewConsultation() {
    const { clinic } = useClinic() || {};
    const { user } = useAuth() || {};
    const navigate = useNavigate();

    const [doctors, setDoctors] = useState([]);
    const [q, setQ] = useState("");
    const [loadingDoctors, setLoadingDoctors] = useState(false);

    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [schedules, setSchedules] = useState([]);

    const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));

    const [selectedSlot, setSelectedSlot] = useState(null); // { date: 'YYYY-MM-DD', start: 'HH:MM' }

    const [patient, setPatient] = useState("");
    const [diagnostique, setDiagnostique] = useState("");
    const [ordonnance, setOrdonnance] = useState("");

    // fetch doctors for clinic
    useEffect(() => {
        if (!clinic?.id) return;
        setLoadingDoctors(true);
        api
            .get(`/api/clinics/${clinic.id}/doctors/`)
            .then((res) => setDoctors(res.data.data || []))
            .catch((err) => {
                console.error(err);
                toast.error("Impossible de charger la liste des médecins");
            })
            .finally(() => setLoadingDoctors(false));
    }, [clinic?.id]);

    // fetch schedules when doctor selected
    useEffect(() => {
        if (!selectedDoctor) return setSchedules([]);
        api
            .get(`/api/doctors/${selectedDoctor.id}/schedules/`)
            .then((res) => setSchedules(res.data.data || []))
            .catch((err) => {
                console.error(err);
                toast.error("Impossible de charger les disponibilités du médecin");
            });
    }, [selectedDoctor]);

    const availabilityForCalendar = useMemo(() => {
        // WeekCalendar accepts availability either old or new format. We pass schedules directly.
        return schedules.map((s) => ({ id: s.id, weekday: s.weekday, slots: s.slots }));
    }, [schedules]);

    const doctorsFiltered = useMemo(() => {
        const qq = (q || "").toLowerCase().trim();
        if (!qq) return doctors;
        return doctors.filter((d) => {
            const name = d.user?.full_name?.toLowerCase() || "";
            const email = d.user?.email?.toLowerCase() || "";
            const spec = (d.specialite || "").toLowerCase();
            return name.includes(qq) || email.includes(qq) || spec.includes(qq);
        });
    }, [doctors, q]);

    // generate clickable slots for the current week
    const slotsForWeek = useMemo(() => {
        if (!schedules || !schedules.length) return [];
        const slots = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(weekStart);
            day.setDate(day.getDate() + i);
            const weekday = i; // Monday=0
            // find schedules matching weekday
            schedules
                .filter((s) => Number(s.weekday) === weekday)
                .forEach((s) => {
                    (s.slots || []).forEach((sl) => {
                        // assume sl.start is HH:MM
                        slots.push({ date: formatDateYMD(day), start: sl.start });
                    });
                });
        }
        // sort by date/time
        slots.sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
        return slots;
    }, [schedules, weekStart]);

    function prevWeek() {
        const d = new Date(weekStart);
        d.setDate(d.getDate() - 7);
        setWeekStart(getMonday(d));
    }
    function nextWeek() {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + 7);
        setWeekStart(getMonday(d));
    }

    // Creation is handled by the floating form component below

    return (
        <div className="min-h-[80dvh] p-6 md:p-10">
            <div className="max-w-6xl mx-auto space-y-6">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Créer une consultation</h1>
                        <p className="text-sm text-slate-500">Sélectionnez le médecin, choisissez un créneau et validez.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Left: search + doctors */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm">
                        <div className="mb-3">
                            <label className="text-sm font-medium text-slate-700">Rechercher un médecin</label>
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Nom, spécialité ou email"
                                className="w-full mt-2 rounded-lg border px-3 py-2"
                                style={{ borderColor: "#e6edf3" }}
                            />
                        </div>

                        <div className="space-y-2 max-h-[60vh] overflow-auto">
                            {loadingDoctors && <div className="text-sm text-slate-500">Chargement…</div>}
                            {!loadingDoctors && doctorsFiltered.length === 0 && (
                                <div className="text-sm text-slate-500">Aucun médecin trouvé.</div>
                            )}
                            {doctorsFiltered.map((d) => (
                                <button
                                    key={d.id}
                                    onClick={() => setSelectedDoctor(d)}
                                    className={`w-full text-left p-3 rounded-lg border ${selectedDoctor?.id === d.id ? "border-blue-400 bg-blue-50" : "border-slate-100"}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium">{d.user?.full_name || "—"}</div>
                                            <div className="text-xs text-slate-500">{d.specialite || "Général"}</div>
                                        </div>
                                        <div className="text-sm text-slate-600">{d.numero_salle || "—"}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Middle: calendar */}
                    <div className="lg:col-span-2 bg-white rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-sm font-medium">Emploi du médecin</div>
                            <div className="flex items-center gap-2">
                                <button onClick={prevWeek} className="px-3 py-1 rounded-md bg-slate-50">Semaine précédente</button>
                                <button onClick={nextWeek} className="px-3 py-1 rounded-md bg-slate-50">Semaine suivante</button>
                            </div>
                        </div>

                        <WeekCalendar
                            weekStart={weekStart}
                            onPrevWeek={prevWeek}
                            onNextWeek={nextWeek}
                            hours={{ start: 8, end: 18 }}
                            slotMinutes={15}
                            events={[]}
                            availability={availabilityForCalendar}
                            onChange={() => {}}
                        />

                        <div className="mt-4">
                            <h3 className="text-sm font-medium mb-2">Créneaux disponibles cette semaine</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {slotsForWeek.length === 0 && (
                                    <div className="text-sm text-slate-500">Aucun créneau disponible pour cette semaine.</div>
                                )}
                                {slotsForWeek.map((s, idx) => {
                                    const isSelected = selectedSlot && selectedSlot.date === s.date && selectedSlot.start === s.start;
                                    return (
                                        <button
                                            key={`${s.date}-${s.start}-${idx}`}
                                            onClick={() => setSelectedSlot(s)}
                                            className={`text-left p-2 rounded-lg border ${isSelected ? "bg-blue-50 border-blue-400" : "border-slate-100"}`}
                                        >
                                            <div className="text-sm font-medium">{s.date}</div>
                                            <div className="text-xs text-slate-500">{s.start}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <FloatingConsultationForm selectedDoctor={selectedDoctor} selectedSlot={selectedSlot} />
            </div>
        </div>
    );
}