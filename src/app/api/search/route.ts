import { NextResponse } from 'next/server';
import { searchMoviesOnServer } from '@/lib/tmdb';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';

  try {
    const data = await searchMoviesOnServer(query);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
