import {
  mockMovies,
  mockTrending,
  mockTopRated,
  mockUpcoming,
  mockNowPlaying,
  mockClassic,
  mockPopular,
  mockTvTrending,
  mockTvPopular,
  mockTvTopRated,
  mockNetflixOriginals,
  mockTvSeries,
} from './mockData';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const VIDSRC_BASE = 'https://vidsrcme.ru';

// IDs to hide from the site (movies or TV shows that should not be shown)
const BLOCKED_IDS = new Set<number>([122009]);

const CACHE_CONFIG = { next: { revalidate: 300 } };

// Simple server-side in-memory cache to avoid repeated slow TMDb network calls
// during development. TTL is in milliseconds.
const serverCache: Map<string, { ts: number; val: any }> = (globalThis as any).__tmdbServerCache || new Map();
(globalThis as any).__tmdbServerCache = serverCache;

async function fetchWithServerCache(url: string, opts?: RequestInit, ttl = 1000 * 60 * 5, fetchTimeout = 3000) {
  const key = url;
  const now = Date.now();
  const cached = serverCache.get(key);
  if (cached && now - cached.ts < ttl) return cached.val;

  const controller = new AbortController();
  const signal = controller.signal;
  const timeout = setTimeout(() => controller.abort(), fetchTimeout);

  try {
    const res = await fetch(url, { ...(opts || {}), signal } as any);
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`Fetch failed ${res.status}`);
    const data = await res.json();
    serverCache.set(key, { ts: now, val: data });
    return data;
  } catch (err) {
    clearTimeout(timeout);
    if (cached) return cached.val; // return stale value if available
    throw err;
  }
}

const normalizeMediaItem = (item: any, mediaType: 'movie' | 'tv') => ({
  ...item,
  media_type: mediaType,
  title: item.title || item.name,
  name: item.name || item.title,
  release_date: item.release_date || item.first_air_date || '',
  first_air_date: item.first_air_date || item.release_date || '',
});

const normalizeMediaList = (results: any[], mediaType: 'movie' | 'tv') => ({
  results: (results || []).filter((item) => !BLOCKED_IDS.has(Number(item?.id))).map((item) => normalizeMediaItem(item, mediaType)),
});

const movieFallbackLists = [
  mockMovies,
  mockTrending.results,
  mockTopRated.results,
  mockUpcoming.results,
  mockNowPlaying.results,
  mockClassic.results,
  mockPopular.results,
];

const findMovieFallback = (id: number) => {
  for (const list of movieFallbackLists) {
    const match = list.find((movie: any) => movie.id === id);
    if (match) return match;
  }

  return null;
};

const fetchMovieList = async (path: string, fallback: { results: any[] }) => {
  try {
    const res = await fetch(`${BASE_URL}${path}?api_key=${API_KEY}`, CACHE_CONFIG);
    if (!res.ok) throw new Error(`Failed to fetch ${path}`);
    const data = await res.json();
    data.results = (data.results || []).filter((item: any) => !BLOCKED_IDS.has(Number(item?.id)));
    return data;
  } catch {
    // ensure fallback doesn't include blocked ids
    return { results: (fallback.results || []).filter((item: any) => !BLOCKED_IDS.has(Number(item?.id))) };
  }
};

export const getTrendingMovies = async () => {
  return fetchMovieList('/trending/movie/week', mockTrending);
};

export const getTopRatedMovies = async () => {
  return fetchMovieList('/movie/top_rated', mockTopRated);
};

export const getUpcomingMovies = async () => {
  return fetchMovieList('/movie/upcoming', mockUpcoming);
};

export const getNowPlayingMovies = async () => {
  return fetchMovieList('/movie/now_playing', mockNowPlaying);
};

