'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Check, Sparkles } from 'lucide-react';
import Spinner from '@ui/Spinner';
import { useAvailableAddons } from '@hooks/useAddons';
import { useBookingStore } from '@tithi/store/bookingStore';
import BookingActionBar from './BookingActionBar';

const SERVICE_TYPES = { local: 'local_shifting', intercity: 'intercity_moving', local_shifting: 'local_shifting', intercity_moving: 'intercity_moving' };
const selectedItemId = (item) => String(item.itemId || item._id || item.id || '');
const selectedGroupId = (item) => String(item.groupId || item.group?._id || item.group?.id || '');
const selectedCategoryId = (item) => String(item.sectionId || item.categoryId || item.category?._id || item.category?.id || '');
const sameJson = (left, right) => JSON.stringify(left || null) === JSON.stringify(right || null);

function AddonIcon({ icon, priority = false, className = 'h-12 w-12', sizes = '48px' }) {
  return icon ? (
    <Image
      src={icon}
      alt=""
      width={160}
      height={96}
      priority={priority}
      sizes={sizes}
      className={`${className} rounded-lg object-cover dark:drop-shadow-[0_10px_18px_rgba(0,0,0,0.32)]`}
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
  const featuredAddons = useMemo(() => addons.filter((addon) => addon.isFeatured), [addons]);
  const regularAddons = useMemo(() => addons.filter((addon) => !addon.isFeatured), [addons]);
  const [selected, setSelected] = useState(initialData.specialServices || []);
  const featuredScrollerRef = useRef(null);
  const [featuredPage, setFeaturedPage] = useState(0);
  const [featuredPages, setFeaturedPages] = useState(1);
  const initialServicesKey = JSON.stringify(initialData.specialServices || []);

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

  const handleNext = () => onSubmit({ specialServices: selected.map((item) => { const addon = addons.find((entry) => entry._id === item.addonId || entry.key === item.key || entry.name === item.name); return addon ? addonSnapshot(addon) : item; }) });

  return <div className="flex min-h-[calc(100svh-18rem)] min-w-0 flex-col gap-4 pb-24 text-left sm:min-h-[calc(100svh-20rem)] sm:gap-5 sm:pb-4"><header className="flex min-w-0 items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary-soft/40 text-primary dark:shadow-[0_10px_18px_rgba(0,0,0,0.22)]"><Sparkles className="h-6 w-6" /></span><div className="min-w-0"><h3 className="text-2xl font-semibold text-text-primary">Add-on Services</h3></div></header>
    <section className="mx-auto flex min-h-0 w-full min-w-0 flex-1 flex-col rounded-3xl border border-sky-100 bg-bg-white p-2.5 shadow-card sm:p-3">
      {isLoading ? <div className="grid min-h-52 flex-1 place-items-center rounded-2xl border border-bg-border"><Spinner size="md" /></div> : isError ? <div className="flex min-h-52 flex-1 flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-8 text-center"><p className="text-sm font-semibold text-red-600">Could not load add-on services.</p><button onClick={() => refetch()} className="mt-2 text-sm font-semibold text-primary">Try again</button></div> : addons.length === 0 ? <div className="flex min-h-52 flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-bg-border px-5 text-center"><Sparkles className="h-9 w-9 text-primary/50" /><h4 className="mt-3 text-base font-semibold text-text-primary">No add-on service available</h4><p className="mt-1 text-sm text-text-secondary">There are no add-ons for your selected items. You can continue.</p></div> : <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
        {featuredAddons.length > 0 && <div className="min-w-0 overflow-hidden">
          <div ref={featuredScrollerRef} className="scrollbar-none -mx-1 flex max-w-full snap-x snap-proximity touch-pan-x gap-2 overflow-x-auto overscroll-x-contain px-1 pb-1.5">
            {featuredAddons.map((addon, index) => <AddonCard key={addon._id} addon={addon} active={isSelected(addon)} onToggle={toggleAddon} priority={index < 3} featured />)}
          </div>
          {featuredPages > 1 && <div className="mt-0.5 flex justify-center gap-1.5">{Array.from({ length: featuredPages }, (_, index) => <span key={index} className={`h-1.5 rounded-full transition-all ${featuredPage === index ? 'w-5 bg-primary' : 'w-1.5 bg-bg-border'}`} />)}</div>}
        </div>}
        <div className="min-w-0">
          <h4 className="mb-2 text-lg font-semibold text-text-primary">Recommended Add-ons</h4>
          {regularAddons.length === 0 ? <p className="rounded-2xl border border-dashed border-bg-border p-6 text-center text-sm font-semibold text-text-secondary">No regular add-ons available.</p> : <div className="grid min-w-0 content-start gap-2.5 pr-0 sm:gap-3 sm:pr-1 md:grid-cols-2">{regularAddons.map((addon, index) => <AddonCard key={addon._id} addon={addon} active={isSelected(addon)} onToggle={toggleAddon} priority={featuredAddons.length === 0 && index < 4} />)}</div>}
        </div>
      </div>}
    </section>
    <BookingActionBar onBack={onBack} onNext={handleNext} nextLabel="Continue" />
  </div>;
}

function AddonCard({ addon, active, onToggle, priority = false, featured = false }) {
  return (
    <article className={`${featured ? 'min-h-[10rem] w-[calc((100%-0.5rem)/2)] max-w-none shrink-0 snap-start sm:w-[min(58vw,18rem)] sm:max-w-[18rem] md:w-[min(36vw,18rem)]' : 'min-h-32'} flex min-w-0 flex-col justify-between rounded-2xl border p-2.5 transition-colors sm:p-4 ${active ? 'border-primary/20 bg-bg-white shadow-[0_14px_30px_rgba(15,23,42,0.08)] ring-1 ring-primary/10' : 'border-bg-border bg-bg-white hover:border-primary/20'}`}>
      <div className="min-w-0">
        <div className={`flex min-w-0 items-start gap-2 ${featured ? 'flex-col' : 'justify-between'}`}>
          <div className={`flex min-w-0 items-start gap-3 ${featured ? 'w-full flex-col' : ''}`}>
            {addon.icon && <span className={`${featured ? 'h-[4.5rem] w-full sm:h-24' : 'h-11 w-11 sm:h-12 sm:w-12'} grid shrink-0 place-items-center overflow-hidden rounded-lg bg-primary-soft/30 dark:shadow-[0_10px_18px_rgba(0,0,0,0.22)]`}><AddonIcon icon={addon.icon} priority={priority} className={featured ? 'h-full w-full' : 'h-11 w-11 sm:h-12 sm:w-12'} sizes={featured ? '(max-width: 640px) 48vw, 18rem' : '48px'} /></span>}
            <h4 className="min-w-0 break-words text-sm font-semibold text-text-primary sm:text-base">{addon.name}</h4>
          </div>
        </div>
        {addon.description && <p className="mt-1 line-clamp-2 text-xs font-normal leading-5 text-text-secondary">{addon.description}</p>}
      </div>
      <div className="mt-2.5 flex justify-end border-t border-bg-border/60 pt-2">
        <button type="button" onClick={() => onToggle(addon)} className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${active ? 'border-bg-border bg-bg-muted text-text-primary shadow-sm' : 'border-primary/20 bg-bg-white text-primary hover:border-primary/30 hover:shadow-sm'}`}>{active && <Check className="h-3.5 w-3.5" />}{active ? 'Selected' : 'Add service'}</button>
      </div>
    </article>
  );
}

export { SpecialServicesStep };
