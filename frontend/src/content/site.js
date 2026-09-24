const BRANDS = "MAC Cosmetics, Bobbi Brown, Estée Lauder, HUDA Beauty, Lancôme, Urban Decay and Anastasia Beverly Hills";

export const authorBio = {
  title: "About Rekha Krishnamurthy",
  text: `Rekha Krishnamurthy is a Bangalore-based professional makeup artist and educator with 14 years of hands-on experience and 320+ bridal, editorial and fashion assignments completed across South India. She specialises in HD and Airbrush makeup techniques, works exclusively with premium international brands (${BRANDS}), and follows strict hygiene protocols on every assignment.`,
};

export const legalLinks = [
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms & Conditions", to: "/terms" },
  { label: "Refund & Cancellation", to: "/refund" },
  { label: "Disclaimer", to: "/disclaimer" },
  { label: "Shipping & Delivery", to: "/delivery" },
  { label: "Cookies", to: "/cookies" },
];

export const servicePages = [
  {
    slug: "bridal-makeup-artist-bangalore", menu: "Bridal", eyebrow: "Trusted by Brides Across Bangalore", title: "Bridal Makeup, Perfected Over 14 Years",
    subtitle: "From the first consultation to your last wedding function, every look is planned around your skin, your outfit, and your story — not a template.",
    image: "https://images.unsplash.com/photo-1610173827043-9db50e0d8ef9", service: "Bridal",
    body: [
      "After fourteen years and 320+ weddings, I've learned that no two brides — or their skin, lighting, or outfits — are ever the same. That's why every bridal booking with me starts with a real consultation, not a fixed package: we talk through your outfit colour and fabric, your venue's lighting, your jewellery, and any skin concerns well before I open my kit.",
      "A promise I keep: I do not double-book wedding dates. Once you're confirmed, my team and I are there exclusively for you.",
    ],
    bullets: [
      ["Pre-Wedding Shoot Makeup", "Coordinated around your outfit, location and shoot theme in advance, with on-site assistance so your timeline stays stress-free."],
      ["Sangeet Makeup", "Built for movement: sweat-proof, waterproof base, a stylish up-do, and lighter product so you can dance the night away."],
      ["Wedding Day Makeup", `A full consultation covering skin type, outfit and jewellery, followed by on-site application using only premium products (${BRANDS}) with sanitised tools.`],
    ],
    faq: [
      ["How far in advance should I book my bridal makeup artist in Bangalore?", "3–6 months for wedding-season dates; sooner is always safer for muhurtham mornings."],
      ["Do you offer a trial session before the wedding day?", "Yes — every bridal package includes an in-person or video consultation, and a paid trial can be added before the big day."],
      ["What if I have sensitive skin or allergies?", "Let us know at the consultation stage — we adjust product choice accordingly. See our Disclaimer for more."],
    ],
  },
  {
    slug: "engagement-makeup", menu: "Engagement", eyebrow: "Your First “Yes” to the Camera", title: "Engagement Makeup That Photographs as Beautifully as It Feels",
    subtitle: "A personalised consultation, premium products, and fourteen years of experience reading skin tones under every kind of event lighting.",
    image: "https://images.unsplash.com/photo-1594647210801-5124307f3d51", service: "Engagement",
    body: [
      "Engagement photos get looked at — and re-looked at — for years, which is exactly why I treat the consultation as seriously as I do for a wedding day. Before I touch a single brush, we go through your vision, a skin consultation, your outfit and jewellery, and the exact time and venue — because morning light at a garden venue needs a very different approach from an evening indoor reception.",
      `I've styled brides-to-be for everything from intimate family engagements to large, elaborately staged ceremonies, bringing the same international hygiene standards and premium product line (${BRANDS}) to every one of them.`,
    ],
    faq: [["How long does engagement makeup usually take?", "Around 90 minutes for makeup, plus 30–45 minutes for hair."], ["Can you match my look to my outfit colour before the day?", "Yes — outfit and jewellery details are part of every consultation."]],
  },
  {
    slug: "non-bridal-makeup", menu: "Non Bridal", eyebrow: "For the Squad Behind the Bride", title: "Non-Bridal Makeup for Bridesmaids, Sisters & Family",
    subtitle: "Because looking your best at someone else's wedding takes its own kind of expertise — coordinated, camera-ready, and comfortable for a full day of events.",
    image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2", service: "Non-Bridal",
    body: [
      "Styling a bridal party is a different skill from styling the bride herself — the goal is a cohesive, photo-ready look across multiple faces and skin tones, often on a tighter timeline, without anyone looking “over-done” next to the bride. Over fourteen years of wedding-season bookings I've built a process specifically for this: quick skin-tone matching, a look that photographs consistently across a group, and a hairstyle-to-makeup pairing that holds up through a full day.",
      `Every non-bridal booking uses the same premium product line and hygiene standards as our bridal services (${BRANDS} — tools sanitised before every use).`,
    ],
    faq: [["Can you do makeup for the full bridal party in one sitting?", "Yes — up to six faces in a single session with an assistant; larger groups are scheduled in waves."], ["Will our looks be coordinated with the bride's makeup style?", "Yes — we align the look and intensity so the whole party photographs well together."]],
  },
  {
    slug: "party-makeup-artist-bangalore", menu: "Party", eyebrow: "Every Party Deserves a Main Character", title: "Party Makeup for Birthdays, Anniversaries & Every Night Out",
    subtitle: "HD and Airbrush techniques, styled to the venue lighting and your outfit — not a one-look-fits-all party face.",
    image: "https://images.unsplash.com/photo-1684868268327-7e5590bcfbd6", service: "Party",
    body: [
      "Party makeup has its own set of practical challenges: dim restaurant lighting, flash photography, a late night that shouldn't mean touch-ups every hour. I use HD and Airbrush techniques specifically chosen for how they hold up under different lighting — camera flash, string lights, dance floors — paired with a hairstyle that complements your outfit.",
      `Whether it's a birthday, anniversary dinner, or you're part of someone else's celebration, the same premium product standards apply (${BRANDS}). Party, event and wedding bookings carry no visit charge across Bangalore.`,
    ],
    faq: [["Do you travel to a venue or home for party makeup bookings?", "Yes — on-site service across Bangalore with no visit charge."], ["How long before the event should I book?", "1–2 weeks is ideal; same-week slots are possible outside wedding season."]],
  },
  {
    slug: "editorial-makeup", menu: "Editorial", eyebrow: "Where Makeup Becomes Art Direction", title: "Editorial Makeup, Built Around the Mood Board",
    subtitle: "From glossy and nude to bold and unconventional — makeup that's briefed, referenced, and executed like a shoot, not a touch-up.",
    image: "https://images.unsplash.com/photo-1677691257363-eebd2abeafec", service: "Editorial",
    body: [
      "Editorial work is briefed differently from a wedding or party booking — it starts with a mood board, a creative direction, and often a tight shoot schedule. My approach is to translate that reference material into an achievable, camera-accurate look, whether the brief calls for a glossy, minimalist finish or something bold and unconventional.",
      `I bring the same premium product range used across all our services (${BRANDS}), selected for how they photograph under studio and natural light. See the Portfolio for published and photographed work.`,
    ],
    faq: [["Can you replicate a specific reference look from a mood board?", "Yes — bring your references to the consultation and we'll discuss what's achievable for your skin tone and the shoot's lighting."], ["Do you work directly with photographers/stylists on set?", "Yes — I coordinate with the photographer and stylist on lighting, timing and touch-ups throughout the shoot."]],
  },
  {
    slug: "fashion-makeup", menu: "Fashion", eyebrow: "Runway-Ready, Every Time", title: "Fashion Makeup for Shows, Shoots & Statement Looks",
    subtitle: "Avant-garde or barely-there — fashion makeup built around the narrative your shoot or show is telling.",
    image: "https://images.unsplash.com/photo-1708735808460-2b131ddefb27", service: "Fashion",
    body: [
      "Fashion makeup asks for a different kind of range: I might do a “no-makeup” makeup look in the morning and a dramatic, avant-garde look with feather lashes or paint accents the same evening. What stays constant is the process — understanding the narrative the shoot or show is telling, then executing with techniques that hold up under runway lighting or studio flash.",
      `As with every service, only premium products are used (${BRANDS}), chosen for longevity and how they read on camera.`,
    ],
    faq: [["Do you have experience working backstage at fashion shows?", "Yes — backstage and runway assignments across Bangalore fashion weeks and designer showcases."], ["Can fashion makeup be adapted for a personal shoot, not just a show?", "Yes — the same techniques apply to personal fashion shoots and portfolios."]],
  },
  {
    slug: "south-indian-bridal-makeup-karnataka", menu: "Photo Shoot", eyebrow: "Camera-First Makeup", title: "Photo Shoot & Premium South Indian Bridal Makeup",
    subtitle: "Pre-wedding shoots, portfolio sessions and traditional South Indian bridal looks — built for how the lens sees skin.",
    image: "https://images.unsplash.com/photo-1587271315307-eaebc181c749", service: "Bridal",
    body: [
      "A photo-shoot look is engineered for the camera: a base that reads like skin at f/2.8, colour that survives flash and golden hour alike, and traditional South Indian bridal detailing — kohl, temple-jewellery-ready hair, Kanjeevaram-matched lip and cheek tones — that stays true across hundreds of frames.",
      `Every shoot is planned with the photographer around location, outfit changes and light. Products are exclusively premium (${BRANDS}) and applied with sanitised tools.`,
    ],
    faq: [["Do you coordinate with my photographer?", "Yes — we agree the timeline, light and touch-up points before the shoot."], ["Can you do multiple looks in one shoot?", "Yes — outfit-by-outfit changes are planned into the schedule."]],
  },
];

