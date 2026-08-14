'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import Button from '@ui/Button';
import Spinner from '@ui/Spinner';
import { useAvailableAddons } from '@hooks/useAddons';

const SERVICE_TYPES = { local: 'local_shifting', intercity: 'intercity_moving', local_shifting: 'local_shifting', intercity_moving: 'intercity_moving' };

export default function SpecialServicesStep({ onSubmit, onBack, initialData = {}, serviceType }) {
  const selectedItems = initialData.items || [];
  const itemIds = [...new Set(selectedItems.map((item) => item.itemId).filter(Boolean))];
  const groupIds = [...new Set(selectedItems.map((item) => item.groupId).filter(Boolean))];
  const apiServiceType = SERVICE_TYPES[serviceType] || serviceType;
  const { data = [], isLoading, isError, refetch } = useAvailableAddons({ serviceType: apiServiceType, ...(itemIds.length ? { itemIds } : {}), ...(groupIds.length ? { groupIds } : {}) });
  const addons = Array.isArray(data) ? data : [];
  const [selected, setSelected] = useState(initialData.specialServices || []);

  const findSelectedIndex = (addon) => selected.findIndex((item) => item.addonId === addon._id || item.key === addon.key || item.name === addon.name);
  const isSelected = (addon) => findSelectedIndex(addon) >= 0;
  const addonGroupIds = (addon) => {
    const matched = Array.isArray(addon.matchedTriggerGroupIds) ? addon.matchedTriggerGroupIds : [];
    if (matched.length) return matched.filter(Boolean).map(String);
    return (addon.triggerGroupIds || []).map((group) => group?._id || group?.id || group).filter(Boolean).map(String);
  };
  const autoQuantity = (addon) => {
    const unit = String(addon.unit || '').toLowerCase();
    if (!['per_item', 'per_unit'].includes(unit)) return 1;
    const triggerIds = new Set(addonGroupIds(addon));
    const matchedItems = triggerIds.size ? selectedItems.filter((item) => triggerIds.has(String(item.groupId || ''))) : selectedItems;
    const totalQuantity = matchedItems.reduce((sum, item) => sum + Math.max(0, Number(item.quantity || 0)), 0);
    return Math.max(1, totalQuantity);
  };
  const addonSnapshot = (addon) => {
    const quantity = autoQuantity(addon);
    const price = Number(addon.price) || 0;
    return {
      addonId: addon._id,
      key: addon.key,
      name: addon.name,
      unit: addon.unit,
      unitPrice: price,
      price,
      charge: price,
      quantity,
      total: quantity * price,
      matchedTriggerGroupIds: addonGroupIds(addon),
    };
  };
  const toggleAddon = (addon) => {
    setSelected((current) => {
      const index = current.findIndex((item) => item.addonId === addon._id || item.key === addon.key || item.name === addon.name);
      if (index >= 0) return current.filter((_, itemIndex) => itemIndex !== index);
      return [...current, addonSnapshot(addon)];
    });
  };

  const handleNext = () => onSubmit({ specialServices: selected.map((item) => { const addon = addons.find((entry) => entry._id === item.addonId || entry.key === item.key || entry.name === item.name); return addon ? addonSnapshot(addon) : item; }) });
  const selectedCount = selected.length;

  return <div className="flex flex-col gap-6 pb-24 text-left sm:pb-4"><header className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary"><Sparkles className="h-5 w-5" /></span><div><h3 className="text-2xl font-bold text-text-primary">Add-on Services</h3><p className="mt-1 text-sm font-medium leading-6 text-text-secondary">Optional services available for the groups in your selected items.</p></div></header>
    {isLoading ? <div className="grid min-h-52 place-items-center rounded-2xl border border-bg-border"><Spinner size="md" /></div> : isError ? <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center"><p className="text-sm font-semibold text-red-600">Could not load add-on services.</p><button onClick={() => refetch()} className="mt-2 text-sm font-semibold text-primary">Try again</button></div> : addons.length === 0 ? <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-bg-border px-5 text-center"><Sparkles className="h-9 w-9 text-primary/50" /><h4 className="mt-3 text-base font-semibold text-text-primary">No add-on service available</h4><p className="mt-1 text-sm text-text-secondary">There are no add-ons for your selected item groups. You can continue.</p></div> : <div className="grid gap-3 md:grid-cols-2">{addons.map((addon) => { const active = isSelected(addon); return <article key={addon._id} className={`flex min-h-36 flex-col justify-between rounded-2xl border p-4 transition ${active ? 'border-primary/20 bg-bg-white shadow-[0_14px_30px_rgba(15,23,42,0.08)] ring-1 ring-primary/10 backdrop-blur-sm' : 'border-bg-border bg-bg-white hover:border-primary/20 hover:shadow-[0_10px_24px_rgba(15,23,42,0.06)]'}`}><div><div className="flex items-start justify-between gap-3"><h4 className="font-semibold text-text-primary">{addon.name}</h4>{addon.isGlobal && <span className="rounded-full bg-violet-50 px-2 py-1 text-[10px] font-semibold text-violet-700">Global</span>}</div>{addon.description && <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-text-secondary">{addon.description}</p>}</div><div className="mt-4 flex items-center justify-between gap-3 border-t border-bg-border/60 pt-3"><span className="min-w-0 truncate text-xs font-medium text-text-tertiary">{(addon.triggerGroupIds || []).map((group) => group.name).filter(Boolean).join(', ') || 'All selected items'}</span><button type="button" onClick={() => toggleAddon(addon)} className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${active ? 'border-bg-border bg-bg-muted text-text-primary shadow-sm' : 'border-primary/20 bg-bg-white text-primary hover:border-primary/30 hover:shadow-sm'}`}>{active && <Check className="h-3.5 w-3.5" />}{active ? 'Selected' : 'Add service'}</button></div></article>; })}</div>}
    <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-bg-border bg-bg-white/95 px-4 py-3 shadow-[0_-16px_40px_rgba(15,23,42,.10)] backdrop-blur sm:sticky sm:bottom-4 sm:rounded-2xl sm:border sm:px-4"><div className="mx-auto flex max-w-5xl items-center justify-between gap-3"><Button variant="secondary" onClick={onBack} icon={ArrowLeft}>Back</Button><div className="flex min-w-0 flex-1 items-center justify-end gap-3"><span className="truncate text-sm font-medium text-text-secondary">{selectedCount} selected</span><button onClick={handleNext} className="btn-sky flex shrink-0 items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold">Continue<ArrowRight className="h-4 w-4" /></button></div></div></footer>
  </div>;
}

export { SpecialServicesStep };
