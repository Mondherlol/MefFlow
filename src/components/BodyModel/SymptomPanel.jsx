import { useState, useEffect, useRef } from "react";
import { Search, Plus, X, Activity, Info, Thermometer, AlertTriangle, ChevronRight } from "lucide-react";
import * as Slider from "@radix-ui/react-slider"; // Le slider pro
import { motion, AnimatePresence } from "framer-motion"; // Pour l'animation fluide
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { searchSymptoms, getSymptomsForPart } from "./SymptomData";
import { getPartName } from "./BodyZone";

// Utilitaire pour fusionner les classes proprement
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Échelle de douleur (Couleurs vives thème clair)
const PAIN_LEVELS = [
  { label: "Léger", emoji: "🙂", color: "bg-emerald-400", text: "text-emerald-600", gradient: "from-emerald-300 to-emerald-500" },
  { label: "Gênant", emoji: "😐", color: "bg-sky-400", text: "text-sky-600", gradient: "from-sky-300 to-sky-500" },
  { label: "Douloureux", emoji: "😟", color: "bg-amber-400", text: "text-amber-600", gradient: "from-amber-300 to-amber-500" },
  { label: "Intense", emoji: "😣", color: "bg-orange-500", text: "text-orange-600", gradient: "from-orange-400 to-orange-600" },
  { label: "Insupportable", emoji: "🥵", color: "bg-red-600", text: "text-red-600", gradient: "from-red-500 to-red-700" },
];

const getPainInfo = (level) => {
  const idx = Math.ceil(level / 2) - 1;
  return PAIN_LEVELS[Math.max(0, Math.min(idx, 4))];
};

// --- SOUS-COMPOSANT : SLIDER AVEC ANIMATION ---
const PainSlider = ({ value, onChange, painInfo }) => {
  return (
    <div className="w-full">
      {/* Zone Emoji Animé */}
      <div className="flex justify-between items-end mb-3">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Intensité</label>
        <div className="flex flex-col items-end">
           {/* L'émoji est gros (text-4xl) et animé avec Framer Motion */}
           <AnimatePresence mode="wait">
            <motion.div
              key={painInfo.label} // Change l'animation quand le label change
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="text-4xl drop-shadow-md mb-1 origin-bottom"
            >
               {/* Petit tremblement si la douleur est haute (>6) */}
               <motion.div
                 animate={value > 6 ? { x: [-1, 1, -1, 1, 0] } : {}}
                 transition={{ repeat: Infinity, duration: 0.5, repeatDelay: 1 }}
               >
                 {painInfo.emoji}
               </motion.div>
            </motion.div>
           </AnimatePresence>
           <span className={`text-xs font-bold ${painInfo.text} transition-colors duration-300`}>
             {painInfo.label} ({value}/10)
           </span>
        </div>
      </div>

      {/* Le Slider Radix UI */}
      <Slider.Root
        className="relative flex items-center select-none touch-none w-full h-5"
        value={[value]}
        max={10}
        min={1}
        step={1}
        onValueChange={(val) => onChange(val[0])}
      >
        <Slider.Track className="bg-slate-200 relative grow rounded-full h-2 overflow-hidden">
          <Slider.Range className={`absolute h-full rounded-full bg-gradient-to-r ${painInfo.gradient} transition-all duration-300`} />
        </Slider.Track>
        <Slider.Thumb
          className={`block w-6 h-6 bg-white border-2 border-slate-100 shadow-[0_2px_10px] shadow-black/10 rounded-full hover:scale-110 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 transition-transform ${painInfo.text.replace('text-', 'border-')}`}
          aria-label="Intensité"
        />
      </Slider.Root>
    </div>
  );
};

