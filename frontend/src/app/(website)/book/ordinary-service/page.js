// src/app/(website)/book/ordinary-service/page.js
'use client';

import React, { useEffect, useState } from 'react';
import { useBookingStore } from '@/store/bookingStore';
import { useCreateBooking } from '@/hooks/useBooking';
import BookingLayout from '@/components/booking/BookingLayout';
import PackingSubTypeStep from '@/components/booking/PackingSubTypeStep';
import LocationStep from '@/components/booking/LocationStep';
import SpecialServicesStep from '@/components/booking/SpecialServicesStep';
import DateTimeStep from '@/components/booking/DateTimeStep';
import ReviewStep from '@/components/booking/ReviewStep';
import OTPStep from '@/components/booking/OTPStep';
import SuccessStep from '@/components/booking/SuccessStep';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { useForm } from 'react-hook-form';
import { ArrowLeft, ArrowRight, Box } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrdinaryServicePage() {
  const { 
    currentStep, 
    bookingData, 
    updateBookingData, 
    nextStep, 
    prevStep, 
    resetBooking,
    setStep 
  } = useBookingStore();

  const createBookingMutation = useCreateBooking();
  const [createdBookingId, setCreatedBookingId] = useState(null);

  // Initialize booking category
  useEffect(() => {
    resetBooking();
    updateBookingData({ serviceType: 'packing' });
  }, [resetBooking, updateBookingData]);

  // Determine steps dynamically based on sub-service selection
  const steps = [
    'Package Category',
    'Address Details',
    'Shifting Volume',
    'Add-ons',
    'Schedule',
    'Overview',
    'Verify OTP'
  ];

  const handleStepSubmit = (stepData) => {
    updateBookingData(stepData);
    nextStep();
  };

  const handleOtpVerified = async (contactData) => {
    const finalData = {
      ...bookingData,
      ...contactData,
      customerName: contactData.contactDetails.name,
      email: contactData.contactDetails.email,
      mobile: contactData.contactDetails.mobile
    };

    try {
      const response = await createBookingMutation.mutateAsync(finalData);
      setCreatedBookingId(response.bookingId);
      nextStep();
      toast.success('Ordinary service request registered successfully!');
    } catch (err) {
      toast.error('Error submitting service request.');
    }
  };

  const handleReset = () => {
    resetBooking();
    setStep(0);
    setCreatedBookingId(null);
    updateBookingData({ serviceType: 'packing' });
  };

  // Simplified custom step for Volume parameters
  const ItemsVolumeStep = ({ onSubmit, onBack, initialData = {} }) => {
    const { register, handleSubmit } = useForm({
      defaultValues: {
        propertySize: initialData.itemsVolume?.propertySize || '2BHK',
        fragileCount: initialData.itemsVolume?.fragileCount || 0,
        boxCount: initialData.itemsVolume?.boxCount || 0
      }
    });

    const handleFormSubmit = (data) => {
      onSubmit({
        itemsVolume: {
          propertySize: data.propertySize,
          fragileCount: Number(data.fragileCount),
          boxCount: Number(data.boxCount)
        }
      });
    };

    const propertyOptions = [
      { value: '1 Room / Studio', label: '1 Room / Studio' },
      { value: '1BHK', label: '1 BHK' },
      { value: '2BHK', label: '2 BHK' },
      { value: '3BHK', label: '3 BHK' },
      { value: '4BHK+', label: '4 BHK or Bungalow' }
    ];

    return (
      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-6 text-left">
        <h3 className="text-sm uppercase font-bold tracking-wider text-primary flex items-center gap-1.5">
          <Box className="w-4 h-4" /> Specify Shifting Volume
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Approximate Size of Home"
            options={propertyOptions}
            {...register('propertySize')}
          />
          <Input
            label="Number of Fragile Items (approx.)"
            type="number"
            {...register('fragileCount', { required: 'Please enter a count' })}
          />
          <Input
            label="Approximate Box Count (e.g. 20)"
            type="number"
            {...register('boxCount', { required: 'Please enter a count' })}
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-bg-border/60">
          <Button variant="secondary" onClick={onBack} icon={ArrowLeft}>
            Back
          </Button>
          <Button type="submit" variant="primary" icon={ArrowRight} iconPosition="right">
            Next Step
          </Button>
        </div>
      </form>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <PackingSubTypeStep onSubmit={handleStepSubmit} initialData={bookingData} />;
      case 1:
        return (
          <LocationStep 
            onSubmit={handleStepSubmit} 
            initialData={bookingData} 
            isSingleAddress={bookingData.packingSubType !== 'loadinga_and_unloading'} 
          />
        );
      case 2:
        return <ItemsVolumeStep onSubmit={handleStepSubmit} onBack={prevStep} initialData={bookingData} />;
      case 3:
        return (
          <SpecialServicesStep 
            onSubmit={handleStepSubmit} 
            onBack={prevStep} 
            initialData={bookingData} 
            serviceType="packing" 
          />
        );
      case 4:
        return <DateTimeStep onSubmit={handleStepSubmit} onBack={prevStep} initialData={bookingData} />;
      case 5:
        return <ReviewStep onSubmit={handleStepSubmit} onBack={prevStep} bookingData={bookingData} />;
      case 6:
        return <OTPStep onSubmit={handleOtpVerified} onBack={prevStep} initialData={bookingData} />;
      case 7:
        return <SuccessStep bookingId={createdBookingId} onReset={handleReset} />;
      default:
        return null;
    }
  };

  const activeStepTitle = steps[currentStep] || 'Complete Service Setup';

  return (
    <BookingLayout
      title={currentStep === steps.length ? 'Service Scheduled' : activeStepTitle}
      steps={steps}
      currentStep={currentStep}
      onBack={prevStep}
    >
      {renderStep()}
    </BookingLayout>
  );
}
