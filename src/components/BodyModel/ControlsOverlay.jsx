import { useCallback, useRef } from "react";
import * as THREE from "three";
import { RotateCw, RotateCcw, ZoomIn, ZoomOut, Crosshair } from "lucide-react";

export default function ControlsOverlay({ controlsRef, getMeshWorldPosition, focusPartName = "Nez" }) {
  const rotateIndex = useRef(0);

  const DEFAULT_POS = new THREE.Vector3(0, 1.2, 6);
  const DEFAULT_TARGET = new THREE.Vector3(0, 0, 0);

  // predefined camera positions for rotation cycle: front, left, back, right
  const ORIENTATIONS = [
    new THREE.Vector3(0, 1.2, 6),
    new THREE.Vector3(-6, 1.2, 0),
    new THREE.Vector3(0, 1.2, -6),
    new THREE.Vector3(6, 1.2, 0),
  ];

  const setCameraAndTarget = (cam, targetVec, posVec) => {
    if (!cam || !posVec) return;
    cam.position.copy(posVec);
    if (controlsRef.current && controlsRef.current.target && typeof controlsRef.current.target.set === "function") {
      controlsRef.current.target.set(targetVec.x, targetVec.y, targetVec.z);
    }
    controlsRef.current.update && controlsRef.current.update();
  };

  const handleZoom = useCallback(
    (direction) => {
      if (!controlsRef?.current) return;
      const cam = controlsRef.current.object || controlsRef.current.camera;
      if (!cam) return;

      // Zoom In
      if (direction === "in" ) {
        const target = new THREE.Vector3(0, 1.6, 0);

        // compute direction from target to camera and place camera at a closer distance
        const dir = new THREE.Vector3().subVectors(cam.position, target).normalize();
        const desiredDistance = 1.5; // distance to keep from the target when zoomed in
        const newPos = new THREE.Vector3().copy(target).add(dir.multiplyScalar(desiredDistance));

        setCameraAndTarget(cam, target, newPos);
        return;
      }

      // zoom out -> restore defaults
      if (direction === "out") {
        setCameraAndTarget(cam, DEFAULT_TARGET, DEFAULT_POS);
      }
    },
    [controlsRef]
  );

  const handleRotateAround = useCallback(
    (direction) => {
      if (!controlsRef?.current) return;
      const cam = controlsRef.current.object || controlsRef.current.camera;
      if (!cam) return;

      // advance or rewind index
      if (direction === "left") rotateIndex.current = (rotateIndex.current + 1) % ORIENTATIONS.length;
      else rotateIndex.current = (rotateIndex.current - 1 + ORIENTATIONS.length) % ORIENTATIONS.length;

      const pos = ORIENTATIONS[rotateIndex.current];
      setCameraAndTarget(cam, DEFAULT_TARGET, pos);
    },
    [controlsRef]
  );

  const handleResetView = useCallback(() => {
    if (!controlsRef?.current) return;
    if (typeof controlsRef.current.reset === "function") {
      controlsRef.current.reset();
      controlsRef.current.update?.();
    } else if (controlsRef.current.object) {
      // best-effort fallback: move camera to a reasonable default
      const cam = controlsRef.current.object;
      cam.position.set(0, 1.2, 6);
      controlsRef.current.target && controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update && controlsRef.current.update();
    }
  }, [controlsRef]);

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2">
      <button
        type="button"
        onClick={() => handleZoom("in")}
        className="p-2 rounded-full bg-slate-900/80 text-slate-50 hover:bg-slate-700 cursor-pointer transition shadow-lg backdrop-blur border border-slate-700/60"
        title="Zoomer"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => handleZoom("out")}
        className="p-2 rounded-full bg-slate-900/80 text-slate-50 hover:bg-slate-700 cursor-pointer transition shadow-lg backdrop-blur border border-slate-700/60"
        title="Dézoomer"
      >
        <ZoomOut className="w-4 h-4" />
      </button>
      <div className="h-px w-7 mx-auto bg-slate-700/70 my-1" />
      <button
        type="button"
        onClick={() => handleRotateAround("left")}
        className="p-2 rounded-full bg-slate-900/80 text-slate-50 hover:bg-slate-700 cursor-pointer transition shadow-lg backdrop-blur border border-slate-700/60"
        title="Tourner à gauche"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => handleRotateAround("right")}
        className="p-2 rounded-full bg-slate-900/80 text-slate-50 hover:bg-slate-700 cursor-pointer transition shadow-lg backdrop-blur border border-slate-700/60"
        title="Tourner à droite"
      >
        <RotateCw className="w-4 h-4" />
      </button>
      <div className="h-px w-7 mx-auto bg-slate-700/70 my-1" />
      <button
        type="button"
        onClick={handleResetView}
        className="p-2 rounded-full bg-slate-900/80 text-slate-50 hover:bg-slate-700 cursor-pointer transition shadow-lg backdrop-blur border border-slate-700/60"
        title="Réinitialiser la vue"
      >
        <Crosshair className="w-4 h-4" />
      </button>
    </div>
  );
}
