import { useState, useEffect } from "react";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Stethoscope, 
  Users, 
  Star, 
  ArrowRight,
  Image as ImageIcon,
  User,
  LogIn,
  ShieldCheck,
  HeartPulse,
  Activity,
  CalendarCheck,
} from "lucide-react";

import { mockClinic, mockClinicBlue } from "./mockClinicData";

/** -------------------------------------------------------------
 *  Utilities (thème dynamiques + classes)
 *  ------------------------------------------------------------- */
const cx = (...cls) => cls.filter(Boolean).join(" ");

const withAlpha = (hex, alpha = 1) => {
  // Support #rrggbb
  if (!hex || hex[0] !== "#" || (hex.length !== 7 && hex.length !== 4)) return `rgba(0,0,0,${alpha})`;
  const h = hex.length === 4
    ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
    : hex;
  const r = parseInt(h.slice(1,3),16);
  const g = parseInt(h.slice(3,5),16);
  const b = parseInt(h.slice(5,7),16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Use extracted smaller components for clarity + reuse
import ClinicImage from "../../components/Clinic/ClinicLanding/ClinicImage";
import InfoPill from "../../components/Clinic/ClinicLanding/InfoPill";
import Card from "../../components/Clinic/ClinicLanding/Card";
import CTAButton from "../../components/Clinic/ClinicLanding/CTAButton";
import ServicesSection from "../../components/Clinic/ClinicLanding/ServicesSection";
import AboutSection from "../../components/Clinic/ClinicLanding/AboutSection";
import ContactSection from "../../components/Clinic/ClinicLanding/ContactSection";
import LoginCard from "../../components/Clinic/ClinicLanding/LoginCard";
import { useClinic } from "../../context/clinicContext";

/** -------------------------------------------------------------
 *  Composant principal
 *  ------------------------------------------------------------- */
export default function Home() {
//   const { clinic } = useClinic();
  const [isLoading, setIsLoading] = useState(true);
  const clinic = mockClinicBlue; // ⚠️ remplacé par vos données dynamiques plus tard

  const theme = {
    primary: clinic?.primaryColor || "#3b82f6",
    secondary: clinic?.secondaryColor || "#1e40af",
    accent: clinic?.accentColor || "#f59e0b",
    bg: clinic?.backgroundColor || "#ffffff",
    text: clinic?.textColor || "#0f172a",
  };

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 450);
    return () => clearTimeout(t);
  }, []);

  if (!clinic || isLoading) {
    return (
      <div className="min-h-screen grid place-items-center" style={{ background: `linear-gradient(180deg, ${withAlpha(theme.primary, .08)} 0%, transparent 60%)` }}>
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement de la clinique…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: theme.bg, color: theme.text }}>
      {/* Décor de fond subtil */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-25"
             style={{ background: `radial-gradient(ellipse at center, ${withAlpha(theme.primary,.25)}, transparent 60%)` }} />
        <div className="absolute -bottom-24 -left-24 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-20"
             style={{ background: `radial-gradient(ellipse at center, ${withAlpha(theme.accent,.22)}, transparent 60%)` }} />
      </div>

      {/* ===================== HERO ===================== */}
      <section className="relative pt-20 pb-24 md:pb-28">
        <div className="absolute inset-0 overflow-hidden rounded-b-[3rem]">
          {clinic.heroImage ? (
            <ClinicImage src={clinic.heroImage} alt="Image principale de la clinique" className="w-full h-full" rounded="rounded-b-[3rem]" />
          ) : (
            <div className="w-full h-full rounded-b-[3rem]"
                 style={{ background: `linear-gradient(135deg, ${withAlpha(theme.primary,.9)} 0%, ${withAlpha(theme.secondary,.9)} 100%)` }} />
          )}
          <div className="absolute inset-0 rounded-b-[3rem]" style={{ background: `linear-gradient(180deg, ${withAlpha('#000',.35)} 0%, ${withAlpha('#000',.55)} 65%, ${withAlpha('#000',.65)} 100%)` }} />
        </div>

        <div className="relative container mx-auto px-4 text-center text-white">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 flex items-center justify-center gap-2">
              <InfoPill icon={ShieldCheck} color="text-white" ringColor="ring-white/30">Clinique certifiée</InfoPill>
              <InfoPill icon={Star} color="text-white" ringColor="ring-white/30">4,9/5 patients satisfaits</InfoPill>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-[1.1]">
              {clinic.slogan || "Votre santé, notre priorité"}
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8">
              {clinic.description || "Des soins médicaux de qualité dans un environnement chaleureux et professionnel."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <CTAButton
                className="shadow-lg"
                style={{ backgroundColor: theme.accent, color: theme.bg, boxShadow: `0 10px 30px -10px ${withAlpha(theme.accent,.8)}` }}
                aria-label="Prendre rendez-vous"
              >
                <CalendarCheck className="w-5 h-5" />
                Prendre rendez-vous
              </CTAButton>
              <CTAButton
                className="border-2 text-white hover:bg-white/15"
                style={{ borderColor: "white" }}
                aria-label="Voir nos services"
              >
                Nos services
                <ArrowRight className="w-4 h-4" />
              </CTAButton>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== LOGIN / PATIENT ===================== */}
      <LoginCard theme={theme} />

      {/* ===================== ABOUT ===================== */}
      <AboutSection clinic={clinic} />

      {/* ===================== SERVICES ===================== */}
      <ServicesSection clinic={clinic} theme={theme} />

      {/* ===================== CONTACT ===================== */}
      <ContactSection clinic={clinic} theme={theme} withAlpha={withAlpha} />

      {/* ===================== FOOTER ===================== */}
      <footer className="pt-10 pb-8 text-white mt-4" style={{ background: `linear-gradient(135deg, ${withAlpha(theme.primary,.96)}, ${withAlpha(theme.secondary,.96)})` }}>
        <div className="container mx-auto px-4 text-center">
          <div className="mb-3 flex items-center justify-center gap-3">
            <InfoPill icon={ShieldCheck} color="text-white" ringColor="ring-white/30">Données protégées</InfoPill>
            <InfoPill icon={HeartPulse} color="text-white" ringColor="ring-white/30">Suivi patient</InfoPill>
          </div>
          <p className="opacity-90">&copy; {new Date().getFullYear()} {clinic.name || "Votre Clinique"}. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
