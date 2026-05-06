import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const tmdbId = request.nextUrl.searchParams.get('tmdbId') || '';

    // Also support path segment since this is in [tmdbId] folder
    const parts = request.nextUrl.pathname.split('/');
    const maybeId = parts[parts.length - 1];
    const id = tmdbId || maybeId || '';

    if (!id) {
      return NextResponse.json({ error: 'TMDB id is required' }, { status: 400 });
    }

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

    // Providers list with Vidking as first priority
    const providers = [vidking];

    return NextResponse.json({ tmdbId: id, providers, preferred: 'vidking' });
  } catch (err) {
    console.error('embed movie error', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
