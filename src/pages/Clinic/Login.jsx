import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowRight, ShieldCheck, CalendarCheck, Stethoscope, MessageSquare } from "lucide-react";
import { useClinic } from "../../context/clinicContext";
import toast from "react-hot-toast";
import api from "../../api/axios";

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

const Field = ({ label, children, htmlFor }) => (
  <label htmlFor={htmlFor} className="grid gap-1">
    <span className="text-sm text-slate-600">{label}</span>
    {children}
  </label>
);

const Card = ({ className = "", children }) => (
  <div className={`bg-white/90 backdrop-blur border border-slate-200/70 rounded-2xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)] ${className}`}>
    {children}
  </div>
);

export default function Login() {
  const { clinic } = useClinic();
  const theme = useMemo(() => ({
    primary: clinic?.primaryColor || "#3b82f6",
    secondary: clinic?.secondaryColor || "#1e40af",
    accent: clinic?.accentColor || "#f59e0b",
  }), [clinic]);

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  useEffect(() => {
    // Charger les identifiants mémorisés
    const savedEmail = localStorage.getItem("email");
    const savedPassword = localStorage.getItem("password");
    if (savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRemember(true);
    }
    }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Mini-validation
    if (!email || !password) {
      setError("Veuillez remplir votre email et votre mot de passe.");
      return;
    }

    try {
      setLoading(true);
        // Appel API de connexion
        const response = await api.post("/api/auth/login/", {
          clinic_id : clinic.id,
          email,
          password,
        });
        if (response.status === 200) {
            // Connexion réussie, redirection
            toast.success("Connexion réussie !");

            if( remember ) {
              // Stocker dans le localStorage
              localStorage.setItem("email", email);
              localStorage.setItem("password", password);
            } else {
              localStorage.removeItem("email");
              localStorage.removeItem("password");
            }
            navigate("/patient", { replace: true });
        }
    } catch (err) {
      if(err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Impossible de vous connecter. Reessayez plus tard.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70dvh] relative flex items-center justify-center px-6 py-12" >
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
                Portail patient sécurisé
              </div>
              <h1 className="mt-4 text-2xl font-bold leading-tight">Bienvenue sur l’espace patient</h1>
              <p className="mt-2 text-white/90">Connectez‑vous pour gérer vos rendez‑vous, consulter vos résultats et discuter avec votre médecin.</p>

              <ul className="mt-6 grid gap-3 text-sm">
                <li className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 backdrop-blur">
                  <CalendarCheck className="h-4 w-4" /> Prise de rendez‑vous simplifiée
                </li>
                <li className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 backdrop-blur">
                  <Stethoscope className="h-4 w-4" /> Résultats et ordonnances en ligne
                </li>
                <li className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 backdrop-blur">
                  <MessageSquare className="h-4 w-4" /> Messagerie sécurisée avec l’équipe médicale
                </li>
              </ul>
            </div>
          </div>

          {/* Formulaire */}
          <div className="p-8">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-semibold">Connexion</h2>
              <p className="mt-1 text-slate-600 text-sm">Renseignez vos identifiants pour accéder à votre espace.</p>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4">
              <Field label="Email" htmlFor="email">
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

              <Field label="Mot de passe" htmlFor="password">
                <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-sky-200">
                  <Lock className="h-4 w-4 text-slate-400" />
                  <input
                    id="password"
                    type={showPwd ? "text" : "password"}
                    autoComplete="current-password"
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

              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2 select-none">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  Se souvenir de moi
                </label>
                <Link to="/forgot-password" className="text-sky-700 hover:underline underline-offset-4">Mot de passe oublié ?</Link>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium text-white shadow hover:shadow-md disabled:opacity-70"
                style={{ backgroundColor: theme.primary, boxShadow: `0 10px 30px -12px ${withAlpha(theme.primary, .55)}` }}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Connexion…
                  </span>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Se connecter
                  </>
                )}
              </button>

              <div className="text-center text-sm text-slate-600">
                Pas encore de compte ? {" "}
                <Link to="/signup" className="font-medium text-sky-700 hover:underline underline-offset-4 inline-flex items-center gap-1">
                  Créer un compte
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