export const getClassicMovies = async () => {
  try {
    const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=vote_average.desc&primary_release_date.lte=2000-01-01&vote_count.gte=500`, CACHE_CONFIG);
    if (!res.ok) throw new Error('Failed to fetch classic movies');
    return res.json();
  } catch {
    return mockClassic;
  }
};

export const getPopularMovies = async () => {
  return fetchMovieList('/movie/popular', mockPopular);
};

const fetchDiscoverMovies = async (query: string, fallback: { results: any[] }) => {
  try {
    const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&${query}`, CACHE_CONFIG);
    if (!res.ok) throw new Error('Failed to fetch discover movies');
    return res.json();
  } catch {
    return fallback;
  }
};

const fetchTvList = async (path: string, fallback: { results: any[] }) => {
  try {
    const res = await fetch(`${BASE_URL}${path}?api_key=${API_KEY}`, CACHE_CONFIG);
    if (!res.ok) throw new Error(`Failed to fetch ${path}`);
    const data = await res.json();
    data.results = (data.results || []).filter((item: any) => !BLOCKED_IDS.has(Number(item?.id)));
    return normalizeMediaList(data.results || [], 'tv');
  } catch {
    return { results: (fallback.results || []).filter((item: any) => !BLOCKED_IDS.has(Number(item?.id))) };
  }
};

const fetchDiscoverTv = async (query: string, fallback: { results: any[] }) => {
  try {
    const res = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&${query}`, CACHE_CONFIG);
    if (!res.ok) throw new Error('Failed to fetch discover tv shows');
    const data = await res.json();
    return normalizeMediaList(data.results || [], 'tv');
  } catch {
    return fallback;
  }
};

export const searchMoviesOnServer = async (query: string) => {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < 2) {
    return { results: [] };
  }

  try {
    const [movieRes, tvRes] = await Promise.all([
      fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(normalizedQuery)}`),
      fetch(`${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(normalizedQuery)}`),
    ]);

    const movieData = movieRes.ok ? await movieRes.json() : { results: [] };
    const tvData = tvRes.ok ? await tvRes.json() : { results: [] };

    const combined = [
      ...(movieData.results || []).map((item: any) => normalizeMediaItem(item, 'movie')),
      ...(tvData.results || []).map((item: any) => normalizeMediaItem(item, 'tv')),
    ];

    const normalizeForSearch = (value: string) =>
      value
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const levenshteinDistance = (left: string, right: string) => {
      const m = left.length;
      const n = right.length;

      if (!m) return n;
      if (!n) return m;

      const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

      for (let i = 0; i <= m; i += 1) dp[i][0] = i;
      for (let j = 0; j <= n; j += 1) dp[0][j] = j;

      for (let i = 1; i <= m; i += 1) {
        for (let j = 1; j <= n; j += 1) {
          const cost = left[i - 1] === right[j - 1] ? 0 : 1;
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1,
            dp[i][j - 1] + 1,
            dp[i - 1][j - 1] + cost,
          );
        }
      }

      return dp[m][n];
    };

    // Score and rank results to prioritize exact/start-with matches and tolerate minor typos.
    const ranked = combined
      .map((item) => {
        const normalizedTitle = normalizeForSearch(item.title || '');
        const normalizedQueryLower = normalizeForSearch(normalizedQuery);
        const normalizedTitleCompact = normalizedTitle.replace(/\s+/g, '');
        const normalizedQueryCompact = normalizedQueryLower.replace(/\s+/g, '');
        const titleWords = normalizedTitle.split(' ').filter(Boolean);
        const queryWords = normalizedQueryLower.split(' ').filter(Boolean);
        let score = 0;

        if (normalizedTitle === normalizedQueryLower) score += 260;
        if (normalizedTitle.startsWith(normalizedQueryLower)) score += 150;
        if (normalizedTitle.includes(normalizedQueryLower)) score += 90;

        const compactDistance = levenshteinDistance(normalizedTitleCompact, normalizedQueryCompact);
        const tokenDistance = titleWords.length
          ? Math.min(...titleWords.map((word) => levenshteinDistance(word, normalizedQueryCompact)))
          : compactDistance;

        const bestDistance = Math.min(compactDistance, tokenDistance);
        if (bestDistance === 1) score += 75;
        if (bestDistance === 2 && normalizedQueryCompact.length >= 5) score += 35;

        const tokenMatches = queryWords.filter((word) => normalizedTitle.includes(word)).length;
        score += tokenMatches * 18;

        if ((item.overview || '').toLowerCase().includes(normalizedQueryLower)) score += 6;

        return { item, score };
      })
      .filter(({ score }) => score >= 40)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item);

    return { results: ranked };
  } catch {
    const normalizedQueryText = normalizedQuery.toLowerCase();
    const combined = [
      ...mockTrending.results.map((item) => normalizeMediaItem(item, 'movie')),
      ...mockTvSeries.map((item) => normalizeMediaItem(item, 'tv')),
    ];

    return {
      results: combined.filter((item) => `${item.title} ${item.overview || ''}`.toLowerCase().includes(normalizedQueryText)),
    };
  }
};

