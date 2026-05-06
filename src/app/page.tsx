import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import {
  getTrendingMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  getPopularMovies,
  getNowPlayingMovies,
  getClassicMovies,
  getActionMovies,
  getComedyMovies,
  getDramaMovies,
  getSciFiMovies,
  getCrimeMovies,
  getFamilyMovies,
  getTrendingSeries,
  getPopularSeries,
  getTopRatedSeries,
  getNetflixOriginalSeries,
  getActionSeries,
  getDramaSeries,
} from '@/lib/tmdb';
import Hero from '@/components/Hero';
import SkeletonLoader from '@/components/SkeletonLoader';

export default async function Home() {
  const trendingPromise = getTrendingMovies();
  const topRatedPromise = getTopRatedMovies();
  const upcomingPromise = getUpcomingMovies();
  const popularPromise = getPopularMovies();
  const nowPlayingPromise = getNowPlayingMovies();
  const classicsPromise = getClassicMovies();
  const actionPromise = getActionMovies();
  const comedyPromise = getComedyMovies();
  const dramaPromise = getDramaMovies();
  const sciFiPromise = getSciFiMovies();
  const crimePromise = getCrimeMovies();
  const familyPromise = getFamilyMovies();
  const trendingSeriesPromise = getTrendingSeries();
  const popularSeriesPromise = getPopularSeries();
  const topRatedSeriesPromise = getTopRatedSeries();
  const netflixOriginalsPromise = getNetflixOriginalSeries();
  const actionSeriesPromise = getActionSeries();
  const dramaSeriesPromise = getDramaSeries();

  return (
    <div className="bg-slate-950 text-white min-h-screen">
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection trendingPromise={trendingPromise} popularPromise={popularPromise} topRatedPromise={topRatedPromise} />
      </Suspense>

      <section className="relative z-20 px-4 pb-6 pt-6 sm:px-6 sm:pt-8 sm:pb-8 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'Fresh Picks', subtitle: 'A sharper mix of new releases, buzz titles, and hidden gems.' },
            { title: 'Shows & Movies', subtitle: 'Netflix-style rows with both films and bingeable series.' },
            { title: 'Fast Discovery', subtitle: 'Search and browse with less waiting, more variety.' },
            { title: 'Cinema Staples', subtitle: 'Big crowd-pleasers, critical favorites, and timeless classics.' },
          ].map((card) => (
            <div key={card.title} className="rounded-[2rem] border border-slate-800/60 bg-white/5 px-6 py-7 shadow-2xl shadow-black/20 backdrop-blur-2xl transition hover:border-crimson-400/40">
              <p className="text-xs uppercase tracking-[0.32em] text-slate-400 mb-3">{card.title}</p>
              <p className="text-lg font-semibold leading-snug text-slate-100">{card.subtitle}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<MovieRowSkeleton />}>
          <MovieRowSection title="Trending Now" moviesPromise={trendingPromise} badge="Hot" />
        </Suspense>
      </section>

      <section className="p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<MovieRowSkeleton />}>
          <MovieRowSection title="Trending Series" moviesPromise={trendingSeriesPromise} badge="Series" />
        </Suspense>
      </section>

      <section className="p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<MovieRowSkeleton />}>
          <MovieRowSection title="Netflix Originals" moviesPromise={netflixOriginalsPromise} badge="Netflix" />
        </Suspense>
      </section>

      <section className="p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<MovieRowSkeleton />}>
          <MovieRowSection title="Popular Series" moviesPromise={popularSeriesPromise} badge="Binge" />
        </Suspense>
      </section>

      <section className="p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<MovieRowSkeleton />}>
          <MovieRowSection title="Top Rated Series" moviesPromise={topRatedSeriesPromise} badge="Top" />
        </Suspense>
      </section>

      <section className="p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<MovieRowSkeleton />}>
          <MovieRowSection title="Action Series" moviesPromise={actionSeriesPromise} badge="Action" />
        </Suspense>
      </section>

      <section className="p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<MovieRowSkeleton />}>
          <MovieRowSection title="Drama Series" moviesPromise={dramaSeriesPromise} badge="Drama" />
        </Suspense>
      </section>

      <section className="p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<MovieRowSkeleton />}>
          <MovieRowSection title="Action Thrillers" moviesPromise={actionPromise} badge="Action" />
        </Suspense>
      </section>

      <section className="p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<MovieRowSkeleton />}>
          <MovieRowSection title="Comedy Night" moviesPromise={comedyPromise} badge="Laugh" />
        </Suspense>
      </section>

      <section className="p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<MovieRowSkeleton />}>
          <MovieRowSection title="Drama & Emotion" moviesPromise={dramaPromise} badge="Drama" />
        </Suspense>
      </section>

      <section className="p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<MovieRowSkeleton />}>
          <MovieRowSection title="Sci-Fi & Future" moviesPromise={sciFiPromise} badge="Sci-Fi" />
        </Suspense>
      </section>

      <section className="p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<MovieRowSkeleton />}>
          <MovieRowSection title="Crime & Mystery" moviesPromise={crimePromise} badge="Mystery" />
        </Suspense>
      </section>

      <section className="p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<MovieRowSkeleton />}>
          <MovieRowSection title="Family Favorites" moviesPromise={familyPromise} badge="Family" />
        </Suspense>
      </section>

      <section className="p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<MovieRowSkeleton />}>
          <MovieRowSection title="Now Playing" moviesPromise={nowPlayingPromise} badge="In Theaters" />
        </Suspense>
      </section>

      <section className="p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<MovieRowSkeleton />}>
          <MovieRowSection title="Top Rated" moviesPromise={topRatedPromise} badge="Critic’s Choice" />
        </Suspense>
      </section>

      <section className="p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<MovieRowSkeleton />}>
          <MovieRowSection title="New & Upcoming" moviesPromise={upcomingPromise} badge="Soon" />
        </Suspense>
      </section>

      <section className="p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<MovieRowSkeleton />}>
          <MovieRowSection title="Classics & Favorites" moviesPromise={classicsPromise} badge="Evergreen" />
        </Suspense>
      </section>

      <section className="p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<MovieRowSkeleton />}>
          <MovieRowSection title="Popular Picks" moviesPromise={popularPromise} badge="Popular" />
        </Suspense>
      </section>
    </div>
  );
}

