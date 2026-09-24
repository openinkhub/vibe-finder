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