export const getActionMovies = async () => fetchDiscoverMovies('with_genres=28&sort_by=popularity.desc&vote_count.gte=200', mockPopular);
export const getComedyMovies = async () => fetchDiscoverMovies('with_genres=35&sort_by=popularity.desc&vote_count.gte=100', mockPopular);
export const getDramaMovies = async () => fetchDiscoverMovies('with_genres=18&sort_by=vote_average.desc&vote_count.gte=200', mockTopRated);
export const getSciFiMovies = async () => fetchDiscoverMovies('with_genres=878&sort_by=popularity.desc&vote_count.gte=100', mockTrending);
export const getCrimeMovies = async () => fetchDiscoverMovies('with_genres=80&sort_by=vote_average.desc&vote_count.gte=100', mockClassic);
export const getFamilyMovies = async () => fetchDiscoverMovies('with_genres=10751&sort_by=popularity.desc&vote_count.gte=50', mockUpcoming);

export const getTrendingSeries = async () => fetchTvList('/trending/tv/week', mockTvTrending);
export const getPopularSeries = async () => fetchTvList('/tv/popular', mockTvPopular);
export const getTopRatedSeries = async () => fetchTvList('/tv/top_rated', mockTvTopRated);
export const getNetflixOriginalSeries = async () => fetchDiscoverTv('with_networks=213&sort_by=popularity.desc&vote_count.gte=50', mockNetflixOriginals);
export const getActionSeries = async () => fetchDiscoverTv('with_genres=10759&sort_by=popularity.desc&vote_count.gte=50', mockTvPopular);
export const getDramaSeries = async () => fetchDiscoverTv('with_genres=18&sort_by=vote_average.desc&vote_count.gte=100', mockTvTopRated);

export const getMovieDetails = async (id: string) => {
  const numericId = parseInt(id, 10);
  if (BLOCKED_IDS.has(numericId)) throw new Error('Blocked');

  try {
    const data = await fetchWithServerCache(
      `${BASE_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=credits,videos`,
      undefined,
      1000 * 60 * 10,
    );
    return normalizeMediaItem(data, 'movie');
  } catch (error) {
    console.warn('TMDb movie details request failed', error);
  }

  console.log('Using mock data for movie details fallback');
  const movie = findMovieFallback(parseInt(id));
  if (movie) return movie;

  return {
    id: parseInt(id),
    title: `Movie ${id}`,
    overview: 'Movie details are unavailable right now.',
    release_date: '',
    vote_average: 0,
    poster_path: null,
    backdrop_path: null,
    credits: { cast: [] },
    videos: { results: [] },
  };
};

  export const getTvDetails = async (id: string) => {
    const numericId = parseInt(id, 10);
    if (BLOCKED_IDS.has(numericId)) throw new Error('Blocked');

    try {
      const data = await fetchWithServerCache(`${BASE_URL}/tv/${id}?api_key=${API_KEY}&append_to_response=credits,videos`, undefined, 1000 * 60 * 10);
      return normalizeMediaItem(data, 'tv');
    } catch (error) {
      console.warn('TMDb tv details request failed', error);
    }

    const series = mockTvSeries.find((item) => item.id === parseInt(id));
    if (series) return series;

    return {
      id: parseInt(id),
      title: 'Unknown Series',
      name: 'Unknown Series',
      overview: 'Series details are unavailable right now.',
      release_date: '',
      first_air_date: '',
      vote_average: 0,
      poster_path: null,
      backdrop_path: null,
      credits: { cast: [] },
      videos: { results: [] },
      media_type: 'tv',
    };
  };

