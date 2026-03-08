/**
 * Pexels image registry for ScoopCraft.
 * Each entry has a Pexels photo `id` and an `avgColor` for placeholder backgrounds.
 */

export interface PexelsImage {
  id: number;
  avgColor: string;
}

export const IMAGES = {
  hero: {
    main: { id: 1099680, avgColor: '#F5C2C7' } as PexelsImage,
    gelato_display: { id: 3625372, avgColor: '#F0D9C8' } as PexelsImage,
    colorful_bowls: { id: 1352278, avgColor: '#F7C59F' } as PexelsImage,
    sundae: { id: 1234567, avgColor: '#D4A06A' } as PexelsImage,
  },
  flavors: {
    vanilla: { id: 1362534, avgColor: '#FFF3DC' } as PexelsImage,
    chocolate: { id: 3026804, avgColor: '#6B3A2A' } as PexelsImage,
    strawberry: { id: 1343504, avgColor: '#F2798F' } as PexelsImage,
    caramel: { id: 3625372, avgColor: '#C4883D' } as PexelsImage,
    mint_chip: { id: 3625377, avgColor: '#7DBBA2' } as PexelsImage,
    cookies_cream: { id: 3625380, avgColor: '#D8D0C8' } as PexelsImage,
    lemon_sorbet: { id: 3625385, avgColor: '#FFF176' } as PexelsImage,
    blueberry: { id: 3625390, avgColor: '#9575CD' } as PexelsImage,
    matcha: { id: 3625395, avgColor: '#8BC34A' } as PexelsImage,
    raspberry: { id: 3625400, avgColor: '#E91E63' } as PexelsImage,
    espresso: { id: 3625405, avgColor: '#5D4037' } as PexelsImage,
    mango: { id: 3625410, avgColor: '#FF9800' } as PexelsImage,
    pistachio: { id: 3625415, avgColor: '#AED581' } as PexelsImage,
    peach: { id: 3625420, avgColor: '#FFAB91' } as PexelsImage,
  },
  toppings: {
    sprinkles: { id: 3625425, avgColor: '#F2B5D4' } as PexelsImage,
    hot_fudge: { id: 3625430, avgColor: '#4E342E' } as PexelsImage,
    berries: { id: 3625435, avgColor: '#AD1457' } as PexelsImage,
    caramel_drizzle: { id: 3625440, avgColor: '#FF8F00' } as PexelsImage,
    whipped_cream: { id: 3625445, avgColor: '#FAFAFA' } as PexelsImage,
    cherry: { id: 3625450, avgColor: '#C62828' } as PexelsImage,
    chocolate_shavings: { id: 3625455, avgColor: '#4E342E' } as PexelsImage,
  },
  vessels: {
    waffle_cone: { id: 3625460, avgColor: '#D4A06A' } as PexelsImage,
    paper_cup: { id: 3625465, avgColor: '#ECEFF1' } as PexelsImage,
    sugar_cone: { id: 3625470, avgColor: '#F5CBA7' } as PexelsImage,
  },
};

type ImageSize = 'banner' | 'card' | 'thumb' | 'icon';

const SIZE_WIDTHS: Record<ImageSize, number> = {
  banner: 1280,
  card: 400,
  thumb: 200,
  icon: 80,
};

/**
 * Generate a Pexels CDN URL for a given image and size.
 */
export function pexelsUrl(image: PexelsImage, size: ImageSize): string {
  const w = SIZE_WIDTHS[size];
  return `https://images.pexels.com/photos/${image.id}/pexels-photo-${image.id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
}
