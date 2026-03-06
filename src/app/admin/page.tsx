export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { getDashboardStats, getAllOrders } from '@/actions/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ShoppingBag,
  DollarSign,
  Users,
  Clock,
  PackageOpen,
  UtensilsCrossed,
} from 'lucide-react';
import type { OrderStatus } from '@/types';

function statusColor(status: OrderStatus): { bg: string; text: string } {
  switch (status) {
    case 'pending':
      return { bg: '#FEF9C3', text: '#854D0E' };
    case 'confirmed':
      return { bg: '#DBEAFE', text: '#1E40AF' };
    case 'preparing':
      return { bg: '#FFEDD5', text: '#9A3412' };
    case 'ready':
      return { bg: '#F3E8FF', text: '#6B21A8' };
    case 'out_for_delivery':
      return { bg: '#E0E7FF', text: '#3730A3' };
    case 'delivered':
      return { bg: '#DCFCE7', text: '#166534' };
    case 'cancelled':
      return { bg: '#FEE2E2', text: '#991B1B' };
    default:
      return { bg: 'var(--muted)', text: 'var(--foreground-secondary)' };
  }
}

export default async function AdminDashboardPage() {
  const [stats, recentOrders] = await Promise.all([
    getDashboardStats(),
    getAllOrders(),
  ]);

  const last10 = recentOrders.slice(0, 10);

  const statCards = [
    {
      label: "Today's Orders",
      value: stats.totalOrdersToday.toString(),
      icon: ShoppingBag,
      color: 'var(--primary)',
    },
    {
      label: "Today's Revenue",
      value: `$${stats.revenueToday.toFixed(2)}`,
      icon: DollarSign,
      color: 'var(--accent)',
    },
    {
      label: 'Active Subscribers',
      value: stats.activeSubscribersCount.toString(),
      icon: Users,
      color: 'var(--secondary)',
    },
    {
      label: 'Pending Orders',
      value: stats.pendingOrdersCount.toString(),
      icon: Clock,
      color: stats.pendingOrdersCount > 0 ? '#D97706' : 'var(--foreground-muted)',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
          Dashboard
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--foreground-muted)' }}>
          Welcome back. Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card
            key={card.label}
            className="border"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: 'var(--foreground-secondary)' }}>
                {card.label}
              </CardTitle>
              <card.icon className="h-4 w-4 shrink-0" style={{ color: card.color }} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                {card.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/orders/queue"
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          <PackageOpen className="h-4 w-4" />
          View Order Queue
        </Link>
        <Link
          href="/admin/menu"
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
          style={{ borderColor: 'var(--border)', color: 'var(--foreground-secondary)' }}
        >
          <UtensilsCrossed className="h-4 w-4" />
          Manage Menu
        </Link>
      </div>

      {/* Recent orders */}
      <div>
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
          Recent Orders
        </h2>
        <Card
          className="border overflow-hidden"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          {last10.length === 0 ? (
            <div className="py-12 text-center" style={{ color: 'var(--foreground-muted)' }}>
              No orders yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--muted)' }}>
                    {['ID', 'Customer', 'Items', 'Total', 'Status', 'Time'].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left font-medium"
                        style={{ color: 'var(--foreground-secondary)' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {last10.map((order) => {
                    const colors = statusColor(order.status);
                    const timeAgo = formatTimeAgo(order.createdAt);
                    return (
                      <tr
                        key={order.id}
                        className="transition-colors hover:bg-muted/40"
                        style={{ borderBottom: '1px solid var(--border)' }}
                      >
                        <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--foreground-muted)' }}>
                          #{order.id}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium" style={{ color: 'var(--foreground)' }}>
                            {order.customerName}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                            {order.customerEmail}
                          </p>
                        </td>
                        <td className="px-4 py-3" style={{ color: 'var(--foreground-secondary)' }}>
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </td>
                        <td className="px-4 py-3 font-medium" style={{ color: 'var(--foreground)' }}>
                          ${parseFloat(order.total).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize"
                            style={{ backgroundColor: colors.bg, color: colors.text }}
                          >
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--foreground-muted)' }}>
                          {timeAgo}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {recentOrders.length > 10 && (
          <div className="mt-3 text-center">
            <Link
              href="/admin/orders"
              className="text-sm font-medium"
              style={{ color: 'var(--primary)' }}
            >
              View all {recentOrders.length} orders
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
