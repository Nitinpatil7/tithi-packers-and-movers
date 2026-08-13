// src/app/my-bookings/[id]/page.js
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { getBookingById } from '@/lib/api';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { formatBookingDate, formatBookingTimeSlot, formatCurrency, formatDate, getServiceLabel } from '@/lib/utils';
import { ArrowLeft, MapPin, Truck, Box, Sparkles, DollarSign, CalendarDays, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguageStore } from '@/store/languageStore';
import { getTruckImageSrc } from '@/lib/truckVisuals';

const DETAIL_TRANSLATIONS = {
  en: {
    back: "Back to Bookings",
    bookingRef: "Booking Reference",
    requestedOn: "Requested on ",
    timelineTitle: "Moving Timeline Status",
    stages: {
      pending: "Pending",
      confirmed: "Confirmed",
      'in-progress': "In Progress",
      completed: "Completed"
    },
    addressDetails: "Address Details",
    from: "From (Pickup)",
    to: "To (Delivery)",
    floor: "Floor: ",
    ground: "Ground",
    noLift: "No Lift",
    lift: "Service Lift",
    notSpecified: "Not specified",
    assignedDetails: "Assigned Details",
    shiftingCategory: "Shifting Category",
    vehicleAllocated: "Vehicle Allocated",
    date: "Date",
    slot: "Preferred Slot",
    quoteCalculations: "Quote Calculations",
    addonEstimation: "Add-on services estimation:",
    baseCharge: "Base moving vehicle charge:",
    pendingReview: "Pending Review",
    combinedCost: "Combined Cost invoice:",
    awaitingEstimation: "Awaiting estimation",
    calculatingQuote: "Our managers are calculating local transport rates for your inventory volume. We will send the updated quote via SMS/WhatsApp within 2 hours.",
    notFound: "Booking detail record not found."
  },
  hi: {
    back: "à¤¬à¥à¤•à¤¿à¤‚à¤— à¤ªà¤° à¤µà¤¾à¤ªà¤¸ à¤œà¤¾à¤à¤‚",
    bookingRef: "à¤¬à¥à¤•à¤¿à¤‚à¤— à¤¸à¤‚à¤¦à¤°à¥à¤­",
    requestedOn: "à¤…à¤¨à¥à¤°à¥‹à¤§ à¤•à¥€ à¤¤à¤¾à¤°à¥€à¤–: ",
    timelineTitle: "à¤¸à¥à¤¥à¤¾à¤¨à¤¾à¤‚à¤¤à¤°à¤£ à¤¸à¤®à¤¯à¤°à¥‡à¤–à¤¾ à¤¸à¥à¤¥à¤¿à¤¤à¤¿",
    stages: {
      pending: "à¤²à¤‚à¤¬à¤¿à¤¤",
      confirmed: "à¤ªà¥à¤·à¥à¤Ÿà¤¿ à¤•à¥€ à¤—à¤ˆ",
      'in-progress': "à¤ªà¥à¤°à¤—à¤¤à¤¿ à¤ªà¤°",
      completed: "à¤ªà¥‚à¤°à¤¾ à¤¹à¥à¤†"
    },
    addressDetails: "à¤ªà¤¤à¤¾ à¤µà¤¿à¤µà¤°à¤£",
    from: "à¤•à¤¹à¤¾à¤ à¤¸à¥‡ (à¤ªà¤¿à¤•à¤…à¤ª)",
    to: "à¤•à¤¹à¤¾à¤ à¤¤à¤• (à¤¡à¤¿à¤²à¥€à¤µà¤°à¥€)",
    floor: "à¤®à¤‚à¤œà¤¿à¤²: ",
    ground: "à¤­à¥‚à¤¤à¤²",
    noLift: "à¤²à¤¿à¤«à¥à¤Ÿ à¤¨à¤¹à¥€à¤‚",
    lift: "à¤¸à¤°à¥à¤µà¤¿à¤¸ à¤²à¤¿à¤«à¥à¤Ÿ",
    notSpecified: "à¤¨à¤¿à¤°à¥à¤¦à¤¿à¤·à¥à¤Ÿ à¤¨à¤¹à¥€à¤‚",
    assignedDetails: "à¤…à¤¸à¤¾à¤‡à¤¨ à¤•à¤¿à¤ à¤—à¤ à¤µà¤¿à¤µà¤°à¤£",
    shiftingCategory: "à¤¸à¥à¤¥à¤¾à¤¨à¤¾à¤‚à¤¤à¤°à¤£ à¤¶à¥à¤°à¥‡à¤£à¥€",
    vehicleAllocated: "à¤†à¤µà¤‚à¤Ÿà¤¿à¤¤ à¤µà¤¾à¤¹à¤¨",
    date: "à¤¦à¤¿à¤¨à¤¾à¤‚à¤•",
    slot: "à¤ªà¤¸à¤‚à¤¦à¥€à¤¦à¤¾ à¤¸à¥à¤²à¥‰à¤Ÿ",
    quoteCalculations: "à¤•à¥‹à¤Ÿà¥‡à¤¶à¤¨ à¤—à¤£à¤¨à¤¾",
    addonEstimation: "à¤à¤¡-à¤‘à¤¨ à¤¸à¥‡à¤µà¤¾à¤“à¤‚ à¤•à¤¾ à¤…à¤¨à¥à¤®à¤¾à¤¨:",
    baseCharge: "à¤®à¥‚à¤² à¤µà¤¾à¤¹à¤¨ à¤¶à¥à¤²à¥à¤•:",
    pendingReview: "à¤¸à¤®à¥€à¤•à¥à¤·à¤¾ à¤²à¤‚à¤¬à¤¿à¤¤",
    combinedCost: "à¤¸à¤‚à¤¯à¥à¤•à¥à¤¤ à¤šà¤¾à¤²à¤¾à¤¨ à¤²à¤¾à¤—à¤¤:",
    awaitingEstimation: "à¤…à¤¨à¥à¤®à¤¾à¤¨ à¤•à¥€ à¤ªà¥à¤°à¤¤à¥€à¤•à¥à¤·à¤¾",
    calculatingQuote: "à¤¹à¤®à¤¾à¤°à¥‡ à¤ªà¥à¤°à¤¬à¤‚à¤§à¤• à¤†à¤ªà¤•à¥‡ à¤¸à¤¾à¤®à¤¾à¤¨ à¤•à¥€ à¤®à¤¾à¤¤à¥à¤°à¤¾ à¤•à¥‡ à¤²à¤¿à¤ à¤¸à¥à¤¥à¤¾à¤¨à¥€à¤¯ à¤ªà¤°à¤¿à¤µà¤¹à¤¨ à¤¦à¤°à¥‹à¤‚ à¤•à¥€ à¤—à¤£à¤¨à¤¾ à¤•à¤° à¤°à¤¹à¥‡ à¤¹à¥ˆà¤‚à¥¤ à¤¹à¤® 2 à¤˜à¤‚à¤Ÿà¥‡ à¤•à¥‡ à¤­à¥€à¤¤à¤° à¤à¤¸à¤à¤®à¤à¤¸/à¤µà¥à¤¹à¤¾à¤Ÿà¥à¤¸à¤à¤ª à¤•à¥‡ à¤®à¤¾à¤§à¥à¤¯à¤® à¤¸à¥‡ à¤…à¤ªà¤¡à¥‡à¤Ÿà¥‡à¤¡ à¤•à¥‹à¤Ÿà¥‡à¤¶à¤¨ à¤­à¥‡à¤œà¥‡à¤‚à¤—à¥‡à¥¤",
    notFound: "à¤¬à¥à¤•à¤¿à¤‚à¤— à¤µà¤¿à¤µà¤°à¤£ à¤°à¤¿à¤•à¥‰à¤°à¥à¤¡ à¤¨à¤¹à¥€à¤‚ à¤®à¤¿à¤²à¤¾à¥¤"
  },
  gu: {
    back: "àª¬à«àª•àª¿àª‚àª— àªªàª° àªªàª¾àª›àª¾ àªœàª¾àª“",
    bookingRef: "àª¬à«àª•àª¿àª‚àª— àª¸àª‚àª¦àª°à«àª­ àª¨àª‚àª¬àª°",
    requestedOn: "àªµàª¿àª¨àª‚àª¤à«€ àª¤àª¾àª°à«€àª–: ",
    timelineTitle: "àª¶àª¿àª«à«àªŸàª¿àª‚àª— àªªà«àª°àª—àª¤àª¿ àª¸à«àª¥àª¿àª¤àª¿",
    stages: {
      pending: "àª¬àª¾àª•à«€ àª›à«‡",
      confirmed: "àª•àª¨à«àª«àª°à«àª® àª¥àª¯à«‡àª²",
      'in-progress': "àªšàª¾àª²à« àª›à«‡",
      completed: "àªªà«‚àª°à«àª£ àª¥àª¯à«‡àª²"
    },
    addressDetails: "àª¸àª°àª¨àª¾àª®àª¾àª¨à«€ àªµàª¿àª—àª¤à«‹",
    from: "àª•à«àª¯àª¾àª‚àª¥à«€ (àªªàª¿àª•àª…àªª)",
    to: "àª•à«àª¯àª¾àª‚ (àª¡àª¿àª²àª¿àªµàª°à«€)",
    floor: "àª®àª¾àª³: ",
    ground: "àª—à«àª°àª¾àª‰àª¨à«àª¡ àª«à«àª²à«‹àª°",
    noLift: "àª²àª¿àª«à«àªŸ àª¨àª¥à«€",
    lift: "àª¸àª°à«àªµàª¿àª¸ àª²àª¿àª«à«àªŸ",
    notSpecified: "àª†àªªà«‡àª² àª¨àª¥à«€",
    assignedDetails: "àªŸà«àª°àª• àª…àª¨à«‡ àª¸àª®àª¯àª¨à«€ àªµàª¿àª—àª¤",
    shiftingCategory: "àª¶àª¿àª«à«àªŸàª¿àª‚àª— àª•à«‡àªŸà«‡àª—àª°à«€",
    vehicleAllocated: "àª«àª¾àª³àªµà«‡àª² àªµàª¾àª¹àª¨",
    date: "àª¤àª¾àª°à«€àª–",
    slot: "àªªàª¸àª‚àª¦àª—à«€àª¨à«‹ àª¸àª®àª¯",
    quoteCalculations: "àª­àª¾àªµ àª—àª£àª¤àª°à«€",
    addonEstimation: "àªµàª§àª¾àª°àª¾àª¨à«€ àª¸à«‡àªµàª¾àª“àª¨à«‹ àª–àª°à«àªš:",
    baseCharge: "àªµàª¾àª¹àª¨àª¨à«àª‚ àª¬à«‡àª àª­àª¾àª¡à«àª‚:",
    pendingReview: "àª—àª£àª¤àª°à«€ àª¬àª¾àª•à«€ àª›à«‡",
    combinedCost: "àª•à«àª² àª¬àª¿àª² àª°àª•àª®:",
    awaitingEstimation: "àª­àª¾àªµ àª—àª£àª¤àª°à«€ àªšàª¾àª²à« àª›à«‡",
    calculatingQuote: "àª…àª®àª¾àª°àª¾ àª®à«‡àª¨à«‡àªœàª°à«‹ àª¤àª®àª¾àª°àª¾ àª¸àª¾àª®àª¾àª¨àª¨àª¾ àªªà«àª°àª®àª¾àª£ àª®à«àªœàª¬ àª²à«‹àª•àª² àªŸà«àª°àª¾àª¨à«àª¸àªªà«‹àª°à«àªŸ àª­àª¾àª¡àª¾àª¨à«€ àª—àª£àª¤àª°à«€ àª•àª°à«€ àª°àª¹à«àª¯àª¾ àª›à«‡. àª…àª®à«‡ à«¨ àª•àª²àª¾àª•àª®àª¾àª‚ àªàª¸àªàª®àªàª¸/àªµà«‹àªŸà«àª¸àªàªª àª¦à«àªµàª¾àª°àª¾ àª¨àªµà«‹ àª­àª¾àªµ àª®à«‹àª•àª²à«€àª¶à«àª‚.",
    notFound: "àª¬à«àª•àª¿àª‚àª— àªµàª¿àª—àª¤àª¨à«‹ àª°à«‡àª•à«‹àª°à«àª¡ àª®àª³à«àª¯à«‹ àª¨àª¥à«€."
  }
};

