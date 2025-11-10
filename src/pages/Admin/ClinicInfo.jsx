import React from "react";
import { useNavigate } from "react-router-dom";
import AdminTemplate from "../../components/Admin/AdminTemplate";
import { useClinic } from "../../context/clinicContext";
import {
  Building2, Palette, Home, Clock, Image as ImageIcon, ArrowRight, ShieldAlert,
  Edit,
  Pencil,
  Settings,
  Hospital,
  Settings2
} from "lucide-react";
import ActionTile from "../../components/Admin/ManageClinic/ActionTile";
import ThemeCard from "../../components/Admin/ManageClinic/ThemeCard";
import DangerZone from "../../components/Admin/ManageClinic/DangerZone";
import Section from "../../components/Admin/ManageClinic/Section";

export default function ManageClinic() {
  const navigate = useNavigate();
  const { clinic } = useClinic();

  const primary = clinic?.theme?.primary || "indigo";
  const secondary = clinic?.theme?.secondary || "sky";

  return (
    <AdminTemplate
      title="Gérer la clinique"
      breadcrumb={[
        { label: "Administration", to: "/admin" },
        { label: "Clinique", to: "/admin/clinique" },
        { label: "Gérer", current: true }, // nouveau breadcrumb incrémenté
      ]}
    >
      <p className="text-sm text-slate-600 mb-6">
        Paramétrez votre clinique : informations, thème, page d’accueil, horaires, médias…
      </p>

      {/* Bloc actions rapides */}
      <Section title="Actions rapides">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ActionTile
            tone="orange"
            icon={Settings2}
            title="Modifier les infos"
            desc="Coordonnées, adresse, emails, nom..."
            onClick={() => navigate("/admin/clinique/edit")} // EditClinic
          />
          <ActionTile
            tone="sky"
            icon={Clock}
            title="Horaires"
            desc="Définir les horaires d’ouverture & urgences"
            onClick={() => navigate("/admin/clinique/horaires")}
          />
          <ActionTile
            tone="emerald"
            icon={Home}
            title="Page d’accueil"
            desc="Personnaliser la landing page publique"
            onClick={() => navigate("/admin/clinique/custom-home")} // CustomHomePage
          />
          <ActionTile
            tone="violet"
            icon={ImageIcon}
            title="Médias"
            desc="Logos, favicon, bannières, galerie"
            onClick={() => navigate("/admin/clinique/media")}
          />
        </div>
      </Section>

      {/* Bloc thème */}
      <Section title="Thème de la clinique" className="mt-8">
        <ThemeCard
          primary={primary}
          secondary={secondary}
          onCustomize={() => navigate("/admin/clinique/theme")}
        />
      </Section>

      {/* Danger Zone */}
      <Section title="Zone sensible" className="mt-8">
        <DangerZone
          clinicName={clinic?.name || "Votre Clinique"}
          onDelete={() => {
            // Tu peux brancher vers ta page/flow de suppression si tu ne veux pas faire l'API ici.
            navigate("/admin/clinique/delete");
          }}
        />
        <div className="mt-3 text-xs text-slate-500 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          Cette action est définitive. Pensez à exporter vos données avant suppression.
        </div>
      </Section>
    </AdminTemplate>
  );
}
