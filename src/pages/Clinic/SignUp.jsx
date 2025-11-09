// src/pages/SignUpPatient.jsx
import { useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Mail, Lock, Eye, EyeOff, User, Phone, CheckCircle2, ArrowRight,
  ShieldCheck, Calendar, Venus, Mars, Landmark, Info, CheckCircle, Globe
} from "lucide-react";
import PhoneInput from "react-phone-number-input";
import 'react-phone-number-input/style.css';
import { useClinic } from "../../context/clinicContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";


const withAlpha = (hex, a = 1) => {
  if (!hex || hex[0] !== "#") return `rgba(0,0,0,${a})`;
  const h = hex.length === 4 ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` : hex;
  const r = parseInt(h.slice(1, 3), 16);
  const g = parseInt(h.slice(3, 5), 16);
  const b = parseInt(h.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
};

const Card = ({ className = "", children }) => (
  <div className={`bg-white/95 backdrop-blur border border-slate-200/70 rounded-2xl shadow-[0_20px_50px_-22px_rgba(0,0,0,0.25)] ${className}`}>
    {children}
  </div>
);

const Field = ({ label, htmlFor, children, hint }) => (
  <label htmlFor={htmlFor} className="grid gap-1">
    <span className="text-xs font-medium text-slate-600">{label}</span>
    {children}
    {hint && <span className="text-[11px] text-slate-500">{hint}</span>}
  </label>
);

function Stepper({ step, setStep, steps, color }) {
  return (
    <div className="px-6 pt-5">
      <div className="flex items-center justify-between">
        {steps.map((s, i) => {
          const active = step === i;
          const done = step > i;
          return (
            <div key={s.key} className="flex-1 flex items-center">
              <button
                type="button"
                onClick={() => setStep(i)}
                className={`h-8 min-w-8 px-2 rounded-full text-xs font-medium inline-flex items-center gap-2
                  ${active ? "text-white" : done ? "text-white" : "text-slate-700"}
                `}
                style={{
                  backgroundColor: active || done ? color : "rgba(148,163,184,0.25)"
                }}
              >
                <span className="h-5 w-5 grid place-items-center rounded-full bg-white/20">
                  {done ? <CheckCircle className="h-4 w-4" /> : i + 1}
                </span>
                <span className="hidden sm:inline">{s.title}</span>
              </button>
              {i < steps.length - 1 && (
                <div className="h-1 flex-1 mx-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full"
                    style={{ width: done ? "100%" : "0%", backgroundColor: withAlpha(color, 0.7) }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PasswordStrength({ value, color }) {
  const checks = [
    /[a-z]/.test(value),
    /[A-Z]/.test(value),
    /\d/.test(value),
    /[^\w\s]/.test(value),
    value.length >= 8,
  ];
  const score = checks.filter(Boolean).length;
  const pct = (score / 5) * 100;
  const labels = ["Très faible", "Faible", "Moyenne", "Bonne", "Excellente"];
  return (
    <div className="mt-1">
      <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
        <div className="h-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <div className="mt-1 text-[11px] text-slate-500">Sécurité : {labels[Math.max(0, score - 1)]}</div>
    </div>
  );
}

export default function SignUpPatient({ onSubmit }) {
  const { clinic } = useClinic();
  const theme = useMemo(() => ({
    primary: clinic?.primaryColor || "#0ea5e9",    // sky-500
    secondary: clinic?.secondaryColor || "#0369a1", // sky-800
    accent: clinic?.accentColor || "#10b981",      // emerald-500
    name: clinic?.name || "Votre Clinique",
    logo: clinic?.logo_url ? `${API_URL}/${clinic.logo_url}` : null,
  }), [clinic]);

  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const next = params.get("next") || "/patient";

  // Requis
  const [fullName, setFullName] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Optionnels
  const [phone, setPhone] = useState("");
  // par défaut sur N/A
  const [genre, setGenre] = useState("NA");

  // UI
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(true);
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");

  const [step, setStep] = useState(0);
  const steps = [
    { key: "identite", title: "Informations patient" },
    { key: "securite", title: "Contact & sécurité" },
  ];

  const canNextFromStep0 = fullName.trim() && dateNaissance;
  const canSubmit =
    email && password.length >= 8 && confirm && password === confirm && terms;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (step === 0) {
      if (!canNextFromStep0) {
        return setError("Veuillez compléter votre nom complet et votre date de naissance.");
      }
      setStep(1);
      return;
    }

    // Step 1 -> submit
    if (!email) return setError("Veuillez renseigner un email valide.");
    if (password.length < 8) return setError("Le mot de passe doit contenir au moins 8 caractères.");
    if (password !== confirm) return setError("Les mots de passe ne correspondent pas.");
    if (!terms) return setError("Vous devez accepter les conditions d’utilisation.");

    try {
      setLoading(true);
      // 👉 Branche ici ta vraie requête:
      // await api.post("/api/auth/patient/signup", {
      //   full_name: fullName,
      //   date_naissance: dateNaissance,
      //   email, password,
      //   phone, genre
      // });
      await new Promise((r) => setTimeout(r, 600));

      if (typeof onSubmit === "function") {
        await onSubmit({
          full_name: fullName,
          date_naissance: dateNaissance,
          email, password, phone, genre, next
        });
      }

      setOk(true);
      setTimeout(() => {
        navigate("/verify-email?email=" + encodeURIComponent(email) + "&next=" + encodeURIComponent(next), { replace: true });
      }, 500);
    } catch (err) {
      setError("Impossible de créer le compte. Essayez à nouveau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-[80dvh] flex items-center justify-center px-4 py-6"
      style={{
        background: `radial-gradient(1000px 500px at 95% -10%, ${withAlpha(theme.primary, .10)} 0%, transparent 55%), radial-gradient(900px 480px at -10% 110%, ${withAlpha(theme.accent, .10)} 0%, transparent 55%), #f8fafc`
      }}
    >
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1.35fr_0.65fr] gap-6">
        {/* Colonne gauche : Header + Stepper + Form */}
        <Card className="overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl grid place-items-center bg-white border border-slate-200">
                {theme.logo ? (
                  // eslint-disable-next-line jsx-a11y/alt-text
                  <img src={theme.logo} className="h-9 w-9 rounded-xl object-cover" />
                ) : (
                  <Landmark className="h-5 w-5 text-slate-700" />
                )}
              </div>
              <div className="leading-tight">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">Espace patient</p>
                <h1 className="text-base font-semibold text-slate-900">{theme.name}</h1>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Données sécurisées
            </div>
          </div>

          {/* Stepper */}
          <Stepper step={step} setStep={setStep} steps={steps} color={theme.primary} />

          <hr className="mt-4 mb-1 border-slate-200" />

          {/* Form */}
          <form onSubmit={handleSubmit} className="grid gap-4 px-6 pb-6 pt-2">
            {step === 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nom complet *" htmlFor="full_name">
                  <div className="rounded-xl border border-slate-300 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-sky-200">
                    <input
                      id="full_name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex. Amine Ben Salah"
                      className="w-full outline-none text-sm"
                      required
                    />
                  </div>
                </Field>
                <Field label="Date de naissance *" htmlFor="date_naissance">
                  <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-sky-200">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <input
                      id="date_naissance"
                      type="date"
                      value={dateNaissance}
                      onChange={(e) => setDateNaissance(e.target.value)}
                      className="min-w-0 flex-1 outline-none text-sm"
                      required
                    />
                  </div>
                </Field>
                <Field label="Genre (optionnel)" htmlFor="genre">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setGenre(genre === "H" ? "NA" : "H")}
                      className={`flex items-center justify-center gap-1 rounded-xl border px-3 py-2 text-sm ${genre === "H" ? "border-sky-300 bg-sky-50 text-sky-800" : "border-slate-300 bg-white text-slate-700"}`}
                    >
                      <Mars className="h-4 w-4" /> Homme
                    </button>
                    <button
                      type="button"
                      onClick={() => setGenre(genre === "F" ? "NA" : "F")}
                      className={`flex items-center justify-center gap-1 rounded-xl border px-3 py-2 text-sm ${genre === "F" ? "border-pink-300 bg-pink-50 text-pink-800" : "border-slate-300 bg-white text-slate-700"}`}
                    >
                      <Venus className="h-4 w-4" /> Femme
                    </button>
                    <button
                      type="button"
                      onClick={() => setGenre("NA")}
                      className={`flex items-center justify-center gap-1 rounded-xl border px-3 py-2 text-sm ${genre === "NA" ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-slate-300 bg-white text-slate-700"}`}
                      title="Préférer ne pas indiquer"
                    >
                      <User className="h-4 w-4" /> N/A
                    </button>
                  </div>
                </Field>
                <Field label="Téléphone (optionnel)" htmlFor="phone" hint="Pour rappels SMS de rendez-vous.">
                  <div className="rounded-xl border border-slate-300 bg-white overflow-hidden transition-all duration-200 focus-within:ring-2 focus-within:ring-sky-200">
                    <div className="flex items-center gap-2 px-3 py-2">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <PhoneInput
                        international
                        defaultCountry={clinic?.country || "TN"}
                        value={phone}
                        onChange={setPhone}
                        placeholder="Entrez votre numéro de téléphone"
                        className="min-w-0 flex-1 h-10"
                      />
                    </div>
                  </div>
                </Field>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Email *" htmlFor="email">
                  <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-sky-200">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vous@exemple.com"
                      className="min-w-0 flex-1 outline-none text-sm"
                      required
                    />
                  </div>
                </Field>
                <div className="grid gap-4 md:grid-cols-2 md:col-span-2">
                  <Field label="Mot de passe *" htmlFor="password">
                    <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 h-12 focus-within:ring-2 focus-within:ring-sky-200">
                      <Lock className="h-4 w-4 text-slate-400" />
                      <input
                        id="password"
                        type={showPwd ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="min-w-0 flex-1 outline-none text-sm"
                        required
                      />
                      <button type="button" onClick={() => setShowPwd((s) => !s)} className="text-slate-500 hover:text-slate-700">
                        {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>

                  <Field label="Confirmer *" htmlFor="confirm">
                    <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 h-12 focus-within:ring-2 focus-within:ring-sky-200">
                      <Lock className="h-4 w-4 text-slate-400" />
                      <input
                        id="confirm"
                        type={showPwd2 ? "text" : "password"}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="••••••••"
                        className="min-w-0 flex-1 outline-none text-sm"
                        required
                      />
                      <button type="button" onClick={() => setShowPwd2((s) => !s)} className="text-slate-500 hover:text-slate-700">
                        {showPwd2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>

                  {/* Password strength bar below both fields so they align visually */}
                  <div className="md:col-span-2">
                    <PasswordStrength value={password} color={theme.primary} />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="inline-flex items-center gap-2 text-xs select-none">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300"
                      checked={terms}
                      onChange={(e) => setTerms(e.target.checked)}
                    />
                    J’accepte les{" "}
                    <Link to="/legal/cgu" className="text-sky-700 hover:underline underline-offset-4">
                      conditions d’utilisation
                    </Link>
                    .
                  </label>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}
            {ok && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Compte créé. Redirection…
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                className="text-sm text-slate-600 hover:text-slate-900 disabled:opacity-50"
                disabled={step === 0}
              >
                ← Précédent
              </button>

              {step === 0 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={!canNextFromStep0}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow disabled:opacity-60"
                  style={{ backgroundColor: theme.primary, boxShadow: `0 10px 30px -12px ${withAlpha(theme.primary, .55)}` }}
                >
                  Continuer
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}

              {step === 1 && (
                <button
                  type="submit"
                  disabled={loading || !canSubmit}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow disabled:opacity-60"
                  style={{ backgroundColor: theme.primary, boxShadow: `0 10px 30px -12px ${withAlpha(theme.primary, .55)}` }}
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Création…
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4" />
                      Créer mon compte
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="text-center text-sm text-slate-600">
              Déjà un compte ?{" "}
              <Link to="/login" className="font-medium text-sky-700 hover:underline underline-offset-4 inline-flex items-center gap-1">
                Se connecter
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </form>
        </Card>

        {/* Colonne droite : Guide compact (comme ton screen) */}
        <div className="hidden lg:block">
          <Card className="p-5 sticky top-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Guide de configuration</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5" />
                <span><span className="font-medium">Validation rapide</span><br/><span className="text-slate-600">Activation sous 24h après vérification d’email.</span></span>
              </li>
              <li className="flex items-start gap-2">
                <Globe className="h-4 w-4 text-sky-600 mt-0.5" />
                <span><span className="font-medium">Support international</span><br/><span className="text-slate-600">Tous les pays & indicatifs pris en charge.</span></span>
              </li>
              <li className="flex items-start gap-2">
                <Info className="h-4 w-4 text-orange-500 mt-0.5" />
                <span><span className="font-medium">Astuce</span><br/><span className="text-slate-600">Choisissez un mot de passe robuste (8+ caractères, chiffres & symboles).</span></span>
              </li>
            </ul>

            <div className="mt-4 rounded-lg border border-slate-200 p-3 bg-slate-50">
              <p className="text-xs text-slate-600">
                En créant un compte, vous acceptez nos <Link to="/legal/cgu" className="text-sky-700 underline underline-offset-4">CGU</Link>.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