export default function SymptomPanel({
  activePart,
  selectedParts,
  onSelectPart,
  selectedSymptoms,
  onAddSymptom,
  onRemoveSymptom,
  onUpdateIntensity,
  onAnalyze
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (query.length > 1) {
      const res = searchSymptoms(query);
      setResults(res.filter(r => !selectedSymptoms.find(s => s.id === r.id)));
      setIsSearching(true);
    } else {
      setResults([]);
      setIsSearching(false);
    }
  }, [query, selectedSymptoms]);

  const contextualSuggestions = activePart 
    ? getSymptomsForPart(activePart).filter(s => !selectedSymptoms.find(sel => sel.id === s.id))
    : [];

  const handleSelect = (symptom) => {
    onAddSymptom(symptom);
    setQuery("");
    setIsSearching(false);
  };

  return (
    <div className="flex flex-col h-full max-h-full bg-white/95 backdrop-blur-2xl border border-sky-100 rounded-3xl shadow-2xl shadow-sky-200/30 overflow-hidden ring-1 ring-white/50">
      
      {/* --- HEADER --- */}
      <div className="flex-none p-5 bg-gradient-to-b from-white to-sky-50/30 border-b border-sky-100 z-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <div className="p-1.5 bg-sky-100 rounded-lg">
               <Activity className="w-5 h-5 text-sky-600" />
            </div>
            Symptômes
          </h2>
          <span className="text-xs font-bold px-2.5 py-1 bg-sky-50 text-sky-600 rounded-full border border-sky-100">
            {selectedSymptoms.length} ajouté(s)
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
          <input
            ref={inputRef}
            type="text"
            className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all text-sm shadow-sm"
            placeholder="Rechercher (ex: brûlure...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {isSearching && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl border border-slate-100 shadow-xl z-50 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
              {results.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelect(s)}
                  className="w-full text-left px-4 py-3 text-sm text-slate-600 hover:bg-sky-50 hover:text-sky-700 flex items-center justify-between border-b border-slate-50 last:border-0"
                >
                  {s.label} <Plus className="w-4 h-4 text-sky-400" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* TABS */}
        {selectedParts && selectedParts.length > 0 && (
           <div className="mt-4 -mb-5 pb-2 overflow-x-auto flex gap-2 no-scrollbar mask-fade-right">
              {selectedParts.map(part => (
                  <button
                    key={part}
                    onClick={() => onSelectPart(part)}
                    className={`
                        whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border
                        ${activePart === part 
                            ? "bg-sky-500 text-white border-sky-600 shadow-md shadow-sky-500/20" 
                            : "bg-white text-slate-500 border-slate-200 hover:border-sky-300 hover:text-sky-600"}
                    `}
                  >
                    {getPartName(part)}
                  </button>
              ))}
           </div>
        )}
      </div>

      {/* --- CORPS --- */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-slate-50/50">
        
        {/* Suggestions (Scroll Horizontal) */}
        {activePart && contextualSuggestions.length > 0 && (
          <div className="animate-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Info className="w-3 h-3" />
                    Suggéré ({getPartName(activePart)})
                </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {contextualSuggestions.map(s => (
                <button
                  key={s.id}
                  onClick={() => onAddSymptom(s)}
                  className="flex-none group inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-sky-400 hover:text-sky-600 hover:shadow-md transition-all active:scale-95"
                >
                  <Plus className="w-3 h-3 text-slate-300 group-hover:text-sky-500" />
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Cartes Symptômes */}
        {selectedSymptoms.length > 0 ? (
          <div className="space-y-4 pb-4">
            {selectedSymptoms.map((s) => {
                const painInfo = getPainInfo(s.intensity);
                return (
                    <motion.div 
                        key={s.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:shadow-sky-100/50 transition-all duration-300 overflow-hidden"
                    >
                        {/* Barre latérale "Flush" */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${painInfo.color} transition-colors duration-500`} />

                        <div className="pl-5 p-4">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-bold text-slate-800 text-base">{s.label}</h4>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                        {s.partId ? getPartName(s.partId) : "Général"}
                                    </span>
                                </div>
                                <button 
                                    onClick={() => onRemoveSymptom(s.id)}
                                    className="text-slate-300 hover:bg-red-50 hover:text-red-500 p-1.5 rounded-full transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* LE NOUVEAU SLIDER EST ICI */}
                            <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100/80">
                                <PainSlider 
                                    value={s.intensity} 
                                    painInfo={painInfo}
                                    onChange={(val) => onUpdateIntensity(s.id, val)} 
                                />
                            </div>
                        </div>
                    </motion.div>
                );
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 opacity-60 mt-8">
             <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <Thermometer className="w-8 h-8 text-sky-300" />
             </div>
             <p className="text-slate-500 font-medium">Aucun symptôme listé.</p>
          </div>
        )}
      </div>

      {/* --- FOOTER --- */}
      <div className="flex-none p-5 border-t border-slate-100 bg-white z-20">
        <button
          onClick={onAnalyze}
          disabled={selectedSymptoms.length === 0}
          className={`
            w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-sm tracking-wide shadow-xl transition-all transform active:scale-[0.98]
            ${selectedSymptoms.length > 0
              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 cursor-pointer"
              : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
            }
          `}
        >
          {selectedSymptoms.length > 0 ? <Activity className="w-5 h-5 animate-pulse" /> : <AlertTriangle className="w-5 h-5" />}
          {selectedSymptoms.length > 0 ? "LANCER L'ANALYSE" : "AJOUTEZ DES SYMPTÔMES"}
        </button>
      </div>
    </div>
  );
}