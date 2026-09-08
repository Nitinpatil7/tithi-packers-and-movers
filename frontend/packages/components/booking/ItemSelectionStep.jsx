'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronDown, ChevronRight, Minus, Package, Plus, Search, Send, ShieldCheck, ShoppingCart, Trash2, X } from 'lucide-react';
import Spinner from '@ui/Spinner';
import toast from 'react-hot-toast';
import { submitContact } from '@lib/contactApi';
import { useItemCatalog } from '@hooks/useItems';
import { useBookingStore } from '@tithi/store/bookingStore';
import BookingActionBar from './BookingActionBar';

const variantId = (size) => size._id || size.sizeId?._id || size.sizeId || size.sizeKey;
const itemKey = (itemId, size) => `${itemId}:${variantId(size)}`;
const sameJson = (left, right) => JSON.stringify(left || null) === JSON.stringify(right || null);
const nameIncludes = (name, query) => String(name || '').toLowerCase().includes(query);
const cleanText = (value) => String(value || '').replace(/\s+/g, ' ').trim();
const isUsableLabel = (value) => {
  const text = cleanText(value);
  return Boolean(text && text !== '.' && text !== '-' && text.toLowerCase() !== 'null' && text.toLowerCase() !== 'undefined');
};
const displaySectionName = (section = {}, fallback = 'Living Room') => {
  const candidates = [
    section.name,
    section.title,
    section.label,
    section.section,
    section.groups?.[0]?.section,
    section.groups?.[0]?.items?.[0]?.section,
    section.groups?.[0]?.items?.[0]?.category,
  ];
  return cleanText(candidates.find(isUsableLabel) || fallback);
};
const selectedSectionKey = (item) => String(item.sectionId || item.categoryId || item.category || 'other');
const selectedGroupKey = (item) => String(item.groupId || item.group || 'other');
const selectedQuantity = (items = []) => items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
const groupSelectedItems = (items = []) => {
  const sectionsMap = new Map();
  items.forEach((item) => {
    const sectionKey = selectedSectionKey(item);
    const groupKey = selectedGroupKey(item);
    if (!sectionsMap.has(sectionKey)) {
      sectionsMap.set(sectionKey, {
        key: sectionKey,
        name: cleanText(item.category || item.section || 'Other'),
        quantity: 0,
        groups: new Map(),
      });
    }
    const section = sectionsMap.get(sectionKey);
    if (!section.groups.has(groupKey)) {
      section.groups.set(groupKey, {
        key: groupKey,
        name: cleanText(item.group || 'Other'),
        quantity: 0,
        items: [],
      });
    }
    const group = section.groups.get(groupKey);
    const quantity = Number(item.quantity || 0);
    section.quantity += quantity;
    group.quantity += quantity;
    group.items.push(item);
  });
  return [...sectionsMap.values()].map((section) => ({ ...section, groups: [...section.groups.values()] }));
};

function CatalogIcon({ icon, alt = '', className = 'h-5 w-5', priority = false, sizes = '48px' }) {
  return icon ? (
    <Image
      src={icon}
      alt={alt}
      width={48}
      height={48}
      priority={priority}
      sizes={sizes}
      className={`${className} rounded-lg object-cover dark:drop-shadow-[0_10px_18px_rgba(0,0,0,0.32)]`}
    />
  ) : (
    <span className={className} />
  );
}

