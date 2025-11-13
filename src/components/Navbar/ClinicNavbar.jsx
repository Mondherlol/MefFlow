import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, LogIn, User, UserPlus, LogOut, LayoutDashboard } from "lucide-react";
import { useClinic } from "../../context/clinicContext";
import { useAuth } from "../../context/authContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";


const tokens = {
    header: "bg-white/80 backdrop-blur border-b border-slate-200",
    brandBox:
        "h-9 w-9 rounded-xl grid place-items-center font-bold text-white bg-gradient-to-br from-sky-600 to-indigo-600",
    link:
        "px-3 py-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-sky-50 transition",
    linkActive:
        "px-3 py-2 rounded-lg text-slate-900 bg-sky-50 ring-1 ring-sky-100",
    cta: "rounded-xl px-4 py-2 text-white transition shadow-sm",
};

// Construit une URL vers la home clinic + ancre (#id)
function clinicHash(hash, base = "/Home") {
    return `${base}#${hash.replace(/^#/, "")}`;
}

export default function ClinicNavbar() {
    const { clinic, theme } = useClinic();
    const { user , loading,logout } = useAuth();
    const clinicName = clinic?.name || "Clinique";
    const loc = useLocation();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [activeHash, setActiveHash] = useState((loc.hash || "").replace("#", ""));

    const items = [
        { label: "Accueil", hash: "top" },
        { label: "À propos", hash: "about" },
        { label: "Services", hash: "services" },
        { label: "Contact", hash: "contact" },
    ];

    const adminLinks = [
        { label: "Page de la clinique", path: "/Home", icon: null },
        { label: "Tableau de bord", path: "/admin", icon: null},
    ];

    const doctorLinks = [
        { label: "Tableau de bord", path: "/doctor", icon: null},
        { label: "Horaires", path: "/doctor/horaires", icon: null},
    ];

    const isClinicHome = loc.pathname.toLowerCase().includes("home");

    const go = (hash) => {
        setOpen(false);
        // Si on est déjà sur la page clinic, scroll vers l'ancre
        if (isClinicHome) {
            const id = hash === "top" ? "" : hash;
            setActiveHash(id);
            if (!id) {
                // scroll top
                window.scrollTo({ top: 0, behavior: "smooth" });
                if (window.history && window.history.replaceState) window.history.replaceState({}, "", "/Clinic");
                return;
            }
            const el = document.getElementById(id);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
                if (window.history && window.history.replaceState) window.history.replaceState({}, "", `#${id}`);
            } else {
                // si l'élément n'existe pas encore, on remplace l'URL pour naviguer
                navigate(clinicHash(hash));
            }
        } else {
            // naviguer vers la page clinic avec hash
            navigate(clinicHash(hash));
        }
    };

    // Écoute le hash si on arrive via url
    useEffect(() => {
        if (isClinicHome && loc.hash) {
            const hash = loc.hash.replace("#", "");
            const t = setTimeout(() => {
                const el = document.getElementById(hash);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                setActiveHash(hash);
            }, 50);
            return () => clearTimeout(t);
        } else if (!isClinicHome) {
            setActiveHash("");
        }
    }, [loc.pathname, loc.hash]);

    // Observer pour mettre à jour section active (si on est sur la page clinic)
    useEffect(() => {
        if (!isClinicHome) return;
        const ids = items.map((it) => it.hash).filter(Boolean);
        const elements = ids.map((id) => document.getElementById(id)).filter(Boolean);
        if (!elements.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.filter((e) => e.isIntersecting);
                if (visible.length) {
                    visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
                    setActiveHash(visible[0].target.id);
                } else {
                    let closest = elements
                        .map((el) => ({ el, top: Math.abs(el.getBoundingClientRect().top) }))
                        .sort((a, b) => a.top - b.top)[0];
                    if (closest) setActiveHash(closest.el.id);
                }
            },
            { root: null, rootMargin: "-40% 0px -40% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
        );

        elements.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [loc.pathname]);

    if(!clinic || loading) return null;

    return (
        <header className={`sticky top-0 z-40 ${tokens.header}`}>
            <div className="container-max mx-auto flex h-16 items-center justify-between px-4">
                {/* Brand */}
                <div className="flex items-center gap-3">
                    <Link to="/Home" className="flex items-center gap-2">
                        { clinic.logo_url ? (
                            <img src={`${API_URL}/${clinic.logo_url}`} alt="Logo de la clinique" className="h-9 w-9 rounded-xl object-cover"/>
                        ) : (
                            <div className={tokens.brandBox}>M</div>
                        )}
                        <span className="font-semibold text-lg text-slate-900">{clinicName}</span>
                    </Link>
                </div>

                {/* Desktop nav */}
                <nav className="hidden items-center gap-1 sm:flex">

                    { !user && items.map((it) => (
                        <button
                            key={it.hash}
                            onClick={() => go(it.hash)}
                            className={activeHash === it.hash ? tokens.linkActive : tokens.link}
                        >
                            {it.label}
                        </button>
                    ))}

                    { user && user.role === "ADMIN" && adminLinks.map((it) => (
                        <Link key={it.path} to={it.path} className={tokens.link}>
                            <span className="inline-flex items-center gap-1">{it.icon}{it.label}</span>
                        </Link>
                    ))}

                    { user && user.role === "MEDECIN" && doctorLinks.map((it) => (
                        <Link key={it.path} to={it.path} className={tokens.link}>
                            <span className="inline-flex items-center gap-1">{it.icon}{it.label}</span>
                        </Link>
                    ))}

                    {user ? (
                        <button
                            onClick={() => {
                                logout();
                            }}
                            className={`${tokens.cta} ml-2 inline-flex items-center gap-2`}
                            style={{ backgroundColor: theme?.accent }}
                        >
                            <LogOut className="w-4 h-4" />
                            Déconnexion
                        </button>
                    ) : <>
                    <Link to="/SignUp" className="ml-3 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-sky-50">
                        <UserPlus className="w-4 h-4" />
                        Créer un compte
                    </Link>

                    <Link to="/Login" className={`${tokens.cta} ml-2 inline-flex items-center gap-2`} style={{ backgroundColor: theme?.accent }}>
                        <User className="w-4 h-4" />
                        Connexion
                    </Link>
                    </>
                    }
 
                </nav>

                {/* Burger mobile */}
                <button
                    className="sm:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 hover:bg-sky-50"
                    onClick={() => setOpen((v) => !v)}
                    aria-label="Ouvrir le menu"
                    aria-expanded={open}
                >
                    {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            {/* Mobile sheet */}
            <div className={`sm:hidden transition-[max-height] duration-300 overflow-hidden ${open ? "max-h-96" : "max-h-0"}`}>
                <div className="mx-4 mb-4 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                    {items.map((it) => (
                        <button key={it.hash} onClick={() => go(it.hash)} className={`block w-full text-left ${tokens.link}`}>
                            {it.label}
                        </button>
                    ))}

                    { user ? (
                        <div className="p-2">
                            <button onClick={() => { logout(); 
                                setOpen(false);
                            }} className={`${tokens.cta} block w-full text-center`} style={{ backgroundColor: theme?.accent }}>
                                <span className="inline-flex items-center gap-2 justify-center"><LogOut className="w-4 h-4"/> Déconnexion</span>
                            </button>
                        </div>
                    ) :  <>
                        <div className="p-2">
                            <Link to="/Login" className="block w-full text-center rounded-xl px-4 py-2 text-slate-700 hover:bg-sky-50" onClick={() => setOpen(false)}>
                                <span className="inline-flex items-center gap-2 justify-center"><LogIn className="w-4 h-4"/> Connexion</span>
                            </Link>
                        </div>

                        <div className="p-2">
                            <Link to="/SignUp" className={`${tokens.cta} block w-full text-center`} onClick={() => setOpen(false)} style={{ backgroundColor: theme?.accent }}>
                                <span className="inline-flex items-center gap-2 justify-center"><User className="w-4 h-4"/> Créer un compte</span>
                            </Link>
                        </div>
                        </>
                  }

            
                </div>
            </div>
        </header>
    );
}