import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    // Validate URL
    const url = new URL(targetUrl);
    
    // Whitelist of allowed domains (security measure)
    const allowedDomains = [
      'maersk.com',
      'dbschenker.com',
      'kn-portal.com',
      'hapag-lloyd.com',
      'msc.com',
      'cma-cgm.com',
      'dhl.com',
      'fedex.com',
      'ups.com',
    ];

    const isAllowed = allowedDomains.some(domain => 
      url.hostname.endsWith(domain) || url.hostname === domain
    );

    if (!isAllowed) {
      return NextResponse.json({ error: 'Domain not whitelisted' }, { status: 403 });
    }

    // Fetch the target URL
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': request.headers.get('user-agent') || 'Mozilla/5.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      redirect: 'follow',
    });

    const contentType = response.headers.get('content-type') || 'text/html';
    let body = await response.text();

    // Inject base tag to fix relative URLs
    if (contentType.includes('text/html')) {
      const baseTag = `<base href="${url.origin}/" target="_blank">`;
      body = body.replace(/<head>/i, `<head>${baseTag}`);
      
      // Remove X-Frame-Options and CSP headers by rewriting them
      body = body.replace(/<meta[^>]*http-equiv=["']X-Frame-Options["'][^>]*>/gi, '');
      body = body.replace(/<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi, '');
    }

    // Return proxied response
    return new NextResponse(body, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        // Remove security headers that block framing
        // DO NOT set X-Frame-Options or CSP
      },
    });

  } catch (error: any) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch target URL', details: error.message },
      { status: 500 }
    );
  }
}