export default function CustomerBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { initializeAuth } = useAuthStore();
  const { language } = useLanguageStore();
  const t = DETAIL_TRANSLATIONS[language] || DETAIL_TRANSLATIONS['en'];
  const bookingId = params.id;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const loadDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getBookingById(bookingId);
      setBooking(data);
    } catch (err) {
      toast.error(t.notFound);
      router.push('/website/my-bookings');
    } finally {
      setLoading(false);
    }
  }, [bookingId, router, t.notFound]);

  useEffect(() => {
    if (bookingId) {
      loadDetails();
    }
  }, [bookingId, loadDetails]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-page flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!booking) return null;

  const grandTotal = booking.totalAmount || booking.pricing?.totalAmount || ((booking.manualQuote || 0) + (booking.addOnTotal || 0));
  const selectedTruck = booking.pricing?.breakdown?.selectedTruck || {};
  const truckName = selectedTruck.name || booking.truckType?.replace?.(/[_-]/g, ' ');
  const truckCapacity = selectedTruck.capacityKg ? `${Number(selectedTruck.capacityKg).toLocaleString('en-IN')} kg` : selectedTruck.capacityLabel || '';
  const currentStatus = normalizeStatus(booking.status);
  const trackingStages = [
    { key: 'pending', label: t.stages.pending || 'Pending' },
    { key: 'quote_sent', label: 'Quote Sent' },
    { key: 'confirmed', label: t.stages.confirmed || 'Confirmed' },
    { key: 'in_progress', label: t.stages['in-progress'] || 'In Progress' },
    { key: 'completed', label: t.stages.completed || 'Completed' },
  ];
  const activeStageIndex = Math.max(0, trackingStages.findIndex((stage) => stage.key === currentStatus));
  const isCancelled = currentStatus === 'cancelled';

  const getLocalizedServiceLabel = (service) => {
    const labels = {
      'local-shifting': language === 'gu' ? 'àª²à«‹àª•àª² àª¶àª¿àª«à«àªŸàª¿àª‚àª—' : language === 'hi' ? 'à¤²à¥‹à¤•à¤² à¤¶à¤¿à¤«à¥à¤Ÿà¤¿à¤‚à¤—' : 'Local Shifting',
      'local': language === 'gu' ? 'àª²à«‹àª•àª² àª¶àª¿àª«à«àªŸàª¿àª‚àª—' : language === 'hi' ? 'àª²à«‹àª•àª² àª¶àª¿àª«à«àªŸàª¿àª‚àª—' : 'Local Shifting',
      'intercity-moving': language === 'gu' ? 'àª†àª‚àª¤àª°-àª¶àª¹à«‡àª°à«€ àª¶àª¿àª«à«àªŸàª¿àª‚àª—' : language === 'hi' ? 'à¤‡à¤‚à¤Ÿà¤°à¤¸à¤¿à¤Ÿà¥€ à¤®à¥‚à¤µà¤¿à¤‚à¤—' : 'Intercity Moving',
      'intercity': language === 'gu' ? 'àª†àª‚àª¤àª°-àª¶àª¹à«‡àª°à«€ àª¶àª¿àª«à«àªŸàª¿àª‚àª—' : language === 'hi' ? 'à¤‡à¤‚à¤Ÿà¤°à¤¸à¤¿à¤Ÿà¥€ à¤®à¥‚à¤µà¤¿à¤‚à¤—' : 'Intercity Moving',
      'packing-service': language === 'gu' ? 'àª¸àª¾àª®àª¾àª¨à«àª¯ àª¸à«‡àªµàª¾ (Ordinary)' : language === 'hi' ? 'à¤¸à¤¾à¤§à¤¾à¤°à¤£ à¤¸à¥‡à¤µà¤¾ (Ordinary)' : 'Ordinary Service',
      'packing': language === 'gu' ? 'àª¸àª¾àª®àª¾àª¨à«àª¯ àª¸à«‡àªµàª¾ (Ordinary)' : language === 'hi' ? 'à¤¸à¤¾à¤§à¤¾à¤°à¤£ à¤¸à¥‡à¤µà¤¾ (Ordinary)' : 'Ordinary Service',
      'commercial-moving': language === 'gu' ? 'àªµà«àª¯àª¾àªªàª¾àª° àª¸à«àª¥àª³àª¾àª‚àª¤àª°' : language === 'hi' ? 'à¤µà¥à¤¯à¤¾à¤µàª¸àª¾àª¯à¤¿à¤• àª¸à«àª¥àª³àª¾àª‚àª¤àª°' : 'Business Relocation',
      'commercial': language === 'gu' ? 'àªµà«àª¯àª¾àªªàª¾àª° àª¸à«àª¥àª³àª¾àª‚àª¤àª°' : language === 'hi' ? 'à¤µà¥à¤¯à¤¾à¤µàª¸àª¾àª¯àª¿àª• àª¸à«àª¥àª³àª¾àª‚àª¤àª°' : 'Business Relocation'
    };
    return labels[service] || getServiceLabel(service);
  };

  return (
    <div className="min-h-screen bg-bg-page text-text-primary pt-32 pb-16">
      <div className="max-w-3xl mx-auto px-4 text-left flex flex-col gap-6">
        
        {/* Header navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/website/my-bookings')}
            className="text-xs font-bold text-text-secondary hover:text-text-primary flex items-center gap-1 focus:outline-none"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.back}
          </button>
          
          <Badge variant="status" type={booking.status} className="px-3" />
        </div>

        {/* Shifting references */}
        <div className="flex flex-col gap-1 text-left">
          <span className="text-xs uppercase font-bold tracking-widest text-primary">{t.bookingRef}</span>
          <h1 className="text-2xl font-black text-text-primary">{booking.bookingid || booking.bookingId}</h1>
          <span className="text-[10px] text-text-tertiary">{t.requestedOn}{formatDate(booking.createdAt)}</span>
        </div>

        {/* Progress Timeline status bar */}
        <Card className="p-5 bg-bg-white border border-bg-border/60 shadow-xs flex flex-col gap-4 text-center">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider text-left border-b border-bg-border/40 pb-2 mb-1">
            {t.timelineTitle}
          </h3>

          <div className="grid grid-cols-5 gap-2 text-[9px] font-bold uppercase text-text-secondary sm:text-xs">
            {trackingStages.map((stage, idx) => {
              const isActive = !isCancelled && idx === activeStageIndex;
              const isCompleted = !isCancelled && idx < activeStageIndex;
              const stageLabel = stage.label;

              return (
                <div key={stage.key} className="flex flex-col items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                    isActive ? 'border-primary bg-primary/10 text-primary shadow-[0_0_10px_rgba(255,87,34,0.15)]' :
                    isCompleted ? 'bg-primary border-primary text-white' : 'border-bg-border text-text-tertiary'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className={isActive ? 'text-primary font-bold' : isCompleted ? 'text-text-primary' : 'text-text-tertiary'}>
                    {stageLabel}
                  </span>
                </div>
              );
            })}
          </div>
          {isCancelled && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600">This booking has been cancelled.</p>}
        </Card>

        {/* Row layouts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Address metrics */}
          <Card className="p-4 bg-bg-white border border-bg-border/60 text-xs shadow-xs">
            <h4 className="font-bold text-text-primary uppercase tracking-wider mb-3 flex items-center gap-1.5 text-left">
              <MapPin className="w-4 h-4 text-primary" /> {t.addressDetails}
            </h4>
            <div className="flex flex-col gap-3 text-left">
              <div>
                <span className="text-text-tertiary block">{t.from}</span>
                <span className="text-text-primary font-medium">{booking.pickupLocation?.address || t.notSpecified}</span>
                <span className="text-text-secondary block mt-0.5 font-bold">
                  {t.floor}{booking.pickupLocation?.floor === 0 ? t.ground : `${booking.pickupLocation?.floor} Floor`} 
                  {booking.pickupLocation?.liftAvailable ? ` | ${t.lift}` : ` | ${t.noLift}`}
                </span>
              </div>
              {booking.dropLocation && (
                <div>
                  <span className="text-text-tertiary block">{t.to}</span>
                  <span className="text-text-primary font-medium">{booking.dropLocation?.address}</span>
                  <span className="text-text-secondary block mt-0.5 font-bold">
                    {t.floor}{booking.dropLocation?.floor === 0 ? t.ground : `${booking.dropLocation?.floor} Floor`} 
                    {booking.dropLocation?.liftAvailable ? ` | ${t.lift}` : ` | ${t.noLift}`}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* assigned vehicle and times */}
          <Card className="p-4 bg-bg-white border border-bg-border/60 text-xs shadow-xs">
            <h4 className="font-bold text-text-primary uppercase tracking-wider mb-3 flex items-center gap-1.5 text-left">
              <Truck className="w-4 h-4 text-primary" /> {t.assignedDetails}
            </h4>
            
            <div className="flex flex-col gap-3 text-left">
              <div>
                <span className="text-text-tertiary block">{t.shiftingCategory}</span>
                <span className="text-text-primary font-bold">{getLocalizedServiceLabel(booking.serviceType)}</span>
              </div>
              {(booking.truckType || selectedTruck.name) && (
                <div>
                  <span className="text-text-tertiary block">{t.vehicleAllocated}</span>
                  <div className="mt-1 flex items-center gap-3 rounded-xl border border-bg-border bg-bg-section p-2">
                    <img src={getTruckImageSrc(selectedTruck)} alt={truckName || 'Vehicle'} className="h-14 w-16 shrink-0 rounded-lg object-cover" onError={(event) => { event.currentTarget.src = getTruckImageSrc({}); }} />
                    <span className="min-w-0">
                      <span className="block truncate text-text-primary font-semibold capitalize">{truckName || 'Vehicle'}</span>
                      <span className="text-[11px] font-semibold text-text-tertiary">{truckCapacity || 'Capacity not set'}</span>
                    </span>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 border-t border-bg-border/40 pt-2.5">
                <div>
                  <span className="text-text-tertiary block">{t.date}</span>
                  <span className="text-text-primary font-bold flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5 text-primary" /> {formatBookingDate(booking)}
                  </span>
                </div>
                <div>
                  <span className="text-text-tertiary block">{t.slot}</span>
                  <span className="text-text-primary font-bold capitalize flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-primary" /> {formatBookingTimeSlot(booking)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Pricing calculations details */}
        <Card className="p-5 bg-bg-white border border-bg-border/60 shadow-xs text-xs">
          <h4 className="font-bold text-text-primary uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-bg-border/40 pb-2.5 text-left">
            <DollarSign className="w-4 h-4 text-primary" /> {t.quoteCalculations}
          </h4>
          
          <div className="flex flex-col gap-3 text-left">
            <div className="flex justify-between items-center text-text-secondary">
              <span>{t.addonEstimation}</span>
              <span className="font-mono text-text-primary font-semibold">{formatCurrency(booking.addOnTotal || 0)}</span>
            </div>
            
            <div className="flex justify-between items-center text-text-secondary border-b border-bg-border/40 pb-2">
              <span>{t.baseCharge}</span>
              <span className="font-mono text-text-primary font-semibold">
                {booking.manualQuote > 0 ? formatCurrency(booking.manualQuote) : t.pendingReview}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm font-bold text-primary pt-1 font-mono">
              <span className="text-text-primary">{t.combinedCost}</span>
              <span className="text-base font-black">
                {booking.manualQuote > 0 ? formatCurrency(grandTotal) : t.awaitingEstimation}
              </span>
            </div>

            {booking.manualQuote === 0 && (
              <div className="mt-2 text-center bg-primary/5 border border-primary/20 text-[10px] text-text-secondary rounded p-2.5 leading-normal">
                {t.calculatingQuote}
              </div>
            )}
          </div>
        </Card>

      </div>
    </div>
  );
}

function normalizeStatus(status) {
  return String(status || 'pending').replace(/-/g, '_');
}

