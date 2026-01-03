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

// NewsData.io API
const NEWSDATA_API_KEY = 'pub_0b8bbc25434548d8a777ec2b7bf60273';
const NEWSDATA_API_URL = 'https://newsdata.io/api/1/latest';

// Filter types
export type NewsCategory = 'food' | 'health' | 'lifestyle';
export type NewsLanguage = 'en' | 'bn' | 'hi' | 'ur';
export type NewsCountry = 'in' | 'pk' | 'bd';

// Cache key for category + language + country combination
type CacheKey = `${NewsCategory}_${NewsLanguage}_${NewsCountry}`;

// Cache with pagination support
interface CacheData {
    articles: Article[];
    nextPage: string | null;
    lastFetchTime: number;
    isLoading: boolean;
}

const cache: Record<string, CacheData> = {};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get or create cache for a specific combination
const getCache = (category: NewsCategory, language: NewsLanguage, country: NewsCountry): CacheData => {
    const key: CacheKey = `${category}_${language}_${country}`;
    if (!cache[key]) {
        cache[key] = { articles: [], nextPage: null, lastFetchTime: 0, isLoading: false };
    }
    return cache[key];
};

// Helper to deduplicate articles by ID
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

// Build API URL with filters
// URL format: https://newsdata.io/api/1/latest?apikey=...&country=X&language=X&category=X&image=1
const buildApiUrl = (
    category: NewsCategory,
    language: NewsLanguage,
    country: NewsCountry,
    nextPage?: string | null
): string => {
    let url = `${NEWSDATA_API_URL}?apikey=${NEWSDATA_API_KEY}` +
        `&country=${country}` +
        `&language=${language}` +
        `&category=${category}` +
        `&image=1`;

    if (nextPage) {
        url += `&page=${nextPage}`;
    }

    return url;
};

// Fetch initial articles
export const fetchNews = async (
    category: NewsCategory = 'food',
    language: NewsLanguage = 'en',
    country: NewsCountry = 'in'
): Promise<Article[]> => {
    try {
        const cacheData = getCache(category, language, country);
        const now = Date.now();

        // Return cached data if valid
        if (cacheData.articles.length > 0 && now - cacheData.lastFetchTime < CACHE_DURATION) {
            console.log(`Returning ${cacheData.articles.length} cached articles for ${category}/${language}/${country}`);
            return cacheData.articles;
        }

        if (cacheData.isLoading) {
            return cacheData.articles;
        }

        cacheData.isLoading = true;
        console.log(`Fetching ${category}/${language}/${country} news...`);

        const url = buildApiUrl(category, language, country);
        console.log('API URL:', url);

        const response = await fetch(url);
        const data = await response.json();

        cacheData.isLoading = false;

        if (data.status !== 'success' || !data.results) {
            console.error('NewsData.io API error:', data);
            return [];
        }

        console.log(`Received ${data.results.length} articles, nextPage: ${data.nextPage}`);

        // Map API response to our Article interface
        const newArticles: Article[] = data.results
            .filter((item: any) => item.title && item.image_url)
            .map((item: any) => ({
                id: item.article_id,
                source: {
                    id: item.source_id || null,
                    name: item.source_name || item.source_id || 'Unknown'
                },
                author: item.creator ? (Array.isArray(item.creator) ? item.creator.join(', ') : item.creator) : null,
                title: item.title,
                description: item.description || null,
                url: item.link,
                urlToImage: item.image_url,
                publishedAt: item.pubDate,
                content: item.content || null
            }));

        // Update cache
        cacheData.articles = deduplicateById(newArticles);
        cacheData.nextPage = data.nextPage || null;
        cacheData.lastFetchTime = Date.now();

        return cacheData.articles;

    } catch (error) {
        console.error('Error fetching news:', error);
        const cacheData = getCache(category, language, country);
        cacheData.isLoading = false;
        return [];
    }
};

// Fetch more articles (next page) - for infinite scroll
export const fetchMoreNews = async (
    category: NewsCategory = 'food',
    language: NewsLanguage = 'en',
    country: NewsCountry = 'in'
): Promise<Article[]> => {
    try {
        const cacheData = getCache(category, language, country);

        // No more pages available
        if (!cacheData.nextPage) {
            console.log('No more pages available');
            return cacheData.articles;
        }

        if (cacheData.isLoading) {
            return cacheData.articles;
        }

        cacheData.isLoading = true;
        console.log(`Fetching more ${category}/${language}/${country} news, page: ${cacheData.nextPage}...`);

        const url = buildApiUrl(category, language, country, cacheData.nextPage);
        console.log('API URL:', url);

        const response = await fetch(url);
        const data = await response.json();

        cacheData.isLoading = false;

        if (data.status !== 'success' || !data.results) {
            console.error('NewsData.io API error:', data);
            return cacheData.articles;
        }

        console.log(`Received ${data.results.length} more articles, nextPage: ${data.nextPage}`);

        // Map API response
        const newArticles: Article[] = data.results
            .filter((item: any) => item.title && item.image_url)
            .map((item: any) => ({
                id: item.article_id,
                source: {
                    id: item.source_id || null,
                    name: item.source_name || item.source_id || 'Unknown'
                },
                author: item.creator ? (Array.isArray(item.creator) ? item.creator.join(', ') : item.creator) : null,
                title: item.title,
                description: item.description || null,
                url: item.link,
                urlToImage: item.image_url,
                publishedAt: item.pubDate,
                content: item.content || null
            }));

        // Append to cache
        cacheData.articles = deduplicateById([...cacheData.articles, ...newArticles]);
        cacheData.nextPage = data.nextPage || null;

        return cacheData.articles;

    } catch (error) {
        console.error('Error fetching more news:', error);
        return getCache(category, language, country).articles;
    }
};

// Check if more pages are available
export const hasMoreNews = (
    category: NewsCategory = 'food',
    language: NewsLanguage = 'en',
    country: NewsCountry = 'in'
): boolean => {
    return getCache(category, language, country).nextPage !== null;
};

// Clear cache
export const clearNewsCache = (
    category?: NewsCategory,
    language?: NewsLanguage,
    country?: NewsCountry
) => {
    if (category && language && country) {
        const key: CacheKey = `${category}_${language}_${country}`;
        cache[key] = { articles: [], nextPage: null, lastFetchTime: 0, isLoading: false };
    } else {
        Object.keys(cache).forEach(key => {
            cache[key] = { articles: [], nextPage: null, lastFetchTime: 0, isLoading: false };
        });
    }
};

// Get article by ID from any cache
export const getArticleById = (id: string): Article | undefined => {
    for (const key of Object.keys(cache)) {
        const article = cache[key].articles.find(a => a.id === id);
        if (article) return article;
    }
    return undefined;
};
