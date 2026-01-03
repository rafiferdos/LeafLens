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

// NewsData.io API
const NEWSDATA_API_KEY = 'pub_0b8bbc25434548d8a777ec2b7bf60273';
const NEWSDATA_API_URL = 'https://newsdata.io/api/1/latest';

// Available categories
export type NewsCategory = 'food' | 'health' | 'lifestyle';

// Cache with pagination support per category
interface CacheData {
    articles: Article[];
    nextPage: string | null;
    lastFetchTime: number;
    isLoading: boolean;
}

const cache: Record<NewsCategory, CacheData> = {
    food: { articles: [], nextPage: null, lastFetchTime: 0, isLoading: false },
    health: { articles: [], nextPage: null, lastFetchTime: 0, isLoading: false },
    lifestyle: { articles: [], nextPage: null, lastFetchTime: 0, isLoading: false },
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

// Build API URL with category filter
const buildApiUrl = (category: NewsCategory, nextPage?: string | null): string => {
    // Using user's configuration but with single category for better results
    let url = `${NEWSDATA_API_URL}?apikey=${NEWSDATA_API_KEY}` +
        `&country=in,pk,bd` +
        `&language=hi,ur,bn,en` +
        `&category=${category}` +
        `&image=1`;

    if (nextPage) {
        url += `&page=${nextPage}`;
    }

    return url;
};

// Fetch initial articles for a category
export const fetchNews = async (category: NewsCategory = 'food'): Promise<Article[]> => {
    try {
        const categoryCache = cache[category];
        const now = Date.now();

        // Return cached data if valid
        if (categoryCache.articles.length > 0 && now - categoryCache.lastFetchTime < CACHE_DURATION) {
            console.log(`Returning ${categoryCache.articles.length} cached articles for ${category}`);
            return categoryCache.articles;
        }

        if (categoryCache.isLoading) {
            return categoryCache.articles;
        }

        categoryCache.isLoading = true;
        console.log(`Fetching initial ${category} news...`);

        const url = buildApiUrl(category);
        console.log('API URL:', url);

        const response = await fetch(url);
        const data = await response.json();

        categoryCache.isLoading = false;

        if (data.status !== 'success' || !data.results) {
            console.error('NewsData.io API error:', data);
            return [];
        }

        console.log(`Received ${data.results.length} articles for ${category}, nextPage: ${data.nextPage}`);

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
        categoryCache.articles = deduplicateById(newArticles);
        categoryCache.nextPage = data.nextPage || null;
        categoryCache.lastFetchTime = Date.now();

        return categoryCache.articles;

    } catch (error) {
        console.error('Error fetching news:', error);
        cache[category].isLoading = false;
        return [];
    }
};

// Fetch more articles (next page) - for infinite scroll
export const fetchMoreNews = async (category: NewsCategory = 'food'): Promise<Article[]> => {
    try {
        const categoryCache = cache[category];

        // No more pages available
        if (!categoryCache.nextPage) {
            console.log('No more pages available');
            return categoryCache.articles;
        }

        if (categoryCache.isLoading) {
            return categoryCache.articles;
        }

        categoryCache.isLoading = true;
        console.log(`Fetching more ${category} news, page: ${categoryCache.nextPage}...`);

        const url = buildApiUrl(category, categoryCache.nextPage);
        console.log('API URL:', url);

        const response = await fetch(url);
        const data = await response.json();

        categoryCache.isLoading = false;

        if (data.status !== 'success' || !data.results) {
            console.error('NewsData.io API error:', data);
            return categoryCache.articles;
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
        categoryCache.articles = deduplicateById([...categoryCache.articles, ...newArticles]);
        categoryCache.nextPage = data.nextPage || null;

        return categoryCache.articles;

    } catch (error) {
        console.error('Error fetching more news:', error);
        cache[category].isLoading = false;
        return cache[category].articles;
    }
};

// Check if more pages are available
export const hasMoreNews = (category: NewsCategory = 'food'): boolean => {
    return cache[category].nextPage !== null;
};

// Check if currently loading
export const isLoadingNews = (category: NewsCategory = 'food'): boolean => {
    return cache[category].isLoading;
};

// Clear cache for a specific category
export const clearNewsCache = (category?: NewsCategory) => {
    if (category) {
        cache[category] = { articles: [], nextPage: null, lastFetchTime: 0, isLoading: false };
    } else {
        cache.food = { articles: [], nextPage: null, lastFetchTime: 0, isLoading: false };
        cache.health = { articles: [], nextPage: null, lastFetchTime: 0, isLoading: false };
        cache.lifestyle = { articles: [], nextPage: null, lastFetchTime: 0, isLoading: false };
    }
};

// Get article by ID from any category
export const getArticleById = (id: string): Article | undefined => {
    for (const cat of Object.keys(cache) as NewsCategory[]) {
        const article = cache[cat].articles.find(a => a.id === id);
        if (article) return article;
    }
    return undefined;
};
