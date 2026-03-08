import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getDashboardStats } from '@/actions/admin';
import {
  LayoutDashboard,
  PackageOpen,
  ClipboardList,
  IceCream,
  Users,
  Menu,
  Tag,
  UserCog,
  Settings,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/orders/queue', label: 'Order Queue', icon: PackageOpen, badge: 'queue' },
  { href: '/admin/orders', label: 'All Orders', icon: ClipboardList },
  { href: '/admin/menu', label: 'Menu Items', icon: IceCream },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/users', label: 'Users', icon: UserCog },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

function SidebarContent({ pendingCount }: { pendingCount: number }) {
  return (
    <nav className="flex flex-col gap-1 p-4">
      <div className="mb-4 px-2">
        <h2
          className="text-lg font-semibold"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: 'var(--primary)' }}
        >
          ScoopCraft Admin
        </h2>
        <p className="text-xs mt-0.5" style={{ color: 'var(--foreground-muted)' }}>
          Management Dashboard
        </p>
      </div>

      <div className="h-px mb-2" style={{ backgroundColor: 'var(--border)' }} />

      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
          style={{ color: 'var(--foreground-secondary)' }}
        >
          <span className="flex items-center gap-3">
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </span>
          {item.badge === 'queue' && pendingCount > 0 && (
            <Badge
              className="text-xs px-1.5 py-0.5 min-w-[1.25rem] text-center"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              {pendingCount}
            </Badge>
          )}
        </Link>
      ))}
    </nav>
  );
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  if (session.user.role !== 'admin') {
    redirect('/');
  }

  const stats = await getDashboardStats();
  const pendingCount = stats.pendingOrdersCount;

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--background)' }}>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex w-60 shrink-0 flex-col border-r self-stretch sticky top-0 h-screen overflow-y-auto"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <SidebarContent pendingCount={pendingCount} />
      </aside>

      {/* Mobile header */}
      <div className="flex flex-col flex-1 min-w-0">
        <header
          className="md:hidden flex items-center gap-3 border-b px-4 py-3 sticky top-0 z-10"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <Sheet>
            <SheetTrigger
              className="inline-flex items-center justify-center rounded-lg p-2 text-sm transition-colors hover:bg-muted shrink-0"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" style={{ color: 'var(--foreground-secondary)' }} />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-60">
              <SidebarContent pendingCount={pendingCount} />
            </SheetContent>
          </Sheet>
          <span
            className="font-semibold text-sm"
            style={{ color: 'var(--primary)', fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            ScoopCraft Admin
          </span>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
