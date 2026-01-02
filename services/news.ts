export interface Article {
    id: string;
    source: {
        id: string | null;
        name: string;
    };
    author: string | null;
    title: string;
    description: string | null;
    url: string;
    urlToImage: string | null;
    publishedAt: string;
    content: string | null;
}

// NewsData.io Response Structure
interface NewsDataArticle {
    article_id: string;
    title: string;
    link: string;
    keywords?: string[];
    creator?: string[];
    video_url?: string | null;
    description?: string;
    content?: string;
    pubDate: string;
    image_url?: string | null;
    source_id: string;
    country?: string[];
    category?: string[];
    language?: string;
}

interface NewsDataResponse {
    status: string;
    totalResults: number;
    results: NewsDataArticle[];
    nextPage?: string;
}

// Fallback mock data with South Asian flavor
const MOCK_ARTICLES: Article[] = [
    {
        id: '1',
        source: { id: 'the-dheli-times', name: 'The Delhi Daily' },
        author: 'Aarav Patel',
        title: 'Baingan Bharta: A Winter Delight in North India',
        description: 'As temperatures drop, the demand for smoked eggplant dishes rises across the capital.',
        url: 'https://example.com/eggplant-india-1',
        urlToImage: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?q=80&w=1000&auto=format&fit=crop',
        publishedAt: '2024-12-15T10:00:00Z',
        content: 'The aroma of roasting aubergines over charcoal is a staple of Indian winters. This traditional preparation preserves the smoky flavor...'
    },
    {
        id: '2',
        source: { id: 'dhaka-tribune-mock', name: 'Dhaka Tribune' },
        author: 'Fatima Ahmed',
        title: 'Begun Bhaja: The Perfect Side Dish for Khichuri',
        description: 'Why fried eggplant slices are the ultimate comfort food during monsoon season in Bangladesh.',
        url: 'https://example.com/eggplant-bd-1',
        urlToImage: 'https://images.unsplash.com/photo-1596450650964-325bdf354964?q=80&w=1000&auto=format&fit=crop',
        publishedAt: '2024-06-20T14:30:00Z',
        content: 'Simple yet delicious, Begun Bhaja requires only turmeric, salt, and chili powder. It pairs perfectly with rainy days...'
    },
    {
        id: '3',
        source: { id: 'colombo-chronicle', name: 'Colombo Chronicle' },
        author: 'Sanjaya Perera',
        title: 'Wambatu Moju: The Pickle That Defines Sri Lankan Weddings',
        description: 'This eggplant pickle is a must-have on every celebration table.',
        url: 'https://example.com/eggplant-sl-1',
        urlToImage: 'https://images.unsplash.com/photo-1615485925600-9823c959e1e8?q=80&w=1000&auto=format&fit=crop',
        publishedAt: '2024-04-10T09:15:00Z',
        content: 'Caramelized onions, vinegar, and fried eggplant come together in this sweet, sour, and spicy condiment...'
    },
    {
        id: '4',
        source: { id: 'dawn-mock', name: 'Dawn' },
        author: 'Zainab Khan',
        title: 'Export Quality: Pakistani Eggplants Reach New Markets',
        description: 'Farmers in Punjab are seeing record yields and international demand.',
        url: 'https://example.com/eggplant-pk-1',
        urlToImage: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?q=80&w=1000&auto=format&fit=crop',
        publishedAt: '2024-05-18T11:00:00Z',
        content: 'With improved agricultural practices, the local variety of brinjal is gaining popularity in the Gulf region...'
    },
];

// Google News RSS Logic
const GOOGLE_RSS_URL = 'https://news.google.com/rss/search';

