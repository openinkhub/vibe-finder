import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { paintFaceTexture } from "./faceTexture";

const Head = ({ look }) => {
  const canvas = useMemo(() => { const c = document.createElement("canvas"); c.width = 1024; c.height = 1024; return c; }, []);
  const texture = useMemo(() => { const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }, [canvas]);
  const group = useRef();
  const target = useRef(0);

  useEffect(() => { paintFaceTexture(canvas, look); texture.needsUpdate = true; target.current = 1; }, [look, canvas, texture]);
  useFrame((_, dt) => {
    if (!group.current) return;
    // little "settle" bounce whenever the look changes
    target.current = Math.max(0, target.current - dt * 1.6);
    group.current.scale.setScalar(1 + Math.sin(target.current * Math.PI) * 0.03);
  });

  return (
    <group ref={group} position={[0, 0.45, 0]}>
      <mesh scale={[0.86, 1.06, 0.92]}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhysicalMaterial map={texture} roughness={0.42} clearcoat={0.55} clearcoatRoughness={0.35} sheen={0.4} sheenColor="#FBE9F0" />
      </mesh>
      <mesh position={[0, -0.06, 0.9]} scale={[0.065, 0.11, 0.08]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhysicalMaterial color="#F1D3C2" roughness={0.42} clearcoat={0.5} />
      </mesh>
      <mesh position={[0, -1.25, -0.05]}>
        <cylinderGeometry args={[0.32, 0.4, 0.75, 48]} />
        <meshPhysicalMaterial color="#EFCDBB" roughness={0.45} clearcoat={0.4} />
      </mesh>
      <mesh position={[0, -1.68, -0.05]}>
        <cylinderGeometry args={[0.9, 0.9, 0.12, 64]} />
        <meshPhysicalMaterial color={look.lips} roughness={0.25} metalness={0.2} clearcoat={1} />
      </mesh>
    </group>
  );
};

export const FaceModel3D = ({ look }) => (
  <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0.2, 6.6], fov: 30 }} gl={{ alpha: true, antialias: true }} data-testid="face-model-canvas">
    <ambientLight intensity={0.9} />
    <directionalLight position={[3, 5, 5]} intensity={2.2} color="#FFF6F2" />
    <directionalLight position={[-4, 2, 3]} intensity={1.1} color="#FBE9F0" />
    <pointLight position={[0, -2, 4]} intensity={4} color="#E62E6B" />
    <Head look={look} />
    <ContactShadows position={[0, -1.35, 0]} opacity={0.3} scale={6} blur={2.5} color="#6E2C3C" />
    <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI / 2.6} maxPolarAngle={Math.PI / 1.7} autoRotate autoRotateSpeed={0.8} makeDefault />
  </Canvas>
);

export default FaceModel3D;
