// src/pages/Landing.jsx
import { useState } from "react";
import { motion } from "motion/react";
import {
  CalendarDays,
  FileText,
  UsersRound,
  ShieldCheck,
  Sparkles,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  Quote,
  Star,
  GlobeLock,
  Building2,
  Brain,
} from "lucide-react";

/* ---------- Design Tokens pour tailwind ---------- */
const tokens = {
  bgPage: "bg-gradient-to-b from-sky-50 via-white to-white",
  textMain: "text-slate-800",
  textMuted: "text-slate-600",
  border: "border-slate-200",
  brand: {
    primaryBg: "bg-gradient-to-r from-sky-600 to-indigo-600",
    primaryHover: "hover:from-sky-500 hover:to-indigo-500",
    accentBg: "bg-orange-500",
    accentHover: "hover:bg-orange-600",
  },
  glass: "bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60",
};

function Section({ id, className = "", children }) {
  const reveal = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.section
      id={id}
      className={`mx-auto max-w-7xl px-6 py-16 ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      variants={reveal}
    >
      {children}
    </motion.section>
  );
}

function Badge({ children, color = "blue" }) {
  const map = {
    blue: "bg-sky-50 text-sky-800 border-sky-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    gray: "bg-slate-50 text-slate-700 border-slate-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${map[color]}`}
    >
      <Sparkles className="h-3.5 w-3.5" />
      {children}
    </span>
  );
}

function Button({
  children,
  variant = "primary",
  href = "#",
  className = "",
  iconRight,
}) {
  const variants = {
    primary: `${tokens.brand.primaryBg} ${tokens.brand.primaryHover} text-white shadow-sm`,
    outline:
      "border border-slate-300 bg-white hover:bg-slate-50 text-slate-800",
    ghost:
      "bg-transparent text-sky-800 hover:bg-sky-50 hover:text-sky-900 underline  underline-offset-4 decoration-2",
    accent: `${tokens.brand.accentBg} ${tokens.brand.accentHover} text-white shadow-sm`,
  };
  const Icon = iconRight;
  return (
    <a
      href={href}
      className={`group inline-flex items-center gap-2 rounded-xl px-5 py-3 transition ${variants[variant]} ${className}`}
    >
      {children}
      {Icon ? (
        <Icon className="h-4 w-4 transition group-hover:translate-x-0.5" />
      ) : null}
    </a>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <motion.div
      className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-orange-100 text-orange-700 ring-1 ring-orange-200">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{desc}</p>
      <div className="mt-3 text-sm text-sky-900/80 opacity-0 transition group-hover:opacity-100 underline decoration-2 underline-offset-4">
        En savoir plus
      </div>
    </motion.div>
  );
}

function StepItem({ number, title, desc }) {
  return (
    <div className="relative flex gap-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white ring-4 ring-orange-100">
        {number}
      </div>
      <div>
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm text-slate-600">{desc}</p>
      </div>
    </div>
  );
}

