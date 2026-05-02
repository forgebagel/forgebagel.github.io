import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getMovieDetails, getMoviesByGenres, getTvDetails } from '@/lib/tmdb';
import CommentSection from '@/components/CommentSection';
import VideoEmbed from '@/components/VideoEmbed';

export default async function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;

  try {
    const movie = await getMovieDetails(resolvedParams.id);
    const related = await getMoviesByGenres(movie.genres?.map((genre: { id: number }) => genre.id) || [], resolvedParams.id);

    const tvCandidate = await getTvDetails(resolvedParams.id);
    if (tvCandidate?.media_type === 'tv' && Array.isArray(tvCandidate.seasons) && tvCandidate.seasons.length > 0) {
      redirect(`/tv/${resolvedParams.id}`);
    }

    return (
      <div className="p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start mb-8">
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
            <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
            <p className="text-lg mb-4">{movie.overview}</p>
            <p className="mb-2">Release Date: {movie.release_date}</p>
            <p className="mb-4">Rating: {movie.vote_average}/10</p>

            {/* Watch Now Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Watch Now</h2>
              <VideoEmbed movieId={movie.id} className="w-full h-96" />
            </div>

            {/* Cast */}
            <h2 className="text-2xl font-bold mb-4">Cast</h2>
            <div className="flex overflow-x-auto space-x-4 pb-4">
              {movie.credits?.cast?.slice(0, 10).length ? (
                movie.credits.cast.slice(0, 10).map((actor: any) => (
                  <div key={actor.id} className="flex-shrink-0 w-24 text-center">
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
                    <p className="text-sm mt-2">{actor.name}</p>
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
        <div className="flex overflow-x-auto space-x-4 pb-4">
          {related.results?.length ? (
            related.results.map((movie: any) => (
              <Link key={movie.id} href={`/movie/${movie.id}`} className="flex-shrink-0 w-48 group">
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-gray-900">
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    fill
                    sizes="192px"
                    className="object-cover transition duration-300 group-hover:opacity-80"
                  />
                </div>
                <h3 className="mt-2 text-sm font-medium">{movie.title}</h3>
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