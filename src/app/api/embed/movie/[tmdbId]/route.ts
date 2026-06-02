import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const queryTmdbId = request.nextUrl.searchParams.get('tmdbId') || request.nextUrl.searchParams.get('tmdb') || '';
    const queryImdbId = request.nextUrl.searchParams.get('imdb') || '';

    // Also support path segment since this is in [tmdbId] folder
    const parts = request.nextUrl.pathname.split('/');
    const maybeId = parts[parts.length - 1];
    const id = queryImdbId || queryTmdbId || maybeId || '';

    if (!id) {
      return NextResponse.json({ error: 'tmdb or imdb id is required' }, { status: 400 });
    }

    const idType = id.startsWith('tt') ? 'imdb' : 'tmdb';

    const vidking = {
      name: 'vidking',
      embedUrl: `https://www.vidking.net/embed/movie/${encodeURIComponent(id)}`,
      iframe: `<iframe src="https://www.vidking.net/embed/movie/${encodeURIComponent(
        id
      )}" width="100%" height="600" frameborder="0" allowfullscreen> </iframe>`,
      docs: {
        simpleIntegration:
          'One iframe tag. Example iframe src points to the vidking embed URL.',
        notes:
          'Optimized for HLS playback; recommended to use the iframe directly as primary provider.'
      }
    };

    const vidsrcVariants = [
      'https://vidsrcme.ru/embed/movie',
      'https://vidsrcme.su/embed/movie',
      'https://vidsrc-me.ru/embed/movie',
      'https://vidsrc-me.su/embed/movie',
      'https://vidsrc-embed.ru/embed/movie',
      'https://vidsrc-embed.su/embed/movie',
      'https://vidsrc.me/embed/movie',
      'https://vidsrc.xyz/embed/movie',
      'https://vsrc.su/embed/movie',
    ].map((base) => ({
      name: 'vidsrc',
      provider: base.replace(/^https?:\/\//, ''),
      embedUrl: `${base}/${encodeURIComponent(id)}`,
      queryEmbedUrl: `${base}?${idType}=${encodeURIComponent(id)}`,
      iframe: `<iframe src="${base}/${encodeURIComponent(id)}" width="100%" height="600" frameborder="0" allowfullscreen> </iframe>`,
      docs: {
        simpleIntegration: 'One iframe tag. Use the vidsrc embed URL directly.',
        notes: 'Vidsrc providers are sensitive to tampering — load the iframe directly in the browser.'
      }
    }));

    // Providers list with Vidking first, then vidsrc variants
    const providers = [vidking, ...vidsrcVariants];

    return NextResponse.json({ id, idType, providers, preferred: 'vidking' });
  } catch (err) {
    console.error('embed movie error', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
