// src/components/ui/Toast.jsx
import React from 'react';
import { Toaster } from 'react-hot-toast';

export default function Toast() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#FFFFFF',
          color: '#0F2942',
          border: '1px solid #BAE6FD',
          fontSize: '14px',
          fontWeight: '700',
          borderRadius: '16px',
          padding: '14px 16px',
          boxShadow: '0 16px 40px rgba(2, 132, 199, 0.16)',
        },
        success: {
          style: { borderLeft: '4px solid #10B981' },
          iconTheme: {
            primary: '#10B981',
            secondary: '#ECFDF5',
          },
        },
        error: {
          style: { borderLeft: '4px solid #EF4444' },
          iconTheme: {
            primary: '#EF4444',
            secondary: '#FEF2F2',
          },
        },
      }}
    />
  );
}
export { Toast };
