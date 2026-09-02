// src/components/admin/BookingEditModal.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Check, Clock, Edit3, Package, Sparkles, X } from 'lucide-react';
import { getBookingTimeSlot, toDateInputValue, getBookingScheduledDate } from '@tithi/utils/utils';
import { useItemCatalog } from '@hooks/useItems';
import { useAvailableAddons } from '@hooks/useAddons';
import { getPricing } from '@tithi/lib/api';
import { calculateBookingPrice } from '@tithi/utils/pricing';
import { serviceHasItemCatalog } from '@tithi/utils/serviceTypes';

const TIME_SLOTS = [
  { value: 'morning', label: 'Morning (7AM-11AM)' },
  { value: 'afternoon', label: 'Afternoon (12PM-4PM)' },
  { value: 'evening', label: 'Evening (5PM-8PM)' },
  { value: 'after_hours', label: 'After hours' },
];

const pricingLockFromBooking = (booking = {}) => {
  const pricing = booking.pricing || booking.quoteSnapshot?.pricing || {};
  const breakdown = pricing.breakdown || {};
  const serviceCharge = Number(pricing.serviceCharge || 0);
  const basePrice = Number(breakdown.basePrice ?? Math.max(0, serviceCharge
    - Number(breakdown.distanceCharge || 0)
    - Number(breakdown.floorTotalCharge || 0)
    - Number(breakdown.employeeTotal || 0)
    - Number(breakdown.truckTotal || 0)));
  return {
    enabled: true,
    basePrice,
    distanceCharge: Number(breakdown.distanceCharge || 0),
    pickupFloorCharge: Number(breakdown.pickupFloorCharge || 0),
    dropFloorCharge: Number(breakdown.dropFloorCharge || 0),
    floorTotalCharge: Number(breakdown.floorTotalCharge || 0),
    employeeTotal: Number(breakdown.employeeTotal || 0),
    truckTotal: Number(breakdown.truckTotal || 0),
    sundayHike: Number(breakdown.sundayHike || 0),
  };
};

