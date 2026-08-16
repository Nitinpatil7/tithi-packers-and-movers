'use client';

import React, { useState } from 'react';
import { useUpdatePricingItem } from '@/hooks/useAdmin';
import Badge from '@ui/Badge';
import Input from '@ui/Input';
import toast from 'react-hot-toast';
import { formatCurrency } from '@utils/utils';
import { Check, Edit2, X } from 'lucide-react';

export default function PricingTable({ pricing = [], token }) {
  const pricingItems = Array.isArray(pricing) ? pricing : [];
  const [editingId, setEditingId] = useState(null);
  const [editingPrice, setEditingPrice] = useState('');
  
  const updatePricingMutation = useUpdatePricingItem();

  const handleStartEdit = (item) => {
    setEditingId(item._id);
    setEditingPrice(item.price.toString());
  };

  const handleSavePrice = async (id) => {
    const parsed = Number(editingPrice);
    if (isNaN(parsed) || parsed < 0) {
      toast.error('Please enter a valid price amount.');
      return;
    }

    try {
      await updatePricingMutation.mutateAsync({
        id,
        updateData: { price: parsed },
        token
      });
      setEditingId(null);
      toast.success('Pricing parameter updated successfully');
    } catch (err) {
      toast.error(err.message || 'Error updating price');
    }
  };

  const handleToggleActive = async (item) => {
    try {
      await updatePricingMutation.mutateAsync({
        id: item._id,
        updateData: { isActive: !item.isActive },
        token
      });
      toast.success(`${item.label} status changed`);
    } catch (err) {
      toast.error(err.message || 'Error changing status');
    }
  };

  return (
    <div className="w-full overflow-x-auto border border-bg-border rounded-lg bg-bg-card/35 glass">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-bg-border bg-bg-elevated/45 text-text-secondary text-[11px] font-bold uppercase tracking-wider">
            <th className="px-6 py-4">Service Name</th>
            <th className="px-6 py-4">Category Limits</th>
            <th className="px-6 py-4">Billing Unit</th>
            <th className="px-6 py-4">Price Amount</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-bg-border/60 text-xs md:text-sm">
          {pricingItems.map((item) => {
            const isEditing = editingId === item._id;
            
            return (
              <tr key={item._id} className="hover:bg-bg-elevated/10 transition-colors">
                {/* Name */}
                <td className="px-6 py-4 font-bold text-text-primary">
                  {item.label}
                </td>
                
                {/* Applies to services */}
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(item.appliesToServices) ? item.appliesToServices : []).map(serviceKey => (
                      <Badge key={serviceKey} variant="service" type={serviceKey} className="text-[9px] px-1.5 py-0" />
                    ))}
                  </div>
                </td>
                
                {/* Unit */}
                <td className="px-6 py-4 text-text-secondary capitalize">
                  {(item.unit || 'fixed').replace('_', ' ')}
                </td>
                
                {/* Price (Inline Editing) */}
                <td className="px-6 py-4 font-mono">
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={editingPrice}
                        onChange={(e) => setEditingPrice(e.target.value)}
                        className="w-20 px-2 py-1 bg-bg-elevated border border-primary text-text-primary rounded text-xs font-bold font-mono outline-none"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSavePrice(item._id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                      />
                    </div>
                  ) : (
                    <span className="font-bold text-text-primary">
                      {item.unit === 'percentage' ? `${item.price}%` : formatCurrency(item.price)}
                    </span>
                  )}
                </td>
                
                {/* Active Status Toggle */}
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleToggleActive(item)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border focus:outline-none transition-all ${
                      item.isActive 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20' 
                        : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20'
                    }`}
                  >
                    {item.isActive ? 'Active' : 'Disabled'}
                  </button>
                </td>
                
                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  {isEditing ? (
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleSavePrice(item._id)}
                        className="p-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-500 focus:outline-none"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-500 focus:outline-none"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartEdit(item)}
                      className="p-1.5 rounded hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-all focus:outline-none"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
export { PricingTable };
