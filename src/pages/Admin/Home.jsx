// src/pages/admin/HomeAdmin.jsx
import {
  Users, UserCog, Settings, Building2,
  CreditCard, Receipt, BadgeDollarSign, Stethoscope,
  ScanHeart
} from 'lucide-react';
import { useClinic } from '../../context/clinicContext';
import { useAuth } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const tokens = {
  brand: (clinic) => ({
    primary: clinic?.theme?.primary || 'orange',
    secondary: clinic?.theme?.secondary || 'sky',
  }),
  ring: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-300',
  tile:
    'group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-100 ' +
    'transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ' +
    'active:translate-y-0',
  tileGlow:
    'pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 ' +
    'transition-opacity duration-200',
  iconWrap:
    'rounded-xl p-3 ring-1 ring-inset bg-slate-50 text-slate-700 ring-slate-200 ' +
    'transition-all duration-200 group-hover:scale-105',
  kpi:
    'bg-white rounded-2xl p-5 shadow-sm border border-slate-100 ' +
    'relative overflow-hidden',
  kpiBackdrop:
    'pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full opacity-10',
};

function StatCard({ label, value, tone = 'orange', icon: Icon, isLoading }) {
  if (isLoading) {
    return (
      <div className={tokens.kpi}>
        <div className={`${tokens.kpiBackdrop} bg-${tone}-400`} />
        <div className="flex items-center justify-between gap-4 animate-pulse">
          <div>
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="mt-2 h-8 w-24 rounded bg-slate-200" />
          </div>
          <div className={`p-3 rounded-xl bg-${tone}-50/70`}>
            <div className="h-6 w-6 rounded bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={tokens.kpi}>
      <div className={` ${tokens.kpiBackdrop} bg-${tone}-400`} />
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className={`p-3 rounded-xl bg-${tone}-50 text-${tone}-600`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function AdminTile({ title, desc, tone = 'orange', icon: Icon, onClick, aria }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={aria || title}
      className={`${tokens.tile} ${tokens.ring} cursor-pointer`}
    >
      {/* Glow gradient */}
      <span
        className={`${tokens.tileGlow}`}
        style={{
          background:
            'radial-gradient(120px 80px at 80% 0%, rgba(56,189,248,0.12), transparent 60%)',
        }}
      />
      <div className={`mb-4 ${tokens.iconWrap} text-${tone}-600 bg-${tone}-50/70 ring-${tone}-100 flex justify-left gap-5 items-center`}>
        <Icon size={20} />
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="flex items-start justify-between gap-2">
        <p className="mt-1 text-sm text-slate-500">{desc}</p>

        <span className="translate-x-0 opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100 text-slate-400">
          →
        </span>
      </div>
      {/* Bottom border on hover */}
      <span
        className={`absolute left-6 right-6 bottom-0 h-[2px] bg-gradient-to-r from-${tone}-400/0 via-${tone}-400/60 to-${tone}-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
      />
    </button>
  );
}

const HomeAdmin = () => {
  const { user } = useAuth();
  const { clinic } = useClinic();
  const navigate = useNavigate();
  const brand = tokens.brand(clinic);
  const [stats, setStats] = useState({});
  const [statsLoading, setStatsLoading] = useState(true);

  const stripeConnected =
    clinic?.billing?.stripe?.connected === true ||
    clinic?.stripeConnected === true;

    useEffect(() => {
      let mounted = true;
      if (!clinic) {
        setStats({});
        setStatsLoading(false);
        return;
      }

      const fetchStats = async () => {
        try {
          const res = await api.get('/api/clinics/my-stats/');
          if (!mounted) return;
          console.log('Fetched clinic stats', res.data);
          setStats(res.data);
        } catch (err) {
          console.error('Failed to fetch clinic stats', err);
          if (err.response?.data) {
            toast.error(`Erreur: ${err.response.data.message || 'Impossible de charger les statistiques'}`);
          } else {
            toast.error('Erreur: Impossible de charger les statistiques');
          }
        } finally {
          if (mounted) setStatsLoading(false);
        }
      };

      fetchStats();

      return () => {
        mounted = false;
      };
    }, [clinic]);

  

  return (
    <div className="min-h-[80dvh] bg-gradient-to-b from-slate-50 to-slate-100/40 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
              Tableau de bord — Administration
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Pilotez vos utilisateurs, votre clinique et la facturation.
            </p>
          </div>
          <div className="text-sm text-slate-600">
            Bonjour,&nbsp;
            <span className="font-medium text-slate-900">{user?.full_name}</span>
          </div>
        </header>

        {/* Stripe status / alerts */}
        <div
          className={`mb-8 rounded-xl border ${
            stripeConnected
              ? 'border-emerald-200 bg-emerald-50'
              : 'border-amber-200 bg-amber-50'
          } p-4 flex items-center justify-between gap-4`}
        >
          <div className="text-sm">
            {stripeConnected ? (
              <>
                <span className="font-medium text-emerald-900">Stripe connecté.</span>{' '}
                Vous pouvez encaisser les paiements et générer des factures.
              </>
            ) : (
              <>
                <span className="font-medium text-amber-900">Stripe non configuré.</span>{' '}
                Connectez votre compte pour activer les paiements en ligne et la facturation.
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => console.log('Configurer Stripe')}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium shadow-sm ${tokens.ring} ${
              stripeConnected
                ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                : `border-${brand.primary}-200 bg-${brand.primary}-600 text-white hover:bg-${brand.primary}-700`
            }`}
          >
            <CreditCard size={16} />
            {stripeConnected ? 'Gérer Stripe' : 'Connecter Stripe'}
          </button>
        </div>

        {/* KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard label="Réceptionnistes" value={stats?.total_receptionists} isLoading={statsLoading} tone="indigo" icon={UserCog} />
          <StatCard label="Médecins" value={stats?.total_doctors} isLoading={statsLoading} tone="orange" icon={Stethoscope} />
          <StatCard label="Patients" value={stats?.total_patients} isLoading={statsLoading} tone="sky" icon={Users} />
          <StatCard label="Clinique" value={clinic?.name || '—'} tone="amber" icon={Building2} />
        </section>

        {/* Actions: Utilisateurs & Clinique */}
        <section className="mb-10">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">
            Gestion des utilisateurs & de la clinique
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminTile
              title="Gérer réceptionnistes"
              desc="Les réceptionnistes ont accès à la prise de rendez-vous et aux dossiers patients."
              tone="indigo"
              icon={UserCog}
              onClick={() => navigate('/admin/receptionnistes')}
            />
            <AdminTile
              title="Gérer médecins"
              desc="Les médecins ont accès aux dossiers patients et à leur planning."
              tone="emerald"
              icon={Stethoscope}
              onClick={() => navigate('/admin/medecins')}
            />
            <AdminTile
              title="Gérer patients"
              desc="Consultez et modifiez les dossiers patients de la clinique."
              tone="sky"
              icon={Users}
              onClick={() => navigate('/admin/patients')}
            />
            <AdminTile
              title="Infos clinique"
              desc="Coordonnées, horaires, couleurs, images, etc."
              tone="amber"
              icon={Settings}
              onClick={() => navigate('/admin/clinique')}
            />
          </div>
        </section>

        {/* Actions: Offres & Facturation */}
        <section>
          <h2 className="text-sm font-semibold text-slate-700 mb-3">
            Services & Facturation
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminTile
              title="Services"
              desc="Créer, catégoriser et publier vos actes médicaux."
              tone={brand.secondary}
              icon={ScanHeart}
              onClick={() => navigate('/admin/services')}
            />
            <AdminTile
              title="Tarifs"
              desc="Grilles tarifaires, devis, et remises."
              tone={brand.primary}
              icon={BadgeDollarSign}
              onClick={() => navigate('/admin/tarifs')}
            />
            <AdminTile
              title="Paiements Stripe"
              desc="Encaissements, remboursements, rapprochements."
              tone="violet"
              icon={CreditCard}
              onClick={() => navigate('/admin/billing/stripe')}
            />
            <AdminTile
              title="Factures"
              desc="Liste, statut, export PDF/CSV et envoi email."
              tone="rose"
              icon={Receipt}
              onClick={() => navigate('/admin/factures')}
            />
          </div>
        </section>

        <footer className="mt-10 text-sm text-slate-500">
          <p>
            Astuce&nbsp;: utilisez la touche <kbd className="px-1.5 py-0.5 rounded border border-slate-300 bg-white text-slate-700">Tab</kbd> pour naviguer rapidement entre les tuiles.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default HomeAdmin;