export default function BookingEditModal({ booking, isOpen, onClose, onSave }) {
  const [form, setForm] = useState({
    scheduledDate: '',
    timeSlot: 'morning',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [pricingRules, setPricingRules] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const isItemBooking = serviceHasItemCatalog(booking?.serviceType);
  const { data: catalogSections = [] } = useItemCatalog({}, { enabled: Boolean(isOpen && isItemBooking) });
  const itemIds = [...new Set(selectedItems.map((item) => item.itemId).filter(Boolean))];
  const groupIds = [...new Set(selectedItems.map((item) => item.groupId).filter(Boolean))];
  const categoryIds = [...new Set(selectedItems.map((item) => item.sectionId || item.categoryId).filter(Boolean))];
  const addonServiceType = isItemBooking ? booking?.serviceType : '';
  const { data: availableAddons = [] } = useAvailableAddons({
    serviceType: addonServiceType,
    ...(itemIds.length ? { itemIds } : {}),
    ...(groupIds.length ? { groupIds } : {}),
    ...(categoryIds.length ? { categoryIds } : {}),
  });

  useEffect(() => {
    if (!booking) return;
    setForm({
      scheduledDate: toDateInputValue(getBookingScheduledDate(booking)),
      timeSlot: getBookingTimeSlot(booking) || 'morning',
      notes: booking.notes || booking.quoteSnapshot?.note || '',
    });
    setSelectedItems((booking.items || []).map((item) => ({
      ...item,
      itemId: item.itemId || item._id,
      sizeVariantId: item.options?.sizeVariantId || item.sizeVariantId || item.sizeId,
      groupId: item.options?.groupId || item.groupId,
      quantity: Number(item.quantity || 1),
      unitPrice: Number(item.unitPrice ?? item.price ?? 0),
      price: Number(item.unitPrice ?? item.price ?? 0),
      tag: item.sizeTag || item.tag || item.sizeKey,
    })));
    setSelectedAddons(booking.selectedAddons || []);
  }, [booking]);

  useEffect(() => {
    if (!isOpen || !isItemBooking) return;
    getPricing().then(setPricingRules).catch(() => setPricingRules([]));
  }, [isItemBooking, isOpen]);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  useEffect(() => {
    if (!isItemBooking || !catalogSections.length) return;
    const section = catalogSections.find((entry) => entry._id === selectedSectionId) || catalogSections[0];
    const group = (section.groups || []).find((entry) => entry._id === selectedGroupId) || section.groups?.[0];
    if (section?._id && section._id !== selectedSectionId) setSelectedSectionId(section._id);
    if (group?._id && group._id !== selectedGroupId) setSelectedGroupId(group._id);
  }, [catalogSections, isItemBooking, selectedGroupId, selectedSectionId]);

  const activeSection = (catalogSections || []).find((section) => section._id === selectedSectionId) || catalogSections?.[0];
  const activeGroups = activeSection?.groups || [];
  const activeGroup = activeGroups.find((group) => group._id === selectedGroupId) || activeGroups[0];
  const groupItems = (activeGroup?.items || []).map((item) => {
    const size = (item.sizes || []).find((entry) => entry.isActive !== false) || item.sizes?.[0];
    return size ? {
      itemId: item._id,
      itemKey: `${item._id}:${size._id || size.sizeId}`,
      name: item.name,
      category: activeSection?.name,
      sectionId: activeSection?._id,
      groupId: activeGroup?._id,
      group: activeGroup?.name,
      sizeVariantId: size._id,
      sizeId: size.sizeId?._id || size.sizeId,
      sizeKey: size.sizeKey || size.label,
      tag: size.sizeKey || size.label,
      quantity: 1,
      unitPrice: Number(size.price || 0),
      price: Number(size.price || 0),
    } : null;
  }).filter(Boolean);
  const selectedItemKeys = new Set(selectedItems.map((item) => `${item.itemId}:${item.sizeVariantId || item.options?.sizeVariantId || item.sizeId}`));
  const selectedAddonKeys = new Set(selectedAddons.map((addon) => String(addon.addonid || addon.addonId || addon._id || addon.key || addon.name)));
  const toggleItem = (item) => setSelectedItems((current) => {
    const key = `${item.itemId}:${item.sizeVariantId}`;
    const currentKeys = new Set(current.map((entry) => `${entry.itemId}:${entry.sizeVariantId || entry.options?.sizeVariantId || entry.sizeId}`));
    return currentKeys.has(key) ? current.filter((entry) => `${entry.itemId}:${entry.sizeVariantId || entry.options?.sizeVariantId || entry.sizeId}` !== key) : [...current, item];
  });
  const toggleAddon = (addon) => setSelectedAddons((current) => {
    const key = String(addon._id || addon.addonid || addon.key || addon.name);
    const currentKeys = new Set(current.map((entry) => String(entry.addonid || entry.addonId || entry._id || entry.key || entry.name)));
    if (currentKeys.has(key)) return current.filter((entry) => String(entry.addonid || entry.addonId || entry._id || entry.key || entry.name) !== key);
    return [...current, { addonid: addon._id, key: addon.key, name: addon.name, unit: addon.unit, quantity: 1, pricesnapshot: Number(addon.price || 0), price: Number(addon.price || 0) }];
  });
  const pricingRule = pricingRules.find((rule) => rule.serviceType === booking?.serviceType);
  const previewPricing = isItemBooking ? calculateBookingPrice({
    ...booking,
    items: selectedItems,
    specialServices: selectedAddons.map((addon) => ({ ...addon, addonId: addon.addonid || addon.addonId || addon._id, unitPrice: addon.pricesnapshot ?? addon.unitPrice ?? addon.price })),
    pricingRule,
    lockedPricing: pricingLockFromBooking(booking),
  }) : null;
  const liveTotal = previewPricing?.grandTotal ?? Number(booking?.totalAmount || booking?.pricing?.totalAmount || 0);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        ...booking,
        scheduledDate: form.scheduledDate,
        timeSlot: form.timeSlot,
        notes: form.notes,
        ...(isItemBooking ? { items: selectedItems, selectedAddons } : {}),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!booking) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white shadow-xl"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="flex items-center justify-between border-b border-bg-border p-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100">
                  <Edit3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-text-primary">Edit Booking</h2>
                  <p className="font-mono text-xs text-text-tertiary">{booking.bookingId || booking.bookingid}</p>
                </div>
              </div>
              <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl transition-colors hover:bg-bg-section">
                <X className="h-4 w-4 text-text-secondary" />
              </button>
            </div>

            <div className="px-6 pb-2 pt-4">
              <div className="rounded-xl border border-primary/15 bg-sky-50 p-3 text-sm">
                <p className="font-black text-text-primary">{booking.customerName || 'Customer not added'}</p>
                <p className="mt-0.5 font-mono text-xs text-text-secondary">{booking.mobile || '-'} / {booking.email || '-'}</p>
              </div>
            </div>

            <div className="flex flex-col gap-5 p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Date" icon={Calendar}>
                  <input type="date" value={form.scheduledDate} onChange={(event) => update('scheduledDate', event.target.value)} className="booking-input text-sm" />
                </Field>
                <Field label="Time Slot" icon={Clock}>
                  <select value={form.timeSlot} onChange={(event) => update('timeSlot', event.target.value)} className="booking-input text-sm">
                    {TIME_SLOTS.map((slot) => <option key={slot.value} value={slot.value}>{slot.label}</option>)}
                  </select>
                </Field>
              </div>

              <div className="h-px bg-bg-border" />

              {isItemBooking && (
                <>
                  <SelectionBlock
                    title="Booking Items"
                    icon={Package}
                    sections={catalogSections}
                    activeSection={activeSection}
                    activeGroups={activeGroups}
                    activeGroup={activeGroup}
                    groupItems={groupItems}
                    selectedKeys={selectedItemKeys}
                    getKey={(item) => `${item.itemId}:${item.sizeVariantId}`}
                    getMeta={(item) => `${item.group || item.category || 'Inventory'} / ${item.tag || item.sizeKey || 'Size'}`}
                    getPrice={(item) => item.unitPrice}
                    onToggle={toggleItem}
                    onSectionSelect={(sectionId) => {
                      const section = catalogSections.find((entry) => entry._id === sectionId);
                      setSelectedSectionId(sectionId);
                      setSelectedGroupId(section?.groups?.[0]?._id || '');
                    }}
                    onGroupSelect={setSelectedGroupId}
                    emptyText="No catalog items available for this booking."
                  />
                  <AddonSelectionBlock
                    title="Add-on Services"
                    icon={Sparkles}
                    items={availableAddons}
                    selectedKeys={selectedAddonKeys}
                    getKey={(addon) => String(addon._id || addon.addonid || addon.key || addon.name)}
                    getMeta={(addon) => String(addon.unit || 'service').replace(/_/g, ' ')}
                    getPrice={(addon) => addon.price}
                    onToggle={toggleAddon}
                    emptyText="No add-ons available for the selected items."
                  />
                  <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
                    <span className="block text-xs font-bold uppercase tracking-wider text-text-secondary">Live Total Preview</span>
                    <strong className="mt-1 block font-mono text-2xl font-black text-primary">₹{Number(liveTotal || 0).toLocaleString('en-IN')}</strong>
                    <p className="mt-1 text-[11px] font-semibold text-text-tertiary">Final total is recomputed from catalog prices on save.</p>
                  </div>
                </>
              )}

              <div className="h-px bg-bg-border" />

              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">Internal Notes</span>
                <textarea value={form.notes} onChange={(event) => update('notes', event.target.value)} placeholder="Add any notes for this booking..." rows={3} className="booking-input resize-none text-sm" />
              </label>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-bg-border p-6 pt-4">
              <button onClick={onClose} className="rounded-xl border border-bg-border px-5 py-2.5 text-sm font-bold text-text-secondary transition-colors hover:bg-bg-section">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-sky flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-secondary">
        <Icon className="h-3.5 w-3.5 text-primary" /> {label}
      </span>
      {children}
    </label>
  );
}

