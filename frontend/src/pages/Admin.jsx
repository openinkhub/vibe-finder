import React, { useCallback, useEffect, useRef, useState } from "react";
import { LogOut, RefreshCw, Phone, Mail, Calendar, Sparkles, Trash2, Loader2, Lock, ArrowLeft, Bell, BellRing, Mic, Inbox, IndianRupee, Images, Scissors, CalendarDays, MessageCircle, Image as ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { api, errorText, TOKEN_KEY, imgUrl } from "../lib/api";
import { PricingEditor } from "./admin/PricingEditor";
import { PortfolioEditor } from "./admin/PortfolioEditor";
import { ServicesEditor } from "./admin/ServicesEditor";
import { CalendarEditor } from "./admin/CalendarEditor";
import { HeroImagesEditor } from "./admin/HeroImagesEditor";
import { brand } from "../mock/mock";

const STATUSES = ["new", "replied", "booked", "closed"];
const STATUS_STYLE = {
  new: "bg-[#E62E6B] text-white",
  replied: "bg-[#F4B7CE] text-[#4A2530]",
  booked: "bg-[#1c7a45] text-white",
  closed: "bg-[#EBE6DB] text-[#8B7F82]",
};

const inputCls = "w-full px-4 py-3 rounded-xl border border-[#F1DCE3] bg-[#FBFAF7] text-[#4A2530] focus:outline-none focus:border-[#E62E6B] focus:ring-2 focus:ring-[#E62E6B]/15 transition-all";

const Login = ({ onLogin }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const { data } = await api.post("/auth/login", form);
      localStorage.setItem(TOKEN_KEY, data.token);
      onLogin(data.user);
    } catch (err) { setError(errorText(err)); } finally { setBusy(false); }
  };
  return (
    <div className="min-h-screen bg-[#F4F1EA] flex items-center justify-center px-5 py-16">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-[28px] p-8 border border-[#F1DCE3] shadow-[0_30px_80px_-40px_rgba(230,46,107,0.45)]" data-testid="admin-login-form">
        <img src={brand.logo} alt="Rekha Krishnamurthy" className="h-12 w-auto" />
        <div className="mt-6 flex items-center gap-2 text-[#E62E6B]"><Lock size={16} /><span className="font-mono text-[11px] tracking-[0.24em] uppercase">Studio admin</span></div>
        <h1 className="font-display text-3xl text-[#4A2530] mt-2">Sign in</h1>
        {error && <div className="mt-4 bg-[#FBE9F0] text-[#C81F57] px-4 py-3 rounded-xl text-sm" data-testid="admin-login-error">{error}</div>}
        <div className="mt-6 space-y-4">
          <input type="email" required placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} data-testid="admin-email-input" />
          <input type="password" required placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputCls} data-testid="admin-password-input" />
        </div>
        <button type="submit" disabled={busy} className="mt-6 w-full py-3.5 rounded-full bg-[#E62E6B] text-white font-medium hover:bg-[#C81F57] transition-colors disabled:opacity-60 inline-flex items-center justify-center gap-2" data-testid="admin-login-btn">{busy && <Loader2 size={16} className="animate-spin" />} Sign in</button>
        <Link to="/" className="mt-5 inline-flex items-center gap-1.5 text-sm text-[#8B7F82] hover:text-[#E62E6B]" data-testid="admin-back-link"><ArrowLeft size={14} /> Back to site</Link>
      </form>
    </div>
  );
};

