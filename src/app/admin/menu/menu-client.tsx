'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability,
} from '@/actions/admin';
import type { AdminMenuItem, MenuItemCategory } from '@/actions/admin';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

const CATEGORIES: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'flavor', label: 'Flavors' },
  { value: 'topping', label: 'Toppings' },
  { value: 'sauce', label: 'Sauces' },
  { value: 'vessel', label: 'Vessels' },
  { value: 'extra', label: 'Extras' },
];

const CATEGORY_COLORS: Record<MenuItemCategory, { bg: string; text: string }> = {
  flavor: { bg: '#FDE8F0', text: '#9B1D4A' },
  topping: { bg: '#FEF3C7', text: '#92400E' },
  sauce: { bg: '#DBEAFE', text: '#1E40AF' },
  vessel: { bg: '#D1FAE5', text: '#065F46' },
  extra: { bg: '#EDE9FE', text: '#5B21B6' },
};

type ItemFormData = {
  name: string;
  description: string;
  price: string;
  category: MenuItemCategory;
  stockCount: string;
  stockTrackingEnabled: boolean;
  sortOrder: string;
};

const EMPTY_FORM: ItemFormData = {
  name: '',
  description: '',
  price: '',
  category: 'flavor',
  stockCount: '',
  stockTrackingEnabled: false,
  sortOrder: '0',
};

function itemToForm(item: AdminMenuItem): ItemFormData {
  return {
    name: item.name,
    description: item.description ?? '',
    price: item.price,
    category: item.category,
    stockCount: item.stockCount != null ? String(item.stockCount) : '',
    stockTrackingEnabled: item.stockTrackingEnabled,
    sortOrder: String(item.sortOrder),
  };
}

function MenuItemForm({
  form,
  onChange,
}: {
  form: ItemFormData;
  onChange: (updated: ItemFormData) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label style={{ color: 'var(--foreground-secondary)' }}>Name</Label>
        <Input
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
          placeholder="e.g. Chocolate Fudge"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
        />
      </div>

      <div className="space-y-1.5">
        <Label style={{ color: 'var(--foreground-secondary)' }}>Description</Label>
        <Input
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
          placeholder="Optional description"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label style={{ color: 'var(--foreground-secondary)' }}>Price ($)</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => onChange({ ...form, price: e.target.value })}
            placeholder="0.00"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
        </div>

        <div className="space-y-1.5">
          <Label style={{ color: 'var(--foreground-secondary)' }}>Category</Label>
          <Select
            value={form.category}
            onValueChange={(v) => onChange({ ...form, category: v as MenuItemCategory })}
          >
            <SelectTrigger style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.filter((c) => c.value !== 'all').map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label style={{ color: 'var(--foreground-secondary)' }}>Stock Count</Label>
          <Input
            type="number"
            min="0"
            value={form.stockCount}
            onChange={(e) => onChange({ ...form, stockCount: e.target.value })}
            placeholder="Leave blank for unlimited"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
        </div>

        <div className="space-y-1.5">
          <Label style={{ color: 'var(--foreground-secondary)' }}>Display Order</Label>
          <Input
            type="number"
            min="0"
            value={form.sortOrder}
            onChange={(e) => onChange({ ...form, sortOrder: e.target.value })}
            placeholder="0"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.stockTrackingEnabled}
          onChange={(e) => onChange({ ...form, stockTrackingEnabled: e.target.checked })}
          className="rounded"
        />
        <span className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
          Enable stock tracking
        </span>
      </label>
    </div>
  );
}

type Props = {
  items: AdminMenuItem[];
  initialCategory: string;
};

