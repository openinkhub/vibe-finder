import React, { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";

const PINK = "#E62E6B";
const SOFT = "#F4B7CE";
const BLUSH = "#FBE9F0";

const Glossy = ({ color, ...p }) => (
  <meshPhysicalMaterial color={color} roughness={0.18} metalness={0.25} clearcoat={1} clearcoatRoughness={0.08} {...p} />
);

const Ring = ({ position, scale = 1, speed = 1, color = PINK, tube = 0.28 }) => {
  const ref = useRef();
  useFrame((_, dt) => {
    ref.current.rotation.x += dt * 0.35 * speed;
    ref.current.rotation.y += dt * 0.55 * speed;
  });
  return (
    <Float speed={1.4} rotationIntensity={0.5} floatIntensity={1.1}>
      <mesh ref={ref} position={position} scale={scale}>
        <torusGeometry args={[1, tube, 48, 96]} />
        <Glossy color={color} />
      </mesh>
    </Float>
  );
};

const Knot = ({ position, scale = 1 }) => {
  const ref = useRef();
  useFrame((_, dt) => { ref.current.rotation.y -= dt * 0.3; ref.current.rotation.z += dt * 0.2; });
  return (
    <Float speed={1.8} rotationIntensity={0.8} floatIntensity={1.4}>
      <mesh ref={ref} position={position} scale={scale}>
        <torusKnotGeometry args={[0.9, 0.26, 180, 24]} />
        <Glossy color={PINK} metalness={0.5} />
      </mesh>
    </Float>
  );
};

const Petal = ({ position, rotation = [0, 0, 0], scale = 1, color = SOFT }) => (
  <Float speed={2} rotationIntensity={1.4} floatIntensity={1.8}>
    <mesh position={position} rotation={rotation} scale={[scale, scale * 0.36, scale * 0.7]}>
      <sphereGeometry args={[0.6, 32, 32]} />
      <Glossy color={color} roughness={0.35} metalness={0.05} />
    </mesh>
  </Float>
);

const Gem = ({ position, scale = 1 }) => {
  const ref = useRef();
  useFrame((_, dt) => { ref.current.rotation.y += dt * 0.6; });
  return (
    <Float speed={1.2} rotationIntensity={0.4} floatIntensity={1}>
      <mesh ref={ref} position={position} scale={scale}>
        <icosahedronGeometry args={[0.7, 0]} />
        <meshPhysicalMaterial color={BLUSH} roughness={0.05} metalness={0.1} clearcoat={1} transmission={0.4} thickness={1.2} />
      </mesh>
    </Float>
  );
};

const Rig = () => {
  const target = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const on = (e) => {
      target.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", on, { passive: true });
    return () => window.removeEventListener("pointermove", on);
  }, []);
  useFrame(({ camera }) => {
    camera.position.x += (target.current.x * 0.7 - camera.position.x) * 0.04;
    camera.position.y += (target.current.y * 0.45 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });
  return null;
};

const Lights = () => (
  <>
    <ambientLight intensity={1.1} />
    <directionalLight position={[4, 6, 5]} intensity={1.8} color="#FFF4F7" />
    <pointLight position={[-5, -2, 3]} intensity={12} color={PINK} />
    <pointLight position={[3, -4, 2]} intensity={6} color={SOFT} />
  </>
);

export const HeroScene = ({ light = false }) => (
  <Canvas
    dpr={light ? [1, 1.25] : [1, 1.75]}
    camera={{ position: [0, 0, 7.5], fov: 45 }}
    gl={{ alpha: true, antialias: !light, powerPreference: "high-performance" }}
    style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    aria-hidden
  >
    <Lights />
    {light ? (
      <>
        <Ring position={[1.2, 2.6, -1]} scale={0.7} />
        <Petal position={[-1.6, 3.1, -1.5]} rotation={[0.4, 0.2, 0.6]} scale={0.9} />
        <Petal position={[2.4, 1.2, -2]} rotation={[0.2, 0.9, -0.4]} scale={0.7} color={PINK} />
        <Sparkles count={40} scale={[8, 8, 3]} size={2.2} speed={0.35} color={PINK} opacity={0.6} />
      </>
    ) : (
      <>
        <Ring position={[3.6, 0.9, -0.5]} scale={1.0} />
        <Ring position={[5.6, -1.9, -1.5]} scale={0.7} speed={1.6} color={SOFT} tube={0.22} />
        <Knot position={[5.2, 2.5, -2.4]} scale={0.42} />
        <Gem position={[2.3, -2.0, -0.6]} scale={0.8} />
        <Petal position={[2.4, 2.7, -1]} rotation={[0.4, 0.2, 0.6]} scale={1.0} />
        <Petal position={[6.4, 0.6, -2.4]} rotation={[0.2, 0.9, -0.4]} scale={0.9} color={PINK} />
        <Petal position={[4.1, -3.0, 0.4]} rotation={[-0.4, 0.5, 1.1]} scale={0.8} color={BLUSH} />
        <Sparkles count={150} scale={[14, 8, 5]} size={2.6} speed={0.4} color={PINK} opacity={0.65} />
        <Rig />
      </>
    )}
  </Canvas>
);

export default HeroScene;
