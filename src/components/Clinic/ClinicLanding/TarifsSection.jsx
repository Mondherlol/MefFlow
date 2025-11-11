import React from "react";

export default function TarifsSection({ clinic }) {
  const tarifs = clinic?.tarifs || clinic?.prices || [];

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-4">Nos tarifs</h2>
        {tarifs && tarifs.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {tarifs.map((t, i) => (
              <div key={i} className="p-4 bg-white/80 dark:bg-slate-800/60 rounded shadow-sm">
                <div className="font-medium text-slate-900 dark:text-white">{t.name || t.title || `Prestation ${i + 1}`}</div>
                <div className="text-slate-600 dark:text-slate-300">{t.price || t.description || ""}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-600">Les informations sur les tarifs seront bientôt disponibles.</p>
        )}
      </div>
    </section>
  );
}
