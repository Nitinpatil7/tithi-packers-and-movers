// src/app/admin/bookings/[id]/page.js
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { 
  User, 
  MapPin, 
  Truck, 
  Box, 
  Sparkles, 
  DollarSign, 
  CalendarDays, 
  Clock, 
  StickyNote, 
  Send,
  Edit3,
  Upload,
  FileImage,
  ExternalLink
} from 'lucide-react';
import { useUpdateBookingStatus } from '@/hooks/useAdmin';
import { useItemCatalog } from '@hooks/useItems';
import { completeBookingWithProof, getBookingById } from '@tithi/lib/api'; // direct fallback
import { useAuthStore } from '@tithi/store/authStore';
import Card, { CardHeader, CardContent, CardFooter } from '@tithi/ui/Card';
import Badge from '@tithi/ui/Badge';
import Button from '@tithi/ui/Button';
import Input from '@tithi/ui/Input';
import Spinner from '@tithi/ui/Spinner';
import QuoteModal from '@/components/admin/QuoteModal';
import BookingEditModal from '@/components/admin/BookingEditModal';
import { updateBookingDetails } from '@tithi/lib/api';
import { formatBookingDate, formatBookingTimeSlot, formatCurrency, getBookingScheduledDate } from '@tithi/utils/utils';
import { deriveFreeAllowanceItems } from '@tithi/utils/freeAllowanceDisplay';
import { serviceHasItemCatalog } from '@tithi/utils/serviceTypes';
import toast from 'react-hot-toast';