export const getTvSeasonDetails = async (seriesId: string, seasonNumber: number) => {
  try {
    const data = await fetchWithServerCache(`${BASE_URL}/tv/${seriesId}/season/${seasonNumber}?api_key=${API_KEY}`, undefined, 1000 * 60 * 60);
    return {
      ...data,
      episodes: (data.episodes || []).map((episode: any) => ({
        ...episode,
        title: episode.name,
      })),
    };
  } catch {
    const series = mockTvSeries.find((item) => item.id === parseInt(seriesId)) as any;
    const fallbackSeason = series?.seasons?.find((season: any) => season.season_number === seasonNumber);

    return {
      id: seasonNumber,
      name: fallbackSeason?.name || `Season ${seasonNumber}`,
      season_number: seasonNumber,
      episodes: fallbackSeason?.episodes || [],
    };
  }
};

export const searchMovies = async (query: string) => {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < 2) {
    return { results: [] };
  }

  try {
    const response = await fetch(`/api/search?query=${encodeURIComponent(normalizedQuery)}`);

    if (!response.ok) {
      throw new Error(`Search failed ${response.status}`);
    }

    return response.json();
  } catch {
    return searchMoviesOnServer(normalizedQuery);
  }
};

export const getSimilarMovies = async (id: string) => {
  try {
    const res = await fetch(`${BASE_URL}/movie/${id}/similar?api_key=${API_KEY}`);
    if (!res.ok) throw new Error('Failed to fetch similar movies');
    return res.json();
  } catch {
    console.log('Using mock data for similar movies');
    return { results: mockTrending.results.filter(m => m.id !== parseInt(id)).slice(0, 2) };
  }
};

export const getMoviesByGenres = async (genreIds: number[], excludeMovieId?: string) => {
  const filteredGenreIds = Array.from(new Set(genreIds.filter((genreId) => Number.isFinite(genreId)))).slice(0, 3);

  if (!filteredGenreIds.length) {
    return {
      results: mockTrending.results.filter((movie: any) => movie.id !== parseInt(excludeMovieId || '', 10)).slice(0, 8),
    };
  }

  try {
    const res = await fetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${filteredGenreIds.join(',')}&sort_by=popularity.desc&vote_count.gte=50`,
      CACHE_CONFIG,
    );

    if (!res.ok) throw new Error('Failed to fetch genre-based movies');

    const data = await res.json();
    const currentMovieId = parseInt(excludeMovieId || '', 10);

    return {
      ...data,
      results: (data.results || []).filter((movie: any) => movie.id !== currentMovieId),
    };
  } catch {
    const currentMovieId = parseInt(excludeMovieId || '', 10);

    return {
      results: mockTrending.results.filter((movie: any) => movie.id !== currentMovieId).slice(0, 8),
    };
  }
};

  export const getSimilarTvSeries = async (id: string) => {
    try {
      const res = await fetch(`${BASE_URL}/tv/${id}/similar?api_key=${API_KEY}`, CACHE_CONFIG);
      if (!res.ok) throw new Error('Failed to fetch similar tv series');
      const data = await res.json();
      return normalizeMediaList(data.results || [], 'tv');
    } catch {
      return { results: mockTvSeries.filter((item) => item.id !== parseInt(id)).slice(0, 4) };
    }
  };