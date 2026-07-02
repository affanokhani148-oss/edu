import { NextResponse } from 'next/server';
import { getSession } from '../../../lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file received.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // To support free Vercel hosting without external AWS S3 buckets, 
    // we convert the image to a Base64 Data URL and store it directly in Postgres.
    const mimeType = file.type || 'image/jpeg';
    const base64Str = `data:${mimeType};base64,${buffer.toString('base64')}`;

    return NextResponse.json({ url: base64Str });
  } catch (e) {
    console.error('Error processing file:', e);
    return NextResponse.json({ error: 'Failed to process file.' }, { status: 500 });
  }
}
