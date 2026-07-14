'use client';

export function BackgroundLayout() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 transition-colors duration-300">
      {/* Base background */}
      <div className="absolute inset-0 bg-background" />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-background via-primary/5 to-primary/10" />

      {/* Dot pattern */}
      <div className="absolute inset-0 bg-dot-pattern opacity-70" />

      {/* Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-1/2 h-1/2 bg-primary rounded-full blur-[120px] opacity-10 animate-blob" />
      <div className="absolute top-[-10%] right-[-10%] w-1/2 h-1/2 bg-primary rounded-full blur-[120px] opacity-[0.07] animate-blob animation-delay-2000" />
      <div className="absolute bottom-[-20%] left-1/5 w-3/5 h-3/5 bg-primary rounded-full blur-[140px] opacity-[0.05] animate-blob animation-delay-4000" />
    </div>
  );
}
