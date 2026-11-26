import React, { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, Check, X, Loader2, Upload, Bold, Italic, Heading2, Heading3, List, Quote, Copy, RefreshCw, Key } from "lucide-react";
import { toast } from "sonner";
import { api, errorText, imgUrl } from "../../lib/api";
import { ScoreBadge, CheckList, SeoItemPanel, useSeoReport } from "./SeoPanel";

// Live SEO checklist for the post being edited (scored on the server, same rules as the report).
const PostChecklist = ({ f, faqs }) => {
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!f.title && !f.body) return undefined;
    const t = setTimeout(async () => {
      setBusy(true);
      try { const { data } = await api.post("/seo/analyze-post", { ...f, faqs }); setRes(data); } catch { /* keep the last result */ } finally { setBusy(false); }
    }, 900);
    return () => clearTimeout(t);
  }, [f, faqs]);
  return (
    <div className="bg-[#FBFAF7] border border-[#F1DCE3] rounded-2xl p-4" data-testid="blog-seo-checklist">
      <div className="flex items-center gap-3 mb-3">
        <span className="font-mono text-[11px] uppercase tracking-wider text-[#8B7F82]">SEO checklist</span>
        {busy && <Loader2 size={13} className="animate-spin text-[#C8215A]" />}
        {res && [["seo", "SEO"], ["content", "Content"], ["readability", "Readability"]].map(([k, l]) => <span key={k} className="inline-flex items-center gap-1 text-xs text-[#5C4E52]"><ScoreBadge score={res.scores[k]} /> {l}</span>)}
      </div>
      {res ? <CheckList results={res.results} compact /> : <p className="text-xs text-[#8B7F82]">Start writing to see the checklist.</p>}
    </div>
  );
};

