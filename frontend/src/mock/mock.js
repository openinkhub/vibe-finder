// Mock data for Rekha Krishnamurthy - Bridal Makeup Artist site

export const brand = {
  name: "REKHA",
  surname: "KRISHNAMURTHY",
  tagline: "Bridal Makeup Artist in Bangalore",
  phone: "+91 98450 12345",
  whatsapp: "+91 98450 12345",
  email: "hello@rekhamakeup.in",
  location: "Indiranagar, Bangalore",
  instagram: "@rekha.makeup",
};

export const navLinks = [
  { label: "About", path: "/about" },
  { label: "Services", path: "/services" },
  { label: "Pricing", path: "/pricing" },
  { label: "Portfolio", path: "/portfolio" },
  { label: "Courses", path: "/courses" },
  { label: "Contact", path: "/contact" },
];

// Real brand navigation (Rekha Krishnamurthy Makeup & Academy)
export const navLeft = [
  { label: "About Us", path: "/about" },
  {
    label: "Services",
    path: "/services",
    dropdown: [
      { label: "Bridal Makeup", path: "/services" },
      { label: "Non Bridal Makeup", path: "/services" },
      { label: "Engagement Makeup", path: "/services" },
      { label: "Party Makeup", path: "/services" },
      { label: "Fashion Makeup", path: "/services" },
      { label: "Editorial Makeup", path: "/services" },
    ],
  },
  { label: "Courses", path: "/courses" },
  { label: "Gallery", path: "/portfolio" },
  { label: "Blogs", path: "/pricing" },
];

export const navRight = [
  { label: "Personal Shopping", path: "/services" },
  { label: "Testimonials", path: "/contact" },
];

export const heroPortrait = "https://images.unsplash.com/photo-1611150257812-e2296b43202b";

export const heroCategories = {
  left: [
    { title: "Engagement", tagline: "Because you wont get a second chance to make the First Impression" },
    { title: "Non Bridal", tagline: "Because there is always a contest between Ladkiwaale and Ladkewaale" },
    { title: "Fashion", tagline: "You walk the Runway and We make you the Showstopper" },
  ],
  right: [
    { title: "Bridal", tagline: "You are Beautiful but, we enumerate the Shimmer" },
    { title: "Party", tagline: "For any occasion that you want to look and feel Special" },
    { title: "Editorial", tagline: "For the Magazine Ready Look" },
  ],
};

export const heroStats = [
  { value: "9+", label: "Years in Craft" },
  { value: "500+", label: "Brides Styled" },
  { value: "5.0", label: "Google Rating" },
];

export const heroTicker = [
  "BRIDAL", "HD", "GOLDEN HOUR", "AIRBRUSH", "ENGAGEMENT", "RECEPTION", "EDITORIAL",
];

export const heroImage = "https://images.unsplash.com/photo-1610173827043-9db50e0d8ef9";
export const heroVideo = "https://customer-assets-lqy194kg.emergentagent.net/job_vibe-finder-76/artifacts/64x8xmfl_background.mp4";
export const heroVideoPoster = "https://images.unsplash.com/photo-1610173827043-9db50e0d8ef9";

export const services = [
  {
    id: "bridal",
    title: "Bridal Makeup",
    price: "from \u20B915,000",
    desc: "HD & airbrush bridal looks engineered to read flawless on camera and feel weightless through the longest wedding day.",
    points: ["HD & Airbrush finish", "Trial session included", "Draping & hairstyling", "On-location service"],
    image: "https://images.unsplash.com/photo-1610173827043-9db50e0d8ef9",
  },
  {
    id: "party",
    title: "Party & Event",
    price: "from \u20B92,500",
    desc: "Glam, editorial and soft-glow looks for engagements, receptions, cocktails and cocktail sangeets.",
    points: ["Glam / soft glow", "Lashes included", "Quick 45-min setup", "Long-wear products"],
    image: "https://images.unsplash.com/photo-1594647210801-5124307f3d51",
  },
  {
    id: "minimal",
    title: "Everyday & Minimal",
    price: "from \u20B9999",
    desc: "Natural, no-makeup makeup for shoots, brunches and days you simply want to look like the best version of you.",
    points: ["No-makeup makeup", "Skin-first prep", "Photo-shoot ready", "Under 30 minutes"],
    image: "https://images.unsplash.com/photo-1551184451-76b762941ad6",
  },
  {
    id: "courses",
    title: "Self-Grooming Classes",
    price: "from \u20B94,999",
    desc: "Learn to do your own makeup with confidence \u2014 personalised, hands-on classes for everyday beauty.",
    points: ["1-on-1 or group", "Kit guidance", "Face-mapping", "Lifetime notes"],
    image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2",
  },
];

