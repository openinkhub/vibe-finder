# ROADMAP — Rekha Krishnamurthy Portfolio

## P0 — Immediate Actions Required (User Must Do)
- **Resend DNS verification**: Add DNS TXT/MX records in Resend dashboard for `rekhakrishnamurthy.com` so `contact@rekhakrishnamurthy.com` can send emails (brochures, Accept/Reject notifications). Until verified, Resend blocks delivery.

## P1 — High Priority
- **OG image**: Replace `/public/og-image.webp` with Rekha's real banner photo (the inline chat image wasn't retrievable as a file; user to upload the actual 1200×630 banner).
- **Legal page verification**: Confirm address, refund windows, and EEAT numbers (320+ brides, lead times) are accurate — legal copy was generated with assumptions.
- **Delivery & Cookies policy**: `/delivery` and `/cookies` pages still show placeholder content.
- **Body copy**: Remaining sheet pages without docx content yet.

## P2 — Medium Priority
- **Blog articles**: Add real blog posts via Admin → Blog. The 3 seeded posts are short stubs; full articles with FAQs will improve SEO significantly.
- **Batch seeding**: Seed a live course batch in Admin → Batches so the "few seats left" banner activates on Academy pages.
- **Mock.js to CMS**: Testimonials, FAQs, About stats in `mock.js` could be made admin-editable.
- **shadcn DatePicker**: Replace native `<input type="date">` on the enquiry form (better UX on mobile).

## P3 — Low Priority / Technical Debt
- **Rate limit** `/api/brochure/request` (currently unlimited per IP).
- **pageBodies.js migration**: Extremely large static file; long-term should move to MongoDB content models.
- **WhatsApp alerts**: Twilio SMS/WhatsApp notifications for new enquiries (not started).
