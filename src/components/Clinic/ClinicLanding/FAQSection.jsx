// src/components/clinic/sections/FAQSection.jsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import { ChevronDown, HelpCircle, Mail, X } from "lucide-react";


// Convertit #RRGGBB vers rgba(r,g,b,a)
function withAlpha(hex, a = 1) {
  if (!hex || hex[0] !== "#") return `rgba(0,0,0,${a})`;
  const h = hex.length === 4
    ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
    : hex;
  const r = parseInt(h.slice(1, 3), 16);
  const g = parseInt(h.slice(3, 5), 16);
  const b = parseInt(h.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function normalizeItem(item) {
  return {
    q: item.q ?? item.question ?? "",
    a: item.a ?? item.reponse ?? "",
  };
}

function AccordionItem({ idx, item, isOpen, onToggle, primary }) {
  const { q, a } = normalizeItem(item);
  const panelRef = useRef(null);
  const [maxH, setMaxH] = useState("0px");

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    if (isOpen) setMaxH(`${el.scrollHeight}px`);
    else setMaxH("0px");
  }, [isOpen]);

  const buttonId = `faq-button-${idx}`;
  const contentId = `faq-panel-${idx}`;

  return (
    <div
      className="group bg-white/70 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
      itemScope
      itemProp="mainEntity"
      itemType="https://schema.org/Question"
    >
      <button
        id={buttonId}
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => onToggle(idx)}
        className="w-full flex items-center gap-4 p-4 md:p-5 text-left focus:outline-none focus-visible:ring-2 rounded-2xl"
        style={{ boxShadow: isOpen ? `0 0 0 2px ${withAlpha(primary, 0.25)}` : undefined }}
      >
        <span
          className="mt-1 p-2 rounded-lg"
          style={{ backgroundColor: withAlpha(primary, 0.12), color: primary }}
        >
          <HelpCircle className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold text-slate-900" itemProp="name">
              {q}
            </h3>
            <ChevronDown
              className={`h-5 w-5 text-slate-600 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </div>
        </div>
      </button>

      <div
        id={contentId}
        role="region"
        aria-labelledby={buttonId}
        aria-hidden={!isOpen}
        ref={panelRef}
        style={{ maxHeight: maxH }}
        className={`overflow-hidden transition-[max-height] duration-300 ease-[cubic-bezier(.2,.8,.2,1)] ${isOpen ? "px-5 pb-4" : "px-5 py-0"}`}
        itemScope
        itemProp="acceptedAnswer"
        itemType="https://schema.org/Answer"
      >

        <p className="text-slate-700 pt-4 leading-relaxed" itemProp="text">
          {a}
        </p>
      </div>
    </div>
  );
}

export default function FAQSection({ clinic , theme}) {
  const primary = theme?.primary || "#0ea5e9";
  const secondary = theme?.secondary || "#1e293b";

  const faqs = useMemo(() => {
    const list = Array.isArray(clinic?.faq) ? clinic.faq : [];
    return list.length ? list : [];
  }, [clinic]);

  const [openIndex, setOpenIndex] = useState(0);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return faqs;
    const ql = query.toLowerCase();
    return faqs.filter((f) => {
      const { q, a } = normalizeItem(f);
      return (q || "").toLowerCase().includes(ql) || (a || "").toLowerCase().includes(ql);
    });
  }, [faqs, query]);

  function toggleIndex(idx) {
    setOpenIndex((cur) => (cur === idx ? -1 : idx));
  }

  return (
    <section
      id="faq"
      className="py-16"
      style={{
        background: `linear-gradient(180deg, ${withAlpha(primary, 0.03)}, transparent 60%)`,
      }}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2" itemScope itemType="https://schema.org/FAQPage">
            <h2
              className="text-3xl md:text-4xl font-extrabold mb-2"
              style={{ color: secondary }}
            >
              FAQ — Questions fréquentes
            </h2>
            <p className="text-slate-600 mb-6">
              Retrouvez ici les réponses aux questions les plus courantes. Recherchez une question ou parcourez les rubriques.
            </p>

            {/* Barre de recherche */}
            <div className="mb-6">
              <label htmlFor="faq-search" className="sr-only">Rechercher dans la FAQ</label>
              <div
                className="flex items-center gap-2 rounded-xl border shadow-sm px-3 py-2 bg-white"
                style={{ borderColor: withAlpha(primary, 0.25) }}
              >
                <input
                  id="faq-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher (ex. rendez-vous, urgences, documents)"
                  className="flex-1 bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="p-1 rounded-md"
                    aria-label="Effacer"
                    style={{ color: withAlpha(secondary, 0.7) }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                ) : null}
              </div>
            </div>

            {/* Liste FAQ */}
            <div className="space-y-3">
              {filtered.length ? (
                filtered.map((item, idx) => (
                  <AccordionItem
                    key={idx}
                    idx={idx}
                    item={item}
                    isOpen={openIndex === idx}
                    onToggle={toggleIndex}
                    primary={primary}
                  />
                ))
              ) : 
              clinic?.faq?.length > 0 && <p className="text-slate-600">Aucune question trouvée pour « {query} ».</p>
              }
            </div>

            {!clinic?.faq?.length && (
              <p className="text-sm text-slate-500 mt-6">
                Aucune question FAQ n'a été ajoutée pour le moment.
              </p>
            )}
          </div>

          {/* Carte contact sans horaires */}
          <aside className="lg:col-span-1">
            <div
              className="sticky top-24 rounded-2xl border p-6 shadow-md"
              style={{
                background: `linear-gradient(135deg, ${withAlpha(primary, 0.08)}, #ffffff 70%)`,
                borderColor: withAlpha(primary, 0.25),
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="p-2 rounded-md"
                  style={{ backgroundColor: withAlpha(primary, 0.15), color: primary }}
                >
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-700">Besoin d'aide personnalisée ?</p>
                  <p className="font-semibold" style={{ color: secondary }}>
                    Contactez la clinique
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-600 mb-4">
                Si votre question n'apparaît pas ici, écrivez-nous ou appelez l'accueil pour une réponse rapide.
              </p>

              <a
                href="#contact"
                className="inline-flex items-center justify-center w-full px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-colors"
                style={{ backgroundColor: primary }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = withAlpha(primary, 0.9))}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = primary)}
              >
                Contacter
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
