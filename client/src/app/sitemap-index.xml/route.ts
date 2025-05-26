import { getUniversities } from '@/requests/getRequests';

export async function GET() {
  const baseUrl = 'https://ratethatclass.com';

  try {
    const universities = await getUniversities();

    // Create sitemap index XML
    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  ${universities
    .slice(0, 10)
    .map((university) => {
      const universityTag = university.university_name.replaceAll(' ', '_').toLowerCase();
      return `<sitemap>
    <loc>${baseUrl}/sitemap-${universityTag}.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`;
    })
    .join('\n  ')}
</sitemapindex>`;

    return new Response(sitemapIndex, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap index:', error);
    return new Response('Error generating sitemap index', { status: 500 });
  }
}
