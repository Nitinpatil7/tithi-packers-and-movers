// src/app/(website)/book/labour-service/page.js
'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useBookingStore } from '@tithi/store/bookingStore';
import { useConfirmBookingDraft, useCreateBookingDraft, useUpdateBookingDraft } from '@tithi/hooks/useBookingDraft';
import { usePublicPricingRule } from '@tithi/hooks/useBookingPricingRules';
import { buildDraftCreatePayload, buildDraftUpdatePayload } from '@tithi/utils/bookingPayload';
import BookingLayout from '@tithi/components/booking/BookingLayout';
import ServiceComingSoon from '@tithi/components/booking/ServiceComingSoon';
import toast from 'react-hot-toast';

const STEPS = ['Location', 'Truck', 'Employees', 'Hours', 'Schedule', 'Review', 'Verify OTP'];
const STEP_RULES = [{ type: 'location', dropOptional: true }, 'truck', 'employees', 'hours', 'schedule', 'optional', 'optional'];
const stepLoader = () => <div className="min-h-[360px] rounded-3xl border border-sky-100 bg-white/80" />;
const LocationStep = dynamic(() => import('@tithi/components/booking/LocationStep'), { ssr: false, loading: stepLoader });
const TruckSelectionStep = dynamic(() => import('@tithi/components/booking/TruckSelectionStep'), { ssr: false, loading: stepLoader });
const EmployeeSelectionStep = dynamic(() => import('@tithi/components/booking/EmployeeSelectionStep'), { ssr: false, loading: stepLoader });
const HoursSelectionStep = dynamic(() => import('@tithi/components/booking/HoursSelectionStep'), { ssr: false, loading: stepLoader });
const DateTimeStep = dynamic(() => import('@tithi/components/booking/DateTimeStep'), { ssr: false, loading: stepLoader });
const ReviewStep = dynamic(() => import('@tithi/components/booking/ReviewStep'), { ssr: false, loading: stepLoader });
const OTPStep = dynamic(() => import('@tithi/components/booking/OTPStep'), { ssr: false, loading: stepLoader });
const SuccessStep = dynamic(() => import('@tithi/components/booking/SuccessStep'), { ssr: false, loading: stepLoader });

