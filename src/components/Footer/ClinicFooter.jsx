import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  MapPin,
  Phone,
  Twitter,
  Linkedin,
  Instagram,
  Globe,
} from "lucide-react";
import { useClinic } from "../../context/clinicContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const tokens = {
  container: "mx-auto max-w-7xl px-6",
  surface: "bg-white",
  border: "border-slate-200",
  link: "text-slate-700 hover:text-slate-900 hover:underline underline-offset-4",
  chip: "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs",
  inputWrap:
    "mt-3 flex rounded-xl border border-slate-300 bg-white p-1 focus-within:ring-2",
  iconBtn:
    "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700",
};

const withAlpha = (hex, a = 1) => {
  if (!hex || hex[0] !== "#") return `rgba(0,0,0,${a})`;
  const h = hex.length === 4
    ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
    : hex;
  const r = parseInt(h.slice(1, 3), 16);
  const g = parseInt(h.slice(3, 5), 16);
  const b = parseInt(h.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
};

function homeHash(hash) {
  return `/#${hash.replace(/^#/, "")}`;
}

export default function ClinicFooter({ showNewsletter = true }) {
  const year = new Date().getFullYear();
  const { clinic } = useClinic?.() || { clinic: null };
  const loc = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const theme = useMemo(
    () => ({
      primary: clinic?.primaryColor || "#3b82f6",
      secondary: clinic?.secondaryColor || "#1e40af",
      accent: clinic?.accentColor || "#f59e0b",
      bg: clinic?.backgroundColor || "#ffffff",
      text: clinic?.textColor || "#0f172a",
    }),
    [clinic]
  );

  const brandGradient = {
    background: `linear-gradient(135deg, ${withAlpha(theme.primary, 1)} 0%, ${withAlpha(
      theme.secondary,
      1
    )} 100%)`,
  };

  const go = (hash) => {
    const clean = hash.replace(/^#/, "");
    if (loc.pathname !== "/") {
      navigate(homeHash(clean));
      return;
    }
    const el = document.getElementById(clean);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    if (window.history?.replaceState) window.history.replaceState({}, "", `#${clean}`);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!email) return;
    // À brancher sur votre endpoint newsletter/marketing si besoin
    alert(`Merci ! Nous vous tiendrons informé(e) à ${email}.`);
    setEmail("");
  };

  if(!clinic) return null;

  return (
    <footer className={`${tokens.surface} border-t ${tokens.border}`} style={{ color: theme.text, backgroundColor: theme.bg }}>
      <div className={`${tokens.container} py-14`}>
        <div className="grid gap-10 md:grid-cols-5">
          {/* Brand */}
          <div className="md:col-span-2">
            <button onClick={() => go("home")} className="flex items-center gap-3">
              {clinic?.logo_url ? (
                <img src={`${API_URL}/${clinic.logo_url}`} alt="Logo de la clinique" className="h-10 w-10 rounded-xl object-cover" />
              ) : (
                <div className="h-10 w-10 rounded-xl grid place-items-center text-white font-bold" style={brandGradient}>
                  {clinic?.name ? clinic.name[0] : "C"}
                </div>
              )}
              <span className="text-lg font-semibold text-slate-900">
                {clinic?.name || "Votre Clinique"}
              </span>
            </button>
            <p className="mt-4 max-w-md text-sm text-slate-600">
              {clinic?.footerTagline || (
                <>
                  Des soins modernes et humains : rendez‑vous, suivi en ligne et accompagnement personnalisé.
                </>
              )}
            </p>

            <div className="mt-4">
              <span
                className={`${tokens.chip} border`}
                style={{
                  borderColor: withAlpha(theme.accent, 0.3),
                  background: withAlpha(theme.accent, 0.12),
                  color: theme.accent,
                }}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Qualité certifiée
              </span>
            </div>

            <div className="mt-6 flex gap-3">
              {clinic?.twitter && (
                <a
                  className={`${tokens.iconBtn} hover:opacity-90`}
                  style={{ background: withAlpha(theme.primary, 0.05) }}
                  href={clinic.twitter}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Twitter"
                >
                  <Twitter className="h-4.5 w-4.5" />
                </a>
              )}
              {clinic?.linkedin && (
                <a
                  className={`${tokens.iconBtn} hover:opacity-90`}
                  style={{ background: withAlpha(theme.primary, 0.05) }}
                  href={clinic.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4.5 w-4.5" />
                </a>
              )}
              {clinic?.instagram && (
                <a
                  className={`${tokens.iconBtn} hover:opacity-90`}
                  style={{ background: withAlpha(theme.primary, 0.05) }}
                  href={clinic.instagram}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4.5 w-4.5" />
                </a>
              )}
              {clinic?.website && (
                <a
                  className={`${tokens.iconBtn} hover:opacity-90`}
                  style={{ background: withAlpha(theme.primary, 0.05) }}
                  href={clinic.website}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Site web"
                >
                  <Globe className="h-4.5 w-4.5" />
                </a>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold text-slate-900">Navigation</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><button onClick={() => go("home")} className={tokens.link}>Accueil</button></li>
              <li><button onClick={() => go("services")} className={tokens.link}>Services</button></li>
              <li><button onClick={() => go("about")} className={tokens.link}>À propos</button></li>
              <li><button onClick={() => go("contact")} className={tokens.link}>Contact</button></li>
            </ul>
          </div>

          {/* Coordonnées */}
          <div>
            <h4 className="font-semibold text-slate-900">Coordonnées</h4>
            <ul className="mt-3 space-y-3 text-sm">
              {clinic?.address && (
                <li className="flex items-start gap-2 text-slate-700">
                  <MapPin className="mt-0.5 h-4 w-4" />
                  <span>{clinic.address}</span>
                </li>
              )}
              {clinic?.phone && (
                <li className="flex items-start gap-2 text-slate-700">
                  <Phone className="mt-0.5 h-4 w-4" />
                  <a href={`tel:${clinic.phone}`} className="hover:underline underline-offset-4">{clinic.phone}</a>
                </li>
              )}
              {clinic?.email && (
                <li className="flex items-start gap-2 text-slate-700">
                  <Mail className="mt-0.5 h-4 w-4" />
                  <a href={`mailto:${clinic.email}`} className="hover:underline underline-offset-4">{clinic.email}</a>
                </li>
              )}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            {showNewsletter && (
              <>
                <h4 className="font-semibold text-slate-900">Rester informé</h4>
                <p className="mt-3 text-sm text-slate-600">
                  Recevez nos conseils santé et actualités de la clinique.
                </p>
                <form onSubmit={submit}
                      className={`${tokens.inputWrap} mt-3`}
                      style={{ boxShadow: `0 0 0 0 ${withAlpha(theme.primary, 0)}` }}>
                  <div className="flex items-center px-2 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="min-w-0 flex-1 rounded-xl px-2 py-2 text-sm outline-none"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-white hover:opacity-95"
                    style={{ backgroundColor: theme.accent }}
                  >
                    S’inscrire
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
                <p className="mt-2 text-xs text-slate-500">Pas de spam. Désinscription en 1 clic.</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-200">
        <div className={`${tokens.container} flex flex-col items-center gap-3 py-6 text-sm text-slate-600 md:flex-row md:justify-between`}>
          <p>
            © {year} {clinic?.name || "Votre Clinique"}. Tous droits réservés.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/legal/cgu" className={tokens.link}>Conditions</Link>
            <Link to="/legal/privacy" className={tokens.link}>Confidentialité</Link>
            <button onClick={() => go("contact")} className={tokens.link}>Contact</button>
            <span className="inline-flex items-center gap-1 text-slate-500">
              <Sparkles className="h-4 w-4" style={{ color: theme.accent }} />
              {clinic?.bottomBadge || "Toujours à votre écoute"}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
