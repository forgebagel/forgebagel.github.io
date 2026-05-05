'use client'

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface HeroProps {
  movies: any[];
}

export default function Hero({ movies }: HeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const movie = movies?.[currentIndex] || movies?.[0] || null;
  const totalMovies = Math.min(movies?.length || 0, 10);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalMovies - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === totalMovies - 1 ? 0 : prev + 1));
  };

  if (!movie) {
    return null;
  }

  return (
    <div className="relative h-[86svh] min-h-[34rem] overflow-hidden md:h-screen">
      {movie.backdrop_path ? (
        <div className="absolute inset-0 transition-opacity duration-300">
          <Image
            key={`${movie.id}-backdrop`}
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            alt={movie.title}
            fill
            className="object-cover transition-opacity duration-300"
            priority
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.22),transparent_18%),radial-gradient(circle_at_0_30%,rgba(56,189,248,0.16),transparent_20%),linear-gradient(180deg,rgba(15,23,42,0.1),rgba(0,0,0,0.92))]" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-slate-950" />
      )}

      <div className="relative z-10 h-full px-3 py-6 sm:px-6 md:py-8 flex flex-col justify-center items-center lg:items-start">
        <button
          onClick={handlePrevious}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 md:left-4 md:p-3 rounded-full border border-cyan-400/60 bg-slate-950/50 text-cyan-400 transition hover:bg-slate-900 hover:border-cyan-300 hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] z-20"
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="w-full max-w-4xl p-4 sm:p-6 text-center lg:text-left lg:pl-12 lg:pr-0">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80 mb-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">Featured ({currentIndex + 1} of {totalMovies})</p>
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black mb-4 leading-tight text-white drop-shadow-[0_4px_22px_rgba(0,0,0,0.98)]">{movie.title}</h1>
          <p className="text-sm lg:text-base text-slate-100 leading-relaxed max-w-2xl mb-6 sm:mb-8 line-clamp-3 mx-auto lg:mx-0 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">{movie.overview}</p>
          <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
            <Link
              href={`/movie/${movie.id}`}
              className="rounded-full bg-cyan-500 px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-950 transition hover:bg-cyan-400"
            >
              Play
            </Link>
            <Link
              href={`/movie/${movie.id}`}
              className="rounded-full border border-cyan-400/40 bg-slate-900/70 px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-slate-800/90"
            >
              More
            </Link>
          </div>
        </div>

        <button
          onClick={handleNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 md:right-4 md:p-3 rounded-full border border-cyan-400/60 bg-slate-950/50 text-cyan-400 transition hover:bg-slate-900 hover:border-cyan-300 hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] z-20"
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
