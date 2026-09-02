'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import Spinner from '@tithi/ui/Spinner';
import BookingLayout from '@tithi/components/booking/BookingLayout';
import ItemSelectionStep from '@tithi/components/booking/ItemSelectionStep';
import SpecialServicesStep from '@tithi/components/booking/SpecialServicesStep';
import ReviewStep from '@tithi/components/booking/ReviewStep';
import { getBookingById, updateCustomerBookingItems } from '@tithi/lib/api';
import { usePublicPricingRule } from '@tithi/hooks/useBookingPricingRules';
import { useBookingStore } from '@tithi/store/bookingStore';
import { serviceHasItemCatalog, toServiceAlias } from '@tithi/utils/serviceTypes';

const STEPS = ['Items', 'Add-ons', 'Review'];

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

const toBookingData = (booking, pricingRule) => ({
  ...booking,
  serviceType: toServiceAlias(booking.serviceType),
  pricingRule,
  lockedPricing: pricingLockFromBooking(booking),
  pickupLocation: booking.pickupLocation || {},
  dropLocation: booking.dropLocation || {},
  scheduledDate: booking.scheduledDate || '',
  timeSlot: booking.timeSlot || '',
  items: (booking.items || []).map((item) => ({
    ...item,
    itemId: item.itemId || item._id,
    itemKey: item.itemkey || item.itemKey || `${item.itemId}:${item.options?.sizeVariantId || item.sizeVariantId || item.sizeId}`,
    key: item.itemkey || item.key,
    groupId: item.options?.groupId || item.groupId,
    sizeVariantId: item.options?.sizeVariantId || item.sizeVariantId || item.sizeId,
    tag: item.sizeTag || item.tag || item.sizeKey,
    price: Number(item.unitPrice ?? item.price ?? 0),
    unitPrice: Number(item.unitPrice ?? item.price ?? 0),
    quantity: Number(item.quantity || 1),
  })),
  specialServices: booking.selectedAddons || [],
});

export default function BookingUpdatePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = params.id;
  const mobile = (searchParams.get('mobile') || '').replace(/\D/g, '').slice(0, 10);
  const [step, setStep] = useState(0);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const updateBookingData = useBookingStore((state) => state.updateBookingData);
  const bookingData = useBookingStore((state) => state.bookingData);
  const resetBooking = useBookingStore((state) => state.resetBooking);
  const { data: pricingRule } = usePublicPricingRule(booking?.serviceType);

  const hydratedData = useMemo(() => booking ? toBookingData(booking, pricingRule || bookingData.pricingRule) : null, [booking, bookingData.pricingRule, pricingRule]);

  const loadBooking = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getBookingById(bookingId, null, mobile || undefined);
      if (['completed', 'cancelled'].includes(data.status)) {
        toast.error('This booking can no longer be updated.');
        router.push(`/my-bookings?bookingId=${encodeURIComponent(bookingId)}${mobile ? `&mobile=${encodeURIComponent(mobile)}` : ''}`);
        return;
      }
      if (!serviceHasItemCatalog(data.serviceType)) {
        toast.error('Item and add-on updates are not available for this service.');
        router.push(`/my-bookings?bookingId=${encodeURIComponent(bookingId)}${mobile ? `&mobile=${encodeURIComponent(mobile)}` : ''}`);
        return;
      }
      setBooking(data);
    } catch (error) {
      toast.error(error.message || 'Could not load booking for update.');
      router.push('/my-bookings');
    } finally {
      setLoading(false);
    }
  }, [bookingId, mobile, router]);

  useEffect(() => {
    resetBooking();
    loadBooking();
  }, [loadBooking, resetBooking]);

  useEffect(() => {
    if (hydratedData) updateBookingData(hydratedData);
  }, [hydratedData, updateBookingData]);

  const next = (data) => {
    updateBookingData(data);
    setStep((value) => Math.min(value + 1, STEPS.length - 1));
  };
  const back = () => {
    if (step === 0) router.push(`/my-bookings?bookingId=${encodeURIComponent(bookingId)}${mobile ? `&mobile=${encodeURIComponent(mobile)}` : ''}`);
    else setStep((value) => Math.max(0, value - 1));
  };
  const save = async () => {
    try {
      const updated = await updateCustomerBookingItems(bookingId, {
        mobile: mobile || bookingData.mobile || booking?.mobile || booking?.customer?.mobile,
        items: bookingData.items || [],
        selectedAddons: bookingData.specialServices || [],
      });
      toast.success('Booking updated successfully.');
      router.push(`/my-bookings?bookingId=${encodeURIComponent(updated.bookingid || bookingId)}&mobile=${encodeURIComponent(updated.mobile || updated.customer?.mobile || mobile || '')}`);
    } catch (error) {
      toast.error(error.message || 'Could not update booking.');
    }
  };

  if (loading || !booking) {
    return <div className="grid min-h-screen place-items-center bg-bg-page pt-24"><Spinner size="lg" /></div>;
  }

  return (
    <BookingLayout title={STEPS[step]} steps={STEPS} currentStep={step} onBack={back}>
      {step === 0 && <ItemSelectionStep onSubmit={next} onBack={back} initialData={bookingData} isIntercity={booking.serviceType === 'intercity_moving'} />}
      {step === 1 && <SpecialServicesStep onSubmit={next} onBack={back} initialData={bookingData} serviceType={toServiceAlias(booking.serviceType)} />}
      {step === 2 && <ReviewStep onSubmit={save} onBack={back} bookingData={bookingData} nextLabel="Update" />}
    </BookingLayout>
  );
}
