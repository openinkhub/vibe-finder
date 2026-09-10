import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, MessageCircle, CalendarCheck } from "lucide-react";
import { brand } from "../mock/mock";

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

export const BookMeCompact = ({ onBook }) => {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  return (
    <div className="relative rounded-[28px] bg-white border border-[#F1DCE3] overflow-hidden" data-testid="bookme-compact">
      <div className="absolute top-4 left-4 z-10 font-mono text-[10px] tracking-[0.2em] uppercase text-[#8B7F82]">{open ? "Compact open" : "Tap the compact"}</div>
      <div className={`h-64 sm:h-72 relative overflow-hidden ${hovered ? "cursor-pointer" : ""}`} data-testid="bookme-canvas-wrap">
        <Canvas dpr={[1, 1.5]} camera={{ position: [0, 1.6, 4.4], fov: 36 }} gl={{ alpha: true, antialias: true }} onPointerMissed={() => open && setOpen(false)}>
          <ambientLight intensity={1} />
          <directionalLight position={[3, 6, 4]} intensity={2} color="#FFF4F7" />
          <pointLight position={[-4, 2, 3]} intensity={8} color="#F4B7CE" />
          <Compact open={open} onToggle={() => setOpen((v) => !v)} hovered={hovered} setHovered={setHovered} />
          <ContactShadows position={[0, -0.6, 0]} opacity={0.35} scale={6} blur={2.4} color="#6E2C3C" />
        </Canvas>
      </div>
      <button onClick={() => setOpen((v) => !v)} className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full bg-[#FBE9F0] text-[#E62E6B] text-xs font-medium" data-testid="bookme-toggle-btn">{open ? "Close" : "Open"}</button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 16, rotateX: -20 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} exit={{ opacity: 0, y: 10 }} style={{ transformPerspective: 800 }} className="px-5 pb-5 -mt-2" data-testid="bookme-reveal">
            <div className="font-display text-xl text-[#4A2530]">Book me</div>
            <p className="text-sm text-[#5C4E52] mt-1">Free consultation · no visit charge for party, event & wedding bookings.</p>
            <div className="mt-4 grid sm:grid-cols-3 gap-2">
              <a href={`tel:${brand.phone.replace(/\s/g, "")}`} className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full border border-[#E62E6B] text-[#E62E6B] text-sm font-medium hover:bg-[#E62E6B] hover:text-white transition-colors" data-testid="bookme-call"><Phone size={15} /> Call</a>
              <a href={brand.whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-[#25D366] text-white text-sm font-medium" data-testid="bookme-whatsapp"><MessageCircle size={15} /> WhatsApp</a>
              <button onClick={onBook} className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-[#E62E6B] text-white text-sm font-medium hover:bg-[#C81F57]" data-testid="bookme-form"><CalendarCheck size={15} /> Book form</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookMeCompact;
