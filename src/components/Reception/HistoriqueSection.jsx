import { CheckCircle, ClockIcon, XCircle } from "lucide-react";

const getStatusText = (status) => {
    if (!status) return "—";
    switch (status.toLowerCase()) {
        case "confirme":
            return "Confirmé";
        case "terminer":
            return "Terminé";
        case "en_cours":
            return "En cours";
        case "annuler":
            return "Annulé";
        default:
            return status.replace("_", " ");
    }
}

function HistoriqueSection({ pastToday, onCancel, onPostpone }) {
  const handleCancel = (c) => {
    if (onCancel) return onCancel(c.id, c);
    const ok = window.confirm("Annuler le rendez-vous ?");
    if (!ok) return;
    console.log("Annulé :", c.id || c);
  }

  const handlePostpone = (c) => {
    if (onPostpone) return onPostpone(c.id, c);
    const minutesStr = window.prompt("Reporter de combien de minutes ?", "15");
    if (!minutesStr) return;
    const minutes = parseInt(minutesStr, 10);
    if (isNaN(minutes) || minutes <= 0) return alert("Valeur invalide");
    console.log(`Reporté ${c.id} de ${minutes} minutes`);
  }

  return(
      <section className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg transition-colors duration-150 border border-slate-50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Historique de la journée</h2>
            <div className="text-xs text-slate-500">{pastToday.length} élément{pastToday.length > 1 ? "s" : ""}</div>
          </div>

          {pastToday.length ? (
            <div className="space-y-2">
              {pastToday.map((c) => {
                const time = c.heure_debut || "--:--";
                const patientName = c.patient?.user?.full_name || c.patient?.full_name || "—";
                const pseudo = c.patient?.user?.username || c.patient?.username || patientName;
                const doctorName = c.doctor?.user?.full_name || c.doctor?.full_name || c.medecin_name || "—";
                const avatar = c.patient?.user?.avatar || c.patient?.avatar || c.patient?.photo || c.patient?.photo_url || null;
                const status = (c.statusConsultation || "").toLowerCase();
                let badgeColor = "bg-slate-100 text-slate-700";
                let StatusIcon = ClockIcon;
                if (status === "terminer") {
                  badgeColor = "bg-emerald-50 text-emerald-700";
                  StatusIcon = CheckCircle;
                } else if (status === "en_cours") {
                  badgeColor = "bg-sky-50 text-sky-700";
                  StatusIcon = CheckCircle;
                } else if (status === "annuler") {
                  badgeColor = "bg-rose-50 text-rose-700";
                  StatusIcon = XCircle;
                }

                const initials = patientName.split(" ").map(s => s[0]).slice(0,2).join("").toUpperCase();

                return (
                  <div key={`${c.id || c._tempId || Math.random()}`} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:shadow-sm bg-white">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex-shrink-0">
                        {avatar ? (
                          <img src={avatar} alt={patientName} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium text-slate-700">
                            {initials || "—"}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">{pseudo}</div>
                        <div className="text-xs text-slate-500 truncate">{doctorName}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-sm text-slate-700 text-right w-20">
                        <div>{time}</div>
                        <div className="text-xs text-slate-400">{new Date(`${c.date}T${time}`).toLocaleDateString()}</div>
                      </div>

                      <div className={`inline-flex items-center gap-2 px-2 py-1 text-xs font-medium rounded-md ${badgeColor}`}>
                        <StatusIcon className="w-4 h-4" />
                        <span className="truncate">{getStatusText(status)}</span>
                      </div>

                      {/* Contextual action buttons for confirmed appointments */}
                      {status === "confirme" && (
                        <div className="flex items-center gap-2">
                          <button onClick={() => handlePostpone(c)} className="inline-flex items-center gap-2 px-2 py-1 text-xs font-medium rounded-md bg-yellow-50 text-yellow-700 hover:bg-yellow-100">
                            <ClockIcon className="w-3 h-3" />
                            Reporter
                          </button>
                          <button onClick={() => handleCancel(c)} className="inline-flex items-center gap-2 px-2 py-1 text-xs font-medium rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100">
                            <XCircle className="w-3 h-3" />
                            Annuler
                          </button>
                        </div>
                      )}

                      <div className="text-xs text-slate-400">ID {String(c.id || "—").slice(0,8)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-slate-500">Aucun rendez-vous passé pour aujourd'hui.</div>
          )}
        </section>
    )
}

export default HistoriqueSection;