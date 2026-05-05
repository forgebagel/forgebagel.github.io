'use client'

import { useState } from 'react';

interface VideoEmbedProps {
  movieId: string;
  className?: string;
}

const sources = [
  'https://vidsrc-embed.ru/embed/movie?tmdb=',
  'https://vidsrc-embed.su/embed/movie?tmdb=',
  'https://vidsrcme.su/embed/movie?tmdb=',
  'https://vsrc.su/embed/movie?tmdb=',
];

export default function VideoEmbed({ movieId, className = '' }: VideoEmbedProps) {
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  const currentSrc = `${sources[currentSourceIndex]}${movieId}`;

  const tryNextSource = () => {
    setCurrentSourceIndex((prev) => (prev + 1) % sources.length);
  };

  return (
    <div className={className}>
      <div className="relative w-full overflow-hidden rounded touch-auto">
        <div
          className="w-full h-[22rem] md:h-[30rem] bg-black"
          role="button"
          onClick={() => setIsOverlayOpen(true)}
          onKeyDown={(e) => e.key === 'Enter' && setIsOverlayOpen(true)}
          tabIndex={0}
        >
          <iframe
            src={currentSrc}
            className="w-full h-full rounded pointer-events-auto touch-auto"
            frameBorder="0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            title="Movie Player"
          />
        </div>
      </div>

      <div className="mt-2 flex justify-between items-center">
        <span className="text-sm text-gray-400">Source: {sources[currentSourceIndex].split('//')[1].split('/')[0]}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={tryNextSource}
            className="bg-crimson-600 hover:bg-crimson-700 px-4 py-2 rounded text-sm font-semibold"
          >
            Try Another Source
          </button>
          <button
            onClick={() => setIsOverlayOpen(true)}
            className="bg-slate-800/60 hover:bg-slate-800/80 px-3 py-2 rounded text-sm font-medium border border-white/10"
          >
            Fullscreen
          </button>
        </div>
      </div>

      {isOverlayOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4">
          <div className="absolute top-4 right-4 z-50">
            <button
              onClick={() => setIsOverlayOpen(false)}
              className="rounded-full bg-white/10 px-3 py-2 text-sm font-semibold"
            >
              Close
            </button>
          </div>

          <div className="w-full max-w-4xl h-[86vh] bg-black">
            <iframe
              src={currentSrc}
              className="w-full h-full rounded pointer-events-auto touch-auto"
              frameBorder="0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              title="Movie Player Fullscreen"
            />
          </div>
        </div>
      )}
    </div>
  );
}