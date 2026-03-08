'use client';

import { useState } from 'react';
import type { AdminCustomer } from '@/actions/admin';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const TIER_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  sprinkle: { bg: '#FDE8F0', text: '#9B1D4A', label: 'Sprinkle' },
  swirl: { bg: '#FEF3C7', text: '#92400E', label: 'Swirl' },
  sundae_supreme: { bg: '#EDE9FE', text: '#5B21B6', label: 'Sundae Supreme' },
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function isActive(customer: AdminCustomer): boolean {
  // If they have orders, active status is tracked. We consider them active if they have >0 orders.
  return customer.orderCount > 0;
}

type Props = {
  customers: AdminCustomer[];
};

export function CustomersClient({ customers }: Props) {
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? customers.filter((c) => {
        const term = search.toLowerCase();
        const name = [c.firstName, c.lastName].filter(Boolean).join(' ').toLowerCase();
        return name.includes(term) || c.email.toLowerCase().includes(term);
      })
    : customers;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
          style={{ color: 'var(--foreground-muted)' }}
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="pl-9"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            color: 'var(--foreground)',
          }}
        />
      </div>

      {/* Table */}
      <Card
        className="border overflow-hidden"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        {filtered.length === 0 ? (
          <div className="py-16 text-center" style={{ color: 'var(--foreground-muted)' }}>
            {search ? 'No customers match your search.' : 'No customers yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid var(--border)',
                    backgroundColor: 'var(--muted)',
                  }}
                >
                  {['Customer', 'Joined', 'Orders', 'Total Spent', 'Loyalty Tier', 'Status'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left font-medium whitespace-nowrap"
                        style={{ color: 'var(--foreground-secondary)' }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer) => {
                  const fullName = [customer.firstName, customer.lastName]
                    .filter(Boolean)
                    .join(' ');
                  const tierInfo = customer.loyaltyTier
                    ? TIER_STYLES[customer.loyaltyTier]
                    : null;
                  const active = isActive(customer);
                  const totalSpent = parseFloat(customer.totalSpent ?? '0');

                  return (
                    <tr
                      key={customer.id}
                      className="transition-colors hover:bg-muted/40"
                      style={{ borderBottom: '1px solid var(--border)' }}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium" style={{ color: 'var(--foreground)' }}>
                          {fullName || '(no name)'}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                          {customer.email}
                        </p>
                        {customer.phone && (
                          <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                            {customer.phone}
                          </p>
                        )}
                      </td>
                      <td
                        className="px-4 py-3 text-xs whitespace-nowrap"
                        style={{ color: 'var(--foreground-secondary)' }}
                      >
                        {formatDate(customer.createdAt)}
                      </td>
                      <td
                        className="px-4 py-3 font-medium"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {customer.orderCount}
                      </td>
                      <td
                        className="px-4 py-3 font-medium whitespace-nowrap"
                        style={{ color: 'var(--foreground)' }}
                      >
                        ${totalSpent.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        {tierInfo ? (
                          <span
                            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                            style={{ backgroundColor: tierInfo.bg, color: tierInfo.text }}
                          >
                            {tierInfo.label}
                          </span>
                        ) : (
                          <span
                            className="text-xs"
                            style={{ color: 'var(--foreground-muted)' }}
                          >
                            No account
                          </span>
                        )}
                        {customer.loyaltyPoints != null && (
                          <p className="text-xs mt-0.5" style={{ color: 'var(--foreground-muted)' }}>
                            {customer.loyaltyPoints} pts
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={
                            active
                              ? { backgroundColor: '#DCFCE7', color: '#166534' }
                              : { backgroundColor: 'var(--muted)', color: 'var(--foreground-muted)' }
                          }
                        >
                          {active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
