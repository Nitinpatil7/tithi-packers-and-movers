import React from 'react';

export default function AnimatedCounter({ value, suffix = '' }) {
  const targetValue = parseInt(value, 10);
  const isNumeric = !isNaN(targetValue);
  const label = isNumeric ? `${targetValue}${suffix}` : value;

  return (
    <span className="font-mono">
      {label}
    </span>
  );
}
