import React, { useCallback, useEffect, useState } from "react";
import { LogOut, RefreshCw, Phone, Mail, Calendar, Sparkles, Trash2, Loader2, Lock, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { api, errorText, TOKEN_KEY } from "../lib/api";
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
  <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#F1DCE3]" data-testid={`enquiry-card-${e.id}`}>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <div className="font-display text-xl text-[#4A2530]">{e.name}</div>
        <div className="font-mono text-[10px] uppercase tracking-wider text-[#8B7F82] mt-1">{e.service}{e.date ? ` · ${e.date}` : ""} · {new Date(e.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</div>
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
      <a href={`https://wa.me/${e.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#25D366] text-white">WhatsApp</a>
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

  const logout = useCallback(() => { localStorage.removeItem(TOKEN_KEY); setUser(false); }, []);

  const refresh = useCallback(async (f = filter) => {
    setLoading(true);
    try {
      const [a, b] = await Promise.all([api.get("/enquiries", { params: { status: f } }), api.get("/enquiries/stats")]);
      setItems(a.data); setStats(b.data);
    } catch (err) {
      if (err?.response?.status === 401) logout(); else toast.error(errorText(err));
    } finally { setLoading(false); }
  }, [filter, logout]);

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) { setUser(false); return; }
    api.get("/auth/me").then((r) => setUser(r.data)).catch(() => logout());
  }, [logout]);

  useEffect(() => { if (user) refresh(filter); }, [user, filter, refresh]);

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
            <button onClick={() => refresh()} className="w-10 h-10 rounded-full border border-[#F1DCE3] flex items-center justify-center text-[#4A2530] hover:text-[#E62E6B]" aria-label="Refresh" data-testid="admin-refresh-btn"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /></button>
            <button onClick={logout} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#E62E6B] text-white text-sm font-medium hover:bg-[#C81F57]" data-testid="admin-logout-btn"><LogOut size={15} /> Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-5 sm:px-8 py-8 sm:py-12">
        <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Enquiries</span>
        <h1 className="font-display text-4xl sm:text-5xl text-[#4A2530] mt-3">Who's waiting to hear from you</h1>

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
      </main>
    </div>
  );
}