export default function ItemSelectionStep({ onSubmit, onBack, initialData = {}, isIntercity = false, showCartBar = true }) {
  const updateBookingData = useBookingStore((state) => state.updateBookingData);
  const { data: catalogSections = [], isLoading, isFetching: catalogFetching, isError, refetch } = useItemCatalog({});
  const [activeSection, setActiveSection] = useState('');
  const [openGroupId, setOpenGroupId] = useState('');
  const [sectionDirection, setSectionDirection] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState(initialData.items || []);
  const [cartOpen, setCartOpen] = useState(false);
  const [insuranceSelected, setInsuranceSelected] = useState(initialData.specialServices?.some((service) => service.name === 'Cargo Insurance') || false);
  const [highlightedItems, setHighlightedItems] = useState([]);
  const [notFoundSubmitting, setNotFoundSubmitting] = useState(false);
  const [notFoundSubmitted, setNotFoundSubmitted] = useState('');
  const sectionTopRef = useRef(null);
  const tabRefs = useRef({});
  const groupRefs = useRef({});
  const itemRefs = useRef({});
  const searchTargetRef = useRef(null);
  const shouldTrackSectionRef = useRef(false);
  const prefersReducedMotion = useReducedMotion();
  const initialItemsKey = JSON.stringify(initialData.items || []);
  const initialInsuranceSelected = Boolean(initialData.specialServices?.some((service) => service.name === 'Cargo Insurance'));

  useEffect(() => {
    const nextItems = initialData.items || [];
    setSelectedItems((current) => (sameJson(current, nextItems) ? current : nextItems));
  // Keep local selections aligned when the hydrated draft arrives after mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialItemsKey]);

  useEffect(() => {
    setInsuranceSelected(initialInsuranceSelected);
  }, [initialInsuranceSelected]);

  const sections = useMemo(() => Array.isArray(catalogSections) ? catalogSections : [], [catalogSections]);
  useEffect(() => {
    if (!sections.length) return;
    const savedSection = initialData.itemActiveSectionId;
    if (!activeSection) {
      setActiveSection(sections.some((entry) => entry._id === savedSection) ? savedSection : sections[0]._id);
      return;
    }
    if (!sections.some((entry) => entry._id === activeSection)) setActiveSection(sections[0]._id);
  }, [activeSection, initialData.itemActiveSectionId, sections]);
  const activeSectionIndex = Math.max(0, sections.findIndex((entry) => entry._id === activeSection));
  const nextSection = sections[activeSectionIndex + 1] || null;
  const section = sections.find((entry) => entry._id === activeSection) || sections[0];
  const sectionName = displaySectionName(section);
  const normalizedSearch = debouncedSearch.trim().toLowerCase();
  const allSearchMatches = useMemo(() => {
    if (!normalizedSearch) return [];
    return sections.flatMap((catalogSection) => (catalogSection.groups || []).flatMap((group) => (
      (group.items || [])
        .filter((item) => nameIncludes(item.name, normalizedSearch) || nameIncludes(group.name, normalizedSearch))
        .map((item) => ({ section: catalogSection, group, item }))
    )));
  }, [normalizedSearch, sections]);
  const highlightedIds = useMemo(() => new Set(highlightedItems), [highlightedItems]);
  const selectedCountByGroup = useMemo(() => selectedItems.reduce((counts, item) => {
    const key = selectedGroupKey(item);
    counts.set(key, (counts.get(key) || 0) + Number(item.quantity || 0));
    return counts;
  }, new Map()), [selectedItems]);
  const cartGroups = useMemo(() => groupSelectedItems(selectedItems), [selectedItems]);
  const groups = useMemo(() => (section?.groups || []).map((group) => {
    const groupMatches = nameIncludes(group.name, normalizedSearch);
    return {
      ...group,
      items: (group.items || []).filter((item) => !normalizedSearch || groupMatches || nameIncludes(item.name, normalizedSearch)),
    };
  }).filter((group) => !normalizedSearch || group.items.length), [normalizedSearch, section?.groups]);

  useEffect(() => {
    setOpenGroupId('');
  }, [section?._id]);

  useEffect(() => {
    if (!activeSection) return;
    tabRefs.current[activeSection]?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
    if (!shouldTrackSectionRef.current) return;
    shouldTrackSectionRef.current = false;
    sectionTopRef.current?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
  }, [activeSection, prefersReducedMotion]);

  useEffect(() => {
    let timeoutId;
    const scrollToFreshTop = () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      sectionTopRef.current?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    };
    const frameId = window.requestAnimationFrame(() => {
      scrollToFreshTop();
      timeoutId = window.setTimeout(scrollToFreshTop, 80);
    });
    return () => {
      window.cancelAnimationFrame(frameId);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!normalizedSearch) {
      setHighlightedItems((current) => (current.length ? [] : current));
      setNotFoundSubmitted((current) => (current ? '' : current));
      return;
    }
    const matchIds = allSearchMatches.map(({ item }) => item._id);
    setHighlightedItems((current) => (
      current.length === matchIds.length && current.every((id, index) => id === matchIds[index])
        ? current
        : matchIds
    ));
    if (!allSearchMatches.length) return;
    const firstMatch = allSearchMatches[0];
    searchTargetRef.current = firstMatch.item._id;
    const activeMatch = allSearchMatches.some(({ section: matchSection }) => matchSection._id === activeSection);
    if (!activeMatch) {
      const nextIndex = sections.findIndex((entry) => entry._id === firstMatch.section._id);
      setSectionDirection(nextIndex >= activeSectionIndex ? 1 : -1);
      shouldTrackSectionRef.current = true;
      setActiveSection(firstMatch.section._id);
      return;
    }
    setOpenGroupId((current) => (current === firstMatch.group._id ? current : firstMatch.group._id));
  }, [activeSection, activeSectionIndex, allSearchMatches, normalizedSearch, sections]);

  useEffect(() => {
    if (!normalizedSearch) return;
    if (groups.some((group) => group._id === openGroupId)) return;
    setOpenGroupId(groups[0]?._id || '');
  }, [groups, normalizedSearch, openGroupId]);

  useEffect(() => {
    if (!openGroupId) return undefined;
    const frameId = window.requestAnimationFrame(() => {
      groupRefs.current[openGroupId]?.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
        inline: 'nearest',
      });
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [openGroupId, prefersReducedMotion]);

  useEffect(() => {
    if (!highlightedItems.length || !section?._id) return;
    const targetId = searchTargetRef.current;
    const visibleItems = groups.flatMap((group) => group.items || []);
    const firstVisible = visibleItems.find((item) => item._id === targetId) || visibleItems.find((item) => highlightedItems.includes(item._id));
    if (!firstVisible) return;
    window.setTimeout(() => itemRefs.current[firstVisible._id]?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 80);
  }, [groups, highlightedItems, section?._id]);

  useEffect(() => {
    if (!highlightedItems.length) return undefined;
    const timer = window.setTimeout(() => setHighlightedItems([]), 1800);
    return () => window.clearTimeout(timer);
  }, [highlightedItems]);

  const quantity = (key) => selectedItems.find((item) => (item.itemKey || item.key) === key)?.quantity || 0;
  const activeSizes = useCallback((item) => (item.sizes || []).filter((size) => size.isActive !== false), []);
  const primarySize = (item) => activeSizes(item)[0];
  useEffect(() => {
    if (!sections.length || !selectedItems.length) return;
    const activeKeys = new Set();
    const activeByItemId = new Map();
    sections.forEach((catalogSection) => {
      (catalogSection.groups || []).forEach((group) => {
        (group.items || []).forEach((catalogItem) => {
          const sizes = activeSizes(catalogItem);
          activeByItemId.set(String(catalogItem._id), { catalogSection, group, catalogItem, sizes });
          sizes.forEach((size) => activeKeys.add(itemKey(catalogItem._id, size)));
        });
      });
    });

    const nextItems = selectedItems.flatMap((item) => {
      const key = item.itemKey || item.key || item.itemkey || '';
      if (activeKeys.has(key)) return [item];
      const catalogEntry = activeByItemId.get(String(item.itemId || ''));
      if (!catalogEntry) return [];
      const wantedSize = String(item.sizeVariantId || item.sizeId || item.options?.sizeVariantId || item.tag || item.sizeTag || item.sizeKey || '').toLowerCase();
      if (!wantedSize) return [];
      const size = catalogEntry.sizes.find((entry) => (
        [entry._id, entry.sizeId?._id, entry.sizeId, entry.sizeKey, entry.label]
          .some((value) => String(value || '').toLowerCase() === wantedSize)
      ));
      if (!size) return [];
      const nextKey = itemKey(catalogEntry.catalogItem._id, size);
      return [{
        ...item,
        itemId: catalogEntry.catalogItem._id,
        itemKey: nextKey,
        key: nextKey,
        name: catalogEntry.catalogItem.name,
        category: catalogEntry.catalogSection?.name,
        section: catalogEntry.catalogSection?.name,
        sectionId: catalogEntry.catalogSection?._id,
        groupId: catalogEntry.group._id,
        group: catalogEntry.group.name,
        icon: catalogEntry.catalogItem.icon || catalogEntry.group.icon || catalogEntry.catalogSection?.icon || '',
        description: size.label || size.sizeKey || '',
        sizeId: size.sizeId?._id || size.sizeId,
        sizeVariantId: size._id,
        sizeKey: size.sizeKey || size.label,
        tag: size.sizeKey || size.label,
        unitPrice: Number(size.price) || 0,
        price: Number(size.price) || 0,
      }];
    });
    if (!sameJson(selectedItems, nextItems)) setSelectedItems(nextItems);
  }, [activeSizes, sections, selectedItems]);
  const changeQuantity = (catalogItem, size, group, increment) => {
    const key = itemKey(catalogItem._id, size);
    setSelectedItems((current) => {
      const index = current.findIndex((item) => (item.itemKey || item.key) === key);
      if (index < 0 && increment > 0) return [...current, {
        itemId: catalogItem._id, itemKey: key, key, name: catalogItem.name, category: sectionName,
        section: sectionName, sectionId: section?._id, groupId: group._id, group: group.name,
        icon: catalogItem.icon || group.icon || section?.icon || '', description: size.label || size.sizeKey || '',
        sizeId: size.sizeId?._id || size.sizeId,
        sizeVariantId: size._id, sizeKey: size.sizeKey || size.label, tag: size.sizeKey || size.label,
        unitPrice: Number(size.price) || 0, price: Number(size.price) || 0, quantity: 1,
      }];
      if (index < 0) return current;
      const next = [...current]; const nextQuantity = next[index].quantity + increment;
      if (nextQuantity <= 0) next.splice(index, 1); else next[index] = { ...next[index], quantity: nextQuantity };
      return next;
    });
  };

  const totalCount = selectedQuantity(selectedItems);
  const totalPrice = selectedItems.reduce((sum, item) => sum + Number(item.price || item.unitPrice || 0) * Number(item.quantity || 0), 0);
  useEffect(() => {
    if (totalCount === 0) setCartOpen(false);
  }, [totalCount]);
  useEffect(() => {
    const currentData = useBookingStore.getState().bookingData || {};
    let specialServices = currentData.specialServices || [];
    if (isIntercity) {
      specialServices = specialServices.filter((service) => service.name !== 'Cargo Insurance');
      if (insuranceSelected) specialServices = [...specialServices, { name: 'Cargo Insurance', quantity: 1, charge: 500 }];
    }
    const nextData = {
      items: selectedItems,
      itemsTotal: totalPrice,
      itemActiveSectionId: activeSection || initialData.itemActiveSectionId || '',
      ...(isIntercity ? { specialServices } : {}),
    };
    if (
      sameJson(currentData.items || [], selectedItems)
      && Number(currentData.itemsTotal || 0) === Number(totalPrice || 0)
      && String(currentData.itemActiveSectionId || '') === String(nextData.itemActiveSectionId || '')
      && (!isIntercity || sameJson(currentData.specialServices || [], specialServices))
    ) {
      return;
    }
    updateBookingData(nextData);
  }, [activeSection, initialData.itemActiveSectionId, insuranceSelected, isIntercity, selectedItems, totalPrice, updateBookingData]);
  const goToSection = (sectionId) => {
    const nextIndex = sections.findIndex((entry) => entry._id === sectionId);
    setSectionDirection(nextIndex >= activeSectionIndex ? 1 : -1);
    shouldTrackSectionRef.current = true;
    setActiveSection(sectionId);
    updateBookingData({ itemActiveSectionId: sectionId });
    setOpenGroupId('');
    setSearch('');
    setDebouncedSearch('');
  };
  const handleBack = () => {
    const previousSection = sections[activeSectionIndex - 1];
    if (previousSection) {
      setCartOpen(false);
      goToSection(previousSection._id);
      return;
    }
    onBack?.();
  };
  const handleMissingItemSubmit = async () => {
    const searchedTerm = debouncedSearch.trim();
    if (!searchedTerm || notFoundSubmitting) return;
    setNotFoundSubmitting(true);
    try {
      await submitContact({
        source: 'item_search',
        type: 'item_search',
        searchedTerm,
        subject: `Item not found: ${searchedTerm}`,
        message: `Customer searched for "${searchedTerm}" in the booking item catalog, but no matching item was found.`,
      });
      setNotFoundSubmitted(searchedTerm);
      toast.success('Thanks, our team will review this item.');
    } catch (error) {
      toast.error(error.message || 'Could not submit this item query.');
    } finally {
      setNotFoundSubmitting(false);
    }
  };
  const handleNext = () => {
    let specialServices = initialData.specialServices || [];
    if (isIntercity) {
      specialServices = specialServices.filter((service) => service.name !== 'Cargo Insurance');
      if (insuranceSelected) specialServices.push({ name: 'Cargo Insurance', quantity: 1, charge: 500 });
    }
    onSubmit({ items: selectedItems, itemsTotal: totalPrice, specialServices, itemActiveSectionId: activeSection });
  };
  const handlePrimaryAction = () => {
    if (nextSection) {
      setCartOpen(false);
      goToSection(nextSection._id);
    }
    else handleNext();
  };

  return <div className="booking-items-ui space-y-5 pb-24 text-left sm:space-y-7 sm:pb-4">
    <header><div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary shadow-xs ring-1 ring-sky-100"><Package className="h-5 w-5" /></span><div className="min-w-0"><h3 className="text-xl font-bold leading-tight text-text-primary sm:text-2xl">Select Items to Move</h3><p className="mt-1 text-sm font-medium text-text-secondary">Choose a section, search across all items, and add what you want to move.</p></div></div></header>

    {isLoading ? <div className="grid min-h-72 place-items-center rounded-3xl border border-bg-border"><Spinner size="md" /></div> : isError ? <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center"><p className="text-sm font-bold text-red-600">Could not load moving items.</p><button onClick={() => refetch()} className="mt-3 text-sm font-black text-primary">Try again</button></div> : !sections.length ? <div className="rounded-3xl border border-dashed border-bg-border p-10 text-center text-sm font-semibold text-text-secondary">No moving items are currently available.</div> : <div className="grid gap-5 lg:grid-cols-12 lg:items-start lg:gap-7">
      <main ref={sectionTopRef} className="min-w-0 space-y-4 scroll-mt-32 sm:space-y-5 lg:col-span-8"><label className="relative block"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-2xl border border-bg-border bg-bg-white py-3 pl-11 pr-4 text-sm text-text-primary outline-none focus:border-primary" placeholder="Search all moving items..." /></label>
        {normalizedSearch && !allSearchMatches.length && <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-black text-amber-900">Item not found?</p><p className="mt-1 text-xs font-semibold text-amber-700">Let us know about "{debouncedSearch.trim()}" and our team will review it.</p>{notFoundSubmitted === debouncedSearch.trim() && <p className="mt-1 text-xs font-black text-emerald-700">Submitted. Thank you.</p>}</div><button type="button" onClick={handleMissingItemSubmit} disabled={notFoundSubmitting || notFoundSubmitted === debouncedSearch.trim()} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-amber-700 disabled:opacity-60"><Send className="h-3.5 w-3.5" />Submit</button></div>}
        <div className="booking-category-tabs scrollbar-none flex w-full max-w-full snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain pb-2 pr-[12vw] sm:pr-2">{sections.map((entry, index) => <button key={entry._id} ref={(node) => { tabRefs.current[entry._id] = node; }} onClick={() => goToSection(entry._id)} className={`inline-flex min-h-12 min-w-[9.25rem] shrink-0 snap-start items-center justify-center gap-2 whitespace-nowrap rounded-2xl px-4 py-2.5 text-sm font-black transition active:scale-[.98] ${section?._id === entry._id ? 'bg-primary text-white shadow-sky' : 'border border-bg-border bg-bg-white text-text-secondary hover:border-primary/30 hover:text-primary hover:shadow-xs'}`}><CatalogIcon icon={entry.icon} alt="" className="h-7 w-7 shrink-0" priority={index < 4} sizes="28px" />{displaySectionName(entry, `Section ${index + 1}`)}</button>)}</div>
        {catalogFetching && !sections.length ? <div className="grid min-h-60 place-items-center rounded-3xl border border-bg-border"><Spinner size="md" /></div> : <div className="overflow-hidden"><AnimatePresence initial={false} mode="wait" custom={sectionDirection}><motion.div key={section?._id || activeSection || 'section'} custom={sectionDirection} initial={prefersReducedMotion ? false : { opacity: 0, x: sectionDirection > 0 ? 36 : -36 }} animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }} exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: sectionDirection > 0 ? -36 : 36 }} transition={{ duration: 0.24, ease: 'easeOut' }} className="space-y-3 sm:space-y-4">{groups.map((group, groupIndex) => { const open = openGroupId === group._id; const selectedInGroup = selectedCountByGroup.get(String(group._id)) || 0; return <section key={group._id} ref={(node) => { groupRefs.current[group._id] = node; }} className="booking-group-card scroll-mt-28 overflow-hidden rounded-2xl border border-sky-100 bg-bg-white shadow-xs sm:scroll-mt-32 sm:rounded-3xl"><button type="button" onClick={() => setOpenGroupId((current) => (current === group._id ? '' : group._id))} className="booking-group-toggle flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition hover:bg-sky-50/70 sm:px-4 sm:py-3"><span className="flex min-w-0 items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-soft/25 text-primary dark:shadow-[0_10px_18px_rgba(0,0,0,0.22)] sm:h-10 sm:w-10"><CatalogIcon icon={group.icon || section?.icon} alt="" className="h-8 w-8 sm:h-9 sm:w-9" priority={groupIndex < 3} sizes="36px" /></span><span className="min-w-0"><span className="flex min-w-0 items-center gap-2"><span className="block truncate text-sm font-semibold text-text-primary">{group.name}</span>{!open && selectedInGroup > 0 && <span className="grid h-6 min-w-6 shrink-0 place-items-center rounded-full bg-primary px-1.5 text-xs font-semibold leading-none text-white shadow-sky-sm">{selectedInGroup}</span>}</span><small className="font-medium text-text-tertiary">{group.items?.length || 0} choices</small></span></span>{open ? <ChevronDown className="h-4 w-4 shrink-0 text-primary" /> : <ChevronRight className="h-4 w-4 shrink-0 text-text-tertiary" />}</button>{open && <div className="booking-item-list grid gap-2 border-t border-sky-100 bg-gradient-to-b from-sky-50/60 to-white p-2.5 sm:grid-cols-2 sm:gap-3 sm:p-3">{group.items?.map((item) => { const size = primarySize(item); if (!size) return null; const key = itemKey(item._id, size); const qty = quantity(key); const highlighted = highlightedIds.has(item._id); return <article key={item._id} ref={(node) => { itemRefs.current[item._id] = node; }} className={`booking-item-row group relative h-full overflow-hidden rounded-xl border bg-bg-white px-3 py-2.5 transition duration-300 hover:-translate-y-0.5 hover:shadow-sky active:scale-[.99] sm:rounded-2xl sm:py-3.5 ${highlighted ? 'border-amber-400 shadow-[0_0_0_4px_rgba(251,191,36,.25)]' : qty ? 'border-primary/40 bg-primary-soft/70 shadow-xs' : 'border-bg-border hover:border-primary/30'}`}><div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-50/70 via-white to-orange-50/30 opacity-0 transition-opacity group-hover:opacity-100" /><div className="booking-item-content relative z-10"><span className="booking-item-main"><h4 className="min-w-0 pr-1 text-sm font-normal leading-snug text-text-primary line-clamp-2">{item.name}</h4></span>{qty ? <div className="booking-item-qty"><button type="button" onClick={() => changeQuantity(item, size, group, -1)} className="grid h-9 w-9 place-items-center rounded-lg bg-bg-white text-text-primary transition hover:text-primary sm:h-10 sm:w-10"><Minus className="h-3.5 w-3.5" /></button><strong className="min-w-5 text-center text-sm font-semibold text-primary">{qty}</strong><button type="button" onClick={() => changeQuantity(item, size, group, 1)} className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-white transition hover:bg-primary-dark sm:h-10 sm:w-10"><Plus className="h-3.5 w-3.5" /></button></div> : <button type="button" onClick={() => changeQuantity(item, size, group, 1)} className="booking-item-add">Add</button>}</div></article>; })}</div>}</section>; })}{!groups.length && <div className="rounded-2xl border border-dashed border-bg-border p-10 text-center text-sm font-semibold text-text-tertiary">No matching items in this category.</div>}</motion.div></AnimatePresence></div>}
        {nextSection && <button type="button" onClick={() => goToSection(nextSection._id)} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary-soft px-5 py-4 text-sm font-black text-primary transition hover:bg-primary hover:text-white">Next: {displaySectionName(nextSection)}<ArrowRight className="h-4 w-4" /></button>}
      </main>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:col-span-4">{!showCartBar && <div className="rounded-3xl border border-bg-border bg-bg-white p-5 shadow-sm"><div className="flex items-center justify-between border-b border-bg-border pb-4"><h4 className="flex items-center gap-2 text-sm font-black text-text-primary"><ShoppingCart className="h-4 w-4 text-primary" />Selected ({totalCount})</h4>{selectedItems.length > 0 && <button type="button" onClick={() => setSelectedItems([])} className="text-xs font-bold text-red-500">Clear all</button>}</div>{selectedItems.length ? <div className="mt-4 max-h-72 space-y-2 overflow-y-auto">{selectedItems.map((item) => <div key={item.itemKey || item.key || `${item.name}-${item.tag}`} className="flex items-center justify-between gap-3 rounded-xl bg-bg-section p-3"><div className="min-w-0 flex-1"><strong className="block truncate text-xs text-text-primary">{item.name}</strong><span className="text-[10px] font-semibold text-text-tertiary">Qty {item.quantity}</span></div><button type="button" onClick={() => setSelectedItems((list) => list.filter((entry) => entry !== item))} className="text-red-400"><Trash2 className="h-4 w-4" /></button></div>)}</div> : <p className="py-8 text-center text-xs font-semibold text-text-tertiary">Your selected items will appear here.</p>}<p className="mt-4 border-t border-bg-border pt-4 text-[11px] font-semibold leading-5 text-text-tertiary">Final review will show the quote after allowances are applied.</p></div>}
        {isIntercity && <div className={`rounded-3xl border p-5 ${insuranceSelected ? 'border-emerald-300 bg-emerald-50' : 'border-bg-border bg-bg-white'}`}><div className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" /><div><h4 className="text-sm font-black text-text-primary">Cargo Transit Insurance</h4><p className="mt-1 text-xs leading-5 text-text-secondary">Optional transit protection for your selected move.</p></div></div><button type="button" onClick={() => setInsuranceSelected((value) => !value)} className={`mt-4 w-full rounded-xl py-2.5 text-xs font-black ${insuranceSelected ? 'bg-emerald-600 text-white' : 'border border-emerald-200 text-emerald-700'}`}>{insuranceSelected ? 'Insurance selected' : 'Add insurance'}</button></div>}
      </aside>
    </div>}

    {showCartBar && totalCount > 0 ? (
      <ItemCartBar
        totalCount={totalCount}
        cartOpen={cartOpen}
        onViewCart={() => setCartOpen(true)}
        onCloseCart={() => setCartOpen(false)}
        onProceed={handlePrimaryAction}
        onBack={handleBack}
        actionLabel={nextSection ? 'Next' : 'Proceed'}
        cartGroups={cartGroups}
      />
    ) : (
      <BookingActionBar onBack={handleBack} onNext={handlePrimaryAction} nextLabel={nextSection ? `Next: ${displaySectionName(nextSection)}` : 'Continue'} />
    )}
  </div>;
}