function TestimonialCard({ quote, author, role }) {
  return (
    <motion.div
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Quote className="mb-3 h-5 w-5 text-orange-600" />
      <p className="text-slate-700">{quote}</p>
      <div className="mt-4 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-sky-100 text-sky-800 font-semibold">
          {author?.[0]?.toUpperCase() ?? "U"}
        </div>
        <div>
          <div className="font-medium">{author}</div>
          <div className="text-xs text-slate-500">{role}</div>
        </div>
        <div className="ml-auto flex items-center gap-0.5 text-orange-500">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-orange-500" />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* Gestion des images avec fallback */
function ImageWithFallback({ srcs = [], alt = "", ratio = "16/9", className = "" }) {
  const [idx, setIdx] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const onError = () => (idx < srcs.length - 1 ? setIdx(idx + 1) : setFailed(true));
  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl border ${tokens.border} ${tokens.glass} ${className}`}
      style={{ aspectRatio: ratio }}
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {!failed ? (
        <>
          <img
            src={srcs[idx]}
            alt={alt}
            onLoad={() => setLoaded(true)}
            onError={onError}
            className={`h-full w-full object-cover transition-opacity duration-700 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
          />
          {!loaded && (
            <div className="absolute inset-0 animate-pulse bg-linear-to-r from-slate-100 via-slate-50 to-slate-100" />
          )}
        </>
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-slate-100">
              <Sparkles className="h-6 w-6 text-orange-500" />
            </div>
            <p className="text-sm text-slate-600">Image à venir</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function Landing() {
  return (
    <main className={`${tokens.bgPage} ${tokens.textMain}`}>
      {/* HERO */}
      <Section className="pt-24 md:pt-28">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <Badge color="blue">MedFlow — clinique moderne & sécurisée</Badge>
            <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              Gérez votre clinique,{" "}
              <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                simplement
              </span>{" "}
              et{" "}
              <span className="text-orange-600">efficacement</span>.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-slate-700">
              Rendez-vous, dossiers, facturation, portail patient. Interface claire,
              rapide et pensée pour le gain de temps. <strong>Gratuit pendant la bêta</strong>.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button href="/StartClinic" iconRight={ArrowRight}>
                Commencer gratuitement
              </Button>
              <Button href="/demo" variant="outline">
                Voir la démo
              </Button>
            </div>

            <div className="mt-4 flex items-center gap-3 text-sm text-slate-600">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Aucune carte requise • Annulation en un clic
            </div>
          </div>

          <ImageWithFallback
            srcs={[
              "../assets/reception.png"
            ]}
            alt="Aperçu MedFlow"
            ratio="4/3"
            className="shadow-[0_20px_60px_rgba(14,165,233,.18)]"
          />
        </div>
      </Section>

      {/* FEATURES */}
      <Section id="features" className="py-20">
        <h2 className="mb-10 text-center text-2xl font-semibold md:text-3xl">
          Toutes les <span className="bg-gradient-to-r from-sky-700 to-indigo-700 bg-clip-text text-transparent">fonctionnalités </span>
           qu'il vous faut en <span className="text-orange-600">un endroit</span>
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<CalendarDays className="h-5 w-5" />}
            title="Rendez-vous intelligents"
            desc="Planifie, rappelle et synchronise l’agenda en temps réel."
          />
          <FeatureCard
            icon={<FileText className="h-5 w-5" />}
            title="Dossiers médicaux"
            desc="Historique, diagnostics, ordonnances — bien organisés."
          />
          <FeatureCard
            icon={<UsersRound className="h-5 w-5" />}
            title="Gestion des patients"
            desc="Vue 360° : contacts, paiements, documents, notes."
          />
          <FeatureCard
            icon={<CreditCard className="h-5 w-5" />}
            title="Facturation claire"
            desc="Factures nettes, exports et suivi des règlements."
          />
          <FeatureCard
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Sécurité & conformité"
            desc="Chiffrement, rôles, journaux d’audit. Esprit clinique & sécurité."
          />
          {/* Remplacement : IA de pré-diagnostic */}
          <FeatureCard
            icon={<Brain className="h-5 w-5" />}
            title="Assistant IA de pré-diagnostic"
            desc="Les patients répondent à des questions guidées et reçoivent des pistes de maladies probables pour préparer la consultation."
          />
        </div>
      </Section>

      {/* Demos */}
      <Section id="demos">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold md:text-3xl">Démonstrations</h2>
          <a
            href="/docs"
            className="text-sm text-sky-900  hover:text-sky-700"
          >
            Voir la documentation
          </a>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <ImageWithFallback
            srcs={[
              "/assets/use-cases.png",
              "/assets/uml-usecases.png",
              "/assets/medflow-usecases.png",
            ]}
            alt="Diagramme de cas d’utilisation"
            ratio="16/10"
          />
            <ImageWithFallback
              srcs={["/assets/screen-dashboard-light.png", "/assets/screen-dashboard.png"]}
              alt="Tableau de bord"
              ratio="16/10"
            />
        </div>
      </Section>

      {/* ETAPES D’ONBOARDING */}
      <Section id="etapes" className="py-20">
        <h2 className="mb-8 text-center text-2xl font-semibold md:text-3xl">
          Démarrez en <span className="text-orange-600">4 étapes</span>
        </h2>

        <div className="grid gap-10 md:grid-cols-2">
          <div className="space-y-6">
            <StepItem
              number={1}
              title="Créez votre clinique"
              desc="Renseignez le nom, le logo et vos infos principales."
            />
            <StepItem
              number={2}
              title="Ajoutez vos équipes"
              desc="Créez les comptes Réceptionnistes, Médecins et Patients."
            />
            <StepItem
              number={3}
              title="Activez votre portail"
              desc="Portail unique aux couleurs de votre clinique."
            />
            <StepItem
              number={4}
              title="Sous-domaine dédié"
              desc="nom_clinique.medflow.tn pour une image pro."
            />
          </div>

          <div className="grid gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-sky-700" />
                <h3 className="font-semibold">Portail clinique</h3>
              </div>
              <p className="text-sm text-slate-600">
                Branding, pages d’info, inscription patient (optionnelle),
                RDV en ligne et facturation sécurisée.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Badge color="orange">nom_clinique.medflow.tn</Badge>
                <Badge color="gray">Logo & couleurs</Badge>
                <Badge color="blue">IA de pré-diagnostic</Badge>
              </div>
            </div>

            {/* <ImageWithFallback
              srcs={["/assets/portal-preview.png"]}
              alt="Portail Clinique"
              ratio="16/10"
            /> */}
          </div>
        </div>
      </Section>

      {/* AVIS / TESTIMONIALS */}
      <Section id="avis" className="py-20">
        <h2 className="mb-3 text-center text-2xl font-semibold md:text-3xl">
          Les 
          <span className="text-orange-600 bg-clip-text"> avis </span>
           de nos usagers
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-center text-slate-600">
          Des praticiens et équipes d’accueil nous font confiance au quotidien.
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          <TestimonialCard
            quote="On a réduit de 40% les appels entrants grâce au portail patient. L’agenda est beaucoup plus fluide."
            author="Dorra B."
            role="Réceptionniste — Clinique Azur"
          />
          <TestimonialCard
            quote="L’assistant IA prépare la consultation : on gagne du temps et le diagnostic est mieux cadré."
            author="Dr. Walid K."
            role="Dermatologue"
          />
          <TestimonialCard
            quote="La mise en place a pris 15 minutes, et nos patients adorent l’inscription en ligne."
            author="Nejia S."
            role="Gestionnaire — Centre Médical Horizon"
          />
        </div>
      </Section>

      {/* TARIFS (glass clair) */}
      <Section id="tarifs" className="pb-20">
        <h2 className="mb-8 text-center text-2xl font-semibold md:text-3xl">Tarifs</h2>
        <div className="mx-auto max-w-3xl">
          <div className={`relative rounded-3xl border ${tokens.border} ${tokens.glass} p-8 shadow-sm transition hover:shadow-md`}>
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <Badge color="orange">Période de test — en développement</Badge>
              <Badge color="blue">Accès complet</Badge>
            </div>

            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div>
                <h3 className="text-xl font-semibold">MedFlow Beta</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Gratuit pour le moment. Vous serez averti avant tout changement.
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold leading-none">
                  <span className="bg-gradient-to-r from-sky-700 to-indigo-700 bg-clip-text text-transparent">
                    0 TND
                  </span>
                </div>
                <div className="mt-1 text-xs text-slate-500">Bêta publique</div>
              </div>
            </div>

            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {[
                "Rendez-vous illimités",
                "Portail clinique & sous-domaine",
                "Assistant IA de pré-diagnostic",
                "Multi-rôles & permissions",
              ].map((li) => (
                <li key={li} className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  {li}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button href="/StartClinic" variant="accent" iconRight={ArrowRight}>
                Créer mon compte
              </Button>
              <span className="text-sm text-slate-600">
                <strong>Offre bêta :</strong> gratuit jusqu’au lancement officiel.
              </span>
            </div>
          </div>
        </div>
      </Section>

      {/* CTA (refonte esthétique – plus premium) */}
      <Section className="pb-28">
        <div className="relative grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:grid-cols-2">
          {/* bloc gauche */}
          <div className="p-8 md:p-10">
            <h3 className="text-2xl font-semibold md:text-3xl">
              Rejoignez la bêta et gagnez du temps
            </h3>
            <p className="mt-2 max-w-xl text-slate-700">
              Une interface moderne, un portail patient brandé et un assistant IA
              qui prépare la consultation. Essayez maintenant — c’est gratuit.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/StartClinic" iconRight={ArrowRight}>
                Démarrer maintenant
              </Button>
              <Button href="/security" variant="ghost">
                <GlobeLock className="mr-1 h-4 w-4" />
                Sécurité & conformité
              </Button>
            </div>
          </div>

          {/* bloc visuel droite */}
          <div className="relative">
            <div
              aria-hidden
              className="absolute inset-0 bg-linear-to-br from-white to-sky-200"
            />
            <ImageWithFallback
              srcs={["/assets/cta-visual.png", "/assets/hero-medflow-light.png"]}
              alt="Aperçu MedFlow clair"
              ratio="16/10"
              className="m-6 md:m-8"
            />
          </div>
        </div>
      </Section>
    </main>
  );
}

