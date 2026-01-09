import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return new NextResponse('URL missing', { status: 400 });
  }

  try {
    const response = await fetch(url);
    const contentType = response.headers.get('content-type');
    const buffer = await response.arrayBuffer();

    const headers = new Headers();
    if (contentType) headers.set('Content-Type', contentType);
    // Isso permite que seu localhost acesse a imagem sem erro de CORS
    headers.set('Access-Control-Allow-Origin', '*'); 
    // Cache para não ficar baixando do Google toda hora
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    return new NextResponse(buffer, { headers });
  } catch (error) {
    console.error('Error proxying image:', error);
    return new NextResponse('Failed to fetch image', { status: 500 });
  }
}