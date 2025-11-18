// src/components/SimpleFBXViewer.jsx
import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useFBX, Html } from '@react-three/drei';
import Loader from '../Loader.jsx';
import HumanBody from '../../assets/HumanBody.fbx';

// Composant pour charger et afficher le FBX
function FBXModel() {
  // Load the FBX using the Vite-imported URL so the bundler serves it correctly
  const fbx = useFBX(HumanBody);
  
  // When the model is loaded, print a readable hierarchy and a mesh/materials table
  useEffect(() => {
    if (!fbx) return;

    try {
      console.groupCollapsed('FBX model hierarchy');
      const printNode = (node, depth = 0) => {
        const indent = ' '.repeat(depth * 2);
        const name = node.name && node.name !== '' ? node.name : '<unnamed>';
        console.log(`${indent}- ${name} [${node.type}]`);
        if (node.isMesh) {
          const mat = node.material;
          if (mat) {
            if (Array.isArray(mat)) {
              console.log(`${indent}  materials: [${mat.map(m => m?.name || m?.type || 'unknown').join(', ')}]`);
            } else {
              console.log(`${indent}  material: ${mat.name || mat.type || 'unknown'}`);
            }
          }
          console.log(`${indent}  geometry: ${node.geometry?.type || 'unknown'}`);
        }
        node.children.forEach(child => printNode(child, depth + 1));
      };

      printNode(fbx, 0);
      console.groupEnd();

      // Also print a table of all meshes for easier scanning
      const meshes = [];
      fbx.traverse(n => {
        if (n.isMesh) {
          meshes.push({ name: n.name || '<unnamed>', type: n.type, geometry: n.geometry?.type || '', material: Array.isArray(n.material) ? n.material.map(m => m?.name || m?.type || '') : (n.material?.name || n.material?.type || '') });
        }
      });
      if (meshes.length) console.table(meshes);
      else console.log('No meshes found in FBX.');
    } catch (err) {
      console.error('Error while listing FBX parts:', err);
    }
  }, [fbx]);
  
  return (
    <primitive 
      object={fbx} 
      scale={0.2} // Ajuste l'échelle si nécessaire
      position={[0, -2, 0]} 
    />
  );
}

// Composant principal
export default function Test() {
  return (
    <div className="w-full h-screen bg-gray-900">
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />

        <Suspense fallback={<Html center><Loader fullScreen={false} /></Html>}>
          <FBXModel />
        </Suspense>

        <OrbitControls enablePan enableZoom enableRotate />
      </Canvas>

      <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 text-white p-3 rounded-lg text-sm text-center">
        <p>Utilise la souris pour pivoter, zoomer et déplacer le modèle</p>
      </div>
    </div>
  );
}