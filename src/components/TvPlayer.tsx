'use client'

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import type { ReactNode } from 'react';

type Season = {
  id?: number;
  season_number: number;
  name: string;
  episode_count?: number;
  episodes?: Array<{ id: number; episode_number: number; name: string; overview?: string; still_path?: string | null }>;
};

type Episode = {
  id: number;
  episode_number: number;
  name: string;
  overview?: string;
  still_path?: string | null;
};

interface TvPlayerProps {
  seriesId: number;
  title: string;
  seasons: Season[];
  imdbId?: string | null;
}

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

const sources = [
  {
    label: 'Vidking',
    kind: 'vidking' as const,
    baseUrl: 'https://www.vidking.net/embed/tv',
  },
  {
    label: 'Vidsrc RU',
    kind: 'vidsrc' as const,
    baseUrl: 'https://vidsrc-embed.ru/embed/tv',
  },
  {
    label: 'Vidsrc SU',
    kind: 'vidsrc' as const,
    baseUrl: 'https://vidsrc-embed.su/embed/tv',
  },
  {
    label: 'VidsrcMe',
    kind: 'vidsrc' as const,
    baseUrl: 'https://vidsrcme.su/embed/tv',
  },
  {
    label: 'VidKing',
    kind: 'vidsrc' as const,
    baseUrl: 'https://www.vidking.net/embed/tv/',
  },
  {
    label: 'Vsrc',
    kind: 'vidsrc' as const,
    baseUrl: 'https://vsrc.su/embed/tv',
  },
  {
    label: 'AutoEmbed',
    kind: 'autoembed' as const,
  },
  {
    label: '2Embed CC',
    kind: '2embed' as const,
    baseUrl: 'https://www.2embed.cc/embedtv/',
  },
  {
    label: '2Embed Skin',
    kind: '2embed' as const,
    baseUrl: 'https://www.2embed.skin/embedtv/',
  },
];

const fallbackMessage = (content: ReactNode) => (
  <div className="flex h-full w-full items-center justify-center rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-6 text-center text-slate-200">
    <div>
      {content}
    </div>
  </div>
);

