import { useNavigate } from "react-router-dom";
import { timeToMin, nowMinutes } from "../../../utils/timeUtils";
import toast from "react-hot-toast";
import { getImageUrl } from "../../../utils/image";

function ConsultationsPanel({ 
  consultations = [], 
  selectedTime, 
  showNow, 
  setSelectedTime, 
  setShowNow,
  loading = false 
}) {
  const navigate = useNavigate();

  // Filter consultations for selected time
  const consultationsAtTime = selectedTime 
    ? consultations.filter((c) => c.heure_debut === selectedTime)
    : [];

  // Filter for "now" view (within 30 minutes)
  const nowConsultations = showNow 
    ? consultations.filter(
        (c) => c.statusConsultation !== "annule" && 
        Math.abs(timeToMin(c.heure_debut) - nowMinutes()) <= 30
      )
    : consultations;

  const handlePostpone = async (id) => {
    const minutesStr = window.prompt("Reporter de combien de minutes ?", "15");
    if (!minutesStr) return;
    const minutes = parseInt(minutesStr, 10);
    if (isNaN(minutes) || minutes <= 0) return toast.error("Valeur invalide");
    
    // TODO: API call to postpone consultation
    toast.success(`RDV reporté de ${minutes} minutes`);
  };

  const getInitials = (fullName) => {
    if (!fullName) return "??";
    return fullName.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
  };

  const getDuration = (consultation) => {
    return Math.round(
      (timeToMin(consultation.heure_fin) - timeToMin(consultation.heure_debut))
    );
  };

  // Skeleton loader
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-4 border border-slate-50 shadow-sm h-[44vh] overflow-auto">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="h-4 w-48 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-3 w-64 bg-slate-100 rounded animate-pulse mt-2"></div>
          </div>
          <div className="h-3 w-16 bg-slate-100 rounded animate-pulse"></div>
        </div>

        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3 rounded-lg border border-slate-100 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                <div className="flex-1">
                  <div className="h-4 w-32 bg-slate-200 rounded mb-2"></div>
                  <div className="h-3 w-48 bg-slate-100 rounded"></div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-7 w-20 bg-slate-100 rounded-md"></div>
                <div className="h-7 w-32 bg-slate-100 rounded-md"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl p-4 border border-slate-50 shadow-sm h-[44vh] overflow-auto">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-semibold">
              {showNow ? "Maintenant" : selectedTime ? `Créneau ${selectedTime}` : "Rendez-vous — Aujourd'hui"}
            </div>
            <div className="text-xs text-slate-400">
              {showNow ? "Filtré sur l'intervalle actuel" : selectedTime ? "Détails du créneau sélectionné" : "Liste complète de la journée"}
            </div>
          </div>
          <div className="text-xs text-slate-400">{consultations.length} RDV</div>
        </div>

        {/* If a time is selected show its consultations; otherwise show day's sorted list */}
        {selectedTime ? (
          consultationsAtTime.length ? (
            consultationsAtTime.map((consultation) => {
              const duration = getDuration(consultation);
              const patientName = consultation.patient?.full_name || "Patient";
              
              return (
                <div key={consultation.id} className="mb-3 p-3 rounded-lg border border-slate-100 hover:shadow-md transition flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    {
                        consultation.patient?.photo_url ? (
                          <img 
                            src={getImageUrl(consultation.patient.photo_url)} alt={patientName} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-semibold">
                            {getInitials(patientName)}
                          </div>
                        )
                    }
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 truncate">{patientName}</div>
                      <div className="text-xs text-slate-400">
                        {consultation.heure_debut} • {duration} min • {consultation.statusConsultation}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {
                      consultation.statusConsultation === "confirme" && (
                    
                    <button 
                      onClick={() => handlePostpone(consultation.id)} 
                      className="text-xs px-3 py-1 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 transition"
                    >
                      Reporter
                    </button>
                      )}
                    <button 
                      onClick={() => navigate('/consultation', { 
                        state: { 
                          patientName: patientName, 
                          patientId: consultation.patient?.id 
                        } 
                      })} 
                      className="text-xs  cursor-pointer px-3 py-1 rounded-md bg-white border text-slate-700 hover:bg-sky-500 hover:text-white transition"
                    >
                      Voir consultation
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-sm text-slate-500">Aucun RDV sur ce créneau.</div>
          )
        ) : (
          // day list (or filtered 'now' list)
          (showNow ? nowConsultations : consultations.slice())
            .sort((a, b) => timeToMin(a.heure_debut) - timeToMin(b.heure_debut))
            .map((consultation) => {
              const duration = getDuration(consultation);
              const patientName = consultation.patient?.full_name || "Patient";
              
              return (
                <div key={consultation.id} className="mb-3 p-3 rounded-lg border border-slate-100 hover:shadow-md transition flex items-center justify-between cursor-default">
                  <div className="flex items-center gap-3 min-w-0">
                    {
                      consultation.patient?.photo_url ? (
                        <img 
                          src={getImageUrl(consultation.patient.photo_url)} alt={patientName} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-semibold">
                          {getInitials(patientName)}
                        </div>
                      )
                    }
                    <div className="min-w-0">
                      <div className="text-sm text-slate-600">{consultation.heure_debut}</div>
                      <div className="font-semibold text-slate-900 truncate">{patientName}</div>
                      <div className="text-xs text-slate-400">
                        {duration} min • {consultation.statusConsultation}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {                      consultation.statusConsultation === "confirme" && (
                    <button 
                      onClick={() => handlePostpone(consultation.id)} 
                      className="text-xs px-3 py-1 cursor-pointer rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 transition "
                    >
                      Reporter
                    </button>
                      )}
                    <button 
                      onClick={() => navigate('/doctor/consultation/'+consultation.id)}
                      className="text-xs px-3 py-1 rounded-md bg-white border text-slate-700 hover:bg-sky-500 hover:text-white transition cursor-pointer"
                    >
                      Voir consultation
                    </button>
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* quick controls footer small */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-slate-500">Liste de vos consultations d'aujourd'hui.</div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setSelectedTime(null); setShowNow(false); }} 
            className="px-3 py-1 rounded-md bg-white border text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            Voir Tous
          </button>
          <button 
            onClick={() => { setShowNow(true); setSelectedTime(null); }} 
            className={`px-3 py-1 rounded-md ${showNow ? 'bg-sky-700 text-white' : 'bg-sky-600 text-white'} hover:brightness-95 transition cursor-pointer`}
          >
            Maintenant
          </button>
        </div>
      </div>
    </>
  );
}

export default ConsultationsPanel;