const TIME_SLOT_LABELS = {
  morning: 'Morning (7AM-11AM)',
  afternoon: 'Afternoon (12PM-4PM)',
  evening: 'Evening (5PM-8PM)',
  after_hours: 'After hours',
};

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuthStore();
  const bookingId = params.id;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [internalNotes, setInternalNotes] = useState('');
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [proofOpen, setProofOpen] = useState(false);
  const [proofImage, setProofImage] = useState(null);
  const [witnessName, setWitnessName] = useState('');
  const [proofSaving, setProofSaving] = useState(false);
  const fetchErrorToastShown = useRef(false);

  const updateStatusMutation = useUpdateBookingStatus();
  const { data: catalogSections = [] } = useItemCatalog({}, { enabled: Boolean(booking && serviceHasItemCatalog(booking.serviceType)) });

  // Load details
  const loadDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getBookingById(bookingId, token || true);
      setBooking(data);
      setInternalNotes(data.internalNotes || '');
    } catch (err) {
      if (!fetchErrorToastShown.current) {
        toast.error(err.message || 'Error fetching booking details', { id: 'booking-detail-fetch-error' });
        fetchErrorToastShown.current = true;
      }
      router.push('/bookings');
    } finally {
      setLoading(false);
    }
  }, [bookingId, router, token]);

  useEffect(() => {
    if (bookingId) {
      loadDetails();
    }
  }, [bookingId, loadDetails]);

  const handleStatusChange = async (e) => {
    if (booking.status === 'completed') return;
    const newStatus = e.target.value;
    try {
      await updateStatusMutation.mutateAsync({
        id: booking.bookingId || booking.bookingid,
        status: newStatus,
        token
      });
      setBooking(prev => ({ ...prev, status: newStatus }));
      toast.success(`Booking status changed to ${newStatus}`);
    } catch (err) {
      toast.error('Error changing status');
    }
  };

  const handleSaveNotes = () => {
    toast.success('Internal notes updated locally');
  };
  const handleCompletionProof = async (event) => {
    event.preventDefault();
    if (!proofImage) return toast.error('Upload the signed checklist image.');
    if (!witnessName.trim()) return toast.error('Witness name is required.');
    const id = booking.bookingId || booking.bookingid;
    try {
      setProofSaving(true);
      const updated = await completeBookingWithProof(id, { image: proofImage, witnessName });
      setBooking(updated);
      setProofImage(null);
      setWitnessName('');
      setProofOpen(false);
      toast.success(`Booking ${id} completed with proof`);
      loadDetails();
    } catch (error) {
      toast.error(error.message || 'Could not upload completion proof');
    } finally {
      setProofSaving(false);
    }
  };
  const handleEditSave = async (updatedBooking) => {
    const id = updatedBooking.bookingId || updatedBooking.bookingid;
    const isItemBooking = serviceHasItemCatalog(updatedBooking.serviceType);
    await updateBookingDetails(id, {
      scheduledate: updatedBooking.scheduledDate || undefined,
      timeslot: updatedBooking.timeSlot || undefined,
      note: updatedBooking.notes || '',
      ...(isItemBooking ? { items: updatedBooking.items || [], selectedAddons: updatedBooking.selectedAddons || [] } : {}),
    });
    toast.success(`Booking ${id} updated`);
    setEditOpen(false);
    loadDetails();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!booking) return null;

  const breakdown = booking.pricingBreakdown || booking.pricing?.breakdown || {};
  const grandTotal = booking.totalAmount || ((booking.manualQuote || 0) + (booking.addOnTotal || 0));
  const adjustment = booking.rateAdjustment || breakdown.rateAdjustment || null;
  const baseGrandTotal = Number(booking.baseGrandTotal || breakdown.baseGrandTotal || grandTotal || 0);
  const adjustmentAmount = Number(booking.rateAdjustmentAmount || breakdown.rateAdjustmentAmount || 0);
  const isLabour = booking.serviceType === 'porter_labour_service' || booking.serviceType === 'labour' || booking.serviceType === 'labour-service';
  const scheduledValue = getBookingScheduledDate(booking);
  const scheduledLabel = formatBookingDate(booking);
  const timeSlotLabel = formatBookingTimeSlot(booking, TIME_SLOT_LABELS);
  const selectedTruck = booking.pricing?.breakdown?.selectedTruck || {};
  const truckLabel = selectedTruck?.name
    ? `${selectedTruck.name}${selectedTruck.capacityKg ? ` - ${Number(selectedTruck.capacityKg).toLocaleString('en-IN')} kg` : ''}`
    : booking.truckType?.replace?.(/[_-]/g, ' ') || '-';
  const selectedItems = getSelectedItems(booking);
  const selectedAddons = getSelectedAddons(booking);
  const addOnBreakdown = getAddonBreakdown(booking);
  const addonRows = mergeAddonRows(selectedAddons, addOnBreakdown);
  const freeAllowanceItems = deriveFreeAllowanceItems(selectedItems, booking.pricing?.breakdown?.itemBreakdown || {});
  const inventoryGroups = buildInventoryGroups(selectedItems, freeAllowanceItems, buildCatalogGroupLookup(catalogSections));
  const itemSummary = getItemSummary(selectedItems);
  const extraItemCount = Math.max(0, itemSummary.totalQuantity - freeAllowanceItems.length);
  const itemsExtraCharge = Number(booking.itemsExtraCharge || breakdown.itemsExtraCharge || booking.pricing?.itemTotal || 0);
  const allowanceDeduction = Math.max(0, itemSummary.totalAmount - itemsExtraCharge);
  const baseMovePrice = Number(breakdown.basePrice || 0);
  const distanceCharge = Number(booking.distanceCharge || breakdown.distanceCharge || 0);
  const floorTotalCharge = Number(booking.floorTotalCharge || breakdown.floorTotalCharge || 0);
  const employeeTotal = Number(booking.employeeTotal || breakdown.employeeTotal || 0);
  const truckTotal = Number(booking.truckTotal || breakdown.truckTotal || 0);
  const serviceCharge = Number(booking.manualQuote || booking.pricing?.serviceCharge || 0);
  const addOnTotal = Number(booking.addOnTotal || booking.pricing?.addOnTotal || addonRows.reduce((sum, item) => sum + Number(item.total || 0), 0));
  const sundayHike = Number(booking.sundayHike || breakdown.sundayHike || 0);
  const rawFinalTotal = Number(breakdown.unroundedGrandTotal || grandTotal || 0);
  const finalRoundingAdjustment = Number(breakdown.finalRoundingAdjustment ?? Math.max(0, grandTotal - rawFinalTotal));
  const isCompleted = booking.status === 'completed';
  const isFinal = ['completed', 'cancelled'].includes(booking.status);

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* Title / Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase font-bold tracking-widest text-primary">
            Shifting Details Control
          </span>
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-black text-text-primary">
              {booking.bookingId || booking.bookingid}
            </h1>
            <Badge variant="status" type={booking.status} />
          </div>
        </div>

        {/* Change status and update pricing action */}
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          {!isFinal && (
            <>
              <select
                value={booking.status}
                onChange={handleStatusChange}
                className="px-3 py-2 bg-bg-elevated border border-bg-border rounded text-xs font-semibold text-text-primary focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="pending">Pending</option>
                <option value="quote_sent">Quote Sent</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditOpen(true)}
                icon={Edit3}
              >
                Update
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setQuoteOpen(true)}
                icon={DollarSign}
              >
                Configure Quote
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setProofOpen((value) => !value)}
                icon={Upload}
              >
                Upload Docs
              </Button>
            </>
          )}
          {isFinal && <span className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-black uppercase tracking-wide text-emerald-700">Finalized</span>}
        </div>
      </div>

      {(proofOpen || booking.completionProof?.imageUrl) && (
        <CompletionProofPanel
          proof={booking.completionProof}
          isCompleted={isCompleted}
          image={proofImage}
          witnessName={witnessName}
          saving={proofSaving}
          onImageChange={setProofImage}
          onWitnessNameChange={setWitnessName}
          onSubmit={handleCompletionProof}
        />
      )}

      {/* Main Breakdown Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Info Panel (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Customer Profile & Info */}
          <Card className="p-6 bg-bg-card border border-bg-border/60 glass">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2 mb-4 border-b border-bg-border/60 pb-3">
              <User className="w-4.5 h-4.5 text-primary" />
              Customer Contact Details
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
              <div>
                <span className="text-text-tertiary block mb-0.5">Full Name</span>
                <span className="text-text-primary font-bold text-sm">{booking.customerName || '-'}</span>
              </div>
              <div>
                <span className="text-text-tertiary block mb-0.5">Mobile Number</span>
                <span className="text-text-primary font-mono font-bold text-sm">{booking.mobile || '-'}</span>
              </div>
              <div>
                <span className="text-text-tertiary block mb-0.5">Email Address</span>
                <span className="text-text-primary font-bold text-sm">{booking.email || '-'}</span>
              </div>
            </div>
          </Card>

          {/* Shifting Address details */}
          <Card className="p-6 bg-bg-card border border-bg-border/60 glass">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2 mb-4 border-b border-bg-border/60 pb-3">
              <MapPin className="w-4.5 h-4.5 text-primary" />
              Relocation Address Metrics
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div>
                <span className="text-text-tertiary block mb-1 uppercase font-bold tracking-wider">Pickup Address</span>
                <span className="text-text-primary font-medium text-sm block">{booking.pickupLocation?.address || 'Not specified'}</span>
                <span className="inline-block mt-2 bg-bg-elevated border border-bg-border px-2.5 py-1 rounded text-text-secondary font-semibold">
                  Floor: {booking.pickupLocation?.floor === 0 ? 'Ground' : `${booking.pickupLocation?.floor || 0} Floor`} 
                  {booking.pickupLocation?.liftAvailable ? ' | Service Lift' : ' | No Lift'}
                </span>
              </div>
              
              {booking.dropLocation && (
                <div>
                  <span className="text-text-tertiary block mb-1 uppercase font-bold tracking-wider">Drop / Delivery Address</span>
                  <span className="text-text-primary font-medium text-sm block">{booking.dropLocation?.address}</span>
                  <span className="inline-block mt-2 bg-bg-elevated border border-bg-border px-2.5 py-1 rounded text-text-secondary font-semibold">
                    Floor: {booking.dropLocation?.floor === 0 ? 'Ground' : `${booking.dropLocation?.floor || 0} Floor`} 
                    {booking.dropLocation?.liftAvailable ? ' | Service Lift' : ' | No Lift'}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Service-specific details */}
          <Card className="p-6 bg-bg-card border border-bg-border/60 glass">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2 mb-4 border-b border-bg-border/60 pb-3">
              {isLabour ? <Truck className="w-4.5 h-4.5 text-primary" /> : <Box className="w-4.5 h-4.5 text-primary" />}
              {isLabour ? 'Porter / Labour Details' : 'Inventory checklist'}
            </h3>
            
            {isLabour ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailMetric label="Truck selected" value={truckLabel} />
                <DetailMetric label="Truck charge" value={formatCurrency(booking.truckTotal || booking.pricing?.breakdown?.truckTotal || 0)} />
                <DetailMetric label="Employees" value={`${booking.employeeCount || 0} worker(s)`} />
                <DetailMetric label="Duration" value={`${booking.hoursCount || 0} hour(s)`} />
                <DetailMetric label="Distance" value={`${booking.distanceKm || booking.pricing?.breakdown?.distanceKm || 0} km`} />
                <DetailMetric label="Labour charge" value={formatCurrency(booking.employeeTotal || booking.pricing?.breakdown?.employeeTotal || 0)} />
              </div>
            ) : selectedItems.length > 0 ? (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <DetailMetric label="Selected items" value={`${itemSummary.totalQuantity} unit(s)`} />
                  <DetailMetric label="Free allowance" value={`${freeAllowanceItems.length} unit(s)`} />
                  <DetailMetric label="Extra items" value={`${extraItemCount} unit(s)`} />
                  <DetailMetric label="Total item price" value={formatCurrency(itemSummary.totalAmount)} />
                  <DetailMetric label="Allowance discount" value={`-${formatCurrency(allowanceDeduction)}`} />
                  <DetailMetric label="Net item quote" value={formatCurrency(itemsExtraCharge)} />
                  <DetailMetric label="Size mix" value={itemSummary.sizeLabel} />
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/55 p-3">
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-emerald-700">Item allowance calculation</div>
                  <div className="space-y-1.5">
                    <AddonCalcRow label="Selected item value" value={formatCurrency(itemSummary.totalAmount)} />
                    <AddonCalcRow label={`${freeAllowanceItems.length} free unit allowance`} value={`-${formatCurrency(allowanceDeduction)}`} />
                    <AddonCalcRow label="Net extra item charge" value={formatCurrency(itemsExtraCharge)} />
                  </div>
                </div>
                <div className="max-h-[26rem] overflow-y-auto overscroll-contain rounded-3xl border border-sky-100 bg-sky-50/35 p-3 pr-2 sm:max-h-[30rem]">
                  <div className="space-y-4">
                    {inventoryGroups.map((section) => (
                      <section key={section.key} className="space-y-3">
                        <div className="flex items-center justify-between gap-3 px-1">
                          <h4 className="text-sm font-semibold uppercase tracking-wide text-primary">{section.name}</h4>
                          <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-text-secondary ring-1 ring-sky-100">
                            {section.totalQuantity} unit(s)
                          </span>
                        </div>
                        <div className="space-y-2">
                          {section.groups.map((group) => (
                            <div key={group.key} className="rounded-2xl bg-white p-2.5 ring-1 ring-sky-100 shadow-xs">
                              <div className="flex items-center justify-between gap-3 px-1 pb-1.5">
                                <h5 className="truncate text-[11px] font-semibold uppercase tracking-wide text-text-secondary">{group.name}</h5>
                                <span className="shrink-0 text-[10px] font-semibold text-text-tertiary">{group.totalQuantity} item(s)</span>
                              </div>
                              <div className="divide-y divide-bg-border/60 overflow-hidden rounded-xl bg-bg-elevated/70">
                                {group.items.map((item) => (
                                  <div key={item.key} className="px-3 py-2.5">
                                    <div className="flex min-w-0 items-start justify-between gap-3">
                                      <div className="min-w-0">
                                        <span className="block truncate text-sm font-normal text-text-primary">{item.name}</span>
                                        <span className="mt-0.5 block truncate text-[11px] font-medium text-text-tertiary">
                                          Size {item.size} | Rate {formatCurrency(item.unitPrice)} | Line {formatCurrency(item.lineTotal)}
                                        </span>
                                      </div>
                                      <span className="shrink-0 rounded-full bg-primary px-2.5 py-1 font-mono text-xs font-semibold text-white">
                                        x{item.quantity}
                                      </span>
                                    </div>
                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                      {item.freeQuantity > 0 && (
                                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                                          Free allowance x{item.freeQuantity}
                                        </span>
                                      )}
                                      {item.extraQuantity > 0 && (
                                        <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-orange-700">
                                          Extra x{item.extraQuantity}
                                        </span>
                                      )}
                                    </div>
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
            ) : (
              <div className="text-xs text-text-secondary text-center py-6">
                No standard items were saved for this booking.
              </div>
            )}
          </Card>

          {!isLabour && (
            <Card className="p-6 bg-bg-card border border-bg-border/60 glass">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2 mb-4 border-b border-bg-border/60 pb-3">
                <Sparkles className="w-4.5 h-4.5 text-primary" />
                Selected Add-ons
              </h3>
              {addonRows.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {addonRows.map((addon, index) => (
                    <div key={`${addon.key || addon.name}-${index}`} className="rounded-xl border border-bg-border/60 bg-bg-elevated/45 p-3 text-xs">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <strong className="block truncate text-text-primary">{addon.name || addon.key || 'Add-on service'}</strong>
                          <span className="mt-0.5 block text-[10px] font-semibold uppercase text-text-tertiary">{addonLineLabel(addon)}</span>
                        </div>
                        <span className="rounded-lg border border-primary/20 bg-primary/10 px-2 py-1 font-mono text-xs font-black text-primary">x{Number(addon.quantity || 1)}</span>
                      </div>
                      <div className="mt-3 space-y-1.5 rounded-lg bg-white/70 p-2">
                        <AddonCalcRow label="Unit price" value={addon.unit === 'percentage' ? `${Number(addon.unitPrice ?? addon.pricesnapshot ?? 0)}%` : formatCurrency(Number(addon.unitPrice ?? addon.pricesnapshot ?? addon.price ?? addon.charge ?? 0))} />
                        {addon.unit === 'percentage' && <AddonCalcRow label="Base before add-on" value={formatCurrency(Number(addon.addOnBaseAmount || 0))} />}
                        {addon.unit === 'percentage' && addon.rawPercentageAmount !== null && addon.rawPercentageAmount !== undefined && <AddonCalcRow label="Raw percentage" value={formatCurrency(Number(addon.rawPercentageAmount || 0))} />}
                        {addon.unit !== 'percentage' && <AddonCalcRow label="Quantity rule" value={`${Number(addon.quantity || 1)} matched unit(s)`} />}
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-bg-border/50 pt-2">
                        <span className="font-semibold text-text-secondary">Total</span>
                        <span className="font-mono font-black text-text-primary">{formatCurrency(Number(addon.total ?? ((addon.pricesnapshot || addon.price || addon.unitPrice || addon.charge || 0) * (addon.quantity || 1))))}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-6 text-center text-xs font-semibold text-text-secondary">No add-ons selected for this booking.</p>
              )}
            </Card>
          )}
        </div>

        {/* Right Info Panel (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Shifting Details / Schedule */}
          <Card className="p-5 bg-bg-card border border-bg-border/60 glass">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest mb-3 border-b border-bg-border/60 pb-2">
              Move Details
            </h3>
            
            <div className="flex flex-col gap-4 text-xs text-left">
              <div>
                <span className="text-text-tertiary block mb-0.5">Moving Type</span>
                <Badge variant="service" type={booking.serviceType} />
              </div>

              {booking.truckType && (
                <div>
                  <span className="text-text-tertiary block mb-0.5">Truck Assigned</span>
                  <span className="text-text-primary font-bold capitalize flex items-center gap-1.5 mt-0.5 text-sm">
                    <Truck className="w-4 h-4 text-primary" />
                    {truckLabel}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 border-t border-bg-border/60 pt-3.5">
                <div>
                  <span className="text-text-tertiary block mb-0.5">Scheduled Date</span>
                  <span className="text-text-primary font-semibold flex items-center gap-1">
                    <CalendarDays className="w-4 h-4 text-primary" />
                    {scheduledLabel}
                    {scheduledValue && <span className="sr-only">Raw date {scheduledValue}</span>}
                  </span>
                </div>
                <div>
                  <span className="text-text-tertiary block mb-0.5">Assign Time Slot</span>
                  <span className="text-text-primary font-semibold capitalize flex items-center gap-1">
                    <Clock className="w-4 h-4 text-primary" />
                    {timeSlotLabel}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Pricing Quote calculation panel */}
          <Card className="p-5 bg-bg-card border border-bg-border/60 glass">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest mb-3 border-b border-bg-border/60 pb-2">
              Invoice Quote calculations
            </h3>
            
            <div className="flex flex-col gap-3 text-xs text-left">
              {/* Move charge */}
              <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-3">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-sky-600">Move charge breakdown</div>
                <div className="space-y-1.5">
                  <AddonCalcRow label="Base price" value={formatCurrency(baseMovePrice)} />
                  <AddonCalcRow label={`Distance charge${booking.distanceKm ? ` (${Number(booking.distanceKm).toFixed(1)} km)` : ''}`} value={formatCurrency(distanceCharge)} />
                  <AddonCalcRow label="Floor / lift charge" value={formatCurrency(floorTotalCharge)} />
                  {truckTotal > 0 && <AddonCalcRow label="Truck charge" value={formatCurrency(truckTotal)} />}
                  {employeeTotal > 0 && <AddonCalcRow label="Labour charge" value={formatCurrency(employeeTotal)} />}
                  <AddonCalcRow label="Base move total" value={formatCurrency(serviceCharge)} />
                </div>
              </div>

              {!isLabour && (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/45 p-3">
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-emerald-700">Item quote breakdown</div>
                  <div className="space-y-1.5">
                    <AddonCalcRow label="Total item price" value={formatCurrency(itemSummary.totalAmount)} />
                    <AddonCalcRow label="Free allowance deduction" value={`-${formatCurrency(allowanceDeduction)}`} />
                    <AddonCalcRow label="Net item charge" value={formatCurrency(itemsExtraCharge)} />
                  </div>
                </div>
              )}

              {/* Addons */}
              <div className="flex justify-between items-center text-text-secondary border-b border-bg-border/40 pb-2.5">
                <span>Add-on Total:</span>
                <span className="font-mono text-text-primary font-semibold">{formatCurrency(addOnTotal)}</span>
              </div>
              
              {/* Manual Quote */}
              <div className="flex justify-between items-center text-text-secondary border-b border-bg-border/40 pb-2.5">
                <span>Base Move Charge:</span>
                <span className="font-mono text-text-primary font-semibold">{formatCurrency(serviceCharge)}</span>
              </div>

              {!isLabour && (
                <div className="flex justify-between items-center text-text-secondary border-b border-bg-border/40 pb-2.5">
                  <span>Net Item Charge:</span>
                  <span className="font-mono text-text-primary font-semibold">{formatCurrency(itemsExtraCharge)}</span>
                </div>
              )}

              {sundayHike > 0 && (
                <div className="flex justify-between items-center text-text-secondary border-b border-bg-border/40 pb-2.5">
                  <span>Sunday Increment:</span>
                  <span className="font-mono text-text-primary font-semibold">{formatCurrency(sundayHike)}</span>
                </div>
              )}

              {rawFinalTotal !== grandTotal && (
                <div className="flex justify-between items-center text-text-secondary border-b border-bg-border/40 pb-2.5">
                  <span>Actual Total Before Round:</span>
                  <span className="font-mono text-text-primary font-semibold">{formatCurrency(rawFinalTotal)}</span>
                </div>
              )}

              {finalRoundingAdjustment > 0 && (
                <div className="flex justify-between items-center text-text-secondary border-b border-bg-border/40 pb-2.5">
                  <span>Final Round Figure:</span>
                  <span className="font-mono text-text-primary font-semibold">+{formatCurrency(finalRoundingAdjustment)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-text-secondary border-b border-bg-border/40 pb-2.5">
                <span>Original Total:</span>
                <span className="font-mono text-text-primary font-semibold">{formatCurrency(baseGrandTotal)}</span>
              </div>

              <div className="flex justify-between items-center text-text-secondary border-b border-bg-border/40 pb-2.5">
                <span>Rate Adjustment:</span>
                <span className="font-mono text-text-primary font-semibold">{adjustment ? `${Number(adjustment.percentage || 0)}% (${formatCurrency(adjustmentAmount)})` : 'None'}</span>
              </div>

              {/* Combined Total */}
              <div className="flex justify-between items-center text-sm font-bold text-primary pt-1.5">
                <span>Final Price:</span>
                <span className="font-mono text-base font-black">{formatCurrency(grandTotal)}</span>
              </div>

              {booking.manualQuote === 0 && (
                <div className="mt-2 bg-amber-500/5 border border-amber-500/10 text-[10px] text-amber-500 p-2.5 rounded text-center font-medium leading-relaxed">
                  Requires moving vehicle pricing base. Click &quot;Configure Quote&quot; above to input price parameters.
                </div>
              )}
            </div>
          </Card>

          {/* Internal Notes Card */}
          <Card className="p-5 bg-bg-card border border-bg-border/60 glass">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest mb-3 border-b border-bg-border/60 pb-2 flex items-center gap-1.5">
              <StickyNote className="w-4 h-4 text-primary" />
              Office Internal Notes
            </h3>
            
            <div className="flex flex-col gap-3">
              <textarea
                className="w-full min-h-[80px] p-2 text-xs bg-bg-elevated border border-bg-border text-text-primary rounded resize-none outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Write specific directions, loading conditions, or customer requirements..."
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
              />
              <Button variant="secondary" size="sm" onClick={handleSaveNotes} className="py-1">
                Save Notes
              </Button>
            </div>
          </Card>

        </div>

      </div>

      {/* Quote Dialog Modal */}
      {quoteOpen && (
        <QuoteModal
          isOpen={quoteOpen}
          onClose={() => {
            setQuoteOpen(false);
            loadDetails(); // reload quote update
          }}
          booking={booking}
          token={token}
        />
      )}

      <BookingEditModal
        booking={booking}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleEditSave}
      />

    </div>
  );
}

function CompletionProofPanel({ proof, isCompleted, image, witnessName, saving, onImageChange, onWitnessNameChange, onSubmit }) {
  const uploadedAt = proof?.uploadedAt ? new Date(proof.uploadedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '';
  if (proof?.imageUrl) {
    return (
      <Card className="p-5 bg-bg-card border border-emerald-100 glass">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-text-primary">
              <FileImage className="h-4 w-4 text-emerald-600" /> Completion Proof
            </h2>
            <p className="mt-1 text-xs font-semibold text-text-secondary">
              Witness: {proof.witnessName || '-'}{uploadedAt ? ` / Uploaded ${uploadedAt}` : ''}
            </p>
          </div>
          <a href={proof.imageUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-white px-4 py-2 text-xs font-black text-emerald-700 hover:bg-emerald-50">
            <ExternalLink className="h-3.5 w-3.5" /> View full size
          </a>
        </div>
        <a href={proof.imageUrl} target="_blank" rel="noreferrer" className="mt-4 block w-full max-w-sm overflow-hidden rounded-2xl border border-emerald-100 bg-white">
          <Image unoptimized src={proof.imageUrl} alt="Signed completion proof" width={480} height={320} className="h-48 w-full object-cover" />
        </a>
      </Card>
    );
  }

  if (isCompleted) return null;

  return (
    <Card className="p-5 bg-bg-card border border-sky-100 glass">
      <form onSubmit={onSubmit} className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
        <label className="block">
          <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-text-secondary">Signed checklist photo</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => onImageChange(event.target.files?.[0] || null)}
            className="block w-full rounded-xl border border-bg-border bg-bg-elevated px-3 py-2 text-xs font-semibold text-text-primary file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-black file:text-white"
          />
          <span className="mt-1 block truncate text-[10px] font-semibold text-text-tertiary">{image?.name || 'PNG, JPEG, or WebP up to 3 MB'}</span>
        </label>
        <Input
          label="Witness name"
          value={witnessName}
          onChange={(event) => onWitnessNameChange(event.target.value)}
          placeholder="Name on signed proof"
          required
        />
        <Button type="submit" variant="primary" size="sm" loading={saving} icon={Upload}>
          Complete
        </Button>
      </form>
      <p className="mt-3 text-[11px] font-semibold text-text-tertiary">
        Completing a booking requires this signed proof. The record becomes read-only after upload.
      </p>
    </Card>
  );
}

function DetailMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
      <span className="block text-[10px] font-black uppercase tracking-wider text-sky-600">{label}</span>
      <span className="mt-1 block text-sm font-bold capitalize text-text-primary">{value || '-'}</span>
    </div>
  );
}

function getSelectedItems(booking) {
  if (Array.isArray(booking.items) && booking.items.length) return booking.items;
  if (Array.isArray(booking.quoteSnapshot?.items) && booking.quoteSnapshot.items.length) return booking.quoteSnapshot.items;
  return [];
}

function getSelectedAddons(booking) {
  if (Array.isArray(booking.selectedAddons) && booking.selectedAddons.length) return booking.selectedAddons;
  if (Array.isArray(booking.quoteSnapshot?.selectedAddons) && booking.quoteSnapshot.selectedAddons.length) return booking.quoteSnapshot.selectedAddons;
  return [];
}

function getAddonBreakdown(booking) {
  const breakdown = booking.pricing?.breakdown?.addOnBreakdown || booking.quoteSnapshot?.pricing?.breakdown?.addOnBreakdown || [];
  return Array.isArray(breakdown) ? breakdown : [];
}

function mergeAddonRows(addons = [], breakdown = []) {
  return addons.map((addon) => {
    const match = breakdown.find((line) => (
      (addon.addonid || addon.addonId || addon._id) && String(line.addonId || line.addonid || line._id) === String(addon.addonid || addon.addonId || addon._id)
    ) || (addon.key && line.key === addon.key) || line.name === addon.name);
    return { ...addon, ...(match || {}) };
  });
}

function addonLineLabel(addon = {}) {
  const unit = String(addon.unit || 'service').replace(/_/g, ' ');
  if (addon.unit === 'percentage') return `${unit} of pre add-on subtotal`;
  if (['per_unit', 'per_item', 'per_group', 'per_category'].includes(addon.unit)) return `${unit} from selected triggers`;
  return unit;
}

function AddonCalcRow({ label, value }) {
  return <div className="flex items-center justify-between gap-2 text-[10px] font-semibold"><span className="text-text-tertiary">{label}</span><span className="text-right font-mono text-text-primary">{value}</span></div>;
}

const cleanInventoryText = (value, fallback = '') => String(value || fallback).replace(/\s+/g, ' ').trim();
const normalizeLookupKey = (value) => String(value?._id || value?.id || value || '').trim();

const allowanceKey = (item = {}) => [
  cleanInventoryText(item.name, 'Inventory item').toLowerCase(),
  cleanInventoryText(item.category || item.section, 'Inventory').toLowerCase(),
  cleanInventoryText(item.sizeKey || item.sizeTag || item.tag, 'NA').toUpperCase(),
].join('|');

function buildCatalogGroupLookup(sections = []) {
  const lookup = new Map();
  (sections || []).forEach((section) => {
    (section.groups || []).forEach((group) => {
      const groupName = cleanInventoryText(group.name, 'Selected items');
      const groupId = normalizeLookupKey(group._id || group.id);
      if (groupId) lookup.set(groupId, groupName);
      (group.items || []).forEach((item) => {
        const itemId = normalizeLookupKey(item._id || item.id);
        if (itemId) lookup.set(itemId, groupName);
      });
    });
  });
  return lookup;
}

function buildInventoryGroups(items = [], freeItems = [], groupLookup = new Map()) {
  const allowanceCounts = new Map();
  freeItems.forEach((item) => {
    const key = allowanceKey(item);
    allowanceCounts.set(key, (allowanceCounts.get(key) || 0) + 1);
  });

  const sections = new Map();
  items.forEach((item, index) => {
    const quantity = Math.max(0, Number(item.quantity || 0));
    const unitPrice = Number(item.unitPrice ?? item.price ?? item.pricesnapshot ?? 0);
    const lineTotal = Number(item.lineTotal ?? item.total ?? unitPrice * quantity);
    const sectionName = cleanInventoryText(item.category || item.section, 'Inventory');
    const sectionKey = sectionName.toLowerCase();
    const groupId = normalizeLookupKey(item.groupId || item.options?.groupId);
    const itemId = normalizeLookupKey(item.itemId || item._id);
    const groupName = cleanInventoryText(
      item.group || item.groupName || item.options?.groupName || groupLookup.get(groupId) || groupLookup.get(itemId),
      'Selected items',
    );
    const groupKey = `${sectionKey}|${cleanInventoryText(groupId || groupName, groupName).toLowerCase()}`;
    const size = cleanInventoryText(item.sizeTag || item.sizeKey || item.tag, '-').toUpperCase();
    const key = allowanceKey({ ...item, category: sectionName, sizeKey: size });
    const freeQuantity = Math.min(quantity, allowanceCounts.get(key) || 0);
    allowanceCounts.set(key, Math.max(0, (allowanceCounts.get(key) || 0) - freeQuantity));
    const row = {
      key: `${item.itemkey || item.itemId || item.name || 'item'}-${index}`,
      name: cleanInventoryText(item.name, 'Inventory item'),
      quantity,
      freeQuantity,
      extraQuantity: Math.max(0, quantity - freeQuantity),
      size,
      unitPrice,
      lineTotal,
    };

    if (!sections.has(sectionKey)) sections.set(sectionKey, { key: sectionKey, name: sectionName, totalQuantity: 0, groups: new Map() });
    const section = sections.get(sectionKey);
    if (!section.groups.has(groupKey)) section.groups.set(groupKey, { key: groupKey, name: groupName, totalQuantity: 0, items: [] });
    const group = section.groups.get(groupKey);
    section.totalQuantity += quantity;
    group.totalQuantity += quantity;
    group.items.push(row);
  });

  return [...sections.values()].map((section) => ({
    ...section,
    groups: [...section.groups.values()],
  }));
}

function getItemSummary(items = []) {
  const sizeCounts = {};
  const totalQuantity = items.reduce((sum, item) => {
    const quantity = Number(item.quantity || 0);
    const size = String(item.sizeTag || item.sizeKey || item.tag || 'NA').toUpperCase();
    sizeCounts[size] = (sizeCounts[size] || 0) + quantity;
    return sum + quantity;
  }, 0);
  const totalAmount = items.reduce((sum, item) => {
    const quantity = Number(item.quantity || 0);
    const unitPrice = Number(item.unitPrice ?? item.price ?? item.pricesnapshot ?? 0);
    return sum + Number(item.lineTotal ?? item.total ?? unitPrice * quantity);
  }, 0);
  const sizeLabel = Object.entries(sizeCounts)
    .filter(([, count]) => count > 0)
    .map(([size, count]) => `${size}: ${count}`)
    .join(' | ');
  return { totalQuantity, totalAmount, sizeLabel: sizeLabel || '-' };
}
