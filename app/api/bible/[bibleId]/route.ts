import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { bibleId: string } }) {
  const { bibleId } = params;
  // The user specified two specific IDs:
  // de295e9ba65f6d0f-01 - Malayalam
  // bba9f40183526463-01 - English
  if (bibleId === 'de295e9ba65f6d0f-01') {
    return NextResponse.json({ message: `GET Malayalam Bible entry with ID: ${bibleId}` });
  } else if (bibleId === 'bba9f40183526463-01') {
    return NextResponse.json({ message: `GET English Bible entry with ID: ${bibleId}` });
  } else {
    return NextResponse.json({ message: `Bible entry with ID: ${bibleId} not found` }, { status: 404 });
  }
}
