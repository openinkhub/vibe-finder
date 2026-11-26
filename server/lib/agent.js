// Agent-facing features: Markdown versions of pages, price (Offer) schema, a read-only MCP
// server (/mcp) and its discovery card (/.well-known/mcp/server-card.json).
const cheerio = require("cheerio");
const TurndownService = require("turndown");
const { getDb } = require("./core");
const R = require("./render");
const { getSettings } = require("./seo/settings");

const td = new TurndownService({ headingStyle: "atx", bulletListMarker: "-", codeBlockStyle: "fenced" });
td.remove(["script", "style", "noscript", "svg", "button", "form", "iframe"]);

// ── Markdown version of a rendered page ──
function htmlToMarkdown(html, url) {
  const $ = cheerio.load(html);
  const title = $("title").first().text().trim();
  const desc = ($('meta[name="description"]').attr("content") || "").trim();
  const root = $("#root").clone();
  root.find("nav, header, footer, [class*='fixed'], [aria-hidden='true']").remove();
  root.find("img").each((_, img) => { if (!($(img).attr("alt") || "").trim()) $(img).remove(); });
  root.find("a[href^='/']").each((_, a) => $(a).attr("href", R.SITE_URL + $(a).attr("href")));
  root.find("img[src^='/']").each((_, img) => $(img).attr("src", R.SITE_URL + $(img).attr("src")));
  let body = td.turndown(root.html() || "").replace(/\n{3,}/g, "\n\n").trim();
  if (!body) body = desc;
  return `# ${title}\n\n> ${desc}\n\nSource: ${url}\n\n${body}\n`;
}

// Markdown URL for a page: /about-us → /about-us.md, / → /index.md
const mdPath = (p) => (p === "/" ? "/index.md" : `${p.replace(/\/$/, "")}.md`);
const fromMdPath = (p) => (p === "/index.md" ? "/" : p.replace(/\.md$/, ""));

// RFC 8288 Link header pointing agents at the Markdown alternate and llms.txt.
const linkHeader = (p) => [
  `<${R.SITE_URL}${mdPath(p)}>; rel="alternate"; type="text/markdown"`,
  `<${R.SITE_URL}/llms.txt>; rel="describedby"; type="text/plain"`,
  `<${R.SITE_URL}/.well-known/mcp/server-card.json>; rel="mcp-server-card"; type="application/json"`,
].join(", ");

// Does the request ask for Markdown rather than HTML?
function wantsMarkdown(req) {
  const accept = String(req.get("accept") || "").toLowerCase();
  if (!accept.includes("text/markdown")) return false;
  const q = (type) => {
    const m = accept.split(",").map((s) => s.trim()).find((s) => s.startsWith(type));
    if (!m) return -1;
    const qm = m.match(/;\s*q=([\d.]+)/);
    return qm ? Number(qm[1]) : 1;
  };
  return q("text/markdown") >= q("text/html");
}

// ── Prices as schema.org Offers (home page) ──
let pricingCache = null;
async function pricingRows() {
  if (pricingCache && Date.now() - pricingCache.t < 5 * 60 * 1000) return pricingCache.rows;
  const rows = await getDb().collection("pricing").find({}, { projection: { _id: 0 } }).sort({ order: 1 }).toArray();
  pricingCache = { t: Date.now(), rows };
  return rows;
}
const priceNumber = (s) => { const m = String(s || "").replace(/,/g, "").match(/(\d{3,})/); return m ? Number(m[1]) : null; };
async function offerCatalog() {
  const rows = await pricingRows();
  const offers = rows.filter((r) => priceNumber(r.price)).map((r) => ({
    "@type": "Offer",
    name: r.title,
    description: [r.desc, r.price].filter(Boolean).join(" "),
    url: `${R.SITE_URL}/#pricing`,
    priceCurrency: "INR",
    price: priceNumber(r.price),
    priceSpecification: { "@type": "PriceSpecification", priceCurrency: "INR", minPrice: priceNumber(r.price) },
    itemOffered: { "@type": "Service", name: r.title, provider: { "@id": `${R.SITE_URL}/#localbusiness` } },
  }));
  if (!offers.length) return null;
  return { "@context": "https://schema.org", "@type": "BeautySalon", "@id": `${R.SITE_URL}/#localbusiness`, hasOfferCatalog: { "@type": "OfferCatalog", name: "Makeup services and prices", url: `${R.SITE_URL}/#pricing`, itemListElement: offers } };
}
const clearAgentCache = () => { pricingCache = null; };

