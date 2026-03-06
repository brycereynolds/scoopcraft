export const dynamic = 'force-dynamic';
import { getScoopLabItems } from '@/actions/scoop-lab';
import { ScoopLabBuilder } from './scoop-lab-builder';
import { Wand2 } from 'lucide-react';

export const metadata = {
  title: 'The Scoop Lab | ScoopCraft',
  description: 'Build your perfect custom ice cream creation, scoop by scoop.',
};

export default async function ScoopLabPage() {
  const items = await getScoopLabItems();

  return (
    <div
      className="min-h-screen px-4 py-8 md:px-6 md:py-12"
      style={{ background: 'linear-gradient(180deg, #FDF8F4, #FFF0F3)' }}
    >
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <Wand2 className="size-6 text-[#D4536A]" />
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: '#D4536A' }}
            >
              Custom Creation
            </span>
          </div>
          <h1
            className="mb-3 text-4xl md:text-5xl"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: '#2D2420' }}
          >
            The Scoop Lab
          </h1>
          <p className="mx-auto max-w-md text-base" style={{ color: '#6B5D52' }}>
            Build your perfect ice cream creation — vessel, scoops, toppings, sauces — exactly the way you want it.
          </p>
        </div>

        <ScoopLabBuilder items={items} />
      </div>
    </div>
  );
}
