import React from "react";
import { motion } from "@/lib/motion";

export const Reveal = ({ children, className = "", delay = 0, y = 40, rotate = 10, once = true }) => (
  <motion.div
    initial={{ opacity: 0, y, rotateX: rotate, scale: 0.98 }}
    whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
    viewport={{ once, margin: "-40px" }}
    transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
    style={{ transformPerspective: 1100, transformOrigin: "top center" }}
    className={className}
  >
    {children}
  </motion.div>
);

export default Reveal;
