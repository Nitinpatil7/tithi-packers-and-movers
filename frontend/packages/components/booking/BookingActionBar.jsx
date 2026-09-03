'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function BookingActionBar({
  onBack,
  onNext,
  backLabel = 'Back',
  nextLabel = 'Next Step',
  disabled = false,
  summary,
  tone = 'sky',
  children,
}) {
  const primaryClass = tone === 'orange' ? 'btn-orange' : 'btn-sky';
  const visibleSummary = summary && !/^pickup\s+and\s+drop$/i.test(String(summary).trim()) ? summary : '';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const footer = (
    <footer className="fixed inset-x-0 bottom-0 z-50 border-t border-bg-border bg-bg-white/95 px-3 py-2.5 pb-[calc(env(safe-area-inset-bottom)+0.625rem)] shadow-[0_-16px_40px_rgba(15,23,42,.10)] backdrop-blur sm:left-1/2 sm:right-auto sm:w-[min(72rem,calc(100%-2rem))] sm:-translate-x-1/2 sm:bottom-4 sm:rounded-2xl sm:border sm:px-4 sm:py-3">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 sm:gap-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-2xl border border-bg-border bg-bg-white px-3 text-xs font-bold text-text-secondary transition hover:text-primary sm:min-h-12 sm:rounded-xl sm:px-4 sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{backLabel}</span>
          </button>
        ) : <span />}

        {visibleSummary && (
          <div className="min-w-0 flex-1 px-1 text-center sm:text-right">
            <span className="block truncate text-[11px] font-bold text-text-secondary sm:text-sm">{visibleSummary}</span>
          </div>
        )}

        {children || (
          <button
            type="button"
            onClick={onNext}
            disabled={disabled}
            className={`${primaryClass} inline-flex min-h-11 min-w-0 shrink-0 items-center justify-center gap-1.5 rounded-2xl px-3 text-xs font-bold disabled:opacity-60 sm:min-h-12 sm:rounded-xl sm:px-5 sm:text-sm`}
          >
            <span className="truncate">{nextLabel}</span>
            <ArrowRight className="h-4 w-4 shrink-0" />
          </button>
        )}
      </div>
    </footer>
  );

  const spacer = <div aria-hidden="true" className="h-28 shrink-0 sm:h-24" />;

  return (
    <>
      {spacer}
      {mounted ? createPortal(footer, document.body) : null}
    </>
  );
}

export { BookingActionBar };
