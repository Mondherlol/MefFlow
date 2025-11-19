import { useFBX } from "@react-three/drei";

import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import HumanBody from "../../assets/HumanBody.fbx";


function FBXHuman({
  onBodyPartClick,
  selectedParts,
  onPointerOverCallback,
  onPointerMoveCallback,
  onPointerOutCallback,
  onMeshesReady,
}) {
  const fbx = useFBX(HumanBody);
  const groupRef = useRef();
  const [meshes, setMeshes] = useState([]);

  useEffect(() => {
    if (!fbx) return;
    const found = [];
    fbx.traverse((n) => {
      if (n.isMesh) found.push(n);
    });

    found.forEach((m) => {
      if (m.material) {
        m.material = Array.isArray(m.material)
          ? m.material.map((x) => x.clone())
          : m.material.clone();
        try {
          m.userData.origColor = m.material.color
            ? m.material.color.clone()
            : new THREE.Color("#e5e7eb");
        } catch (err) {
          m.userData.origColor = new THREE.Color("#e5e7eb");
        }
      }
    });

    setMeshes(found);
    // informer le parent que les meshes sont prêts (pour centrage / focus)
    if (typeof onMeshesReady === "function") onMeshesReady(found);
  }, [fbx]);

  // Mise à jour des couleurs en fonction de la sélection
  useEffect(() => {
    meshes.forEach((m) => {
      if (!m.material) return;
      const isSelected = selectedParts && selectedParts.includes(m.name);
      const targetColor = isSelected
        ? "#ef4444"
        : m.userData.origColor || new THREE.Color("#e5e7eb");

      if (Array.isArray(m.material)) {
        m.material.forEach((mat) => mat.color.set(targetColor));
      } else {
        m.material.color.set(targetColor);
      }
    });
  }, [meshes, selectedParts]);

  return (
    <group ref={groupRef} scale={0.17} position={[0, -1.5, 0]}>
      {meshes.map((mesh) => (
        <primitive
          key={mesh.uuid}
          object={mesh}
          onClick={(e) => {
            e.stopPropagation();
            onBodyPartClick(mesh.name);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            if (mesh.material) {
              if (Array.isArray(mesh.material))
                mesh.material.forEach((mat) => mat.color.set("#f97373"));
              else mesh.material.color.set("#f97373");
            }
            document.body.style.cursor = "pointer";
            onPointerOverCallback && onPointerOverCallback(e, mesh.name);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            const isSelected = selectedParts && selectedParts.includes(mesh.name);
            const restoreColor = isSelected
              ? new THREE.Color("#ef4444")
              : mesh.userData.origColor || new THREE.Color("#e5e7eb");
            if (mesh.material) {
              if (Array.isArray(mesh.material))
                mesh.material.forEach((mat) => mat.color.set(restoreColor));
              else mesh.material.color.set(restoreColor);
            }
            document.body.style.cursor = "default";
            onPointerOutCallback && onPointerOutCallback(e, mesh.name);
          }}
          onPointerMove={(e) => {
            e.stopPropagation();
            onPointerMoveCallback && onPointerMoveCallback(e, mesh.name);
          }}
        />
      ))}
    </group>
  );
}

export default FBXHuman;