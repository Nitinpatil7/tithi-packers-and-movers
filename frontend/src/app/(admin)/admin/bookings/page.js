// src/app/(admin)/admin/bookings/page.js
'use client';

import React, { useState } from 'react';
import nextDynamic from 'next/dynamic';
import { useAllBookings } from '@/hooks/useAdmin';
import { useAuthStore } from '@/store/authStore';
import BookingTable from '@/components/admin/BookingTable';
import BookingFilters from '@/components/admin/BookingFilters';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { buildDraftCreatePayload, buildDraftUpdatePayload } from '@/lib/bookingPayload';
import { confirmBookingDraft, createBookingDraft, updateBookingDraft } from '@/lib/bookingDraftApi';
import { updateBookingDetails, updateBookingStatus } from '@/lib/api';

const CreateBookingModal = nextDynamic(() => import('@/components/admin/CreateBookingModal'), { ssr: false });
const BookingEditModal = nextDynamic(() => import('@/components/admin/BookingEditModal'), { ssr: false });
const BookingDeleteConfirm = nextDynamic(() => import('@/components/admin/BookingDeleteConfirm'), { ssr: false });

export default function BookingsPage() {
  const { token } = useAuthStore();
  const [filters, setFilters] = useState({ search: '', serviceType: 'all', status: 'all' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [createOpen, setCreateOpen] = useState(false);
  const [editBooking, setEditBooking] = useState(null);
  const [deleteBooking, setDeleteBooking] = useState(null);

  const { data, isLoading, refetch } = useAllBookings(filters, token);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const bookings = data?.bookings || [];
  const totalItems = data?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedBookings = bookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // --- CRUD Handlers (demo — replace with real API calls) ---
  const handleCreate = async (bookingData) => {
    try {
      const draft = await createBookingDraft(buildDraftCreatePayload(bookingData));
      const bookingId = draft.booking?.bookingid;
      const draftToken = draft.draftToken;
      if (!bookingId || !draftToken) throw new Error('Draft token missing from booking response.');
      const quotePayload = buildDraftUpdatePayload({ ...bookingData, bookingId, draftToken });
      await updateBookingDraft(bookingId, draftToken, quotePayload);
      await confirmBookingDraft(bookingId, draftToken, {
        customer: {
          name: bookingData.contactDetails?.name || bookingData.customerName,
          email: bookingData.contactDetails?.email || bookingData.email,
          mobile: bookingData.contactDetails?.mobile || bookingData.mobile,
        },
        pricing: quotePayload.pricing,
      });
      toast.success(`Booking ${bookingId} created for ${bookingData.customerName}!`);
      setCreateOpen(false);
      refetch?.();
    } catch (error) {
      toast.error(error.message || 'Failed to create booking. Please try again.', { id: 'admin-booking-create-error' });
      throw new Error('Create failed');
    }
  };

  const handleEdit = async (updatedBooking) => {
    try {
      const id = updatedBooking.bookingId || updatedBooking.bookingid;
      const currentPricing = updatedBooking.pricing || {};
      await updateBookingDetails(id, {
        status: updatedBooking.status,
        scheduledate: updatedBooking.scheduledDate || undefined,
        timeslot: updatedBooking.timeSlot || undefined,
        note: updatedBooking.notes || '',
        pricing: {
          currency: currentPricing.currency || 'INR',
          itemTotal: Number(currentPricing.itemTotal ?? updatedBooking.itemTotal ?? 0),
          addOnTotal: Number(currentPricing.addOnTotal ?? updatedBooking.addOnTotal ?? 0),
          serviceCharge: Number(updatedBooking.manualQuote || currentPricing.serviceCharge || 0),
          discount: Number(currentPricing.discount || 0),
          tax: Number(currentPricing.tax || 0),
          totalAmount: Number(updatedBooking.totalAmount || updatedBooking.manualQuote || currentPricing.totalAmount || 0),
          breakdown: currentPricing.breakdown || {},
        },
      });
      toast.success(`Booking ${id} updated!`);
      setEditBooking(null);
      refetch?.();
    } catch (error) {
      toast.error(error.message || 'Failed to update booking. Please try again.', { id: 'admin-booking-update-error' });
      throw new Error('Update failed');
    }
  };

  const handleDelete = async (bookingRecord) => {
    try {
      const bookingId = bookingRecord.bookingId || bookingRecord.bookingid;
      await updateBookingStatus(bookingId, 'cancelled', 'Cancelled from admin bookings page');
      toast.success('Booking cancelled successfully.');
      setDeleteBooking(null);
      refetch?.();
    } catch (error) {
      toast.error(error.message || 'Failed to delete booking. Please try again.', { id: 'admin-booking-delete-error' });
      throw new Error('Delete failed');
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6 text-left">
        {/* Title + Add Button */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-text-primary">All Bookings</h1>
            <p className="text-xs text-text-secondary mt-0.5">
              Lookup, search, filter customer orders — or create a manual booking from a phone call.
            </p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="btn-sky px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Booking
          </button>
        </div>

        {/* Filter Row */}
        <BookingFilters filters={filters} onFilterChange={handleFilterChange} />

        {/* Bookings Table */}
        <Card className="p-6 bg-white border border-bg-border shadow-xs">
          {isLoading ? (
            <div className="py-16 flex items-center justify-center">
              <Spinner size="md" />
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <BookingTable
                bookings={paginatedBookings}
                onEdit={(booking) => setEditBooking(booking)}
                onDelete={(booking) => setDeleteBooking(booking)}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-bg-border pt-4 text-xs font-semibold text-text-secondary">
                  <span>
                    Page <strong className="text-text-primary">{currentPage}</strong> of{' '}
                    <strong className="text-text-primary">{totalPages}</strong> ({totalItems} orders)
                  </span>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
                      Previous
                    </Button>
                    <Button variant="secondary" size="sm" disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Modals */}
      <CreateBookingModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={handleCreate}
      />

      <BookingEditModal
        booking={editBooking}
        isOpen={!!editBooking}
        onClose={() => setEditBooking(null)}
        onSave={handleEdit}
      />

      <BookingDeleteConfirm
        booking={deleteBooking}
        isOpen={!!deleteBooking}
        onClose={() => setDeleteBooking(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
