import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    if (!domain) {
        return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    const tld = domain.split('.').pop()?.toLowerCase();
    let rdapUrl = "";

    if (tld === 'com' || tld === 'net') {
        rdapUrl = `https://rdap.verisign.com/${tld}/v1/domain/${domain.toLowerCase()}`;
    } else if (tld === 'org') {
        rdapUrl = `https://rdap.publicinterestregistry.org/rdap/v1/domain/${domain.toLowerCase()}`;
    } else if (tld === 'net') {
        rdapUrl = `https://rdap.verisign.com/net/v1/domain/${domain.toLowerCase()}`;
    } else {
        // Fallback for others if possible or return error
        // Many registries have their own. For simplicity, we stick to the ones we know.
        // Or we could use a generic bootstrap service, but let's stick to the prompt's focus.
        return NextResponse.json({
            available: null,
            error: "TLD not supported by RDAP proxy yet"
        }, { status: 400 });
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