export const pricingPlans = [
  {
    id: "party",
    name: "Party & Event",
    price: "\u20B92,500",
    unit: "per look",
    featured: false,
    features: ["HD makeup", "Complimentary lashes", "Basic hairstyling", "Long-wear finish", "Touch-up kit tips"],
  },
  {
    id: "bridal",
    name: "Signature Bridal",
    price: "\u20B915,000",
    unit: "wedding day",
    featured: true,
    features: ["HD & Airbrush finish", "Pre-wedding trial", "Draping + hairstyling", "On-location service", "Family makeup add-ons", "Dedicated assistant"],
  },
  {
    id: "course",
    name: "Grooming Course",
    price: "\u20B94,999",
    unit: "per module",
    featured: false,
    features: ["Hands-on training", "Personalised face-map", "Product & kit guidance", "Practice worksheets", "Certificate of completion"],
  },
];

export const portfolio = [
  { id: 1, category: "Bridal", title: "Golden Hour Bride", image: "https://images.unsplash.com/photo-1610173827043-9db50e0d8ef9" },
  { id: 2, category: "Bridal", title: "Royal Red", image: "https://images.unsplash.com/photo-1677691257363-eebd2abeafec" },
  { id: 3, category: "Editorial", title: "Teal Reverie", image: "https://images.unsplash.com/photo-1747847471528-7b95ea7a4c39" },
  { id: 4, category: "Bridal", title: "Heirloom Glow", image: "https://images.unsplash.com/photo-1587271315307-eaebc181c749" },
  { id: 5, category: "Glam", title: "Cocktail Glam", image: "https://images.unsplash.com/photo-1594647210801-5124307f3d51" },
  { id: 6, category: "Glam", title: "Editorial Eye", image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2" },
  { id: 7, category: "Party", title: "Soft Party Glow", image: "https://images.unsplash.com/photo-1708735808460-2b131ddefb27" },
  { id: 8, category: "Minimal", title: "No-Makeup Makeup", image: "https://images.unsplash.com/photo-1551184451-76b762941ad6" },
  { id: 9, category: "Bridal", title: "Classic Bride", image: "https://images.unsplash.com/photo-1684868268327-7e5590bcfbd6" },
];

export const courses = [
  {
    id: "self",
    title: "Self-Grooming Masterclass",
    duration: "2 days \u00B7 6 hrs",
    level: "Beginner",
    price: "\u20B94,999",
    desc: "Everything you need to do your own everyday & occasion makeup with confidence.",
    image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2",
    modules: ["Skincare & prep", "Base & concealing", "Everyday eyes", "Occasion glam"],
  },
  {
    id: "pro",
    title: "Professional Artistry",
    duration: "4 weeks",
    level: "Advanced",
    price: "\u20B939,999",
    desc: "Become a working makeup artist \u2014 bridal, HD, airbrush and client management.",
    image: "https://images.unsplash.com/photo-1594647210801-5124307f3d51",
    modules: ["Bridal techniques", "HD & Airbrush", "Hairstyling basics", "Building a business"],
  },
];

export const testimonials = [
  { id: 1, name: "Ananya R.", role: "Bride, 2024", text: "Rekha made me feel like the most beautiful version of myself. The makeup lasted through 12 hours and every photo looked stunning.", rating: 5 },
  { id: 2, name: "Meghana S.", role: "Reception look", text: "Effortless, elegant and exactly what I asked for. My family kept asking who did my makeup all night!", rating: 5 },
  { id: 3, name: "Priya K.", role: "Grooming student", text: "The self-grooming class changed how I see makeup. I finally do my own everyday look in 10 minutes.", rating: 5 },
  { id: 4, name: "Divya M.", role: "Engagement", text: "Skin looked like skin \u2014 not cakey at all. HD finish was flawless on camera. Highly recommend.", rating: 5 },
];

export const aboutStats = [
  { value: "9+", label: "Years experience" },
  { value: "500+", label: "Brides styled" },
  { value: "50+", label: "Students trained" },
  { value: "5.0", label: "Google rating" },
];

export const faqs = [
  { q: "Do you travel for on-location bridal makeup?", a: "Yes, I travel across Bangalore and to nearby cities for weddings. Outstation travel & stay is charged separately." },
  { q: "Is a trial session included with bridal packages?", a: "A pre-wedding trial is included with the Signature Bridal package so we can perfect your look together before the big day." },
  { q: "What products do you use?", a: "Only premium, long-wear and HD/airbrush-friendly products suited to Indian skin tones and Bangalore weather." },
  { q: "How do I book a date?", a: "Book a free consultation via the contact page or WhatsApp. Dates are confirmed with a small advance." },
];
