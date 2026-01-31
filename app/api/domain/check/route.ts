import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const rawDomain = searchParams.get('domain');

    if (!rawDomain) {
        return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    // --- SANITIZATION BLUNDER FIX ---
    // Strip protocol (http://, https://), trailing slash, path, and 'www.' prefix
    let domain = rawDomain.trim().toLowerCase()
        .replace(/^(https?:\/\/)/, '') // Remove protocol
        .split('/')[0]                // Remove path/query
        .replace(/^www\./, '');        // Remove www.

    if (!domain.includes('.')) {
        return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 });
    }

    const tld = domain.split('.').pop()?.toLowerCase();
    let rdapUrl = "";

    if (tld === 'com' || tld === 'net') {
        rdapUrl = `https://rdap.verisign.com/${tld}/v1/domain/${domain}`;
    } else if (tld === 'org') {
        // Updated URL format for PIR (.org) - Removed /v1/ which caused Bad Request
        rdapUrl = `https://rdap.publicinterestregistry.org/rdap/domain/${domain}`;
    } else {
        // Fallback to rdap.org for other TLDs
        rdapUrl = `https://rdap.org/domain/${domain}`;
    }

    try {
        const response = await fetch(rdapUrl, {
            headers: {
                'Accept': 'application/rdap+json'
            }
        });

        if (response.status === 404) {
            return NextResponse.json({ available: true, name: domain });
        }

        if (response.ok) {
            const data = await response.json();
            return NextResponse.json({
                available: false,
                name: domain,
                details: {
                    registrar: data.entities?.[0]?.vcardArray?.[1]?.[2]?.[3] || "Unknown",
                    expiryDate: data.events?.find((e: any) => e.eventAction === 'expiration')?.eventDate
                }
            });
        }

        return NextResponse.json({
            available: null,
            error: `Registry returned ${response.status}`
        }, { status: response.status });

    } catch (error) {
        console.error('Domain check proxy error:', error);
        return NextResponse.json({ error: 'Failed to contact RDAP server' }, { status: 500 });
    }
}
