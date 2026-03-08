'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Check, ChevronLeft, ChevronRight, ShoppingCart, RotateCcw, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createScoopLabConfig, addScoopLabToCart } from '@/actions/scoop-lab';
import { IMAGES, pexelsUrl } from '@/lib/imagery';
import { ScoopPreview } from './scoop-preview';
import type { ScoopLabMenuItem } from '@/types';

type ScoopLabBuilderProps = {
  items: {
    vessels: ScoopLabMenuItem[];
    flavors: ScoopLabMenuItem[];
    toppings: ScoopLabMenuItem[];
    sauces: ScoopLabMenuItem[];
  };
};

type Step = 1 | 2 | 3 | 4 | 5;

const STEP_LABELS: Record<Step, string> = {
  1: 'Vessel',
  2: 'Scoops',
  3: 'Toppings',
  4: 'Sauces',
  5: 'Review',
};

const MAX_SCOOPS = 4;
const MAX_TOPPINGS = 5;
const MAX_SAUCES = 3;

function formatPrice(cents: number | string): string {
  const n = typeof cents === 'string' ? parseFloat(cents) : cents;
  return `$${n.toFixed(2)}`;
}

type ItemCardProps = {
  item: ScoopLabMenuItem;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  badge?: string;
};

function ItemCard({ item, selected, onClick, disabled = false, badge }: ItemCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4536A] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
      style={{
        background: selected ? 'rgba(212,83,106,0.06)' : 'white',
        borderColor: selected ? '#D4536A' : '#E8DDD4',
        boxShadow: selected
          ? '0 0 0 3px rgba(212,83,106,0.15), 0 4px 6px rgba(45,36,32,0.07)'
          : '0 2px 8px rgba(45,36,32,0.06)',
        transform: selected ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      {selected && (
        <div
          className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full"
          style={{ background: '#D4536A' }}
        >
          <Check className="size-3 text-white" />
        </div>
      )}
      {badge && (
        <span
          className="absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
          style={{ background: 'rgba(212,83,106,0.12)', color: '#D4536A' }}
        >
          {badge}
        </span>
      )}
      {(() => {
        const pexelsImageUrl = item.photoUrl || getItemPexelsUrl(item);
        return pexelsImageUrl ? (
          <div className="relative h-16 w-16 rounded-xl overflow-hidden flex-shrink-0">
            <Image
              src={pexelsImageUrl}
              alt={item.name}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
        ) : (
          <span className="text-2xl" aria-hidden="true">
            {getItemEmoji(item)}
          </span>
        );
      })()}
      <div className="w-full text-center">
        <p className="text-sm font-medium leading-tight" style={{ color: '#2D2420' }}>
          {item.name}
        </p>
        {item.description && (
          <p
            className="mt-0.5 line-clamp-2 text-[11px] leading-tight"
            style={{ color: '#8C7B6B' }}
          >
            {item.description}
          </p>
        )}
        <p className="mt-1 text-sm font-bold" style={{ color: '#D4536A' }}>
          {formatPrice(item.price)}
        </p>
      </div>
    </button>
  );
}

