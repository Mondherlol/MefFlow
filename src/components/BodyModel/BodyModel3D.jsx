// src/components/BodyModel3D.jsx
import { useState, useRef, useMemo, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import {
  RotateCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Crosshair,
} from "lucide-react";
import { BODY_ZONES, PARTS_NAMES, getPartName, getZoneKeyForPart, getZoneName } from "./BodyZone";
import FBXHuman from "./FBXHuman";
import CustomOrbitControls from "./CustomOrbitControl"; // pour le contrôle de la caméra

import ControlPanel from "./ControlPanel";
import { SYMPTOM_LIST, getSymptomsFor, SYMPTOM_MAP, searchSymptoms } from "./Symptome";
import SymptomPanel from "./SymptomPanel";

// Helper local: get zone label for a part
function getZoneLabelForPart(partName) {
  const key = getZoneKeyForPart(partName);
  return getZoneName(key) ?? BODY_ZONES.other.label;
}

// Small suggestions dropdown component for autocomplete
function SuggestionsList({ query, activePart, onSelect, selectedIds = [] }) {
  const zoneKey = activePart ? getZoneKeyForPart(activePart) : null;
  // prefer searchSymptoms for better behavior (includes ALL when no part)
  const pool = (typeof searchSymptoms === "function") ? searchSymptoms(query, activePart, zoneKey, 8) : getSymptomsFor(activePart, zoneKey);
  const candidates = (pool || []).filter((s) => !selectedIds.includes(s.id)).slice(0, 8);

  if (!candidates || candidates.length === 0)
    return (
      <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-sm z-50 p-2 text-xs text-slate-500">Aucun résultat</div>
    );

  return (
    <ul className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-sm z-50 max-h-48 overflow-auto">
      {candidates.map((s) => (
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



/**
 * Composant principal
 */
export default function BodyModel3D() {
  const [selectedParts, setSelectedParts] = useState([]);
  const [activePart, setActivePart] = useState(null);
  const [selectedSymptomsByPart, setSelectedSymptomsByPart] = useState({});
  const [partsMeta, setPartsMeta] = useState({});
  // search state moved inside SymptomPanel
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    part: null,
  });

  const containerRef = useRef();
  const controlsRef = useRef();

  const totalSymptoms = useMemo(
    () =>
      Object.values(selectedSymptomsByPart || {}).reduce((acc, arr) => acc + (arr?.length || 0), 0),
    [selectedSymptomsByPart]
  );

  const handleBodyPartClick = (part) => {
    setSelectedParts((prev) => {
      if (prev.includes(part)) {
        const next = prev.filter((p) => p !== part);
        if (activePart === part) {
          setActivePart(next[0] || null);
        }
        return next;
      }
      setActivePart(part);
      return [...prev, part];
    });
  };

  const clearSelection = () => {
    setSelectedParts([]);
    setActivePart(null);
    setSelectedSymptomsByPart({});
  };

  // tooltip handlers
  const handlePartPointerOver = (e, part) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({
      visible: true,
      x: e.clientX - rect.left + 12,
      y: e.clientY - rect.top + 12,
      part,
    });
  };

  const handlePartPointerMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip((t) => ({
      ...t,
      x: e.clientX - rect.left + 30,
      y: e.clientY - rect.top - 25,
    }));
  };

  const handlePartPointerOut = () => {
    setTooltip({ visible: false, x: 0, y: 0, part: null });
  };

  // enrichir les métadonnées au survol
  const ensurePartMeta = (name) => {
    setPartsMeta((meta) => {
      if (meta[name]) return meta;
      const display = getPartName(name) || name.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim();
      const zoneLabel = getZoneLabelForPart(name);
      return {
        ...meta,
        [name]: {
          name: display || name,
          zoneLabel,
        },
      };
    });
  };

  // gestion des chips symptômes
  // NEW: selectedSymptomsByPart shape: { [partId]: [ {id,label,intensity} ] }
  const handleAddSymptomToPart = (part, symptomObj) => {
    setSelectedSymptomsByPart((prev) => {
      const current = prev[part] || [];
      if (current.find((s) => s.id === symptomObj.id)) return prev; // already added
      const next = { ...prev, [part]: [...current, { ...symptomObj, intensity: 5 }] };
      return next;
    });
  };

  const handleRemoveSymptomFromPart = (part, symptomId) => {
    setSelectedSymptomsByPart((prev) => {
      const current = prev[part] || [];
      const nextList = current.filter((s) => s.id !== symptomId);
      return { ...prev, [part]: nextList };
    });
  };

  const handleSetIntensity = (part, symptomId, intensity) => {
    setSelectedSymptomsByPart((prev) => {
      const current = prev[part] || [];
      const nextList = current.map((s) => (s.id === symptomId ? { ...s, intensity } : s));
      return { ...prev, [part]: nextList };
    });
  };

  const activeSymptoms = activePart ? getSymptomsFor(activePart, getZoneKeyForPart(activePart)) : [];

  // zoom / rotation via boutons
  const handleZoom = (direction) => {
    if (!controlsRef.current) return;
    const factor = direction === "in" ? 0.9 : 1.1;
    if (direction === "in") controlsRef.current.dollyIn(factor);
    else controlsRef.current.dollyOut(factor);
    controlsRef.current.update();
  };

  const handleRotateAround = (direction) => {
    if (!controlsRef.current) return;
    const angle = direction === "left" ? 0.3 : -0.3;
    controlsRef.current.rotateLeft(angle);
    controlsRef.current.update();
  };

  const handleResetView = () => {
    if (!controlsRef.current) return;
    controlsRef.current.reset();
  };

  // s'assurer qu'il y a toujours une partie active si une partie est sélectionnée
  useEffect(() => {
    if (!activePart && selectedParts.length > 0) {
      setActivePart(selectedParts[0]);
    }
  }, [activePart, selectedParts]);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-slate-100 to-slate-200 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Titre */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl lg:text-4xl font-semibold text-slate-900 tracking-tight">
            Indiquez où vous avez mal
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Cliquez sur le modèle 3D, puis précisez le type de douleur dans le
            panneau à droite.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-8">
          {/* Zone modèle 3D */}
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/60 p-4 lg:p-6">
            <div
              ref={containerRef}
              className="relative h-[420px] lg:h-[520px] rounded-2xl overflow-hidden bg-linear-to-b from-slate-900 via-slate-900 to-slate-950"
            >
              <Canvas camera={{ position: [0, 1.2, 6], fov: 40 }}>
                <ambientLight intensity={0.5} />
                <directionalLight
                  position={[5, 10, 5]}
                  intensity={1.1}
                  castShadow
                />
                <spotLight
                  position={[0, 4, 4]}
                  intensity={1.3}
                  angle={0.5}
                  penumbra={0.4}
                />
                <pointLight position={[0, 2, 2]} intensity={0.7} distance={10} />

                <FBXHuman
                  onBodyPartClick={handleBodyPartClick}
                  selectedParts={selectedParts}
                  onPointerOverCallback={(e, name) => {
                    ensurePartMeta(name);
                    handlePartPointerOver(e, name);
                  }}
                  onPointerMoveCallback={handlePartPointerMove}
                  onPointerOutCallback={handlePartPointerOut}
                />

                <CustomOrbitControls controlsRef={controlsRef} />
              </Canvas>

              {/* Panneau d'aide controls (en bas à gauche) */}
              <ControlPanel />

              {/* Boutons zoom / rotation / reset (en haut à droite) */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleZoom("in")}
                  className="p-2 rounded-full bg-slate-900/80 text-slate-50 hover:bg-slate-900 transition shadow-lg backdrop-blur border border-slate-700/60"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleZoom("out")}
                  className="p-2 rounded-full bg-slate-900/80 text-slate-50 hover:bg-slate-900 transition shadow-lg backdrop-blur border border-slate-700/60"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <div className="h-px w-7 mx-auto bg-slate-700/70 my-1" />
                <button
                  type="button"
                  onClick={() => handleRotateAround("left")}
                  className="p-2 rounded-full bg-slate-900/80 text-slate-50 hover:bg-slate-900 transition shadow-lg backdrop-blur border border-slate-700/60"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRotateAround("right")}
                  className="p-2 rounded-full bg-slate-900/80 text-slate-50 hover:bg-slate-900 transition shadow-lg backdrop-blur border border-slate-700/60"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <div className="h-px w-7 mx-auto bg-slate-700/70 my-1" />
                <button
                  type="button"
                  onClick={handleResetView}
                  className="p-2 rounded-full bg-slate-900/80 text-slate-50 hover:bg-slate-900 transition shadow-lg backdrop-blur border border-slate-700/60"
                  title="Réinitialiser la vue"
                >
                  <Crosshair className="w-4 h-4" />
                </button>
              </div>

              {/* Tooltip */}
              {tooltip.visible && (
                <div
                  className="absolute pointer-events-none z-50"
                  style={{ left: tooltip.x, top: tooltip.y }}
                >
                  <div className="absolute bottom-3 left-1 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-l border-b border-slate-200" />
                  <div className="bg-white text-slate-900 px-3 py-2 rounded-xl shadow-xl border border-slate-200 text-xs whitespace-nowrap">
                    <div className="font-semibold">
                      {partsMeta[tooltip.part]?.name || tooltip.part}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {partsMeta[tooltip.part]?.zoneLabel || "Région du corps"}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bouton effacer */}
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Les informations saisies ne remplacent pas un avis médical.
              </p>
              <button
                onClick={clearSelection}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-500 text-white text-sm font-medium shadow-md hover:bg-rose-600 transition"
              >
                <RotateCcw className="w-4 h-4" />
                Effacer la sélection
              </button>
            </div>
          </div>

          <SymptomPanel
            selectedParts={selectedParts}
            activePart={activePart}
            partsMeta={partsMeta}
            selectedSymptomsByPart={selectedSymptomsByPart}
            setActivePart={setActivePart}
            handleAddSymptomToPart={handleAddSymptomToPart}
            handleRemoveSymptomFromPart={handleRemoveSymptomFromPart}
            handleSetIntensity={handleSetIntensity}
          />
        </div>
      </div>
    </div>
  );
}
