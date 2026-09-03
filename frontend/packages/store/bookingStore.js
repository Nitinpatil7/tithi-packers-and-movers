import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculateBookingPrice } from '@tithi/utils/pricing';

const initialBookingData = {
  serviceType: null,         // 'local' | 'intercity' | 'labour'
  bookingId: null,
  draftToken: null,
  pricingRule: null,
  pickupLocation: {
    address: '',
    floor: 0,
    liftAvailable: false,
    lat: null,
    lng: null
  },
  dropLocation: {
    address: '',
    floor: 0,
    liftAvailable: false,
    lat: null,
    lng: null
  },
  items: [],                 // List of items { name, quantity, tag, price }
  specialServices: [],       // List of selected add-ons { name, quantity, price, unit }

  // Employee & Hours (Labour & Vehicle service + shared)
  employeeCount: 0,
  employeeTotal: 0,
  selectedTruck: null,
  truckTotal: 0,

  // Hours (Labour & Vehicle service only)
  hoursCount: 0,
  hoursTotal: 0,

  scheduledDate: null,
  timeSlot: null,            // 'morning' | 'afternoon' | 'evening'

  // Pricing breakdown
  basePrice: 1499,
  itemsExtraCharge: 0,
  distance: 0,
  distanceCharge: 0,
  pickupFloorCharge: 0,
  dropFloorCharge: 0,
  floorTotalCharge: 0,
  addOnTotal: 0,
  sundayHike: 0,             // 5% of base total if Sunday
  grandTotal: 0,

  // Contact info
  contactDetails: {
    name: '',
    email: '',
    mobile: ''
  },
  
  // Legacy fields kept for backward compat
  truckType: null,
  timelinePreference: 'Standard',
  manualQuote: 0,
  totalAmount: 0
};

const getInitialBookingData = () => ({
  ...initialBookingData,
  pickupLocation: { ...initialBookingData.pickupLocation },
  dropLocation: { ...initialBookingData.dropLocation },
  items: [],
  specialServices: [],
  contactDetails: { ...initialBookingData.contactDetails },
});

const hasAddress = (location) => Boolean(String(location?.address || '').trim());
const hasSelectedItems = (bookingData) => (bookingData.items || []).some((item) => Number(item.quantity || 0) > 0);
const hasSchedule = (bookingData) => Boolean(bookingData.scheduledDate && bookingData.timeSlot);
const hasTruckChoice = (bookingData) => bookingData.labourOnly === true || Boolean(bookingData.selectedTruck || bookingData.truckType || bookingData.selectedTruckData);
const hasEmployees = (bookingData) => Number(bookingData.employeeCount || 0) > 0;
const hasHours = (bookingData) => Number(bookingData.hoursCount || 0) > 0;

const validators = {
  location: (bookingData, rule = {}) => hasAddress(bookingData.pickupLocation) && (rule.dropOptional || hasAddress(bookingData.dropLocation)),
  items: hasSelectedItems,
  schedule: hasSchedule,
  truck: hasTruckChoice,
  employees: hasEmployees,
  hours: hasHours,
  optional: () => true,
};

const normalizeStepRules = (stepRules = []) => Array.isArray(stepRules)
  ? stepRules.map((rule) => (typeof rule === 'string' ? { type: rule } : rule || { type: 'optional' }))
  : [];

const firstReachableStep = (requestedStep, bookingData, stepRules = []) => {
  const safeStep = Math.max(0, Number(requestedStep) || 0);
  const rules = normalizeStepRules(stepRules);
  if (!rules.length) return safeStep;

  for (let index = 0; index < Math.min(safeStep, rules.length); index += 1) {
    const rule = rules[index];
    const validate = validators[rule.type || 'optional'] || validators.optional;
    if (!validate(bookingData, rule)) return index;
  }
  return safeStep;
};

export const useBookingStore = create(persist((set) => ({
  currentStep: 0,
  bookingData: getInitialBookingData(),

  setStep: (step, stepRules) => set((state) => {
    const nextStep = firstReachableStep(step, state.bookingData, stepRules);
    return nextStep === state.currentStep ? state : { currentStep: nextStep };
  }),

  updateBookingData: (data) => set((state) => {
    const updatedData = { ...state.bookingData };

    // Deep merge locations and contact details
    if (data.pickupLocation) {
      updatedData.pickupLocation = { ...updatedData.pickupLocation, ...data.pickupLocation };
    }
    if (data.dropLocation) {
      updatedData.dropLocation = { ...updatedData.dropLocation, ...data.dropLocation };
    }
    if (data.contactDetails) {
      updatedData.contactDetails = { ...updatedData.contactDetails, ...data.contactDetails };
    }

    // Merge standard properties
    Object.keys(data).forEach(key => {
      if (key !== 'pickupLocation' && key !== 'dropLocation' && key !== 'contactDetails') {
        updatedData[key] = data[key];
      }
    });

    // Recalculate price components
    const pricing = calculateBookingPrice(updatedData);

    updatedData.basePrice = pricing.basePrice;
    updatedData.itemsExtraCharge = pricing.itemsExtraCharge;
    updatedData.distance = pricing.distance;
    updatedData.distanceCharge = pricing.distanceCharge;
    updatedData.pickupFloorCharge = pricing.pickupFloorCharge;
    updatedData.dropFloorCharge = pricing.dropFloorCharge;
    updatedData.floorTotalCharge = pricing.floorTotalCharge;
    updatedData.employeeTotal = pricing.employeeTotal;
    updatedData.truckTotal = pricing.truckTotal;
    updatedData.addOnTotal = pricing.addOnTotal;
    updatedData.sundayHike = pricing.sundayHike;
    updatedData.grandTotal = pricing.grandTotal;
    updatedData.pricingBreakdown = pricing.breakdown;
    updatedData.totalAmount = pricing.grandTotal + (updatedData.manualQuote || 0);

    return { bookingData: updatedData };
  }),

  resetBooking: () => set({ currentStep: 0, bookingData: getInitialBookingData() }),

  nextStep: (stepRules) => set((state) => {
    const nextStep = firstReachableStep(state.currentStep + 1, state.bookingData, stepRules);
    return nextStep === state.currentStep ? state : { currentStep: nextStep };
  }),

  prevStep: () => set((state) => {
    const nextStep = Math.max(0, state.currentStep - 1);
    return nextStep === state.currentStep ? state : { currentStep: nextStep };
  }),
}), {
  name: 'tithi_booking_draft',
  version: 1,
  skipHydration: true,
  partialize: (state) => ({ currentStep: state.currentStep, bookingData: state.bookingData }),
}));
