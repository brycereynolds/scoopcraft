import { getAdminOrderQueue } from '@/actions/admin';
import { OrderQueueClient } from './order-queue-client';

export const dynamic = 'force-dynamic';

export default async function AdminOrderQueuePage() {
  const orders = await getAdminOrderQueue();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
          Order Queue
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--foreground-muted)' }}>
          Active orders requiring action — pending, confirmed, and in preparation.
        </p>
      </div>

      <OrderQueueClient initialOrders={orders} />
    </div>
  );
}
