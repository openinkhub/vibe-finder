const OUTER_LIPS = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185];
const INNER_LIPS = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191];
const EYES = [
  { lash: [33, 246, 161, 160, 159, 158, 157, 173, 133], brow: 52 },
  { lash: [263, 466, 388, 387, 386, 385, 384, 398, 362], brow: 282 },
];
const CHEEKS = [50, 280];
const FACE_L = 234, FACE_R = 454;

const rgba = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
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
    ctx.filter = `blur(${Math.max(2, faceW * 0.028)}px)`;
    EYES.forEach(({ lash, brow }) => {
      const pts = lash.map(P);
      const lashY = pts.reduce((s, p) => s + p.y, 0) / pts.length;
      const lift = (lashY - P(brow).y) * 0.62;
      const top = [...pts].reverse().map((p, i, arr) => ({ x: p.x + (i - arr.length / 2) * faceW * 0.004, y: p.y - lift }));
      ctx.beginPath();
      trace(ctx, [...pts, ...top]);
      ctx.fillStyle = rgba(look.eyes, 0.62 * k);
      ctx.fill();
    });
  }

  if (look.blush) {
    ctx.filter = `blur(${Math.max(4, faceW * 0.02)}px)`;
    CHEEKS.forEach((i) => {
      const c = P(i);
      const r = faceW * 0.15;
      const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, r);
      g.addColorStop(0, rgba(look.blush, 0.55 * k));
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
    ctx.fillStyle = rgba(look.lips, 0.88 * k);
    ctx.fill("evenodd");
  }

  ctx.filter = "none";
  if (look.liner) {
    ctx.globalCompositeOperation = "source-over";
    ctx.lineCap = "round";
    ctx.lineWidth = Math.max(1, faceW * 0.007);
    ctx.strokeStyle = rgba("#3A1620", 0.75 * k);
    EYES.forEach(({ lash }) => {
      const pts = lash.map(P);
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.stroke();
    });
  }

  if (look.lips && look.gloss) {
    ctx.globalCompositeOperation = "soft-light";
    const a = P(13), b = P(14);
    const c = { x: (a.x + b.x) / 2, y: b.y + (P(17).y - b.y) * 0.45 };
    const r = faceW * 0.07;
    const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, r);
    g.addColorStop(0, "rgba(255,255,255,0.9)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, r * 1.6, r * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
