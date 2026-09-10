const OUTER_LIPS = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185];
const INNER_LIPS = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191];
const EYES = [
  { lash: [33, 246, 161, 160, 159, 158, 157, 173, 133], brow: 52, outer: 33, inner: 133, browRow: [70, 63, 105, 66, 107], browLow: [46, 53, 52, 65, 55] },
  { lash: [263, 466, 388, 387, 386, 385, 384, 398, 362], brow: 282, outer: 263, inner: 362, browRow: [300, 293, 334, 296, 336], browLow: [276, 283, 282, 295, 285] },
];
const CHEEKS = [50, 280];
const FACE_L = 234, FACE_R = 454;
const NOSE = [6, 197, 195, 5];

const rgba = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${Math.max(0, Math.min(1, a))})`;
};

const darken = (hex, f = 0.6) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (v) => Math.round(v * f).toString(16).padStart(2, "0");
  return `#${c((n >> 16) & 255)}${c((n >> 8) & 255)}${c(n & 255)}`;
};

const trace = (ctx, pts) => {
  pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.closePath();
};

export function paintMakeup(ctx, lms, w, h, look) {
  const P = (i) => ({ x: lms[i].x * w, y: lms[i].y * h });
  const faceW = Math.hypot(P(FACE_R).x - P(FACE_L).x, P(FACE_R).y - P(FACE_L).y);
  const k = look.intensity ?? 0.8;

  ctx.save();
  ctx.globalCompositeOperation = "multiply";

  if (look.eyes) {
    EYES.forEach(({ lash, brow }) => {
      const pts = lash.map(P);
      const lashY = pts.reduce((s, p) => s + p.y, 0) / pts.length;
      const lift = (lashY - P(brow).y) * 0.68;
      const top = [...pts].reverse().map((p, i, arr) => ({ x: p.x + (i - arr.length / 2) * faceW * 0.006, y: p.y - lift }));
      ctx.filter = `blur(${Math.max(2, faceW * 0.026)}px)`;
      ctx.beginPath();
      trace(ctx, [...pts, ...top]);
      ctx.fillStyle = rgba(look.eyes, 0.78 * k);
      ctx.fill();
      // deeper crease / outer-corner tone
      const crease = [...pts].reverse().map((p) => ({ x: p.x, y: p.y - lift * 0.45 }));
      ctx.filter = `blur(${Math.max(2, faceW * 0.02)}px)`;
      ctx.beginPath();
      trace(ctx, [...pts, ...crease]);
      ctx.fillStyle = rgba(darken(look.eyes, 0.7), 0.45 * k);
      ctx.fill();
    });
  }

  if (look.blush) {
    ctx.filter = `blur(${Math.max(4, faceW * 0.02)}px)`;
    CHEEKS.forEach((i) => {
      const c = P(i);
      const r = faceW * 0.16;
      const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, r);
      g.addColorStop(0, rgba(look.blush, 0.75 * k));
      g.addColorStop(0.6, rgba(look.blush, 0.35 * k));
      g.addColorStop(1, rgba(look.blush, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  if (look.lips) {
    ctx.filter = `blur(${Math.max(0.8, faceW * 0.004)}px)`;
    ctx.beginPath();
    trace(ctx, OUTER_LIPS.map(P));
    trace(ctx, INNER_LIPS.map(P));
    ctx.fillStyle = rgba(look.lips, 0.95 * k);
    ctx.fill("evenodd");
    // second pass for saturation
    ctx.fillStyle = rgba(look.lips, 0.35 * k);
    ctx.fill("evenodd");
  }

  if (look.liner) {
    // brows
    ctx.filter = `blur(${Math.max(1, faceW * 0.008)}px)`;
    EYES.forEach(({ browRow, browLow }) => {
      ctx.beginPath();
      trace(ctx, [...browRow.map(P), ...[...browLow].reverse().map(P)]);
      ctx.fillStyle = rgba("#4A2A1E", 0.42 * k);
      ctx.fill();
    });
  }

  ctx.filter = "none";
  if (look.liner) {
    ctx.globalCompositeOperation = "source-over";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = rgba("#2A0F16", 0.9 * k);
    EYES.forEach(({ lash, outer, inner }) => {
      const pts = lash.map(P);
      const o = P(outer), n = P(inner);
      const dir = Math.sign(o.x - n.x) || 1;
      const wing = { x: o.x + dir * faceW * 0.035, y: o.y - faceW * 0.03 };
      // liner along lash line, thickening towards outer corner + wing
      for (let i = 0; i < pts.length - 1; i++) {
        const t = i / (pts.length - 1);
        ctx.lineWidth = Math.max(1.2, faceW * (0.006 + 0.008 * (1 - t)));
        ctx.beginPath();
        ctx.moveTo(pts[i].x, pts[i].y);
        ctx.lineTo(pts[i + 1].x, pts[i + 1].y);
        ctx.stroke();
      }
      ctx.lineWidth = Math.max(1.2, faceW * 0.011);
      ctx.beginPath();
      ctx.moveTo(o.x, o.y);
      ctx.lineTo(wing.x, wing.y);
      ctx.stroke();
      // lash shadow under liner
      ctx.strokeStyle = rgba("#2A0F16", 0.35 * k);
      ctx.lineWidth = Math.max(1.5, faceW * 0.016);
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y - faceW * 0.004) : ctx.moveTo(p.x, p.y - faceW * 0.004)));
      ctx.stroke();
      ctx.strokeStyle = rgba("#2A0F16", 0.9 * k);
    });
  }

  // highlighter — nose bridge & cheekbones
  ctx.globalCompositeOperation = "soft-light";
  ctx.filter = `blur(${Math.max(3, faceW * 0.02)}px)`;
  ctx.strokeStyle = `rgba(255,255,255,${0.7 * k})`;
  ctx.lineWidth = faceW * 0.035;
  ctx.lineCap = "round";
  ctx.beginPath();
  NOSE.map(P).forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.stroke();
  ctx.filter = "none";

  if (look.lips && look.gloss) {
    const a = P(13), b = P(14);
    const c = { x: (a.x + b.x) / 2, y: b.y + (P(17).y - b.y) * 0.45 };
    const r = faceW * 0.07;
    const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, r);
    g.addColorStop(0, "rgba(255,255,255,0.95)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, r * 1.6, r * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