async function HeroSection({
  trendingPromise,
  popularPromise,
  topRatedPromise,
}: {
  trendingPromise: Promise<any>;
  popularPromise: Promise<any>;
  topRatedPromise: Promise<any>;
}) {
  const [trending, popular, topRated] = await Promise.all([trendingPromise, popularPromise, topRatedPromise]);
  const heroMovies = trending.results?.slice(0, 10) || popular.results?.slice(0, 10) || topRated.results?.slice(0, 10) || [];

  if (heroMovies.length === 0) {
    return (
      <div className="bg-slate-900 text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">No Movies Found</h1>
          <p className="text-lg">Unable to load movie data. Please try again later.</p>
        </div>
      </div>
    );
  }

  return <Hero movies={heroMovies} />;
}

async function MovieRowSection({
  title,
  moviesPromise,
  badge,
}: {
  title: string;
  moviesPromise: Promise<any>;
  badge?: string;
}) {
  const moviesData = await moviesPromise;
  const movies = moviesData.results?.slice(0, 10) || [];

  return <MovieRow title={title} movies={movies} badge={badge} />;
}

function HeroSkeleton() {
  return (
    <div className="relative h-screen bg-gray-800">
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative z-10 p-8 flex flex-col justify-center h-full">
        <SkeletonLoader className="h-12 w-96 mb-4" />
        <SkeletonLoader className="h-6 w-full max-w-2xl mb-2" />
        <SkeletonLoader className="h-6 w-3/4 max-w-2xl mb-6" />
        <div className="flex space-x-4">
          <SkeletonLoader className="h-12 w-24 rounded" />
          <SkeletonLoader className="h-12 w-24 rounded" />
        </div>
      </div>
    </div>
  );
}

function MovieRowSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <SkeletonLoader className="h-8 w-48 mb-4" />
      <div className="flex overflow-x-auto space-x-4 pb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonLoader key={i} className="h-56 w-32 flex-shrink-0 rounded sm:h-64 sm:w-40 lg:h-72 lg:w-48" />
        ))}
      </div>
    </div>
  );
}

function MovieRow({ title, movies, badge }: { title: string; movies: any[]; badge?: string }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-4 sm:p-6 lg:p-8 shadow-2xl shadow-black/30 backdrop-blur-xl backdrop-saturate-150">
      <div className="flex items-center justify-between mb-4 gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-crimson-300 font-semibold">{badge || 'Cinema'}</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-100 sm:text-3xl">{title}</h2>
        </div>
        {badge ? (
          <span className="rounded-full bg-crimson-500/15 px-3 py-1 text-xs text-crimson-200 uppercase tracking-[0.28em] font-semibold">{badge}</span>
        ) : null}
      </div>

      <div className="flex overflow-x-auto space-x-4 pb-4">
        {movies.map((movie) => {
          const type = movie.media_type || 'movie';
          const href = type === 'tv' ? `/tv/${movie.id}` : `/movie/${movie.id}`;

          return (
            <Link key={`${type}-${movie.id}`} href={href} className="group w-32 flex-shrink-0 sm:w-40 lg:w-48">
              {movie.poster_path ? (
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[1.75rem] bg-slate-950 border border-cyan-400/10 shadow-xl shadow-cyan-500/5 transition duration-300 group-hover:-translate-y-1 group-hover:border-cyan-400/60">
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title || movie.name}
                    fill
                    sizes="192px"
                    className="object-cover transition duration-300 group-hover:opacity-90"
                  />
                </div>
              ) : (
                <div className="relative aspect-[2/3] w-full rounded-[1.75rem] bg-slate-700 flex items-center justify-center">
                  <span className="text-white">No Image</span>
                </div>
              )}
              <h3 className="mt-3 line-clamp-2 text-xs font-semibold text-slate-100 sm:text-sm">{movie.title || movie.name}</h3>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
