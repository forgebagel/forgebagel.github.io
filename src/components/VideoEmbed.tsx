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

  const currentSrc = `${sources[currentSourceIndex]}${movieId}`;

  const tryNextSource = () => {
    setCurrentSourceIndex((prev) => (prev + 1) % sources.length);
  };

  return (
    <div className={className}>
      <iframe
        src={currentSrc}
        className="w-full h-full rounded"
        frameBorder="0"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer"
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        title="Movie Player"
      ></iframe>
      <div className="mt-2 flex justify-between items-center">
        <span className="text-sm text-gray-400">
          Source: {sources[currentSourceIndex].split('//')[1].split('/')[0]}
        </span>
        <button
          onClick={tryNextSource}
          className="bg-crimson-600 hover:bg-crimson-700 px-4 py-2 rounded text-sm font-semibold"
        >
          Try Another Source
        </button>
      </div>
    </div>
  );
}