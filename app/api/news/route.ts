import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    // 1. Get search query or default to health
    const { searchParams } = new URL(req.url);
    const { newsSearchSchema } = await import('@/lib/validation/schemas');

    const rawParams = Object.fromEntries(searchParams.entries());
    const { q, limit } = newsSearchSchema.parse(rawParams);

    const apiKey = process.env.NEWS_API_KEY;

    if (!apiKey) {
        // Fallback Mock Data if no key
        return NextResponse.json({
            status: 'ok',
            source: 'mock',
            articles: MOCK_ARTICLES
        });
    }

    try {
        const response = await fetch(
            `https://newsapi.org/v2/everything?q=${q}&language=en&sortBy=publishedAt&pageSize=${limit}&apiKey=${apiKey}`,
            { next: { revalidate: 3600 } } // Cache for 1 hour
        );

        if (!response.ok) {
            throw new Error(`NewsAPI Error: ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        // Use warn instead of error to avoid cluttering terminal since we have a fallback
        console.warn(`[News API] Fetch failed (using mock data): ${error.message || error}`);
        // Failover to mock data so UI doesn't break
        return NextResponse.json({
            status: 'ok',
            source: 'mock-error-fallback',
            articles: MOCK_ARTICLES
        });
    }
}

const MOCK_ARTICLES = [
    {
        source: { name: "Medical News Today" },
        author: "Tim Newman",
        title: "Latest advances in AI healthcare diagnostics",
        description: "Artificial Intelligence is revolutionizing how we detect early symptoms of chronic diseases, offering hope for earlier interventions.",
        url: "#",
        urlToImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=2070",
        publishedAt: new Date().toISOString(),
        content: "..."
    },
    {
        source: { name: "Healthline" },
        author: "Maria Cohut",
        title: "Top 10 immunity boosting foods for this winter",
        description: "Nutritionists recommend increasing intake of Vitamin C and Zinc rich foods to stay healthy during the flu season.",
        url: "#",
        urlToImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=2070",
        publishedAt: new Date().toISOString(),
        content: "..."
    },
    {
        source: { name: "Science Daily" },
        author: "Science Writer",
        title: "Breakthrough in heart disease prevention research",
        description: "New study suggests that a combination of specific cardio exercises can reduce heart attack risk by 40%.",
        url: "#",
        urlToImage: "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&q=80&w=2070",
        publishedAt: new Date().toISOString(),
        content: "..."
    }
];
