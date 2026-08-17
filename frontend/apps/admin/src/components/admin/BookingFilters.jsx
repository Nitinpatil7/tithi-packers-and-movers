// src/components/admin/BookingFilters.jsx
'use client';

import React from 'react';
import { Search } from 'lucide-react';
import Input from '@tithi/ui/Input';
import Select from '@tithi/ui/Select';

export default function BookingFilters({ filters = {}, onFilterChange }) {
  const serviceOptions = [
    { value: 'all', label: 'All Services' },
    { value: 'local_shifting', label: 'Local Shifting' },
    { value: 'intercity_moving', label: 'Intercity Moving' },
    { value: 'porter_labour_service', label: 'Porter & Labour' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'quote_sent', label: 'Quote Sent' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-bg-card p-4 border border-bg-border rounded-lg glass w-full mb-6">
      
      {/* Search Input */}
      <div className="relative w-full md:max-w-xs">
        <Input
          placeholder="Search by ID, name, mobile..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className="text-xs"
          icon={Search}
        />
      </div>

      {/* Select Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <Select
          value={filters.serviceType || 'all'}
          onChange={(e) => onFilterChange({ serviceType: e.target.value })}
          placeholder=""
          className="text-xs max-w-full sm:w-44 py-2"
          options={serviceOptions}
        />

        <Select
          value={filters.status || 'all'}
          onChange={(e) => onFilterChange({ status: e.target.value })}
          placeholder=""
          className="text-xs max-w-full sm:w-44 py-2"
          options={statusOptions}
        />
      </div>

    </div>
  );
}
