import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Try query params first
    const qTmdbId = request.nextUrl.searchParams.get('tmdbId') || '';
    const qSeason = request.nextUrl.searchParams.get('season') || '';
    const qEpisode = request.nextUrl.searchParams.get('episode') || '';

    // Fallback to path segments for routes under [tmdbId]/[season]/[episode]
    const parts = request.nextUrl.pathname.split('/').filter(Boolean);
    // parts end should be ['api','embed','tv','<tmdbId>','<season>','<episode>']
    const maybeEpisode = parts[parts.length - 1] || '';
    const maybeSeason = parts[parts.length - 2] || '';
    const maybeTmdb = parts[parts.length - 3] || '';

    const tmdbId = qTmdbId || maybeTmdb;
    const season = qSeason || maybeSeason;
    const episode = qEpisode || maybeEpisode;

    if (!tmdbId || !season || !episode) {
      return NextResponse.json(
        { error: 'tmdbId, season and episode are required' },
        { status: 400 }
      );
    }

    const vidking = {
      name: 'vidking',
      embedUrl: `https://www.vidking.net/embed/tv/${encodeURIComponent(
        tmdbId
      )}/${encodeURIComponent(season)}/${encodeURIComponent(episode)}`,
      iframe: `<iframe src="https://www.vidking.net/embed/tv/${encodeURIComponent(
        tmdbId
      )}/${encodeURIComponent(season)}/${encodeURIComponent(
        episode
      )}" width="100%" height="600" frameborder="0" allowfullscreen> </iframe>`,
      videoTagExample:
        '<video class="w-full h-full" crossorigin="anonymous" playsinline preload="auto" src="blob:https://www.vidking.net/EXAMPLE-BLOB"></video>',
      docs: {
        simpleIntegration:
          'One iframe tag. Use /embed/tv/{tmdbId}/{season}/{episode} with TMDB ids.',
        notes:
          'Vidking is optimized for HLS playback using HLS.js. Use iframe as first-priority provider.'
      }
    };

    const providers = [vidking];

    return NextResponse.json({ tmdbId, season, episode, providers, preferred: 'vidking' });
  } catch (err) {
    console.error('embed tv error', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
