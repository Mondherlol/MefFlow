// src/pages/reception/Doctors.jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ReceptionistTemplate from "../../components/Reception/ReceptionTemplate";
import {
  Calendar,
  Phone,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import { useClinic } from "../../context/clinicContext";
import { getImageUrl } from "../../utils/image.jsx";

/* ----------------- Skeleton ----------------- */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-slate-200" />
        <div className="flex-1">
          <div className="h-4 bg-slate-200 rounded w-1/2 mb-2" />
          <div className="h-3 bg-slate-200 rounded w-1/3" />
        </div>
        <div className="w-24 h-8 bg-slate-200 rounded" />
      </div>
    </div>
  );
}

/* ----------------- Utilitaires ----------------- */
const statusMap = {
  available: { label: "Disponible", color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  busy: { label: "En consultation", color: "bg-amber-100 text-amber-800", dot: "bg-amber-600" },
  leave: { label: "En congé", color: "bg-slate-100 text-slate-600", dot: "bg-slate-500" },
  unknown: { label: "Indisponible", color: "bg-red-100 text-red-700", dot: "bg-red-600" },
};

function getDoctorStatus(d) {
  if (d.on_leave || d.status === "leave") return "leave";
  if (d.currently_in_consultation || d.status === "busy" || d.status === "consulting") return "busy";
  if (d.is_available || d.status === "available") return "available";
  return "unknown";
}


export default function Doctors() {
  const navigate = useNavigate();
  const { clinic, theme } = useClinic();

  const primaryColor = theme?.primary || "#06b6d4";

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  // recherche & filtres
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [specialityFilter, setSpecialityFilter] = useState("");
  const [sortBy, setSortBy] = useState("name"); // name | status

  // RDV rapide removed — simpler state

  useEffect(() => {
    if (!clinic?.id) return;
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinic?.id]);

  async function fetchDoctors() {
    try {
      setLoading(true);
      const res = await api.get(`/api/clinics/${clinic.id}/doctors/`);
      const data = res?.data?.data || [];
      setDoctors(data);
    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger les médecins");
    } finally {
      setLoading(false);
    }
  }

  // debounce recherche
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [q]);

  // specialties
  const specialties = useMemo(() => {
    const s = new Set();
    (doctors || []).forEach((d) => {
      if (d.specialite) s.add(d.specialite);
    });
    return Array.from(s).sort();
  }, [doctors]);

  // filter + sort
  const doctorsFiltered = useMemo(() => {
    let arr = doctors || [];
    if (debouncedQ) {
      arr = arr.filter((d) => {
        const name = (d.user?.full_name || "").toLowerCase();
        const spec = (d.specialite || "").toLowerCase();
        const phone = (d.phone || "").toLowerCase();
        return name.includes(debouncedQ) || spec.includes(debouncedQ) || phone.includes(debouncedQ);
      });
    }
    if (specialityFilter) arr = arr.filter((d) => d.specialite === specialityFilter);
    if (sortBy === "status") {
      arr = [...arr].sort((a, b) => {
        const pa = getDoctorStatus(a);
        const pb = getDoctorStatus(b);
        return pa === pb ? (a.user?.full_name || "").localeCompare(b.user?.full_name || "") : pa.localeCompare(pb);
      });
    } else {
      arr = [...arr].sort((a, b) => (a.user?.full_name || "").localeCompare(b.user?.full_name || ""));
    }
    return arr;
  }, [doctors, debouncedQ, specialityFilter, sortBy]);

  

  return (
    <ReceptionistTemplate
      title="Médecins"
      breadcrumbs={[
        { label: "Accueil réception", to: "/reception" },
        { label: "Médecins", current: true },
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-800">Médecins</h2>
            <p className="text-sm text-slate-500 mt-1">
              Accédez rapidement aux plannings et prenez des rendez-vous.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                aria-label="Rechercher médecin"
                placeholder="Rechercher par nom, spécialité, téléphone..."
                className="pl-10 pr-3 py-2 rounded-lg border w-[320px] focus:ring-2 focus:ring-sky-100"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <select
              value={specialityFilter}
              onChange={(e) => setSpecialityFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border bg-white text-sm"
            >
              <option value="">Toutes spécialités</option>
              {specialties.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-lg border bg-white text-sm"
              title="Trier"
            >
              <option value="name">Trier : Nom</option>
              <option value="status">Trier : Statut</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}

          {!loading && doctorsFiltered.length === 0 && (
            <div className="col-span-full bg-white rounded-2xl p-8 text-center border border-dashed border-slate-200">
              <div className="mx-auto mb-4 text-slate-400">
                <Calendar size={36} />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Aucun médecin trouvé</h3>
              <p className="text-sm text-slate-500 mt-2">Ajustez vos filtres ou contactez l'administrateur.</p>
            </div>
          )}

          {!loading && doctorsFiltered.map((d) => {
            const name = d.user?.full_name || "Médecin";
            const initials = name.split(" ").map(s => s[0] || "").slice(0,2).join("") || "MD";
            const statusKey = getDoctorStatus(d);
            const st = statusMap[statusKey] || statusMap.unknown;

            return (
              <article
                key={d.id}
                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg transition transform hover:-translate-y-1 focus-within:translate-y-0"
              >
                <div className="flex items-start gap-4">
                  {/* avatar + ring */}
                  <div className="relative">
                    <div
                      className="w-16 h-16 rounded-full grid place-items-center text-white font-semibold text-lg"
                      style={{
                        backgroundColor: primaryColor,
                        boxShadow: "0 6px 18px rgba(2,6,23,0.06)",
                      }}
                    >
                      {d.user?.photo_url ? (
                        <img
                          src={getImageUrl(d.user.photo_url)}
                          alt={name}
                          className="w-16 h-16 rounded-full object-cover"
                          style={{ border: "3px solid rgba(255,255,255,0.6)" }}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full grid place-items-center">{initials}</div>
                        
                      )}
                    </div>

          
                  </div>

                  {/* main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate">{name}</div>
                        <div className="text-sm text-slate-500 truncate">{d.specialite || "Général"}</div>
                      </div>

                      <div className="text-right">
                          <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full text-xs font-medium text-slate-700">
                            <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                            <span>{st.label}</span>
                          </div>
                    <div className="text-xs text-slate-500">{d.numero_salle ? `Salle ${d.numero_salle}` : "Salle : —"}</div>

                      </div>
                    </div>

                    <div className="mt-3 flex items-end justify-end gap-3">

                      {/* actions: single primary planning button and phone action */}
                      <div className="flex flex-row items-end gap-3">
                        <div>
                          <button
                            onClick={() => navigate(`/reception/appointments?doctorId=${d.id}`)}
                            className="inline-flex cursor-pointer items-center gap-2 px-6 py-2 rounded-lg text-white font-medium shadow"
                            title="Voir l'emploi du temps"
                            style={{ backgroundColor: primaryColor, minWidth: 150 }}
                          >
                            <Calendar size={16} /> Voir planning
                          </button>
                        </div>

                        <div>
                          <button
                            onClick={(e) => { if (!d.phone) e.preventDefault(); }}
                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${d.phone ? "border bg-white text-slate-700" : "bg-slate-50 text-slate-400 cursor-not-allowed"}`}
                            title={d.phone ? `Appeler ${d.phone}` : "Numéro non disponible"}
                          >
                            <Phone size={14} /> 
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* RDV rapide removed */}
    </ReceptionistTemplate>
  );
}
