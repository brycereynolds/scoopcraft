/**
 * ScoopCraft Imagery System
 * ─────────────────────────────────────────────────────────────────────────────
 * Build-time photo catalog for all ScoopCraft pages.
 * Photo IDs sourced from Pexels API — curated for brand fit.
 *
 * Usage:
 *   import { IMAGES, pexelsUrl } from "@/lib/imagery";
 *   <img src={pexelsUrl(IMAGES.flavors.vanilla, "card")} alt={IMAGES.flavors.vanilla.alt} />
 *
 * Attribution: Photos by Pexels (https://pexels.com)
 * API Key env var: PEXELS_API_KEY
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PexelsPhoto {
  /** Pexels photo ID */
  id: number;
  /** Descriptive alt text */
  alt: string;
  /** Photographer name for attribution */
  photographer: string;
  /** Pexels page URL for attribution link */
  pexelsUrl: string;
  /** Average color hex (use as loading placeholder background) */
  avgColor: string;
}

export type ImageSize =
  | "icon"      // 80×80   — topping icons, small badges
  | "thumb"     // 200×200 — thumbnails, cart items
  | "card"      // 400×400 — product cards
  | "card_lg"   // 600×600 — modal zoom, featured cards
  | "retina"    // 800×800 — retina product cards
  | "portrait"  // 800×1200 — tall lifestyle shots
  | "hero"      // 1200×627 — full-width landscape heroes
  | "banner";   // 940×650  — banner / feature sections

// ─── URL Builder ─────────────────────────────────────────────────────────────

const SIZE_PARAMS: Record<ImageSize, string> = {
  icon:     "auto=compress&cs=tinysrgb&fit=crop&h=80&w=80",
  thumb:    "auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
  card:     "auto=compress&cs=tinysrgb&fit=crop&h=400&w=400",
  card_lg:  "auto=compress&cs=tinysrgb&fit=crop&h=600&w=600",
  retina:   "auto=compress&cs=tinysrgb&fit=crop&h=800&w=800",
  portrait: "auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
  hero:     "auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  banner:   "auto=compress&cs=tinysrgb&h=650&w=940",
};

/**
 * Build a Pexels CDN URL for a given photo and size.
 *
 * @example
 * pexelsUrl(IMAGES.flavors.vanilla, "card")
 * // → "https://images.pexels.com/photos/29851690/pexels-photo-29851690.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=400"
 */
export function pexelsUrl(photo: PexelsPhoto, size: ImageSize = "card"): string {
  return `https://images.pexels.com/photos/${photo.id}/pexels-photo-${photo.id}.jpeg?${SIZE_PARAMS[size]}`;
}

/**
 * Build a srcSet string for responsive images.
 *
 * @example
 * pexelsSrcSet(IMAGES.flavors.vanilla, [["card", "400w"], ["retina", "800w"]])
 */
export function pexelsSrcSet(
  photo: PexelsPhoto,
  sizes: [ImageSize, string][]
): string {
  return sizes
    .map(([size, descriptor]) => `${pexelsUrl(photo, size)} ${descriptor}`)
    .join(", ");
}

// ─── Photo Catalog ────────────────────────────────────────────────────────────

