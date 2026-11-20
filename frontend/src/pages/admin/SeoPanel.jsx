import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw, Search, X, CheckCircle2, AlertTriangle, XCircle, MinusCircle, Wand2, Undo2, Save, Plus, Trash2, ExternalLink, ArrowRightLeft, FileWarning, Gauge, Settings2, KeyRound, ListChecks } from "lucide-react";
import { toast } from "sonner";
import { api, errorText } from "../../lib/api";

const fieldCls = "px-3.5 py-2.5 rounded-xl border border-[#F1DCE3] bg-[#FBFAF7] text-[#4A2530] text-sm focus:outline-none focus:border-[#E62E6B] transition-all";
const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-[#F1DCE3] bg-[#FBFAF7] text-[#4A2530] text-sm focus:outline-none focus:border-[#E62E6B] transition-all";
const labelCls = "block text-xs font-mono uppercase tracking-wider text-[#8B7F82] mb-1.5";
const btn = "inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50";
const btnPrimary = `${btn} bg-[#E62E6B] text-white hover:bg-[#C81F57]`;
const btnGhost = `${btn} bg-white border border-[#F1DCE3] text-[#4A2530] hover:border-[#E62E6B]`;
const card = "bg-white rounded-2xl border border-[#F1DCE3]";
const CATS = [["seo", "SEO"], ["content", "Content"], ["readability", "Readability"], ["performance", "Speed"]];

const scoreColor = (s) => (s === null || s === undefined ? "text-[#8B7F82] bg-[#F4F1EA]" : s >= 90 ? "text-[#1c7a45] bg-[#E6F4EC]" : s >= 70 ? "text-[#8a5a00] bg-[#FFF3D6]" : "text-[#B3123F] bg-[#FDE4EA]");

export const ScoreBadge = ({ score, label, big }) => (
  <span className={`inline-flex items-center justify-center rounded-full font-semibold ${big ? "w-14 h-14 text-lg" : "min-w-[38px] h-7 px-2 text-xs"} ${scoreColor(score)}`} title={label}>
    {score === null || score === undefined ? "–" : score}
  </span>
);

const StatusIcon = ({ s }) => {
  if (s === "pass") return <CheckCircle2 size={16} className="text-[#1c7a45] shrink-0" />;
  if (s === "warn") return <AlertTriangle size={16} className="text-[#C88A00] shrink-0" />;
  if (s === "fail") return <XCircle size={16} className="text-[#C81F57] shrink-0" />;
  return <MinusCircle size={16} className="text-[#B9AEB1] shrink-0" />;
};

// Google-style result preview.
const SerpPreview = ({ title, description, url }) => (
  <div className="rounded-xl border border-[#F1DCE3] bg-white p-4 font-sans" data-testid="seo-serp-preview">
    <div className="text-xs text-[#4d5156] truncate">{url}</div>
    <div className="text-[18px] leading-snug text-[#1a0dab] truncate">{title || "(no title)"}</div>
    <div className="text-[13px] text-[#4d5156] line-clamp-2">{description || "(no description)"}</div>
    <div className="mt-2 text-[11px] text-[#8B7F82]">Title {String(title || "").length}/60 · Description {String(description || "").length}/160</div>
  </div>
);

// Checks grouped by score category.
export const CheckList = ({ results, compact }) => {
  const [open, setOpen] = useState(compact ? null : "seo");
  return (
    <div className="space-y-2">
      {CATS.map(([cat, label]) => {
        const rows = results.filter((r) => r.cat === cat);
        if (!rows.length) return null;
        const bad = rows.filter((r) => r.status === "fail" || r.status === "warn").length;
        return (
          <div key={cat} className="border border-[#F1DCE3] rounded-xl overflow-hidden">
            <button type="button" onClick={() => setOpen(open === cat ? null : cat)} className="w-full flex items-center justify-between px-4 py-2.5 bg-[#FBFAF7] text-sm font-medium text-[#4A2530]">
              <span>{label}</span>
              <span className="text-xs text-[#8B7F82]">{bad ? `${bad} to improve` : "All good"} {open === cat ? "▴" : "▾"}</span>
            </button>
            {open === cat && (
              <ul className="divide-y divide-[#F6E9EE]">
                {rows.map((r) => (
                  <li key={r.id} className="px-4 py-2.5 flex gap-3 text-sm" data-testid={`seo-check-${r.id}`}>
                    <StatusIcon s={r.status} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <span className="font-medium text-[#4A2530]">{r.label}</span>
                        {r.value && <span className="text-xs text-[#8B7F82] break-all">{String(r.value).slice(0, 120)}</span>}
                        {r.auto && r.status !== "pass" && r.status !== "na" && <span className="text-[10px] font-mono uppercase text-[#E62E6B]">auto-fix</span>}
                      </div>
                      {r.msg && r.status !== "pass" && <div className="text-xs text-[#5C4E52]">{r.msg}</div>}
                      {r.fix && r.status !== "pass" && <div className="text-xs text-[#1c7a45]">→ {r.fix}</div>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── Detail panel for one page or post ──
export const SeoItemPanel = ({ path, onClose, onChanged }) => {
  const [item, setItem] = useState(null);
  const [f, setF] = useState({});
  const [busy, setBusy] = useState("");
  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/seo/report/item", { params: { path } });
      setItem(data);
      const o = data.override || {};
      setF({ seo_title: o.seo_title || "", meta_description: o.meta_description || "", keyphrase: o.keyphrase || "", related_keywords: (o.related_keywords || []).join(", "), canonical: o.canonical || "", og_title: o.og_title || "", og_description: o.og_description || "", og_image: o.og_image || "", noindex: !!o.noindex, nofollow: !!o.nofollow, in_sitemap: o.in_sitemap !== false, custom_schema: o.custom_schema || "" });
    } catch (e) { toast.error(errorText(e)); }
  }, [path]);
  useEffect(() => { load(); }, [load]);

  const isPost = item && item.kind === "post";
  const save = async () => {
    setBusy("save");
    try {
      const body = { path, ...f };
      // Blog posts keep title, description and keyword on the post itself (edit them in the post form).
      if (isPost) { delete body.seo_title; delete body.meta_description; delete body.keyphrase; }
      await api.put("/seo/meta", body);
      await api.get("/seo/report", { params: { refresh: 1 } });
      toast.success("Saved");
      await load(); onChanged && onChanged();
    } catch (e) { toast.error(errorText(e)); } finally { setBusy(""); }
  };
  const auto = async () => {
    setBusy("auto");
    try {
      const { data } = await api.post("/seo/autoconfig", { apply: true, paths: [path] });
      toast.success(data.count ? "Auto-configured" : "Nothing to fix automatically");
      await load(); onChanged && onChanged();
    } catch (e) { toast.error(errorText(e)); } finally { setBusy(""); }
  };
  const undo = async () => {
    setBusy("undo");
    try { await api.post("/seo/rollback", { path }); toast.success("Last automatic change undone"); await load(); onChanged && onChanged(); }
    catch (e) { toast.error(errorText(e)); } finally { setBusy(""); }
  };
  const hasAuto = item && (item.history || []).some((h) => h.source === "auto" && !h.undone);

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex justify-end" onClick={onClose} data-testid="seo-item-panel">
      <div className="w-full max-w-[760px] h-full overflow-y-auto bg-[#F4F1EA] p-5 sm:p-7" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="min-w-0">
            <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">{item ? (isPost ? "Blog post" : item.group || "Page") : "Loading"}</span>
            <h2 className="font-display text-2xl sm:text-3xl text-[#4A2530] mt-1 break-words">{item ? item.name : path}</h2>
            <a href={path} target="_blank" rel="noreferrer" className="text-xs text-[#8B7F82] hover:text-[#E62E6B] inline-flex items-center gap-1">{path} <ExternalLink size={11} /></a>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full border border-[#F1DCE3] bg-white flex items-center justify-center shrink-0" aria-label="Close"><X size={16} /></button>
        </div>
        {!item ? <Loader2 className="animate-spin text-[#E62E6B]" /> : (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-4">
              {CATS.map(([k, label]) => <div key={k} className="flex flex-col items-center gap-1"><ScoreBadge score={item.scores[k]} big /><span className="text-xs text-[#5C4E52]">{label}</span></div>)}
            </div>
            <SerpPreview title={item.title} description={item.description} url={item.url} />
            <div className="flex flex-wrap gap-2">
              <button onClick={auto} disabled={!!busy} className={btnPrimary} data-testid="seo-item-auto">{busy === "auto" ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />} Auto-configure this {isPost ? "post" : "page"}</button>
              {hasAuto && <button onClick={undo} disabled={!!busy} className={btnGhost} data-testid="seo-item-undo"><Undo2 size={15} /> Undo last auto change</button>}
            </div>
            <CheckList results={item.results} />

            <div className={`${card} p-5 space-y-4`}>
              <h3 className="font-display text-xl text-[#4A2530]">SEO snippet</h3>
              {isPost && <p className="text-xs text-[#8B7F82]">The SEO title, meta description and focus keyword of a post are edited in Blog → edit post.</p>}
              {!isPost && <>
                <div><label className={labelCls}>SEO title <span className="normal-case">(blank = {item.override && item.override.seo_title ? "site default" : "current"})</span></label><input value={f.seo_title} placeholder={item.title} onChange={(e) => setF({ ...f, seo_title: e.target.value })} className={inputCls} data-testid="seo-field-title" /></div>
                <div><label className={labelCls}>Meta description</label><textarea rows={3} value={f.meta_description} placeholder={item.description} onChange={(e) => setF({ ...f, meta_description: e.target.value })} className={inputCls} data-testid="seo-field-description" /></div>
                <div><label className={labelCls}>Focus keyphrase</label><input value={f.keyphrase} placeholder={item.keyphrase} onChange={(e) => setF({ ...f, keyphrase: e.target.value })} className={inputCls} data-testid="seo-field-keyphrase" /></div>
              </>}
              <div><label className={labelCls}>Related keywords (comma separated)</label><input value={f.related_keywords} onChange={(e) => setF({ ...f, related_keywords: e.target.value })} className={inputCls} /></div>
              <div><label className={labelCls}>Canonical URL (blank = this page)</label><input value={f.canonical} placeholder={item.url} onChange={(e) => setF({ ...f, canonical: e.target.value })} className={inputCls} /></div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className={labelCls}>Social title</label><input value={f.og_title} onChange={(e) => setF({ ...f, og_title: e.target.value })} className={inputCls} /></div>
                <div><label className={labelCls}>Social image URL</label><input value={f.og_image} placeholder="/og-image.webp" onChange={(e) => setF({ ...f, og_image: e.target.value })} className={inputCls} /></div>
              </div>
              <div><label className={labelCls}>Social description</label><textarea rows={2} value={f.og_description} onChange={(e) => setF({ ...f, og_description: e.target.value })} className={inputCls} /></div>
              <div className="flex flex-wrap gap-5 text-sm text-[#4A2530]">
                <label className="inline-flex items-center gap-2"><input type="checkbox" checked={!f.noindex} onChange={(e) => setF({ ...f, noindex: !e.target.checked })} /> Show in Google (index)</label>
                <label className="inline-flex items-center gap-2"><input type="checkbox" checked={!f.nofollow} onChange={(e) => setF({ ...f, nofollow: !e.target.checked })} /> Follow links</label>
                <label className="inline-flex items-center gap-2"><input type="checkbox" checked={f.in_sitemap} onChange={(e) => setF({ ...f, in_sitemap: e.target.checked })} /> Include in sitemap</label>
              </div>
              <div><label className={labelCls}>Custom schema (JSON-LD, optional)</label><textarea rows={4} value={f.custom_schema} placeholder='{"@context":"https://schema.org","@type":"..."}' onChange={(e) => setF({ ...f, custom_schema: e.target.value })} className={`${inputCls} font-mono text-[12px]`} /></div>
              <button onClick={save} disabled={!!busy} className={btnPrimary} data-testid="seo-item-save">{busy === "save" ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save</button>
            </div>

            {(item.history || []).length > 0 && (
              <div className={`${card} p-5`}>
                <h3 className="font-display text-xl text-[#4A2530] mb-3">Change history</h3>
                <ul className="space-y-2 text-xs text-[#5C4E52]">
                  {item.history.map((h, i) => (
                    <li key={i} className="border-b border-[#F6E9EE] pb-2">
                      <span className="font-mono">{h.at.slice(0, 16).replace("T", " ")}</span> · {h.source === "auto" ? "Auto-configure" : "Edited"} by {h.by}{h.undone ? " · undone" : ""}
                      <div className="text-[#8B7F82] break-words">{Object.keys(h.after || {}).filter((k) => k !== "path").join(", ")}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Page report table ──
const PageReport = ({ report, reload, loading, kindFilter = "all" }) => {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState(kindFilter);
  const [group, setGroup] = useState("all");
  const [sort, setSort] = useState(["seo", 1]);
  const [open, setOpen] = useState(null);
  const groups = useMemo(() => [...new Set((report ? report.items : []).map((i) => i.group).filter(Boolean))], [report]);
  const rows = useMemo(() => {
    if (!report) return [];
    let r = report.items.filter((i) => (kind === "all" || i.kind === kind) && (group === "all" || i.group === group) && (!q || `${i.name} ${i.path} ${i.keyphrase}`.toLowerCase().includes(q.toLowerCase())));
    const [k, dir] = sort;
    const val = (i) => (k === "issues" ? i.issues : k === "name" ? i.name : k === "updated" ? i.updated || "" : i.scores[k] ?? -1);
    return r.sort((a, b) => (val(a) > val(b) ? dir : val(a) < val(b) ? -dir : 0));
  }, [report, kind, group, q, sort]);
  const Th = ({ k, children }) => (
    <th className="px-3 py-2.5 text-left font-mono text-[10px] uppercase tracking-wider text-[#8B7F82] cursor-pointer whitespace-nowrap" onClick={() => setSort([k, sort[0] === k ? -sort[1] : 1])}>{children}{sort[0] === k ? (sort[1] > 0 ? " ↑" : " ↓") : ""}</th>
  );
  if (!report) return <Loader2 className="animate-spin text-[#E62E6B]" />;
  return (
    <div data-testid="seo-page-report">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {CATS.map(([k, label]) => (
          <div key={k} className={`${card} p-4 flex items-center gap-3`}><ScoreBadge score={report.totals[k]} big /><div><div className="text-sm font-medium text-[#4A2530]">{label}</div><div className="text-xs text-[#8B7F82]">site average</div></div></div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-3 mb-5">
        <SpeedLabCard onDone={() => reload(true)} />
        <VitalsCard />
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B7F82]" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search pages, URLs, keyphrases" className={`${inputCls} pl-9`} data-testid="seo-report-search" /></div>
        <select value={kind} onChange={(e) => setKind(e.target.value)} className={fieldCls}><option value="all">Pages & posts ({report.items.length})</option><option value="page">Pages ({report.totals.pages})</option><option value="post">Blog posts ({report.totals.posts})</option></select>
        <select value={group} onChange={(e) => setGroup(e.target.value)} className={fieldCls}><option value="all">All sections</option>{groups.map((g) => <option key={g}>{g}</option>)}</select>
        <button onClick={() => reload(true)} className={btnGhost} data-testid="seo-report-refresh"><RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Re-check</button>
      </div>
      <div className={`${card} overflow-x-auto`}>
        <table className="w-full text-sm">
          <thead className="bg-[#FBFAF7] border-b border-[#F1DCE3]"><tr><Th k="name">Page</Th><Th k="seo">SEO</Th><Th k="content">Content</Th><Th k="readability">Readability</Th><Th k="performance">Speed</Th><Th k="issues">Issues</Th><th className="px-3 py-2.5 text-left font-mono text-[10px] uppercase tracking-wider text-[#8B7F82]">Keyphrase</th><Th k="updated">Updated</Th><th /></tr></thead>
          <tbody className="divide-y divide-[#F6E9EE]">
            {rows.map((i) => (
              <tr key={i.path} className="hover:bg-[#FFF8FA] cursor-pointer" onClick={() => setOpen(i.path)} data-testid={`seo-row-${i.path}`}>
                <td className="px-3 py-2.5 max-w-[280px]">
                  <div className="font-medium text-[#4A2530] truncate">{i.name}</div>
                  <div className="text-xs text-[#8B7F82] truncate">{i.path}{i.noindex ? " · noindex" : ""}{!i.inSitemap && !i.noindex ? " · not in sitemap" : ""}</div>
                </td>
                {CATS.map(([k]) => <td key={k} className="px-3 py-2.5"><ScoreBadge score={i.scores[k]} /></td>)}
                <td className="px-3 py-2.5 text-xs">{i.issues ? <span className="text-[#C81F57]">{i.issues} fail</span> : <span className="text-[#1c7a45]">0 fail</span>}{i.warnings ? <span className="text-[#8a5a00]"> · {i.warnings} warn</span> : ""}</td>
                <td className="px-3 py-2.5 text-xs text-[#5C4E52] max-w-[180px] truncate">{i.keyphrase || <span className="text-[#C81F57]">none</span>}</td>
                <td className="px-3 py-2.5 text-xs text-[#8B7F82] whitespace-nowrap">{i.updated || i.date || "–"}</td>
                <td className="px-3 py-2.5"><span className="text-xs font-medium text-[#E62E6B]">Report</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-[#8B7F82] mt-3">Checked {new Date(report.generated_at).toLocaleString()}. Speed scores come from real visitors (last 28 days) once a page has 5+ visits, otherwise from the weekly PageSpeed lab test (card above).</p>
      {open && <SeoItemPanel path={open} onClose={() => setOpen(null)} onChanged={() => reload(true)} />}
    </div>
  );
};

// ── Auto-configure ──
const AutoConfigure = ({ reload }) => {
  const [plan, setPlan] = useState(null);
  const [busy, setBusy] = useState("");
  const preview = async () => {
    setBusy("preview");
    try { const { data } = await api.post("/seo/autoconfig", {}); setPlan(data); } catch (e) { toast.error(errorText(e)); } finally { setBusy(""); }
  };
  const apply = async () => {
    setBusy("apply");
    try { const { data } = await api.post("/seo/autoconfig", { apply: true }); toast.success(`Updated ${data.count} page(s)`); setPlan(null); reload(true); }
    catch (e) { toast.error(errorText(e)); } finally { setBusy(""); }
  };
  const show = (v) => (v && typeof v === "object" ? (Array.isArray(v) ? `${v.length} FAQ question(s) → FAQ schema` : v.alt || JSON.stringify(v)) : String(v));
  return (
    <div className="space-y-4" data-testid="seo-autoconfig">
      <div className={`${card} p-5 text-sm text-[#5C4E52] space-y-2`}>
        <p>Auto-configure applies the rules in <b>Rules & settings</b> to every page and post. It only touches values that fail a check — titles over 60 characters, missing or broken descriptions, missing keyphrases, reused image alt text, FAQ schema for questions already on the page — and leaves anything you edited by hand alone.</p>
        <p>Writing quality (readability, word count, keyphrase use in the copy) is never rewritten; those appear as suggestions in each page's report. Every change can be undone from the page's report.</p>
      </div>
      <div className="flex gap-2">
        <button onClick={preview} disabled={!!busy} className={btnGhost} data-testid="seo-autoconfig-preview">{busy === "preview" ? <Loader2 size={15} className="animate-spin" /> : <ListChecks size={15} />} Preview changes</button>
        {plan && plan.count > 0 && <button onClick={apply} disabled={!!busy} className={btnPrimary} data-testid="seo-autoconfig-apply">{busy === "apply" ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />} Apply {plan.count} change set(s)</button>}
      </div>
      {plan && (plan.count === 0 ? <p className="text-sm text-[#1c7a45]">Everything that can be fixed automatically is already in order.</p> : (
        <div className={`${card} divide-y divide-[#F6E9EE]`}>
          {plan.plan.map((p) => (
            <div key={p.path} className="p-4 text-sm">
              <div className="font-medium text-[#4A2530]">{p.name} <span className="text-xs text-[#8B7F82]">{p.path}</span></div>
              <ul className="mt-1 space-y-1">
                {Object.entries(p.changes).map(([k, v]) => (
                  <li key={k} className="text-xs"><span className="font-mono text-[#E62E6B]">{k.replace(/_/g, " ")}</span>: {p.before[k] && typeof p.before[k] !== "object" ? <span className="line-through text-[#8B7F82] mr-1">{String(p.before[k]).slice(0, 120)}</span> : null}<span className="text-[#1c7a45]">{show(v).slice(0, 200)}</span></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

// ── Rules & settings ──
const RULE_LABELS = {
  keyphrase_from_h1: "Pick a focus keyphrase for pages that have none",
  alt_from_title: "Write page-specific alt text for hero images that have none or reuse another page's",
  canonical_self: "Self-referencing canonical URL on every page",
  index_all: "Index every page (unless you switch a page off)",
  follow_all: "Follow links on every page",
  sitemap_all: "List every indexable page in sitemap.xml and llms.txt",
  og_from_seo: "Social (Open Graph / Twitter) tags copy the SEO title and description",
  overwrite_manual: "Let auto-configure overwrite values edited by hand",
};
const SettingsTab = () => {
  const [s, setS] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { api.get("/seo/settings").then(({ data }) => setS({ ...data, entitiesText: data.entities.map((e) => e.join(" / ")).join("\n"), robotsText: data.robots_txt || data.robots_default })).catch((e) => toast.error(errorText(e))); }, []);
  if (!s) return <Loader2 className="animate-spin text-[#E62E6B]" />;
  const setRule = (k, v) => setS({ ...s, rules: { ...s.rules, [k]: v } });
  const save = async () => {
    setBusy(true);
    try {
      const body = { brand: s.brand, business: s.business, rules: s.rules, cta_pattern: s.cta_pattern, llms_extra: s.llms_extra, entities: s.entitiesText.split("\n").map((l) => l.split("/").map((x) => x.trim()).filter(Boolean)).filter((x) => x.length), robots_txt: s.robotsText.trim() === String(s.robots_default).trim() ? null : s.robotsText };
      await api.put("/seo/settings", body);
      toast.success("Settings saved");
    } catch (e) { toast.error(errorText(e)); } finally { setBusy(false); }
  };
  return (
    <div className="space-y-5" data-testid="seo-settings">
      <div className={`${card} p-5 space-y-4`}>
        <h3 className="font-display text-xl text-[#4A2530]">Automation rules</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className={labelCls}>Page title pattern</label><input value={s.rules.title_page} onChange={(e) => setRule("title_page", e.target.value)} className={inputCls} /><p className="text-[11px] text-[#8B7F82] mt-1">Tokens: {"{h1} {brand} {keyphrase}"} — used only when a title is missing, too short or duplicated</p></div>
          <div><label className={labelCls}>Post title pattern</label><input value={s.rules.title_post} onChange={(e) => setRule("title_post", e.target.value)} className={inputCls} /><p className="text-[11px] text-[#8B7F82] mt-1">Tokens: {"{title} {brand} {keyphrase}"}</p></div>
          <div><label className={labelCls}>Max title length</label><input type="number" value={s.rules.title_max} onChange={(e) => setRule("title_max", e.target.value)} className={inputCls} /></div>
          <div className="grid grid-cols-2 gap-2"><div><label className={labelCls}>Description min</label><input type="number" value={s.rules.description_min} onChange={(e) => setRule("description_min", e.target.value)} className={inputCls} /></div><div><label className={labelCls}>Description max</label><input type="number" value={s.rules.description_max} onChange={(e) => setRule("description_max", e.target.value)} className={inputCls} /></div></div>
        </div>
        <div className="space-y-2">
          {Object.entries(RULE_LABELS).map(([k, label]) => <label key={k} className="flex items-center gap-2 text-sm text-[#4A2530]"><input type="checkbox" checked={!!s.rules[k]} onChange={(e) => setRule(k, e.target.checked)} /> {label}</label>)}
        </div>
      </div>
      <div className={`${card} p-5 space-y-4`}>
        <h3 className="font-display text-xl text-[#4A2530]">Brand & business</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className={labelCls}>Brand name</label><input value={s.brand} onChange={(e) => setS({ ...s, brand: e.target.value })} className={inputCls} /></div>
          {Object.keys(s.business).map((k) => <div key={k}><label className={labelCls}>{k}</label><input value={s.business[k]} onChange={(e) => setS({ ...s, business: { ...s.business, [k]: e.target.value } })} className={inputCls} /></div>)}
        </div>
        <div><label className={labelCls}>Entities every page should mention (one per line, alternatives separated by /)</label><textarea rows={4} value={s.entitiesText} onChange={(e) => setS({ ...s, entitiesText: e.target.value })} className={inputCls} /></div>
        <div><label className={labelCls}>Call-to-action words (for the search-intent check)</label><input value={s.cta_pattern} onChange={(e) => setS({ ...s, cta_pattern: e.target.value })} className={inputCls} /></div>
      </div>
      <div className={`${card} p-5 space-y-4`}>
        <h3 className="font-display text-xl text-[#4A2530]">robots.txt & llms.txt</h3>
        <div><label className={labelCls}>robots.txt</label><textarea rows={8} value={s.robotsText} onChange={(e) => setS({ ...s, robotsText: e.target.value })} className={`${inputCls} font-mono text-[12px]`} /></div>
        <div><label className={labelCls}>Extra text for llms.txt (pages and posts are listed automatically)</label><textarea rows={4} value={s.llms_extra} onChange={(e) => setS({ ...s, llms_extra: e.target.value })} className={`${inputCls} font-mono text-[12px]`} /></div>
        <div className="flex gap-4 text-xs"><a href="/robots.txt" target="_blank" rel="noreferrer" className="text-[#E62E6B]">View robots.txt</a><a href="/llms.txt" target="_blank" rel="noreferrer" className="text-[#E62E6B]">View llms.txt</a><a href="/sitemap.xml" target="_blank" rel="noreferrer" className="text-[#E62E6B]">View sitemap.xml</a></div>
      </div>
      <button onClick={save} disabled={busy} className={btnPrimary} data-testid="seo-settings-save">{busy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save settings</button>
    </div>
  );
};

// ── Redirects ──
const Redirects = ({ prefill, clearPrefill }) => {
  const [list, setList] = useState(null);
  const [f, setF] = useState({ from: "", to: "", code: 301 });
  const load = () => api.get("/seo/redirects").then(({ data }) => setList(data)).catch((e) => toast.error(errorText(e)));
  useEffect(() => { load(); }, []);
  useEffect(() => { if (prefill) { setF({ from: prefill, to: "", code: 301 }); clearPrefill(); } }, [prefill, clearPrefill]);
  const add = async (e) => {
    e.preventDefault();
    try { await api.post("/seo/redirects", f); setF({ from: "", to: "", code: 301 }); toast.success("Redirect added"); load(); } catch (err) { toast.error(errorText(err)); }
  };
  const del = async (from) => { try { await api.delete("/seo/redirects", { params: { from } }); load(); } catch (e) { toast.error(errorText(e)); } };
  return (
    <div className="space-y-4" data-testid="seo-redirects">
      <form onSubmit={add} className={`${card} p-5 grid sm:grid-cols-[1fr_1fr_110px_auto] gap-3 items-end`}>
        <div><label className={labelCls}>Old address</label><input required value={f.from} placeholder="/old-page" onChange={(e) => setF({ ...f, from: e.target.value })} className={inputCls} data-testid="seo-redirect-from" /></div>
        <div><label className={labelCls}>Send visitors to</label><input required value={f.to} placeholder="/new-page" onChange={(e) => setF({ ...f, to: e.target.value })} className={inputCls} data-testid="seo-redirect-to" /></div>
        <div><label className={labelCls}>Type</label><select value={f.code} onChange={(e) => setF({ ...f, code: Number(e.target.value) })} className={inputCls}><option value={301}>301 permanent</option><option value={302}>302 temporary</option></select></div>
        <button className={btnPrimary} data-testid="seo-redirect-add"><Plus size={15} /> Add</button>
      </form>
      {!list ? <Loader2 className="animate-spin text-[#E62E6B]" /> : (
        <div className={`${card} divide-y divide-[#F6E9EE]`}>
          {list.map((r) => (
            <div key={r.from} className="px-4 py-3 flex items-center gap-3 text-sm">
              <span className="font-mono text-xs text-[#4A2530] break-all flex-1">{r.from}</span><ArrowRightLeft size={13} className="text-[#8B7F82] shrink-0" /><span className="font-mono text-xs text-[#4A2530] break-all flex-1">{r.to}</span>
              <span className="text-[11px] text-[#8B7F82] w-16">{r.code}{r.builtIn ? " · built-in" : ""}</span>
              {r.builtIn ? <span className="w-8" /> : <button onClick={() => del(r.from)} className="w-8 h-8 rounded-full border border-[#F1DCE3] text-[#8B7F82] hover:text-[#C81F57] flex items-center justify-center" aria-label="Delete redirect"><Trash2 size={13} /></button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── 404 log ──
const NotFoundLog = ({ onRedirect }) => {
  const [list, setList] = useState(null);
  const load = () => api.get("/seo/404").then(({ data }) => setList(data)).catch((e) => toast.error(errorText(e)));
  useEffect(() => { load(); }, []);
  const clearAll = async () => { await api.delete("/seo/404"); load(); };
  const del = async (path) => { await api.delete("/seo/404", { params: { path } }); load(); };
  if (!list) return <Loader2 className="animate-spin text-[#E62E6B]" />;
  return (
    <div className="space-y-4" data-testid="seo-404">
      <p className="text-sm text-[#5C4E52]">Addresses visitors or search engines asked for that don't exist. Redirect the useful ones to the closest live page.</p>
      {list.length === 0 ? <p className="text-sm text-[#1c7a45]">No missing pages logged.</p> : (
        <>
          <div className={`${card} divide-y divide-[#F6E9EE]`}>
            {list.map((r) => (
              <div key={r.path} className="px-4 py-3 flex items-center gap-3 text-sm">
                <div className="flex-1 min-w-0"><div className="font-mono text-xs text-[#4A2530] break-all">{r.path}</div><div className="text-[11px] text-[#8B7F82] truncate">{r.hits} hit(s) · last {String(r.last_seen).slice(0, 10)}{r.referrer ? ` · from ${r.referrer}` : ""}</div></div>
                <button onClick={() => onRedirect(r.path)} className="text-xs font-medium text-[#E62E6B]">Redirect</button>
                <button onClick={() => del(r.path)} className="w-8 h-8 rounded-full border border-[#F1DCE3] text-[#8B7F82] hover:text-[#C81F57] flex items-center justify-center" aria-label="Dismiss"><X size={13} /></button>
              </div>
            ))}
          </div>
          <button onClick={clearAll} className={btnGhost}><Trash2 size={14} /> Clear log</button>
        </>
      )}
    </div>
  );
};

// ── Speed (real visitors) ──
const fmt = { lcp: (v) => `${(v / 1000).toFixed(1)} s`, fcp: (v) => `${(v / 1000).toFixed(1)} s`, ttfb: (v) => `${Math.round(v)} ms`, inp: (v) => `${Math.round(v)} ms`, cls: (v) => v.toFixed(2) };
// Lab speed test card: API key, run button and progress across all pages and posts.
const SpeedLabCard = ({ onDone }) => {
  const [st, setSt] = useState(null);
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const poll = useCallback(async () => {
    try { const { data } = await api.get("/seo/speed/status"); setSt(data); return data; } catch { return null; }
  }, []);
  useEffect(() => { poll(); }, [poll]);
  useEffect(() => {
    if (!st || !st.running) return undefined;
    const t = setInterval(async () => { const d = await poll(); if (d && !d.running) { clearInterval(t); onDone && onDone(); if (d.stopped) toast.error(d.stopped); else toast.success("Speed tests finished"); } }, 5000);
    return () => clearInterval(t);
  }, [st && st.running, poll, onDone]); // eslint-disable-line react-hooks/exhaustive-deps
  const start = async (force) => {
    try { const { data } = await api.post("/seo/speed/run", { force }); setSt(data); if (data.running) toast.success(`Testing ${data.total} page(s) — this runs in the background`); else toast.success("Every page already has a recent result"); }
    catch (e) { toast.error(errorText(e)); }
  };
  const saveKey = async () => {
    try { const { data } = await api.put("/seo/speed/key", { key }); setSt(data); setKey(""); setShowKey(false); toast.success(data.has_key ? "API key saved" : "API key removed"); }
    catch (e) { toast.error(errorText(e)); }
  };
  const tested = st ? `${st.pages_tested} of ${st.pages_total} pages tested in the last 7 days` : "";
  return (
    <div className={`${card} p-5`} data-testid="seo-speed-lab">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl">
          <h3 className="font-display text-xl text-[#4A2530]">PageSpeed lab test (mobile)</h3>
          <p className="text-sm text-[#5C4E52] mt-1">Google PageSpeed Insights, run on every page and blog post. Fills the Speed column until enough real visits are measured. Re-tests automatically once a week and carries on after restarts.</p>
          {st && <p className="text-xs text-[#6E6266] mt-2" data-testid="seo-speed-coverage">{tested}{st.finished_at && !st.running ? ` · last run ${new Date(st.finished_at).toLocaleString()}` : ""}{st.failed ? ` · ${st.failed} failed` : ""}</p>}
        </div>
        {st && st.running
          ? <span className="inline-flex items-center gap-2 text-sm text-[#5C4E52]" data-testid="seo-speed-progress"><Loader2 size={15} className="animate-spin text-[#E62E6B]" /> Testing {st.done}/{st.total}{st.current ? ` · ${st.current}` : ""}</span>
          : <span className="inline-flex flex-wrap items-center gap-2">
              <button onClick={() => start(false)} disabled={st && !st.has_key} className={`${btnPrimary} disabled:opacity-50`} data-testid="seo-speed-run"><Gauge size={15} /> Run speed test (all pages)</button>
              {st && st.pages_tested > 0 && <button onClick={() => start(true)} disabled={!st.has_key} className={`${btnGhost} disabled:opacity-50`} data-testid="seo-speed-rerun">Re-test everything</button>}
            </span>}
      </div>
      {st && st.stopped && !st.running && <p className="mt-3 text-sm text-[#C81F57]" data-testid="seo-speed-stopped">{st.stopped}</p>}
      {st && !st.key_from_env && (
        <div className="mt-4 border-t border-[#F6E9EE] pt-4">
          {!st.has_key && <p className="text-sm text-[#5C4E52] mb-2">Google needs a free PageSpeed API key: in Google Cloud Console, enable <b>PageSpeed Insights API</b>, then create an API key under <b>Credentials</b> and paste it here.</p>}
          {st.has_key && !showKey
            ? <p className="text-xs text-[#1c7a45]">API key saved. <button onClick={() => setShowKey(true)} className="underline text-[#4A2530]">Change</button></p>
            : <div className="flex flex-wrap items-center gap-2">
                <input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="PageSpeed API key" autoComplete="off" className="w-full sm:w-80 px-3 py-2 rounded-xl border border-[#F1DCE3] text-sm" data-testid="seo-speed-key" />
                <button onClick={saveKey} disabled={!key && !st.has_key} className={`${btnGhost} disabled:opacity-50`} data-testid="seo-speed-key-save">{key || !st.has_key ? "Save key" : "Remove key"}</button>
              </div>}
        </div>
      )}
    </div>
  );
};

// Real-visitor measurements (site-wide), plus any JavaScript errors visitors hit.
const VitalsCard = () => {
  const [d, setD] = useState(null);
  const load = () => api.get("/seo/vitals").then(({ data }) => setD(data)).catch(() => setD({ site: null, errors: [], days: 28 }));
  useEffect(() => { load(); }, []);
  if (!d) return null;
  return (
    <div className={`${card} p-5 text-sm text-[#5C4E52]`} data-testid="seo-vitals">
      Measured on real visitors' devices by the site itself (no Google account needed), last {d.days} days, 75th percentile — the same way Google's Core Web Vitals are judged. Targets: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1.
      {d.site && <div className="flex flex-wrap gap-4 mt-4">{["lcp", "inp", "cls", "fcp", "ttfb"].map((k) => <div key={k} className="text-center"><div className="text-lg font-semibold text-[#4A2530]">{d.site[k] === null ? "–" : fmt[k](d.site[k])}</div><div className="text-[11px] uppercase font-mono text-[#8B7F82]">{k}</div></div>)}<div className="text-center"><ScoreBadge score={d.site.score} big /></div></div>}
      {!d.site && <p className="mt-3">No visits measured yet — data appears as people use the site.</p>}
      {d.errors && d.errors.length > 0 && (
        <div className="mt-4 border-t border-[#F6E9EE] pt-3">
          <div className="text-xs font-medium text-[#C81F57] mb-1">JavaScript errors reported by visitors</div>
          <ul className="space-y-1 text-xs">{d.errors.slice(0, 5).map((e, i) => <li key={i}><span className="font-mono break-all">{e.message}</span> <span className="text-[#8B7F82]">· {e.path} · {e.hits}×</span></li>)}</ul>
          <button onClick={async () => { await api.delete("/seo/js-errors"); load(); }} className={`${btnGhost} mt-2`}><Trash2 size={14} /> Clear</button>
        </div>
      )}
    </div>
  );
};

// ── Keyword briefcase ──
const fmtNum = (n) => (n ? Number(n).toLocaleString("en-IN") : "–");
const PosBadge = ({ pos }) => (pos ? <span className={`inline-flex items-center justify-center min-w-[34px] h-7 px-2 rounded-full text-xs font-semibold ${pos <= 3 ? "bg-[#E6F4EC] text-[#1c7a45]" : pos <= 10 ? "bg-[#FFF3D6] text-[#8a5a00]" : "bg-[#F4F1EA] text-[#5C4E52]"}`}>{pos}</span> : <span className="inline-flex items-center justify-center min-w-[34px] h-7 px-2 rounded-full text-xs bg-[#F4F1EA] text-[#8B7F82]" title="Not in the top 100">–</span>);
const Change = ({ c }) => (c === null || c === undefined ? <span className="text-[#B9AEB1] text-xs">–</span> : c === 0 ? <span className="text-xs text-[#8B7F82]">0</span> : <span className={`text-xs font-semibold ${c > 0 ? "text-[#1c7a45]" : "text-[#C81F57]"}`}>{c > 0 ? "▲" : "▼"} {Math.abs(c)}</span>);

const Keywords = () => {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(null);
  const [f, setF] = useState({ keyword: "", page: "", volume: "", note: "" });
  const today = new Date().toISOString().slice(0, 10);
  const [log, setLog] = useState({ date: today, pos: "", url: "", source: "" });
  const load = useCallback(async (refresh) => {
    setBusy(true);
    try { const { data: d } = await api.get("/seo/keywords", { params: refresh ? { refresh: 1 } : {} }); setData(d); }
    catch (e) { toast.error(errorText(e)); } finally { setBusy(false); }
  }, []);
  useEffect(() => { load(false); }, [load]);
  const persist = async (next) => {
    try { await api.put("/seo/settings", { keywords: next.map(({ keyword, page, note, volume, country }) => ({ keyword, page, note, volume, country })) }); await load(false); }
    catch (e) { toast.error(errorText(e)); }
  };
  const addRank = async (k) => {
    try { await api.post("/seo/keywords/rank", { keyword: k.keyword, ...log, pos: log.pos === "" ? null : Number(log.pos), url: log.url || k.page }); setLog({ date: today, pos: "", url: "", source: log.source }); toast.success("Position saved"); await load(false); }
    catch (e) { toast.error(errorText(e)); }
  };
  const delRank = async (id) => { try { await api.delete("/seo/keywords/rank", { params: { id } }); await load(false); } catch (e) { toast.error(errorText(e)); } };
  if (!data) return <Loader2 className="animate-spin text-[#E62E6B]" />;
  const list = data.keywords;
  const ranked = list.filter((k) => k.latest && k.latest.pos);
  const top10 = ranked.filter((k) => k.latest.pos <= 10).length;
  const avgOn = list.length ? Math.round(list.reduce((a, k) => a + (k.onpage ? k.onpage.score : 0), 0) / list.length) : null;
  return (
    <div className="space-y-4" data-testid="seo-keywords">
      <div className="flex flex-wrap items-start gap-3 justify-between">
        <p className="text-sm text-[#5C4E52] max-w-2xl">Track the search terms you want to rank for. Each term is checked against its target page (title, heading, description, text and more). Log the Google position from Search Console or your rank report to see progress over time.</p>
        <button onClick={() => load(true)} className={btnGhost} disabled={busy}>{busy ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />} Re-check pages</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[["Tracked terms", list.length], ["Ranking", ranked.length], ["In the top 10", top10], ["Avg. on-page", avgOn === null ? "–" : `${avgOn}%`]].map(([l, v]) => (
          <div key={l} className={`${card} px-4 py-3`}><div className="font-mono text-[10px] uppercase tracking-wider text-[#8B7F82]">{l}</div><div className="font-display text-2xl text-[#4A2530] mt-1">{v}</div></div>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); if (f.keyword.trim()) { persist([...list, f]); setF({ keyword: "", page: "", volume: "", note: "" }); } }} className={`${card} p-5 grid sm:grid-cols-[1.4fr_1.4fr_0.7fr_1fr_auto] gap-3 items-end`}>
        <div><label className={labelCls}>Keyword</label><input value={f.keyword} onChange={(e) => setF({ ...f, keyword: e.target.value })} className={inputCls} data-testid="seo-keyword-input" /></div>
        <div><label className={labelCls}>Target page</label><select value={f.page} onChange={(e) => setF({ ...f, page: e.target.value })} className={inputCls}><option value="">— choose —</option>{data.pages.map((p) => <option key={p} value={p}>{p}</option>)}</select></div>
        <div><label className={labelCls}>Searches / mo</label><input type="number" min="0" value={f.volume} onChange={(e) => setF({ ...f, volume: e.target.value })} className={inputCls} /></div>
        <div><label className={labelCls}>Note</label><input value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} className={inputCls} /></div>
        <button className={btnPrimary}><Plus size={15} /> Add</button>
      </form>
      {list.length > 0 && (
        <div className={`${card} overflow-x-auto`}>
          <table className="w-full text-sm" data-testid="seo-keyword-table">
            <thead className="bg-[#FBFAF7]"><tr>{["Search term", "Searches", "Target page", "On-page", "Position", "Change", "Best", ""].map((h) => <th key={h} className="px-3 py-2 text-left font-mono text-[10px] uppercase text-[#8B7F82]">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-[#F6E9EE]">
              {list.map((k, n) => (
                <React.Fragment key={k.keyword}>
                  <tr className="hover:bg-[#FFFBFC] cursor-pointer" onClick={() => setOpen(open === k.keyword ? null : k.keyword)}>
                    <td className="px-3 py-2.5"><div className="font-medium text-[#4A2530]">{k.keyword}</div>{k.note && <div className="text-xs text-[#8B7F82]">{k.note}</div>}</td>
                    <td className="px-3 py-2.5 text-[#5C4E52]">{fmtNum(k.volume)}</td>
                    <td className="px-3 py-2.5 text-xs text-[#5C4E52] max-w-[220px] truncate">{k.page || <span className="text-[#8a5a00]">None chosen</span>}</td>
                    <td className="px-3 py-2.5"><ScoreBadge score={k.onpage ? k.onpage.score : null} label="On-page targeting" /></td>
                    <td className="px-3 py-2.5"><PosBadge pos={k.latest && k.latest.pos} />{k.latest && <div className="text-[10px] text-[#8B7F82] mt-0.5">{k.latest.date}</div>}</td>
                    <td className="px-3 py-2.5"><Change c={k.change} /></td>
                    <td className="px-3 py-2.5 text-xs text-[#5C4E52]">{k.bestPos || "–"}</td>
                    <td className="px-3 py-2.5 text-right"><button onClick={(e) => { e.stopPropagation(); if (window.confirm(`Stop tracking "${k.keyword}"?`)) persist(list.filter((_, j) => j !== n)); }} className="w-8 h-8 rounded-full border border-[#F1DCE3] text-[#8B7F82] hover:text-[#C81F57] inline-flex items-center justify-center" aria-label="Remove keyword"><Trash2 size={13} /></button></td>
                  </tr>
                  {open === k.keyword && (
                    <tr><td colSpan={8} className="bg-[#FFFBFC] px-4 py-4">
                      <div className="grid lg:grid-cols-2 gap-5">
                        <div>
                          <div className="font-mono text-[10px] uppercase tracking-wider text-[#8B7F82] mb-2">On-page check{k.page ? ` · ${k.page}` : ""}</div>
                          {k.onpage ? (
                            <ul className="space-y-1.5">{k.onpage.signals.map((s) => <li key={s.id} className="flex items-center gap-2 text-sm text-[#4A2530]"><StatusIcon s={s.ok ? "pass" : "fail"} /> {s.label}{s.detail ? <span className="text-xs text-[#8B7F82]">({s.detail})</span> : null}</li>)}</ul>
                          ) : <p className="text-sm text-[#8a5a00]">Choose a target page to check it.</p>}
                          {k.best && k.best.path !== k.page && k.best.score > (k.onpage ? k.onpage.score : 0) && <p className="mt-3 text-xs text-[#5C4E52]">Best match on the site today: <b>{k.best.path}</b> ({k.best.score}%). Point the term there, or strengthen the target page.</p>}
                          {k.local && <p className="mt-3 text-xs text-[#5C4E52]">"Near me" searches are answered from the searcher's location: the Google Business Profile, reviews and the address on the site matter most. The page check looks for the rest of the phrase.</p>}
                          <div className="mt-3 flex flex-wrap gap-2 items-center">
                            <select value={k.page} onChange={(e) => persist(list.map((x) => (x.keyword === k.keyword ? { ...x, page: e.target.value } : x)))} className={fieldCls} aria-label="Target page"><option value="">— target page —</option>{data.pages.map((p) => <option key={p} value={p}>{p}</option>)}</select>
                            <input type="number" min="0" defaultValue={k.volume || ""} onBlur={(e) => Number(e.target.value) !== k.volume && persist(list.map((x) => (x.keyword === k.keyword ? { ...x, volume: e.target.value } : x)))} className={`${fieldCls} w-32`} placeholder="Searches/mo" aria-label="Searches per month" />
                          </div>
                        </div>
                        <div>
                          <div className="font-mono text-[10px] uppercase tracking-wider text-[#8B7F82] mb-2">Log a position</div>
                          <div className="flex flex-wrap gap-2 items-end">
                            <input type="date" value={log.date} onChange={(e) => setLog({ ...log, date: e.target.value })} className={fieldCls} aria-label="Date" />
                            <input type="number" min="1" max="100" value={log.pos} onChange={(e) => setLog({ ...log, pos: e.target.value })} className={`${fieldCls} w-24`} placeholder="Pos." aria-label="Position" />
                            <input value={log.url} onChange={(e) => setLog({ ...log, url: e.target.value })} className={`${fieldCls} flex-1 min-w-[140px]`} placeholder={k.page || "Ranking URL"} aria-label="Ranking URL" />
                            <button onClick={() => addRank(k)} className={btnPrimary} data-testid="seo-rank-save"><Save size={14} /> Save</button>
                          </div>
                          <p className="text-[11px] text-[#8B7F82] mt-1.5">Leave the position blank if the site is not in the top 100.</p>
                          {k.history.length > 0 && (
                            <ul className="mt-3 divide-y divide-[#F6E9EE] border border-[#F6E9EE] rounded-xl bg-white">
                              {k.history.slice().reverse().map((h) => (
                                <li key={h.id} className="flex items-center gap-3 px-3 py-2 text-sm"><span className="text-xs text-[#8B7F82] w-24">{h.date}</span><PosBadge pos={h.pos} /><span className="flex-1 text-xs text-[#5C4E52] truncate">{h.url}{h.source ? ` · ${h.source}` : ""}</span><button onClick={() => delRank(h.id)} className="text-[#B9AEB1] hover:text-[#C81F57]" aria-label="Delete entry"><X size={13} /></button></li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </td></tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ── Report for a single blog post, opened from the Blog list ──
export const useSeoReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const reload = useCallback(async (force) => {
    setLoading(true);
    try { const { data } = await api.get("/seo/report", { params: force ? { refresh: 1 } : {} }); setReport(data); }
    catch (e) { toast.error(errorText(e)); } finally { setLoading(false); }
  }, []);
  useEffect(() => { reload(false); }, [reload]);
  return { report, loading, reload };
};

const SUBTABS = [
  ["report", "Page report", ListChecks],
  ["auto", "Auto-configure", Wand2],
  ["settings", "Rules & settings", Settings2],
  ["redirects", "Redirects", ArrowRightLeft],
  ["404", "404 log", FileWarning],
  ["keywords", "Keywords", KeyRound],
];

export const SeoPanel = () => {
  const [sub, setSub] = useState("report");
  const [prefill, setPrefill] = useState("");
  const { report, loading, reload } = useSeoReport();
  const clearPrefill = useCallback(() => setPrefill(""), []);
  return (
    <div data-testid="seo-panel">
      <div className="flex flex-wrap gap-2 mb-6">
        {SUBTABS.map(([k, label, Icon]) => (
          <button key={k} onClick={() => setSub(k)} className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium border ${sub === k ? "bg-[#4A2530] border-[#4A2530] text-white" : "bg-white border-[#F1DCE3] text-[#4A2530] hover:border-[#4A2530]"}`} data-testid={`seo-subtab-${k}`}><Icon size={13} /> {label}</button>
        ))}
      </div>
      {sub === "report" && <PageReport report={report} reload={reload} loading={loading} />}
      {sub === "auto" && <AutoConfigure reload={reload} />}
      {sub === "settings" && <SettingsTab />}
      {sub === "redirects" && <Redirects prefill={prefill} clearPrefill={clearPrefill} />}
      {sub === "404" && <NotFoundLog onRedirect={(p) => { setPrefill(p); setSub("redirects"); }} />}
      {sub === "keywords" && <Keywords />}
    </div>
  );
};

export default SeoPanel;
