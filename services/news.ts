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

// NewsData.io API Key
const API_KEY = process.env.EXPO_PUBLIC_NEWSDATA_API_KEY || 'pub_64858d88691522a4d334057884d6642d997da'; // Use env variable in prod!
const BASE_URL = 'https://newsdata.io/api/1/news';

const fetchEggplantNewsInternal = async (): Promise<Article[]> => {
    try {
        console.log("Fetching news from NewsData.io...");
        // Country codes: in (India), pk (Pakistan), bd (Bangladesh), lk (Sri Lanka), np (Nepal)
        // Note: NewsData.io free tier might have limits on how many countries you can filter at once or which ones are available.
        // If 'eggplant' results are low, consider adding 'aubergine', 'brinjal' (common in South Asia).
        const query = 'eggplant OR brinjal OR aubergine'; // Expanded query for better results in this region
        const countries = 'in,pk,bd,lk,np';

        const url = `${BASE_URL}?apikey=${API_KEY}&q=${encodeURIComponent(query)}&country=${countries}&language=en`;

        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            console.warn(`NewsData API request failed (${response.status}):`, errorText);
            console.warn('Falling back to mock data.');
            return MOCK_ARTICLES;
        }

        const data: NewsDataResponse = await response.json();

        if (data.status !== 'success') {
            console.warn('NewsData API returned error status:', data);
            return MOCK_ARTICLES;
        }

        // Map NewsData structure to our App's Article structure
        const mappedArticles: Article[] = data.results
            .filter(item => item.title && item.link) // Basic validation
            .map(item => ({
                id: item.article_id,
                source: {
                    id: item.source_id,
                    name: item.source_id // NewsData doesn't give a pretty name separate from ID usually
                },
                author: item.creator ? item.creator.join(', ') : null,
                title: item.title,
                description: item.description || null,
                url: item.link,
                urlToImage: item.image_url || null,
                publishedAt: item.pubDate,
                content: item.content || null
            }));

        // If no results found, return mock data so the screen isn't empty during demo
        if (mappedArticles.length === 0) {
            console.log("No live articles found for these criteria. Showing mock South Asian data.");
            return MOCK_ARTICLES;
        }

        return mappedArticles;

    } catch (error) {
        console.error('Error fetching news:', error);
        return MOCK_ARTICLES;
    }
};

export const getArticleById = async (id: string): Promise<Article | undefined> => {
    // 1. Try finding in MOCK_ARTICLES first (if we are in fallback mode)
    const mock = MOCK_ARTICLES.find(a => a.id === id);
    if (mock) return mock;

    // 2. In a real app with state management (Redux/Zustand), we would look up the store.
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
export const fetchEggplantNewsWithCache = async (): Promise<Article[]> => {
    const articles = await originalFetch();
    cachedArticles = [...MOCK_ARTICLES, ...articles]; // Keep mock in cache so they work too
    return articles;
};

// Overwrite the export to use the cached version
export { fetchEggplantNewsWithCache as fetchEggplantNews };
