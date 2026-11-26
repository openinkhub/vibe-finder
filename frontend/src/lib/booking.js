import { getPage, COURSE_SERVICES, enquiryServiceFor } from "./pages";

// One click from any CTA to a form:
//  - Academy pages (and course services) → the enquiry form
//  - every other page → the booking form
// If the page already shows the full booking form (#contact on Home, Contact and the booking page),
// we jump to it and put the cursor in the name field. Otherwise the form opens in a pop-up.

const ACADEMY_SERVICES = [...COURSE_SERVICES, "Academy"].map((s) => s.toLowerCase());
const SERVICE_GROUPS = ["Services", "Academy", "Experience"];

// Pages that are not in the page list (blog posts) can say which form fits them.
let context = null;
export const setBookingContext = (c) => { context = c; };

const clean = (p) => (p.length > 1 ? p.replace(/\/$/, "") : p);

// Academy pages: the three course pages, the Academy hub, and guides about classes and courses.
const ACADEMY_PATH = /class|course|educator|mentor|academy|training/i;
const isAcademyPage = (page) => !!page && (page.group === "Academy" || ((page.group === "Guides" || page.group === "Header") && ACADEMY_PATH.test(page.path)));

export const bookingTarget = (opts = {}) => {
  const page = getPage(clean(window.location.pathname));
  const service = opts.service || (page && SERVICE_GROUPS.includes(page.group) ? enquiryServiceFor(page) : "") || (context && context.service) || "";
  const isAcademy = (service && ACADEMY_SERVICES.includes(service.toLowerCase())) || isAcademyPage(page) || (context && context.kind === "enquiry");
  return { kind: opts.kind || (isAcademy ? "enquiry" : "booking"), service };
};

// Which form the header / mobile "Book" button opens on this page (for its label).
export const bookingKindAt = (pathname) => (isAcademyPage(getPage(clean(pathname))) ? "enquiry" : "booking");

const focusInlineForm = () => {
  const section = document.getElementById("contact");
  const input = section && section.querySelector('[data-testid="contact-name-input"]');
  if (!input) return false;
  section.scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(() => { try { input.focus({ preventScroll: true }); } catch (e) { input.focus(); } }, 450);
  return true;
};

export const openBooking = (opts = {}) => {
  const target = bookingTarget(opts);
  if (target.service) { try { sessionStorage.setItem("rk_service", target.service); } catch (e) { /* ignore */ } }
  if (!opts.forcePopup && target.kind === "booking" && focusInlineForm()) return;
  window.dispatchEvent(new CustomEvent("rk:book", { detail: target }));
};

// Is this link one of the "go to the contact page" CTAs?
export const isBookingLink = (a) => {
  if (!a || a.target === "_blank" || a.hasAttribute("download") || a.closest("header, footer, [data-nav]")) return null;
  let u;
  try { u = new URL(a.getAttribute("href"), window.location.href); } catch (e) { return null; }
  if (u.origin !== window.location.origin || clean(u.pathname) !== "/contact") return null;
  return { service: u.searchParams.get("service") || undefined };
};