function ItemCartBar({ totalCount, cartOpen, onViewCart, onCloseCart, onProceed, onBack, actionLabel, cartGroups }) {
  return (
    <>
      <div aria-hidden="true" className="h-32 shrink-0 sm:h-28" />
      <footer className="fixed inset-x-0 bottom-0 z-50 border-t border-bg-border bg-bg-white/95 px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] shadow-[0_-16px_40px_rgba(15,23,42,.12)] backdrop-blur sm:left-1/2 sm:right-auto sm:bottom-4 sm:w-[min(72rem,calc(100%-2rem))] sm:-translate-x-1/2 sm:rounded-2xl sm:border">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <button type="button" onClick={onBack} className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-2xl border border-bg-border bg-bg-white px-3 text-xs font-bold text-text-secondary transition hover:text-primary sm:min-h-12 sm:rounded-xl sm:px-4 sm:text-sm">
            Back
          </button>
          <div className="min-w-0">
            <strong className="block truncate text-base font-black text-text-primary sm:text-lg">{totalCount} Item{totalCount === 1 ? '' : 's'} added</strong>
            <button type="button" onClick={onViewCart} className="mt-1 inline-flex items-center gap-1 text-sm font-black text-primary">View cart <ChevronDown className="h-4 w-4 rotate-180" /></button>
          </div>
          <button type="button" onClick={onProceed} className="btn-sky inline-flex min-h-12 shrink-0 items-center justify-center rounded-2xl px-7 text-sm font-black sm:px-10 sm:text-base">{actionLabel}</button>
        </div>
      </footer>
      {cartOpen && <ItemCartDrawer totalCount={totalCount} groups={cartGroups} onClose={onCloseCart} onProceed={onProceed} actionLabel={actionLabel} />}
    </>
  );
}

