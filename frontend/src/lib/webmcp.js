// WebMCP: lets AI agents running in the visitor's browser use the site's read-only tools
// (services, prices, contact details, blog search, page text). Each tool runs through the
// site's own /mcp endpoint. Does nothing in browsers without navigator.modelContext.
const callSiteTool = async (name, args = {}) => {
  const res = await fetch("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method: "tools/call", params: { name, arguments: args } }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.result;
};

const EMPTY = { type: "object", properties: {}, additionalProperties: false };
const TOOLS = [
  { name: "get_services", description: "List the makeup services offered by Rekha Krishnamurthy in Bangalore.", inputSchema: EMPTY },
  { name: "get_pricing", description: "Starting prices (INR) for each makeup service.", inputSchema: EMPTY },
  { name: "get_contact", description: "Phone, WhatsApp, email, studio address and how to book a consultation.", inputSchema: EMPTY },
  { name: "search_blog", description: "Search Rekha's makeup and bridal beauty articles by keyword.", inputSchema: { type: "object", properties: { query: { type: "string" }, limit: { type: "integer", minimum: 1, maximum: 10 } }, required: ["query"], additionalProperties: false } },
  { name: "get_page", description: "Read any page of rekhakrishnamurthy.com as Markdown, by path (e.g. /bridal-makeup-artist-bangalore).", inputSchema: { type: "object", properties: { path: { type: "string" } }, required: ["path"], additionalProperties: false } },
];

// Registered on page load (synchronously) so agents find them straight away.
export const registerWebMcpTools = () => {
  const mc = typeof navigator !== "undefined" ? navigator.modelContext : null;
  if (!mc || typeof mc.registerTool !== "function" || window.location.pathname.startsWith("/admin")) return;
  for (const t of TOOLS) {
    try {
      mc.registerTool({ ...t, annotations: { readOnlyHint: true }, execute: (input) => callSiteTool(t.name, input || {}) });
    } catch { /* already registered or unsupported */ }
  }
  try {
    mc.registerTool({
      name: "open_booking_form",
      description: "Open the consultation booking form on rekhakrishnamurthy.com so the visitor can enquire. Optionally pre-select a service.",
      inputSchema: { type: "object", properties: { service: { type: "string", description: "Service name, e.g. Bridal Makeup" } }, additionalProperties: false },
      execute: ({ service } = {}) => {
        window.location.assign(`/contact${service ? `?service=${encodeURIComponent(service)}` : ""}`);
        return { content: [{ type: "text", text: "Opened the booking form." }] };
      },
    });
  } catch { /* ignore */ }
};
