import Image from 'next/image';
import Link from 'next/link';
import { getMovieDetails, getMoviesByGenres } from '@/lib/tmdb';
import CommentSection from '@/components/CommentSection';

export default async function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;

  try {
    const movie = await getMovieDetails(resolvedParams.id);
    const related = await getMoviesByGenres(movie.genres?.map((genre: { id: number }) => genre.id) || [], resolvedParams.id);

    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-8 flex flex-col gap-8 lg:flex-row lg:items-start">
          <div className="w-full lg:w-72">
            {movie.poster_path ? (
              <div className="relative aspect-[2/3] w-full overflow-hidden rounded-3xl bg-gray-900">
                <Image
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  fill
                  sizes="288px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="relative aspect-[2/3] w-full rounded-3xl bg-gray-800 flex items-center justify-center">
                <span className="text-gray-300">Poster unavailable</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="mb-4 text-3xl font-bold sm:text-4xl">{movie.title}</h1>
            <p className="mb-4 text-base sm:text-lg">{movie.overview}</p>
            <p className="mb-2">Release Date: {movie.release_date}</p>
            <p className="mb-4">Rating: {movie.vote_average}/10</p>

            {/* Watch Now Section */}
            <div className="relative z-0 mb-10">
              <h2 className="text-2xl font-bold mb-4">Watch Now</h2>
              <div className="w-full rounded-2xl border-2 border-slate-700 shadow-2xl shadow-black/40 overflow-hidden bg-black">
                <iframe
                  src={`https://www.vidking.net/embed/movie/${movie.id}`}
                  width="100%"
                  height="600"
                  className="aspect-video"
                  frameBorder="0"
                  allowFullScreen
                  title="Movie Player"
                />
              </div>
            </div>

            {/* Cast */}
            <h2 className="text-2xl font-bold mb-4">Cast</h2>
            <div className="flex overflow-x-auto space-x-3 pb-4 sm:space-x-4">
              {movie.credits?.cast?.slice(0, 10).length ? (
                movie.credits.cast.slice(0, 10).map((actor: any) => (
                  <div key={actor.id} className="w-20 flex-shrink-0 text-center sm:w-24">
                    {actor.profile_path ? (
                      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-gray-900">
                        <Image
                          src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                          alt={actor.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="relative aspect-[2/3] w-full rounded-xl bg-gray-800 flex items-center justify-center">
                        <span className="text-gray-300 text-xs">No image</span>
                      </div>
                    )}
                    <p className="mt-2 text-xs sm:text-sm">{actor.name}</p>
                  </div>
                ))
              ) : (
                <p>No cast information available.</p>
              )}
            </div>
          </div>
        </div>

        {/* Genre-based Movies */}
        <h2 className="text-2xl font-bold mb-4">
          More {movie.genres?.[0]?.name ? `${movie.genres[0].name} ` : ''}Movies
        </h2>
        <div className="flex overflow-x-auto space-x-3 pb-4 sm:space-x-4">
          {related.results?.length ? (
            related.results.map((movie: any) => (
              <Link key={movie.id} href={`/movie/${movie.id}`} className="group w-32 flex-shrink-0 sm:w-40 lg:w-48">
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-gray-900">
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    fill
                    sizes="192px"
                    className="object-cover transition duration-300 group-hover:opacity-80"
                  />
                </div>
                <h3 className="mt-2 text-xs font-medium sm:text-sm">{movie.title}</h3>
              </Link>
            ))
          ) : (
            <p>No genre-based movies found.</p>
          )}
        </div>

        <CommentSection movieId={resolvedParams.id} movieTitle={movie.title} />
      </div>
    );
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'digest' in error && String((error as { digest?: unknown }).digest).includes('NEXT_REDIRECT')) {
      throw error;
    }

    return (
      <div className="bg-slate-900 text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Error Loading Movie</h1>
          <p className="text-lg">Unable to load movie details. Please try again later.</p>
          <p className="text-sm text-gray-400 mt-2">{error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    );
  }
}