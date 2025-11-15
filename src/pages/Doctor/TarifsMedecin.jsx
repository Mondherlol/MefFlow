import React from "react";
import MedecinTemplate from "../../components/Doctor/MedecinTemplate";
import ConsultationPrices from "../../components/Doctor/ConsultationPrices";

export default function TarifsMedecin() {
  return (
    <MedecinTemplate title="Tarifs" breadcrumbs={[{ label: "Accueil médecin", to: "/doctor" }, { label: "Tarifs", current: true }] }>
      <div className="min-h-[80dvh] bg-gradient-to-b from-slate-50 to-slate-100/40 p-6 md:p-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <ConsultationPrices />
        </div>
      </div>
    </MedecinTemplate>
  );
}
