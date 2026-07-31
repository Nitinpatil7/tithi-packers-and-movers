// src/app/(website)/book/labour-service/page.js
'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useBookingStore } from '@/store/bookingStore';
import { useConfirmBookingDraft, useCreateBookingDraft, useUpdateBookingDraft } from '@/hooks/useBookingDraft';
import { usePublicPricingRule } from '@/hooks/useBookingPricingRules';
import { buildDraftCreatePayload, buildDraftUpdatePayload } from '@/lib/bookingPayload';
import BookingLayout from '@/components/booking/BookingLayout';
import toast from 'react-hot-toast';

const STEPS = ['Location', 'Truck', 'Employees', 'Hours', 'Schedule', 'Review', 'Verify OTP'];
const stepLoader = () => <div className="min-h-[360px] rounded-3xl border border-sky-100 bg-white/80" />;
const LocationStep = dynamic(() => import('@/components/booking/LocationStep'), { ssr: false, loading: stepLoader });
const TruckSelectionStep = dynamic(() => import('@/components/booking/TruckSelectionStep'), { ssr: false, loading: stepLoader });
const EmployeeSelectionStep = dynamic(() => import('@/components/booking/EmployeeSelectionStep'), { ssr: false, loading: stepLoader });
const HoursSelectionStep = dynamic(() => import('@/components/booking/HoursSelectionStep'), { ssr: false, loading: stepLoader });
const DateTimeStep = dynamic(() => import('@/components/booking/DateTimeStep'), { ssr: false, loading: stepLoader });
const ReviewStep = dynamic(() => import('@/components/booking/ReviewStep'), { ssr: false, loading: stepLoader });
const OTPStep = dynamic(() => import('@/components/booking/OTPStep'), { ssr: false, loading: stepLoader });
const SuccessStep = dynamic(() => import('@/components/booking/SuccessStep'), { ssr: false, loading: stepLoader });

export default function LabourServicePage() {
  const { currentStep, bookingData, updateBookingData, nextStep, prevStep, resetBooking, setStep } = useBookingStore();
  const createDraftMutation = useCreateBookingDraft();
  const updateDraftMutation = useUpdateBookingDraft();
  const confirmDraftMutation = useConfirmBookingDraft();
  const { data: pricingRule } = usePublicPricingRule('porter_labour_service');
  const [createdBookingId, setCreatedBookingId] = useState(null);

  useEffect(() => {
    if (bookingData.serviceType !== 'labour') {
      resetBooking();
      updateBookingData({ serviceType: 'labour' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingData.serviceType, resetBooking, updateBookingData]);

  useEffect(() => {
    if (currentStep >= STEPS.length && !createdBookingId) {
      resetBooking();
      updateBookingData({ serviceType: 'labour' });
    }
  }, [currentStep, createdBookingId, resetBooking, updateBookingData]);

  useEffect(() => {
    if (pricingRule?._id && bookingData.pricingRule?._id !== pricingRule._id) updateBookingData({ pricingRule });
  }, [pricingRule, bookingData.pricingRule?._id, updateBookingData]);

  const handleStepSubmit = (stepData) => {
    updateBookingData(stepData);
    if (stepData.useBasePackage) setStep(4);
    else nextStep();
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
    if (stepData.useBasePackage) setStep(4);
    else nextStep();
  };

  const handleBack = () => {
    if (bookingData.useBasePackage && currentStep >= 4 && currentStep <= 5) {
      setStep(0);
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
      nextStep();
      useBookingStore.persist.clearStorage();
      toast.success('Labour booking confirmed!');
    } catch (error) {
      toast.error(error.message || 'Error submitting request. Please try again.');
    }
  };

  const handleReset = () => {
    resetBooking();
    setStep(0);
    setCreatedBookingId(null);
    updateBookingData({ serviceType: 'labour' });
  };

  return (
    <BookingLayout
      title={currentStep === STEPS.length ? 'Booking Confirmed' : STEPS[currentStep] || 'Book Labour'}
      steps={STEPS}
      currentStep={currentStep}
      onBack={handleBack}
    >
      {currentStep === 0 && (
        <LocationStep onSubmit={handleLocationSubmit} initialData={bookingData} serviceType="labour" pricingRule={pricingRule} />
      )}
      {currentStep === 1 && (
        <TruckSelectionStep onSubmit={handleStepSubmit} onBack={prevStep} initialData={bookingData} trucks={pricingRule?.labourPricing?.trucks || []} />
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
        <ReviewStep onSubmit={() => nextStep()} onBack={handleBack} bookingData={bookingData} />
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