const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-[#F1DCE3] bg-[#FBFAF7] text-[#4A2530] text-sm focus:outline-none focus:border-[#E62E6B] transition-all";
const labelCls = "block text-xs font-mono uppercase tracking-wider text-[#8B7F82] mb-1.5";

const slugify = (t) => t.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const EMPTY = { title: "", slug: "", meta_title: "", meta_description: "", focus_keyword: "", category: "General", publish_date: new Date().toISOString().slice(0, 10), excerpt: "", key_takeaway: "", body: "", interlink_url: "", alt_text: "" };

const TOOLBAR = [
  { icon: Bold, wrap: ["**", "**"], label: "Bold" },
  { icon: Italic, wrap: ["_", "_"], label: "Italic" },
  { icon: Heading2, wrap: ["## ", ""], label: "Heading 2", line: true },
  { icon: Heading3, wrap: ["### ", ""], label: "Heading 3", line: true },
  { icon: List, wrap: ["- ", ""], label: "Bullet list", line: true },
  { icon: Quote, wrap: ["> ", ""], label: "Quote", line: true },
];

const MarkdownField = ({ value, onChange }) => {
  const ref = useRef(null);
  const apply = (before, after, line) => {
    const el = ref.current;
    const start = el.selectionStart, end = el.selectionEnd;
    const selected = value.slice(start, end);
    const next = line ? `${value.slice(0, start)}${before}${selected}${value.slice(end)}` : `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;
    onChange(next);
    setTimeout(() => { el.focus(); el.selectionStart = start + before.length; el.selectionEnd = start + before.length + selected.length; }, 0);
  };
  return (
    <div>
      <div className="flex items-center gap-1 mb-1.5 flex-wrap" data-testid="blog-md-toolbar">
        {TOOLBAR.map(({ icon: Icon, wrap, label, line }) => (
          <button key={label} type="button" title={label} onClick={() => apply(wrap[0], wrap[1], line)} className="w-8 h-8 rounded-lg border border-[#F1DCE3] bg-white text-[#4A2530] hover:border-[#E62E6B] hover:text-[#C8215A] flex items-center justify-center" data-testid={`blog-md-btn-${label.toLowerCase().replace(/\s/g, "-")}`}>
            <Icon size={14} />
          </button>
        ))}
      </div>
      <textarea ref={ref} required rows={10} placeholder="Write the article body in Markdown…" value={value} onChange={(e) => onChange(e.target.value)} className={`${inputCls} font-mono text-[13px]`} data-testid="blog-body-input" />
    </div>
  );
};

const FaqEditor = ({ faqs, setFaqs }) => (
  <div className="space-y-3" data-testid="blog-faq-editor">
    {faqs.map((f, i) => (
      <div key={i} className="bg-[#FBFAF7] border border-[#F1DCE3] rounded-xl p-3 space-y-2">
        <div className="flex gap-2">
          <input placeholder="Question" value={f.q} onChange={(e) => setFaqs(faqs.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))} className={inputCls} data-testid={`blog-faq-q-${i}`} />
          <button type="button" onClick={() => setFaqs(faqs.filter((_, j) => j !== i))} className="w-9 h-9 rounded-lg border border-[#F1DCE3] text-[#8B7F82] hover:text-[#C81F57] flex items-center justify-center shrink-0" data-testid={`blog-faq-remove-${i}`}><Trash2 size={14} /></button>
        </div>
        <textarea rows={2} placeholder="Answer" value={f.a} onChange={(e) => setFaqs(faqs.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))} className={inputCls} data-testid={`blog-faq-a-${i}`} />
      </div>
    ))}
    <button type="button" onClick={() => setFaqs([...faqs, { q: "", a: "" }])} className="inline-flex items-center gap-1.5 text-sm font-medium text-[#C8215A]" data-testid="blog-faq-add"><Plus size={14} /> Add FAQ</button>
    <p className="text-xs text-[#8B7F82]">FAQs appear inline within the article body (not a separate section) and automatically generate FAQPage schema markup for Google whenever at least one is added.</p>
  </div>
);

const PostForm = ({ item, onSave, onCancel }) => {
  const [f, setF] = useState({ ...EMPTY, ...item });
  const [faqs, setFaqs] = useState(item.faqs || []);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(item.featured_image ? imgUrl(item.featured_image) : null);
  const [busy, setBusy] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!!item.id);
  const fileRef = useRef(null);

  const pick = (fl) => { setFile(fl || null); setPreview(fl ? URL.createObjectURL(fl) : preview); };

  const submit = async (e) => {
    e.preventDefault();
    if (!item.id && !file) { toast.error("Please choose a featured image"); return; }
    setBusy(true);
    try {
      const fd = new FormData();
      Object.entries({ ...f, faqs: JSON.stringify(faqs.filter((x) => x.q && x.a)) }).forEach(([k, v]) => fd.append(k, v ?? ""));
      if (file) fd.append("file", file);
      await onSave(fd, item.id);
    } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-[#E62E6B]/40 space-y-5" data-testid="blog-post-form">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Title (H1)</label>
          <input required value={f.title} onChange={(e) => { const v = e.target.value; setF({ ...f, title: v, slug: slugTouched ? f.slug : slugify(v) }); }} className={inputCls} data-testid="blog-title-input" />
        </div>
        <div>
          <label className={labelCls}>URL slug</label>
          <input required value={f.slug} onChange={(e) => { setSlugTouched(true); setF({ ...f, slug: slugify(e.target.value) }); }} className={inputCls} data-testid="blog-slug-input" />
        </div>
        <div>
          <label className={labelCls}>Meta title (SEO)</label>
          <input value={f.meta_title} onChange={(e) => setF({ ...f, meta_title: e.target.value })} maxLength={70} className={inputCls} data-testid="blog-meta-title-input" />
        </div>
        <div>
          <label className={labelCls}>Focus keyword</label>
          <input value={f.focus_keyword} onChange={(e) => setF({ ...f, focus_keyword: e.target.value })} className={inputCls} data-testid="blog-focus-keyword-input" />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Meta description (SEO)</label>
          <textarea rows={2} value={f.meta_description} onChange={(e) => setF({ ...f, meta_description: e.target.value })} maxLength={160} className={inputCls} data-testid="blog-meta-description-input" />
        </div>
        <div>
          <label className={labelCls}>Category / tag</label>
          <input value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} className={inputCls} data-testid="blog-category-input" />
        </div>
        <div>
          <label className={labelCls}>Publish date</label>
          <input type="date" value={f.publish_date} onChange={(e) => setF({ ...f, publish_date: e.target.value })} className={inputCls} data-testid="blog-publish-date-input" />
        </div>
        <div>
          <label className={labelCls}>Author</label>
          <input value="Rekha Krishnamurthy" disabled className={`${inputCls} opacity-60`} data-testid="blog-author-input" />
        </div>
        <div>
          <label className={labelCls}>Interlink target page (optional)</label>
          <input placeholder="/bridal-makeup-artist-bangalore" value={f.interlink_url} onChange={(e) => setF({ ...f, interlink_url: e.target.value })} className={inputCls} data-testid="blog-interlink-input" />
        </div>
      </div>

      <div>
        <label className={labelCls}>Excerpt</label>
        <textarea required rows={2} value={f.excerpt} onChange={(e) => setF({ ...f, excerpt: e.target.value })} className={inputCls} data-testid="blog-excerpt-input" />
      </div>

      <div>
        <label className={labelCls}>Key Takeaway (AEO/GEO)</label>
        <textarea rows={2} maxLength={400} placeholder="A short, quotable answer summarising the article — shown right after the title and surfaced to AI answer engines (ChatGPT, Google AI Overviews, Perplexity)." value={f.key_takeaway} onChange={(e) => setF({ ...f, key_takeaway: e.target.value })} className={inputCls} data-testid="blog-key-takeaway-input" />
        <p className="text-xs text-[#8B7F82] mt-1">Optional but recommended — a 1-2 sentence direct answer that AI engines can quote. Appears in a highlighted box after the title and in the article's schema markup.</p>
      </div>

      <div>
        <label className={labelCls}>Featured image</label>
        <div className="flex items-start gap-4">
          <button type="button" onClick={() => fileRef.current.click()} className="w-28 h-28 rounded-2xl border-2 border-dashed border-[#F4B7CE] bg-[#FBE9F0] overflow-hidden flex items-center justify-center text-[#C8215A] shrink-0" data-testid="blog-image-pick-btn">
            {preview ? <img src={preview} alt="preview" className="w-full h-full object-cover" /> : <Upload size={20} />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={(e) => pick(e.target.files?.[0])} className="hidden" data-testid="blog-image-file-input" />
          <div className="flex-1 space-y-2">
            <p className="text-xs text-[#8B7F82]">Upload any JPG/PNG/WEBP — it's automatically converted to WEBP and compressed under 100KB before publishing.</p>
            <input placeholder="Alt text (for SEO & accessibility)" value={f.alt_text} onChange={(e) => setF({ ...f, alt_text: e.target.value })} className={inputCls} data-testid="blog-alt-text-input" />
          </div>
        </div>
      </div>

      <div>
        <label className={labelCls}>Article content (Markdown)</label>
        <MarkdownField value={f.body} onChange={(v) => setF({ ...f, body: v })} />
      </div>

      <div>
        <label className={labelCls}>FAQs (blended into the article body + auto FAQ schema)</label>
        <FaqEditor faqs={faqs} setFaqs={setFaqs} />
      </div>

      <PostChecklist f={f} faqs={faqs} />

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={busy} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#D6245F] text-white text-sm font-medium hover:bg-[#C81F57] disabled:opacity-60" data-testid="blog-save-btn">{busy ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Publish</button>
        <button type="button" onClick={onCancel} className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#F1DCE3] text-[#8B7F82] text-sm font-medium" data-testid="blog-cancel-btn"><X size={15} /> Cancel</button>
      </div>
    </form>
  );
};

const ApiKeyCard = () => {
  const [key, setKey] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const API = (process.env.REACT_APP_BACKEND_URL || window.location.origin) + "/api";

  const load = () => api.get("/blog/api-key").then((r) => setKey(r.data.api_key)).catch((e) => toast.error(errorText(e)));
  useEffect(() => { load(); }, []);

  const regenerate = async () => {
    if (!window.confirm("Regenerating will invalidate the old key immediately — any third-party integration using it will stop working until updated. Continue?")) return;
    setBusy(true);
    try { const r = await api.post("/blog/api-key/regenerate"); setKey(r.data.api_key); toast.success("New API key generated"); } catch (e) { toast.error(errorText(e)); } finally { setBusy(false); }
  };
  const copy = (text) => { navigator.clipboard.writeText(text); toast.success("Copied to clipboard"); };

  const snippet = `curl -X POST "${API}/blog" \\\n  -H "X-API-Key: ${key}" \\\n  -F "title=My New Post" -F "excerpt=..." -F "body=..." \\\n  -F "publish_date=2026-01-01" -F "category=General" \\\n  -F "file=@image.jpg"`;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#F1DCE3] mb-6" data-testid="blog-api-key-card">
      <div className="flex items-center gap-2 text-[#C8215A]"><Key size={16} /><span className="font-mono text-[11px] tracking-[0.2em] uppercase">Third-party posting API</span></div>
      <p className="text-sm text-[#5C4E52] mt-2">Use this key to publish blog posts from Zapier, Make, or any external tool via <code className="text-xs bg-[#FBFAF7] px-1.5 py-0.5 rounded">POST {API}/blog</code> with header <code className="text-xs bg-[#FBFAF7] px-1.5 py-0.5 rounded">X-API-Key</code>.</p>
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <code className="flex-1 min-w-[200px] px-3 py-2.5 rounded-xl bg-[#FBFAF7] border border-[#F1DCE3] text-sm text-[#4A2530] font-mono truncate" data-testid="blog-api-key-value">{show ? key : "•".repeat(24)}</code>
        <button type="button" onClick={() => setShow((s) => !s)} className="px-3 py-2.5 rounded-xl border border-[#F1DCE3] text-sm text-[#4A2530]" data-testid="blog-api-key-toggle">{show ? "Hide" : "Show"}</button>
        <button type="button" onClick={() => copy(key)} className="px-3 py-2.5 rounded-xl border border-[#F1DCE3] text-sm text-[#4A2530] inline-flex items-center gap-1.5" data-testid="blog-api-key-copy"><Copy size={13} /> Copy</button>
        <button type="button" onClick={regenerate} disabled={busy} className="px-3 py-2.5 rounded-xl border border-[#F1DCE3] text-sm text-[#C81F57] inline-flex items-center gap-1.5 disabled:opacity-60" data-testid="blog-api-key-regenerate">{busy ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} Regenerate</button>
      </div>
      <details className="mt-3">
        <summary className="text-sm text-[#C8215A] cursor-pointer">Show example request</summary>
        <pre className="mt-2 p-3 rounded-xl bg-[#FBFAF7] border border-[#F1DCE3] text-xs text-[#4A2530] overflow-x-auto whitespace-pre" data-testid="blog-api-key-snippet">{snippet}</pre>
      </details>
    </div>
  );
};

export const BlogEditor = () => {
  const { report, reload: reloadSeo } = useSeoReport();
  const [seoOpen, setSeoOpen] = useState(null);
  const seoOf = (slug) => (report ? report.items.find((x) => x.path === `/blog/${slug}`) : null);
  const [items, setItems] = useState([]);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => api.get("/blog").then((r) => setItems(r.data)).catch((e) => toast.error(errorText(e)));
  useEffect(() => { load(); }, []);

  const save = async (fd, id) => {
    try {
      if (id) await api.put(`/blog/${id}`, fd);
      else await api.post("/blog", fd);
      toast.success("Post published — live on the site");
      setAdding(false); setEditing(null); load(); reloadSeo(true);
    } catch (e) { toast.error(errorText(e)); }
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this blog post?")) return;
    try { await api.delete(`/blog/${id}`); toast.success("Deleted"); load(); } catch (e) { toast.error(errorText(e)); }
  };

  return (
    <div data-testid="blog-editor">
      <ApiKeyCard />
      <div className="flex items-center justify-between gap-4 mb-5">
        <p className="text-sm text-[#5C4E52]">Posts appear instantly on the public Blog page and get their own SEO-optimised URL.</p>
        {!adding && <button onClick={() => { setAdding(true); setEditing(null); }} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#D6245F] text-white text-sm font-medium hover:bg-[#C81F57] shrink-0" data-testid="blog-add-btn"><Plus size={15} /> New post</button>}
      </div>

      {seoOpen && <SeoItemPanel path={seoOpen} onClose={() => setSeoOpen(null)} onChanged={() => { load(); reloadSeo(true); }} />}
      {report && <p className="text-xs text-[#8B7F82] mb-4">Scores: SEO · Content · Readability. Open a post's report for the full checklist; site-wide tools are in the SEO tab.</p>}
      {adding && <div className="mb-6"><PostForm item={EMPTY} onSave={save} onCancel={() => setAdding(false)} /></div>}

      <div className="space-y-3">
        {items.map((p) => editing === p.id ? (
          <div key={p.id} className="mb-6"><PostForm item={p} onSave={save} onCancel={() => setEditing(null)} /></div>
        ) : (
          <div key={p.id} className="bg-white rounded-2xl p-4 border border-[#F1DCE3] flex items-center gap-4" data-testid={`blog-row-${p.id}`}>
            <img src={imgUrl(p.featured_image)} alt={p.alt_text} className="w-16 h-16 rounded-xl object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#C8215A]">{p.category} · {p.publish_date}{p.publish_date > new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10) && <span className="ml-2 px-2 py-0.5 rounded-full bg-[#FFF4D6] text-[#7A5A00]">Scheduled</span>}</div>
              <div className="font-display text-lg text-[#4A2530] truncate">{p.title}</div>
              <div className="text-sm text-[#5C4E52] truncate">{p.excerpt}</div>
            </div>
            {seoOf(p.slug) && (
              <button onClick={() => setSeoOpen(`/blog/${p.slug}`)} className="hidden sm:flex items-center gap-1.5 shrink-0" title="SEO report" data-testid={`blog-seo-${p.id}`}>
                <ScoreBadge score={seoOf(p.slug).scores.seo} label="SEO" /><ScoreBadge score={seoOf(p.slug).scores.content} label="Content" /><ScoreBadge score={seoOf(p.slug).scores.readability} label="Readability" />
                <span className="text-xs font-medium text-[#C8215A] ml-1">Report</span>
              </button>
            )}
            <button onClick={() => { setEditing(p.id); setAdding(false); }} className="w-9 h-9 rounded-full border border-[#F1DCE3] text-[#4A2530] hover:text-[#C8215A] flex items-center justify-center shrink-0" aria-label="Edit" data-testid={`blog-edit-${p.id}`}><Pencil size={14} /></button>
            <button onClick={() => remove(p.id)} className="w-9 h-9 rounded-full border border-[#F1DCE3] text-[#8B7F82] hover:text-[#C81F57] flex items-center justify-center shrink-0" aria-label="Delete" data-testid={`blog-delete-${p.id}`}><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogEditor;
