import React, { useEffect, useState } from "react";
import { getSymptomsFor, searchSymptoms, getSymptomById } from "./Symptome";
import { getZoneKeyForPart, getPartName, getZoneName } from "./BodyZone";

const GENERAL_KEY = "general";

function SuggestionsList({ items, onSelect }) {
  if (!items || items.length === 0) return (
    <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-sm z-50 p-2 text-xs text-slate-500">Aucun résultat</div>
  );
  return (
    <ul className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-sm z-50 max-h-48 overflow-auto">
      {items.map((s) => (
        <li
          key={s.id}
          onMouseDown={(e) => { e.preventDefault(); onSelect(s); }}
          className="px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm"
        >
          {s.label}
        </li>
      ))}
    </ul>
  );
}

export default function SymptomPanel({
  selectedParts,
  activePart,
  partsMeta,
  selectedSymptomsByPart,
  setActivePart,
  handleAddSymptomToPart,
  handleRemoveSymptomFromPart,
  handleSetIntensity,
}) {
  const [viewKey, setViewKey] = useState(activePart || GENERAL_KEY);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    // sync viewKey when activePart changes outside
    setViewKey(activePart || GENERAL_KEY);
  }, [activePart]);

  const currentLabel = viewKey === GENERAL_KEY ? "Général" : (partsMeta[viewKey]?.name || viewKey);

  const handleSearch = (q) => {
    setQuery(q);
    const zoneKey = viewKey === GENERAL_KEY ? null : getZoneKeyForPart(viewKey);
    const results = searchSymptoms(q, viewKey === GENERAL_KEY ? null : viewKey, zoneKey, 8);
    setSuggestions(results.filter((r) => !(selectedSymptomsByPart[viewKey] || []).some((s) => s.id === r.id)));
  };

  const onSelectSuggestion = (sym) => {
    const full = getSymptomById(sym.id) || sym;
    handleAddSymptomToPart(viewKey, { id: full.id, label: full.label });
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const selectedList = selectedSymptomsByPart[viewKey] || [];

  return (
    <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/60 p-4 lg:p-6 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-slate-900">Symptômes</h2>
        <div className="text-sm text-slate-500">{Object.values(selectedSymptomsByPart).flat().length} total</div>
      </div>

      {/* Always-visible general symptoms summary */}
      { (selectedSymptomsByPart[GENERAL_KEY] || []).length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {(selectedSymptomsByPart[GENERAL_KEY] || []).map((g) => (
            <div key={g.id} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-sm">
              <span className="font-medium">{g.label}</span>
              <button onClick={() => handleRemoveSymptomFromPart(GENERAL_KEY, g.id)} className="text-rose-600 text-xs">×</button>
            </div>
          ))}
        </div>
      )}

      {/* Part selector chips (including Générale) */}
      <div className="flex gap-2 flex-wrap mb-3">
        <button
          onClick={() => { setViewKey(GENERAL_KEY); setActivePart(null); }}
          className={`px-3 py-1 rounded-full text-sm font-medium ${viewKey===GENERAL_KEY? 'bg-sky-600 text-white':'bg-slate-50 text-slate-700'}`}
        >
          Général
        </button>
        {selectedParts.map((p) => (
          <button
            key={p}
            onClick={() => { setViewKey(p); setActivePart(p); }}
            className={`px-3 py-1 rounded-full text-sm font-medium ${viewKey===p? 'bg-sky-600 text-white':'bg-slate-50 text-slate-700'}`}
          >
            {getPartName(p)}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <div className="relative">
          <input
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-sky-300"
            placeholder={`Rechercher (${currentLabel})`}
            value={query}
            onFocus={() => { setShowSuggestions(true); handleSearch(query); }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {showSuggestions && <SuggestionsList items={suggestions} onSelect={onSelectSuggestion} />}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {selectedList.length === 0 ? (
          <div className="text-xs text-slate-400">Aucun symptôme ajouté.</div>
        ) : (
          <div className="space-y-2">
            {selectedList.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 p-2 rounded-lg border border-slate-100">
                <div className="font-medium text-slate-900">{s.label}</div>
                <div className="flex items-center gap-2">
                  <input type="range" min="1" max="10" value={s.intensity} onChange={(e) => handleSetIntensity(viewKey, s.id, Number(e.target.value))} className="w-36" />
                  <button onClick={() => handleRemoveSymptomFromPart(viewKey, s.id)} className="px-2 py-1 rounded-md bg-rose-50 text-rose-700 text-xs border border-rose-100">Suppr</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