export default function LabourServicePage() {
  const { currentStep, bookingData, updateBookingData, nextStep, prevStep, resetBooking, setStep } = useBookingStore();
  const createDraftMutation = useCreateBookingDraft();
  const updateDraftMutation = useUpdateBookingDraft();
  const confirmDraftMutation = useConfirmBookingDraft();
  const { data: pricingRule, isLoading: pricingLoading } = usePublicPricingRule('porter_labour_service');
  const [createdBookingId, setCreatedBookingId] = useState(null);

  useEffect(() => {
    if (bookingData.serviceType !== 'labour') {
      resetBooking();
      updateBookingData({ serviceType: 'labour' });
    }
  }, [bookingData.serviceType, resetBooking, updateBookingData]);

  useEffect(() => {
    if (currentStep > STEPS.length && !createdBookingId) {
      resetBooking();
      updateBookingData({ serviceType: 'labour' });
    }
    setStep(currentStep, STEP_RULES);
  }, [currentStep, createdBookingId, resetBooking, setStep, updateBookingData]);

  useEffect(() => {
    if (pricingRule?._id && bookingData.pricingRule?._id !== pricingRule._id) updateBookingData({ pricingRule });
  }, [pricingRule, bookingData.pricingRule?._id, updateBookingData]);

  const handleStepSubmit = (stepData) => {
    updateBookingData(stepData);
    if (stepData.useBasePackage) setStep(4, STEP_RULES);
    else nextStep(STEP_RULES);
  };
  const handleLocationSubmit = async (stepData) => {
    const nextData = { ...bookingData, ...stepData, serviceType: 'labour', pricingRule: pricingRule || bookingData.pricingRule };
    updateBookingData(stepData);
    if (!bookingData.bookingId || !bookingData.draftToken) {
      try {
        const response = await createDraftMutation.mutateAsync(buildDraftCreatePayload(nextData));
        updateBookingData({ bookingId: response.booking?.bookingid, draftToken: response.draftToken });
      } catch (error) {
        toast.error(error.message || 'Could not create booking draft.');
        return;
      }
    }
    if (stepData.useBasePackage) setStep(4, STEP_RULES);
    else nextStep(STEP_RULES);
  };

  const handleBack = () => {
    if (bookingData.useBasePackage && currentStep >= 4 && currentStep <= 5) {
      setStep(0, STEP_RULES);
      return;
    }
    prevStep();
  };

  const handleOtpVerified = async (contactData) => {
    const finalData = {
      ...bookingData,
      ...contactData,
      customerName: contactData.contactDetails?.name,
      email: contactData.contactDetails?.email,
      mobile: contactData.contactDetails?.mobile
    };
    try {
      const bookingId = finalData.bookingId;
      const draftToken = finalData.draftToken;
      if (!bookingId || !draftToken) throw new Error('Booking draft missing. Please go back and try again.');
      const draftPayload = buildDraftUpdatePayload(finalData);
      await updateDraftMutation.mutateAsync({ bookingId, draftToken, data: draftPayload });
      const response = await confirmDraftMutation.mutateAsync({ bookingId, draftToken, data: { customer: { name: finalData.contactDetails?.name, email: finalData.contactDetails?.email, mobile: finalData.contactDetails?.mobile }, verificationId: finalData.verificationId, pricing: draftPayload.pricing } });
      setCreatedBookingId(response.bookingid || response.booking?.bookingid || bookingId);
      nextStep(STEP_RULES);
      useBookingStore.persist.clearStorage();
      toast.success('Labour & Vehicle booking confirmed!');
    } catch (error) {
      toast.error(error.message || 'Error submitting request. Please try again.');
    }
  };

  const handleReset = () => {
    resetBooking();
    setStep(0, STEP_RULES);
    setCreatedBookingId(null);
    updateBookingData({ serviceType: 'labour' });
  };

  if (pricingLoading) return <LabourLoading />;
  if (!pricingRule) return <ServiceComingSoon serviceName="Labour & Vehicle" />;

  return (
    <BookingLayout
      title={currentStep === STEPS.length ? 'Booking Confirmed' : STEPS[currentStep] || 'Book Labour & Vehicle'}
      steps={STEPS}
      currentStep={currentStep}
      onBack={handleBack}
    >
      {currentStep === 0 && (
        <LocationStep onSubmit={handleLocationSubmit} initialData={bookingData} serviceType="labour" pricingRule={pricingRule} />
      )}
      {currentStep === 1 && (
        <TruckSelectionStep onSubmit={handleStepSubmit} onBack={prevStep} initialData={bookingData} trucks={pricingRule?.labourPricing?.trucks || []} allowNoTruck />
      )}
      {currentStep === 2 && (
        <EmployeeSelectionStep onSubmit={handleStepSubmit} onBack={prevStep} initialData={bookingData} serviceType="labour" employeeRates={pricingRule?.labourPricing?.employeeRates || []} />
      )}
      {currentStep === 3 && (
        <HoursSelectionStep onSubmit={handleStepSubmit} onBack={prevStep} initialData={bookingData} rates={pricingRule?.labourPricing?.hourlyRates || []} />
      )}
      {currentStep === 4 && (
        <DateTimeStep onSubmit={handleStepSubmit} onBack={handleBack} initialData={bookingData} />
      )}
      {currentStep === 5 && (
        <ReviewStep onSubmit={() => nextStep(STEP_RULES)} onBack={handleBack} bookingData={bookingData} />
      )}
      {currentStep === 6 && (
        <OTPStep onSubmit={handleOtpVerified} onBack={prevStep} initialData={bookingData} />
      )}
      {currentStep === 7 && (
        <SuccessStep bookingId={createdBookingId} onReset={handleReset} />
      )}
    </BookingLayout>
  );
}

function LabourLoading() {
  return (
    <div className="grid min-h-screen place-items-center bg-hero-gradient px-4 pt-24">
      <div className="w-full max-w-xl rounded-3xl border border-sky-100 bg-white/90 p-8 text-center shadow-card">
        <div className="mx-auto h-12 w-12 animate-pulse rounded-2xl bg-primary-soft" />
        <p className="mt-4 text-sm font-black text-text-primary">Checking service availability...</p>
      </div>
    </div>
  );
}
