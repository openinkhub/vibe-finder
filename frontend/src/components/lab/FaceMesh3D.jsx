import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import BASE_TRIANGLES from "../../content/faceTriangles.json";

const fan = (ring) => ring.slice(1, -1).flatMap((_, i) => [ring[0], ring[i + 1], ring[i + 2]]);
const L_EYE = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
const R_EYE = [263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466];
const MOUTH = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191];
const TRIANGLES = [...BASE_TRIANGLES, ...fan(L_EYE), ...fan(R_EYE), ...fan(MOUTH)];

const Mesh = ({ landmarks, canvas, aspect, version }) => {
  const texture = useMemo(() => { const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }, [canvas]);
  useEffect(() => { texture.needsUpdate = true; }, [version, texture]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const n = landmarks.length;
    const pos = new Float32Array(n * 3), uv = new Float32Array(n * 2);
    let cx = 0, cy = 0, cz = 0;
    landmarks.forEach((p) => { cx += p.x; cy += p.y; cz += p.z; });
    cx /= n; cy /= n; cz /= n;
    let maxR = 0;
    landmarks.forEach((p, i) => {
      const x = (p.x - cx) * aspect, y = -(p.y - cy), z = -(p.z - cz) * aspect;
      pos.set([x, y, z], i * 3);
      uv.set([p.x, 1 - p.y], i * 2);
      maxR = Math.max(maxR, Math.hypot(x, y));
    });
    const s = 1.3 / maxR;
    for (let i = 0; i < pos.length; i++) pos[i] *= s;
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    g.setIndex(TRIANGLES.filter((i) => i < n));
    g.computeVertexNormals();
    return g;
  }, [landmarks, aspect]);

  const ref = useRef();
  useFrame((state) => { if (ref.current) ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.35; });
  return (
    <group ref={ref}>
      <mesh geometry={geometry}>
        <meshBasicMaterial map={texture} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
    </group>
  );
};

export const FaceMesh3D = ({ landmarks, canvas, aspect = 1, version = 0, wire = false }) => (
  <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 4.8], fov: 32 }} gl={{ alpha: true, antialias: true }} data-testid="face-mesh-canvas">
    <ambientLight intensity={1.1} />
    <directionalLight position={[2, 3, 5]} intensity={1.6} color="#FFF6F2" />
    <directionalLight position={[-3, 1, 3]} intensity={0.8} color="#FBE9F0" />
    <Mesh landmarks={landmarks} canvas={canvas} aspect={aspect} version={version} />
    <ContactShadows position={[0, -1.85, 0]} opacity={0.3} scale={6} blur={2.5} color="#6E2C3C" />
    <OrbitControls enablePan={false} enableZoom={false} minAzimuthAngle={-1.1} maxAzimuthAngle={1.1} minPolarAngle={Math.PI / 2.6} maxPolarAngle={Math.PI / 1.7} makeDefault />
  </Canvas>
);

export default FaceMesh3D;
