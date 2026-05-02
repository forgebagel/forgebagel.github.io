import Image from 'next/image';
import Link from 'next/link';
import { getTvDetails, getSimilarTvSeries } from '@/lib/tmdb';
import TvPlayer from '@/components/TvPlayer';

export default async function TvPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;

  try {
    const [series, similar] = await Promise.all([
      getTvDetails(resolvedParams.id),
      getSimilarTvSeries(resolvedParams.id),
    ]);

    return (
      <div className="p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start mb-8">
          <div className="w-full lg:w-72">
            {series.poster_path ? (
              <div className="relative aspect-[2/3] w-full overflow-hidden rounded-3xl bg-gray-900">
                <Image
                  src={`https://image.tmdb.org/t/p/w500${series.poster_path}`}
                  alt={series.title || series.name}
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
            <h1 className="text-4xl font-bold mb-4">{series.title || series.name}</h1>
            <p className="text-lg mb-4">{series.overview}</p>
            <p className="mb-2">First Air Date: {series.first_air_date || series.release_date}</p>
            <p className="mb-4">Rating: {series.vote_average}/10</p>

            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Watch Episodes</h2>
              <TvPlayer seriesId={series.id} title={series.title || series.name} seasons={series.seasons || []} />
            </div>

            <h2 className="text-2xl font-bold mb-4">Cast</h2>
            <div className="flex overflow-x-auto space-x-4 pb-4">
              {series.credits?.cast?.slice(0, 10).length ? (
                series.credits.cast.slice(0, 10).map((actor: any) => (
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

        <h2 className="text-2xl font-bold mb-4">Similar Series</h2>
        <div className="flex overflow-x-auto space-x-4 pb-4">
          {similar.results?.length ? (
            similar.results.map((item: any) => (
              <Link key={item.id} href={`/tv/${item.id}`} className="flex-shrink-0 w-48 group">
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-gray-900">
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                    alt={item.title || item.name}
                    fill
                    sizes="192px"
                    className="object-cover transition duration-300 group-hover:opacity-80"
                  />
                </div>
                <h3 className="mt-2 text-sm font-medium">{item.title || item.name}</h3>
              </Link>
            ))
          ) : (
            <p>No similar series found.</p>
          )}
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="bg-slate-900 text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Error Loading Series</h1>
          <p className="text-lg">Unable to load series details. Please try again later.</p>
          <p className="text-sm text-gray-400 mt-2">{error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    );
  }
}
