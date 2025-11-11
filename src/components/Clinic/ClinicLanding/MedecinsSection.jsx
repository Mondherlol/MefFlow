import React from "react";

export default function MedecinsSection({ clinic }) {
  const medecins = clinic?.medecins || clinic?.doctors || clinic?.docteurs || [];

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-4">Nos médecins</h2>
        {medecins && medecins.length ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {medecins.map((m, i) => (
              <div key={i} className="p-4 bg-white/80 dark:bg-slate-800/60 rounded shadow-sm flex items-start gap-3">
                <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 overflow-hidden">
                  {m.photo ? <img src={m.photo} alt={m.name || "Médecin"} className="w-full h-full object-cover" /> : null}
                </div>
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">{m.name || m.fullName || `Médecin ${i + 1}`}</div>
                  <div className="text-slate-600 dark:text-slate-300 text-sm">{m.speciality || m.speciality || "Médecin"}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-600">La liste des médecins sera bientôt disponible.</p>
        )}
      </div>
    </section>
  );
}
