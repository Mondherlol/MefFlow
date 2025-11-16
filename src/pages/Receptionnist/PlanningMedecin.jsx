import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReceptionistTemplate from "../../components/Reception/ReceptionTemplate";
import WeekCalendar from "../../components/Calendar/WeekCalendar";
import api from "../../api/axios";
import { useClinic } from "../../context/clinicContext";
import toast from "react-hot-toast";
import { getImageUrl } from "../../utils/image.jsx";
import { formatDateYMD, getMonday } from "../../utils/dateUtils";
import { Calendar, Phone } from "lucide-react";

const statusMap = {
  available: { label: "Disponible", color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  busy: { label: "En consultation", color: "bg-amber-100 text-amber-800", dot: "bg-amber-600" },
  leave: { label: "En congé", color: "bg-slate-100 text-slate-600", dot: "bg-slate-500" },
  unknown: { label: "Indisponible", color: "bg-red-100 text-red-700", dot: "bg-red-600" },
};

function getDoctorStatus(d) {
  if (!d) return "unknown";
  if (d.on_leave || d.status === "leave") return "leave";
  if (d.currently_in_consultation || d.status === "busy" || d.status === "consulting") return "busy";
  if (d.is_available || d.status === "available") return "available";
  return "unknown";
}

export default function PlanningMedecin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clinic, theme } = useClinic() || {};

  const primaryColor = theme?.primary || "#06b6d4";

  const [doctor, setDoctor] = useState(null);
  const [loadingDoctor, setLoadingDoctor] = useState(false);

  const [schedules, setSchedules] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [loadingConsultations, setLoadingConsultations] = useState(false);

  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));

  useEffect(() => {
    if (!id) return;
    fetchDoctor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    // when doctor or weekStart changes, reload schedules & consultations
    if (!doctor) return;
    fetchSchedules(doctor.id);
    const start = formatDateYMD(weekStart);
    const end = formatDateYMD(new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6));
    fetchConsultationsByDoctorBetweenDates(doctor.id, start, end);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctor, weekStart]);

  async function fetchDoctor() {
    try {
      setLoadingDoctor(true);
      const res = await api.get(`/api/doctors/${id}/`);
      const data = res.data?.data || res.data || null;
      setDoctor(data);
    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger les informations du médecin");
    } finally {
      setLoadingDoctor(false);
    }
  }

  async function fetchSchedules(doctorId) {
    try {
      setLoadingSchedules(true);
      const res = await api.get(`/api/doctors/${doctorId}/schedules/`);
      setSchedules(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger les horaires du médecin");
    } finally {
      setLoadingSchedules(false);
    }
  }

  const fetchConsultationsByDoctorBetweenDates = async (doctorId, startDate, endDate) => {
    setLoadingConsultations(true);
    try {
      const formatedStart = formatDateYMD(new Date(startDate));
      const formatedEnd = formatDateYMD(new Date(endDate));
      const res = await api.get(`/api/consultations/by-doctor/?doctor=${doctorId}&week_start=${formatedStart}&week_end=${formatedEnd}&perPage=200`);
      setConsultations(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger les consultations du médecin");
    } finally {
      setLoadingConsultations(false);
    }
  };

  const availabilityForCalendar = useMemo(() => {
    return (schedules || []).map((s) => ({ id: s.id, weekday: s.weekday, slots: s.slots }));
  }, [schedules]);

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

  const statusKey = getDoctorStatus(doctor);
  const st = statusMap[statusKey] || statusMap.unknown;

  return (
    <ReceptionistTemplate
      title={doctor ? `Emploi — ${doctor.user?.full_name || "Médecin"}` : "Emploi du médecin"}
      breadcrumbs={[
        { label: "Accueil réception", to: "/reception" },
        { label: "Emploi du médecin", current: true },
      ]}
    >
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full grid place-items-center text-white font-semibold text-xl" style={{ backgroundColor: primaryColor }}>
              {doctor?.user?.photo_url ? (
                <img src={getImageUrl(doctor.user.photo_url)} alt={doctor?.user?.full_name} className="w-20 h-20 rounded-full object-cover" style={{ border: "3px solid rgba(255,255,255,0.6)" }} />
              ) : (
                <div className="w-20 h-20 rounded-full grid place-items-center">{(doctor?.user?.full_name || "MD").split(" ").map(s => s[0] || "").slice(0,2).join("")}</div>
              )}
            </div>
            <div>
              <div className="text-lg font-semibold text-slate-900">{doctor?.user?.full_name || "—"}</div>
              <div className="text-sm text-slate-500">{doctor?.specialite || "Général"}</div>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium text-slate-700">
              <span className={`w-2 h-2 rounded-full ${st.dot}`} />
              <span>{st.label}</span>
            </div>

            <div className="text-sm text-slate-500">{doctor?.numero_salle ? `Salle ${doctor.numero_salle}` : "Salle : —"}</div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/reception/new-consultation?doctor=${doctor?.id}`)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium shadow"
                style={{ backgroundColor: primaryColor }}
              >
                <Calendar size={16} /> Créer RDV
              </button>

              <a
                href={doctor?.phone ? `tel:${doctor.phone}` : undefined}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${doctor?.phone ? "border bg-white text-slate-700" : "bg-slate-50 text-slate-400 cursor-not-allowed"}`}
                title={doctor?.phone ? `Appeler ${doctor.phone}` : "Numéro non disponible"}
              >
                <Phone size={14} />
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
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
            loading={loadingSchedules || loadingConsultations}
            onChange={() => { toast("Vous ne pouvez pas décaler ce RDV.", { icon: "☹️" }); }}
          />
        </div>
      </div>
    </ReceptionistTemplate>
  );
}