'use client'

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { searchMovies } from '@/lib/tmdb';
import { mockMovies, mockTvSeries } from '@/lib/mockData';

const popularSuggestions = [
  {
    id: 155,
    title: 'The Dark Knight',
    poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    release_date: '2008-07-18',
  },
  {
    id: 550,
    title: 'Fight Club',
    poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    release_date: '1999-10-15',
  },
  {
    id: 524434,
    title: 'Oppenheimer',
    poster_path: '/sgqAlvlHB1s9v5uDgtGMJxT7Z6U.jpg',
    release_date: '2023-07-21',
  },
  {
    id: 24428,
    title: 'The Avengers',
    poster_path: '/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg',
    release_date: '2012-05-04',
  },
];

const localCatalog = [...mockMovies, ...mockTvSeries];

const normalizeText = (value: string) => value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

const dedupeMovies = (movies: any[]) => {
  const seen = new Set<number>();
  return movies.filter((movie) => {
    if (seen.has(movie.id)) {
      return false;
    }

    seen.add(movie.id);
    return true;
  });
};

const getLocalMatches = (query: string) => {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return localCatalog.slice(0, 10);
  }

  const terms = normalizedQuery.split(' ').filter(Boolean);
  const isSingleCharacterQuery = normalizedQuery.length === 1;

  return localCatalog
    .map((movie) => {
      const title = normalizeText(movie.title || '');
      const seriesName = normalizeText((movie as any).name || '');
      const overview = normalizeText(movie.overview || '');
      let score = 0;

      if (title === normalizedQuery) score += 100;
      if (seriesName === normalizedQuery) score += 100;
      if (title.startsWith(normalizedQuery)) score += 80;
      if (seriesName.startsWith(normalizedQuery)) score += 80;
      if (title.includes(normalizedQuery)) score += isSingleCharacterQuery ? 24 : 40;
      if (seriesName.includes(normalizedQuery)) score += isSingleCharacterQuery ? 24 : 40;
      if (!isSingleCharacterQuery && overview.includes(normalizedQuery)) score += 12;

      if (!isSingleCharacterQuery) {
        terms.forEach((term) => {
          if (title.includes(term)) score += 8;
          if (seriesName.includes(term)) score += 8;
          if (overview.includes(term)) score += 2;
        });
      }

      return { movie, score };
    })
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .map(({ movie }) => movie)
    .slice(0, 12);
};

export default function Navbar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>(popularSuggestions);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setResults(popularSuggestions);
      setIsSearching(false);
      return;
    }

    const localMatches = getLocalMatches(trimmedQuery);

    setResults(localMatches);

    if (trimmedQuery.length < 2) {
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);

    const timeoutId = setTimeout(async () => {
      try {
        const data = await searchMovies(trimmedQuery);
        const remoteMatches = Array.isArray(data.results) ? data.results : [];
        const combined = dedupeMovies([...remoteMatches, ...localMatches]).slice(0, 12);

        if (!cancelled) {
          setResults(combined.length > 0 ? combined : localMatches);
        }
      } catch (error) {
        console.error('Search error:', error);
        if (!cancelled) {
          setResults(localMatches);
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }, 50);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [query]);

  const showDropdown = isOpen && (results.length > 0 || query.trim().length > 0);

  return (
    <nav className="fixed top-0 w-full bg-slate-950 z-50 p-4 shadow-2xl shadow-black/30">
      <div className="flex items-center justify-between max-w-7xl mx-auto gap-4">
        <Link href="/" className="flex items-center gap-3 text-2xl font-bold text-crimson-600">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300 shadow-[0_0_20px_rgba(56,189,248,0.18)]">M</span>
          MovieDB
        </Link>

        <div ref={containerRef} className="relative w-full max-w-xl">
          <input
            type="text"
            placeholder="Search latest movies, hits, genres..."
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            className="bg-slate-900 text-white placeholder:text-slate-500 px-4 py-3 rounded-3xl w-full border border-slate-800 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition"
          />

          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-3 rounded-3xl border border-cyan-400/20 bg-slate-950/95 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl overflow-hidden">
              <div className="px-4 py-2 text-xs uppercase tracking-[0.35em] text-cyan-300/80 border-b border-cyan-400/10 flex items-center justify-between gap-3">
                <span>{query.length > 0 ? 'Search results' : 'Popular picks'}</span>
                {isSearching ? <span className="text-[10px] tracking-[0.3em] text-slate-400">Updating</span> : null}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {results.length > 0 ? (
                  results.map((movie) =>
                    movie.media_type === 'tv' ? (
                      <Link
                        key={`${movie.media_type}-${movie.id}`}
                        href={`/tv/${movie.id}`}
                        onClick={() => {
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-900/80 transition"
                      >
                        <div className="relative h-16 w-12 overflow-hidden rounded-2xl bg-slate-800">
                          {movie.poster_path ? (
                            <Image
                              src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                              alt={movie.title || movie.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-slate-400">No img</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{movie.title || movie.name}</p>
                          <p className="text-xs text-cyan-300 uppercase tracking-[0.22em]">Series</p>
                          <p className="text-xs text-slate-400 truncate">
                            {movie.first_air_date?.slice(0, 4) || movie.release_date?.slice(0, 4) || 'TV'}
                          </p>
                        </div>
                      </Link>
                    ) : (
                      <Link
                        key={`${movie.media_type || 'movie'}-${movie.id}`}
                        href={`/movie/${movie.id}`}
                        onClick={() => {
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-900/80 transition"
                      >
                        <div className="relative h-16 w-12 overflow-hidden rounded-2xl bg-slate-800">
                          {movie.poster_path ? (
                            <Image
                              src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                              alt={movie.title}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-slate-400">No img</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{movie.title}</p>
                          <p className="text-xs text-cyan-300 uppercase tracking-[0.22em]">Movie</p>
                          <p className="text-xs text-slate-400 truncate">{movie.release_date?.slice(0, 4) || 'Movie'}</p>
                        </div>
                      </Link>
                    ),
                  )
                ) : isSearching ? (
                  <div className="p-4 text-center text-slate-400">Searching...</div>
                ) : query.trim().length > 0 ? (
                  <div className="p-4 text-center text-slate-400">No matches found. Try a different title, genre, or series name.</div>
                ) : (
                  <div className="p-4 text-center text-slate-400">Type to search movies and series.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}