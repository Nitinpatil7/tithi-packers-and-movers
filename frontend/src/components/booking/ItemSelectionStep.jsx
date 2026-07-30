'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Boxes, ChevronDown, ChevronRight, Minus, Package, Plus, Search, ShieldCheck, ShoppingCart, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { useItemCatalog } from '@/hooks/useItems';
import { ItemIcon } from '@/lib/itemIcons';

const variantId = (size) => size._id || size.sizeId?._id || size.sizeId || size.sizeKey;
const itemKey = (itemId, size) => `${itemId}:${variantId(size)}`;

export default function ItemSelectionStep({ onSubmit, onBack, initialData = {}, isIntercity = false }) {
  const { data = [], isLoading, isError, refetch } = useItemCatalog({});
  const sections = useMemo(() => Array.isArray(data) ? data : [], [data]);
  const [activeSection, setActiveSection] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState(initialData.items || []);
  const [insuranceSelected, setInsuranceSelected] = useState(initialData.specialServices?.some((service) => service.name === 'Cargo Insurance') || false);
  const sectionTopRef = useRef(null);

  useEffect(() => { if (!activeSection && sections[0]) setActiveSection(sections[0]._id); }, [activeSection, sections]);
  const activeSectionIndex = Math.max(0, sections.findIndex((entry) => entry._id === activeSection));
  const nextSection = sections[activeSectionIndex + 1] || null;
  const section = sections.find((entry) => entry._id === activeSection) || sections[0];
  const normalizedSearch = debouncedSearch.trim().toLowerCase();
  const groups = (section?.groups || []).map((group) => {
    const groupMatches = Boolean(normalizedSearch && group.name?.toLowerCase().includes(normalizedSearch));
    return { ...group, items: groupMatches ? (group.items || []) : (group.items || []).filter((item) => !normalizedSearch || item.name?.toLowerCase().includes(normalizedSearch)) };
  }).filter((group) => !normalizedSearch || group.name?.toLowerCase().includes(normalizedSearch) || group.items.length);

  useEffect(() => {
    setExpandedGroups(Object.fromEntries((section?.groups || []).map((group) => [group._id, false])));
  }, [section?._id, section?.groups]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!debouncedSearch) return;
    setExpandedGroups(Object.fromEntries(groups.map((group) => [group._id, true])));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const quantity = (key) => selectedItems.find((item) => (item.itemKey || item.key) === key)?.quantity || 0;
  const changeQuantity = (catalogItem, size, group, increment) => {
    const key = itemKey(catalogItem._id, size);
    setSelectedItems((current) => {
      const index = current.findIndex((item) => (item.itemKey || item.key) === key);
      if (index < 0 && increment > 0) return [...current, {
        itemId: catalogItem._id, itemKey: key, key, name: catalogItem.name, icon: catalogItem.icon, category: section?.name,
        sectionId: section?._id, groupId: group._id, group: group.name, sizeId: size.sizeId?._id || size.sizeId,
        sizeVariantId: size._id, sizeKey: size.sizeKey || size.label, tag: size.sizeKey || size.label,
        unitPrice: Number(size.price) || 0, price: Number(size.price) || 0, quantity: 1,
      }];
      if (index < 0) return current;
      const next = [...current]; const nextQuantity = next[index].quantity + increment;
      if (nextQuantity <= 0) next.splice(index, 1); else next[index] = { ...next[index], quantity: nextQuantity };
      return next;
    });
  };

  const totalCount = selectedItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const totalPrice = selectedItems.reduce((sum, item) => sum + Number(item.price || item.unitPrice || 0) * Number(item.quantity || 0), 0);
  const goToSection = (sectionId) => {
    setActiveSection(sectionId);
    setExpandedGroups({});
    setSearch('');
    setDebouncedSearch('');
    window.requestAnimationFrame(() => sectionTopRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }));
  };
  const handleNext = () => {
    let specialServices = initialData.specialServices || [];
    if (isIntercity) {
      specialServices = specialServices.filter((service) => service.name !== 'Cargo Insurance');
      if (insuranceSelected) specialServices.push({ name: 'Cargo Insurance', quantity: 1, charge: 500 });
    }
    onSubmit({ items: selectedItems, itemsTotal: totalPrice, specialServices });
  };
  const handlePrimaryAction = () => {
    if (nextSection) goToSection(nextSection._id);
    else handleNext();
  };

  return <div className="booking-items-ui space-y-7 pb-24 text-left sm:pb-4">
    <header><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-soft text-primary"><Package className="h-5 w-5" /></span><div><h3 className="text-2xl font-black text-text-primary">Select Items to Move</h3><p className="mt-1 text-sm font-medium text-text-secondary">Choose a section, open a group, select the correct size and adjust quantity.</p></div></div></header>

    {isLoading ? <div className="grid min-h-72 place-items-center rounded-3xl border border-bg-border"><Spinner size="md" /></div> : isError ? <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center"><p className="text-sm font-bold text-red-600">Could not load moving items.</p><button onClick={() => refetch()} className="mt-3 text-sm font-black text-primary">Try again</button></div> : !sections.length ? <div className="rounded-3xl border border-dashed border-bg-border p-10 text-center text-sm font-semibold text-text-secondary">No moving items are currently available.</div> : <div className="grid gap-7 lg:grid-cols-12 lg:items-start">
      <main ref={sectionTopRef} className="space-y-5 scroll-mt-28 lg:col-span-8"><div className="flex gap-2 overflow-x-auto pb-1">{sections.map((entry) => <button key={entry._id} onClick={() => goToSection(entry._id)} className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-black transition ${section?._id === entry._id ? 'bg-primary text-white shadow-sky' : 'border border-bg-border bg-bg-white text-text-secondary hover:border-primary/30 hover:text-primary'}`}>{entry.name}</button>)}</div>
        <label className="relative block"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-2xl border border-bg-border bg-bg-white py-3 pl-11 pr-4 text-sm text-text-primary outline-none focus:border-primary" placeholder={`Search in ${section?.name || 'items'}…`} /></label>
        <div className="space-y-3">{groups.map((group) => { const open = expandedGroups[group._id] || Boolean(search); return <section key={group._id} className="overflow-hidden rounded-2xl border border-bg-border bg-bg-white"><button type="button" onClick={() => setExpandedGroups((value) => ({ ...value, [group._id]: !open }))} className="flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-bg-section/50"><span className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-primary"><Boxes className="h-4 w-4" /></span><span><strong className="block text-sm text-text-primary">{group.name}</strong><small className="font-semibold text-text-tertiary">{group.items?.length || 0} choices</small></span></span>{open ? <ChevronDown className="h-4 w-4 text-primary" /> : <ChevronRight className="h-4 w-4 text-text-tertiary" />}</button>{open && <div className="grid gap-3 border-t border-bg-border bg-bg-section/20 p-3 sm:grid-cols-2">{group.items?.map((item) => <article key={item._id} className="rounded-2xl border border-bg-border bg-bg-white p-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><ItemIcon icon={item.icon} className="h-5 w-5" /></span><h4 className="text-sm font-black text-text-primary">{item.name}</h4></div><div className="mt-3 space-y-2">{(item.sizes || []).filter((size) => size.isActive !== false).map((size) => { const key = itemKey(item._id, size); const qty = quantity(key); return <div key={key} className={`flex items-center justify-between gap-3 rounded-xl border p-2.5 transition ${qty ? 'border-primary/30 bg-primary-soft' : 'border-bg-border'}`}><div><span className="block text-xs font-black text-text-primary">{size.label || size.sizeKey}</span><span className="text-xs font-bold text-primary">₹{Number(size.price || 0).toLocaleString('en-IN')}</span></div>{qty ? <div className="flex items-center gap-2"><button type="button" onClick={() => changeQuantity(item, size, group, -1)} className="grid h-8 w-8 place-items-center rounded-lg border border-bg-border bg-bg-white text-text-primary"><Minus className="h-3.5 w-3.5" /></button><strong className="w-5 text-center text-sm text-primary">{qty}</strong><button type="button" onClick={() => changeQuantity(item, size, group, 1)} className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-white"><Plus className="h-3.5 w-3.5" /></button></div> : <button type="button" onClick={() => changeQuantity(item, size, group, 1)} className="rounded-lg border border-primary/20 px-3 py-1.5 text-xs font-black text-primary hover:bg-primary hover:text-white">Add</button>}</div>; })}</div></article>)}</div>}</section>; })}{!groups.length && <div className="rounded-2xl border border-dashed border-bg-border p-10 text-center text-sm font-semibold text-text-tertiary">No matching groups or items.</div>}</div>
        {nextSection && <button type="button" onClick={() => goToSection(nextSection._id)} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary-soft px-5 py-4 text-sm font-black text-primary transition hover:bg-primary hover:text-white">Next: {nextSection.name}<ArrowRight className="h-4 w-4" /></button>}
      </main>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:col-span-4"><div className="rounded-3xl border border-bg-border bg-bg-white p-5 shadow-sm"><div className="flex items-center justify-between border-b border-bg-border pb-4"><h4 className="flex items-center gap-2 text-sm font-black text-text-primary"><ShoppingCart className="h-4 w-4 text-primary" />Selected ({totalCount})</h4>{selectedItems.length > 0 && <button type="button" onClick={() => setSelectedItems([])} className="text-xs font-bold text-red-500">Clear all</button>}</div>{selectedItems.length ? <div className="mt-4 max-h-72 space-y-2 overflow-y-auto">{selectedItems.map((item) => <div key={item.itemKey || item.key || `${item.name}-${item.tag}`} className="flex items-center justify-between gap-3 rounded-xl bg-bg-section p-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-bg-white text-primary"><ItemIcon icon={item.icon} className="h-4 w-4" /></span><div className="min-w-0 flex-1"><strong className="block truncate text-xs text-text-primary">{item.name}</strong><span className="text-[10px] font-bold text-text-tertiary">{item.tag || item.sizeKey} · ₹{Number(item.price || item.unitPrice || 0).toLocaleString('en-IN')} × {item.quantity}</span></div><button type="button" onClick={() => setSelectedItems((list) => list.filter((entry) => entry !== item))} className="text-red-400"><Trash2 className="h-4 w-4" /></button></div>)}</div> : <p className="py-8 text-center text-xs font-semibold text-text-tertiary">Your selected items will appear here.</p>}<div className="mt-4 flex items-center justify-between border-t border-bg-border pt-4"><span className="text-xs font-bold text-text-secondary">Items list value</span><strong className="text-lg text-primary">₹{totalPrice.toLocaleString('en-IN')}</strong></div><p className="mt-2 text-[11px] font-semibold leading-5 text-text-tertiary">Final review applies base free allowance first, then charges only additional items.</p></div>
        {isIntercity && <div className={`rounded-3xl border p-5 ${insuranceSelected ? 'border-emerald-300 bg-emerald-50' : 'border-bg-border bg-bg-white'}`}><div className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" /><div><h4 className="text-sm font-black text-text-primary">Cargo Transit Insurance</h4><p className="mt-1 text-xs leading-5 text-text-secondary">Optional transit protection for ₹500.</p></div></div><button type="button" onClick={() => setInsuranceSelected((value) => !value)} className={`mt-4 w-full rounded-xl py-2.5 text-xs font-black ${insuranceSelected ? 'bg-emerald-600 text-white' : 'border border-emerald-200 text-emerald-700'}`}>{insuranceSelected ? 'Insurance selected' : 'Add insurance'}</button></div>}
      </aside>
    </div>}

    <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-bg-border bg-bg-white/95 px-4 py-3 shadow-[0_-16px_40px_rgba(15,23,42,.10)] backdrop-blur sm:sticky sm:bottom-4 sm:rounded-2xl sm:border sm:px-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
        <Button variant="secondary" onClick={onBack} icon={ArrowLeft}>Back</Button>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
          <span className="truncate text-sm font-semibold text-text-secondary">{totalCount} item{totalCount === 1 ? '' : 's'} selected</span>
          <button type="button" onClick={handlePrimaryAction} className="btn-sky flex shrink-0 items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold">{nextSection ? `Next: ${nextSection.name}` : 'Continue'}<ArrowRight className="h-4 w-4" /></button>
        </div>
      </div>
    </footer>
  </div>;
}

export { ItemSelectionStep };
