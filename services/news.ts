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

// NewsData.io API - Using user's exact configuration
const NEWSDATA_API_KEY = 'pub_0b8bbc25434548d8a777ec2b7bf60273';
const NEWSDATA_API_URL = 'https://newsdata.io/api/1/latest';

// User's configured API URL:
// https://newsdata.io/api/1/latest?apikey=pub_0b8bbc25434548d8a777ec2b7bf60273&country=in,pk,bd&language=hi,ur,bn,en&category=food,health,lifestyle&image=1&video=1

// Cache with pagination support
interface CacheData {
    articles: Article[];
    nextPage: string | null;
    lastFetchTime: number;
    isLoading: boolean;
}

let cache: CacheData = {
    articles: [],
    nextPage: null,
    lastFetchTime: 0,
    isLoading: false
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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

// Build API URL with user's exact configuration
const buildApiUrl = (nextPage?: string | null): string => {
    let url = `${NEWSDATA_API_URL}?apikey=${NEWSDATA_API_KEY}` +
        `&country=in,pk,bd` +
        `&language=hi,ur,bn,en` +
        `&category=food,health,lifestyle` +
        `&image=1` +
        `&video=1`;

    if (nextPage) {
        url += `&page=${nextPage}`;
    }

    return url;
};

// Fetch initial articles (page 1)
export const fetchNews = async (language?: Language): Promise<Article[]> => {
    try {
        const now = Date.now();

        // Return cached data if valid
        if (cache.articles.length > 0 && now - cache.lastFetchTime < CACHE_DURATION) {
            console.log(`Returning ${cache.articles.length} cached articles`);
            return cache.articles;
        }

        if (cache.isLoading) {
            return cache.articles;
        }

        cache.isLoading = true;
        console.log('Fetching initial news...');

        const url = buildApiUrl();
        console.log('API URL:', url);

        const response = await fetch(url);
        const data = await response.json();

        cache.isLoading = false;

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
        cache.articles = deduplicateById(newArticles);
        cache.nextPage = data.nextPage || null;
        cache.lastFetchTime = Date.now();

        return cache.articles;

    } catch (error) {
        console.error('Error fetching news:', error);
        cache.isLoading = false;
        return [];
    }
};

// Fetch more articles (next page) - for infinite scroll
export const fetchMoreNews = async (language?: Language): Promise<Article[]> => {
    try {
        // No more pages available
        if (!cache.nextPage) {
            console.log('No more pages available');
            return cache.articles;
        }

        if (cache.isLoading) {
            return cache.articles;
        }

        cache.isLoading = true;
        console.log(`Fetching more news, page: ${cache.nextPage}...`);

        const url = buildApiUrl(cache.nextPage);
        console.log('API URL:', url);

        const response = await fetch(url);
        const data = await response.json();

        cache.isLoading = false;

        if (data.status !== 'success' || !data.results) {
            console.error('NewsData.io API error:', data);
            return cache.articles;
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
        cache.articles = deduplicateById([...cache.articles, ...newArticles]);
        cache.nextPage = data.nextPage || null;

        return cache.articles;

    } catch (error) {
        console.error('Error fetching more news:', error);
        cache.isLoading = false;
        return cache.articles;
    }
};

// Get all cached articles
export const getCachedNews = (): Article[] => {
    return cache.articles;
};

// Check if more pages are available
export const hasMoreNews = (language?: Language): boolean => {
    return cache.nextPage !== null;
};

// Check if currently loading
export const isLoadingNews = (): boolean => {
    return cache.isLoading;
};

// Clear cache
export const clearNewsCache = (language?: Language) => {
    cache = { articles: [], nextPage: null, lastFetchTime: 0, isLoading: false };
};

// Get article by ID
export const getArticleById = (id: string, language?: Language): Article | undefined => {
    return cache.articles.find(a => a.id === id);
};

// Legacy export for compatibility
export const fetchEggplantNews = fetchNews;
