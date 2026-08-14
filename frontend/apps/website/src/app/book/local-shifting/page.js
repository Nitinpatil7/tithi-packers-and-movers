"use client";

import React, { useEffect, useState } from 'react';
import { useBookingStore } from '@store/bookingStore';
import { useConfirmBookingDraft, useCreateBookingDraft, useUpdateBookingDraft } from '@hooks/useBookingDraft';
import { usePublicPricingRule } from '@hooks/useBookingPricingRules';
import { buildDraftCreatePayload, buildDraftUpdatePayload } from '@utils/bookingPayload';
import BookingLayout from '@shared-components/booking/BookingLayout';
import LocationStep from '@shared-components/booking/LocationStep';
import ItemSelectionStep from '@shared-components/booking/ItemSelectionStep';
import SpecialServicesStep from '@shared-components/booking/SpecialServicesStep';
import DateTimeStep from '@shared-components/booking/DateTimeStep';
import ReviewStep from '@shared-components/booking/ReviewStep';
import OTPStep from '@shared-components/booking/OTPStep';
import SuccessStep from '@shared-components/booking/SuccessStep';
import toast from 'react-hot-toast';

const STEPS = ['Location', 'Items', 'Add-ons', 'Schedule', 'Review', 'Verify OTP'];

export default function LocalShiftingPage() {
  const { currentStep, bookingData, updateBookingData, nextStep, prevStep, resetBooking, setStep } = useBookingStore();
  const createDraftMutation = useCreateBookingDraft();
  const updateDraftMutation = useUpdateBookingDraft();
  const confirmDraftMutation = useConfirmBookingDraft();
  const { data: pricingRule } = usePublicPricingRule('local_shifting');
  const [createdBookingId, setCreatedBookingId] = useState(null);
  const [basePackageMode, setBasePackageMode] = useState(false);

  useEffect(() => {
    setBasePackageMode(new URLSearchParams(window.location.search).get('basePackage') === '1');
  }, []);

  useEffect(() => {
    if (bookingData.serviceType !== 'local') {
      resetBooking();
      updateBookingData({ serviceType: 'local' });
    }
 
  }, [bookingData.serviceType, resetBooking, updateBookingData]);

  useEffect(() => {
    if (currentStep >= STEPS.length && !createdBookingId) {
      resetBooking();
      updateBookingData({ serviceType: 'local' });
    }
  }, [currentStep, createdBookingId, resetBooking, updateBookingData]);

  useEffect(() => {
    if (pricingRule?._id && bookingData.pricingRule?._id !== pricingRule._id) updateBookingData({ pricingRule });
  }, [pricingRule, bookingData.pricingRule?._id, updateBookingData]);

  const handleStepSubmit = (stepData) => {
    updateBookingData(stepData);
    if (basePackageMode) setStep(4);
    else nextStep();
  };
  const handleLocationSubmit = async (stepData) => {
    const nextData = { ...bookingData, ...stepData, serviceType: 'local', pricingRule: pricingRule || bookingData.pricingRule };
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
    nextStep();
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
      await updateDraftMutation.mutateAsync({ bookingId, draftToken, data: buildDraftUpdatePayload(finalData) });
      const response = await confirmDraftMutation.mutateAsync({ bookingId, draftToken, data: { customer: { name: finalData.contactDetails?.name, email: finalData.contactDetails?.email, mobile: finalData.contactDetails?.mobile }, verificationId: finalData.verificationId, pricing: buildDraftUpdatePayload(finalData).pricing } });
      setCreatedBookingId(response.bookingid || response.booking?.bookingid || bookingId);
      nextStep();
      useBookingStore.persist.clearStorage();
      toast.success('Local shifting scheduled successfully!');
    } catch (error) {
      toast.error(error.message || 'Error submitting request. Please try again.');
    }
  };

  const handleReset = () => {
    resetBooking();
    setStep(0);
    setCreatedBookingId(null);
    updateBookingData({ serviceType: 'local' });
  };

  return (
    <BookingLayout
      title={currentStep === STEPS.length ? 'Shifting Scheduled' : STEPS[currentStep] || 'Book'}
      steps={STEPS}
      currentStep={currentStep}
      onBack={prevStep}
    >
      {currentStep === 0 && (
        <LocationStep onSubmit={handleLocationSubmit} initialData={bookingData} serviceType="local" />
      )}
      {currentStep === 1 && (
        <ItemSelectionStep onSubmit={handleStepSubmit} onBack={prevStep} initialData={bookingData} />
      )}
      {currentStep === 2 && (
        <SpecialServicesStep onSubmit={handleStepSubmit} onBack={prevStep} initialData={bookingData} serviceType="local" />
      )}
      {currentStep === 3 && (
        <DateTimeStep onSubmit={handleStepSubmit} onBack={prevStep} initialData={bookingData} />
      )}
      {currentStep === 4 && (
        <ReviewStep onSubmit={() => nextStep()} onBack={prevStep} bookingData={bookingData} />
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
