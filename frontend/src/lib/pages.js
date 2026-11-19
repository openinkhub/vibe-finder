import pages from "../content/pages.json";

export const allPages = pages;
export const getPage = (path) => pages.find((p) => p.path === (path.length > 1 ? path.replace(/\/$/, "") : path));
export const pagesByGroup = (group) => pages.filter((p) => p.group === group);

export const headerMenu = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about-us" },
  { label: "Services", to: "/bridal-makeup-bangalore", children: pagesByGroup("Services") },
  { label: "Academy", to: "/makeup-course-training-bangalore", children: pagesByGroup("Academy") },
  { label: "Portfolio", to: "/portfolio", children: pagesByGroup("Portfolio") },
  { label: "Contact Us", to: "/contact" },
  { label: "Blog", to: "/blog" },
  { label: "Experience", children: pagesByGroup("Experience") },
];

export const footerColumns = [
  { title: "Service Area", items: pagesByGroup("Service area") },
  { title: "Location", items: pagesByGroup("Service Location") },
  { title: "Explore", items: pagesByGroup("Explore") },
  { title: "Legal", items: pagesByGroup("Legal") },
];

export const legalKeyByPath = { "/privacy": "privacy", "/terms": "terms", "/refund": "refunds", "/disclaimer": "disclaimer", "/delivery": "delivery", "/cookies": "cookies" };

export const BOOKING_PATH = "/premium-bridal-makeup-booking";
export const COURSE_SERVICES = ["Launchpad", "Bridal Artistry", "Self Grooming Workshop"];
export const enquiryServiceFor = (page) => page.enquiryService || page.name;
export const processPages = ["Makeup Trial", "Skin Consultation", "HD Makeup", "Airbrush Makeup"].map((n) => pages.find((p) => p.group === "Experience" && p.name === n));

const pricingMap = [["self", "/bridal-makeup-course-bangalore"], ["party", "/party-makeup-artist-bangalore"], ["non-bridal", "/non-bridal-makeup"], ["non bridal", "/non-bridal-makeup"], ["engagement", "/engagement-makeup"], ["editorial", "/editorial-makeup"], ["fashion", "/fashion-makeup"], ["groom", "/groom-makeup-artist-bangalore"], ["bridal", "/bridal-makeup-artist-bangalore"]];
export const pricingPath = (title = "") => { const t = title.toLowerCase(); return (pricingMap.find(([k]) => t.includes(k)) || [])[1] || "/bridal-makeup-bangalore"; };