// ── Read-only MCP server (Streamable HTTP, JSON responses, no sessions) ──
const PROTOCOLS = ["2025-06-18", "2025-03-26", "2024-11-05"];
const SERVER_INFO = { name: "rekhakrishnamurthy-site", title: "Rekha Krishnamurthy Makeup & Academy", version: "1.0.0" };
const TOOLS = [
  { name: "get_services", title: "Makeup services", description: "List the makeup services offered by Rekha Krishnamurthy in Bangalore.", inputSchema: { type: "object", properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true } },
  { name: "get_pricing", title: "Prices", description: "Starting prices (INR) for each makeup service.", inputSchema: { type: "object", properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true } },
  { name: "get_contact", title: "Contact details", description: "Phone, WhatsApp, email, studio address and how to book a consultation.", inputSchema: { type: "object", properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true } },
  { name: "search_blog", title: "Search the blog", description: "Search Rekha's makeup and bridal beauty articles by keyword.", inputSchema: { type: "object", properties: { query: { type: "string", description: "Words to search for" }, limit: { type: "integer", minimum: 1, maximum: 10 } }, required: ["query"], additionalProperties: false }, annotations: { readOnlyHint: true } },
  { name: "get_page", title: "Read a page", description: "Read any page of rekhakrishnamurthy.com as Markdown, by path (e.g. /bridal-makeup-artist-bangalore).", inputSchema: { type: "object", properties: { path: { type: "string" } }, required: ["path"], additionalProperties: false }, annotations: { readOnlyHint: true } },
];

const text = (s) => ({ content: [{ type: "text", text: s }] });
async function callTool(name, args = {}) {
  const db = getDb();
  const s = await getSettings();
  if (name === "get_services") {
    const rows = await db.collection("services").find({}, { projection: { _id: 0, title: 1, desc: 1 } }).sort({ order: 1 }).toArray();
    return text(rows.map((r) => `- ${r.title}: ${r.desc}`).join("\n"));
  }
  if (name === "get_pricing") {
    const rows = await pricingRows();
    return text(`${rows.map((r) => `- ${r.title}: ${r.price}${r.desc ? ` (${r.desc})` : ""}`).join("\n")}\n\nQuotes are personalised to the look, location and event. Outstation charges extra.`);
  }
  if (name === "get_contact") {
    const b = s.business;
    return text(`${b.name}\nPhone: ${b.phone}\nWhatsApp: ${b.whatsapp || ""}\nEmail: ${b.email}\nStudio: ${b.address || b.city}\nBook a consultation: ${R.SITE_URL}/contact`);
  }
  if (name === "search_blog") {
    const q = String(args.query || "").trim().toLowerCase();
    if (!q) throw Object.assign(new Error("query is required"), { code: -32602 });
    const words = q.split(/\s+/).filter(Boolean);
    const posts = await db.collection("blog_posts").find(require("./blogSeo").LIVE(), { projection: { _id: 0, slug: 1, title: 1, excerpt: 1, body: 1 } }).toArray();
    const scored = posts.map((p) => {
      const hay = `${p.title} ${p.excerpt || ""} ${p.body || ""}`.toLowerCase();
      return { p, score: words.reduce((a, w) => a + (hay.split(w).length - 1) + (p.title.toLowerCase().includes(w) ? 5 : 0), 0) };
    }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score).slice(0, Math.min(10, Number(args.limit) || 5));
    return text(scored.length ? scored.map(({ p }) => `- [${p.title}](${R.SITE_URL}/blog/${p.slug}): ${p.excerpt || ""}`).join("\n") : "No matching articles.");
  }
  if (name === "get_page") {
    let p = String(args.path || "/").replace(/^https?:\/\/[^/]+/, "") || "/";
    if (!p.startsWith("/")) p = `/${p}`;
    p = p.replace(/\/+$/, "") || "/";
    const html = p.startsWith("/blog/") ? await R.blogHtml(p.slice(6), { buildSchema: require("../routes/blog").buildSchema })
      : /^\/(blog|archive)$/.test(p) ? await R.blogIndexHtml(p) : await R.pageHtml(p);
    if (!html) throw Object.assign(new Error(`No page at ${p}`), { code: -32602 });
    return text(htmlToMarkdown(html, R.SITE_URL + p));
  }
  throw Object.assign(new Error(`Unknown tool: ${name}`), { code: -32602 });
}

