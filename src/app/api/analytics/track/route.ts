import { NextResponse } from 'next/server';
import { saveVisitorToPostgres } from '@/lib/postgres';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Extract client IP address from proxy/CDN headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfIp = request.headers.get('cf-connecting-ip');

    let ip = cfIp || realIp || (forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1');

    // Geo IP lookup if IP is public
    let country = request.headers.get('x-country-name') || 'Unknown';
    let country_code = request.headers.get('x-country-code') || 'XX';
    let region = request.headers.get('x-region-name') || 'Unknown';
    let city = request.headers.get('x-city-name') || 'Unknown';

    // If headers don't have location and IP is external, query free IP geolocation API
    if (country === 'Unknown' && ip && ip !== '127.0.0.1' && ip !== '::1' && !ip.startsWith('192.168.')) {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city`, {
          signal: AbortSignal.timeout(2500),
        });
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.status === 'success') {
            country = geoData.country || country;
            country_code = geoData.countryCode || country_code;
            region = geoData.regionName || region;
            city = geoData.city || city;
          }
        }
      } catch (e) {
        // Fallback silently if API timeout
      }
    }

    const visitorRecord = await saveVisitorToPostgres({
      fingerprint: body.fingerprint || 'anon',
      ip_address: ip,
      city: city,
      region: region,
      country: country,
      country_code: country_code,
      browser: body.browser || 'Unknown Browser',
      os: body.os || 'Unknown OS',
      device_type: body.device_type || 'Desktop',
      screen_resolution: body.screen_resolution || 'Unknown',
      language: body.language || 'en',
      page_url: body.page_url || '/',
      referrer: body.referrer || 'direct',
    });

    return NextResponse.json({ success: true, visitor: visitorRecord });
  } catch (error: any) {
    console.error('Error tracking visitor analytics:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