function SelectionBlock({ title, icon: Icon, sections, activeSection, activeGroups, activeGroup, groupItems, selectedKeys, getKey, getMeta, getPrice, onToggle, onSectionSelect, onGroupSelect, emptyText }) {
  return (
    <section className="rounded-2xl border border-bg-border bg-bg-section/45 p-3">
      <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </h3>
      {sections.length ? (
        <div className="grid gap-3 lg:grid-cols-[0.85fr_0.85fr_1.3fr]">
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {sections.map((section) => (
              <button
                key={section._id}
                type="button"
                onClick={() => onSectionSelect(section._id)}
                className={`w-full rounded-xl border px-3 py-2 text-left text-sm font-bold transition ${activeSection?._id === section._id ? 'border-primary/40 bg-white text-primary shadow-sm' : 'border-bg-border bg-white/70 text-text-primary hover:border-primary/20'}`}
              >
                {section.name}
              </button>
            ))}
          </div>
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {activeGroups.length ? activeGroups.map((group) => (
              <button
                key={group._id}
                type="button"
                onClick={() => onGroupSelect(group._id)}
                className={`w-full rounded-xl border px-3 py-2 text-left text-sm font-bold transition ${activeGroup?._id === group._id ? 'border-primary/40 bg-white text-primary shadow-sm' : 'border-bg-border bg-white/70 text-text-primary hover:border-primary/20'}`}
              >
                {group.name}
              </button>
            )) : <p className="rounded-xl border border-dashed border-bg-border bg-white/70 p-5 text-center text-xs font-semibold text-text-tertiary">No groups in this section.</p>}
          </div>
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {groupItems.length ? groupItems.map((item) => {
            const key = getKey(item);
            const checked = selectedKeys.has(key);
            return (
              <button key={key} type="button" onClick={() => onToggle(item)} className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${checked ? 'border-primary/40 bg-white shadow-sm' : 'border-bg-border bg-white/70 hover:border-primary/20'}`}>
                <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border ${checked ? 'border-primary bg-primary text-white' : 'border-bg-border bg-white text-transparent'}`}>
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-sm text-text-primary">{item.name}</strong>
                  <span className="mt-0.5 block truncate text-[10px] font-semibold uppercase text-text-tertiary">{getMeta(item)}</span>
                  <span className="mt-1 block font-mono text-xs font-black text-primary">₹{Number(getPrice(item) || 0).toLocaleString('en-IN')}</span>
                </span>
              </button>
            );
          }) : <p className="rounded-xl border border-dashed border-bg-border bg-white/70 p-5 text-center text-xs font-semibold text-text-tertiary">{emptyText}</p>}
          </div>
        </div>
      ) : <p className="rounded-xl border border-dashed border-bg-border bg-white/70 p-5 text-center text-xs font-semibold text-text-tertiary">{emptyText}</p>}
    </section>
  );
}

