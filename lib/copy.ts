// Placeholder copy. Every line here is a stand-in to be replaced with the
// real wording before launch.
export const COPY = {
  scriptLine: "WAITING LIST",
  heroHeading: "BIG SOUNDS FOR BIG IDEAS",
  heroCta: "Join the waiting list",
  hint: "Click an artwork to preview",
};

// About section. Claims are checked against the main app's pricing (lib/pricing.ts:
// unlimited downloads on every plan; Creator licenses social, podcasts and websites).
// Wording is a first draft to be reviewed.
export const ABOUT = {
  eyebrow: "About Anti Audio",
  // Parts marked hl get the yellow highlight bar.
  statement: [
    { text: "Music from" },
    { text: "real charting producers.", hl: true },
    { text: "Licensed for" },
    { text: "your content.", hl: true },
  ],
  subline:
    "Anti Audio is a music licensing subscription platform for creators and creatives. Get unlimited downloads of exclusive tracks from real charting producers, licensed for your social content, podcasts and websites.",
  // Second paragraph. Each `pair` gets a dashed underline and, on hover, a fan of two images.
  // Placeholder wording and placeholder artwork; swap in real genre artwork when it exists.
  genres: [
    { text: "We only offer a tight, quality catalogue of culturally relevant music. From " },
    { pair: "Trap & Drill", images: ["/artwork/placeholder-1.jpg", "/artwork/placeholder-2.jpg"] },
    { text: " built for the feed, to " },
    { pair: "House & Dance", images: ["/artwork/placeholder-3.jpg", "/artwork/placeholder-4.jpg"] },
    { text: " made to move a room, " },
    { pair: "Afrobeats & Rap", images: ["/artwork/placeholder-5.jpg", "/artwork/placeholder-1.jpg"] },
    { text: " with real swagger and " },
    { pair: "Grime & Garage", images: ["/artwork/placeholder-2.jpg", "/artwork/placeholder-3.jpg"] },
    { text: " straight from the underground." },
  ] as ({ text: string } | { pair: string; images: string[] })[],
};
