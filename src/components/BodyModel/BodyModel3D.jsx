// src/components/BodyModel3D.jsx
import { useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import ControlsOverlay from "./ControlsOverlay";
import { RotateCcw } from "lucide-react";
import { BODY_ZONES, PARTS_NAMES, getPartName, getZoneKeyForPart, getZoneName } from "./BodyZone";
import FBXHuman from "./FBXHuman";
import CustomOrbitControls from "./CustomOrbitControl"; 

import ControlPanel from "./ControlPanel";
import SymptomPanel from "./SymptomPanel";

// Helper local: get zone label for a part
function getZoneLabelForPart(partName) {
  const key = getZoneKeyForPart(partName);
  return getZoneName(key) ?? BODY_ZONES.other.label;
}

/**
 * Composant principal
 */
export default function BodyModel3D() {
  const [selectedParts, setSelectedParts] = useState([]);
  const [activePart, setActivePart] = useState(null);
  const [partsMeta, setPartsMeta] = useState({});
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    part: null,
  });

  const containerRef = useRef();
  const controlsRef = useRef();
  const meshesRef = useRef(null);

  const handleBodyPartClick = (part) => {
    setSelectedParts((prev) => {
      if (prev.includes(part)) {
        const next = prev.filter((p) => p !== part);
        if (activePart === part) {
            // Si on désélectionne la partie active, on switch sur la dernière sélectionnée s'il en reste
            setActivePart(next.length > 0 ? next[next.length - 1] : null);
        }
        return next;
      }
      setActivePart(part);
      return [...prev, part];
    });
  };

  // Nouvelle fonction nécessaire pour les onglets du nouveau design
  const handleSelectPartFromPanel = (part) => {
      setActivePart(part);
  };

  const clearSelection = () => {
    setSelectedParts([]);
    setActivePart(null);
    setSelectedSymptoms([]);
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

  // s'assurer qu'il y a toujours une partie active si une partie est sélectionnée
  useEffect(() => {
    if (!activePart && selectedParts.length > 0) {
      setActivePart(selectedParts[0]);
    }
  }, [activePart, selectedParts]);

  // Handlers for SymptomPanel
  const onAddSymptom = (symptom) => {
    setSelectedSymptoms((prev) => {
      if (prev.find((s) => s.id === symptom.id)) return prev;
      return [
        ...prev,
        {
          ...symptom,
          intensity: 3, // Default intensity (modifié pour correspondre au scale emoji)
          partId: symptom.partId ?? activePart ?? null,
        },
      ];
    });
  };

  const onRemoveSymptom = (id) => {
    setSelectedSymptoms((prev) => prev.filter((s) => s.id !== id));
  };

  const onUpdateIntensity = (id, intensity) => {
    setSelectedSymptoms((prev) => prev.map((s) => (s.id === id ? { ...s, intensity } : s)));
  };

  const onAnalyze = () => {
    console.log("Analyzing symptoms:", selectedSymptoms);
  };

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
                onMeshesReady={(meshes) => {
                  meshesRef.current = meshes;
                }}
                />

                <CustomOrbitControls controlsRef={controlsRef} />
              </Canvas>

              {/* Panneau d'aide controls (en bas à gauche) */}
              <ControlPanel />

              {/* Controls overlay (zoom / rotation / reset) */}
              <ControlsOverlay
                controlsRef={controlsRef}
              />

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

          {/* MODIFICATION ICI : 
            1. Ajout de la classe h-[420px] lg:h-[520px] pour forcer la même hauteur que la 3D
            2. Passage de selectedParts et onSelectPart
          */}
          <div className="h-[420px] lg:h-[520px]"> 
            <SymptomPanel
              activePart={activePart}
              selectedParts={selectedParts} // Nouveau : pour les onglets
              onSelectPart={handleSelectPartFromPanel} // Nouveau : pour navigation
              selectedSymptoms={selectedSymptoms}
              onAddSymptom={onAddSymptom}
              onRemoveSymptom={onRemoveSymptom}
              onUpdateIntensity={onUpdateIntensity}
              onAnalyze={onAnalyze}
            />
          </div>
        </div>
      </div>
    </div>
  );
}