function AddonSelectionBlock({ title, icon: Icon, items, selectedKeys, getKey, getMeta, getPrice, onToggle, emptyText }) {
  return (
    <section className="rounded-2xl border border-bg-border bg-bg-section/45 p-3">
      <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </h3>
      {items.length ? (
        <div className="grid max-h-64 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
          {items.map((item) => {
            const key = getKey(item);
            const checked = selectedKeys.has(key);
            return (
              <button key={key} type="button" onClick={() => onToggle(item)} className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${checked ? 'border-primary/40 bg-white shadow-sm' : 'border-bg-border bg-white/70 hover:border-primary/20'}`}>
                <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border ${checked ? 'border-primary bg-primary text-white' : 'border-bg-border bg-white text-transparent'}`}>
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-sm text-text-primary">{item.name}</strong>
                  <span className="mt-0.5 block truncate text-[10px] font-semibold uppercase text-text-tertiary">{getMeta(item)}</span>
                  <span className="mt-1 block font-mono text-xs font-black text-primary">₹{Number(getPrice(item) || 0).toLocaleString('en-IN')}</span>
                </span>
              </button>
            );
          })}
        </div>
      ) : <p className="rounded-xl border border-dashed border-bg-border bg-white/70 p-5 text-center text-xs font-semibold text-text-tertiary">{emptyText}</p>}
    </section>
  );
}

export { BookingEditModal };
