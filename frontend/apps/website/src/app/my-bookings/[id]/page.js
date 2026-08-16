// src/app/my-bookings/[id]/page.js
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@store/authStore';
import { getBookingById } from '@lib/api';
import Card from '@ui/Card';
import Badge from '@ui/Badge';
import Spinner from '@ui/Spinner';
import { formatBookingDate, formatBookingTimeSlot, formatCurrency, formatDate, getServiceLabel } from '@utils/utils';
import { ArrowLeft, MapPin, Truck, DollarSign, CalendarDays, Clock, User, PackageCheck, Sparkles, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguageStore } from '@store/languageStore';
import { getTruckImageSrc } from '@utils/truckVisuals';
import { ItemIcon } from '@utils/itemIcons';

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
    quoteCalculations: "Booking Cost Summary",
    pendingReview: "Quote under review",
    combinedCost: "Estimated Booking Total",
    awaitingEstimation: "Quote under review",
    calculatingQuote: "Our team is reviewing your booking details. The final quote will be shared by SMS/WhatsApp after review.",
    notFound: "Booking detail record not found."
  },
  hi: {
    back: "बुकिंग पर वापस जाएं",
    bookingRef: "बुकिंग संदर्भ",
    requestedOn: "अनुरोध की तारीख: ",
    timelineTitle: "स्थानांतरण समयरेखा स्थिति",
    stages: {
      pending: "लंबित",
      confirmed: "पुष्टि की गई",
      'in-progress': "प्रगति पर",
      completed: "पूरा हुआ"
    },
    addressDetails: "पता विवरण",
    from: "कहाँ से (पिकअप)",
    to: "कहाँ तक (डिलीवरी)",
    floor: "मंजिल: ",
    ground: "भूतल",
    noLift: "लिफ्ट नहीं",
    lift: "सर्विस लिफ्ट",
    notSpecified: "निर्दिष्ट नहीं",
    assignedDetails: "असाइन किए गए विवरण",
    shiftingCategory: "स्थानांतरण श्रेणी",
    vehicleAllocated: "आवंटित वाहन",
    date: "दिनांक",
    slot: "पसंदीदा स्लॉट",
    quoteCalculations: "बुकिंग लागत सारांश",
    pendingReview: "समीक्षा लंबित",
    combinedCost: "कुल अनुमानित राशि:",
    awaitingEstimation: "अनुमान की प्रतीक्षा",
    calculatingQuote: "हमारे प्रबंधक आपके सामान की मात्रा के लिए स्थानीय परिवहन दरों की गणना कर रहे हैं। हम 2 घंटे के भीतर एसएमएस/व्हाट्सएप के माध्यम से अपडेटेड कोटेशन भेजेंगे।",
    notFound: "बुकिंग विवरण रिकॉर्ड नहीं मिला।"
  },
  gu: {
    back: "બુકિંગ પર પાછા જાઓ",
    bookingRef: "બુકિંગ સંદર્ભ નંબર",
    requestedOn: "વિનંતી તારીખ: ",
    timelineTitle: "શિફ્ટિંગ પ્રગતિ સ્થિતિ",
    stages: {
      pending: "બાકી છે",
      confirmed: "કન્ફર્મ થયેલ",
      'in-progress': "ચાલુ છે",
      completed: "પૂર્ણ થયેલ"
    },
    addressDetails: "સરનામાની વિગતો",
    from: "ક્યાંથી (પિકઅપ)",
    to: "ક્યાં (ડિલિવરી)",
    floor: "માળ: ",
    ground: "ગ્રાઉન્ડ ફ્લોર",
    noLift: "લિફ્ટ નથી",
    lift: "સર્વિસ લિફ્ટ",
    notSpecified: "આપેલ નથી",
    assignedDetails: "ટ્રક અને સમયની વિગત",
    shiftingCategory: "શિફ્ટિંગ કેટેગરી",
    vehicleAllocated: "ફાળવેલ વાહન",
    date: "તારીખ",
    slot: "પસંદગીનો સમય",
    quoteCalculations: "બુકિંગ ખર્ચ સારાંશ",
    pendingReview: "ગણતરી બાકી છે",
    combinedCost: "કુલ બિલ રકમ:",
    awaitingEstimation: "ભાવ ગણતરી ચાલુ છે",
    calculatingQuote: "અમારા મેનેજરો તમારા સામાનના પ્રમાણ મુજબ લોકલ ટ્રાન્સપોર્ટ ભાડાની ગણતરી કરી રહ્યા છે. અમે ૨ કલાકમાં એસએમએસ/વોટ્સએપ દ્વારા નવો ભાવ મોકલીશું.",
    notFound: "બુકિંગ વિગતનો રેકોર્ડ મળ્યો નથી."
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
      router.push('/my-bookings');
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

  const pricing = booking.pricing || {};
  const breakdown = booking.pricingBreakdown || pricing.breakdown || {};
  const isLabour = booking.serviceType === 'porter_labour_service';
  const itemRows = Array.isArray(booking.items) ? booking.items : [];
  const addonRows = Array.isArray(booking.selectedAddons) ? booking.selectedAddons : [];
  const itemQuantity = itemRows.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const itemTotal = Number(booking.itemTotal || pricing.itemTotal || 0);
  const addOnTotal = Number(booking.addOnTotal || pricing.addOnTotal || addonRows.reduce((sum, item) => sum + Number(item.total || 0), 0));
  const distanceCharge = Number(booking.distanceCharge || breakdown.distanceCharge || 0);
  const floorTotalCharge = Number(booking.floorTotalCharge || breakdown.floorTotalCharge || 0);
  const employeeTotal = Number(booking.employeeTotal || breakdown.employeeTotal || 0);
  const truckTotal = Number(booking.truckTotal || breakdown.truckTotal || 0);
  const sundayHike = Number(booking.sundayHike || breakdown.sundayHike || 0);
  const discount = Number(pricing.discount || 0);
  const tax = Number(pricing.tax || 0);
  const basePrice = Number(breakdown.basePrice || 0);
  const serviceChargeRemainder = Math.max(0, Number(pricing.serviceCharge || 0) - distanceCharge - floorTotalCharge - employeeTotal - truckTotal);
  const movingCharge = Number(booking.manualQuote || basePrice || serviceChargeRemainder || 0) + itemTotal;
  const grandTotal = Number(booking.totalAmount || pricing.totalAmount || (movingCharge + distanceCharge + floorTotalCharge + addOnTotal + employeeTotal + truckTotal + sundayHike + tax - discount));
  const quoteReady = grandTotal > 0 || movingCharge > 0 || addOnTotal > 0;
  const chargeRows = [
    !isLabour && movingCharge > 0 && { label: 'Moving service and items', detail: `${itemQuantity || itemRows.length || 0} item(s) selected`, value: movingCharge },
    distanceCharge > 0 && { label: 'Distance charge', detail: booking.distanceKm ? `${booking.distanceKm} km route` : '', value: distanceCharge },
    !isLabour && floorTotalCharge > 0 && { label: 'Floor / lift charge', detail: buildFloorSummary(booking.pickupLocation, booking.dropLocation), value: floorTotalCharge },
    addOnTotal > 0 && { label: 'Add-on service charges', detail: `${addonRows.length} add-on(s) selected`, value: addOnTotal },
    isLabour && employeeTotal > 0 && { label: 'Labour charge', detail: `${booking.hoursCount || 1} hour package for ${booking.employeeCount || 1} employee(s)`, value: employeeTotal },
    isLabour && truckTotal > 0 && { label: 'Truck charge', detail: booking.truckType?.replace?.(/[_-]/g, ' ') || 'Selected vehicle', value: truckTotal },
    sundayHike > 0 && { label: 'Sunday booking adjustment', detail: 'Weekend crew availability adjustment', value: sundayHike },
    discount > 0 && { label: 'Discount', value: -discount },
    tax > 0 && { label: 'Tax', value: tax },
  ].filter(Boolean);
  const selectedTruck = breakdown.selectedTruck || {};
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
      'local-shifting': language === 'gu' ? 'લોકલ શિફ્ટિંગ' : language === 'hi' ? 'लोकल शिफ्टिंग' : 'Local Shifting',
      'local': language === 'gu' ? 'લોકલ શિફ્ટિંગ' : language === 'hi' ? 'લોકલ શિફ્ટિંગ' : 'Local Shifting',
      'intercity-moving': language === 'gu' ? 'આંતર-શહેરી શિફ્ટિંગ' : language === 'hi' ? 'इंटरसिटी मूविंग' : 'Intercity Moving',
      'intercity': language === 'gu' ? 'આંતર-શહેરી શિફ્ટિંગ' : language === 'hi' ? 'इंटरसिटी मूविंग' : 'Intercity Moving',
      'packing-service': language === 'gu' ? 'સામાન્ય સેવા (Ordinary)' : language === 'hi' ? 'साधारण सेवा (Ordinary)' : 'Ordinary Service',
      'packing': language === 'gu' ? 'સામાન્ય સેવા (Ordinary)' : language === 'hi' ? 'साधारण सेवा (Ordinary)' : 'Ordinary Service',
      'commercial-moving': language === 'gu' ? 'વ્યાપાર સ્થળાંતર' : language === 'hi' ? 'व्यावસાયिक સ્થળાંતર' : 'Business Relocation',
      'commercial': language === 'gu' ? 'વ્યાપાર સ્થળાંતર' : language === 'hi' ? 'व्यावસાયિક સ્થળાંતર' : 'Business Relocation'
    };
    return labels[service] || getServiceLabel(service);
  };

  return (
    <div className="min-h-screen bg-bg-page text-text-primary pt-32 pb-16">
      <div className="max-w-3xl mx-auto px-4 text-left flex flex-col gap-6">
        
        {/* Header navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/my-bookings')}
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
          <Card className="p-4 bg-bg-white border border-bg-border/60 text-xs shadow-xs">
            <h4 className="font-bold text-text-primary uppercase tracking-wider mb-3 flex items-center gap-1.5 text-left">
              <User className="w-4 h-4 text-primary" /> Customer Details
            </h4>
            <div className="flex flex-col gap-2 text-left">
              <div>
                <span className="text-text-tertiary block">Name</span>
                <span className="text-text-primary font-bold">{booking.customer?.name || booking.customerName || t.notSpecified}</span>
              </div>
              <div>
                <span className="text-text-tertiary block">Mobile</span>
                <span className="text-text-primary font-bold">{booking.customer?.mobile || booking.customerMobile || t.notSpecified}</span>
              </div>
              {(booking.customer?.email || booking.email) && (
                <div>
                  <span className="text-text-tertiary block">Email</span>
                  <span className="text-text-primary font-bold">{booking.customer?.email || booking.email}</span>
                </div>
              )}
            </div>
          </Card>
          
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
                  {formatFloorLine(booking.pickupLocation, t)}
                </span>
              </div>
              {booking.dropLocation && (
                <div>
                  <span className="text-text-tertiary block">{t.to}</span>
                  <span className="text-text-primary font-medium">{booking.dropLocation?.address}</span>
                  <span className="text-text-secondary block mt-0.5 font-bold">
                    {formatFloorLine(booking.dropLocation, t)}
                  </span>
                </div>
              )}
              {booking.distanceKm > 0 && (
                <div>
                  <span className="text-text-tertiary block">Route distance</span>
                  <span className="text-text-primary font-bold">{booking.distanceKm} km</span>
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
                    <Image unoptimized src={getTruckImageSrc(selectedTruck)} alt={truckName || 'Vehicle'} width={64} height={56} className="h-14 w-16 shrink-0 rounded-lg object-cover" />
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

        {!isLabour && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 bg-bg-white border border-bg-border/60 text-xs shadow-xs">
              <h4 className="font-bold text-text-primary uppercase tracking-wider mb-3 flex items-center gap-1.5 text-left">
                <PackageCheck className="w-4 h-4 text-primary" /> Selected Items
              </h4>
              {itemRows.length ? (
                <div className="flex flex-col gap-2">
                  {itemRows.map((item) => (
                    <div key={`${item.itemkey || item.name}-${item.sizeTag || ''}`} className="flex items-center justify-between gap-3 rounded-xl border border-bg-border bg-bg-section px-3 py-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-primary ring-1 ring-primary/10">
                          <ItemIcon icon={item.icon} className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-bold text-text-primary">{item.name}</span>
                          <span className="text-[10px] font-semibold text-text-tertiary">{item.category || item.sizeTag || 'Item detail'}</span>
                        </span>
                      </div>
                      <span className="shrink-0 text-right font-mono font-black text-text-primary">
                        x{Number(item.quantity || 1)}
                        {Number(item.lineTotal || 0) > 0 && <span className="block text-[10px] text-primary">{formatCurrency(item.lineTotal)}</span>}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-bg-border bg-bg-section p-4 text-center font-semibold text-text-secondary">No item checklist saved for this booking.</p>
              )}
            </Card>

            <Card className="p-4 bg-bg-white border border-bg-border/60 text-xs shadow-xs">
              <h4 className="font-bold text-text-primary uppercase tracking-wider mb-3 flex items-center gap-1.5 text-left">
                <Sparkles className="w-4 h-4 text-primary" /> Add-on Services
              </h4>
              {addonRows.length ? (
                <div className="flex flex-col gap-2">
                  {addonRows.map((addon) => (
                    <div key={`${addon.key || addon.name}-${addon.quantity}`} className="flex items-center justify-between gap-3 rounded-xl border border-orange-100 bg-orange-50/50 px-3 py-2">
                      <span className="min-w-0">
                        <span className="block truncate font-bold text-text-primary">{addon.name}</span>
                        <span className="text-[10px] font-semibold text-text-tertiary">{addon.unit?.replaceAll('_', ' ') || 'Add-on'} x {Number(addon.quantity || 1)}</span>
                      </span>
                      <span className="shrink-0 font-mono font-black text-primary">{formatCurrency(addon.total || 0)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-bg-border bg-bg-section p-4 text-center font-semibold text-text-secondary">No add-on service selected for this booking.</p>
              )}
            </Card>
          </div>
        )}

        {isLabour && (
          <Card className="p-4 bg-bg-white border border-bg-border/60 text-xs shadow-xs">
            <h4 className="font-bold text-text-primary uppercase tracking-wider mb-3 flex items-center gap-1.5 text-left">
              <Users className="w-4 h-4 text-primary" /> Labour Service Details
            </h4>
            <div className="grid gap-3 sm:grid-cols-3">
              <DetailMetric label="Employees" value={`${booking.employeeCount || 0}`} />
              <DetailMetric label="Hours" value={`${booking.hoursCount || 0}`} />
              <DetailMetric label="Truck" value={truckName || booking.truckType || t.notSpecified} />
            </div>
          </Card>
        )}

        {/* Pricing calculations details */}
        <Card className="p-5 bg-bg-white border border-bg-border/60 shadow-xs text-xs">
          <h4 className="font-bold text-text-primary uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-bg-border/40 pb-2.5 text-left">
            <DollarSign className="w-4 h-4 text-primary" /> {t.quoteCalculations}
          </h4>
          
          <div className="flex flex-col gap-3 text-left">
            {chargeRows.length ? chargeRows.map((row) => (
              <div key={row.label} className="flex justify-between items-start gap-4 border-b border-bg-border/40 pb-3 last:border-0 last:pb-0 text-text-secondary">
                <span>
                  <span className="block font-bold text-text-primary">{row.label}</span>
                  {row.detail && <span className="mt-0.5 block text-[10px] font-semibold text-text-tertiary">{row.detail}</span>}
                </span>
                <span className="shrink-0 font-mono text-text-primary font-semibold">{formatCurrency(row.value)}</span>
              </div>
            )) : (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center text-xs font-semibold text-text-secondary">
                {t.pendingReview}
              </div>
            )}

            <div className="flex justify-between items-center text-sm font-bold text-primary pt-1 font-mono">
              <span className="text-text-primary">{t.combinedCost}</span>
              <span className="text-base font-black">
                {quoteReady ? formatCurrency(grandTotal) : t.awaitingEstimation}
              </span>
            </div>

            {!quoteReady && (
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

function formatFloorLine(location = {}, t = {}) {
  if (!location || location.floor === undefined || location.floor === null || location.floor === '') return t.notSpecified || 'Not specified';
  const floorLabel = Number(location.floor) === 0 ? (t.ground || 'Ground') : `${location.floor} Floor`;
  const liftLabel = location.liftAvailable ? (t.lift || 'Service lift') : (t.noLift || 'No lift');
  return `${t.floor || 'Floor: '}${floorLabel} | ${liftLabel}`;
}

function buildFloorSummary(pickup = {}, drop = {}) {
  const values = [];
  if (pickup?.floor !== undefined && pickup?.floor !== null) values.push(`Pickup floor ${pickup.floor}${pickup.liftAvailable ? ' with lift' : ' without lift'}`);
  if (drop?.floor !== undefined && drop?.floor !== null) values.push(`Drop floor ${drop.floor}${drop.liftAvailable ? ' with lift' : ' without lift'}`);
  return values.join(', ');
}

function DetailMetric({ label, value }) {
  return (
    <div className="rounded-xl border border-bg-border bg-bg-section p-3">
      <span className="block text-[10px] font-black uppercase tracking-wide text-text-tertiary">{label}</span>
      <span className="mt-1 block font-bold text-text-primary">{value || '-'}</span>
    </div>
  );
}
