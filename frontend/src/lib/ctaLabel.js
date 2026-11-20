const EXACT = {
  "Book Your Free Consult": "Book",
  "Enquire About the Next Batch": "Enquiry",
  "Enquire for the Next Batch": "Enquiry",
  "Enquire About the Next Workshop": "Enquiry",
  "Enquire About Personal Shopping": "Enquiry",
  "Confirm your Booking": "Ask Me",
  "Talk to Rekha": "Ask Me",
  "Join the Community": "Ask Me",
  "Book a Counselling Session": "Consult",
  "Enquire Now": "Enquiry",
  "Jump to Enquiry Form": "Enquiry",
  "Consult on Pricing": "Consult",
};

export const shortCta = (text = "") =>
  EXACT[text] ||
  (/enquir/i.test(text) ? "Enquiry" : /consult|counsel/i.test(text) ? "Consult" : /book|confirm|reserve/i.test(text) ? "Book" : "Ask Me");
