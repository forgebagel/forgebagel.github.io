import { NextResponse } from 'next/server';
import { getTvSeasonDetails } from '@/lib/tmdb';

export async function GET(_request: Request, { params }: { params: any }) {
  const { id, season } = await params;
  try {
    const data = await getTvSeasonDetails(id, Number(season));
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
