import React from 'react';
import { BookOpen } from 'lucide-react';

interface BookCoverProps {
  name: string;
  price: number | null;
  publisher?: string;
  coverImage?: string | null;
  className?: string;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

// Curated palette of classic editorial and historical book cloth tones
const COVER_PALETTES = [
  { bg: 'from-amber-900 to-amber-950', border: 'border-amber-700/50', accent: 'text-amber-200', ribbon: 'bg-amber-400' },
  { bg: 'from-emerald-900 to-emerald-950', border: 'border-emerald-700/50', accent: 'text-emerald-200', ribbon: 'bg-emerald-400' },
  { bg: 'from-slate-800 to-slate-950', border: 'border-slate-700/50', accent: 'text-slate-200', ribbon: 'bg-amber-500' },
  { bg: 'from-stone-800 to-stone-900', border: 'border-stone-700/50', accent: 'text-stone-200', ribbon: 'bg-orange-400' },
  { bg: 'from-red-900 to-rose-950', border: 'border-rose-700/50', accent: 'text-rose-200', ribbon: 'bg-yellow-400' },
  { bg: 'from-cyan-900 to-blue-950', border: 'border-cyan-700/50', accent: 'text-cyan-200', ribbon: 'bg-cyan-400' },
  { bg: 'from-indigo-900 to-indigo-950', border: 'border-indigo-700/50', accent: 'text-indigo-200', ribbon: 'bg-amber-300' },
  { bg: 'from-zinc-800 to-zinc-950', border: 'border-zinc-700/50', accent: 'text-zinc-200', ribbon: 'bg-teal-400' },
];

function getPaletteForName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % COVER_PALETTES.length;
  return COVER_PALETTES[index];
}

export const BookCover: React.FC<BookCoverProps> = ({
  name,
  coverImage,
  className = '',
  onClick,
}) => {
  const palette = getPaletteForName(name);

  // If user has uploaded a custom photograph cover
  if (coverImage) {
    return (
      <div
        onClick={onClick}
        className={`relative aspect-[3/4] w-full overflow-hidden rounded-md bg-stone-100 shadow-sm transition-transform duration-200 hover:shadow-md ${className}`}
      >
        <img
          src={coverImage}
          alt={name}
          className="h-full w-full object-cover object-center"
          loading="lazy"
        />
        {/* Subtle realistic book spine highlight & shadow overlay */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/25 via-white/10 to-transparent" />
        <div className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-inset ring-black/10" />
      </div>
    );
  }

  // Elegant classic book cloth placeholder when no photograph is uploaded yet
  return (
    <div
      onClick={onClick}
      className={`relative aspect-[3/4] w-full overflow-hidden rounded-md bg-gradient-to-br ${palette.bg} p-3.5 sm:p-4 text-white shadow-sm transition-transform duration-200 hover:shadow-md flex flex-col justify-between select-none ${className}`}
    >
      {/* Book spine simulation on the left */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/40 via-white/15 to-transparent" />

      {/* Decorative filigree double frame */}
      <div className={`pointer-events-none absolute inset-2 sm:inset-2.5 rounded border ${palette.border} opacity-40`} />
      <div className={`pointer-events-none absolute inset-3 sm:inset-3.5 rounded border ${palette.border} opacity-20`} />

      {/* Subtle background grain & foil luster */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-black/30" />

      {/* Header emblem */}
      <div className="relative z-10 flex items-center justify-between">
        <span className={`text-[10px] tracking-wider uppercase opacity-75 font-mono ${palette.accent}`}>
          Book Edition
        </span>
        <BookOpen className={`h-3.5 w-3.5 opacity-60 ${palette.accent}`} />
      </div>

      {/* Center Book Title with Sinhala Serif / Classic look */}
      <div className="relative z-10 my-auto text-center px-1">
        <h3
          className="font-serif text-sm sm:text-base font-semibold leading-snug tracking-normal text-stone-100 line-clamp-4 drop-shadow-sm"
          style={{ fontFamily: "'Noto Serif Sinhala', 'Google Sans', serif" }}
        >
          {name}
        </h3>
        <div className={`mx-auto mt-2 h-0.5 w-8 rounded-full ${palette.ribbon} opacity-60`} />
      </div>

      {/* Footer subtle imprint */}
      <div className="relative z-10 text-center">
        <p className="text-[10px] tracking-wide text-stone-300/80 font-sans">
          ශ්‍රී ලංකා ප්‍රකාශන
        </p>
      </div>

      {/* Realistic outer border ring */}
      <div className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-inset ring-white/10" />
    </div>
  );
};
