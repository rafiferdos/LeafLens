import { Language } from '@/lib/language';

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

// NewsData.io API - Using /latest endpoint with regional filters
const NEWSDATA_API_KEY = 'pub_0b8bbc25434548d8a777ec2b7bf60273';
const NEWSDATA_API_URL = 'https://newsdata.io/api/1/latest';

// Search terms - eggplant only in different languages
const EGGPLANT_TERMS: Record<Language, string> = {
    en: 'eggplant OR brinjal OR aubergine',
    bn: 'বেগুন',
    hi: 'बैंगन OR baingan',
    ur: 'بینگن OR baingan',
};

// Cache per language with pagination support
interface CacheData {
    articles: Article[];
    nextPage: string | null;
    lastFetchTime: number;
}

const cache: Record<Language, CacheData> = {
    en: { articles: [], nextPage: null, lastFetchTime: 0 },
    bn: { articles: [], nextPage: null, lastFetchTime: 0 },
    hi: { articles: [], nextPage: null, lastFetchTime: 0 },
    ur: { articles: [], nextPage: null, lastFetchTime: 0 },
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper to deduplicate articles by ID only (not title - show all sources)
const deduplicateById = (articles: Article[]): Article[] => {
    const seen = new Set<string>();
    return articles.filter(article => {
        if (seen.has(article.id)) {
            return false;
        }
        seen.add(article.id);
        return true;
    });
};

export const fetchEggplantNews = async (
    page: number = 1,
    limit: number = 10,
    language: Language = 'en'
): Promise<Article[]> => {
    try {
        const now = Date.now();
        const langCache = cache[language];

        // For page 1, check if cache is valid
        if (page === 1 && langCache.articles.length > 0 && now - langCache.lastFetchTime < CACHE_DURATION) {
            console.log(`Returning cached articles for ${language}`);
            return langCache.articles.slice(0, limit);
        }

        // For subsequent pages, check if we have enough cached data
        const startIndex = (page - 1) * limit;
        if (page > 1 && langCache.articles.length >= startIndex + limit) {
            console.log(`Returning cached page ${page} for ${language}`);
            return langCache.articles.slice(startIndex, startIndex + limit);
        }

        // Need to fetch from API
        console.log(`Fetching news in ${language}, page ${page}...`);

        const searchTerms = EGGPLANT_TERMS[language];

        // Build URL with user's configured parameters:
        // - country: in,pk,bd (India, Pakistan, Bangladesh)
        // - language: based on selected language
        // - category: food,health,lifestyle
        // - image=1 to ensure images are included
        let url = `${NEWSDATA_API_URL}?apikey=${NEWSDATA_API_KEY}` +
            `&q=${encodeURIComponent(searchTerms)}` +
            `&country=in,pk,bd` +
            `&language=${language}` +
            `&category=food,health,lifestyle` +
            `&image=1`;

        // If loading more and we have a nextPage token, use it
        if (page > 1 && langCache.nextPage) {
            url += `&page=${langCache.nextPage}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'success' || !data.results) {
            console.error('NewsData.io API error:', data);
            return [];
        }

        console.log(`Received ${data.results.length} articles in ${language}`);

        // Map API response to our Article interface - ALL DATA FROM API, NO FALLBACKS
        const newArticles: Article[] = data.results
            .filter((item: any) => item.title) // Only include items with title
            .map((item: any) => ({
                id: item.article_id,
                source: {
                    id: item.source_id || null,
                    name: item.source_name || item.source_id || null
                },
                author: item.creator ? (Array.isArray(item.creator) ? item.creator.join(', ') : item.creator) : null,
                title: item.title,
                description: item.description || null,
                url: item.link,
                urlToImage: item.image_url || null,
                publishedAt: item.pubDate,
                content: item.content || null
            }));

        // Update cache
        if (page === 1) {
            // Fresh fetch - replace cache
            langCache.articles = deduplicateById(newArticles);
        } else {
            // Append to existing cache and deduplicate
            langCache.articles = deduplicateById([...langCache.articles, ...newArticles]);
        }

        langCache.nextPage = data.nextPage || null;
        langCache.lastFetchTime = Date.now();

        // Return requested page
        return langCache.articles.slice(startIndex, startIndex + limit);

    } catch (error) {
        console.error('Error fetching news from NewsData.io:', error);
        return [];
    }
};

export const getArticleById = async (id: string, language: Language = 'en'): Promise<Article | undefined> => {
    return cache[language].articles.find(a => a.id === id);
};

// Clear cache for a specific language (useful when language changes)
export const clearNewsCache = (language?: Language) => {
    if (language) {
        cache[language] = { articles: [], nextPage: null, lastFetchTime: 0 };
    } else {
        Object.keys(cache).forEach(lang => {
            cache[lang as Language] = { articles: [], nextPage: null, lastFetchTime: 0 };
        });
    }
};

// Check if more pages are available
export const hasMoreNews = (language: Language = 'en'): boolean => {
    return cache[language].nextPage !== null;
};
