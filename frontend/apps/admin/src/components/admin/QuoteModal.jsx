// src/components/admin/QuoteModal.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@tithi/ui/Modal';
import Input from '@tithi/ui/Input';
import Button from '@tithi/ui/Button';
import { formatCurrency } from '@tithi/utils/utils';
import { useUpdateBookingQuote } from '@/hooks/useAdmin';
import toast from 'react-hot-toast';

export default function QuoteModal({ isOpen, onClose, booking = {}, token }) {
  const [manualQuote, setManualQuote] = useState(booking.manualQuote || 0);
  
  const updateQuoteMutation = useUpdateBookingQuote();

  useEffect(() => {
    if (booking) {
      setManualQuote(booking.manualQuote || 0);
    }
  }, [booking, isOpen]);

  const addOnTotal = booking.addOnTotal || 0;
  const grandTotal = Number(manualQuote) + addOnTotal;

  const handleSendQuote = async () => {
    const quoteVal = Number(manualQuote);
    if (isNaN(quoteVal) || quoteVal <= 0) {
      toast.error('Please enter a valid base shifting amount.');
      return;
    }

    try {
      await updateQuoteMutation.mutateAsync({
        id: booking.bookingId || booking.bookingid,
        quoteData: {
          pricing: {
            currency: booking.pricing?.currency || 'INR',
            itemTotal: Number(booking.pricing?.itemTotal || booking.itemTotal || 0),
            addOnTotal: Number(addOnTotal || 0),
            serviceCharge: quoteVal,
            discount: Number(booking.pricing?.discount || 0),
            tax: Number(booking.pricing?.tax || 0),
            totalAmount: grandTotal,
            breakdown: booking.pricing?.breakdown || {},
          },
          note: 'Quote updated from admin booking detail',
        },
        token
      });
      toast.success(`Quote successfully dispatched to ${booking.customerName}`);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Error updating quote details');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configure Manual Quote" size="md">
      <div className="flex flex-col gap-6 text-left">
        <div className="flex flex-col gap-1 text-xs">
          <span className="text-text-tertiary">Customer Name</span>
          <span className="text-text-primary font-bold text-sm">{booking.customerName}</span>
          <span className="text-text-tertiary mt-2">Reference Ref ID</span>
          <span className="text-text-primary font-mono font-bold">{booking.bookingId || booking.bookingid}</span>
        </div>

        <div className="border-t border-bg-border/60 my-1" />

        {/* Inputs */}
        <div className="flex flex-col gap-4">
          <Input
            label="Base Shifting Vehicle + Driver Charge (INR)"
            type="number"
            placeholder="e.g. 4500"
            value={manualQuote || ''}
            onChange={(e) => setManualQuote(e.target.value)}
          />

          <div className="flex flex-col gap-2 bg-bg-elevated/40 border border-bg-border/80 rounded-md p-4 text-xs font-semibold text-text-secondary">
            <div className="flex justify-between items-center">
              <span>Add-on services total:</span>
              <span className="font-mono text-text-primary">{formatCurrency(addOnTotal)}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-t border-bg-border/60 pt-3 mt-1 font-bold">
              <span className="text-text-primary">Combined Total Cost:</span>
              <span className="text-primary text-base font-mono">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-bg-border/60">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSendQuote}
            loading={updateQuoteMutation.isPending}
          >
            Send Quote
          </Button>
        </div>
      </div>
    </Modal>
  );
}
export { QuoteModal };
