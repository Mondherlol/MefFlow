import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminTemplate from "../../../components/Admin/AdminTemplate";
import Section from "../../../components/Admin/ManageClinic/Section";
import { useClinic } from "../../../context/clinicContext";
import MiniDropdown from "../../../components/Admin/ManageClinic/CustomHome/MiniDropdown";
import SectionsList from "../../../components/Admin/ManageClinic/CustomHome/SectionsList";
import HeroPreview from "../../../components/Admin/ManageClinic/CustomHome/HeroPreview";
import AboutPreview from "../../../components/Admin/ManageClinic/CustomHome/AboutPreview";
import FAQEditor from "../../../components/Admin/ManageClinic/CustomHome/FAQEditor";
import { LayoutGrid, Sparkles, Wand2 } from "lucide-react";

export default function CustomHome() {
  const navigate = useNavigate();
  const { clinic, theme } = useClinic() || {};
  const colors = useMemo(() => ({
    primary: theme?.primary || "#3b82f6",
    secondary: theme?.secondary || "#1e40af",
    accent: theme?.accent || "#f59e0b",
  }), [theme]);

  // --- State global landing ---
  const [heroImage, setHeroImage] = useState(clinic?.landing?.hero_image || clinic?.heroImage || null);
  const [heroTitle, setHeroTitle] = useState(clinic?.landing?.slogan || clinic?.slogan || "");
  const [heroSubtitle, setHeroSubtitle] = useState(clinic?.landing?.description || clinic?.description || "");

  const [aboutText, setAboutText] = useState(clinic?.landing?.about_text || clinic?.longDescription || "");
  const [aboutImage, setAboutImage] = useState(clinic?.landing?.about_image || clinic?.aboutImage || null);

  const baseSections = [
    { id: "hero",      label: "Hero",               visible: true, locked: true },
    { id: "invite",    label: "Carte connexion",    visible: true },
    { id: "about",     label: "À propos",           visible: true },
    { id: "services",  label: "Nos services",       visible: true },
    { id: "contact",   label: "Nous contacter",     visible: true },
    { id: "tarifs",    label: "Nos tarifs",         visible: true },
    { id: "medecins",  label: "Nos médecins",       visible: true },
    { id: "faq",       label: "FAQ",                visible: true },
    { id: "gallery",   label: "Galerie d’images",   visible: true },
  ];
  const [sections, setSections] = useState(
    Array.isArray(clinic?.landing?.sections) && clinic.landing.sections.length ? clinic.landing.sections : baseSections
  );

  // FAQ
  const [faq, setFaq] = useState(clinic?.landing?.faq || [
    { q: "Comment prendre rendez-vous ?", a: "Depuis votre espace patient ou par téléphone." },
  ]);

  // hero toujours premier
  useEffect(() => {
    setSections((s) => {
      const hero = s.find((x) => x.id === "hero") || baseSections[0];
      const rest = s.filter((x) => x.id !== "hero");
      return [{ ...hero, visible: true, locked: true }, ...rest];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);




  return (
    <AdminTemplate
      title="Gérer la clinique / Page d’accueil"
      breadcrumbs={[
        { label: "Tableau de bord", to: "/admin" },
        { label: "Gérer la clinique", to: "/admin/clinique" },
        { label: "Page d’accueil", current: true },
      ]}
    >
      <p className="text-sm text-slate-600 mb-4">Aperçus live + gestion des sections, compact & modulable.</p>

      {/* Aperçu HERO + édition */}
      <Section title="Hero (aperçu + édition)" collapsible defaultOpen>
        <HeroPreview
          colors={colors}
        />
      </Section>

      {/* Aperçu ABOUT + édition */}
      <Section title="À propos (aperçu + édition)" collapsible className="mt-4">
        <AboutPreview
          colors={colors}
          image={aboutImage}
          setImage={setAboutImage}
          text={aboutText}
          setText={setAboutText}
          onSave={() => {
            console.log("SAVE ABOUT:", { aboutImage, aboutText });
            alert("À propos enregistré (démo).");
          }}
        />
      </Section>

      {/* Apparence & ordre (compact) */}
      <Section title="Apparence & ordre des sections" collapsible className="mt-4">
        <SectionsList
          compact
          colors={colors}
        />
      </Section>

      {/* FAQ */}
      <Section title="FAQ" collapsible className="mt-4">
        <FAQEditor
          items={faq}
          setItems={setFaq}
          onSave={() => {
            console.log("SAVE FAQ:", faq);
            alert("FAQ enregistrée (démo).");
          }}
          colors={colors}
        />
      </Section>


    </AdminTemplate>
  );
}