async function handleRpc(msg) {
  const { id, method, params = {} } = msg || {};
  const isNotification = id === undefined || id === null;
  const ok = (result) => ({ jsonrpc: "2.0", id, result });
  const err = (code, message) => ({ jsonrpc: "2.0", id: isNotification ? null : id, error: { code, message } });
  try {
    if (method === "initialize") {
      const v = PROTOCOLS.includes(params.protocolVersion) ? params.protocolVersion : PROTOCOLS[0];
      return ok({ protocolVersion: v, capabilities: { tools: { listChanged: false } }, serverInfo: SERVER_INFO, instructions: "Read-only information about Rekha Krishnamurthy's makeup services, prices, contact details and articles. To book, send people to https://rekhakrishnamurthy.com/contact." });
    }
    if (method && method.startsWith("notifications/")) return null;
    if (method === "ping") return ok({});
    if (method === "tools/list") return ok({ tools: TOOLS });
    if (method === "tools/call") {
      if (!TOOLS.find((t) => t.name === params.name)) return err(-32602, `Unknown tool: ${params.name}`);
      try { return ok(await callTool(params.name, params.arguments || {})); } catch (e) { return ok({ content: [{ type: "text", text: e.message }], isError: true }); }
    }
    if (method === "resources/list") return ok({ resources: [] });
    if (method === "prompts/list") return ok({ prompts: [] });
    return isNotification ? null : err(-32601, `Method not found: ${method}`);
  } catch (e) {
    return err(-32603, "Internal error");
  }
}

function mcpRoutes(app, express, ah) {
  const cors = (res) => res.set({ "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Protocol-Version, Mcp-Session-Id", "Access-Control-Allow-Methods": "GET, POST, OPTIONS" });
  app.options("/mcp", (_req, res) => cors(res).status(204).end());
  app.get("/mcp", (_req, res) => cors(res).set("Allow", "POST, OPTIONS").status(405).json({ error: "Use POST with a JSON-RPC message (MCP Streamable HTTP)." }));
  app.post("/mcp", express.json({ limit: "64kb" }), ah(async (req, res) => {
    cors(res);
    const body = req.body;
    if (Array.isArray(body)) {
      const out = (await Promise.all(body.map(handleRpc))).filter(Boolean);
      return out.length ? res.json(out) : res.status(202).end();
    }
    const out = await handleRpc(body);
    return out ? res.json(out) : res.status(202).end();
  }));

  const card = () => ({
    $schema: "https://static.modelcontextprotocol.io/schemas/mcp-server-card/v1.json",
    version: "1.0",
    protocolVersion: PROTOCOLS[0],
    serverInfo: SERVER_INFO,
    name: SERVER_INFO.name,
    title: SERVER_INFO.title,
    description: "Read-only access to Rekha Krishnamurthy's makeup services, prices, contact details and blog (Bangalore, India).",
    websiteUrl: R.SITE_URL,
    iconUrl: `${R.SITE_URL}/logo.png`,
    documentationUrl: `${R.SITE_URL}/llms.txt`,
    transport: { type: "streamable-http", endpoint: `${R.SITE_URL}/mcp` },
    remotes: [{ type: "streamable-http", url: `${R.SITE_URL}/mcp`, supportedProtocolVersions: PROTOCOLS }],
    endpoint: `${R.SITE_URL}/mcp`,
    capabilities: { tools: { listChanged: false } },
    authentication: { required: false, schemes: [] },
    tools: TOOLS.map(({ name, title, description, inputSchema }) => ({ name, title, description, inputSchema })),
    resources: [],
    prompts: [],
  });
  const sendCard = (_req, res) => cors(res).set("Cache-Control", "public, max-age=3600").json(card());
  app.get(["/.well-known/mcp/server-card.json", "/.well-known/mcp/server-cards.json", "/.well-known/mcp.json", "/mcp/server-card"], sendCard);
}

module.exports = { htmlToMarkdown, mdPath, fromMdPath, linkHeader, wantsMarkdown, offerCatalog, pricingRows, clearAgentCache, mcpRoutes, TOOLS };
