import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mediaUrl = searchParams.get('url');

  if (!mediaUrl) {
    return new NextResponse('Missing media URL', { status: 400 });
  }

  try {
    // Fetch the media (image or video) from Sanity CDN
    const response = await fetch(mediaUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    if (!response.ok) {
      return new NextResponse('Failed to fetch media', { status: response.status });
    }

    // Get the media data
    const mediaBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/png';

    // Return the media with proper headers
    return new NextResponse(mediaBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error proxying media:', error);
    return new NextResponse('Error proxying media', { status: 500 });
  }
}

