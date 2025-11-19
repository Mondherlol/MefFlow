import { useState, useEffect, useRef } from "react";
import { Search, Plus, X, Activity, Info, Thermometer, AlertTriangle } from "lucide-react";
import * as Slider from "@radix-ui/react-slider";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { searchSymptoms, getSymptomsForPart } from "./SymptomData";
import { getPartName } from "./BodyZone";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- CONFIGURATION DE LA DOULEUR ---
const PAIN_LEVELS = [
  { label: "Léger", emoji: "🙂", color: "bg-emerald-400", text: "text-emerald-600", gradient: "from-emerald-300 to-emerald-500", shadow: "shadow-emerald-200" },
  { label: "Gênant", emoji: "😐", color: "bg-sky-400", text: "text-sky-600", gradient: "from-sky-300 to-sky-500", shadow: "shadow-sky-200" },
  { label: "Douloureux", emoji: "😟", color: "bg-amber-400", text: "text-amber-600", gradient: "from-amber-300 to-amber-500", shadow: "shadow-amber-200" },
  { label: "Intense", emoji: "😣", color: "bg-orange-500", text: "text-orange-600", gradient: "from-orange-400 to-orange-600", shadow: "shadow-orange-200" },
  { label: "Insupportable", emoji: "😫", color: "bg-red-600", text: "text-red-600", gradient: "from-red-500 to-red-700", shadow: "shadow-red-200" },
  { label: "Extrême", emoji: "💀", color: "bg-purple-700", text: "text-purple-700", gradient: "from-purple-600 to-purple-800", shadow: "shadow-purple-200" },
];

const getPainInfo = (level) => {
  // Map 1-2 -> 0, 3-4 -> 1, 5-6 -> 2, 7-8 -> 3, 9 -> 4, 10 -> 5
  let idx;
  if (level === 10) {
    idx = PAIN_LEVELS.length - 1; // ensure 10 maps to the last (Extrême)
  } else {
    idx = Math.ceil(level / 2) - 1;
  }
  return PAIN_LEVELS[Math.max(0, Math.min(idx, PAIN_LEVELS.length - 1))];
};

// --- NOUVEAU COMPOSANT CARD COMPACT ---
const SymptomCard = ({ symptom, onRemove, onUpdateIntensity }) => {
  const painInfo = getPainInfo(symptom.intensity);

  return (
    <motion.div
      layout // Permet une réorganisation fluide de la liste quand on supprime un item
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
    >
      {/* Barre latérale de couleur (plus fine) */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${painInfo.color} transition-colors duration-500`} />

      <div className="pl-4 pr-4 pt-3 pb-2">
        {/* LIGNE 1: Titre + Bouton Supprimer */}
        <div className="flex justify-between items-start mb-1">
          <h4 className="font-bold text-slate-800 text-sm leading-tight pr-2">
            {symptom.label}
          </h4>
          <button
            onClick={() => onRemove(symptom.id)}
            className="text-slate-300 hover:bg-red-50 hover:text-red-500 p-1 -mr-2 -mt-1 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* LIGNE 2: Infos Compactes (Corps + Emoji + Intensité) */}
        <div className="flex items-center justify-between mb-3">
          {/* Zone du corps */}
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
            {symptom.partId ? getPartName(symptom.partId) : "Général"}
          </span>

          {/* Zone Emoji + Label (Aligné à droite) */}
          <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-2 py-1 border border-slate-100">
            {/* Container relatif pour superposer les émojis lors de l'animation */}
            <div className="relative w-5 h-5 flex items-center justify-center">
              <AnimatePresence>
                <motion.div
                  key={painInfo.label} // Clé unique pour déclencher l'anim
                  initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 1.5, filter: "blur(4px)" }} // Fade out smooth
                  transition={{ duration: 0.3, ease: "backOut" }}
                  className="absolute text-lg leading-none origin-center"
                >
                  {painInfo.emoji}
                </motion.div>
              </AnimatePresence>
            </div>
            
            <span className={`text-xs font-bold ${painInfo.text} transition-colors duration-300 w-fit text-right`}>
              {painInfo.label} <span className="text-slate-400 text-[10px]">({symptom.intensity}/10)</span>
            </span>
          </div>
        </div>

        {/* LIGNE 3: Slider (Full width sans boite) */}
        <div className="relative w-full h-6 flex items-center touch-none select-none">
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5"
            value={[symptom.intensity]}
            max={10}
            min={1}
            step={1}
            onValueChange={(val) => onUpdateIntensity(symptom.id, val[0])}
          >
            <Slider.Track className="bg-slate-100 relative grow rounded-full h-1.5 overflow-hidden">
              <Slider.Range className={`absolute h-full rounded-full bg-gradient-to-r ${painInfo.gradient} transition-all duration-300`} />
            </Slider.Track>
            <Slider.Thumb
              className={`block w-5 h-5 bg-white border border-slate-200 shadow-sm rounded-full hover:scale-110 focus:outline-none focus:ring-2 focus:ring-sky-400/50 transition-transform ${painInfo.text.replace('text-', 'border-')}`}
              aria-label="Intensité"
            />
          </Slider.Root>
        </div>
      </div>
    </motion.div>
  );
};

// --- MAIN COMPONENT ---
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
      <div className="flex-none p-5 bg-linear-to-b from-white to-sky-50/30 border-b border-sky-100 z-20">
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
      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar bg-slate-50/50">
        
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

        {/* LISTE DES CARTES */}
        <div className="space-y-3 pb-4">
           <AnimatePresence mode="popLayout"> 
            {selectedSymptoms.length > 0 ? (
              selectedSymptoms.map((s) => (
                <SymptomCard 
                  key={s.id} 
                  symptom={s} 
                  onRemove={onRemoveSymptom} 
                  onUpdateIntensity={onUpdateIntensity} 
                />
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-4 opacity-60 mt-8"
              >
                 <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mb-3 animate-pulse">
                    <Thermometer className="w-6 h-6 text-sky-300" />
                 </div>
                 <p className="text-slate-500 font-medium text-sm">Aucun symptôme listé.</p>
              </motion.div>
            )}
           </AnimatePresence>
        </div>
      </div>

      {/* --- FOOTER --- */}
      <div className="flex-none p-4 border-t border-slate-100 bg-white z-20">
        <button
          onClick={onAnalyze}
          disabled={selectedSymptoms.length === 0}
          className={`
            w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-bold text-sm tracking-wide shadow-xl transition-all transform active:scale-[0.98]
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