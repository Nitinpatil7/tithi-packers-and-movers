// src/app/book/commercial-moving/page.js
'use client';

import React, { useEffect, useState } from 'react';
import { useBookingStore } from '@store/bookingStore';
import { useCreateBooking } from '@hooks/useBooking';
import BookingLayout from '@shared-components/booking/BookingLayout';
import BusinessDetailsStep from '@shared-components/booking/BusinessDetailsStep';
import LocationStep from '@shared-components/booking/LocationStep';
import TruckSelectionStep from '@shared-components/booking/TruckSelectionStep';
import SpecialServicesStep from '@shared-components/booking/SpecialServicesStep';
import DateTimeStep from '@shared-components/booking/DateTimeStep';
import ReviewStep from '@shared-components/booking/ReviewStep';
import OTPStep from '@shared-components/booking/OTPStep';
import SuccessStep from '@shared-components/booking/SuccessStep';
import Input from '@ui/Input';
import { Package } from 'lucide-react';
import Button from '@ui/Button';
import Card from '@ui/Card';
import { useForm } from 'react-hook-form';
import { ArrowLeft, ArrowRight, ClipboardCheck, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@utils/utils';

export default function CommercialMovingPage() {
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
    updateBookingData({ serviceType: 'commercial' });
  }, [resetBooking, updateBookingData]);

  const steps = [
    'Office Details',
    'Address Details',
    'Assign Truck',
    'Inventory list',
    'Special Add-ons',
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
      toast.success('Corporate shifting request scheduled!');
    } catch (err) {
      toast.error('Error submitting shifting request.');
    }
  };

  const handleReset = () => {
    resetBooking();
    setStep(0);
    setCreatedBookingId(null);
    updateBookingData({ serviceType: 'commercial' });
  };

  // Simplified custom checklist step for Office Inventory items
  const CommercialInventoryStep = ({ onSubmit, onBack, initialData = {} }) => {
    const defaultOfficeItems = [
      { id: 'desk', name: 'Office Desk / Table', icon: '🪑' },
      { id: 'chair', name: 'Office Ergonomic Chair', icon: '🪑' },
      { id: 'desktop', name: 'Computer Mon. + CPU Box', icon: '🖥️' },
      { id: 'file-cabinet', name: 'File Cabinet / Drawer', icon: '🗄️' },
      { id: 'printer', name: 'Large Printer/Copier', icon: '🖨️' },
      { id: 'sofa', name: 'Lobby Sofa Set', icon: '🛋️' }
    ];

    const [items, setItems] = useState(initialData.items || []);

    const handleQuantityChange = (itemName, increment) => {
      setItems((prev) => {
        const idx = prev.findIndex(item => item.name === itemName);
        if (idx === -1) {
          if (increment > 0) {
            return [...prev, { category: 'Commercial', name: itemName, quantity: 1 }];
          }
          return prev;
        }

        const updated = [...prev];
        const newQty = updated[idx].quantity + increment;
        if (newQty <= 0) {
          updated.splice(idx, 1);
        } else {
          updated[idx] = { ...updated[idx], quantity: newQty };
        }
        return updated;
      });
    };

    const getItemQuantity = (itemName) => {
      const item = items.find(i => i.name === itemName);
      return item ? item.quantity : 0;
    };

    const handleFormSubmit = () => {
      onSubmit({ items });
    };

    return (
      <div className="flex flex-col gap-6 text-left">
        <h3 className="text-sm uppercase font-bold tracking-wider text-primary flex items-center gap-1.5">
          <ClipboardCheck className="w-4 h-4" /> Specify Office Equipment Inventory
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {defaultOfficeItems.map((item) => {
            const qty = getItemQuantity(item.name);
            return (
              <Card
                key={item.id}
                className={cn(
                  "p-3.5 flex items-center justify-between border bg-bg-card/35 transition-all",
                  qty > 0 ? "border-primary/50 bg-primary/[0.01]" : "border-bg-border/60"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Package className="h-5 w-5 text-primary" strokeWidth={1.7} />
                  <span className="text-xs font-semibold text-text-primary text-left">
                    {item.name}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {qty > 0 ? (
                    <>
                      <button
                        onClick={() => handleQuantityChange(item.name, -1)}
                        className="w-6 h-6 rounded bg-bg-elevated hover:bg-bg-border text-text-primary flex items-center justify-center border border-bg-border focus:outline-none"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-5 text-center text-xs font-bold text-text-primary font-mono">
                        {qty}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.name, 1)}
                        className="w-6 h-6 rounded bg-primary hover:bg-primary-light text-white flex items-center justify-center focus:outline-none"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleQuantityChange(item.name, 1)}
                      className="px-2.5 py-1 text-[11px] font-bold uppercase rounded bg-bg-elevated border border-bg-border text-text-secondary hover:text-text-primary focus:outline-none transition-all"
                    >
                      Add
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-bg-border/60">
          <Button variant="secondary" onClick={onBack} icon={ArrowLeft}>
            Back
          </Button>
          <Button onClick={handleFormSubmit} variant="primary" icon={ArrowRight} iconPosition="right">
            Next Step
          </Button>
        </div>
      </div>
    );
  };

  const activeStepTitle = steps[currentStep] || 'Complete Commercial Shifting';

  return (
    <BookingLayout
      title={currentStep === steps.length ? 'Shifting Scheduled' : activeStepTitle}
      steps={steps}
      currentStep={currentStep}
      onBack={prevStep}
    >
      {currentStep === 0 && (
        <BusinessDetailsStep 
          onSubmit={handleStepSubmit} 
          initialData={bookingData} 
        />
      )}
      {currentStep === 1 && (
        <LocationStep 
          onSubmit={handleStepSubmit} 
          initialData={bookingData} 
        />
      )}
      {currentStep === 2 && (
        <TruckSelectionStep 
          onSubmit={handleStepSubmit} 
          onBack={prevStep} 
          initialData={bookingData} 
        />
      )}
      {currentStep === 3 && (
        <CommercialInventoryStep 
          onSubmit={handleStepSubmit} 
          onBack={prevStep} 
          initialData={bookingData} 
        />
      )}
      {currentStep === 4 && (
        <SpecialServicesStep 
          onSubmit={handleStepSubmit} 
          onBack={prevStep} 
          initialData={bookingData} 
          serviceType="commercial"
        />
      )}
      {currentStep === 5 && (
        <DateTimeStep 
          onSubmit={handleStepSubmit} 
          onBack={prevStep} 
          initialData={bookingData} 
        />
      )}
      {currentStep === 6 && (
        <ReviewStep 
          onSubmit={handleStepSubmit} 
          onBack={prevStep} 
          bookingData={bookingData} 
        />
      )}
      {currentStep === 7 && (
        <OTPStep 
          onSubmit={handleOtpVerified} 
          onBack={prevStep} 
          initialData={bookingData} 
        />
      )}
      {currentStep === 8 && (
        <SuccessStep 
          bookingId={createdBookingId} 
          onReset={handleReset} 
        />
      )}
    </BookingLayout>
  );
}