export function MenuItemsClient({ items, initialCategory }: Props) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<AdminMenuItem | null>(null);
  const [deleteItem, setDeleteItemState] = useState<AdminMenuItem | null>(null);
  const [addForm, setAddForm] = useState<ItemFormData>(EMPTY_FORM);
  const [editForm, setEditForm] = useState<ItemFormData>(EMPTY_FORM);
  const [isPending, startTransition] = useTransition();

  function handleCategoryChange(cat: string) {
    setActiveCategory(cat);
    const params = new URLSearchParams();
    if (cat !== 'all') params.set('category', cat);
    router.push(`/admin/menu?${params.toString()}`);
  }

  function openEdit(item: AdminMenuItem) {
    setEditItem(item);
    setEditForm(itemToForm(item));
  }

  function handleAdd() {
    if (!addForm.name.trim() || !addForm.price) {
      toast.error('Name and price are required');
      return;
    }
    startTransition(async () => {
      try {
        await createMenuItem({
          name: addForm.name.trim(),
          description: addForm.description.trim() || undefined,
          price: parseFloat(addForm.price).toFixed(2),
          category: addForm.category,
          stockCount: addForm.stockCount ? parseInt(addForm.stockCount) : null,
          stockTrackingEnabled: addForm.stockTrackingEnabled,
          sortOrder: parseInt(addForm.sortOrder) || 0,
        });
        toast.success('Menu item created');
        setAddOpen(false);
        setAddForm(EMPTY_FORM);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to create item');
      }
    });
  }

  function handleEdit() {
    if (!editItem || !editForm.name.trim() || !editForm.price) {
      toast.error('Name and price are required');
      return;
    }
    startTransition(async () => {
      try {
        await updateMenuItem(editItem.id, {
          name: editForm.name.trim(),
          description: editForm.description.trim() || null,
          price: parseFloat(editForm.price).toFixed(2),
          category: editForm.category,
          stockCount: editForm.stockCount ? parseInt(editForm.stockCount) : null,
          stockTrackingEnabled: editForm.stockTrackingEnabled,
          sortOrder: parseInt(editForm.sortOrder) || 0,
        });
        toast.success('Menu item updated');
        setEditItem(null);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to update item');
      }
    });
  }

  function handleDelete() {
    if (!deleteItem) return;
    startTransition(async () => {
      try {
        await deleteMenuItem(deleteItem.id);
        toast.success(`"${deleteItem.name}" deleted`);
        setDeleteItemState(null);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to delete item');
      }
    });
  }

  function handleToggle(item: AdminMenuItem) {
    startTransition(async () => {
      try {
        await toggleMenuItemAvailability(item.id);
        toast.success(`"${item.name}" ${item.isAvailable ? 'hidden' : 'made available'}`);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to toggle availability');
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <Tabs value={activeCategory} onValueChange={handleCategoryChange}>
          <TabsList className="flex flex-wrap h-auto gap-1">
            {CATEGORIES.map((c) => (
              <TabsTrigger key={c.value} value={c.value} className="text-xs">
                {c.label}
                {c.value !== 'all' && (
                  <span className="ml-1 text-xs opacity-60">
                    ({items.filter((i) => i.category === c.value).length})
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Button
          onClick={() => { setAddForm(EMPTY_FORM); setAddOpen(true); }}
          className="shrink-0 inline-flex items-center gap-2"
          style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Table */}
      <Card
        className="border overflow-hidden"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        {items.length === 0 ? (
          <div className="py-16 text-center" style={{ color: 'var(--foreground-muted)' }}>
            No items found for this category.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--muted)' }}>
                  {['Name', 'Category', 'Price', 'Stock', 'Available', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left font-medium whitespace-nowrap"
                      style={{ color: 'var(--foreground-secondary)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const catStyle = CATEGORY_COLORS[item.category];
                  return (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-muted/40"
                      style={{ borderBottom: '1px solid var(--border)' }}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium" style={{ color: 'var(--foreground)' }}>
                          {item.name}
                        </p>
                        {item.description && (
                          <p className="text-xs truncate max-w-[200px]" style={{ color: 'var(--foreground-muted)' }}>
                            {item.description}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize"
                          style={{ backgroundColor: catStyle.bg, color: catStyle.text }}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium whitespace-nowrap" style={{ color: 'var(--foreground)' }}>
                        ${parseFloat(item.price).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--foreground-secondary)' }}>
                        {item.stockCount != null ? `${item.stockCount} left` : 'Unlimited'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggle(item)}
                          disabled={isPending}
                          className="flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
                          style={{ color: item.isAvailable ? '#166534' : '#991B1B' }}
                        >
                          {item.isAvailable ? (
                            <ToggleRight className="h-5 w-5" />
                          ) : (
                            <ToggleLeft className="h-5 w-5" />
                          )}
                          {item.isAvailable ? 'Available' : 'Hidden'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(item)}
                            className="p-1.5 rounded-lg transition-colors hover:bg-muted"
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" style={{ color: 'var(--foreground-secondary)' }} />
                          </button>
                          <button
                            onClick={() => setDeleteItemState(item)}
                            className="p-1.5 rounded-lg transition-colors hover:bg-muted"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" style={{ color: '#DC2626' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={(v) => !v && setAddOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--foreground)' }}>Add Menu Item</DialogTitle>
          </DialogHeader>
          <MenuItemForm form={addForm} onChange={setAddForm} />
          <div className="flex justify-end gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setAddOpen(false)}
              style={{ borderColor: 'var(--border)', color: 'var(--foreground-secondary)' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={isPending}
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              {isPending ? 'Saving...' : 'Create Item'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={(v) => !v && setEditItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--foreground)' }}>Edit Menu Item</DialogTitle>
          </DialogHeader>
          <MenuItemForm form={editForm} onChange={setEditForm} />
          <div className="flex justify-end gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setEditItem(null)}
              style={{ borderColor: 'var(--border)', color: 'var(--foreground-secondary)' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={isPending}
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteItem} onOpenChange={(v) => !v && setDeleteItemState(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--foreground)' }}>Delete Item</DialogTitle>
          </DialogHeader>
          <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
            Are you sure you want to delete{' '}
            <strong style={{ color: 'var(--foreground)' }}>{deleteItem?.name}</strong>? This
            action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteItemState(null)}
              style={{ borderColor: 'var(--border)', color: 'var(--foreground-secondary)' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isPending}
              style={{ backgroundColor: '#DC2626', color: '#fff' }}
            >
              {isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
