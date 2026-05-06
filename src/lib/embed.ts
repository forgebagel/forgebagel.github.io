export type Provider = {
  name: string;
  embedUrl: string;
  iframe?: string;
  videoTagExample?: string;
  docs?: Record<string, string>;
};

export async function fetchMovieEmbed(tmdbId: string) {
  const res = await fetch(`/api/embed/movie/${encodeURIComponent(tmdbId)}`);
  if (!res.ok) throw new Error('Failed to fetch embed');
  const data = await res.json();
  // prefer vidking if present
  const providers: Provider[] = data.providers || [];
  return { tmdbId: data.tmdbId || tmdbId, providers, preferred: data.preferred };
}

export async function fetchTvEmbed(tmdbId: string, season: string, episode: string) {
  const res = await fetch(
    `/api/embed/tv/${encodeURIComponent(tmdbId)}/${encodeURIComponent(
      season
    )}/${encodeURIComponent(episode)}`
  );
  if (!res.ok) throw new Error('Failed to fetch embed');
  const data = await res.json();
  const providers: Provider[] = data.providers || [];
  return { tmdbId: data.tmdbId || tmdbId, season: data.season || season, episode: data.episode || episode, providers, preferred: data.preferred };
}
