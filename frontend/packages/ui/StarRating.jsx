import React from 'react';
import { cn } from '@tithi/utils/utils';

const sizeClasses = {
  xs: 'h-3.5 w-3.5',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-7 w-7',
};

const sizePixels = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
};

const clampRating = (rating, max) => {
  const value = Number(rating);
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(max, Math.round(value)));
};

function StarShape({
  filled,
  size,
  className,
  activeClassName,
  inactiveClassName,
  activeColor,
  inactiveColor,
}) {
  const pixelSize = sizePixels[size] || sizePixels.md;
  const color = filled ? activeColor : inactiveColor;

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      color={color}
      stroke={color}
      strokeWidth={filled ? 1.4 : 2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color, width: pixelSize, height: pixelSize, flexShrink: 0 }}
      className={cn(
        sizeClasses[size] || sizeClasses.md,
        filled ? activeClassName : inactiveClassName,
        className,
      )}
    >
      <path
        d="M12 2.75l2.86 5.79 6.39.93-4.62 4.5 1.09 6.36L12 17.32l-5.72 3.01 1.09-6.36-4.62-4.5 6.39-.93L12 2.75z"
        fill={filled ? color : 'none'}
      />
    </svg>
  );
}

export default function StarRating({
  rating = 0,
  max = 5,
  size = 'md',
  interactive = false,
  onRate,
  className,
  starClassName,
  buttonClassName,
  activeButtonClassName,
  inactiveButtonClassName,
  activeColor = '#f59e0b',
  inactiveColor = '#cbd5e1',
  activeStarClassName = 'text-amber-400 drop-shadow-sm',
  inactiveStarClassName = 'text-slate-300 dark:text-slate-600',
  disabled = false,
  label,
}) {
  const selected = clampRating(rating, max);
  const stars = Array.from({ length: max }, (_, index) => index + 1);
  const ariaLabel = label || `${selected} out of ${max} stars`;

  if (interactive) {
    return (
      <div className={cn('grid grid-cols-5 gap-2', className)} role="radiogroup" aria-label={label || 'Star rating'}>
        {stars.map((value) => {
          const filled = value <= selected;
          return (
            <button
              key={value}
              type="button"
              disabled={disabled}
              onClick={() => onRate?.(value)}
              className={cn(
                'grid h-12 place-items-center rounded-2xl border transition-colors disabled:opacity-60',
                filled ? 'border-sky-300 bg-sky-50' : 'border-sky-100 bg-bg-white',
                filled ? activeButtonClassName : inactiveButtonClassName,
                buttonClassName,
              )}
              role="radio"
              aria-checked={selected === value}
              aria-label={`${value} star${value > 1 ? 's' : ''}`}
            >
              <StarShape
                filled={filled}
                size={size}
                className={starClassName}
                activeClassName={activeStarClassName}
                inactiveClassName={inactiveStarClassName}
                activeColor={activeColor}
                inactiveColor={inactiveColor}
              />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} aria-label={ariaLabel}>
      {stars.map((value) => (
        <StarShape
          key={value}
          filled={value <= selected}
          size={size}
          className={starClassName}
          activeClassName={activeStarClassName}
          inactiveClassName={inactiveStarClassName}
          activeColor={activeColor}
          inactiveColor={inactiveColor}
        />
      ))}
    </span>
  );
}

export { StarRating };
