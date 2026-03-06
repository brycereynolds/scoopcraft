import { getAllOrders } from '@/actions/admin';
import { OrdersTableClient } from './orders-client';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{ status?: string; date?: string }>;
};

export default async function AdminAllOrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const statusFilter = params.status ?? 'all';
  const dateFilter = params.date ?? '';

  const orders = await getAllOrders({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    date: dateFilter || undefined,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
          All Orders
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--foreground-muted)' }}>
          Browse, filter, and manage every order.
        </p>
      </div>

      <OrdersTableClient
        orders={orders}
        initialStatus={statusFilter}
        initialDate={dateFilter}
      />
    </div>
  );
}
