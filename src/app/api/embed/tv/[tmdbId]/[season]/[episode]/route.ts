import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Try query params first
    const qTmdbId = request.nextUrl.searchParams.get('tmdbId') || request.nextUrl.searchParams.get('tmdb') || '';
    const qImdbId = request.nextUrl.searchParams.get('imdb') || '';
    const qSeason = request.nextUrl.searchParams.get('season') || '';
    const qEpisode = request.nextUrl.searchParams.get('episode') || '';

    // Fallback to path segments for routes under [tmdbId]/[season]/[episode]
    const parts = request.nextUrl.pathname.split('/').filter(Boolean);
    // parts end should be ['api','embed','tv','<tmdbId>','<season>','<episode>']
    const maybeEpisode = parts[parts.length - 1] || '';
    const maybeSeason = parts[parts.length - 2] || '';
    const maybeTmdb = parts[parts.length - 3] || '';

    const mediaId = qImdbId || qTmdbId || maybeTmdb;
    const season = qSeason || maybeSeason;
    const episode = qEpisode || maybeEpisode;

    if (!mediaId || !season || !episode) {
      return NextResponse.json(
        { error: 'tmdb or imdb id, season and episode are required' },
        { status: 400 }
      );
    }

    const idType = mediaId.startsWith('tt') ? 'imdb' : 'tmdb';

    const vidking = {
      name: 'vidking',
      embedUrl: `https://www.vidking.net/embed/tv/${encodeURIComponent(
        mediaId
      )}/${encodeURIComponent(season)}/${encodeURIComponent(episode)}`,
      iframe: `<iframe src="https://www.vidking.net/embed/tv/${encodeURIComponent(
        mediaId
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

    const vidsrcBases = [
      'https://vidsrcme.ru/embed/tv',
      'https://vidsrcme.su/embed/tv',
      'https://vidsrc-me.ru/embed/tv',
      'https://vidsrc-me.su/embed/tv',
      'https://vidsrc-embed.ru/embed/tv',
      'https://vidsrc-embed.su/embed/tv',
      'https://vidsrc.me/embed/tv',
      'https://vidsrc.xyz/embed/tv',
      'https://vsrc.su/embed/tv',
    ];

    const vidsrcVariants = vidsrcBases.map((base) => ({
      name: 'vidsrc',
      provider: base.replace(/^https?:\/\//, ''),
      embedUrl: `${base}/${encodeURIComponent(mediaId)}/${encodeURIComponent(season)}-${encodeURIComponent(episode)}`,
      queryEmbedUrl: `${base}?${idType}=${encodeURIComponent(mediaId)}&season=${encodeURIComponent(season)}&episode=${encodeURIComponent(episode)}`,
      iframe: `<iframe src="${base}/${encodeURIComponent(mediaId)}/${encodeURIComponent(season)}-${encodeURIComponent(episode)}" width="100%" height="600" frameborder="0" allowfullscreen> </iframe>`,
      videoTagExample:
        '<video class="w-full h-full" crossorigin="anonymous" playsinline preload="auto" src="blob:https://vidsrc.example/EXAMPLE-BLOB"></video>',
      docs: {
        simpleIntegration: 'One iframe tag. Use the vidsrc embed URL directly.',
        notes: 'Vidsrc providers are sensitive to tampering — load the iframe directly in the browser.'
      }
    }));

    const providers = [vidking, ...vidsrcVariants];

    return NextResponse.json({ id: mediaId, idType, season, episode, providers, preferred: 'vidking' });
  } catch (err) {
    console.error('embed tv error', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
