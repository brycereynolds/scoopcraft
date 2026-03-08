export const dynamic = 'force-dynamic';

import { getCustomers } from '@/actions/admin';
import { CustomersClient } from './customers-client';

export default async function AdminCustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
          Customers
        </h1>
        <span
          className="inline-flex items-center rounded-full px-2.5 py-1 text-sm font-medium"
          style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground-secondary)' }}
        >
          {customers.length}
        </span>
      </div>
      <p className="mt-1 text-sm" style={{ color: 'var(--foreground-muted)' }}>
        Browse and manage your customer accounts.
      </p>

      <CustomersClient customers={customers} />
    </div>
  );
}