export const IMAGES = {

  // ── FLAVOR HEROES ───────────────────────────────────────────────────────────
  // Used in: Menu page product cards, Scoop Lab, Admin inventory, Landing specials

  flavors: {
    vanilla: {
      id: 29851690,
      alt: "Vanilla bean ice cream artfully styled in a glass dish with vanilla pod garnish",
      photographer: "Daniel & Hannah Snipes",
      pexelsUrl: "https://www.pexels.com/photo/vanilla-ice-cream-in-glass-dish-with-natural-garnish-29851690/",
      avgColor: "#A9ABA6",
    },
    chocolate: {
      id: 2846337,
      alt: "Rich dark chocolate ice cream topped with crunchy toppings in elegant presentation",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/2846337/",
      avgColor: "#5C3D28",
    },
    strawberry: {
      id: 5535557,
      alt: "Vibrant strawberry ice cream scoop on a pink background, close-up",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/5535557/",
      avgColor: "#E87D7D",
    },
    mint_chip: {
      id: 29851705,
      alt: "Mint chocolate chip ice cream with fresh mint leaves garnish",
      photographer: "Daniel & Hannah Snipes",
      pexelsUrl: "https://www.pexels.com/photo/29851705/",
      avgColor: "#8A9E8A",
    },
    caramel: {
      id: 5060454,
      alt: "Salted caramel ice cream with caramel drizzle and crushed crust topping",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/5060454/",
      avgColor: "#C49A52",
    },
    cookies_cream: {
      id: 5060459,
      alt: "Cookies and cream ice cream with Oreo cookie pieces scattered on top",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/5060459/",
      avgColor: "#7A6B5E",
    },
    lemon_sorbet: {
      id: 28376175,
      alt: "Lemon sorbet elegantly presented in a glass with a lemon twist garnish",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/28376175/",
      avgColor: "#E8D870",
    },
    blueberry: {
      id: 5090114,
      alt: "Wild blueberry ice cream scoop with fresh blueberries scattered around",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/5090114/",
      avgColor: "#5B4C7A",
    },
    matcha: {
      id: 33984384,
      alt: "Matcha green tea ice cream with chocolate crumble in an elegant bowl",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/33984384/",
      avgColor: "#7A9A6A",
    },
    raspberry: {
      id: 1352251,
      alt: "Vibrant raspberry ice cream cone with colorful scoops",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/1352251/",
      avgColor: "#C45A70",
    },
    espresso: {
      id: 32972513,
      alt: "Creamy affogato with espresso being poured over vanilla ice cream",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/32972513/",
      avgColor: "#5A3E2A",
    },
    mango: {
      id: 2262048,
      alt: "Hand holding refreshing mango sorbet, vibrant tropical orange color",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/2262048/",
      avgColor: "#E8A040",
    },
    pistachio: {
      id: 22809624,
      alt: "Creamy pistachio ice cream with pistachio crumble topping",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/22809624/",
      avgColor: "#8A9E6A",
    },
    peach: {
      id: 9093556,
      alt: "Grilled peaches topped with vanilla ice cream, summer dessert",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/9093556/",
      avgColor: "#E8A882",
    },
  },

  // ── HERO / SHOWCASE ──────────────────────────────────────────────────────────
  // Used in: Landing page hero, Menu banner, Scoop Lab intro

  hero: {
    main: {
      id: 9227981,
      alt: "Delicious assortment of artisan ice cream scoops with fresh strawberries — overhead view",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/9227981/",
      avgColor: "#C4848C",
    },
    colorful_bowls: {
      id: 20446416,
      alt: "Vibrant ice cream scoops in metal bowls on colorful background",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/20446416/",
      avgColor: "#D4A0A0",
    },
    shop_scoop: {
      id: 5108033,
      alt: "A hand scoops chocolate ice cream from a vibrant gelato display case",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/5108033/",
      avgColor: "#7A5A4A",
    },
    cone_held: {
      id: 2708337,
      alt: "Person holding a chocolate and vanilla ice cream cone in summer",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/2708337/",
      avgColor: "#B48A6A",
    },
    sundae: {
      id: 17717452,
      alt: "Close-up of an ice cream sundae with chocolate sauce and fresh fruit",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/17717452/",
      avgColor: "#8A6A5A",
    },
    gelato_display: {
      id: 33431370,
      alt: "Close-up of colorful artisan gelato scoops in a shop display case",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/33431370/",
      avgColor: "#D4A8A8",
    },
    scoop_action: {
      id: 25391582,
      alt: "Close-up of a server scooping ice cream in an ice cream shop",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/25391582/",
      avgColor: "#B4A090",
    },
    pink_scoop: {
      id: 20446417,
      alt: "Two scoops of pink strawberry ice cream in a metal bowl",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/20446417/",
      avgColor: "#E8B0B0",
    },
  },

  // ── LIFESTYLE ────────────────────────────────────────────────────────────────
  // Used in: Social proof, testimonials, about sections

  lifestyle: {
    happy_woman: {
      id: 32836241,
      alt: "Woman enjoying a vanilla ice cream cone outdoors on a sunny day",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/32836241/",
      avgColor: "#C4A882",
    },
    couple: {
      id: 8933523,
      alt: "Couple sharing a romantic moment with ice cream in a bright setting",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/8933523/",
      avgColor: "#D4C0A8",
    },
    child_joy: {
      id: 4908712,
      alt: "Young boy happily eating an ice cream cone",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/4908712/",
      avgColor: "#C4B090",
    },
    friends_cones: {
      id: 33820674,
      alt: "Happy couple walking outdoors enjoying ice cream cones",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/33820674/",
      avgColor: "#A8C48A",
    },
  },

  // ── SHOP / BRAND ─────────────────────────────────────────────────────────────
  // Used in: About page, homepage brand section

  shop: {
    gelato_case: {
      id: 5915081,
      alt: "Vibrant gelato display in an artisan shop, capturing colorful flavors",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/5915081/",
      avgColor: "#D4A870",
    },
    making: {
      id: 34452066,
      alt: "Three bowls of artisan ice cream with chocolate drizzle, overhead view",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/34452066/",
      avgColor: "#9A7A6A",
    },
    exterior: {
      id: 36428388,
      alt: "Charming dessert shop storefront exterior",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/36428388/",
      avgColor: "#C4C0B8",
    },
  },

  // ── TOPPINGS ─────────────────────────────────────────────────────────────────
  // Used in: Scoop Lab ingredient selector, Menu page, Admin inventory

  toppings: {
    sprinkles: {
      id: 1174114,
      alt: "Close-up of vibrant multicolor rainbow candy sprinkles",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/1174114/",
      avgColor: "#D4A8C8",
    },
    hot_fudge: {
      id: 27359379,
      alt: "Indulgent brownie topped with ice cream and rich hot fudge drizzle",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/27359379/",
      avgColor: "#5A3A2A",
    },
    berries: {
      id: 10782987,
      alt: "Vibrant close-up of fresh strawberries and mixed berries on a dessert",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/10782987/",
      avgColor: "#D45A5A",
    },
    caramel_drizzle: {
      id: 34623625,
      alt: "Elegant caramel drizzle over a dessert with pecans, golden and rich",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/34623625/",
      avgColor: "#C49850",
    },
    whipped_cream: {
      id: 15455285,
      alt: "Creamy chocolate dessert topped with a swirl of whipped cream",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/15455285/",
      avgColor: "#F0E8D8",
    },
    waffle_cone: {
      id: 18440703,
      alt: "Gourmet waffle cones with chocolate and caramel, crispy golden texture",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/18440703/",
      avgColor: "#C89A60",
    },
    chocolate_shavings: {
      id: 6036364,
      alt: "Close-up of broken dark chocolate pieces scattered on white surface",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/6036364/",
      avgColor: "#4A2A1A",
    },
    cherry: {
      id: 10782987,
      alt: "Bright red cherries and fresh berries for ice cream topping",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/10782987/",
      avgColor: "#D45A5A",
    },
  },

  // ── VESSELS ──────────────────────────────────────────────────────────────────
  // Used in: Scoop Lab vessel selector, Checkout order summary

  vessels: {
    waffle_cone: {
      id: 18440703,
      alt: "Classic waffle cone, crispy golden texture close-up",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/18440703/",
      avgColor: "#C89A60",
    },
    paper_cup: {
      id: 25841520,
      alt: "Six assorted gourmet ice creams in colorful paper cups, top view",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/25841520/",
      avgColor: "#D4C8C0",
    },
    sugar_cone: {
      id: 2708337,
      alt: "Classic sugar cone with chocolate and vanilla ice cream scoops",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/2708337/",
      avgColor: "#B48A6A",
    },
  },

  // ── DELIVERY / SUBSCRIPTION ──────────────────────────────────────────────────
  // Used in: Checkout page, landing page delivery section, subscription section

  delivery: {
    premium_packaging: {
      id: 35746481,
      alt: "Elegant pink gift boxes with gold details — premium ice cream delivery packaging",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/35746481/",
      avgColor: "#E8C0C0",
    },
    courier: {
      id: 7363054,
      alt: "Courier with delivery bag waiting at a porch for contactless delivery",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/7363054/",
      avgColor: "#8A9898",
    },
  },

  // ── INGREDIENTS ──────────────────────────────────────────────────────────────
  // Used in: About page, flavor detail pages, newsletter backgrounds

  ingredients: {
    vanilla_pods: {
      id: 4963314,
      alt: "Top view of aromatic vanilla beans and pods on a white plate",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/4963314/",
      avgColor: "#C8A870",
    },
    strawberries: {
      id: 16827626,
      alt: "Detailed macro shot of fresh strawberries growing, vibrant red",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/16827626/",
      avgColor: "#D45A5A",
    },
    dark_chocolate: {
      id: 6036364,
      alt: "Close-up of broken dark chocolate pieces on white surface",
      photographer: "Pexels",
      pexelsUrl: "https://www.pexels.com/photo/6036364/",
      avgColor: "#4A2A1A",
    },
  },

} as const;

