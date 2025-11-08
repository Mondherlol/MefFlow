import { useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, User, Phone, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import { useClinic } from "../../context/clinicContext";

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

const Field = ({ label, htmlFor, children, hint }) => (
  <label htmlFor={htmlFor} className="grid gap-1">
    <span className="text-sm text-slate-600">{label}</span>
    {children}
    {hint && <span className="text-xs text-slate-500">{hint}</span>}
  </label>
);

const Card = ({ className = "", children }) => (
  <div className={`bg-white/90 backdrop-blur border border-slate-200/70 rounded-2xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)] ${className}`}>
    {children}
  </div>
);

function PasswordStrength({ value, color }) {
  const checks = [
    /[a-z]/.test(value),
    /[A-Z]/.test(value),
    /\d/.test(value),
    /[^\w\s]/.test(value),
    value.length >= 8,
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["Très faible", "Faible", "Moyenne", "Bonne", "Excellente"];
  const pct = (score / 5) * 100;
  return (
    <div className="mt-1">
      <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
        <div className="h-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <div className="mt-1 text-xs text-slate-500">Sécurité : {labels[Math.max(0, score - 1)]}</div>
    </div>
  );
}

export default function SignUpPatient({ onSubmit }) {
  const { clinic } = useClinic?.() || { clinic: null };
  const theme = useMemo(() => ({
    primary: clinic?.primaryColor || "#3b82f6",
    secondary: clinic?.secondaryColor || "#1e40af",
    accent: clinic?.accentColor || "#f59e0b",
    bg: clinic?.backgroundColor || "#ffffff",
    text: clinic?.textColor || "#0f172a",
    name: clinic?.name || "Votre Clinique",
  }), [clinic]);

  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const next = params.get("next") || "/patient";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [terms, setTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!firstName || !lastName) return setError("Veuillez entrer votre prénom et votre nom.");
    if (!email) return setError("Veuillez entrer un email valide.");
    if (password.length < 8) return setError("Le mot de passe doit contenir au moins 8 caractères.");
    if (password !== confirm) return setError("Les mots de passe ne correspondent pas.");
    if (!terms) return setError("Vous devez accepter les conditions d’utilisation.");

    try {
      setLoading(true);
      // Branchez ici votre appel API d'inscription
      // ex: const { data } = await api.post("/api/auth/patient/signup", { firstName, lastName, email, phone, password });
      await new Promise((r) => setTimeout(r, 900));

      if (typeof onSubmit === "function") {
        await onSubmit({ firstName, lastName, email, phone, password, next });
      }

      setOk(true);
      setTimeout(() => navigate("/verify-email?email=" + encodeURIComponent(email) + "&next=" + encodeURIComponent(next), { replace: true }), 600);
    } catch (err) {
      setError("Impossible de créer le compte. Essayez à nouveau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] relative flex items-center justify-center px-6 py-12" style={{ backgroundColor: theme.bg, color: theme.text }}>
      {/* Décor */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-25"
             style={{ background: `radial-gradient(ellipse at center, ${withAlpha(theme.primary,.25)}, transparent 60%)` }} />
        <div className="absolute -bottom-24 -left-24 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-20"
             style={{ background: `radial-gradient(ellipse at center, ${withAlpha(theme.accent,.22)}, transparent 60%)` }} />
      </div>

      <Card className="w-full max-w-5xl overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Bandeau gauche */}
          <div className="relative p-8 text-white" style={{ background: `linear-gradient(135deg, ${withAlpha(theme.primary,.98)}, ${withAlpha(theme.secondary,.98)})` }}>
            <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(ellipse at 15% 10%, white 0%, transparent 45%)` }} />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium">
                <ShieldCheck className="h-3.5 w-3.5" />
                Inscription sécurisée
              </div>
              <h1 className="mt-4 text-2xl font-bold leading-tight">Créer votre compte patient</h1>
              <p className="mt-2 text-white/90">Accédez à un espace personnel pour vos rendez‑vous, résultats et échanges avec votre médecin.</p>
            </div>
          </div>

          {/* Formulaire */}
          <div className="p-8">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-semibold">Inscription</h2>
              <p className="mt-1 text-slate-600 text-sm">C’est rapide et ça vous fera gagner du temps pour vos prochaines visites.</p>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Prénom" htmlFor="firstName">
                  <div className="rounded-xl border border-slate-300 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-sky-200">
                    <input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Amine" className="w-full outline-none text-sm" required />
                  </div>
                </Field>
                <Field label="Nom" htmlFor="lastName">
                  <div className="rounded-xl border border-slate-300 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-sky-200">
                    <input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Ben Salah" className="w-full outline-none text-sm" required />
                  </div>
                </Field>
              </div>

              <Field label="Email" htmlFor="email">
                <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-sky-200">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" className="min-w-0 flex-1 outline-none text-sm" required />
                </div>
              </Field>

              <Field label="Téléphone (optionnel)" htmlFor="phone" hint="Pour les rappels de rendez‑vous.">
                <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-sky-200">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+216 99 000 000" className="min-w-0 flex-1 outline-none text-sm" />
                </div>
              </Field>

              <Field label="Mot de passe" htmlFor="password">
                <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-sky-200">
                  <Lock className="h-4 w-4 text-slate-400" />
                  <input id="password" type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="min-w-0 flex-1 outline-none text-sm" required />
                  <button type="button" onClick={() => setShowPwd((s) => !s)} className="text-slate-500 hover:text-slate-700">{showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                </div>
                <PasswordStrength value={password} color={theme.primary} />
              </Field>

              <Field label="Confirmer le mot de passe" htmlFor="confirm">
                <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-sky-200">
                  <Lock className="h-4 w-4 text-slate-400" />
                  <input id="confirm" type={showPwd2 ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" className="min-w-0 flex-1 outline-none text-sm" required />
                  <button type="button" onClick={() => setShowPwd2((s) => !s)} className="text-slate-500 hover:text-slate-700">{showPwd2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                </div>
              </Field>

              <label className="mt-2 inline-flex items-center gap-2 text-sm select-none">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
                J’accepte les <Link to="/legal/cgu" className="text-sky-700 hover:underline underline-offset-4">conditions d’utilisation</Link>
              </label>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
              )}
              {ok && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Compte créé. Redirection…
                </div>
              )}

              <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium text-white shadow hover:shadow-md disabled:opacity-70" style={{ backgroundColor: theme.primary, boxShadow: `0 10px 30px -12px ${withAlpha(theme.primary, .55)}` }}>
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Création…
                  </span>
                ) : (
                  <>
                    <User className="h-4 w-4" />
                    Créer mon compte
                  </>
                )}
              </button>

              <div className="text-center text-sm text-slate-600">
                Déjà un compte ? {" "}
                <Link to="/login" className="font-medium text-sky-700 hover:underline underline-offset-4 inline-flex items-center gap-1">
                  Se connecter
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
}
