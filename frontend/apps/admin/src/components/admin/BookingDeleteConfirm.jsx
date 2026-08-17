// src/components/admin/BookingDeleteConfirm.jsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { formatBookingDate, formatBookingTimeSlot } from '@tithi/utils/utils';

export default function BookingDeleteConfirm({ booking, isOpen, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onConfirm(booking);
      onClose();
    } catch {
      // handled by parent
    } finally {
      setDeleting(false);
    }
  };

  if (!booking) return null;
  const bookingId = booking.bookingId || booking.bookingid || booking._id;
  const scheduleLabel = `${formatBookingDate(booking)} / ${formatBookingTimeSlot(booking)}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            className="relative bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden"
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          >
            {/* Top red strip */}
            <div className="h-1.5 w-full bg-gradient-to-r from-red-400 to-red-600" />

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl hover:bg-bg-section flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-text-secondary" />
            </button>

            <div className="p-8 flex flex-col items-center text-center gap-5">
              {/* Warning icon */}
              <motion.div
                className="w-16 h-16 rounded-2xl bg-red-50 border-2 border-red-100 flex items-center justify-center"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              >
                <Trash2 className="w-7 h-7 text-red-500" />
              </motion.div>

              <div>
                <h2 className="text-xl font-black text-text-primary mb-1">Delete Booking?</h2>
                <p className="text-sm text-text-secondary font-medium">
                  This action cannot be undone.
                </p>
              </div>

              {/* Booking card summary */}
              <div className="w-full p-4 bg-red-50 rounded-2xl border border-red-100 text-left">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-black text-text-primary">{booking.customerName}</p>
                    <p className="text-xs text-text-secondary font-mono mt-0.5">{bookingId}</p>
                    <p className="text-xs text-text-tertiary font-medium mt-1">
                      {booking.serviceType} · {scheduleLabel}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-text-tertiary font-medium leading-relaxed">
                All booking data, including customer details and history for{' '}
                <strong className="text-text-primary">{bookingId}</strong>, will be permanently removed.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-bg-border text-sm font-bold text-text-secondary hover:bg-bg-section transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-black transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {deleting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Yes, Delete
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export { BookingDeleteConfirm };
