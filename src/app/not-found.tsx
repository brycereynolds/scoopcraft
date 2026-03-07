import Link from 'next/link';

export default function NotFound() {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: '2rem',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FDF8F4',
          fontFamily: "'DM Sans', sans-serif",
          textAlign: 'center',
        }}
      >
        {/* Ice cream SVG decoration */}
        <svg
          width="80"
          height="100"
          viewBox="0 0 80 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          style={{ marginBottom: '1.5rem', opacity: 0.9 }}
        >
          {/* Cone */}
          <polygon points="40,98 10,46 70,46" fill="#C4883D" opacity="0.9" />
          <line x1="40" y1="98" x2="25" y2="46" stroke="#a06b28" strokeWidth="1" opacity="0.5" />
          <line x1="40" y1="98" x2="55" y2="46" stroke="#a06b28" strokeWidth="1" opacity="0.5" />
          {/* Scoop 1 (bottom) */}
          <circle cx="40" cy="38" r="18" fill="#D4536A" />
          {/* Scoop 2 (top) */}
          <circle cx="40" cy="18" r="14" fill="#7DBBA2" />
          {/* Highlight */}
          <circle cx="34" cy="13" r="3" fill="white" opacity="0.4" />
        </svg>

        {/* 404 */}
        <p
          style={{
            fontSize: '7rem',
            fontWeight: 700,
            lineHeight: 1,
            margin: '0 0 0.5rem',
            fontFamily: "'DM Serif Display', serif",
            color: '#D4536A',
            letterSpacing: '-0.03em',
          }}
        >
          404
        </p>

        {/* Tagline */}
        <h1
          style={{
            fontSize: '1.75rem',
            fontFamily: "'DM Serif Display', serif",
            color: '#2D2420',
            margin: '0 0 1rem',
          }}
        >
          Looks like this scoop melted away&hellip;
        </h1>

        <p
          style={{
            fontSize: '1rem',
            color: '#6B5D52',
            maxWidth: '360px',
            lineHeight: 1.6,
            margin: '0 0 2.5rem',
          }}
        >
          The page you&rsquo;re looking for doesn&rsquo;t exist. It may have moved or been removed.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              backgroundColor: '#D4536A',
              color: '#FFF5F6',
              borderRadius: '9999px',
              padding: '0.75rem 1.75rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Go Home
          </Link>
          <Link
            href="/menu"
            style={{
              display: 'inline-block',
              backgroundColor: 'transparent',
              color: '#D4536A',
              border: '2px solid #D4536A',
              borderRadius: '9999px',
              padding: '0.75rem 1.75rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Browse Menu
          </Link>
        </div>

        {/* Subtle brand mark */}
        <p
          style={{
            marginTop: '3rem',
            fontSize: '0.75rem',
            color: '#6B5D52',
            opacity: 0.6,
            fontFamily: "'DM Serif Display', serif",
          }}
        >
          ScoopCraft &mdash; Handcrafted Happiness
        </p>
      </body>
    </html>
  );
}
