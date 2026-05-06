'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

interface VideoEmbedProps {
  movieId: string;
}

const sources = [
  { label: 'Vidking', kind: 'vidking' as const, baseUrl: 'https://www.vidking.net/embed/movie' },
  { label: 'Vidsrc RU', kind: 'vidsrc-path' as const, baseUrl: 'https://vidsrc-embed.ru/embed/movie' },
  { label: 'Vidsrc SU', kind: 'vidsrc-path' as const, baseUrl: 'https://vidsrc-embed.su/embed/movie' },
  { label: 'Vidsrc ME', kind: 'vidsrc-path' as const, baseUrl: 'https://vidsrc.me/embed/movie' },
  { label: 'Vidsrc XYZ', kind: 'vidsrc-path' as const, baseUrl: 'https://vidsrc.xyz/embed/movie' },
  { label: '2Embed CC', kind: '2embed' as const, baseUrl: 'https://www.2embed.cc/embed/' },
  { label: '2Embed Skin', kind: '2embed' as const, baseUrl: 'https://www.2embed.skin/embed/' },
  { label: 'AutoEmbed', kind: 'autoembed' as const },
];

export default function VideoEmbed({ movieId }: VideoEmbedProps) {
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const src = useMemo(() => {
    const source = sources[currentSourceIndex];

    if (source.kind === 'vidking' || source.kind === 'vidsrc-path') {
      return `${source.baseUrl}/${movieId}`;
    }

    if (source.kind === '2embed') {
      return `${source.baseUrl}${movieId}`;
    }

    return `https://autoembed.co/movie/tmdb/${movieId}`;
  }, [currentSourceIndex, movieId]);

  useEffect(() => {
    const el = iframeRef.current;
    if (!el) return;

    try {
      // Some mobile browsers/providers still rely on these legacy attributes.
      el.setAttribute('allowfullscreen', '');
      el.setAttribute('webkitallowfullscreen', '');
      el.setAttribute('mozallowfullscreen', '');
    } catch {
      // Ignore attribute errors and keep standard allowFullScreen behavior.
    }
  }, [src]);

  return (
    <div className="space-y-3">
      <div className="w-full rounded-2xl border-2 border-slate-700 shadow-2xl shadow-black/40 overflow-hidden bg-black">
        <iframe
          ref={iframeRef}
          src={src}
          width="100%"
          height="600"
          className="aspect-video"
          frameBorder="0"
          allow="fullscreen *; autoplay *; encrypted-media *; picture-in-picture *"
          allowFullScreen
          title="Movie Player"
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs sm:text-sm text-slate-300">
        <span className="text-xs sm:text-sm">Server</span>
        <select
          value={currentSourceIndex}
          onChange={(event) => setCurrentSourceIndex(Number(event.target.value))}
          className="rounded-full border border-white/10 bg-slate-950/90 px-3 py-2 text-xs text-white outline-none"
        >
          {sources.map((source, index) => (
            <option key={source.label} value={index}>
              {source.label}
            </option>
          ))}
        </select>
      </div>
      <p className="text-xs text-slate-400 px-1">
        If a server does not work, switch to another server.
      </p>
    </div>
  );
}