// ─── Convenience Accessors ────────────────────────────────────────────────────

/**
 * Get the primary hero image for the landing page.
 */
export const heroMain = IMAGES.hero.main;

/**
 * Get all flavor photos as an array (for menu iteration).
 */
export const allFlavors = Object.entries(IMAGES.flavors).map(([slug, photo]) => ({
  slug,
  ...photo,
}));

/**
 * Get all topping photos as an array (for Scoop Lab).
 */
export const allToppings = Object.entries(IMAGES.toppings).map(([slug, photo]) => ({
  slug,
  ...photo,
}));

// ─── Runtime Search (for admin-managed custom flavors) ───────────────────────

/**
 * Search Pexels API for photos matching a query.
 * Use this in admin dashboard for custom flavor photo selection.
 *
 * @example
 * const photos = await searchPexels("lavender honey ice cream", 5);
 */
export async function searchPexels(
  query: string,
  perPage = 5
): Promise<Array<{
  id: number;
  alt: string;
  photographer: string;
  avgColor: string;
  urls: Record<ImageSize, string>;
}>> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) throw new Error("PEXELS_API_KEY environment variable not set");

  const params = new URLSearchParams({ query, per_page: String(perPage) });
  const res = await fetch(`https://api.pexels.com/v1/search?${params}`, {
    headers: { Authorization: apiKey },
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`Pexels API error: ${res.status}`);
  const data = await res.json();

  return data.photos.map((p: { id: number; alt: string; photographer: string; avg_color: string }) => ({
    id: p.id,
    alt: p.alt,
    photographer: p.photographer,
    avgColor: p.avg_color,
    urls: Object.fromEntries(
      (Object.keys(SIZE_PARAMS) as ImageSize[]).map((size) => [
        size,
        `https://images.pexels.com/photos/${p.id}/pexels-photo-${p.id}.jpeg?${SIZE_PARAMS[size]}`,
      ])
    ),
  }));
}

// ─── CSS Fallback Colors ──────────────────────────────────────────────────────
// These are used as background-color on img containers while photos load.
// Use photo.avgColor for the matching image, or these brand-specific values
// for flavor slots that haven't loaded yet.

export const FLAVOR_FALLBACK_COLORS: Record<keyof typeof IMAGES.flavors, string> = {
  vanilla:      "#FEF3C7",
  chocolate:    "#92400E",
  strawberry:   "#FECDD3",
  mint_chip:    "#A7F3D0",
  caramel:      "#FDE68A",
  cookies_cream:"#E2E8F0",
  lemon_sorbet: "#FEF9C3",
  blueberry:    "#EDE9FE",
  matcha:       "#DCFCE7",
  raspberry:    "#FCE7F3",
  espresso:     "#451A03",
  mango:        "#FEF3C7",
  pistachio:    "#ECFCCB",
  peach:        "#FED7AA",
};
