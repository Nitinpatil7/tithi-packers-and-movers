// src/app/(website)/book/intercity-moving/page.js
'use client';

import React, { useEffect, useState } from 'react';
import { useBookingStore } from '@tithi/store/bookingStore';
import { useConfirmBookingDraft, useCreateBookingDraft, useUpdateBookingDraft } from '@tithi/hooks/useBookingDraft';
import { usePublicPricingRule } from '@tithi/hooks/useBookingPricingRules';
import { buildDraftCreatePayload, buildDraftUpdatePayload } from '@tithi/utils/bookingPayload';
import BookingLayout from '@tithi/components/booking/BookingLayout';
import LocationStep from '@tithi/components/booking/LocationStep';
import ItemSelectionStep from '@tithi/components/booking/ItemSelectionStep';
import SpecialServicesStep from '@tithi/components/booking/SpecialServicesStep';
import DateTimeStep from '@tithi/components/booking/DateTimeStep';
import ReviewStep from '@tithi/components/booking/ReviewStep';
import OTPStep from '@tithi/components/booking/OTPStep';
import SuccessStep from '@tithi/components/booking/SuccessStep';
import ServiceComingSoon from '@tithi/components/booking/ServiceComingSoon';
import toast from 'react-hot-toast';

const STEPS = ['Location', 'Items', 'Add-ons', 'Schedule', 'Review', 'Verify OTP'];
const STEP_RULES = ['location', 'items', 'optional', 'schedule', 'optional', 'optional'];

export default function IntercityMovingPage() {
  const { currentStep, bookingData, updateBookingData, nextStep, prevStep, resetBooking, setStep } = useBookingStore();
  const createDraftMutation = useCreateBookingDraft();
  const updateDraftMutation = useUpdateBookingDraft();
  const confirmDraftMutation = useConfirmBookingDraft();
  const { data: pricingRule, isLoading: pricingLoading } = usePublicPricingRule('intercity_moving');
  const [createdBookingId, setCreatedBookingId] = useState(null);
  const [basePackageMode, setBasePackageMode] = useState(false);

  useEffect(() => {
    setBasePackageMode(new URLSearchParams(window.location.search).get('basePackage') === '1');
  }, []);

  useEffect(() => {
    if (bookingData.serviceType !== 'intercity') {
      resetBooking();
      updateBookingData({ serviceType: 'intercity' });
    }
  }, [bookingData.serviceType, resetBooking, updateBookingData]);

  useEffect(() => {
    if (currentStep > STEPS.length && !createdBookingId) {
      resetBooking();
      updateBookingData({ serviceType: 'intercity' });
    }
    setStep(currentStep, STEP_RULES);
  }, [currentStep, createdBookingId, resetBooking, setStep, updateBookingData]);

  useEffect(() => {
    if (pricingRule?._id && bookingData.pricingRule?._id !== pricingRule._id) updateBookingData({ pricingRule });
  }, [pricingRule, bookingData.pricingRule?._id, updateBookingData]);

  const handleStepSubmit = (stepData) => {
    updateBookingData(stepData);
    if (basePackageMode) setStep(4, STEP_RULES);
    else nextStep(STEP_RULES);
  };
  const handleLocationSubmit = async (stepData) => {
    const nextData = { ...bookingData, ...stepData, serviceType: 'intercity', pricingRule: pricingRule || bookingData.pricingRule };
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
    nextStep(STEP_RULES);
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
      toast.success('Intercity moving request scheduled!');
    } catch (error) {
      toast.error(error.message || 'Error submitting request. Please try again.');
    }
  };

  const handleReset = () => {
    resetBooking();
    setStep(0, STEP_RULES);
    setCreatedBookingId(null);
    updateBookingData({ serviceType: 'intercity' });
  };

  if (pricingLoading) return <div className="grid min-h-screen place-items-center bg-bg-page pt-24">Checking service availability...</div>;
  if (!pricingRule) return <ServiceComingSoon serviceName="Intercity Moving" />;

  return (
    <BookingLayout
      title={currentStep === STEPS.length ? 'Move Scheduled' : STEPS[currentStep] || 'Book'}
      steps={STEPS}
      currentStep={currentStep}
      onBack={prevStep}
    >
      {currentStep === 0 && (
        <LocationStep onSubmit={handleLocationSubmit} initialData={bookingData} serviceType="intercity" />
      )}
      {currentStep === 1 && (
        <ItemSelectionStep onSubmit={handleStepSubmit} onBack={prevStep} initialData={bookingData} isIntercity={true} />
      )}
      {currentStep === 2 && (
        <SpecialServicesStep onSubmit={handleStepSubmit} onBack={prevStep} initialData={bookingData} serviceType="intercity" />
      )}
      {currentStep === 3 && (
        <DateTimeStep onSubmit={handleStepSubmit} onBack={prevStep} initialData={bookingData} />
      )}
      {currentStep === 4 && (
        <ReviewStep onSubmit={() => nextStep(STEP_RULES)} onBack={prevStep} bookingData={bookingData} />
      )}
      {currentStep === 5 && (
        <OTPStep onSubmit={handleOtpVerified} onBack={prevStep} initialData={bookingData} />
      )}
      {currentStep === 6 && (
        <SuccessStep bookingId={createdBookingId} onReset={handleReset} />
      )}
    </BookingLayout>
  );
}
