import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import WeekCalendar from "../../components/Calendar/WeekCalendar";
import { useClinic } from "../../context/clinicContext";
import toast from "react-hot-toast";
import FloatingConsultationForm from "../../components/Reception/FloatingConsultationForm";
import { formatDateYMD, getMonday } from "../../utils/dateUtils";

export default function NewConsultation() {
    const { clinic } = useClinic() || {};
    const [doctors, setDoctors] = useState([]);
    const [q, setQ] = useState("");
    const [loadingDoctors, setLoadingDoctors] = useState(false);

    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [horaires, setHoraires] = useState([]);
    const [consultations, setConsultations] = useState([]);
    const [loadingHoraires, setLoadingHoraires] = useState(false);
    const [loadingConsultations, setLoadingConsultations] = useState(false);

    const [consultationProvisoire, setConsultationProvisoire] = useState({
        date: null,
        start: null,
        title: "",
        duree: 15,
    });

    const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
    const [selectedSlot, setSelectedSlot] = useState(null); // { date: 'YYYY-MM-DD', start: 'HH:MM' }

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

    useEffect(() => {
        console.log(" Consultation provisoire updated:", consultationProvisoire);
    }, [consultationProvisoire]);

    // fetch horaires when doctor selected
    useEffect(() => {
        if (!selectedDoctor) {
            setHoraires([]);
            setLoadingHoraires(false);
            return;
        }
        setLoadingHoraires(true);
        // Recuperer les horaires du medecin
        api
            .get(`/api/doctors/${selectedDoctor.id}/schedules/`)
            .then((res) => setHoraires(res.data.data || []))
            .catch((err) => {
                console.error(err);
                toast.error("Impossible de charger les disponibilités du médecin");
            })
            .finally(() => setLoadingHoraires(false));
        // Recuperer les consultations du medecin pour la semaine en cours
        const startDate = formatDateYMD(weekStart);
        const endDate = formatDateYMD(new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6));
        fetchConsultationsByDoctorBetweenDates(selectedDoctor.id, startDate, endDate);
    }, [selectedDoctor]);


    const fetchConsultationsByDoctorBetweenDates = async (doctorId, startDate, endDate) => {
        setLoadingConsultations(true);
        try {
            // YYYY-MM-DD pour els dates en query
            const formatedStart = formatDateYMD(new Date(startDate));
            const formatedEnd = formatDateYMD(new Date(endDate));
            const res = await api.get(`/api/consultations/by-doctor/?doctor=${doctorId}&week_start=${formatedStart}&week_end=${formatedEnd}&perPage=100`, {});
            if (res.data?.data) setConsultations(res.data.data);
            console.log("Consultations fetched:", res.data);
        } catch (err) {
            console.error(err);
            toast.error("Impossible de charger les consultations du médecin");
            return [];
        } finally {
            setLoadingConsultations(false);
        }
    };

    const availabilityForCalendar = useMemo(() => {
        // WeekCalendar accepts availability either old or new format. We pass horaires directly.
        return horaires.map((s) => ({ id: s.id, weekday: s.weekday, slots: s.slots }));
    }, [horaires]);

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
        if (!horaires || !horaires.length) return [];
        const slots = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(weekStart);
            day.setDate(day.getDate() + i);
            const weekday = i; // Monday=0
            // find horaires matching weekday
            horaires
                .filter((s) => Number(s.weekday) === weekday)
                .forEach((s) => {
                    (s.slots || []).forEach((sl) => {
                        slots.push({ date: formatDateYMD(day), start: sl.start });
                    });
                });
        }
        // sort by date/time
        slots.sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
        return slots;
    }, [horaires, weekStart]);

    function prevWeek() {
        const d = new Date(weekStart);
        d.setDate(d.getDate() - 7);
        setWeekStart(getMonday(d));

        // fetch consultations for new week
        if (selectedDoctor) {
            const startDate = formatDateYMD(getMonday(d));
            const endDate = formatDateYMD(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 6));
            fetchConsultationsByDoctorBetweenDates(selectedDoctor.id, startDate, endDate);
        }
    }
    function nextWeek() {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + 7);
        setWeekStart(getMonday(d));

        // fetch consultations for new week
        if (selectedDoctor) {
            const startDate = formatDateYMD(getMonday(d));
            const endDate = formatDateYMD(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 6));
            fetchConsultationsByDoctorBetweenDates(selectedDoctor.id, startDate, endDate);
        }
    }


    return (
        <div className="min-h-[80dvh] p-6 md:p-10">
            <div className="max-w-6xl mx-auto space-y-6">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Créer une consultation</h1>
                        <p className="text-sm text-slate-500">Sélectionnez le médecin, choisissez un créneau et validez.</p>
                    </div>
                </header>

                <div className="grid grid-cols-2 lg:grid-cols-6 ">
                    {/* Left: search + doctors */}
                    <div className="lg:col-span-2 bg-white rounded-2xl p-4 shadow-sm">
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
                                        <div className="text-sm text-slate-600">{"~" +d.duree_consultation + "min par RDV" } </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Middle: calendar */}
                    <div className="lg:col-span-4 bg-white rounded-2xl p-4 shadow-sm">
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
                            consultations={consultations}
                            availability={availabilityForCalendar}
                            loading={loadingHoraires || loadingConsultations}
                            onChange={() => { toast("Vous ne pouvez pas décaler ce RDV.", {icon: "☹️"}); }}
                            consultationProvisoire={consultationProvisoire}
                            setConsultationProvisoire={setConsultationProvisoire}
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

                <FloatingConsultationForm selectedDoctor={selectedDoctor} selectedSlot={selectedSlot} consultationProvisoire={consultationProvisoire} setConsultationProvisoire={setConsultationProvisoire} />
            </div>
        </div>
    );
}