export const locationPages = [
  { slug: "bridal-makeup-Bangalore", area: "HSR Layout", title: "Bridal Makeup Artist in HSR Layout, Bangalore", service: "Bridal", image: "https://images.unsplash.com/photo-1610173827043-9db50e0d8ef9",
    body: ["Serving brides across HSR Layout and Sector 1–7 with on-site bridal, engagement and reception makeup — no visit charge. Early muhurtham slots, HD and airbrush finishes, and one bride per date.", "Popular venues we've worked at nearby include garden banquets in Agara and community halls along 27th Main; we plan travel and setup time around your venue and photographer."] },
  { slug: "party-and-non-bridal-makeup-karnataka", area: "JP Nagar", title: "Party & Non-Bridal Makeup in JP Nagar", service: "Party", image: "https://images.unsplash.com/photo-1684868268327-7e5590bcfbd6",
    body: ["Our studio base is close to JP Nagar — the fastest slot for party, event and bridesmaid bookings across Phases 1–9, Sarakki and Puttenahalli.", "Group bookings for the bridal party, birthday glam and anniversary dinners, with HD/airbrush technique chosen for restaurant and flash lighting."] },
  { slug: "best-bridal-makup-artist-in-bangalore", area: "Jayanagar", title: "Best Bridal Makeup Artist in Jayanagar, Bangalore", service: "Bridal", image: "https://images.unsplash.com/photo-1587271315307-eaebc181c749",
    body: ["Rated 5.0 on Google across 146 reviews — Jayanagar brides choose us for traditional South Indian bridal looks that photograph beautifully in temple and kalyana-mantapa lighting.", "From 4th Block to South End Circle, we arrive with a full kit, sanitised tools and a plan built at your free consultation."] },
  { slug: "pre-wedding-makeup-artist", area: "Banashankari", title: "Pre-Wedding Photoshoot Makeup Artist — Banashankari", service: "Engagement", image: "https://images.unsplash.com/photo-1594647210801-5124307f3d51",
    body: ["Pre-wedding shoots around Banashankari, Turahalli forest and the Big Banyan Tree need makeup that survives sun, wind and outfit changes — that's exactly what we plan for.", "Multiple looks per shoot, photographer coordination and touch-ups on location, with no visit charge."] },
];

