// src/components/ui/AnimatedCounter.jsx
'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function AnimatedCounter({ value, duration = 1500, suffix = '' }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    hasAnimated.current = false;
    setCount(0);
    // Parse target number from value prop (e.g. "15" -> 15)
    const target = parseInt(value, 10);
    if (isNaN(target)) {
      setCount(value); // Fallback for non-numeric
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let startTime = null;

          const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            
            // Ease-out quad interpolation
            const easePercentage = percentage * (2 - percentage);
            
            const currentCount = Math.floor(easePercentage * target);
            setCount(currentCount);

            if (percentage < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(target);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );

    const observedElement = elementRef.current;
    if (observedElement) {
      observer.observe(observedElement);
    }

    return () => {
      if (observedElement) {
        observer.unobserve(observedElement);
      }
    };
  }, [value, duration]);

  // If numeric parse succeeded, display calculated count + suffix, else just value
  const isNumeric = !isNaN(parseInt(value, 10));

  return (
    <span ref={elementRef} className="font-mono">
      {isNumeric ? `${count}${suffix}` : value}
    </span>
  );
}