function getItemPexelsUrl(item: ScoopLabMenuItem): string | null {
  const lower = item.name.toLowerCase();
  if (lower.includes('vanilla')) return pexelsUrl(IMAGES.flavors.vanilla, 'card');
  if (lower.includes('dark chocolate') || lower.includes('chocolate obsession')) return pexelsUrl(IMAGES.flavors.chocolate, 'card');
  if (lower.includes('chocolate')) return pexelsUrl(IMAGES.flavors.chocolate, 'card');
  if (lower.includes('strawberry')) return pexelsUrl(IMAGES.flavors.strawberry, 'card');
  if (lower.includes('mint')) return pexelsUrl(IMAGES.flavors.mint_chip, 'card');
  if (lower.includes('caramel')) return pexelsUrl(IMAGES.flavors.caramel, 'card');
  if (lower.includes('cookies') || lower.includes('cream')) return pexelsUrl(IMAGES.flavors.cookies_cream, 'card');
  if (lower.includes('lemon') || lower.includes('sorbet')) return pexelsUrl(IMAGES.flavors.lemon_sorbet, 'card');
  if (lower.includes('blueberry')) return pexelsUrl(IMAGES.flavors.blueberry, 'card');
  if (lower.includes('matcha') || lower.includes('green tea')) return pexelsUrl(IMAGES.flavors.matcha, 'card');
  if (lower.includes('raspberry')) return pexelsUrl(IMAGES.flavors.raspberry, 'card');
  if (lower.includes('espresso') || lower.includes('coffee')) return pexelsUrl(IMAGES.flavors.espresso, 'card');
  if (lower.includes('mango')) return pexelsUrl(IMAGES.flavors.mango, 'card');
  if (lower.includes('pistachio')) return pexelsUrl(IMAGES.flavors.pistachio, 'card');
  if (lower.includes('peach')) return pexelsUrl(IMAGES.flavors.peach, 'card');
  if (lower.includes('sprinkle') || lower.includes('rainbow')) return pexelsUrl(IMAGES.toppings.sprinkles, 'thumb');
  if (lower.includes('fudge')) return pexelsUrl(IMAGES.toppings.hot_fudge, 'thumb');
  if (lower.includes('berry') || lower.includes('berries')) return pexelsUrl(IMAGES.toppings.berries, 'thumb');
  if (lower.includes('caramel drizzle')) return pexelsUrl(IMAGES.toppings.caramel_drizzle, 'thumb');
  if (lower.includes('whipped')) return pexelsUrl(IMAGES.toppings.whipped_cream, 'thumb');
  if (lower.includes('waffle cone')) return pexelsUrl(IMAGES.vessels.waffle_cone, 'thumb');
  if (lower.includes('cup') || lower.includes('bowl')) return pexelsUrl(IMAGES.vessels.paper_cup, 'thumb');
  if (lower.includes('sugar cone') || lower.includes('cone')) return pexelsUrl(IMAGES.vessels.sugar_cone, 'thumb');
  return null;
}

function getItemEmoji(item: ScoopLabMenuItem): string {
  const lower = item.name.toLowerCase();
  if (item.photoUrl) return item.photoUrl;
  // Vessels
  if (lower.includes('waffle') || lower.includes('cone')) return pexelsUrl(IMAGES.vessels.waffle_cone, 'icon');
  if (lower.includes('cup') || lower.includes('bowl')) return pexelsUrl(IMAGES.vessels.paper_cup, 'icon');
  if (lower.includes('sundae')) return pexelsUrl(IMAGES.hero.sundae, 'icon');
  // Flavors
  if (lower.includes('vanilla')) return pexelsUrl(IMAGES.flavors.vanilla, 'icon');
  if (lower.includes('chocolate') || lower.includes('fudge')) return pexelsUrl(IMAGES.flavors.chocolate, 'icon');
  if (lower.includes('strawberry')) return pexelsUrl(IMAGES.flavors.strawberry, 'icon');
  if (lower.includes('mint') || lower.includes('matcha')) return pexelsUrl(IMAGES.flavors.mint_chip, 'icon');
  if (lower.includes('caramel')) return pexelsUrl(IMAGES.flavors.caramel, 'icon');
  if (lower.includes('pistachio')) return pexelsUrl(IMAGES.flavors.pistachio, 'icon');
  if (lower.includes('mango')) return pexelsUrl(IMAGES.flavors.mango, 'icon');
  if (lower.includes('blueberry') || lower.includes('lavender')) return pexelsUrl(IMAGES.flavors.blueberry, 'icon');
  if (lower.includes('lemon') || lower.includes('citrus')) return pexelsUrl(IMAGES.flavors.lemon_sorbet, 'icon');
  if (lower.includes('coffee') || lower.includes('espresso')) return pexelsUrl(IMAGES.flavors.espresso, 'icon');
  if (lower.includes('cookies') || lower.includes('oreo')) return pexelsUrl(IMAGES.flavors.cookies_cream, 'icon');
  if (lower.includes('peach')) return pexelsUrl(IMAGES.flavors.peach, 'icon');
  if (lower.includes('raspberry')) return pexelsUrl(IMAGES.flavors.raspberry, 'icon');
  // Toppings
  if (lower.includes('sprinkle')) return pexelsUrl(IMAGES.toppings.sprinkles, 'icon');
  if (lower.includes('cherry')) return pexelsUrl(IMAGES.toppings.cherry, 'icon');
  if (lower.includes('whipped') || lower.includes('cream')) return pexelsUrl(IMAGES.toppings.whipped_cream, 'icon');
  if (lower.includes('hot fudge') || lower.includes('fudge sauce')) return pexelsUrl(IMAGES.toppings.hot_fudge, 'icon');
  if (lower.includes('caramel sauce')) return pexelsUrl(IMAGES.toppings.caramel_drizzle, 'icon');
  if (lower.includes('chocolate')) return pexelsUrl(IMAGES.toppings.chocolate_shavings, 'icon');
  if (lower.includes('berr') || lower.includes('strawberry sauce') || lower.includes('raspberry')) return pexelsUrl(IMAGES.toppings.berries, 'icon');
  // Default fallback by category
  if (item.category === 'flavor') return pexelsUrl(IMAGES.hero.main, 'icon');
  if (item.category === 'topping') return pexelsUrl(IMAGES.toppings.sprinkles, 'icon');
  if (item.category === 'sauce') return pexelsUrl(IMAGES.toppings.hot_fudge, 'icon');
  if (item.category === 'vessel') return pexelsUrl(IMAGES.vessels.waffle_cone, 'icon');
  return pexelsUrl(IMAGES.hero.main, 'icon');
}

