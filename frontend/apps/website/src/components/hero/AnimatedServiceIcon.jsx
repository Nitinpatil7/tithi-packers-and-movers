'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const DotLottieReact = dynamic(
  () => import('@lottiefiles/dotlottie-react').then((mod) => mod.DotLottieReact),
  {
    ssr: false,
    loading: () => <div className="h-full w-full animate-pulse rounded-2xl bg-sky-100/70 dark:bg-sky-900/30" />,
  },
);

export default function AnimatedServiceIcon({ src, isActive, className = '' }) {
  const [dotLottie, setDotLottie] = useState(null);

  useEffect(() => {
    if (!dotLottie) return;

    const syncPlayback = () => {
      dotLottie.setLoop?.(true);
      if (isActive) dotLottie.play?.();
      else dotLottie.pause?.();
    };

    syncPlayback();
    dotLottie.addEventListener?.('ready', syncPlayback);
    dotLottie.addEventListener?.('load', syncPlayback);

    return () => {
      dotLottie.removeEventListener?.('ready', syncPlayback);
      dotLottie.removeEventListener?.('load', syncPlayback);
    };
  }, [dotLottie, isActive]);

  if (!src) return null;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <DotLottieReact
        src={src}
        loop
        autoplay={isActive}
        dotLottieRefCallback={setDotLottie}
        className="h-full w-full"
      />
    </div>
  );
}

export { AnimatedServiceIcon };
