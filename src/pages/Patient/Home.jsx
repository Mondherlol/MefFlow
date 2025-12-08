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
    Activity,
    Calendar,
    ChevronRight,
    UserCheck,
    Download,
    Loader2,
    Receipt
} from "lucide-react";
import ConsultationCard from "../../components/Patient/ConsultationCard";
import { useAuth } from "../../context/authContext";
import toast from "react-hot-toast";
import api from "../../api/axios";
import { getImageUrl } from "../../utils/image.jsx";
import { pdf } from '@react-pdf/renderer';
import InvoicePDFDocument from "../../components/Patient/ConsultationDetails/InvoicePDFDocument";
import { useClinic } from "../../context/clinicContext";

export default function HomePatient() {
    const { user } = useAuth() || {};
    const { clinic } = useClinic();

    const [pastAppointments, setPastAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isStatsLoading, setIsStatsLoading] = useState(true);
    const [isInvoicesLoading, setIsInvoicesLoading] = useState(true);
    const [generatingInvoiceId, setGeneratingInvoiceId] = useState(null);

    // Stats from API
    const [stats, setStats] = useState({
        total_consultations: 0,
        total_cancelled: 0,
        total_invoices: 0
    });
    const [upcoming, setUpcoming] = useState(null);

    const [invoices, setInvoices] = useState([]);

    const [testResult, setTestResult] = useState(null);

    // Helper functions for date formatting
    function capitalizeWords(str) {
        return String(str).split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    function formatLongDate(d) {
        try {
            const opts = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
            const s = d.toLocaleDateString('fr-FR', opts);
            return capitalizeWords(s);
        } catch (e) {
            return d.toISOString().slice(0,10);
        }
    }

    function getRelativeTag(d) {
        const now = new Date();
        const diffMs = d - now;
        const absMs = Math.abs(diffMs);
        const sec = Math.round(absMs / 1000);
        const min = Math.round(sec / 60);
        const hrs = Math.round(min / 60);
        const days = Math.round(hrs / 24);

        if (diffMs < 0) {
            // past
            if (sec < 60) return 'à l\'instant';
            if (min < 60) return `il y a ${min} ${min === 1 ? 'minute' : 'minutes'}`;
            if (hrs < 24) return `il y a ${hrs} ${hrs === 1 ? 'heure' : 'heures'}`;
            if (days === 1) return 'hier';
            if (days < 30) return `il y a ${days} ${days === 1 ? 'jour' : 'jours'}`;
            const months = Math.round(days / 30);
            if (months < 12) return `il y a ${months} ${months === 1 ? 'mois' : 'mois'}`;
            const years = Math.round(months / 12);
            return `il y a ${years} ${years === 1 ? 'an' : 'ans'}`;
        } else {
            // future
            if (sec < 60) return 'bientôt';
            if (min < 60) return `dans ${min} ${min === 1 ? 'minute' : 'minutes'}`;
            if (hrs < 24) return `dans ${hrs} ${hrs === 1 ? 'heure' : 'heures'}`;
            if (days === 1) return 'demain';
            return `dans ${days} ${days === 1 ? 'jour' : 'jours'}`;
        }
    }

    useEffect(() => {
        // placeholder if later we fetch real data on mount
        fetchPatientConsultations();
        fetchPatientStats();
        fetchPatientInvoices();
    }, []);
    const fetchPatientStats = async () => {
        try {
            setIsStatsLoading(true);
            const response = await api.get('/api/patient/stats/');
            const data = response.data;
            setStats({
                total_consultations: data.total_consultations || 0,
                total_cancelled: data.total_cancelled || 0,
                total_invoices: data.total_invoices || 0
            });
        } catch (error) {
            console.error("Error fetching patient stats:", error);
        } finally {
            setIsStatsLoading(false);
        }
    };

    const fetchPatientInvoices = async () => {
        try {
            setIsInvoicesLoading(true);
            const response = await api.get('/api/invoices/patient/');
            const data = response.data;
            // Trier par date de création (plus récent en premier) et prendre les 3 dernières
            const sortedInvoices = data.sort((a, b) => 
                new Date(b.created_at) - new Date(a.created_at)
            ).slice(0, 3);
            setInvoices(sortedInvoices);
        } catch (error) {
            console.error("Error fetching invoices:", error);
        } finally {
            setIsInvoicesLoading(false);
        }
    };

    const handleDownloadInvoice = async (invoice) => {
        setGeneratingInvoiceId(invoice.id);
        try {
            const blob = await pdf(
                <InvoicePDFDocument 
                    invoice={invoice} 
                    clinicInfo={{
                        name: clinic?.name || 'Clinique MedFlow',
                        address: clinic?.address || '',
                        phone: clinic?.phone || '',
                        email: clinic?.email || '',
                        logo: clinic?.logo ? getImageUrl(clinic.logo) : null,
                    }}
                />
            ).toBlob();
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `facture-${invoice.number}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success("Facture téléchargée");
        } catch (error) {
            console.error('Erreur lors du téléchargement:', error);
            toast.error("Erreur lors du téléchargement");
        } finally {
            setGeneratingInvoiceId(null);
        }
    };

    const fetchPatientConsultations = async () => {
        try{
            setIsLoading(true);
            const response = await api.get(`/api/consultations/by-patient/?patient=${user.id}/`);
            const data =  response.data.data;
            setPastAppointments(data);
            console.log("Fetched consultations:", data);
            
            // Trouver le prochain rendez-vous ou le dernier si aucun n'est à venir
            if (data && data.length > 0) {
                const now = new Date();
                
                // Trier les consultations par date
                const sortedConsultations = [...data].sort((a, b) => {
                    const dateTimeA = new Date(`${a.date}T${a.heure_debut || '00:00'}`);
                    const dateTimeB = new Date(`${b.date}T${b.heure_debut || '00:00'}`);
                    return dateTimeA - dateTimeB;
                });
                
                // Chercher le premier rendez-vous futur
                const futureAppointment = sortedConsultations.find(consultation => {
                    const consultationDateTime = new Date(`${consultation.date}T${consultation.heure_debut || '00:00'}`);
                    return consultationDateTime > now;
                });
                
                // Si on a un rendez-vous futur, l'utiliser, sinon prendre le dernier
                const selectedAppointment = futureAppointment || sortedConsultations[sortedConsultations.length - 1];
                
                setUpcoming({
                    id: selectedAppointment.id,
                    date: selectedAppointment.date,
                    time: selectedAppointment.heure_debut || "N/A",
                    doctor: selectedAppointment.doctor?.full_name || selectedAppointment.doctor?.display_name || "Médecin",
                    specialty: selectedAppointment.doctor?.specialite || selectedAppointment.doctor?.specialty || "",
                    photo: selectedAppointment.doctor?.photo_url || selectedAppointment.doctor?.photo || null,
                    status: selectedAppointment.statusConsultation || "confirme",
                    clinic: "Clinique",
                });
            }
        }catch(error){
            toast.error("Erreur lors du chargement des consultations.");
            console.log("Error fetching consultations:", error);
        } finally {
            setIsLoading(false);
        }
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
                        <Link 
                            to="/patient/requests"
                            className="relative inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white shadow-sm border"
                            title="Demandes de RDV"
                            style={{ borderColor: "#e6edf3" }}
                        >
                            <Bell className="w-4 h-4 text-slate-600" />
                            <span className="text-sm text-slate-700">Demandes</span>
                            {!isStatsLoading && stats.total_cancelled > 0 && (
                                <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-semibold leading-none text-white bg-rose-600 rounded-full shadow-sm">
                                    {stats.total_cancelled}
                                </span>
                            )}
                        </Link>
                        <Link to="/patient/profile/edit" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white shadow-sm border" style={{ borderColor: "#e6edf3" }}>
                            <Edit3 className="w-4 h-4 text-slate-600" />
                            <span className="text-sm text-slate-700">Modifier</span>
                        </Link>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Colonne principale gauche */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Vos actions rapides */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-150 border border-slate-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs text-slate-500">Espace patient</div>
                                    <div className="text-xl font-semibold">Vos actions rapides</div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {isStatsLoading ? (
                                        <>
                                            <div className="text-center px-4 py-2 bg-white rounded-lg shadow-sm animate-pulse">
                                                <div className="h-3 bg-slate-200 rounded w-16 mb-1" />
                                                <div className="h-4 bg-slate-200 rounded w-20" />
                                            </div>
                                            <div className="text-center px-4 py-2 bg-white rounded-lg shadow-sm animate-pulse">
                                                <div className="h-3 bg-slate-200 rounded w-16 mb-1" />
                                                <div className="h-4 bg-slate-200 rounded w-12" />
                                            </div>
                                            <div className="text-center px-4 py-2 bg-white rounded-lg shadow-sm animate-pulse">
                                                <div className="h-3 bg-slate-200 rounded w-16 mb-1" />
                                                <div className="h-4 bg-slate-200 rounded w-8" />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {upcoming && (
                                                <div className="text-center px-4 py-2 bg-white rounded-lg shadow-sm">
                                                    <div className="text-xs text-slate-500">Prochain RDV</div>
                                                    <div className="font-bold text-slate-800">{upcoming?.date} · {upcoming?.time}</div>
                                                </div>
                                            )}
                                            <div className="text-center px-4 py-2 bg-white rounded-lg shadow-sm">
                                                <div className="text-xs text-slate-500">Consultations</div>
                                                <div className="font-bold text-slate-800">{stats.total_consultations}</div>
                                            </div>
                                            <div className="text-center px-4 py-2 bg-white rounded-lg shadow-sm">
                                                <div className="text-xs text-slate-500">Factures</div>
                                                <div className="font-bold text-slate-800">{stats.total_invoices}</div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <Link to="/patient/consultations/new" className="col-span-1 bg-sky-50 hover:bg-sky-100 px-4 py-3 rounded-lg flex items-center gap-3 border border-sky-100">
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

                        {/* Historique des RDV */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-50">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <div className="text-xs text-slate-500">Historique des RDV</div>
                                    <div className="text-lg font-semibold">Derniers rendez-vous</div>
                                </div>
                                <Link to="/patient/appointments" className="text-sm text-slate-600 underline">Voir tout</Link>
                            </div>

                            <div className="space-y-3">
                                {isLoading ? (
                                    // Skeleton loader
                                    [...Array(3)].map((_, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white shadow-sm border border-slate-100 animate-pulse">
                                            <div className="w-1 h-16 rounded-l-full bg-slate-200" />
                                            <div className="shrink-0 w-14 h-14 rounded-full bg-slate-200" />
                                            <div className="flex flex-col gap-2 flex-1">
                                                <div className="h-4 bg-slate-200 rounded w-1/3" />
                                                <div className="h-3 bg-slate-200 rounded w-1/2" />
                                            </div>
                                            <div className="h-8 bg-slate-200 rounded w-24" />
                                        </div>
                                    ))
                                ) : pastAppointments.length > 0 ? (
                                    pastAppointments.map((p) => (
                                        <ConsultationCard key={p.id} consultation={p} />
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-slate-500">
                                        <p>Aucune consultation pour le moment</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Colonne sidebar droite */}
                    <aside className="space-y-4">
                        {isLoading ? (
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-50 animate-pulse">
                                <div className="space-y-3">
                                    <div className="h-3 bg-slate-200 rounded w-32" />
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-slate-200" />
                                        <div className="flex-1">
                                            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                                            <div className="h-3 bg-slate-200 rounded w-1/2" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : upcoming ? (
                            <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg border border-slate-100 transition">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Prochain Rendez-vous</div>
                                    <Link 
                                        to={`/patient/appointments/${upcoming.id}`} 
                                        className="text-xs text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1"
                                    >
                                        Détails
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>

                                <div className="flex items-start gap-3 mb-4">
                                    {/* Doctor avatar */}
                                    <div className="shrink-0">
                                        {upcoming.photo ? (
                                            <img 
                                                src={getImageUrl(upcoming.photo)} 
                                                alt={upcoming.doctor} 
                                                className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100" 
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center text-sm font-semibold text-sky-700 ring-2 ring-slate-100">
                                                {String((upcoming.doctor || "M").split(" ").map(s => s[0] || "").slice(0,2).join("")).toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    {/* Doctor info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold text-slate-900 truncate mb-0.5">
                                            {upcoming.doctor}
                                        </div>
                                        {upcoming.specialty && (
                                            <div className="text-xs text-slate-500 truncate">
                                                {upcoming.specialty}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Date and time info */}
                                <div className="space-y-2 pt-3 border-t border-slate-100">
                                    <div className="flex items-start gap-2">
                                        <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs text-slate-900 font-medium">
                                                {formatLongDate(new Date(upcoming.date))}
                                            </div>
                                            {(() => {
                                                const dateTime = new Date(`${upcoming.date}T${upcoming.time || '00:00'}`);
                                                const relativeTag = getRelativeTag(dateTime);
                                                return relativeTag && (
                                                    <div className="text-xs text-slate-500 mt-0.5">
                                                        {relativeTag}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                                        <span className="text-xs text-slate-900 font-medium">{upcoming.time}</span>
                                    </div>
                                </div>

                                {/* Status badge */}
                                <div className="mt-3 pt-3 border-t border-slate-100">
                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                                        upcoming.status?.toLowerCase() === 'termine' ? 'bg-emerald-50 text-emerald-700' :
                                        upcoming.status?.toLowerCase() === 'encours' ? 'bg-sky-50 text-sky-700' :
                                        upcoming.status?.toLowerCase() === 'annule' ? 'bg-rose-50 text-rose-700' :
                                        'bg-amber-50 text-amber-700'
                                    }`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${
                                            upcoming.status?.toLowerCase() === 'termine' ? 'bg-emerald-500' :
                                            upcoming.status?.toLowerCase() === 'encours' ? 'bg-sky-500' :
                                            upcoming.status?.toLowerCase() === 'annule' ? 'bg-rose-500' :
                                            'bg-amber-500'
                                        }`} />
                                        {upcoming.status?.toLowerCase() === 'termine' ? 'Terminé' :
                                         upcoming.status?.toLowerCase() === 'encours' ? 'En cours' :
                                         upcoming.status?.toLowerCase() === 'annule' ? 'Annulé' :
                                         'Confirmé'}
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        {/* Factures récentes */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-50">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Receipt className="w-4 h-4 text-green-600" />
                                    <div>
                                        <div className="text-xs text-slate-500">Factures</div>
                                        <div className="text-sm font-semibold">Dernières factures</div>
                                    </div>
                                </div>
                                <Link to="/patient/invoices" className="text-xs text-slate-600 hover:text-slate-900 underline">
                                    Toutes
                                </Link>
                            </div>

                            {isInvoicesLoading ? (
                                <div className="space-y-2">
                                    {[...Array(2)].map((_, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg animate-pulse">
                                            <div className="flex-1">
                                                <div className="h-3 bg-slate-200 rounded w-24 mb-2" />
                                                <div className="h-2 bg-slate-200 rounded w-32" />
                                            </div>
                                            <div className="h-8 bg-slate-200 rounded w-16" />
                                        </div>
                                    ))}
                                </div>
                            ) : invoices.length > 0 ? (
                                <div className="space-y-2">
                                    {invoices.map((invoice) => (
                                        <div
                                            key={invoice.id}
                                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <FileText className="w-3.5 h-3.5 text-green-600 shrink-0" />
                                                    <span className="font-medium text-xs text-slate-900 truncate">
                                                        {invoice.number}
                                                    </span>
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                            invoice.statusInvoice === "paid"
                                                                ? "bg-green-100 text-green-700"
                                                                : invoice.statusInvoice === "pending"
                                                                ? "bg-yellow-100 text-yellow-700"
                                                                : "bg-red-100 text-red-700"
                                                        }`}
                                                    >
                                                        {invoice.statusInvoice === "paid"
                                                            ? "Payée"
                                                            : invoice.statusInvoice === "pending"
                                                            ? "En attente"
                                                            : "Annulée"}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-slate-600">
                                                    {invoice.amount} {invoice.currency.toUpperCase()} •{" "}
                                                    {new Date(invoice.created_at).toLocaleDateString("fr-FR")}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDownloadInvoice(invoice)}
                                                disabled={generatingInvoiceId === invoice.id}
                                                className="flex items-center gap-1 px-2.5 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white text-xs font-medium rounded-md transition shrink-0"
                                            >
                                                {generatingInvoiceId === invoice.id ? (
                                                    <>
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                        <span>PDF...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Download className="w-3 h-3" />
                                                        <span>PDF</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-slate-500">
                                    <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                    <p className="text-xs">Aucune facture pour le moment</p>
                                </div>
                            )}
                        </div>

                        {/* Test AI */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-50">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-purple-600" />
                                    <div>
                                        <div className="text-xs text-slate-500">Test de symptômes (IA)</div>
                                        <div className="text-sm font-semibold">Estimez vos symptômes</div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-slate-500 mb-3">Ce test est indicatif et ne remplace pas un avis médical.</p>
                            
                            <Link 
                                to="/diagnostic"  
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-600 to-orange-600 hover:from-orange-700 hover:to-orange-800 text-white text-sm font-medium transition w-full"
                            >
                                <Activity className="w-4 h-4" />
                                Lancer le test
                            </Link>

                            {testResult && (
                                <div className="mt-3 bg-slate-50 p-3 rounded-md border">
                                    <div className="text-sm font-medium">Résultat probable</div>
                                    <div className="text-sm">{testResult.probable}</div>
                                    <div className="text-xs text-slate-500 mt-1">Conseil: {testResult.advice}</div>
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}