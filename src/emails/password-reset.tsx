import type { ReactElement } from 'react';

interface PasswordResetProps {
  resetUrl: string;
  email: string;
}

export function PasswordResetTemplate({ resetUrl, email }: PasswordResetProps): ReactElement {
  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ color: '#D4536A' }}>Reset your ScoopCraft password</h1>
      <p>We received a request to reset the password for your account ({email}).</p>
      <a
        href={resetUrl}
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
        Reset Password
      </a>
      <p style={{ marginTop: '24px', color: '#888', fontSize: '14px' }}>
        This link expires in 1 hour. If you didn&apos;t request a password reset, you can safely ignore this email.
      </p>
    </div>
  );
}
