import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

function CustomOrbitControls({ controlsRef }) {
  const { gl, camera } = useThree();

  return (
    <OrbitControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      enablePan={true}
      enableZoom
      enableRotate
      minPolarAngle={Math.PI * 0.05}
      maxPolarAngle={Math.PI * 0.95}
      minDistance={1.5}
      maxDistance={7}
      target={[0, 0.5, 0]}
      panSpeed={0.8}

    />
  );
}


export default CustomOrbitControls;