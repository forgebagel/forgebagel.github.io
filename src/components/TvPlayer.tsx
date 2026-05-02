'use client'

import { useEffect, useMemo, useState } from 'react';
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
}

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

const sources = [
  'https://vidsrc-embed.ru/embed/tv',
  'https://vidsrc-embed.su/embed/tv',
  'https://vidsrcme.su/embed/tv',
  'https://vsrc.su/embed/tv',
];

const fallbackMessage = (content: ReactNode) => (
  <div className="flex h-full w-full items-center justify-center rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-6 text-center text-slate-200">
    <div>
      {content}
    </div>
  </div>
);

export default function TvPlayer({ seriesId, title, seasons }: TvPlayerProps) {
  const [seasonList, setSeasonList] = useState<Season[]>(seasons || []);
  const initialSeason = useMemo(() => seasonList.find((season) => season.season_number > 0) || seasonList[0] || undefined, [seasonList]);
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState(initialSeason?.season_number || 1);
  const [selectedEpisodeNumber, setSelectedEpisodeNumber] = useState(1);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [seasonEpisodes, setSeasonEpisodes] = useState<Season['episodes']>(initialSeason?.episodes || []);
  const [seasonLoading, setSeasonLoading] = useState(false);
  const selectedSeason = seasonList.find((season) => season.season_number === selectedSeasonNumber) || initialSeason;
  const episodes = seasonEpisodes || selectedSeason?.episodes || [];
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
          setCurrentSourceIndex(0);
          setSeasonLoading(false);
          return;
        }

        try {
          // Use internal API route so server-side cache is applied and we avoid
          // client-side TMDb timeouts or CORS issues.
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
            setCurrentSourceIndex(0);
          }
        } catch (err) {
          if (!cancelled) {
            let fallbackEpisodes = selectedSeason.episodes || [];
            fallbackEpisodes = synthesizeEpisodes(fallbackEpisodes, selectedSeason);
            setSeasonEpisodes(fallbackEpisodes);
            setSelectedEpisodeNumber(fallbackEpisodes[0]?.episode_number || 1);
            setCurrentSourceIndex(0);
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

  // If the incoming `seasons` prop was empty (TMDb sometimes omits seasons),
  // fetch the series details to populate the season list. Use a tiny
  // client-side cache on `window` to avoid repeated slow TMDb requests.
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

        // store in ephemeral cache to speed subsequent navigations
        (globalThis as any).__tmdbCache = (globalThis as any).__tmdbCache || {};
        (globalThis as any).__tmdbCache[cacheKey] = { seasons: fetchedSeasons, timestamp: Date.now() };

        setSeasonList(fetchedSeasons);
        if (fetchedSeasons.length) {
          setSelectedSeasonNumber(fetchedSeasons.find((s) => s.season_number > 0)?.season_number || fetchedSeasons[0].season_number);
        }
      } catch (err) {
        // keep empty season list; UI will show fallback
      } finally {
        if (!cancelled) setSeasonLoading(false);
      }
    };

    loadDetails();

    return () => {
      cancelled = true;
    };
  }, [seriesId, seasonList, setSeasonList]);

  // Retry fetching season list if TMDb didn't return seasons initially
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

  const currentSrc = hasPlayableEpisode
    ? `${sources[currentSourceIndex]}?tmdb=${seriesId}&season=${selectedSeasonNumber}&episode=${selectedEpisodeNumber}&autoplay=1&autonext=1`
    : '';

  const tryNextSource = () => {
    setCurrentSourceIndex((prev) => (prev + 1) % sources.length);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
        <label className="space-y-2">
          <span className="block text-xs uppercase tracking-[0.35em] text-cyan-300/80">Season</span>
          <select
            value={selectedSeasonNumber}
            onChange={(event) => setSelectedSeasonNumber(Number(event.target.value))}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
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
            className="w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            disabled={!episodes.length}
          >
            {seasonLoading ? (
              <option value={selectedEpisodeNumber}>Loading episodes...</option>
            ) : episodes.length > 0 ? (
              episodes.map((episode) => (
                <option key={episode.id} value={episode.episode_number}>
                  Episode {episode.episode_number}: {episode.name}
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

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3">
          <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-black shadow-2xl shadow-black/40">
            {hasPlayableEpisode ? (
              <iframe
                src={currentSrc}
                className="h-[22rem] w-full md:h-[30rem]"
                frameBorder="0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer"
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                title={`${title} season ${selectedSeasonNumber} episode ${selectedEpisodeNumber}`}
              />
            ) : (
              <div className="flex h-[22rem] items-center justify-center p-6 text-center text-slate-300 md:h-[30rem]">
                <div>
                  <p className="text-lg font-semibold text-white">Episode unavailable</p>
                  <p className="mt-2 text-sm text-slate-400">The selected season does not have a playable episode yet.</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
            <span>
              {selectedSeason?.name} • {selectedEpisode ? `Episode ${selectedEpisode.episode_number}` : 'No episode selected'}
            </span>
            <button
              onClick={tryNextSource}
              className="rounded-full bg-cyan-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-950 transition hover:bg-cyan-400"
            >
              Try Another Source
            </button>
          </div>
        </div>

        <aside className="space-y-3 rounded-[1.75rem] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <div className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">Episodes</div>
          <div className="max-h-[28rem] space-y-3 overflow-y-auto pr-1">
            {episodes.length > 0 ? (
              episodes.map((episode) => (
                <button
                  key={episode.id}
                  onClick={() => setSelectedEpisodeNumber(episode.episode_number)}
                  className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                    episode.episode_number === selectedEpisodeNumber
                      ? 'border-cyan-400/60 bg-cyan-400/10'
                      : 'border-white/10 bg-slate-950/50 hover:border-cyan-400/40 hover:bg-slate-900/70'
                  }`}
                >
                  <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-slate-800">
                    {episode.still_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                        alt={episode.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[11px] text-slate-400">No still</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">Episode {episode.episode_number}</p>
                    <p className="truncate text-sm text-slate-300">{episode.name}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-400">
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