export default function TvPlayer({ seriesId, title, seasons, imdbId }: TvPlayerProps) {
  const [seasonList, setSeasonList] = useState<Season[]>(seasons || []);
  const initialSeason = useMemo(() => seasonList.find((season) => season.season_number > 0) || seasonList[0] || undefined, [seasonList]);
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState(initialSeason?.season_number || 1);
  const [selectedEpisodeNumber, setSelectedEpisodeNumber] = useState(1);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [seasonEpisodes, setSeasonEpisodes] = useState<Season['episodes']>(initialSeason?.episodes || []);
  const [seasonLoading, setSeasonLoading] = useState(false);
  const selectedSeason = seasonList.find((season) => season.season_number === selectedSeasonNumber) || initialSeason;
  const episodes = seasonEpisodes || selectedSeason?.episodes || [];
  const preferredSeriesId = imdbId?.trim() || String(seriesId);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const selectedEpisode =
    episodes.find((episode) => episode.episode_number === selectedEpisodeNumber) ||
    episodes[0] ||
    (selectedSeason
      ? {
          id: Number(`${seriesId}${selectedSeasonNumber}${selectedEpisodeNumber}`),
          episode_number: selectedEpisodeNumber,
          name: `Episode ${selectedEpisodeNumber}`,
        }
      : undefined);
  const hasPlayableEpisode = Boolean(selectedSeason);
      const synthesizeEpisodes = (episodesArr: Episode[] | undefined, seasonObj?: Season) => {
    if (episodesArr && episodesArr.length > 0) return episodesArr;
    const count = seasonObj?.episode_count || 0;
    if (!count || count <= 0) return [];
    const cap = Math.min(count, 50);
    return Array.from({ length: cap }, (_v, i) => ({
      id: Number(`${seriesId}${seasonObj?.season_number || 1}${i + 1}`),
      episode_number: i + 1,
      name: `Episode ${i + 1}`,
      overview: undefined,
      still_path: null,
    }));
  };

  useEffect(() => {
    if (!selectedSeason || !API_KEY) {
      setSeasonEpisodes(selectedSeason?.episodes || []);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    const loadSeason = async () => {
      setSeasonLoading(true);

      const cacheKey = `tmdb:tv:${seriesId}:season:${selectedSeasonNumber}`;
      const cached = (globalThis as any).__tmdbCache?.[cacheKey];
      if (cached) {
        setSeasonEpisodes(cached.episodes || []);
        setSelectedEpisodeNumber((cached.episodes && cached.episodes[0]?.episode_number) || 1);
        setSeasonLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/tv/${seriesId}/season/${selectedSeasonNumber}`, { signal: controller.signal });

        if (!response.ok) {
          throw new Error('Failed to load season episodes');
        }

        const data = await response.json();

        if (!cancelled) {
          let nextEpisodes = data.episodes || selectedSeason.episodes || [];
          nextEpisodes = synthesizeEpisodes(nextEpisodes, selectedSeason);
          (globalThis as any).__tmdbCache = (globalThis as any).__tmdbCache || {};
          (globalThis as any).__tmdbCache[cacheKey] = { episodes: nextEpisodes, timestamp: Date.now() };
          setSeasonEpisodes(nextEpisodes);
          setSelectedEpisodeNumber(nextEpisodes[0]?.episode_number || 1);
        }
      } catch (err) {
        if (!cancelled) {
          let fallbackEpisodes = selectedSeason.episodes || [];
          fallbackEpisodes = synthesizeEpisodes(fallbackEpisodes, selectedSeason);
          setSeasonEpisodes(fallbackEpisodes);
          setSelectedEpisodeNumber(fallbackEpisodes[0]?.episode_number || 1);
        }
      } finally {
        if (!cancelled) {
          setSeasonLoading(false);
        }
      }
    };

    loadSeason();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [seriesId, selectedSeasonNumber, selectedSeason]);

  useEffect(() => {
    if (seasonList && seasonList.length > 0) return;
    if (!API_KEY) return;

    let cancelled = false;
    const cacheKey = `tmdb:tv:${seriesId}:details`;

    const cached = (globalThis as any).__tmdbCache?.[cacheKey];
    if (cached) {
      setSeasonList(cached.seasons || []);
      return;
    }

    const loadDetails = async () => {
      try {
        setSeasonLoading(true);
        const res = await fetch(`/api/tv/${seriesId}`);
        if (!res.ok) throw new Error('Failed to fetch series details');
        const data = await res.json();
        if (cancelled) return;
        const fetchedSeasons: Season[] = (data.seasons || []).map((s: any) => ({
          id: s.id,
          season_number: s.season_number,
          name: s.name,
          episode_count: s.episode_count,
        }));

        (globalThis as any).__tmdbCache = (globalThis as any).__tmdbCache || {};
        (globalThis as any).__tmdbCache[cacheKey] = { seasons: fetchedSeasons, timestamp: Date.now() };

        setSeasonList(fetchedSeasons);
        if (fetchedSeasons.length) {
          setSelectedSeasonNumber(fetchedSeasons.find((s) => s.season_number > 0)?.season_number || fetchedSeasons[0].season_number);
        }
      } catch (err) {
        // keep empty season list
      } finally {
        if (!cancelled) setSeasonLoading(false);
      }
    };

    loadDetails();

    return () => {
      cancelled = true;
    };
  }, [seriesId, seasonList.length]);

  const currentSrc = hasPlayableEpisode
    ? (() => {
        const source = sources[currentSourceIndex];
        if (source.kind === '2embed') {
          return `${source.baseUrl}${preferredSeriesId}&s=${selectedSeasonNumber}&e=${selectedEpisodeNumber}`;
        }

        if (source.kind === 'vidking') {
          return `${source.baseUrl}/${preferredSeriesId}/${selectedSeasonNumber}/${selectedEpisodeNumber}`;
        }

        if (source.kind === 'autoembed') {
          const idType = String(preferredSeriesId).startsWith('tt') ? 'imdb' : 'tmdb';
          return `https://autoembed.co/tv/${idType}/${preferredSeriesId}?season=${selectedSeasonNumber}&episode=${selectedEpisodeNumber}`;
        }

        return `${source.baseUrl}?tmdb=${seriesId}&season=${selectedSeasonNumber}&episode=${selectedEpisodeNumber}&autoplay=1&autonext=1`;
      })()
    : '';

  const tryNextSource = () => {
    setCurrentSourceIndex((prev) => (prev + 1) % sources.length);
  };

  useEffect(() => {
    const el = iframeRef.current;
    if (!el) return;
    try {
      el.setAttribute('allowfullscreen', '');
      el.setAttribute('webkitallowfullscreen', '');
      el.setAttribute('mozallowfullscreen', '');
    } catch (e) {
      // ignore
    }
  }, [currentSrc]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (!data || data.type !== 'request-fullscreen') return;
        const el = iframeRef.current as any;
        if (!el) return;
        if (el.requestFullscreen) el.requestFullscreen();
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
        else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
      } catch (_) {
        // ignore
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const retryFetchSeasons = async () => {
    if (!API_KEY) return;
    setSeasonLoading(true);
    try {
      const res = await fetch(`https://api.themoviedb.org/3/tv/${seriesId}?api_key=${API_KEY}`);
      if (!res.ok) throw new Error('Failed to fetch series details');
      const data = await res.json();
      const fetchedSeasons: Season[] = (data.seasons || []).map((s: any) => ({
        id: s.id,
        season_number: s.season_number,
        name: s.name || `Season ${s.season_number}`,
        episode_count: s.episode_count,
        episodes: [],
      }));

      const fallbackCount = Number(data.number_of_seasons || 0);
      const synthesizedSeasons =
        fetchedSeasons.length > 0
          ? fetchedSeasons
          : Array.from({ length: fallbackCount > 0 ? fallbackCount : 1 }, (_value, index) => ({
              season_number: index + 1,
              name: `Season ${index + 1}`,
              episode_count: undefined,
              episodes: [],
            }));

      setSeasonList(synthesizedSeasons);
      setSelectedSeasonNumber(synthesizedSeasons[0]?.season_number || 1);
    } catch (e) {
      console.error('Retry fetch seasons failed', e);
    } finally {
      setSeasonLoading(false);
    }
  };

  const createDummySeason = () => {
    const dummy: Season = { season_number: 1, name: 'Season 1', episodes: [] };
    setSeasonList([dummy]);
    setSelectedSeasonNumber(1);
    setSeasonEpisodes([]);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-[220px_minmax(0,1fr)]">
        <label className="space-y-2">
          <span className="block text-xs uppercase tracking-[0.35em] text-cyan-300/80">Season</span>
          <select
            value={selectedSeasonNumber}
            onChange={(event) => setSelectedSeasonNumber(Number(event.target.value))}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/90 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white outline-none transition focus:border-cyan-400"
            disabled={!seasonList.length}
          >
            {seasonList.length > 0 ? (
              seasonList.filter((season) => season.season_number >= 0).map((season) => (
                <option key={season.season_number} value={season.season_number}>
                  {season.name}
                </option>
              ))
            ) : (
              <option value={1}>Season 1</option>
            )}
          </select>
        </label>

        <label className="space-y-2">
          <span className="block text-xs uppercase tracking-[0.35em] text-cyan-300/80">Episode</span>
          <select
            value={selectedEpisodeNumber}
            onChange={(event) => setSelectedEpisodeNumber(Number(event.target.value))}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/90 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white outline-none transition focus:border-cyan-400"
            disabled={!episodes.length}
          >
            {seasonLoading ? (
              <option value={selectedEpisodeNumber}>Loading episodes...</option>
            ) : episodes.length > 0 ? (
              episodes.map((episode) => (
                <option key={episode.id} value={episode.episode_number}>
                  Ep {episode.episode_number}: {episode.name}
                </option>
              ))
            ) : (
              <option value={1}>Episode 1</option>
            )}
          </select>
        </label>
      </div>

      {seasonList.length === 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100 md:flex-row md:items-center">
          <div className="flex-1">
            <p className="font-semibold text-white">No season data available</p>
            <p className="mt-1 text-amber-100/80">TMDb did not return seasons for {title}. Retry to fetch again, or create a placeholder Season 1 to keep watching.</p>
          </div>
          <button
            onClick={retryFetchSeasons}
            className="rounded-full bg-cyan-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-950 transition hover:bg-cyan-400"
          >
            Retry
          </button>
          <button
            onClick={createDummySeason}
            className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200 transition hover:border-cyan-400"
          >
            Create Season 1
          </button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-3">
          <div className="rounded-[1.75rem] border border-white/10 bg-black shadow-2xl shadow-black/40">
            {hasPlayableEpisode ? (
              <iframe
                ref={iframeRef}
                className="w-full aspect-video min-h-[12rem] rounded"
                frameBorder="0"
                loading="lazy"
                allow="accelerator; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                src={currentSrc}
                title={`${title} season ${selectedSeasonNumber} episode ${selectedEpisodeNumber}`}
              />
            ) : (
              <div className="flex aspect-video min-h-[12rem] items-center justify-center p-4 sm:p-6 text-center text-slate-300">
                <div>
                  <p className="text-lg font-semibold text-white">Episode unavailable</p>
                  <p className="mt-2 text-sm text-slate-400">The selected season does not have a playable episode yet.</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-2 sm:gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-300">
            <span className="line-clamp-1 text-xs sm:text-sm">
              {selectedSeason?.name} • Ep {selectedEpisode ? selectedEpisode.episode_number : '?'}
            </span>
            <select
              value={currentSourceIndex}
              onChange={(event) => setCurrentSourceIndex(Number(event.target.value))}
              className="rounded-full border border-white/10 bg-slate-950/90 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs text-white outline-none"
            >
              {sources.map((source, index) => (
                <option key={source.label} value={index}>
                  {source.label}
                </option>
              ))}
            </select>
            <button
              onClick={tryNextSource}
              className="rounded-full bg-cyan-500 px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-950 transition hover:bg-cyan-400 whitespace-nowrap"
            >
              <span className="hidden sm:inline">Try Another Source</span>
              <span className="sm:hidden">Next</span>
            </button>
          </div>
        </div>

        <aside className="space-y-3 rounded-[1.75rem] border border-white/10 bg-white/5 p-3 sm:p-4 backdrop-blur-xl">
          <div className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">Episodes</div>
          <div className="max-h-[28rem] space-y-2 sm:space-y-3 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
            {episodes.length > 0 ? (
              episodes.map((episode) => (
                <button
                  key={episode.id}
                  onClick={() => setSelectedEpisodeNumber(episode.episode_number)}
                  className={`flex w-full items-center gap-2 sm:gap-3 rounded-2xl border px-2.5 sm:px-3 py-2.5 sm:py-3 text-left transition ${
                    episode.episode_number === selectedEpisodeNumber
                      ? 'border-cyan-400/60 bg-cyan-400/10'
                      : 'border-white/10 bg-slate-950/50 hover:border-cyan-400/40 hover:bg-slate-900/70'
                  }`}
                >
                  <div className="relative h-12 sm:h-16 w-18 sm:w-24 flex-shrink-0 overflow-hidden rounded-xl bg-slate-800">
                    {episode.still_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                        alt={episode.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] sm:text-[11px] text-slate-400">No still</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs sm:text-sm font-semibold text-white">Ep {episode.episode_number}</p>
                    <p className="truncate text-xs sm:text-sm text-slate-300">{episode.name}</p>
                    <p className="hidden sm:block mt-1 line-clamp-2 text-xs text-slate-400">
                      {episode.overview || 'Episode details are not available.'}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-sm text-slate-400">No episodes available for this season.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
