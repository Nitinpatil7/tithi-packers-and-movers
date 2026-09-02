// src/app/(admin)/admin/bookings/page.js
'use client';

import React, { useState } from 'react';
import nextDynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useAllBookings } from '@/hooks/useAdmin';
import { useAuthStore } from '@tithi/store/authStore';
import BookingTable from '@/components/admin/BookingTable';
import BookingFilters from '@/components/admin/BookingFilters';
import Card from '@tithi/ui/Card';
import Spinner from '@tithi/ui/Spinner';
import Button from '@tithi/ui/Button';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { buildDraftCreatePayload, buildDraftUpdatePayload } from '@tithi/utils/bookingPayload';
import { confirmBookingDraft, createBookingDraft, updateBookingDraft } from '@tithi/lib/bookingDraftApi';
import { updateBookingDetails, updateBookingStatus } from '@tithi/lib/api';
import { serviceHasItemCatalog } from '@tithi/utils/serviceTypes';

const CreateBookingModal = nextDynamic(() => import('@/components/admin/CreateBookingModal'), { ssr: false });
const BookingEditModal = nextDynamic(() => import('@/components/admin/BookingEditModal'), { ssr: false });
const BookingDeleteConfirm = nextDynamic(() => import('@/components/admin/BookingDeleteConfirm'), { ssr: false });

export default function BookingsPage() {
  const { token } = useAuthStore();
  const searchParams = useSearchParams();
  const statView = searchParams.get('view') || '';
  const todayKey = new Date().toLocaleDateString('en-CA');
  const filter = searchParams.get('filter') || '';
  const scheduledDate = searchParams.get('scheduledDate') || (filter === 'today' || filter === 'today-schedule' ? todayKey : '');
  const createdDate = searchParams.get('createdDate') || (filter === 'today-booked' ? todayKey : '');
  const upcomingMinutes = searchParams.get('upcomingMinutes') || '';
  const routeFilters = {
    ...(scheduledDate ? { scheduledDate } : {}),
    ...(createdDate ? { createdDate } : {}),
    ...(upcomingMinutes ? { upcomingMinutes } : {}),
    ...(statView || filter ? { limit: 100 } : {}),
  };
  const [filters, setFilters] = useState({ search: '', serviceType: 'all', status: 'all' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [createOpen, setCreateOpen] = useState(false);
  const [editBooking, setEditBooking] = useState(null);
  const [deleteBooking, setDeleteBooking] = useState(null);

  const queryFilters = { ...filters, ...routeFilters };
  const { data, isLoading, refetch } = useAllBookings(queryFilters, token);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const bookings = data?.bookings || [];
  const totalItems = data?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedBookings = bookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const pageTitle = statView === 'today-scheduled' || filter === 'today-schedule' || filter === 'today'
    ? "Today's Scheduled Bookings"
    : statView === 'today-booked' || filter === 'today-booked'
      ? "Today's Bookings"
      : statView === 'next-hour'
      ? 'Next 1h Bookings'
      : 'All Bookings';
  const pageDescription = statView === 'today-scheduled' || filter === 'today-schedule' || filter === 'today'
    ? 'Bookings whose scheduled service date is today, shown in the same order as the dashboard reminder list.'
    : statView === 'today-booked' || filter === 'today-booked'
      ? 'Bookings created today, shown from newest to oldest.'
      : statView === 'next-hour'
      ? 'Upcoming active bookings scheduled within the next hour, ordered chronologically.'
      : 'Lookup, search, filter customer orders — or create a manual booking from a phone call.';
  const emptyText = statView === 'today-scheduled' || filter === 'today-schedule' || filter === 'today'
    ? 'No records found for today’s scheduled bookings. Nothing needs service attention for today yet.'
    : statView === 'today-booked' || filter === 'today-booked'
      ? 'No bookings have been created today yet.'
      : statView === 'next-hour'
      ? 'No records found for the next hour. The near-term schedule is clear.'
      : 'No booking records found matching the active filters.';

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
      const isItemBooking = serviceHasItemCatalog(updatedBooking.serviceType);
      await updateBookingDetails(id, {
        scheduledate: updatedBooking.scheduledDate || undefined,
        timeslot: updatedBooking.timeSlot || undefined,
        note: updatedBooking.notes || '',
        ...(isItemBooking ? { items: updatedBooking.items || [], selectedAddons: updatedBooking.selectedAddons || [] } : {}),
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
            <h1 className="text-2xl font-black text-text-primary">{pageTitle}</h1>
            <p className="text-xs text-text-secondary mt-0.5">
              {pageDescription}
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
                emptyText={emptyText}
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