export const staticPages = {
  "about-us": { eyebrow: "About us", title: "Nine years of listening to faces before painting them.", image: "https://images.unsplash.com/photo-1600685890506-593fdf55949b",
    body: ["Widely regarded as the best bridal makeup artist in Bangalore, Rekha believes the best makeup is the kind that disappears into the person wearing it — a foundation that behaves like skin, a base built to survive twelve hours and a hundred hugs, an eye that photographs the way it feels.", "Based in Bengaluru and travelling for destination weddings and fashion assignments across India, she's built a studio known for one rule: no double bookings, ever. Your date is exclusively yours.", "The Makeup & Academy also trains the next generation of artists in small batches — because the craft deserves to be taught hands-on, face-to-face."] },
  "makeup-course-training-bangalore": { eyebrow: "Makeup Academy", title: "Makeup course & training in Bangalore", image: "https://images.unsplash.com/photo-1551184451-76b762941ad6", service: "Courses",
    body: ["Small-batch training at the Bangalore studio — for artists building a career, and for anyone who wants to master their own face.", "Tracks include Professional Bridal Makeup Certification, HD & Airbrush Masterclass, Self-Grooming for Everyday & Occasions, and Hairstyling for Brides. Every course is hands-on with live models and premium kits."],
    bullets: [["Professional Bridal Certification", "6 weeks · live brides · portfolio shoot included"], ["HD & Airbrush Masterclass", "2 days · camera tests under studio & daylight"], ["Self-Grooming Class", "1 day · your own kit, your own face — from ₹999"]] },
  "personal-shopping": { eyebrow: "Personal Shopping", title: "Buy fewer products that work better for you", image: "https://images.unsplash.com/photo-1677691257363-eebd2abeafec",
    body: ["Consultation is always free, and there's no visit charge for party, event or wedding bookings. Tell us the event, the city and the vibe — we'll come back with availability and a package that fits."] },
};

export const blogPosts = [
  { slug: "how-far-in-advance-to-book-bridal-makeup", title: "How far in advance should you book your bridal makeup artist?", date: "May 2026", excerpt: "Wedding-season Bangalore fills 3–6 months out. Here's how to lock your muhurtham morning without stress.", image: "https://images.unsplash.com/photo-1610173827043-9db50e0d8ef9" },
  { slug: "hd-vs-airbrush-makeup", title: "HD vs Airbrush makeup: which one is right for your wedding?", date: "April 2026", excerpt: "Both photograph beautifully — the choice depends on skin type, weather and how long your functions run.", image: "https://images.unsplash.com/photo-1594647210801-5124307f3d51" },
  { slug: "south-indian-bridal-look-checklist", title: "The South Indian bridal look checklist", date: "March 2026", excerpt: "Kanjeevaram colour matching, temple-jewellery hair and kohl that lasts twelve hours.", image: "https://images.unsplash.com/photo-1587271315307-eaebc181c749" },
];
