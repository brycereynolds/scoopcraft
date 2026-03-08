import type { ReactElement } from 'react';

interface OrderConfirmationProps {
  orderId: number;
  orderUrl: string;
}

export function OrderConfirmationTemplate({ orderId, orderUrl }: OrderConfirmationProps): ReactElement {
  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ color: '#D4536A' }}>Your ScoopCraft order is confirmed! 🍦</h1>
      <p>
        Thank you for your order! Your order #{orderId} has been confirmed and is being prepared with care.
      </p>
      <a
        href={orderUrl}
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
        View Order
      </a>
      <p style={{ marginTop: '24px', color: '#888', fontSize: '14px' }}>
        We&apos;ll notify you when your order is on its way. Thank you for choosing ScoopCraft!
      </p>
    </div>
  );
}
