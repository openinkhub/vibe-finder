import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";

const Glossy = (p) => <meshPhysicalMaterial roughness={0.18} metalness={0.35} clearcoat={1} clearcoatRoughness={0.08} {...p} />;

const Lipstick = ({ shade, caseColor }) => (
  <group position={[0, -0.4, 0]}>
      <mesh position={[0, -1.1, 0]}><cylinderGeometry args={[0.5, 0.5, 2.2, 64]} /><Glossy color={caseColor} metalness={0.6} /></mesh>
      <mesh position={[0, 0.02, 0]}><cylinderGeometry args={[0.53, 0.53, 0.12, 64]} /><Glossy color="#E3B47A" metalness={0.95} roughness={0.12} /></mesh>
      <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.4, 0.4, 0.9, 64]} /><Glossy color="#E3B47A" metalness={0.9} roughness={0.15} /></mesh>
      <mesh position={[0, 1.45, 0]}><cylinderGeometry args={[0.33, 0.33, 1.0, 64]} /><Glossy color={shade} roughness={0.32} metalness={0.05} /></mesh>
      <mesh position={[0, 2.2, 0]}><cylinderGeometry args={[0.04, 0.33, 0.5, 64]} /><Glossy color={shade} roughness={0.32} metalness={0.05} /></mesh>
  </group>
);

export const LipstickViewer = ({ shade = "#E62E6B", caseColor = "#6E2C3C" }) => (
  <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0.8, 6], fov: 34 }} gl={{ alpha: true, antialias: true }} data-testid="lipstick-3d-viewer">
    <ambientLight intensity={1.1} />
    <directionalLight position={[4, 6, 5]} intensity={2} color="#FFF4F7" />
    <pointLight position={[-4, -1, 3]} intensity={10} color="#E62E6B" />
    <pointLight position={[3, -3, -2]} intensity={5} color="#F4B7CE" />
    <Suspense fallback={null}>
      <Lipstick shade={shade} caseColor={caseColor} />
      <ContactShadows position={[0, -2.5, 0]} opacity={0.35} scale={7} blur={2.6} color="#6E2C3C" />
    </Suspense>
    <OrbitControls enablePan={false} minDistance={3.5} maxDistance={9} autoRotate autoRotateSpeed={1.6} makeDefault />
  </Canvas>
);

export default LipstickViewer;
