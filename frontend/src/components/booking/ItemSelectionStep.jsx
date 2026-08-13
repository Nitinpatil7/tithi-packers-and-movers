'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Boxes, ChevronDown, ChevronRight, Minus, Package, Plus, Search, ShieldCheck, ShoppingCart, Trash2 } from 'lucide-react';
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
  const activeSizes = (item) => (item.sizes || []).filter((size) => size.isActive !== false);
  const primarySize = (item) => activeSizes(item)[0];
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
    <header><div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary shadow-xs ring-1 ring-sky-100"><Package className="h-5 w-5" /></span><div className="min-w-0"><h3 className="text-xl font-black leading-tight text-text-primary sm:text-2xl">Select Items to Move</h3><p className="mt-1 text-sm font-medium text-text-secondary">Choose a section, open a group, and add the items you want to move.</p></div></div></header>

    {isLoading ? <div className="grid min-h-72 place-items-center rounded-3xl border border-bg-border"><Spinner size="md" /></div> : isError ? <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center"><p className="text-sm font-bold text-red-600">Could not load moving items.</p><button onClick={() => refetch()} className="mt-3 text-sm font-black text-primary">Try again</button></div> : !sections.length ? <div className="rounded-3xl border border-dashed border-bg-border p-10 text-center text-sm font-semibold text-text-secondary">No moving items are currently available.</div> : <div className="grid gap-7 lg:grid-cols-12 lg:items-start">
      <main ref={sectionTopRef} className="space-y-5 scroll-mt-28 lg:col-span-8"><div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">{sections.map((entry) => <button key={entry._id} onClick={() => goToSection(entry._id)} className={`min-h-11 shrink-0 rounded-2xl px-4 py-2.5 text-sm font-black transition active:scale-[.98] ${section?._id === entry._id ? 'bg-primary text-white shadow-sky' : 'border border-bg-border bg-bg-white text-text-secondary hover:border-primary/30 hover:text-primary hover:shadow-xs'}`}>{entry.name}</button>)}</div>
        <label className="relative block"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-2xl border border-bg-border bg-bg-white py-3 pl-11 pr-4 text-sm text-text-primary outline-none focus:border-primary" placeholder={`Search in ${section?.name || 'items'}...`} /></label>
        <div className="space-y-3">{groups.map((group) => { const open = expandedGroups[group._id] || Boolean(search); return <section key={group._id} className="overflow-hidden rounded-3xl border border-sky-100 bg-bg-white shadow-xs"><button type="button" onClick={() => setExpandedGroups((value) => ({ ...value, [group._id]: !open }))} className="flex w-full items-center justify-between gap-3 p-4 text-left transition hover:bg-sky-50/70"><span className="flex min-w-0 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary ring-1 ring-sky-100"><Boxes className="h-4 w-4" /></span><span className="min-w-0"><strong className="block truncate text-sm text-text-primary">{group.name}</strong><small className="font-semibold text-text-tertiary">{group.items?.length || 0} choices</small></span></span>{open ? <ChevronDown className="h-4 w-4 shrink-0 text-primary" /> : <ChevronRight className="h-4 w-4 shrink-0 text-text-tertiary" />}</button>{open && <div className="grid gap-2.5 border-t border-sky-100 bg-gradient-to-b from-sky-50/60 to-white p-3 sm:grid-cols-2">{group.items?.map((item) => { const size = primarySize(item); if (!size) return null; const key = itemKey(item._id, size); const qty = quantity(key); return <article key={item._id} className={`booking-item-row group relative h-full overflow-hidden rounded-2xl border bg-bg-white p-3 transition duration-300 hover:-translate-y-0.5 hover:shadow-sky active:scale-[.99] ${qty ? 'border-primary/40 bg-primary-soft/70 shadow-xs' : 'border-bg-border hover:border-primary/30'}`}><div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-50/70 via-white to-orange-50/30 opacity-0 transition-opacity group-hover:opacity-100" /><div className="relative z-10 grid min-h-[58px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl transition ${qty ? 'bg-primary text-white' : 'bg-primary-soft text-primary group-hover:bg-sky-200 group-hover:text-sky-900'}`}><ItemIcon icon={item.icon} className="h-5 w-5" /></span><h4 className="min-w-0 pr-1 text-sm font-semibold leading-snug text-text-primary line-clamp-2">{item.name}</h4>{qty ? <div className="flex shrink-0 items-center gap-1 rounded-xl bg-primary-soft/70 p-1"><button type="button" onClick={() => changeQuantity(item, size, group, -1)} className="grid h-8 w-8 place-items-center rounded-lg bg-bg-white text-text-primary transition hover:text-primary"><Minus className="h-3.5 w-3.5" /></button><strong className="min-w-5 text-center text-sm font-semibold text-primary">{qty}</strong><button type="button" onClick={() => changeQuantity(item, size, group, 1)} className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-white transition hover:bg-primary-dark"><Plus className="h-3.5 w-3.5" /></button></div> : <button type="button" onClick={() => changeQuantity(item, size, group, 1)} className="inline-flex h-9 min-w-[58px] shrink-0 items-center justify-center rounded-xl bg-primary-soft px-3 text-xs font-semibold text-primary transition hover:bg-primary hover:text-white">Add</button>}</div></article>; })}</div>}</section>; })}{!groups.length && <div className="rounded-2xl border border-dashed border-bg-border p-10 text-center text-sm font-semibold text-text-tertiary">No matching groups or items.</div>}</div>
        {nextSection && <button type="button" onClick={() => goToSection(nextSection._id)} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary-soft px-5 py-4 text-sm font-black text-primary transition hover:bg-primary hover:text-white">Next: {nextSection.name}<ArrowRight className="h-4 w-4" /></button>}
      </main>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:col-span-4"><div className="rounded-3xl border border-bg-border bg-bg-white p-5 shadow-sm"><div className="flex items-center justify-between border-b border-bg-border pb-4"><h4 className="flex items-center gap-2 text-sm font-black text-text-primary"><ShoppingCart className="h-4 w-4 text-primary" />Selected ({totalCount})</h4>{selectedItems.length > 0 && <button type="button" onClick={() => setSelectedItems([])} className="text-xs font-bold text-red-500">Clear all</button>}</div>{selectedItems.length ? <div className="mt-4 max-h-72 space-y-2 overflow-y-auto">{selectedItems.map((item) => <div key={item.itemKey || item.key || `${item.name}-${item.tag}`} className="flex items-center justify-between gap-3 rounded-xl bg-bg-section p-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-bg-white text-primary"><ItemIcon icon={item.icon} className="h-4 w-4" /></span><div className="min-w-0 flex-1"><strong className="block truncate text-xs text-text-primary">{item.name}</strong><span className="text-[10px] font-semibold text-text-tertiary">Qty {item.quantity}</span></div><button type="button" onClick={() => setSelectedItems((list) => list.filter((entry) => entry !== item))} className="text-red-400"><Trash2 className="h-4 w-4" /></button></div>)}</div> : <p className="py-8 text-center text-xs font-semibold text-text-tertiary">Your selected items will appear here.</p>}<p className="mt-4 border-t border-bg-border pt-4 text-[11px] font-semibold leading-5 text-text-tertiary">Final review will show the quote after allowances are applied.</p></div>
        {isIntercity && <div className={`rounded-3xl border p-5 ${insuranceSelected ? 'border-emerald-300 bg-emerald-50' : 'border-bg-border bg-bg-white'}`}><div className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" /><div><h4 className="text-sm font-black text-text-primary">Cargo Transit Insurance</h4><p className="mt-1 text-xs leading-5 text-text-secondary">Optional transit protection for your selected move.</p></div></div><button type="button" onClick={() => setInsuranceSelected((value) => !value)} className={`mt-4 w-full rounded-xl py-2.5 text-xs font-black ${insuranceSelected ? 'bg-emerald-600 text-white' : 'border border-emerald-200 text-emerald-700'}`}>{insuranceSelected ? 'Insurance selected' : 'Add insurance'}</button></div>}
      </aside>
    </div>}

    <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-bg-border bg-bg-white/95 px-3 py-2 shadow-[0_-16px_40px_rgba(15,23,42,.10)] backdrop-blur sm:sticky sm:bottom-4 sm:rounded-2xl sm:border sm:px-4 sm:py-3">
      <div className="mx-auto grid max-w-5xl grid-cols-3 items-center gap-2 sm:flex sm:justify-between sm:gap-3">
        <button type="button" onClick={onBack} className="flex min-h-12 items-center justify-center gap-1.5 rounded-2xl border border-bg-border bg-bg-white px-3 text-xs font-semibold text-text-secondary transition hover:text-primary sm:min-h-0 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm"><ArrowLeft className="h-4 w-4" />Back</button>
        <div className="flex min-w-0 flex-col items-center justify-center rounded-2xl bg-primary-soft px-2 py-2 text-center sm:hidden">
          <span className="max-w-full truncate text-[10px] font-bold uppercase tracking-wide text-primary">{section?.name || 'Category'}</span>
          <span className="max-w-full truncate text-[11px] font-semibold text-text-secondary">{totalCount} selected</span>
        </div>
        <div className="hidden min-w-0 flex-1 items-center justify-end gap-3 sm:flex">
          <span className="truncate text-sm font-semibold text-text-secondary">{totalCount} item{totalCount === 1 ? '' : 's'} selected</span>
          <button type="button" onClick={handlePrimaryAction} className="btn-sky flex shrink-0 items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold">{nextSection ? `Next: ${nextSection.name}` : 'Continue'}<ArrowRight className="h-4 w-4" /></button>
        </div>
        <button type="button" onClick={handlePrimaryAction} className="btn-sky flex min-h-12 min-w-0 items-center justify-center gap-1.5 rounded-2xl px-3 text-xs font-semibold sm:hidden"><span className="truncate">{nextSection ? `Next: ${nextSection.name}` : 'Continue'}</span><ArrowRight className="h-4 w-4 shrink-0" /></button>
      </div>
    </footer>
  </div>;
}

export { ItemSelectionStep };