const EnquiryCard = ({ e, onStatus, onDelete }) => (
  <div className={`bg-white rounded-3xl p-5 sm:p-6 border ${e.seen === false ? "border-[#E62E6B]/60 shadow-lg shadow-[#E62E6B]/10" : "border-[#F1DCE3]"}`} data-testid={`enquiry-card-${e.id}`}>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        {e.look_image && <img src={imgUrl(e.look_image)} alt={e.look || "look"} className="w-16 h-20 rounded-xl object-cover border border-[#F1DCE3] shrink-0" data-testid={`enquiry-look-image-${e.id}`} />}
        <div>
        <div className="font-display text-xl text-[#4A2530] flex items-center gap-2">{e.seen === false && <span className="w-2 h-2 rounded-full bg-[#E62E6B] animate-pulse" title="New" />}{e.name}{e.source === "voice" && <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase bg-[#FBE9F0] text-[#E62E6B] px-2 py-0.5 rounded-full"><Mic size={10} /> voice</span>}</div>
        <div className="font-mono text-[10px] uppercase tracking-wider text-[#8B7F82] mt-1">{e.service}{e.date ? ` · ${e.date}` : ""} · {new Date(e.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</div>
        </div>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[e.status]}`} data-testid={`enquiry-status-${e.id}`}>{e.status}</span>
    </div>
    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#5C4E52]">
      <a href={`tel:${e.phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 hover:text-[#E62E6B]"><Phone size={14} className="text-[#E62E6B]" /> {e.phone}</a>
      {e.email && <a href={`mailto:${e.email}`} className="flex items-center gap-1.5 hover:text-[#E62E6B]"><Mail size={14} className="text-[#E62E6B]" /> {e.email}</a>}
      {e.date && <span className="flex items-center gap-1.5"><Calendar size={14} className="text-[#E62E6B]" /> {e.date}</span>}
      {e.look && <span className="flex items-center gap-1.5 bg-[#FBE9F0] px-2.5 py-0.5 rounded-full"><Sparkles size={13} className="text-[#E62E6B]" /> {e.look}</span>}
    </div>
    {e.message && <p className="mt-3 text-sm text-[#5C4E52] leading-relaxed bg-[#FBFAF7] rounded-xl px-4 py-3">{e.message}</p>}
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {STATUSES.filter((s) => s !== e.status).map((s) => (
        <button key={s} onClick={() => onStatus(e.id, s)} className="px-3 py-1.5 rounded-full text-xs font-medium border border-[#F1DCE3] text-[#4A2530] hover:border-[#E62E6B] hover:text-[#E62E6B] transition-colors capitalize" data-testid={`enquiry-set-${s}-${e.id}`}>Mark {s}</button>
      ))}
      <div className="flex-1" />
      <a href={`https://wa.me/${e.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi ${e.name.split(" ")[0]}, this is Rekha Krishnamurthy 💄 Thank you for your ${e.service.toLowerCase()} enquiry${e.date ? ` for ${e.date}` : ""}${e.look ? ` — I love that you picked the "${e.look}" look` : ""}! I'd be happy to hold your date. When would be a good time for a quick free consultation call?`)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#25D366] text-white" data-testid={`enquiry-whatsapp-${e.id}`}><MessageCircle size={12} /> Reply on WhatsApp</a>
      <button onClick={() => onDelete(e.id)} className="w-8 h-8 rounded-full flex items-center justify-center text-[#8B7F82] hover:text-[#C81F57] hover:bg-[#FBE9F0]" aria-label="Delete" data-testid={`enquiry-delete-${e.id}`}><Trash2 size={14} /></button>
    </div>
  </div>
);

export default function Admin() {
  const [user, setUser] = useState(undefined);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("enquiries");
  const [notify, setNotify] = useState(() => typeof Notification !== "undefined" && Notification.permission === "granted");
  const prevUnseen = useRef(null);

  const logout = useCallback(() => { localStorage.removeItem(TOKEN_KEY); setUser(false); }, []);

  const refresh = useCallback(async (f = filter) => {
    setLoading(true);
    try {
      const [a, b] = await Promise.all([api.get("/enquiries", { params: { status: f } }), api.get("/enquiries/stats")]);
      setItems(a.data); setStats(b.data);
      const unseen = b.data.unseen || 0;
      if (prevUnseen.current != null && unseen > prevUnseen.current) {
        toast(`${unseen - prevUnseen.current} new enquir${unseen - prevUnseen.current === 1 ? "y" : "ies"} just arrived`, { icon: "💄" });
        if (typeof Notification !== "undefined" && Notification.permission === "granted") new Notification("New enquiry — Rekha Krishnamurthy", { body: `${a.data[0]?.name || "Someone"} · ${a.data[0]?.service || ""}`, icon: "/logo.png" });
      }
      prevUnseen.current = unseen;
    } catch (err) {
      if (err?.response?.status === 401) logout(); else toast.error(errorText(err));
    } finally { setLoading(false); }
  }, [filter, logout]);

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) { setUser(false); return; }
    api.get("/auth/me").then((r) => setUser(r.data)).catch(() => logout());
  }, [logout]);

  useEffect(() => { if (user) refresh(filter); }, [user, filter, refresh]);
  useEffect(() => {
    if (!user) return;
    const id = setInterval(() => refresh(), 20000);
    return () => clearInterval(id);
  }, [user, refresh]);

  const markSeen = async () => { try { await api.post("/enquiries/mark-seen"); refresh(); } catch (err) { toast.error(errorText(err)); } };
  const enableNotify = async () => {
    if (typeof Notification === "undefined") { toast.error("Browser notifications aren't supported here"); return; }
    const p = await Notification.requestPermission();
    setNotify(p === "granted");
    toast(p === "granted" ? "Browser alerts on — you'll be pinged on new enquiries" : "Notifications blocked in browser settings");
  };

  const setStatus = async (id, status) => {
    try { await api.patch(`/enquiries/${id}`, { status }); toast.success(`Marked ${status}`); refresh(); } catch (err) { toast.error(errorText(err)); }
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this enquiry?")) return;
    try { await api.delete(`/enquiries/${id}`); toast.success("Deleted"); refresh(); } catch (err) { toast.error(errorText(err)); }
  };

  if (user === undefined) return <div className="min-h-screen bg-[#F4F1EA] flex items-center justify-center text-[#E62E6B]"><Loader2 className="animate-spin" /></div>;
  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className="min-h-screen bg-[#F4F1EA]" data-testid="admin-dashboard">
      <header className="bg-white/90 backdrop-blur border-b border-[#F1DCE3]">
        <div className="max-w-[1100px] mx-auto px-5 sm:px-8 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3" data-testid="admin-logo-link"><img src={brand.logo} alt="Rekha Krishnamurthy" className="h-9 sm:h-10 w-auto" /></Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:block font-mono text-[10px] uppercase tracking-wider text-[#8B7F82]">{user.email}</span>
            <button onClick={enableNotify} className={`relative w-10 h-10 rounded-full border flex items-center justify-center ${notify ? "border-[#E62E6B] text-[#E62E6B]" : "border-[#F1DCE3] text-[#4A2530]"}`} aria-label="Enable browser alerts" title={notify ? "Browser alerts on" : "Enable browser alerts"} data-testid="admin-notify-btn">
              {notify ? <BellRing size={16} /> : <Bell size={16} />}
              {stats?.unseen > 0 && <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#E62E6B] text-white text-[10px] font-bold flex items-center justify-center" data-testid="admin-unseen-badge">{stats.unseen}</span>}
            </button>
            <button onClick={() => refresh()} className="w-10 h-10 rounded-full border border-[#F1DCE3] flex items-center justify-center text-[#4A2530] hover:text-[#E62E6B]" aria-label="Refresh" data-testid="admin-refresh-btn"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /></button>
            <button onClick={logout} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#E62E6B] text-white text-sm font-medium hover:bg-[#C81F57]" data-testid="admin-logout-btn"><LogOut size={15} /> Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-5 sm:px-8 py-8 sm:py-12">
        <div className="flex flex-wrap gap-2 mb-8" data-testid="admin-tabs">
          {[["enquiries", "Enquiries", Inbox], ["calendar", "Calendar", CalendarDays], ["services", "Services", Scissors], ["pricing", "Pricing", IndianRupee], ["portfolio", "Portfolio", Images], ["heroes", "Page heroes", ImageIcon]].map(([k, label, Icon]) => (
            <button key={k} onClick={() => setTab(k)} className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border transition-colors ${tab === k ? "bg-[#E62E6B] border-[#E62E6B] text-white" : "bg-white border-[#F1DCE3] text-[#4A2530] hover:border-[#E62E6B]"}`} data-testid={`admin-tab-${k}`}>
              <Icon size={15} /> {label}{k === "enquiries" && stats?.unseen > 0 && <span className={`ml-1 px-1.5 rounded-full text-[10px] ${tab === k ? "bg-white text-[#E62E6B]" : "bg-[#E62E6B] text-white"}`}>{stats.unseen}</span>}
            </button>
          ))}
        </div>

        {tab === "calendar" && (<><span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Availability</span><h1 className="font-display text-4xl sm:text-5xl text-[#4A2530] mt-3 mb-2">Booked dates & hours</h1><p className="text-sm text-[#5C4E52] mb-8">Only you can edit this. Visitors see it read-only on the site so they enquire for open slots.</p><CalendarEditor /></>)}
        {tab === "services" && (<><span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Editable content</span><h1 className="font-display text-4xl sm:text-5xl text-[#4A2530] mt-3 mb-8">Services</h1><ServicesEditor /></>)}
        {tab === "pricing" && (<><span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Editable content</span><h1 className="font-display text-4xl sm:text-5xl text-[#4A2530] mt-3 mb-8">Pricing cards</h1><PricingEditor /></>)}
        {tab === "portfolio" && (<><span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Editable content</span><h1 className="font-display text-4xl sm:text-5xl text-[#4A2530] mt-3 mb-8">Portfolio photos</h1><PortfolioEditor /></>)}
        {tab === "heroes" && (<><span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Editable content</span><h1 className="font-display text-4xl sm:text-5xl text-[#4A2530] mt-3 mb-8">Page hero images</h1><HeroImagesEditor /></>)}
        {tab === "enquiries" && (<>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Enquiries</span>
            <h1 className="font-display text-4xl sm:text-5xl text-[#4A2530] mt-3">Who's waiting to hear from you</h1>
          </div>
          {stats?.unseen > 0 && <button onClick={markSeen} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#E62E6B] text-[#E62E6B] text-sm font-medium hover:bg-[#FBE9F0]" data-testid="admin-mark-seen-btn"><Bell size={15} /> Mark {stats.unseen} as seen</button>}
        </div>
        {stats?.alerts && !stats.alerts.email && <p className="mt-4 text-xs text-[#8B7F82] bg-white border border-[#F1DCE3] rounded-xl px-4 py-2.5 inline-block" data-testid="admin-alerts-note">In-app alerts are on. Email alerts will switch on automatically once RESEND_API_KEY and ALERT_TO_EMAIL are added to the backend .env.</p>}

        {stats && (
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-5 gap-3" data-testid="admin-stats">
            {["total", ...STATUSES].map((k) => (
              <button key={k} onClick={() => setFilter(k === "total" ? "all" : k)} className={`text-left rounded-2xl p-4 border transition-colors ${(filter === "all" && k === "total") || filter === k ? "bg-[#E62E6B] border-[#E62E6B] text-white" : "bg-white border-[#F1DCE3] text-[#4A2530] hover:border-[#E62E6B]"}`} data-testid={`admin-filter-${k}`}>
                <div className="font-display text-3xl">{stats[k]}</div>
                <div className="font-mono text-[10px] uppercase tracking-wider opacity-70 mt-1">{k}</div>
              </button>
            ))}
          </div>
        )}

        <div className="mt-8 space-y-4" data-testid="admin-enquiry-list">
          {items.length === 0 && !loading && <div className="bg-white rounded-3xl p-10 text-center text-[#8B7F82] border border-[#F1DCE3]" data-testid="admin-empty">No enquiries {filter !== "all" ? `marked ${filter}` : "yet"}.</div>}
          {items.map((e) => <EnquiryCard key={e.id} e={e} onStatus={setStatus} onDelete={remove} />)}
        </div>
        </>)}
      </main>
    </div>
  );
}
