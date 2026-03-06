'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { ScoopLabMenuItem } from '@/types';

type ScoopPreviewProps = {
  vessel: ScoopLabMenuItem | null;
  scoops: Array<{ flavorId: number; position: number }>;
  toppings: number[];
  sauces: number[];
  allFlavors: ScoopLabMenuItem[];
  allToppings: ScoopLabMenuItem[];
};

// Map flavor name keywords to background colors for the scoop circles
function getFlavorColor(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('chocolate') || lower.includes('fudge') || lower.includes('brownie')) {
    return 'linear-gradient(135deg, #8B5E3C, #D4A06A)';
  }
  if (lower.includes('strawberry') || lower.includes('raspberry') || lower.includes('cherry')) {
    return 'linear-gradient(135deg, #F2798F, #F7B267)';
  }
  if (lower.includes('mint') || lower.includes('pistachio') || lower.includes('matcha')) {
    return 'linear-gradient(135deg, #7DBBA2, #A8E0D0)';
  }
  if (lower.includes('vanilla') || lower.includes('cream') || lower.includes('white')) {
    return 'linear-gradient(135deg, #FFF8F0, #F5EDE6)';
  }
  if (lower.includes('caramel') || lower.includes('butterscotch') || lower.includes('toffee')) {
    return 'linear-gradient(135deg, #C4883D, #E8C97A)';
  }
  if (lower.includes('blueberry') || lower.includes('lavender') || lower.includes('grape') || lower.includes('purple')) {
    return 'linear-gradient(135deg, #B8A4D6, #D8CEE8)';
  }
  // Default: fruity gradient
  return 'linear-gradient(135deg, #D4536A, #B8A4D6)';
}

function getVesselEmoji(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('waffle') || lower.includes('cone')) return '🍦';
  if (lower.includes('cup') || lower.includes('bowl')) return '🥤';
  if (lower.includes('sundae')) return '🍨';
  if (lower.includes('float')) return '🧃';
  return '🍦';
}

function getToppingEmoji(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('sprinkle')) return '🌈';
  if (lower.includes('cherry')) return '🍒';
  if (lower.includes('nut') || lower.includes('almond') || lower.includes('pecan')) return '🥜';
  if (lower.includes('coconut')) return '🥥';
  if (lower.includes('cookie') || lower.includes('oreo') || lower.includes('brownie')) return '🍪';
  if (lower.includes('banana')) return '🍌';
  if (lower.includes('strawberry')) return '🍓';
  if (lower.includes('mango') || lower.includes('pineapple')) return '🍍';
  if (lower.includes('whipped') || lower.includes('cream')) return '🤍';
  return '✨';
}

export function ScoopPreview({
  vessel,
  scoops,
  toppings,
  allFlavors,
  allToppings,
}: ScoopPreviewProps) {
  const scoopFlavors = scoops.map((s) => allFlavors.find((f) => f.id === s.flavorId) ?? null);
  const toppingItems = toppings.map((id) => allToppings.find((t) => t.id === id) ?? null);

  const isEmpty = !vessel && scoops.length === 0;

  return (
    <div
      className="flex flex-col items-center justify-end rounded-2xl p-6"
      style={{
        background: 'linear-gradient(180deg, #FFF0F3 0%, #FDF8F4 100%)',
        minHeight: '280px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background circles */}
      <div
        className="pointer-events-none absolute -top-8 -right-8 size-32 rounded-full opacity-10"
        style={{ background: '#D4536A' }}
      />
      <div
        className="pointer-events-none absolute -bottom-6 -left-6 size-24 rounded-full opacity-10"
        style={{ background: '#7DBBA2' }}
      />

      {isEmpty ? (
        <div className="flex flex-col items-center gap-2 py-8 opacity-40">
          <span className="text-5xl">🍦</span>
          <p className="text-xs font-medium" style={{ color: '#8C7B6B' }}>
            Your creation appears here
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-0">
          {/* Toppings scattered above scoops */}
          <AnimatePresence>
            {toppingItems.length > 0 && (
              <div className="mb-1 flex flex-wrap justify-center gap-1">
                {toppingItems.slice(0, 5).map((topping, i) => (
                  <motion.span
                    key={`topping-${i}`}
                    initial={{ y: -30, opacity: 0, rotate: 0 }}
                    animate={{ y: 0, opacity: 1, rotate: (i % 3 - 1) * 15 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 200,
                      damping: 20,
                      delay: i * 0.08,
                    }}
                    className="text-lg"
                    title={topping?.name}
                  >
                    {topping ? getToppingEmoji(topping.name) : '✨'}
                  </motion.span>
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Scoops stacked */}
          <div className="flex flex-col-reverse items-center gap-0">
            <AnimatePresence>
              {scoopFlavors.map((flavor, i) => (
                <motion.div
                  key={`scoop-${scoops[i]?.position ?? i}`}
                  initial={{ y: -40, opacity: 0, scale: 0.8 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -20, opacity: 0, scale: 0.8 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 24,
                    delay: i * 0.06,
                  }}
                  className="relative flex items-center justify-center rounded-full text-xs font-semibold"
                  style={{
                    width: 72 - i * 4,
                    height: 64 - i * 3,
                    background: flavor ? getFlavorColor(flavor.name) : 'linear-gradient(135deg, #F5EDE6, #E8DDD4)',
                    marginBottom: i > 0 ? -16 : 0,
                    boxShadow: '0 4px 8px rgba(45,36,32,0.15)',
                    zIndex: scoopFlavors.length - i,
                    border: '2px solid rgba(255,255,255,0.6)',
                  }}
                  title={flavor?.name ?? 'Scoop'}
                >
                  <span className="text-[10px] text-white/80 drop-shadow">
                    {i + 1}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Vessel */}
          <AnimatePresence>
            {vessel && (
              <motion.div
                key="vessel"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className="mt-1 text-4xl"
                title={vessel.name}
              >
                {getVesselEmoji(vessel.name)}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Flavor labels */}
          {scoopFlavors.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center gap-1">
              {scoopFlavors.map((flavor, i) => (
                <span
                  key={i}
                  className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{
                    background: 'rgba(255,255,255,0.7)',
                    color: '#6B5D52',
                    border: '1px solid rgba(212,83,106,0.2)',
                  }}
                >
                  {flavor?.name ?? 'Scoop'}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
