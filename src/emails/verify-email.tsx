import type { ReactElement } from 'react';

interface VerifyEmailProps {
  verifyUrl: string;
  email: string;
}

export function VerifyEmailTemplate({ verifyUrl, email }: VerifyEmailProps): ReactElement {
  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ color: '#D4536A' }}>Verify your ScoopCraft account</h1>
      <p>Thanks for signing up! Click the button below to verify your email address ({email}).</p>
      <a
        href={verifyUrl}
        style={{
          display: 'inline-block',
          backgroundColor: '#D4536A',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: 'bold',
          marginTop: '16px',
        }}
      >
        Verify Email
      </a>
      <p style={{ marginTop: '24px', color: '#888', fontSize: '14px' }}>
        If you didn&apos;t sign up for ScoopCraft, you can safely ignore this email.
      </p>
    </div>
  );
}
