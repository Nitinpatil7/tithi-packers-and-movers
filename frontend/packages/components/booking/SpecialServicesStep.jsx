'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Check, Sparkles } from 'lucide-react';
import Spinner from '@ui/Spinner';
import { useAvailableAddons } from '@hooks/useAddons';
import BookingActionBar from './BookingActionBar';

const SERVICE_TYPES = { local: 'local_shifting', intercity: 'intercity_moving', local_shifting: 'local_shifting', intercity_moving: 'intercity_moving' };
const formatAddonPrice = (addon) => `₹${Number(addon.price || 0).toLocaleString('en-IN')}`;
const selectedItemId = (item) => String(item.itemId || item._id || item.id || '');
const selectedGroupId = (item) => String(item.groupId || item.group?._id || item.group?.id || '');
const selectedCategoryId = (item) => String(item.sectionId || item.categoryId || item.category?._id || item.category?.id || '');

function AddonIcon({ icon }) {
  return icon ? (
    <Image
      src={icon}
      alt=""
      width={56}
      height={56}
      className="h-12 w-12 rounded-lg object-cover dark:drop-shadow-[0_10px_18px_rgba(0,0,0,0.32)]"
    />
  ) : null;
}

export default function SpecialServicesStep({ onSubmit, onBack, initialData = {}, serviceType }) {
  const selectedItems = initialData.items || [];
  const selectedItemQuantityKey = selectedItems.map((item) => `${item.itemId || item._id || item.name}:${item.groupId || ''}:${item.quantity || 0}`).join('|');
  const itemIds = [...new Set(selectedItems.map((item) => item.itemId).filter(Boolean))];
  const groupIds = [...new Set(selectedItems.map((item) => item.groupId).filter(Boolean))];
  const categoryIds = [...new Set(selectedItems.map((item) => item.sectionId || item.categoryId).filter(Boolean))];
  const apiServiceType = SERVICE_TYPES[serviceType] || serviceType;
  const { data = [], isLoading, isError, refetch } = useAvailableAddons({ serviceType: apiServiceType, ...(itemIds.length ? { itemIds } : {}), ...(groupIds.length ? { groupIds } : {}), ...(categoryIds.length ? { categoryIds } : {}) });
  const addons = useMemo(() => Array.isArray(data) ? data : [], [data]);
  const [selected, setSelected] = useState(initialData.specialServices || []);

  const findSelectedIndex = (addon) => selected.findIndex((item) => item.addonId === addon._id || item.key === addon.key || item.name === addon.name);
  const isSelected = (addon) => findSelectedIndex(addon) >= 0;
  const addonGroupIds = (addon) => {
    const matched = Array.isArray(addon.matchedTriggerGroupIds) ? addon.matchedTriggerGroupIds : [];
    if (matched.length) return matched.filter(Boolean).map(String);
    return (addon.triggerGroupIds || []).map((group) => group?._id || group?.id || group).filter(Boolean).map(String);
  };
  const addonItemIds = (addon) => {
    const matched = Array.isArray(addon.matchedTriggerItemIds) ? addon.matchedTriggerItemIds : [];
    if (matched.length) return matched.filter(Boolean).map(String);
    return (addon.triggerItemIds || []).map((item) => item?._id || item?.id || item).filter(Boolean).map(String);
  };
  const addonCategoryIds = (addon) => {
    const matched = Array.isArray(addon.matchedTriggerCategoryIds) ? addon.matchedTriggerCategoryIds : [];
    if (matched.length) return matched.filter(Boolean).map(String);
    return (addon.triggerCategoryIds || []).map((category) => category?._id || category?.id || category).filter(Boolean).map(String);
  };
  const matchedItemsForAddon = (addon) => {
    const triggerItemIds = new Set(addonItemIds(addon));
    const triggerGroupIds = new Set(addonGroupIds(addon));
    const triggerCategoryIds = new Set(addonCategoryIds(addon));
    return triggerItemIds.size
      ? selectedItems.filter((item) => triggerItemIds.has(selectedItemId(item)))
      : triggerGroupIds.size
        ? selectedItems.filter((item) => triggerGroupIds.has(selectedGroupId(item)))
        : triggerCategoryIds.size
          ? selectedItems.filter((item) => triggerCategoryIds.has(selectedCategoryId(item)))
        : selectedItems;
  };
  const autoQuantity = (addon) => {
    const unit = String(addon.unit || 'global').toLowerCase();
    const matchedItems = matchedItemsForAddon(addon);
    if (['per_item', 'per_unit'].includes(unit)) {
      const totalQuantity = matchedItems.reduce((sum, item) => sum + Math.max(0, Number(item.quantity || 0)), 0);
      return Math.max(1, totalQuantity);
    }
    if (unit === 'per_group') {
      const groups = new Set(matchedItems.map(selectedGroupId).filter(Boolean));
      return Math.max(1, groups.size);
    }
    if (unit === 'per_category') {
      const categories = new Set(matchedItems.map(selectedCategoryId).filter(Boolean));
      return Math.max(1, categories.size);
    }
    if (unit === 'per_room') {
      const rooms = new Set(matchedItems.map((item) => item.room || item.roomName || item.location).filter(Boolean).map(String));
      return Math.max(1, rooms.size || 1);
    }
    return 1;
  };
  const addonSnapshot = (addon) => {
    const quantity = autoQuantity(addon);
    const price = Number(addon.price) || 0;
    const unit = String(addon.unit || 'global').toLowerCase();
    return {
      addonId: addon._id,
      key: addon.key,
      name: addon.name,
      unit,
      unitPrice: price,
      icon: addon.icon || '',
      price,
      charge: price,
      quantity,
      total: unit === 'percentage' ? 0 : quantity * price,
      matchedTriggerCategoryIds: addonCategoryIds(addon),
      matchedTriggerGroupIds: addonGroupIds(addon),
      matchedTriggerItemIds: addonItemIds(addon),
    };
  };
  useEffect(() => {
    setSelected((current) => current.map((item) => {
      const addon = addons.find((entry) => entry._id === item.addonId || entry.key === item.key || entry.name === item.name);
      return addon ? addonSnapshot(addon) : item;
    }));
  }, [addons, selectedItemQuantityKey]);
  const toggleAddon = (addon) => {
    setSelected((current) => {
      const index = current.findIndex((item) => item.addonId === addon._id || item.key === addon.key || item.name === addon.name);
      if (index >= 0) return current.filter((_, itemIndex) => itemIndex !== index);
      return [...current, addonSnapshot(addon)];
    });
  };

  const handleNext = () => onSubmit({ specialServices: selected.map((item) => { const addon = addons.find((entry) => entry._id === item.addonId || entry.key === item.key || entry.name === item.name); return addon ? addonSnapshot(addon) : item; }) });
  const shouldScrollAddons = addons.length >= 3;

  return <div className="flex min-h-[calc(100svh-18rem)] flex-col gap-6 pb-24 text-left sm:min-h-[calc(100svh-20rem)] sm:pb-4"><header className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary-soft/40 text-primary dark:shadow-[0_10px_18px_rgba(0,0,0,0.22)]"><Sparkles className="h-6 w-6" /></span><div><h3 className="text-2xl font-bold text-text-primary">Add-on Services</h3><p className="mt-1 text-sm font-medium leading-6 text-text-secondary">Optional services available for the groups in your selected items.</p></div></header>
    <section className="flex min-h-0 flex-1 flex-col rounded-3xl border border-sky-100 bg-white p-3 shadow-card sm:p-4">
      {isLoading ? <div className="grid min-h-52 flex-1 place-items-center rounded-2xl border border-bg-border"><Spinner size="md" /></div> : isError ? <div className="flex min-h-52 flex-1 flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-8 text-center"><p className="text-sm font-semibold text-red-600">Could not load add-on services.</p><button onClick={() => refetch()} className="mt-2 text-sm font-semibold text-primary">Try again</button></div> : addons.length === 0 ? <div className="flex min-h-52 flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-bg-border px-5 text-center"><Sparkles className="h-9 w-9 text-primary/50" /><h4 className="mt-3 text-base font-semibold text-text-primary">No add-on service available</h4><p className="mt-1 text-sm text-text-secondary">There are no add-ons for your selected items. You can continue.</p></div> : <div className={`grid min-h-0 gap-3 pr-1 md:grid-cols-2 ${shouldScrollAddons ? 'flex-1 overflow-y-auto overscroll-contain' : 'flex-1 content-start'}`}>{addons.map((addon) => { const active = isSelected(addon); return <article key={addon._id} className={`flex min-h-36 flex-col justify-between rounded-2xl border p-4 transition ${active ? 'border-primary/20 bg-bg-white shadow-[0_14px_30px_rgba(15,23,42,0.08)] ring-1 ring-primary/10 backdrop-blur-sm' : 'border-bg-border bg-bg-white hover:border-primary/20 hover:shadow-[0_10px_24px_rgba(15,23,42,0.06)]'}`}><div><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-start gap-3">{addon.icon && <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-primary-soft/30 dark:shadow-[0_10px_18px_rgba(0,0,0,0.22)]"><AddonIcon icon={addon.icon} /></span>}<h4 className="min-w-0 font-semibold text-text-primary">{addon.name}</h4></div><span className="shrink-0 rounded-lg bg-primary-soft px-2.5 py-1 text-xs font-black text-primary">{formatAddonPrice(addon)}</span></div>{addon.description && <p className="mt-1.5 line-clamp-3 text-xs leading-5 text-text-secondary">{addon.description}</p>}</div><div className="mt-4 flex justify-end border-t border-bg-border/60 pt-3"><button type="button" onClick={() => toggleAddon(addon)} className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${active ? 'border-bg-border bg-bg-muted text-text-primary shadow-sm' : 'border-primary/20 bg-bg-white text-primary hover:border-primary/30 hover:shadow-sm'}`}>{active && <Check className="h-3.5 w-3.5" />}{active ? 'Selected' : 'Add service'}</button></div></article>; })}</div>}
    </section>
    <BookingActionBar onBack={onBack} onNext={handleNext} nextLabel="Continue" />
  </div>;
}

export { SpecialServicesStep };
