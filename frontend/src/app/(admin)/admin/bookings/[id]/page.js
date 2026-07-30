// src/app/admin/bookings/[id]/page.js
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Send 
} from 'lucide-react';
import { useUpdateBookingStatus } from '@/hooks/useAdmin';
import { getBookingById } from '@/lib/api'; // direct fallback
import { useAuthStore } from '@/store/authStore';
import Card, { CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import QuoteModal from '@/components/admin/QuoteModal';
import { formatBookingDate, formatBookingTimeSlot, formatCurrency, getBookingScheduledDate } from '@/lib/utils';
import { deriveFreeAllowanceItems } from '@/lib/freeAllowanceDisplay';
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
  const fetchErrorToastShown = useRef(false);

  const updateStatusMutation = useUpdateBookingStatus();

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
      router.push('/admin/bookings');
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

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!booking) return null;

  const grandTotal = booking.totalAmount || ((booking.manualQuote || 0) + (booking.addOnTotal || 0));
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
  const freeAllowanceItems = deriveFreeAllowanceItems(selectedItems, booking.pricing?.breakdown?.itemBreakdown || {});
  const itemSummary = getItemSummary(selectedItems);

  return (
    <div className="flex flex-col gap-6 text-left pb-12">
      
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
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={booking.status}
            onChange={handleStatusChange}
            className="px-3 py-2 bg-bg-elevated border border-bg-border rounded text-xs font-semibold text-text-primary focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => setQuoteOpen(true)}
            icon={DollarSign}
          >
            Configure Quote
          </Button>
        </div>
      </div>

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
                <div className="grid gap-3 sm:grid-cols-3">
                  <DetailMetric label="Selected items" value={`${itemSummary.totalQuantity} unit(s)`} />
                  <DetailMetric label="Size mix" value={itemSummary.sizeLabel} />
                  <DetailMetric label="Items charge" value={formatCurrency(itemSummary.totalAmount)} />
                </div>
                {freeAllowanceItems.length > 0 && (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-emerald-700">Items used under free allowance</span>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {freeAllowanceItems.map((item, index) => (
                        <div key={`${item.name}-${item.sizeKey}-${index}`} className="rounded-xl bg-white px-3 py-2 text-xs ring-1 ring-emerald-100">
                          <strong className="block text-text-primary">{item.name}</strong>
                          <span className="text-[10px] font-semibold text-text-tertiary">{item.category || 'Inventory item'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedItems.map((item, idx) => {
                    const quantity = Number(item.quantity || 0);
                    const unitPrice = Number(item.unitPrice ?? item.price ?? item.pricesnapshot ?? 0);
                    const lineTotal = Number(item.lineTotal ?? item.total ?? unitPrice * quantity);
                    const size = item.sizeTag || item.sizeKey || item.tag || '-';
                    return (
                      <div
                        key={`${item.itemkey || item.itemId || item.name}-${idx}`}
                        className="rounded-xl border border-bg-border/60 bg-bg-elevated/45 p-3 text-xs"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 text-left">
                            <span className="block truncate font-black text-text-primary">{item.name}</span>
                            <span className="mt-0.5 block truncate text-[10px] font-semibold text-text-tertiary">
                              {item.category || item.section || 'Inventory item'}
                            </span>
                          </div>
                          <span className="shrink-0 rounded-lg border border-primary/20 bg-primary/10 px-2 py-1 font-mono text-sm font-black text-primary">
                            x{quantity}
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-bg-border/50 pt-2 text-[10px] font-bold text-text-secondary">
                          <span>Size <b className="block text-text-primary">{size}</b></span>
                          <span>Rate <b className="block font-mono text-text-primary">{formatCurrency(unitPrice)}</b></span>
                          <span>Total <b className="block font-mono text-text-primary">{formatCurrency(lineTotal)}</b></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : booking.businessDetails ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-left">
                <div>
                  <span className="text-text-tertiary block">Business Sector</span>
                  <span className="text-text-primary font-bold">{booking.businessDetails.businessType}</span>
                </div>
                <div>
                  <span className="text-text-tertiary block">Employee Size</span>
                  <span className="text-text-primary font-bold">{booking.businessDetails.employeeCount}</span>
                </div>
                <div>
                  <span className="text-text-tertiary block">Premises Space</span>
                  <span className="text-text-primary font-bold">{booking.businessDetails.premisesSize}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-text-secondary text-center py-6">
                No standard items checked. Customer opted for customized packing volume details.
              </div>
            )}
          </Card>

          {!isLabour && (
            <Card className="p-6 bg-bg-card border border-bg-border/60 glass">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2 mb-4 border-b border-bg-border/60 pb-3">
                <Sparkles className="w-4.5 h-4.5 text-primary" />
                Selected Add-ons
              </h3>
              {selectedAddons.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {selectedAddons.map((addon, index) => (
                    <div key={`${addon.key || addon.name}-${index}`} className="rounded-xl border border-bg-border/60 bg-bg-elevated/45 p-3 text-xs">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <strong className="block truncate text-text-primary">{addon.name || addon.key || 'Add-on service'}</strong>
                          <span className="mt-0.5 block text-[10px] font-semibold uppercase text-text-tertiary">{String(addon.unit || 'service').replace(/_/g, ' ')}</span>
                        </div>
                        <span className="rounded-lg border border-primary/20 bg-primary/10 px-2 py-1 font-mono text-xs font-black text-primary">x{Number(addon.quantity || 1)}</span>
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
              {/* Addons */}
              <div className="flex justify-between items-center text-text-secondary border-b border-bg-border/40 pb-2.5">
                <span>Add-on Total:</span>
                <span className="font-mono text-text-primary font-semibold">{formatCurrency(booking.addOnTotal || 0)}</span>
              </div>
              
              {/* Manual Quote */}
              <div className="flex justify-between items-center text-text-secondary border-b border-bg-border/40 pb-2.5">
                <span>Base Move Charge:</span>
                <span className="font-mono text-text-primary font-semibold">{formatCurrency(booking.manualQuote || 0)}</span>
              </div>

              {/* Combined Total */}
              <div className="flex justify-between items-center text-sm font-bold text-primary pt-1.5">
                <span>Combined Price:</span>
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

    </div>
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
