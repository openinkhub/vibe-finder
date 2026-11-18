import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";

// The 3D compact for the "Book me" card. Loaded lazily so three.js stays out of the main bundle.
const Glossy = (p) => <meshPhysicalMaterial roughness={0.2} metalness={0.35} clearcoat={1} clearcoatRoughness={0.08} {...p} />;

const Compact = ({ open, onToggle, hovered, setHovered }) => {
  const lid = useRef();
  const group = useRef();
  useFrame((state, dt) => {
    const target = open ? -1.9 : 0;
    lid.current.rotation.x += (target - lid.current.rotation.x) * Math.min(1, dt * 5);
    const s = hovered && !open ? 1.05 : 1;
    group.current.scale.setScalar(group.current.scale.x + (s - group.current.scale.x) * Math.min(1, dt * 8));
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15 + (open ? 0 : 0.3);
  });
  return (
    <group ref={group} rotation={[0.55, 0.3, 0]} position={[0, -0.2, 0]} onClick={(e) => { e.stopPropagation(); onToggle(); }} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <mesh><cylinderGeometry args={[1.2, 1.2, 0.28, 72]} /><Glossy color="#E62E6B" /></mesh>
      <mesh position={[0, 0.15, 0]}><cylinderGeometry args={[1.05, 1.05, 0.03, 72]} /><meshStandardMaterial color="#F4B7CE" roughness={0.9} /></mesh>
      <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.55, 0.05, 16, 64]} /><Glossy color="#F6CFE0" roughness={0.7} metalness={0} /></mesh>
      <group ref={lid} position={[0, 0.14, -1.2]}>
        <mesh position={[0, 0.1, 1.2]}><cylinderGeometry args={[1.2, 1.2, 0.2, 72]} /><Glossy color="#E62E6B" /></mesh>
        <mesh position={[0, 0.0, 1.2]} rotation={[Math.PI, 0, 0]}><cylinderGeometry args={[1.05, 1.05, 0.02, 72]} /><meshStandardMaterial color="#FFFFFF" metalness={1} roughness={0.05} /></mesh>
        <mesh position={[0, 0.21, 1.2]}><cylinderGeometry args={[0.35, 0.35, 0.02, 48]} /><Glossy color="#E3B47A" metalness={0.95} roughness={0.15} /></mesh>
      </group>
    </group>
  );
};

const BookMeCanvas = ({ open, setOpen, hovered, setHovered }) => (
  <Canvas dpr={[1, 1.5]} camera={{ position: [0, 1.6, 4.4], fov: 36 }} gl={{ alpha: true, antialias: true }} onPointerMissed={() => open && setOpen(false)}>
          <ambientLight intensity={1} />
          <directionalLight position={[3, 6, 4]} intensity={2} color="#FFF4F7" />
          <pointLight position={[-4, 2, 3]} intensity={8} color="#F4B7CE" />
          <Compact open={open} onToggle={() => setOpen((v) => !v)} hovered={hovered} setHovered={setHovered} />
          <ContactShadows position={[0, -0.6, 0]} opacity={0.35} scale={6} blur={2.4} color="#6E2C3C" />
        </Canvas>
);

export default BookMeCanvas;
