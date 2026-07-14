'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TrickleProgressProps {
  isAnimating: boolean;
  className?: string;
}

export function TrickleProgress({ isAnimating, className }: TrickleProgressProps) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    let timeoutFade: ReturnType<typeof setTimeout>;
    let timeoutReset: ReturnType<typeof setTimeout>;

    if (isAnimating) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);

      setProgress(15); // Initial jump

      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          // Random increment between 2 and 8 to simulate real network trickle
          const inc = Math.random() * 6 + 2;
          return Math.min(prev + inc, 90);
        });
      }, 500);
    } else {
      // Complete the progress bar rapidly

      setProgress(100);

      timeoutFade = setTimeout(() => {
        setVisible(false);
        timeoutReset = setTimeout(() => {
          setProgress(0);
        }, 150);
      }, 150);
    }

    return () => {
      clearInterval(interval);
      clearTimeout(timeoutFade);
      clearTimeout(timeoutReset);
    };
  }, [isAnimating]);

  return (
    <div
      className={cn(
        'w-full h-1.5 rounded-full overflow-hidden relative transition-opacity',
        visible ? 'opacity-100 duration-300' : 'opacity-0 duration-150',
        className,
      )}
    >
      {/* Background Track */}
      <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800" />

      {/* Progress Indicator */}
      <div
        className={cn(
          'absolute top-0 bottom-0 left-0 bg-blue-600 dark:bg-blue-500 rounded-full transition-all ease-out',
          !isAnimating ? 'duration-150' : progress === 0 ? 'duration-0' : 'duration-500',
        )}
        style={{ width: `${progress}%` }}
      >
        {/* Glow effect at the tip of the progress bar */}
        <div className="absolute top-0 right-0 bottom-0 w-20 bg-white/20 blur-sm translate-x-1/2 rounded-full" />
      </div>
    </div>
  );
}
