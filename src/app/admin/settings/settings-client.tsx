'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Store, Bell, Package, Shield } from 'lucide-react';

// ─── Store Info Section ────────────────────────────────────────────────────────

function StoreInfoSection() {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    storeName: 'ScoopCraft',
    supportEmail: 'hello@scoopcraft.com',
    phone: '',
    address: '',
  });

  function handleSave() {
    startTransition(async () => {
      // Placeholder: In a full implementation this would persist to a settings table
      await new Promise((r) => setTimeout(r, 400));
      toast.success('Store info saved');
    });
  }

  return (
    <Card
      className="border"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#FDE8F0' }}
          >
            <Store className="h-4 w-4" style={{ color: '#9B1D4A' }} />
          </div>
          <CardTitle className="text-base" style={{ color: 'var(--foreground)' }}>
            Store Info
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label style={{ color: 'var(--foreground-secondary)' }}>Store Name</Label>
            <Input
              value={form.storeName}
              onChange={(e) => setForm({ ...form, storeName: e.target.value })}
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label style={{ color: 'var(--foreground-secondary)' }}>Support Email</Label>
            <Input
              type="email"
              value={form.supportEmail}
              onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label style={{ color: 'var(--foreground-secondary)' }}>Phone</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label style={{ color: 'var(--foreground-secondary)' }}>Address</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="123 Ice Cream Lane"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              }}
            />
          </div>
        </div>
        <div className="flex justify-end pt-1">
          <Button
            onClick={handleSave}
            disabled={isPending}
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            {isPending ? 'Saving...' : 'Save Store Info'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Notification Settings ─────────────────────────────────────────────────────

function NotificationSection() {
  const [settings, setSettings] = useState({
    newOrderEmail: true,
    lowStockAlert: true,
    dailySummary: false,
    reviewNotifications: true,
  });

  const toggles: { key: keyof typeof settings; label: string; description: string }[] = [
    {
      key: 'newOrderEmail',
      label: 'New Order Emails',
      description: 'Receive an email for each new order placed',
    },
    {
      key: 'lowStockAlert',
      label: 'Low Stock Alerts',
      description: 'Alert when a menu item stock drops to 5 or below',
    },
    {
      key: 'dailySummary',
      label: 'Daily Summary',
      description: 'Receive a daily summary of orders and revenue',
    },
    {
      key: 'reviewNotifications',
      label: 'Review Notifications',
      description: 'Alert when customers submit new reviews',
    },
  ];

  function handleToggle(key: keyof typeof settings) {
    setSettings((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      toast.success('Notification preference updated');
      return updated;
    });
  }

  return (
    <Card
      className="border"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#DBEAFE' }}
          >
            <Bell className="h-4 w-4" style={{ color: '#1E40AF' }} />
          </div>
          <CardTitle className="text-base" style={{ color: 'var(--foreground)' }}>
            Notifications
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {toggles.map((toggle) => (
          <label
            key={toggle.key}
            className="flex items-center justify-between rounded-xl px-3 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                {toggle.label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--foreground-muted)' }}>
                {toggle.description}
              </p>
            </div>
            <div
              onClick={() => handleToggle(toggle.key)}
              className="relative h-5 w-9 rounded-full cursor-pointer transition-colors shrink-0"
              style={{
                backgroundColor: settings[toggle.key] ? 'var(--primary)' : 'var(--border)',
              }}
            >
              <span
                className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform"
                style={{
                  transform: settings[toggle.key] ? 'translateX(1.125rem)' : 'translateX(0.125rem)',
                }}
              />
            </div>
          </label>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Order Settings ─────────────────────────────────────────────────────────────

function OrderSettingsSection() {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    orderPrefix: 'SC',
    maxOrdersPerSlot: '20',
    minOrderAmount: '5.00',
    pickupLeadMinutes: '15',
  });

  function handleSave() {
    startTransition(async () => {
      await new Promise((r) => setTimeout(r, 400));
      toast.success('Order settings saved');
    });
  }

  return (
    <Card
      className="border"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#D1FAE5' }}
          >
            <Package className="h-4 w-4" style={{ color: '#065F46' }} />
          </div>
          <CardTitle className="text-base" style={{ color: 'var(--foreground)' }}>
            Order Settings
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label style={{ color: 'var(--foreground-secondary)' }}>Order ID Prefix</Label>
            <Input
              value={form.orderPrefix}
              onChange={(e) => setForm({ ...form, orderPrefix: e.target.value })}
              maxLength={4}
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label style={{ color: 'var(--foreground-secondary)' }}>Max Orders per Slot</Label>
            <Input
              type="number"
              min="1"
              value={form.maxOrdersPerSlot}
              onChange={(e) => setForm({ ...form, maxOrdersPerSlot: e.target.value })}
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label style={{ color: 'var(--foreground-secondary)' }}>Min Order Amount ($)</Label>
            <Input
              type="number"
              step="0.50"
              min="0"
              value={form.minOrderAmount}
              onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label style={{ color: 'var(--foreground-secondary)' }}>Pickup Lead Time (min)</Label>
            <Input
              type="number"
              min="5"
              step="5"
              value={form.pickupLeadMinutes}
              onChange={(e) => setForm({ ...form, pickupLeadMinutes: e.target.value })}
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              }}
            />
          </div>
        </div>
        <div className="flex justify-end pt-1">
          <Button
            onClick={handleSave}
            disabled={isPending}
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            {isPending ? 'Saving...' : 'Save Order Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Security Section ─────────────────────────────────────────────────────────────

function SecuritySection() {
  const [settings, setSettings] = useState({
    requireEmailVerification: true,
    allowGuestCheckout: false,
    maxLoginAttempts: '5',
  });

  function handleToggle(key: 'requireEmailVerification' | 'allowGuestCheckout') {
    setSettings((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      toast.success('Security setting updated');
      return updated;
    });
  }

  return (
    <Card
      className="border"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#EDE9FE' }}
          >
            <Shield className="h-4 w-4" style={{ color: '#5B21B6' }} />
          </div>
          <CardTitle className="text-base" style={{ color: 'var(--foreground)' }}>
            Security
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {[
          {
            key: 'requireEmailVerification' as const,
            label: 'Require Email Verification',
            description: 'Users must verify their email before placing orders',
          },
          {
            key: 'allowGuestCheckout' as const,
            label: 'Allow Guest Checkout',
            description: 'Allow orders without creating an account',
          },
        ].map((toggle) => (
          <label
            key={toggle.key}
            className="flex items-center justify-between rounded-xl px-3 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                {toggle.label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--foreground-muted)' }}>
                {toggle.description}
              </p>
            </div>
            <div
              onClick={() => handleToggle(toggle.key)}
              className="relative h-5 w-9 rounded-full cursor-pointer transition-colors shrink-0"
              style={{
                backgroundColor: settings[toggle.key] ? 'var(--primary)' : 'var(--border)',
              }}
            >
              <span
                className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform"
                style={{
                  transform: settings[toggle.key]
                    ? 'translateX(1.125rem)'
                    : 'translateX(0.125rem)',
                }}
              />
            </div>
          </label>
        ))}

        <div className="space-y-1.5 px-3">
          <Label style={{ color: 'var(--foreground-secondary)' }}>
            Max Login Attempts Before Lockout
          </Label>
          <Input
            type="number"
            min="3"
            max="20"
            value={settings.maxLoginAttempts}
            onChange={(e) => setSettings({ ...settings, maxLoginAttempts: e.target.value })}
            className="max-w-[120px]"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function SettingsClient() {
  return (
    <div className="space-y-6 max-w-3xl">
      <StoreInfoSection />
      <NotificationSection />
      <OrderSettingsSection />
      <SecuritySection />
    </div>
  );
}
