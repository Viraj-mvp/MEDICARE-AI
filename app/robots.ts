import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/developer/', '/api/', '/profile/'],
        },
        sitemap: 'https://medicare-ai.com/sitemap.xml',
    };
}