function ItemCartDrawer({ totalCount, groups, onClose, onProceed, actionLabel }) {
  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/45 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="Selected item cart" onClick={onClose}>
      <button type="button" onClick={onClose} className="absolute right-5 top-5 grid h-12 w-12 place-items-center rounded-full bg-white text-text-primary shadow-card" aria-label="Close cart"><X className="h-6 w-6" /></button>
      <div className="absolute inset-x-0 bottom-0 flex max-h-[50svh] flex-col overflow-hidden rounded-t-3xl bg-bg-white shadow-[0_-24px_70px_rgba(15,23,42,.22)]" onClick={(event) => event.stopPropagation()}>
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-bg-border bg-bg-white px-4 py-3">
          <h3 className="text-base font-semibold text-text-primary sm:text-lg"><span className="font-black text-primary">{totalCount}</span> Item{totalCount === 1 ? '' : 's'} added</h3>
          <button type="button" onClick={onProceed} className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sky-sm">{actionLabel}</button>
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-3 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:px-4">
          {groups.map((section) => (
            <section key={section.key} className="space-y-2">
              <h4 className="px-1 text-sm font-semibold text-text-secondary">{section.name}</h4>
              <div className="space-y-2">
                {section.groups.map((group) => (
                  <div key={group.key} className="rounded-2xl bg-bg-section/85 p-2.5 ring-1 ring-sky-100 dark:bg-bg-muted dark:ring-slate-700">
                    <h5 className="px-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary">{group.name}</h5>
                    <div className="divide-y divide-bg-border/60 overflow-hidden rounded-xl bg-bg-white dark:divide-slate-700 dark:bg-slate-800">
                      {group.items.map((item) => (
                      <div key={item.itemKey || item.key || item.name} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-2.5 py-2">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary-soft/35 text-primary">{item.icon ? <CatalogIcon icon={item.icon} alt="" className="h-7 w-7" sizes="28px" /> : <Package className="h-4 w-4" />}</span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-normal text-text-primary">{cleanText(item.name)}</span>
                        </span>
                        <span className="shrink-0 text-sm font-semibold text-text-secondary">x {Number(item.quantity || 0)}</span>
                      </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export { ItemSelectionStep };
