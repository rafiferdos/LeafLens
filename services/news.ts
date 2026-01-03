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

// NewsData.io API - Provides images and descriptions directly
const NEWSDATA_API_KEY = 'pub_0b8bbc25434548d8a777ec2b7bf60273';
const NEWSDATA_API_URL = 'https://newsdata.io/api/1/news';

// Search terms - broader vegetable/garden topics with eggplant preference
const EGGPLANT_TERMS: Record<Language, string> = {
    en: 'eggplant OR vegetable OR garden OR farming',
    bn: 'বেগুন OR সবজি OR বাগান OR কৃষি',
    hi: 'बैंगन OR सब्जी OR बागवानी OR खेती',
    ur: 'بینگن OR سبزی OR باغبانی OR کھیتی',
};

// NewsData.io language codes
const NEWS_LANG_CODES: Record<Language, string> = {
    en: 'en',
    bn: 'bn',
    hi: 'hi',
    ur: 'ur',
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

// Helper to deduplicate articles by title
const deduplicateArticles = (articles: Article[]): Article[] => {
    const seen = new Set<string>();
    return articles.filter(article => {
        // Normalize title for comparison (lowercase, trim)
        const normalizedTitle = article.title.toLowerCase().trim();
        if (seen.has(normalizedTitle)) {
            return false;
        }
        seen.add(normalizedTitle);
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
        console.log(`Fetching eggplant news in ${language}, page ${page}...`);

        const searchTerms = EGGPLANT_TERMS[language];
        const langCode = NEWS_LANG_CODES[language];

        // Build URL with pagination
        let url = `${NEWSDATA_API_URL}?apikey=${NEWSDATA_API_KEY}&q=${encodeURIComponent(searchTerms)}&language=${langCode}`;

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
            langCache.articles = deduplicateArticles(newArticles);
        } else {
            // Append to existing cache and deduplicate
            langCache.articles = deduplicateArticles([...langCache.articles, ...newArticles]);
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
