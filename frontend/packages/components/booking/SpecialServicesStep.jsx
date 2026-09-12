'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Check, Sparkles } from 'lucide-react';
import Spinner from '@ui/Spinner';
import { useAvailableAddons } from '@hooks/useAddons';
import { useBookingStore } from '@tithi/store/bookingStore';
import { calculateAddOnBreakdown, calculateBookingPrice } from '@tithi/utils/pricing';
import { formatCurrency } from '@tithi/utils/utils';
import BookingActionBar from './BookingActionBar';

const SERVICE_TYPES = { local: 'local_shifting', intercity: 'intercity_moving', local_shifting: 'local_shifting', intercity_moving: 'intercity_moving' };
const selectedItemId = (item) => String(item.itemId || item._id || item.id || '');
const selectedGroupId = (item) => String(item.groupId || item.group?._id || item.group?.id || '');
const selectedCategoryId = (item) => String(item.sectionId || item.categoryId || item.category?._id || item.category?.id || '');
const sameJson = (left, right) => JSON.stringify(left || null) === JSON.stringify(right || null);
const normalizeAddonName = (value = '') => String(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const PACKING_ADDON_NAMES = new Set(['single layer packing', 'multi layer packing', 'no packing']);
const isPackingAddon = (addon = {}) => PACKING_ADDON_NAMES.has(normalizeAddonName(addon.name || addon.key));
const isDefaultPackingAddon = (addon = {}) => normalizeAddonName(addon.name || addon.key) === 'single layer packing';

function AddonIcon({ icon, priority = false, className = 'h-12 w-12', sizes = '48px' }) {
  return icon ? (
    <Image
      src={icon}
      alt=""
      width={160}
      height={96}
      priority={priority}
      loading={priority ? undefined : 'eager'}
      decoding="async"
      sizes={sizes}
      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      className={`${className} rounded-lg object-contain dark:drop-shadow-[0_10px_18px_rgba(0,0,0,0.32)]`}
    />
  ) : null;
}

export default function SpecialServicesStep({ onSubmit, onBack, initialData = {}, serviceType }) {
  const updateBookingData = useBookingStore((state) => state.updateBookingData);
  const selectedItems = initialData.items || [];
  const selectedItemQuantityKey = selectedItems.map((item) => `${item.itemId || item._id || item.name}:${item.groupId || ''}:${item.quantity || 0}`).join('|');
  const itemIds = [...new Set(selectedItems.map((item) => item.itemId).filter(Boolean))];
  const groupIds = [...new Set(selectedItems.map((item) => item.groupId).filter(Boolean))];
  const categoryIds = [...new Set(selectedItems.map((item) => item.sectionId || item.categoryId).filter(Boolean))];
  const apiServiceType = SERVICE_TYPES[serviceType] || serviceType;
  const { data = [], isLoading, isError, refetch } = useAvailableAddons({ serviceType: apiServiceType, ...(itemIds.length ? { itemIds } : {}), ...(groupIds.length ? { groupIds } : {}), ...(categoryIds.length ? { categoryIds } : {}) });
  const addons = useMemo(() => Array.isArray(data) ? data : [], [data]);
  const packingAddons = useMemo(() => addons.filter(isPackingAddon), [addons]);
  const featuredAddons = useMemo(() => addons.filter((addon) => addon.isFeatured && !isPackingAddon(addon)), [addons]);
  const regularAddons = useMemo(() => addons.filter((addon) => !addon.isFeatured && !isPackingAddon(addon)), [addons]);
  const [selected, setSelected] = useState(initialData.specialServices || []);
  const packingScrollerRef = useRef(null);
  const [packingPage, setPackingPage] = useState(0);
  const [packingPages, setPackingPages] = useState(1);
  const featuredScrollerRef = useRef(null);
  const [featuredPage, setFeaturedPage] = useState(0);
  const [featuredPages, setFeaturedPages] = useState(1);
  const initialServicesKey = JSON.stringify(initialData.specialServices || []);
  const addOnBaseAmount = useMemo(() => {
    const pricing = calculateBookingPrice({ ...initialData, serviceType: apiServiceType, specialServices: [] });
    return Number(pricing.breakdown?.addOnBaseAmount || 0);
  }, [apiServiceType, initialData]);

  useEffect(() => {
    const nextServices = initialData.specialServices || [];
    setSelected((current) => (sameJson(current, nextServices) ? current : nextServices));
  // Keep local selections aligned when the hydrated draft arrives after mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialServicesKey]);

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
    const unit = String(addon.unit || 'global').toLowerCase();
    const triggerItemIds = new Set(addonItemIds(addon));
    const triggerGroupIds = new Set(addonGroupIds(addon));
    const triggerCategoryIds = new Set(addonCategoryIds(addon));
    if (unit === 'per_group' && triggerGroupIds.size) {
      return selectedItems.filter((item) => triggerGroupIds.has(selectedGroupId(item)));
    }
    if (unit === 'per_category' && triggerCategoryIds.size) {
      return selectedItems.filter((item) => triggerCategoryIds.has(selectedCategoryId(item)));
    }
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
    const totalMatchedQuantity = () => matchedItems.reduce((sum, item) => sum + Math.max(0, Number(item.quantity || 0)), 0);
    if (['per_item', 'per_unit', 'per_group', 'per_category'].includes(unit)) {
      return Math.max(1, totalMatchedQuantity());
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
    const [line] = calculateAddOnBreakdown([{ addonId: addon._id, key: addon.key, name: addon.name, unit, unitPrice: price, price, quantity }], addOnBaseAmount);
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
      addOnBaseAmount: line?.addOnBaseAmount,
      rawPercentageAmount: line?.rawPercentageAmount,
      total: Number(line?.total ?? (quantity * price)),
      matchedTriggerCategoryIds: addonCategoryIds(addon),
      matchedTriggerGroupIds: addonGroupIds(addon),
      matchedTriggerItemIds: addonItemIds(addon),
    };
  };
  useEffect(() => {
    if (!packingAddons.length) return;
    setSelected((current) => {
      const currentPacking = current.find(isPackingAddon);
      const nextPackingAddon = currentPacking
        ? packingAddons.find((addon) => addon._id === currentPacking.addonId || addon.key === currentPacking.key || addon.name === currentPacking.name)
        : packingAddons.find(isDefaultPackingAddon) || packingAddons[0];
      if (!nextPackingAddon) return current;
      const next = [
        ...current.filter((item) => !isPackingAddon(item)),
        addonSnapshot(nextPackingAddon),
      ];
      return sameJson(current, next) ? current : next;
    });
  // Keep exactly one packing option selected while preserving the existing add-on data model.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packingAddons, selectedItemQuantityKey]);
  useEffect(() => {
    setSelected((current) => {
      if (!current.length || !addons.length) return current;
      const next = current.map((item) => {
        const addon = addons.find((entry) => entry._id === item.addonId || entry.key === item.key || entry.name === item.name);
        return addon ? addonSnapshot(addon) : item;
      });
      return JSON.stringify(next) === JSON.stringify(current) ? current : next;
    });
  }, [addons, selectedItemQuantityKey]);
  useEffect(() => {
    const currentData = useBookingStore.getState().bookingData || {};
    if (sameJson(currentData.specialServices || [], selected)) return;
    updateBookingData({ specialServices: selected });
  }, [selected, updateBookingData]);
  const toggleAddon = (addon) => {
    setSelected((current) => {
      if (isPackingAddon(addon)) {
        const currentPacking = current.find(isPackingAddon);
        if (currentPacking && (currentPacking.addonId === addon._id || currentPacking.key === addon.key || currentPacking.name === addon.name)) return current;
        return [
          ...current.filter((item) => !isPackingAddon(item)),
          addonSnapshot(addon),
        ];
      }
      const index = current.findIndex((item) => item.addonId === addon._id || item.key === addon.key || item.name === addon.name);
      if (index >= 0) return current.filter((_, itemIndex) => itemIndex !== index);
      return [...current, addonSnapshot(addon)];
    });
  };
  useEffect(() => {
    const scroller = featuredScrollerRef.current;
    if (!scroller || !featuredAddons.length) return undefined;
    const updateCarouselState = () => {
      const maxScroll = Math.max(1, scroller.scrollWidth - scroller.clientWidth);
      const pages = Math.max(1, Math.ceil(scroller.scrollWidth / Math.max(1, scroller.clientWidth)));
      setFeaturedPages(pages);
      setFeaturedPage(Math.min(pages - 1, Math.round((scroller.scrollLeft / maxScroll) * (pages - 1))));
    };
    updateCarouselState();
    scroller.addEventListener('scroll', updateCarouselState, { passive: true });
    window.addEventListener('resize', updateCarouselState);
    return () => {
      scroller.removeEventListener('scroll', updateCarouselState);
      window.removeEventListener('resize', updateCarouselState);
    };
  }, [featuredAddons.length]);
  useEffect(() => {
    const scroller = packingScrollerRef.current;
    if (!scroller || !packingAddons.length) return undefined;
    const updateCarouselState = () => {
      const maxScroll = Math.max(1, scroller.scrollWidth - scroller.clientWidth);
      const pages = Math.max(1, Math.ceil(scroller.scrollWidth / Math.max(1, scroller.clientWidth)));
      setPackingPages(pages);
      setPackingPage(Math.min(pages - 1, Math.round((scroller.scrollLeft / maxScroll) * (pages - 1))));
    };
    updateCarouselState();
    scroller.addEventListener('scroll', updateCarouselState, { passive: true });
    window.addEventListener('resize', updateCarouselState);
    return () => {
      scroller.removeEventListener('scroll', updateCarouselState);
      window.removeEventListener('resize', updateCarouselState);
    };
  }, [packingAddons.length]);

  const handleNext = () => onSubmit({ specialServices: selected.map((item) => { const addon = addons.find((entry) => entry._id === item.addonId || entry.key === item.key || entry.name === item.name); return addon ? addonSnapshot(addon) : item; }) });

  return <div className="flex min-h-[calc(100svh-18rem)] min-w-0 flex-col gap-4 pb-24 text-left sm:min-h-[calc(100svh-20rem)] sm:gap-5 sm:pb-4"><header className="flex min-w-0 items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary-soft/40 text-primary dark:shadow-[0_10px_18px_rgba(0,0,0,0.22)]"><Sparkles className="h-6 w-6" /></span><div className="min-w-0"><h3 className="text-2xl font-semibold text-text-primary">Add-on Services</h3></div></header>
    <section className="mx-auto flex min-h-0 w-full min-w-0 flex-1 flex-col rounded-3xl border border-sky-100 bg-bg-white p-2.5 shadow-card sm:p-3">
      {isLoading ? <div className="grid min-h-52 flex-1 place-items-center rounded-2xl border border-bg-border"><Spinner size="md" /></div> : isError ? <div className="flex min-h-52 flex-1 flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-8 text-center"><p className="text-sm font-semibold text-red-600">Could not load add-on services.</p><button onClick={() => refetch()} className="mt-2 text-sm font-semibold text-primary">Try again</button></div> : addons.length === 0 ? <div className="flex min-h-52 flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-bg-border px-5 text-center"><Sparkles className="h-9 w-9 text-primary/50" /><h4 className="mt-3 text-base font-semibold text-text-primary">No add-on service available</h4><p className="mt-1 text-sm text-text-secondary">There are no add-ons for your selected items. You can continue.</p></div> : <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
        {packingAddons.length > 0 && <div className="h-auto min-w-0 overflow-y-visible">
          <h4 className="mb-2 text-lg font-semibold text-text-primary">Packing Option</h4>
          <div ref={packingScrollerRef} className="scrollbar-none -mx-1 flex h-auto min-w-0 snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-visible overscroll-x-contain px-1 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0 sm:pr-1">
            {packingAddons.map((addon, index) => <AddonCard key={addon._id} addon={addon} active={isSelected(addon)} onToggle={toggleAddon} priority={featuredAddons.length === 0 && index < 3} getSnapshot={addonSnapshot} singleSelect />)}
          </div>
          {packingPages > 1 && <div className="mt-0.5 flex justify-center gap-1.5 sm:hidden">{Array.from({ length: packingPages }, (_, index) => <span key={index} className={`h-1.5 rounded-full transition-all ${packingPage === index ? 'w-5 bg-primary' : 'w-1.5 bg-bg-border'}`} />)}</div>}
        </div>}
        {featuredAddons.length > 0 && <div className="min-w-0 overflow-hidden">
          <div ref={featuredScrollerRef} className="scrollbar-none -mx-1 flex max-w-full snap-x snap-mandatory touch-pan-x gap-3 overflow-x-auto overscroll-x-contain px-1 pb-2">
            {featuredAddons.map((addon, index) => <AddonCard key={addon._id} addon={addon} active={isSelected(addon)} onToggle={toggleAddon} priority={index < 3} featured getSnapshot={addonSnapshot} />)}
          </div>
          {featuredPages > 1 && <div className="mt-0.5 flex justify-center gap-1.5">{Array.from({ length: featuredPages }, (_, index) => <span key={index} className={`h-1.5 rounded-full transition-all ${featuredPage === index ? 'w-5 bg-primary' : 'w-1.5 bg-bg-border'}`} />)}</div>}
        </div>}
        <div className="min-w-0">
          <h4 className="mb-2 text-lg font-semibold text-text-primary">Recommended Add-ons</h4>
          {regularAddons.length === 0 ? <p className="rounded-2xl border border-dashed border-bg-border p-6 text-center text-sm font-semibold text-text-secondary">No regular add-ons available.</p> : <div className="grid min-w-0 content-start gap-2.5 pr-0 sm:gap-3 sm:pr-1 md:grid-cols-2">{regularAddons.map((addon, index) => <AddonCard key={addon._id} addon={addon} active={isSelected(addon)} onToggle={toggleAddon} priority={featuredAddons.length === 0 && index < 4} getSnapshot={addonSnapshot} />)}</div>}
        </div>
      </div>}
    </section>
    <BookingActionBar onBack={onBack} onNext={handleNext} nextLabel="Continue" />
  </div>;
}

function AddonCard({ addon, active, onToggle, priority = false, featured = false, getSnapshot, singleSelect = false }) {
  const snapshot = getSnapshot(addon);
  const sizeClass = featured
    ? 'min-h-[9.5rem] w-[min(86vw,24rem)] max-w-none shrink-0 snap-center sm:w-[min(72vw,28rem)] md:w-[min(58vw,30rem)] lg:w-[min(48vw,32rem)]'
    : singleSelect
      ? 'w-[44vw] max-w-[12rem] shrink-0 snap-start sm:w-full sm:max-w-none'
      : 'min-h-32';
  const paddingClass = singleSelect ? 'px-1 py-1.5 sm:px-2 sm:py-2 lg:px-1.5 lg:py-1.5 xl:px-2 xl:py-2' : featured ? 'p-3 sm:p-3.5' : 'p-2.5 sm:p-4';
  const activeClass = active
    ? singleSelect
      ? 'border-primary bg-primary-soft/30 shadow-[0_14px_30px_rgba(15,23,42,0.08)] ring-2 ring-primary/20'
      : 'border-primary/20 bg-bg-white shadow-[0_14px_30px_rgba(15,23,42,0.08)] ring-1 ring-primary/10'
    : 'border-bg-border bg-bg-white hover:border-primary/20';
  const iconWrapClass = featured
    ? 'h-24 w-28 p-1 sm:w-32'
    : singleSelect
      ? 'h-32 w-full max-w-32 p-0.5 sm:h-40 sm:max-w-40 md:h-44 md:max-w-44 lg:h-32 lg:max-w-32 xl:h-36 xl:max-w-36 2xl:h-40 2xl:max-w-40'
      : 'h-14 w-14 sm:h-12 sm:w-12';
  const iconOverflowClass = featured ? 'overflow-visible' : 'overflow-hidden';
  const buttonClass = singleSelect
    ? active
      ? 'border-primary bg-primary px-4 py-1 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(14,165,233,0.24)] transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] sm:text-sm'
      : 'border-primary/20 bg-bg-white px-6 py-1 text-sm font-semibold text-primary transition-all duration-200 hover:scale-[1.03] hover:border-primary/40 hover:bg-primary-soft/30 active:scale-[0.97] sm:text-sm'
    : active
      ? 'border-primary bg-primary px-4 py-1 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(14,165,233,0.24)] transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] sm:text-sm'
      : 'border-primary/20 bg-bg-white px-4 py-1 text-sm font-semibold text-primary transition-all duration-200 hover:scale-[1.03] hover:border-primary/40 hover:bg-primary-soft/30 active:scale-[0.97] sm:text-sm';

  if (singleSelect) {
    return (
      <article className={`${sizeClass} relative flex h-fit min-w-0 flex-col items-center gap-2 pt-8 sm:py-0 overflow-hidden rounded-2xl border ${paddingClass} transition-colors ${activeClass} sm:gap-3 lg:gap-2`}>
        <span className="absolute right-4 top-2 z-10 max-w-full rounded-full border border-primary/10 bg-bg-white/95 px-2 py-1 sm:px-4  sm:py-2 text-center font-mono text-[12px] font-black leading-none text-primary shadow-sm sm:text-sm">{formatCurrency(snapshot.total)}</span>
        {addon.icon && <span className={`${iconWrapClass} grid shrink-0 place-items-center ${iconOverflowClass} rounded-lg bg-primary-soft/30 dark:shadow-[0_10px_18px_rgba(0,0,0,0.22)]`}><AddonIcon icon={addon.icon} priority={priority} className="packing-addon-icon  h-full w-full" sizes="(max-width: 640px) 42vw, 12rem" /></span>}
        <div className="flex shrink-0 justify-center px-1">
          <button type="button" onClick={() => onToggle(addon)} className={`inline-flex max-w-full shrink-0 transform-gpu items-center rounded-lg border font-semibold ${buttonClass}`}>{active && <Check className="h-3.5 w-3.5" />}{active ? 'Selected' : 'Select'}</button>
        </div>
      </article>
    );
  }

  return (
    <article className={`${sizeClass} flex h-auto min-w-0 flex-col ${singleSelect ? 'justify-start gap-2 overflow-y-visible' : 'justify-between'} rounded-2xl border ${paddingClass} transition-colors ${activeClass}`}>
      <div className={`min-w-0 ${singleSelect ? 'shrink-0' : ''}`}>
        <div className={`flex min-w-0 gap-2 ${featured ? 'items-center' : singleSelect ? 'flex-col items-start' : 'items-start justify-between'}`}>
          <div className={`flex min-w-0 items-center gap-3 ${featured ? 'flex-1' : singleSelect ? 'w-full flex-col gap-1.5 text-center' : ''}`}>
            {addon.icon && <span className={`${iconWrapClass} grid shrink-0 place-items-center ${iconOverflowClass} rounded-lg bg-primary-soft/30 dark:shadow-[0_10px_18px_rgba(0,0,0,0.22)]`}><AddonIcon icon={addon.icon} priority={priority} className={featured ? 'h-full w-full' : singleSelect ? 'h-full w-full' : 'h-14 w-14 sm:h-12 sm:w-12'} sizes={featured ? '(max-width: 640px) 7rem, 8rem' : singleSelect ? '(max-width: 640px) 42vw, 12rem' : '56px'} /></span>}
            {!singleSelect && <h4 className="min-w-0 break-words text-sm font-semibold text-text-primary sm:text-base">{addon.name}</h4>}
          </div>
        </div>
        {addon.description && !singleSelect && <p className="mt-1 line-clamp-2 text-xs font-normal leading-5 text-text-secondary">{addon.description}</p>}
        {!singleSelect && <strong className="mt-2 block font-mono text-sm font-black text-primary">{formatCurrency(snapshot.total)}</strong>}
      </div>
      <div className={`flex ${singleSelect ? 'shrink-0 justify-center px-1' : 'mt-2.5 justify-end border-t border-bg-border/60 pt-2'}`}>
        <button type="button" onClick={() => onToggle(addon)} className={`inline-flex max-w-full shrink-0 transform-gpu items-center gap-1.5 rounded-lg border font-semibold ${buttonClass}`}>{active && <Check className="h-3.5 w-3.5" />}{active ? 'Selected' : singleSelect ? 'Select' : 'Add service'}</button>
      </div>
    </article>
  );
}

export { SpecialServicesStep };