function StepIndicator({ currentStep }: { currentStep: Step }) {
  const steps = [1, 2, 3, 4, 5] as Step[];

  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((step, i) => {
        const isCompleted = step < currentStep;
        const isActive = step === currentStep;

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className="flex size-9 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300"
                style={{
                  background: isCompleted
                    ? '#7DBBA2'
                    : isActive
                      ? '#D4536A'
                      : '#F5EDE6',
                  color: isCompleted || isActive ? 'white' : '#8C7B6B',
                  boxShadow: isActive ? '0 0 0 3px rgba(212,83,106,0.2)' : 'none',
                }}
              >
                {isCompleted ? <Check className="size-4" /> : step}
              </div>
              <span
                className="hidden text-[10px] font-medium uppercase tracking-wide sm:block"
                style={{ color: isActive ? '#D4536A' : '#8C7B6B' }}
              >
                {STEP_LABELS[step]}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="mx-1 mb-4 h-0.5 w-8 sm:w-12 transition-all duration-500"
                style={{
                  background: step < currentStep ? '#7DBBA2' : '#E8DDD4',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function LivePriceBadge({ price }: { price: number }) {
  return (
    <motion.div
      key={price}
      initial={{ scale: 1.15 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold"
      style={{
        background: '#D4536A',
        color: 'white',
        boxShadow: '0 4px 12px rgba(212,83,106,0.3)',
      }}
    >
      <span style={{ fontSize: '0.7rem', opacity: 0.85 }}>TOTAL</span>
      {formatPrice(price)}
    </motion.div>
  );
}

export function ScoopLabBuilder({ items }: ScoopLabBuilderProps) {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedVesselId, setSelectedVesselId] = useState<number | null>(null);
  const [selectedScoops, setSelectedScoops] = useState<Array<{ flavorId: number; position: number }>>([]);
  const [selectedToppings, setSelectedToppings] = useState<number[]>([]);
  const [selectedSauces, setSelectedSauces] = useState<number[]>([]);
  const [creationName, setCreationName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Computed: live price
  const livePrice = useMemo(() => {
    let total = 0;
    if (selectedVesselId) {
      const v = items.vessels.find((v) => v.id === selectedVesselId);
      if (v) total += parseFloat(v.price);
    }
    for (const scoop of selectedScoops) {
      const f = items.flavors.find((f) => f.id === scoop.flavorId);
      if (f) total += parseFloat(f.price);
    }
    for (const id of selectedToppings) {
      const t = items.toppings.find((t) => t.id === id);
      if (t) total += parseFloat(t.price);
    }
    for (const id of selectedSauces) {
      const s = items.sauces.find((s) => s.id === id);
      if (s) total += parseFloat(s.price);
    }
    return total;
  }, [selectedVesselId, selectedScoops, selectedToppings, selectedSauces, items]);

  const selectedVessel = useMemo(
    () => items.vessels.find((v) => v.id === selectedVesselId) ?? null,
    [selectedVesselId, items.vessels]
  );

  const canGoNext = useMemo(() => {
    if (currentStep === 1) return selectedVesselId !== null;
    if (currentStep === 2) return selectedScoops.length >= 1;
    return true;
  }, [currentStep, selectedVesselId, selectedScoops]);

  const goNext = useCallback(() => {
    if (currentStep < 5) setCurrentStep((s) => (s + 1) as Step);
  }, [currentStep]);

  const goBack = useCallback(() => {
    if (currentStep > 1) setCurrentStep((s) => (s - 1) as Step);
  }, [currentStep]);

  const toggleScoop = useCallback(
    (flavorId: number) => {
      setSelectedScoops((prev) => {
        const existing = prev.find((s) => s.flavorId === flavorId);
        if (existing) {
          return prev.filter((s) => s.flavorId !== flavorId);
        }
        if (prev.length >= MAX_SCOOPS) {
          toast.info(`Max ${MAX_SCOOPS} scoops allowed`);
          return prev;
        }
        return [...prev, { flavorId, position: prev.length + 1 }];
      });
    },
    []
  );

  const toggleTopping = useCallback(
    (id: number) => {
      setSelectedToppings((prev) => {
        if (prev.includes(id)) return prev.filter((t) => t !== id);
        if (prev.length >= MAX_TOPPINGS) {
          toast.info(`Max ${MAX_TOPPINGS} toppings allowed`);
          return prev;
        }
        return [...prev, id];
      });
    },
    []
  );

  const toggleSauce = useCallback(
    (id: number) => {
      setSelectedSauces((prev) => {
        if (prev.includes(id)) return prev.filter((s) => s !== id);
        if (prev.length >= MAX_SAUCES) {
          toast.info(`Max ${MAX_SAUCES} sauces allowed`);
          return prev;
        }
        return [...prev, id];
      });
    },
    []
  );

  const handleAddToCart = useCallback(async () => {
    if (!selectedVesselId || selectedScoops.length === 0) {
      toast.error('Please choose a vessel and at least one scoop');
      return;
    }

    setIsSubmitting(true);

    try {
      // Build items array for the server action
      const actionItems = [
        { menuItemId: selectedVesselId, quantity: 1 },
        ...selectedScoops.map((s) => ({
          menuItemId: s.flavorId,
          quantity: 1,
          position: s.position,
        })),
        ...selectedToppings.map((id) => ({ menuItemId: id, quantity: 1 })),
        ...selectedSauces.map((id) => ({ menuItemId: id, quantity: 1 })),
      ];

      const { id: configId } = await createScoopLabConfig(actionItems);
      await addScoopLabToCart(configId, 1);

      setIsSuccess(true);
      toast.success(
        creationName ? `"${creationName}" added to your cart!` : 'Your creation was added to cart!'
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedVesselId, selectedScoops, selectedToppings, selectedSauces, creationName]);

  const handleBuildAnother = useCallback(() => {
    setSelectedVesselId(null);
    setSelectedScoops([]);
    setSelectedToppings([]);
    setSelectedSauces([]);
    setCreationName('');
    setIsSuccess(false);
    setCurrentStep(1);
  }, []);

  // Empty state guard
  const hasItems =
    items.vessels.length > 0 || items.flavors.length > 0;

  if (!hasItems) {
    return (
      <div
        className="mx-auto max-w-lg rounded-3xl p-12 text-center"
        style={{ background: 'white', boxShadow: '0 8px 24px rgba(45,36,32,0.08)' }}
      >
        <div className="mb-4 w-24 h-24 mx-auto rounded-full overflow-hidden">
          <Image
            src={pexelsUrl(IMAGES.hero.main, 'thumb')}
            alt="Ice cream scoops"
            width={96}
            height={96}
            className="object-cover w-full h-full"
          />
        </div>
        <h2
          className="mb-2 text-2xl"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: '#2D2420' }}
        >
          Coming Soon
        </h2>
        <p style={{ color: '#6B5D52' }}>
          The Scoop Lab is being stocked. Check back soon to build your perfect creation!
        </p>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-md rounded-3xl p-12 text-center"
        style={{ background: 'white', boxShadow: '0 8px 24px rgba(45,36,32,0.08)' }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
          className="mb-4 text-6xl"
        >
          🎉
        </motion.div>
        <h2
          className="mb-2 text-2xl"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: '#2D2420' }}
        >
          {creationName ? `"${creationName}" is in your cart!` : 'Your creation is in your cart!'}
        </h2>
        <p className="mb-6 text-sm" style={{ color: '#6B5D52' }}>
          {formatPrice(livePrice)} — ready to checkout
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={() => router.push('/cart')}
            className="gap-2"
            style={{ background: '#D4536A', color: 'white' }}
          >
            <ShoppingCart className="size-4" />
            View Cart
          </Button>
          <Button variant="outline" onClick={handleBuildAnother} className="gap-2">
            <RotateCcw className="size-4" />
            Build Another
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Step indicator */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <StepIndicator currentStep={currentStep} />
      </div>

      {/* Main layout: builder + preview */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Builder panel */}
        <div
          className="flex-1 rounded-3xl bg-white p-6 md:p-8"
          style={{ boxShadow: '0 4px 16px rgba(45,36,32,0.07)', minHeight: '480px' }}
        >
          {/* Step header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#8C7B6B' }}>
                Step {currentStep} of 5
              </p>
              <h2
                className="text-2xl"
                style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: '#2D2420' }}
              >
                {currentStep === 1 && 'Choose Your Vessel'}
                {currentStep === 2 && `Choose Your Scoops (${selectedScoops.length}/${MAX_SCOOPS})`}
                {currentStep === 3 && `Add Toppings (${selectedToppings.length}/${MAX_TOPPINGS})`}
                {currentStep === 4 && `Add Sauces (${selectedSauces.length}/${MAX_SAUCES})`}
                {currentStep === 5 && 'Review & Name It'}
              </h2>
              <p className="mt-1 text-sm" style={{ color: '#8C7B6B' }}>
                {currentStep === 1 && 'What will hold your masterpiece?'}
                {currentStep === 2 && 'Pick 1–4 flavors, stacked from bottom to top.'}
                {currentStep === 3 && 'Optional — up to 5 toppings.'}
                {currentStep === 4 && 'Optional — up to 3 sauces.'}
                {currentStep === 5 && 'Give your creation a name and add it to your cart.'}
              </p>
            </div>
            <LivePriceBadge price={livePrice} />
          </div>

          {/* Step content with animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              {/* Step 1: Vessel */}
              {currentStep === 1 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {items.vessels.map((vessel) => (
                    <ItemCard
                      key={vessel.id}
                      item={vessel}
                      selected={selectedVesselId === vessel.id}
                      onClick={() => setSelectedVesselId(vessel.id)}
                      badge={vessel.availabilityType === 'seasonal' ? 'Seasonal' : undefined}
                    />
                  ))}
                  {items.vessels.length === 0 && (
                    <p className="col-span-full text-center text-sm" style={{ color: '#8C7B6B' }}>
                      No vessels available right now.
                    </p>
                  )}
                </div>
              )}

              {/* Step 2: Scoops */}
              {currentStep === 2 && (
                <div>
                  <div className="mb-4 flex gap-2">
                    {Array.from({ length: MAX_SCOOPS }).map((_, i) => (
                      <div
                        key={i}
                        className="flex h-8 flex-1 items-center justify-center rounded-lg text-xs font-medium transition-all duration-200"
                        style={{
                          background:
                            i < selectedScoops.length
                              ? 'rgba(212,83,106,0.1)'
                              : '#F5EDE6',
                          color: i < selectedScoops.length ? '#D4536A' : '#8C7B6B',
                          border: i < selectedScoops.length
                            ? '1px solid rgba(212,83,106,0.3)'
                            : '1px solid #E8DDD4',
                        }}
                      >
                        {i < selectedScoops.length ? `Scoop ${i + 1}` : `+`}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {items.flavors.map((flavor) => {
                      const isSelected = selectedScoops.some((s) => s.flavorId === flavor.id);
                      return (
                        <ItemCard
                          key={flavor.id}
                          item={flavor}
                          selected={isSelected}
                          onClick={() => toggleScoop(flavor.id)}
                          disabled={!isSelected && selectedScoops.length >= MAX_SCOOPS}
                          badge={
                            flavor.availabilityType === 'flavor_of_day'
                              ? 'Today'
                              : flavor.availabilityType === 'flavor_of_week'
                                ? 'This Week'
                                : flavor.availabilityType === 'limited_drop'
                                  ? 'Limited'
                                  : undefined
                          }
                        />
                      );
                    })}
                    {items.flavors.length === 0 && (
                      <p className="col-span-full text-center text-sm" style={{ color: '#8C7B6B' }}>
                        No flavors available right now.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Toppings */}
              {currentStep === 3 && (
                <div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {items.toppings.map((topping) => {
                      const isSelected = selectedToppings.includes(topping.id);
                      return (
                        <ItemCard
                          key={topping.id}
                          item={topping}
                          selected={isSelected}
                          onClick={() => toggleTopping(topping.id)}
                          disabled={!isSelected && selectedToppings.length >= MAX_TOPPINGS}
                        />
                      );
                    })}
                    {items.toppings.length === 0 && (
                      <p className="col-span-full text-center text-sm" style={{ color: '#8C7B6B' }}>
                        No toppings available right now.
                      </p>
                    )}
                  </div>
                  {items.toppings.length > 0 && (
                    <p className="mt-4 text-center text-xs" style={{ color: '#8C7B6B' }}>
                      Toppings are optional — skip to continue
                    </p>
                  )}
                </div>
              )}

              {/* Step 4: Sauces */}
              {currentStep === 4 && (
                <div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {items.sauces.map((sauce) => {
                      const isSelected = selectedSauces.includes(sauce.id);
                      return (
                        <ItemCard
                          key={sauce.id}
                          item={sauce}
                          selected={isSelected}
                          onClick={() => toggleSauce(sauce.id)}
                          disabled={!isSelected && selectedSauces.length >= MAX_SAUCES}
                        />
                      );
                    })}
                    {items.sauces.length === 0 && (
                      <p className="col-span-full text-center text-sm" style={{ color: '#8C7B6B' }}>
                        No sauces available right now.
                      </p>
                    )}
                  </div>
                  {items.sauces.length > 0 && (
                    <p className="mt-4 text-center text-xs" style={{ color: '#8C7B6B' }}>
                      Sauces are optional — skip to continue
                    </p>
                  )}
                </div>
              )}

              {/* Step 5: Review & Name */}
              {currentStep === 5 && (
                <div className="flex flex-col gap-6">
                  {/* Summary */}
                  <div
                    className="rounded-2xl p-4"
                    style={{ background: '#FDF8F4', border: '1px solid #E8DDD4' }}
                  >
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: '#6B5D52' }}>
                      Your Creation
                    </h3>
                    <dl className="flex flex-col gap-2 text-sm">
                      <div className="flex justify-between">
                        <dt style={{ color: '#8C7B6B' }}>Vessel</dt>
                        <dd className="font-medium" style={{ color: '#2D2420' }}>
                          {selectedVessel?.name ?? '—'}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt style={{ color: '#8C7B6B' }}>Scoops</dt>
                        <dd className="text-right font-medium" style={{ color: '#2D2420', maxWidth: '60%' }}>
                          {selectedScoops.length === 0
                            ? '—'
                            : selectedScoops
                                .map((s) => items.flavors.find((f) => f.id === s.flavorId)?.name)
                                .filter(Boolean)
                                .join(', ')}
                        </dd>
                      </div>
                      {selectedToppings.length > 0 && (
                        <div className="flex justify-between">
                          <dt style={{ color: '#8C7B6B' }}>Toppings</dt>
                          <dd className="text-right font-medium" style={{ color: '#2D2420', maxWidth: '60%' }}>
                            {selectedToppings
                              .map((id) => items.toppings.find((t) => t.id === id)?.name)
                              .filter(Boolean)
                              .join(', ')}
                          </dd>
                        </div>
                      )}
                      {selectedSauces.length > 0 && (
                        <div className="flex justify-between">
                          <dt style={{ color: '#8C7B6B' }}>Sauces</dt>
                          <dd className="text-right font-medium" style={{ color: '#2D2420', maxWidth: '60%' }}>
                            {selectedSauces
                              .map((id) => items.sauces.find((s) => s.id === id)?.name)
                              .filter(Boolean)
                              .join(', ')}
                          </dd>
                        </div>
                      )}
                      <div
                        className="flex justify-between border-t pt-2"
                        style={{ borderColor: '#E8DDD4' }}
                      >
                        <dt className="font-semibold" style={{ color: '#2D2420' }}>Total</dt>
                        <dd className="text-base font-bold" style={{ color: '#D4536A' }}>
                          {formatPrice(livePrice)}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Name your creation */}
                  <div>
                    <Label
                      htmlFor="creation-name"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-widest"
                      style={{ color: '#6B5D52' }}
                    >
                      Name Your Creation{' '}
                      <span className="normal-case tracking-normal font-normal" style={{ color: '#8C7B6B' }}>
                        (optional)
                      </span>
                    </Label>
                    <Input
                      id="creation-name"
                      value={creationName}
                      onChange={(e) => setCreationName(e.target.value)}
                      placeholder="e.g. The Midnight Meltdown"
                      maxLength={40}
                      className="rounded-xl"
                      style={{
                        borderColor: '#E0D4C9',
                        background: 'white',
                      }}
                    />
                    <p className="mt-1 text-right text-[11px]" style={{ color: '#8C7B6B' }}>
                      {creationName.length}/40
                    </p>
                  </div>

                  {/* Add to cart */}
                  <Button
                    onClick={handleAddToCart}
                    disabled={isSubmitting}
                    className="h-12 gap-2 rounded-xl text-base font-semibold"
                    style={{ background: '#D4536A', color: 'white' }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-5 animate-spin" />
                        Adding to Cart…
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="size-5" />
                        Add to Cart — {formatPrice(livePrice)}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          {currentStep < 5 && (
            <div className="mt-8 flex justify-between">
              <Button
                variant="outline"
                onClick={goBack}
                disabled={currentStep === 1}
                className="gap-1.5 rounded-xl"
              >
                <ChevronLeft className="size-4" />
                Back
              </Button>
              <Button
                onClick={goNext}
                disabled={!canGoNext}
                className="gap-1.5 rounded-xl"
                style={canGoNext ? { background: '#D4536A', color: 'white' } : undefined}
              >
                {currentStep === 4 ? 'Review' : 'Next'}
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
          {currentStep === 5 && (
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={goBack}
                className="gap-1.5 rounded-xl"
              >
                <ChevronLeft className="size-4" />
                Back
              </Button>
            </div>
          )}
        </div>

        {/* Preview panel */}
        <div className="lg:w-64 xl:w-72">
          <div className="sticky top-24">
            <p
              className="mb-2 text-center text-xs font-semibold uppercase tracking-widest"
              style={{ color: '#8C7B6B' }}
            >
              Live Preview
            </p>
            <ScoopPreview
              vessel={selectedVessel}
              scoops={selectedScoops}
              toppings={selectedToppings}
              sauces={selectedSauces}
              allFlavors={items.flavors}
              allToppings={items.toppings}
            />
            {(selectedScoops.length > 0 || selectedToppings.length > 0 || selectedSauces.length > 0) && (
              <div className="mt-3 flex flex-col gap-1">
                <div className="flex items-center justify-between rounded-xl px-3 py-2 text-xs" style={{ background: 'white', border: '1px solid #E8DDD4' }}>
                  <span style={{ color: '#8C7B6B' }}>
                    {selectedScoops.length} scoop{selectedScoops.length !== 1 ? 's' : ''}
                    {selectedToppings.length > 0 && ` · ${selectedToppings.length} topping${selectedToppings.length !== 1 ? 's' : ''}`}
                    {selectedSauces.length > 0 && ` · ${selectedSauces.length} sauce${selectedSauces.length !== 1 ? 's' : ''}`}
                  </span>
                  <span className="font-bold" style={{ color: '#D4536A' }}>
                    {formatPrice(livePrice)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
