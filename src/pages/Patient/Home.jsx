import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    CalendarDays,
    FileText,
    PlusCircle,
    Bell,
    Clock,
    CreditCard,
    Edit3,
    Activity
} from "lucide-react";
import { useAuth } from "../../context/authContext";

export default function HomePatient() {
    const { user } = useAuth() || {};

    // MOCK DATA — vous remplacerez par vos appels API
    const [pendingRequests, setPendingRequests] = useState(3);
    const [upcoming, setUpcoming] = useState({
        id: 1,
        date: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().slice(0, 10),
        time: "10:30",
        doctor: "Dr. Martin Dupont",
        clinic: "Clinique Saint-Luc",
    });

    const [pastAppointments, setPastAppointments] = useState([
        { id: 11, date: "2025-11-10", time: "09:15", doctor: "Dr. Legrand", status: "Terminé" },
        { id: 10, date: "2025-10-23", time: "14:00", doctor: "Dr. Martin", status: "Annulé" },
        { id: 9, date: "2025-09-02", time: "11:00", doctor: "Dr. Nguyen", status: "Terminé" },
    ]);

    const [invoices, setInvoices] = useState([
        { id: "F-2025-001", date: "2025-11-05", amount: "45.00€", status: "Payée" },
        { id: "F-2025-002", date: "2025-10-01", amount: "60.00€", status: "En attente" },
    ]);

    // Symptom test mock
    const [runningTest, setRunningTest] = useState(false);
    const [testResult, setTestResult] = useState(null);

    useEffect(() => {
        // placeholder if later we fetch real data on mount
    }, []);

    function startSymptomTest() {
        setRunningTest(true);
        setTestResult(null);
        // simulate IA call
        setTimeout(() => {
            setRunningTest(false);
            setTestResult({
                probable: "Rhume (probabilité élevée)",
                advice: "Repos, hydratation, si fièvre > 38.5°C consultez un médecin."
            });
        }, 1400);
    }

    return (
        <div className="min-h-[80dvh] bg-gradient-to-b from-slate-50 to-slate-100/60 p-6 md:p-10">
            <div className="max-w-6xl mx-auto space-y-6">
                <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Bonjour {user?.first_name || user?.full_name || ""}</h1>
                        <p className="text-sm text-slate-500 mt-1">Bienvenue sur votre espace patient — gérez vos rendez-vous et documents.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            className="relative inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white shadow-sm border"
                            title="Demandes de RDV"
                            style={{ borderColor: "#e6edf3" }}
                        >
                            <Bell className="w-4 h-4 text-slate-600" />
                            <span className="text-sm text-slate-700">Demandes</span>
                            {pendingRequests > 0 && (
                                <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-semibold leading-none text-white bg-rose-600 rounded-full shadow-sm">
                                    {pendingRequests}
                                </span>
                            )}
                        </button>
                        <Link to="/patient/profile/edit" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white shadow-sm border" style={{ borderColor: "#e6edf3" }}>
                            <Edit3 className="w-4 h-4 text-slate-600" />
                            <span className="text-sm text-slate-700">Modifier</span>
                        </Link>
                    </div>
                </header>

                <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-150 border border-slate-50">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs text-slate-500">Espace patient</div>
                                <div className="text-xl font-semibold">Vos actions rapides</div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="text-center px-4 py-2 bg-white rounded-lg shadow-sm">
                                    <div className="text-xs text-slate-500">Prochain RDV</div>
                                    <div className="font-bold text-slate-800">{upcoming?.date} · {upcoming?.time}</div>
                                </div>
                                <div className="text-center px-4 py-2 bg-white rounded-lg shadow-sm">
                                    <div className="text-xs text-slate-500">Demandes</div>
                                    <div className="font-bold text-slate-800">{pendingRequests}</div>
                                </div>
                                <div className="text-center px-4 py-2 bg-white rounded-lg shadow-sm">
                                    <div className="text-xs text-slate-500">Factures</div>
                                    <div className="font-bold text-slate-800">{invoices.length}</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <Link to="/patient/appointments/new" className="col-span-1 bg-sky-50 hover:bg-sky-100 px-4 py-3 rounded-lg flex items-center gap-3 border border-sky-100">
                                    <PlusCircle className="w-6 h-6 text-sky-600" />
                                    <div>
                                        <div className="text-sm font-medium">Prendre un RDV</div>
                                        <div className="text-xs text-slate-500">Choisir un créneau</div>
                                    </div>
                                </Link>

                                <Link to="/patient/medical-record" className="col-span-1 bg-amber-50 hover:bg-amber-100 px-4 py-3 rounded-lg flex items-center gap-3 border border-amber-100">
                                    <FileText className="w-6 h-6 text-amber-600" />
                                    <div>
                                        <div className="text-sm font-medium">Dossier médical</div>
                                        <div className="text-xs text-slate-500">Consulter vos documents</div>
                                    </div>
                                </Link>

                                <Link to="/patient/requests" className="col-span-1 bg-rose-50 hover:bg-rose-100 px-4 py-3 rounded-lg flex items-center gap-3 border border-rose-100">
                                    <CalendarDays className="w-6 h-6 text-rose-600" />
                                    <div>
                                        <div className="text-sm font-medium">Demandes de RDV</div>
                                        <div className="text-xs text-slate-500">Voir les demandes en attente</div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <aside className="space-y-3">
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-50">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="text-xs text-slate-500">Prochain Rendez-vous</div>
                                    <div className="mt-2 text-sm font-semibold text-slate-900">{upcoming?.date} · {upcoming?.time}</div>
                                    <div className="text-xs text-slate-500">{upcoming?.doctor} · {upcoming?.clinic}</div>
                                </div>
                                <div className="text-right">
                                    <Link to="/patient/appointments" className="text-sm text-slate-600 underline">Voir</Link>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs text-slate-500">Factures récentes</div>
                                    <div className="text-sm font-medium">{invoices[0].id} • {invoices[0].amount}</div>
                                </div>
                                <div>
                                    <Link to="/patient/invoices" className="text-sm text-slate-600 underline">Toutes</Link>
                                </div>
                            </div>
                        </div>
                    </aside>
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-50">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className="text-xs text-slate-500">Historique des RDV</div>
                                <div className="text-lg font-semibold">Derniers rendez-vous</div>
                            </div>
                            <Link to="/patient/appointments" className="text-sm text-slate-600 underline">Voir tout</Link>
                        </div>

                        <div className="space-y-3">
                            {pastAppointments.map((p) => (
                                <div key={p.id} className="flex items-center justify-between bg-slate-50 rounded-md p-3">
                                    <div>
                                        <div className="text-sm font-medium">{p.date} · {p.time}</div>
                                        <div className="text-xs text-slate-500">{p.doctor} · {p.status}</div>
                                    </div>
                                    <div className="text-sm text-slate-700">{p.status === "Terminé" ? <span className="text-emerald-600">Terminé</span> : <span className="text-rose-600">{p.status}</span>}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <aside className="space-y-4">
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs text-slate-500">Test de symptômes (IA)</div>
                                    <div className="text-sm font-semibold">Estimez vos symptômes</div>
                                </div>
                                <Activity className="w-5 h-5 text-slate-600" />
                            </div>

                            <div className="mt-4">
                                <p className="text-xs text-slate-500">Ce test est indicatif et ne remplace pas un avis médical.</p>
                                <div className="mt-3 flex gap-2">
                                    <button onClick={startSymptomTest} disabled={runningTest} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-slate-900 text-white">
                                        {runningTest ? "Analyse en cours…" : "Lancer le test"}
                                    </button>
                                    <Link to="/patient/medical-record" className="inline-flex items-center gap-2 px-3 py-2 rounded-md border">Voir dossier</Link>
                                </div>

                                {testResult && (
                                    <div className="mt-3 bg-slate-50 p-3 rounded-md border">
                                        <div className="text-sm font-medium">Résultat probable</div>
                                        <div className="text-sm">{testResult.probable}</div>
                                        <div className="text-xs text-slate-500 mt-1">Conseil: {testResult.advice}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs text-slate-500">Factures</div>
                                    <div className="text-sm font-semibold">Dernières factures</div>
                                </div>
                                <CreditCard className="w-5 h-5 text-slate-600" />
                            </div>
                            <div className="mt-3 space-y-2">
                                {invoices.map(inv => (
                                    <div key={inv.id} className="flex items-center justify-between text-sm bg-slate-50 p-2 rounded">
                                        <div>{inv.id} — {inv.amount}</div>
                                        <div className="text-xs text-slate-500">{inv.status}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </section>
            </div>
        </div>
    );
}