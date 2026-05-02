import { NextResponse } from 'next/server';
import { getTvDetails } from '@/lib/tmdb';

export async function GET(_request: Request, { params }: { params: any }) {
  const { id } = await params;
  try {
    const data = await getTvDetails(id);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
