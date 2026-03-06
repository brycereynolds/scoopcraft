import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#FFF5F6] to-white px-4">
      <div className="text-center">
        <h1
          className="text-6xl font-bold text-[#D4536A] sm:text-7xl"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          ScoopCraft
        </h1>
        <p className="mt-4 text-xl text-[#C4883D]">
          Handcrafted happiness, delivered to your door.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="h-1 w-8 rounded-full bg-[#D4536A]" />
          <p className="text-sm font-medium uppercase tracking-widest text-gray-400">
            Coming Soon
          </p>
          <div className="h-1 w-8 rounded-full bg-[#D4536A]" />
        </div>
        <p className="mt-6 max-w-md text-gray-500">
          Custom ice cream creations, loyalty rewards, seasonal drops, and
          delivery straight to your door. The sweetest experience is almost here.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-[#D4536A] px-8 text-sm font-medium text-white transition-colors hover:bg-[#C4455C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4536A]"
        >
          Early Access
        </Link>
        <div className="mt-12 flex items-center justify-center gap-6">
          <div className="flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D4536A]/10">
              <svg className="h-6 w-6 text-[#D4536A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="mt-2 text-xs text-gray-500">Custom Builds</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C4883D]/10">
              <svg className="h-6 w-6 text-[#C4883D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <span className="mt-2 text-xs text-gray-500">Rewards</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7DBBA2]/10">
              <svg className="h-6 w-6 text-[#7DBBA2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="mt-2 text-xs text-gray-500">Fast Delivery</span>
          </div>
        </div>
      </div>
    </main>
  )
}
