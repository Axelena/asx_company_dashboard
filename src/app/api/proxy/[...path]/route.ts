import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const apiPath = path.join('/');

    // Get query parameters from the request URL
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    const baseUrl = (process.env.ASX_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://public.investorhub.com').replace(/\/$/, '');
    const url = `${baseUrl}/${apiPath}${queryString ? `?${queryString}` : ''}`;

    const apiKey = (process.env.ASX_API_KEY || process.env.API_KEY || 'btb9w-fNTk929B38ePAgw4_kgDpb2r7qq7zgXJGZI5s').replace(/['"]/g, '');

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
        'User-Agent': 'ASX-Dashboard/1.0'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Upstream API error (${response.status}):`, errorText);
      return NextResponse.json(
        { error: `Upstream API error: ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