// strict cache for pagination support
let allFetchedArticles: Article[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const fetchEggplantNewsInternal = async (page: number = 1, limit: number = 10): Promise<Article[]> => {
    try {
        const now = Date.now();
        if (allFetchedArticles.length > 0 && (page > 1 || now - lastFetchTime < CACHE_DURATION)) {
            const startIndex = (page - 1) * limit;
            // console.log(`Returning cached items ${startIndex} to ${startIndex + limit}`);
            return allFetchedArticles.slice(startIndex, startIndex + limit);
        }

        console.log("Fetching fresh news from Google News RSS (South Asia)...");
        // q=eggplant+OR+brinjal indicates the topic
        // hl=en-IN&gl=IN&ceid=IN:en targets India/South Asia English region
        const query = 'eggplant OR brinjal OR aubergine';
        const url = `${GOOGLE_RSS_URL}?q=${encodeURIComponent(query)}+when:30d&hl=en-IN&gl=IN&ceid=IN:en`;

        const response = await fetch(url);
        const text = await response.text();

        // Simple Regex Parser for RSS (XML)
        // Note: In a production app, use a proper XML parser like 'fast-xml-parser'
        const itemRegex = /<item>[\s\S]*?<\/item>/g;
        const items = text.match(itemRegex) || [];

        const articles: Article[] = items.map((itemXml) => {
            const titleMatch = itemXml.match(/<title>(.*?)<\/title>/);
            const linkMatch = itemXml.match(/<link>(.*?)<\/link>/);
            const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/);
            const sourceMatch = itemXml.match(/<source.*?>([\s\S]*?)<\/source>/);
            const guidMatch = itemXml.match(/<guid.*?>(.*?)<\/guid>/);
            // Description often contains HTML link, plain text is harder to extract cleanly without a DOM parser
            // We'll try to just grab the raw html or a snippet. Google description is usually just a link anchor.
            // Actually Google News description is often just a link to the article again.
            // We will leave description empty or try to clean it.
            const descriptionMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/);

            // Try to find an image in the description HTML
            let extractedImage = null;
            if (descriptionMatch && descriptionMatch[1]) {
                const imgMatch = descriptionMatch[1].match(/src="(.*?)"/);
                if (imgMatch) {
                    extractedImage = imgMatch[1];
                }
            }

            let id = guidMatch ? guidMatch[1] : Math.random().toString();
            const link = linkMatch ? linkMatch[1] : '';
            const title = titleMatch ? titleMatch[1] : 'No Title';
            const date = pubDateMatch ? pubDateMatch[1] : new Date().toISOString();
            const sourceName = sourceMatch ? sourceMatch[1] : 'News';

            // Attempt to simulate a description from title if missing (Google RSS implies title is the news)
            // Google News descriptions usually contain an anchor tag like <a href="...">text</a>.
            // We want to extract the cleaned text, or if it's just a link, maybe show a snippet.
            let cleanDescription = title;
            if (descriptionMatch && descriptionMatch[1]) {
                // 1. Decode generic entities manually (React Native doesn't have a full DOM parser or 'he' lib by default easily)
                let rawDesc = descriptionMatch[1]
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&amp;/g, '&')
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'");

                // 2. Remove all HTML tags to leave just text
                rawDesc = rawDesc.replace(/<[^>]+>/g, '');

                // 3. Google News specific cleanup: "Google News" often incorrectly duplicates the source or just shows "View full coverage"
                // If the result is very short or looks like a URL, prefer the title or empty.
                if (rawDesc.trim().length > 10 && !rawDesc.includes("http")) {
                    cleanDescription = rawDesc.trim();
                }
            }

            // Fallback: If description is still "messy" (starts with http), default to empty or title
            if (cleanDescription.startsWith("http") || cleanDescription.startsWith("&")) {
                cleanDescription = "Click to read full article";
            }

            return {
                id,
                source: { id: null, name: sourceName },
                author: sourceName,
                title,
                description: cleanDescription,
                url: link,
                urlToImage: extractedImage,
                publishedAt: date,
                content: null
            };
        });

        if (articles.length === 0) {
            console.log("No RSS items found.");
            return [];
        }

        // Sort: Latest First
        articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

        allFetchedArticles = articles;
        lastFetchTime = Date.now();

        const startIndex = (page - 1) * limit;
        return allFetchedArticles.slice(startIndex, startIndex + limit);

    } catch (error) {
        console.error('Error fetching RSS news:', error);
        return [];
    }
};

export const getArticleById = async (id: string): Promise<Article | undefined> => {
    // 1. In a real app with state management (Redux/Zustand), we would look up the store.
    // Since we don't have that, and NewsData.io doesn't have a free "get single article" endpoint easily accessible without search costs,
    // we will have to RELY on the fact that the user clicked an item from the list we just fetched.

    // HOWEVER, since this is a separate screen, and we aren't passing the whole object via params (common React Native pattern is ID only),
    // we have a dilemma. 

    // TEMPORARY FIX: Re-fetch the list? No, that's wasteful.
    // BETTER FIX: The 'news.tsx' should probably default to passing the whole object or we use a temporary in-memory cache here.

    // For this assignment, let's implement a simple in-memory cache in this file.
    return cachedArticles.find(a => a.id === id);
};

// Simple in-memory cache to store the last fetched results
let cachedArticles: Article[] = [];

// Wrap the fetch to update cache
const originalFetch = fetchEggplantNewsInternal;
export const fetchEggplantNewsWithCache = async (page: number = 1, limit: number = 10): Promise<Article[]> => {
    const articles = await originalFetch(page, limit);
    // Add new items to cache for details view, avoiding duplicates
    articles.forEach(article => {
        if (!cachedArticles.find(a => a.id === article.id)) {
            cachedArticles.push(article);
        }
    });
    return articles;
};

// Overwrite the export to use the cached version
export { fetchEggplantNewsWithCache as fetchEggplantNews };
