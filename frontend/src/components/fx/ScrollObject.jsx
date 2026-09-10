import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";

const PINK = "#E62E6B";
const SOFT = "#F4B7CE";
const GOLD = "#E3B47A";

const Glossy = (p) => <meshPhysicalMaterial roughness={0.2} metalness={0.3} clearcoat={1} clearcoatRoughness={0.1} {...p} />;

const Brush = () => (
  <group rotation={[0, 0, 0.5]}>
    <mesh position={[0, -1.1, 0]}><cylinderGeometry args={[0.13, 0.17, 2.4, 40]} /><Glossy color={PINK} /></mesh>
    <mesh position={[0, 0.35, 0]}><cylinderGeometry args={[0.2, 0.15, 0.5, 40]} /><Glossy color={GOLD} metalness={0.9} roughness={0.15} /></mesh>
    <mesh position={[0, 0.95, 0]}><cylinderGeometry args={[0.06, 0.24, 0.8, 40]} /><Glossy color={SOFT} roughness={0.6} metalness={0} /></mesh>
  </group>
);

const Compact = () => (
  <group rotation={[0.9, 0, 0]}>
    <mesh><cylinderGeometry args={[1.1, 1.1, 0.24, 64]} /><Glossy color={SOFT} metalness={0.4} /></mesh>
    <mesh position={[0, 0.13, 0]}><cylinderGeometry args={[0.95, 0.95, 0.03, 64]} /><Glossy color={PINK} roughness={0.5} metalness={0} /></mesh>
    <group position={[0, 0.12, -1.1]} rotation={[-1.75, 0, 0]}>
      <mesh position={[0, 0.12, 1.1]}><cylinderGeometry args={[1.1, 1.1, 0.16, 64]} /><Glossy color={SOFT} metalness={0.4} /></mesh>
      <mesh position={[0, 0.03, 1.1]}><cylinderGeometry args={[0.95, 0.95, 0.02, 64]} /><meshStandardMaterial color="#FFFFFF" metalness={1} roughness={0.05} /></mesh>
    </group>
  </group>
);

const Gem = () => (
  <mesh>
    <icosahedronGeometry args={[1.05, 0]} />
    <meshPhysicalMaterial color={PINK} roughness={0.08} metalness={0.1} clearcoat={1} transmission={0.55} thickness={1.4} />
  </mesh>
);

const Ring = () => (
  <mesh>
    <torusKnotGeometry args={[0.85, 0.28, 180, 24]} />
    <Glossy color={PINK} />
  </mesh>
);

const VARIANTS = { brush: Brush, compact: Compact, gem: Gem, ring: Ring };

const Spinner = ({ variant, progress }) => {
  const ref = useRef();
  useFrame(() => {
    const p = progress.get();
    ref.current.rotation.y = p * Math.PI * 2.2;
    ref.current.rotation.x = (p - 0.5) * Math.PI * 0.7;
    ref.current.position.y = Math.sin(p * Math.PI) * 0.5 - 0.1;
    ref.current.scale.setScalar(0.75 + Math.sin(p * Math.PI) * 0.3);
  });
  const Obj = VARIANTS[variant] || Ring;
  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.6}>
      <group ref={ref}><Obj /></group>
    </Float>
  );
};

export const ScrollObject = ({ variant = "ring", progress, className = "" }) => (
  <div className={`pointer-events-none ${className}`} aria-hidden>
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 5.2], fov: 40 }} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={1.1} />
      <directionalLight position={[3, 5, 4]} intensity={1.8} color="#FFF4F7" />
      <pointLight position={[-4, -2, 3]} intensity={10} color={PINK} />
      <Spinner variant={variant} progress={progress} />
    </Canvas>
  </div>
);

export default ScrollObject;
