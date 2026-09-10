import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import { isTouch } from "../../hooks/useIsMobile";

export const TiltCard = ({ children, className = "", max = 10, glare = true, as = "div", lift = true, ...rest }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [max, -max]), { stiffness: 260, damping: 22 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-max, max]), { stiffness: 260, damping: 22 });
  const gx = useTransform(x, [-0.5, 0.5], ["10%", "90%"]);
  const gy = useTransform(y, [-0.5, 0.5], ["10%", "90%"]);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.42), rgba(255,255,255,0) 58%)`;

  const onMove = (e) => {
    if (isTouch() || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => { x.set(0); y.set(0); };
  const Comp = motion[as] || motion.div;

  return (
    <Comp
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", transformPerspective: 1000 }}
      whileHover={lift ? { scale: 1.025, z: 24 } : undefined}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={`group relative will-change-transform ${className}`}
      {...rest}
    >
      {children}
      {glare && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-soft-light"
          style={{ background: glareBg }}
        />
      )}
    </Comp>
  );
};

export default TiltCard;
