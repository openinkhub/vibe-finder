export const LAB_LOOKS = [
  { key: "natural", name: "Natural", lips: "#C98A7A", blush: "#EFC0B4", eyes: "#B89078", liner: false, intensity: 0.5 },
  { key: "bridal", name: "Bridal", lips: "#B3122E", blush: "#E8788A", eyes: "#8A4B2E", liner: true, intensity: 0.9 },
  { key: "editorial", name: "Editorial", lips: "#7A1F3D", blush: "#D98A9C", eyes: "#4A2530", liner: true, intensity: 1 },
  { key: "glam", name: "Glam", lips: "#E62E6B", blush: "#F28FB0", eyes: "#6E2C3C", liner: true, intensity: 1 },
];

const S = 1024;
const CX = 0.25 * S;
const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };

const eye = (ctx, cx, cy, w, h, look, dir) => {
  const k = look.intensity;
  // eyeshadow
  ctx.save();
  ctx.filter = "blur(14px)";
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = rgba(look.eyes, 0.9 * k);
  ctx.beginPath(); ctx.ellipse(cx + dir * w * 0.15, cy - h * 0.9, w * 1.25, h * 1.4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = rgba(look.eyes, 0.45 * k);
  ctx.beginPath(); ctx.ellipse(cx + dir * w * 0.7, cy - h * 0.7, w * 0.8, h * 1.1, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // lid crease shadow
  ctx.save(); ctx.filter = "blur(4px)"; ctx.strokeStyle = "rgba(120,70,60,0.35)"; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(cx - w, cy - h * 0.2); ctx.quadraticCurveTo(cx, cy - h * 2.2, cx + w, cy - h * 0.2); ctx.stroke(); ctx.restore();
  // eye white
  ctx.beginPath(); ctx.moveTo(cx - w, cy); ctx.quadraticCurveTo(cx, cy - h * 1.6, cx + w, cy); ctx.quadraticCurveTo(cx, cy + h * 1.2, cx - w, cy); ctx.closePath();
  ctx.fillStyle = "#FFF8F3"; ctx.fill();
  ctx.save(); ctx.clip();
  ctx.fillStyle = "#3B2218"; ctx.beginPath(); ctx.arc(cx + dir * 2, cy - 2, h * 0.62, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#6B3D2A"; ctx.beginPath(); ctx.arc(cx + dir * 2, cy - 2, h * 0.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#14090C"; ctx.beginPath(); ctx.arc(cx + dir * 2, cy - 2, h * 0.28, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.beginPath(); ctx.arc(cx - h * 0.2 + dir * 2, cy - h * 0.28, h * 0.11, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // liner + lashes
  ctx.lineCap = "round";
  ctx.strokeStyle = look.liner ? "#1E0C12" : "rgba(60,30,30,0.7)";
  ctx.lineWidth = look.liner ? 7 : 3;
  ctx.beginPath(); ctx.moveTo(cx - w, cy); ctx.quadraticCurveTo(cx, cy - h * 1.7, cx + w, cy - 1); ctx.stroke();
  if (look.liner) { ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(cx + dir * w, cy - 1); ctx.lineTo(cx + dir * (w + 22), cy - 16); ctx.stroke(); }
  ctx.lineWidth = 2.5;
  for (let i = -3; i <= 3; i++) { const t = i / 3; const x = cx + t * w * 0.85; const y = cy - h * 1.5 * (1 - t * t) - 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + t * 4 + dir * 2, y - 8 - (1 - Math.abs(t)) * 4); ctx.stroke(); }
  ctx.strokeStyle = "rgba(40,20,20,0.5)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx - w * 0.9, cy + 2); ctx.quadraticCurveTo(cx, cy + h * 1.15, cx + w * 0.9, cy + 2); ctx.stroke();
  // brow
  ctx.strokeStyle = look.liner ? "#3A2016" : "#5A3A2C"; ctx.lineWidth = look.liner ? 9 : 7;
  ctx.beginPath(); ctx.moveTo(cx - w * 1.05, cy - h * 3.3); ctx.quadraticCurveTo(cx + dir * w * 0.2, cy - h * 4.6, cx + w * 1.15, cy - h * 3.6); ctx.stroke();
};

export function paintFaceTexture(canvas, look) {
  if (canvas.width !== S) { canvas.width = S; canvas.height = S; }
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, S, S);
  const skin = ctx.createLinearGradient(0, 0, 0, S);
  skin.addColorStop(0, "#F6E1D3"); skin.addColorStop(0.6, "#F1D3C2"); skin.addColorStop(1, "#E8C2AE");
  ctx.fillStyle = skin; ctx.fillRect(0, 0, S, S);
  // subtle contour under cheekbones + jaw
  ctx.save(); ctx.filter = "blur(30px)"; ctx.fillStyle = "rgba(190,130,110,0.35)";
  ctx.beginPath(); ctx.ellipse(CX - 120, 0.6 * S, 45, 80, 0.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(CX + 120, 0.6 * S, 45, 80, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // blush
  ctx.save(); ctx.filter = "blur(26px)"; ctx.globalCompositeOperation = "multiply";
  [-1, 1].forEach((d) => { ctx.fillStyle = rgba(look.blush, 0.8 * look.intensity); ctx.beginPath(); ctx.ellipse(CX + d * 70, 0.545 * S, 36, 26, d * 0.35, 0, Math.PI * 2); ctx.fill(); });
  ctx.restore();
  // highlighter
  ctx.save(); ctx.filter = "blur(18px)"; ctx.fillStyle = "rgba(255,255,255,0.45)";
  [-1, 1].forEach((d) => { ctx.beginPath(); ctx.ellipse(CX + d * 95, 0.5 * S, 22, 12, d * 0.4, 0, Math.PI * 2); ctx.fill(); });
  ctx.fillRect(CX - 8, 0.42 * S, 16, 0.2 * S);
  ctx.restore();
  // eyes
  eye(ctx, CX - 46, 0.44 * S, 24, 11, look, -1);
  eye(ctx, CX + 46, 0.44 * S, 24, 11, look, 1);
  // nose shadow
  ctx.save(); ctx.filter = "blur(8px)"; ctx.fillStyle = "rgba(170,110,95,0.35)";
  ctx.beginPath(); ctx.ellipse(CX - 10, 0.55 * S, 6, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(CX + 10, 0.55 * S, 6, 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  // lips
  const ly = 0.635 * S, lw = 42;
  const lips = () => {
    ctx.beginPath();
    ctx.moveTo(CX - lw, ly);
    ctx.quadraticCurveTo(CX - lw * 0.55, ly - 16, CX - 9, ly - 10);
    ctx.quadraticCurveTo(CX, ly - 3, CX + 9, ly - 10);
    ctx.quadraticCurveTo(CX + lw * 0.55, ly - 16, CX + lw, ly);
    ctx.quadraticCurveTo(CX, ly + 30, CX - lw, ly);
    ctx.closePath();
  };
  ctx.save(); ctx.filter = "blur(1.2px)"; lips(); ctx.fillStyle = rgba(look.lips, 0.98); ctx.fill(); ctx.restore();
  ctx.save(); lips(); ctx.clip();
  ctx.fillStyle = "rgba(0,0,0,0.22)"; ctx.fillRect(CX - lw, ly - 20, lw * 2, 20);
  const gl = ctx.createRadialGradient(CX, ly + 16, 2, CX, ly + 16, 30); gl.addColorStop(0, "rgba(255,255,255,0.6)"); gl.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gl; ctx.fillRect(CX - lw, ly, lw * 2, 32);
  ctx.restore();
  ctx.strokeStyle = "rgba(60,20,25,0.55)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(CX - lw, ly); ctx.quadraticCurveTo(CX, ly + 6, CX + lw, ly); ctx.stroke();
  // freckle-free porcelain sheen
  const sheen = ctx.createRadialGradient(CX, 0.3 * S, 10, CX, 0.3 * S, 220); sheen.addColorStop(0, "rgba(255,255,255,0.25)"); sheen.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sheen; ctx.fillRect(0, 0, S, S);
}
