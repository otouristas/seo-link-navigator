import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TokenScore {
  token: string;
  score: number;
  frequency: number;
}

class TFIDFCalculator {
  private documents: Map<string, string[]> = new Map();
  private documentFrequency: Map<string, number> = new Map();
  private stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'been', 'be',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
    'it', 'its', 'you', 'your', 'we', 'our', 'they', 'their', 'them'
  ]);

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter(word => 
        word.length > 3 && 
        !this.stopWords.has(word) &&
        !/^\d+$/.test(word)
      );
  }

  addDocument(id: string, content: string): void {
    const tokens = this.tokenize(content);
    this.documents.set(id, tokens);

    const uniqueTokens = new Set(tokens);
    uniqueTokens.forEach(token => {
      this.documentFrequency.set(
        token,
        (this.documentFrequency.get(token) || 0) + 1
      );
    });
  }

  calculate(documentId: string, topN: number = 20): TokenScore[] {
    const tokens = this.documents.get(documentId);
    if (!tokens) return [];

    const totalDocs = this.documents.size;
    const tokenFrequency = new Map<string, number>();

    tokens.forEach(token => {
      tokenFrequency.set(token, (tokenFrequency.get(token) || 0) + 1);
    });

    const scores: TokenScore[] = [];
    tokenFrequency.forEach((freq, token) => {
      const tf = freq / tokens.length;
      const df = this.documentFrequency.get(token) || 1;
      const idf = Math.log(totalDocs / df);
      const tfidf = tf * idf;

      scores.push({ token, score: tfidf, frequency: freq });
    });

    return scores.sort((a, b) => b.score - a.score).slice(0, topN);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { siteUrl, gscProperty, accessToken } = await req.json();

    if (!accessToken) {
      throw new Error('Google access token is required');
    }

    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    const DATAFORSEO_USERNAME = Deno.env.get('DATAFORSEO_USERNAME');
    const DATAFORSEO_PASSWORD = Deno.env.get('DATAFORSEO_PASSWORD');

    if (!FIRECRAWL_API_KEY || !DATAFORSEO_USERNAME || !DATAFORSEO_PASSWORD) {
      throw new Error('Missing required API credentials');
    }

    console.log('Starting SEO analysis for:', siteUrl);

    // Step 1: Crawl with Firecrawl
    console.log('Step 1: Crawling with Firecrawl...');
    const crawlResponse = await fetch('https://api.firecrawl.dev/v1/crawl', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: siteUrl,
        limit: 50,
        scrapeOptions: {
          formats: ['markdown', 'html'],
        }
      }),
    });

    if (!crawlResponse.ok) {
      throw new Error(`Firecrawl error: ${crawlResponse.status}`);
    }

    const crawlData = await crawlResponse.json();
    const crawlId = crawlData.id;

    // Poll for crawl completion
    let crawlStatus = 'scraping';
    let pages: any[] = [];
    
    while (crawlStatus === 'scraping') {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResponse = await fetch(`https://api.firecrawl.dev/v1/crawl/${crawlId}`, {
        headers: { 'Authorization': `Bearer ${FIRECRAWL_API_KEY}` },
      });
      
      const statusData = await statusResponse.json();
      crawlStatus = statusData.status;
      
      if (statusData.data) {
        pages = statusData.data;
      }
    }

    console.log(`Crawled ${pages.length} pages`);

    // Step 2: Extract keywords with TF-IDF
    console.log('Step 2: Extracting keywords...');
    const tfidf = new TFIDFCalculator();
    const keywordsByPage: Record<string, TokenScore[]> = {};

    pages.forEach(page => {
      const content = page.markdown || page.html || '';
      tfidf.addDocument(page.url, content);
    });

    pages.forEach(page => {
      keywordsByPage[page.url] = tfidf.calculate(page.url, 20);
    });

    // Step 3: Get keyword metrics from DataForSEO
    console.log('Step 3: Fetching keyword metrics...');
    const allKeywords = Array.from(new Set(
      Object.values(keywordsByPage).flat().map(k => k.token)
    )).slice(0, 100);

    const keywordMetrics: Record<string, { volume: number; difficulty: number }> = {};

    if (allKeywords.length > 0) {
      const dfseoResponse = await fetch('https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${DATAFORSEO_USERNAME}:${DATAFORSEO_PASSWORD}`),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{
          keywords: allKeywords,
          location_name: 'United States',
          language_name: 'English',
        }]),
      });

      if (dfseoResponse.ok) {
        const dfseoData = await dfseoResponse.json();
        dfseoData.tasks?.[0]?.result?.forEach((item: any) => {
          keywordMetrics[item.keyword] = {
            volume: item.search_volume || 0,
            difficulty: item.competition_index || 50,
          };
        });
      }
    }

    console.log(`Fetched metrics for ${Object.keys(keywordMetrics).length} keywords`);

    // Step 4: Get GSC data
    console.log('Step 4: Fetching GSC data...');
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const gscResponse = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(gscProperty || siteUrl)}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: ['query', 'page'],
          rowLimit: 5000,
        }),
      }
    );

    const gscMetrics: Record<string, { impressions: number; clicks: number; position: number; ctr: number }> = {};
    
    if (gscResponse.ok) {
      const gscData = await gscResponse.json();
      gscData.rows?.forEach((row: any) => {
        const [query, page] = row.keys;
        
        if (!gscMetrics[page]) {
          gscMetrics[page] = { impressions: 0, clicks: 0, position: 100, ctr: 0 };
        }
        gscMetrics[page].impressions += row.impressions;
        gscMetrics[page].clicks += row.clicks;
        gscMetrics[page].position = Math.min(gscMetrics[page].position, row.position);
        gscMetrics[page].ctr = row.ctr;

        if (!gscMetrics[query]) {
          gscMetrics[query] = { impressions: 0, clicks: 0, position: 100, ctr: 0 };
        }
        gscMetrics[query].impressions += row.impressions;
      });
    }

    console.log(`Fetched GSC data for ${Object.keys(gscMetrics).length} queries/pages`);

    // Step 5: Calculate opportunities
    console.log('Step 5: Calculating opportunities...');
    const opportunities: any[] = [];
    const linkMap: Record<string, { incoming: string[] }> = {};

    pages.forEach(page => {
      linkMap[page.url] = { incoming: [] };
    });

    pages.forEach(sourcePage => {
      const keywords = keywordsByPage[sourcePage.url] || [];
      
      keywords.forEach(kwObj => {
        const k = kwObj.token;
        const metrics = keywordMetrics[k];
        const gscData = gscMetrics[k];
        
        if (!metrics || !gscData) return;

        const volume = metrics.volume;
        const kd = metrics.difficulty;
        const impressions = gscData.impressions;
        const relevance = impressions > 0 ? 1 : 0.5;
        const keywordScore = (volume * impressions) / (kd + 1) * relevance;

        if (keywordScore < 100) return;

        let bestTarget: any = null;
        let maxPageScore = 0;

        pages.forEach(targetPage => {
          const content = (targetPage.markdown || targetPage.html || '').toLowerCase();
          if (!content.includes(k)) return;

          const tMetrics = gscMetrics[targetPage.url];
          if (!tMetrics) return;

          const tImp = tMetrics.impressions;
          const tCtrPotential = 0.3 - (tMetrics.position * 0.002);
          const tIncoming = linkMap[targetPage.url]?.incoming.length || 0;
          const tRank = tMetrics.position;
          const pageScore = (tImp * Math.max(0, tCtrPotential)) / (tIncoming + 1) * (1 - tRank / 100);

          if (pageScore > maxPageScore) {
            maxPageScore = pageScore;
            bestTarget = {
              url: targetPage.url,
              title: targetPage.title || targetPage.url,
              pageScore,
              currentPosition: tMetrics.position,
              impressions: tImp,
              clicks: tMetrics.clicks,
            };
          }
        });

        if (bestTarget) {
          const priority = keywordScore * bestTarget.pageScore;
          const expectedImpact = Math.round(bestTarget.impressions * 0.15);
          
          opportunities.push({
            sourceUrl: sourcePage.url,
            sourceTitle: sourcePage.title || sourcePage.url,
            keyword: k,
            keywordScore: Math.round(keywordScore),
            targetUrl: bestTarget.url,
            targetTitle: bestTarget.title,
            pageScore: Math.round(bestTarget.pageScore * 100) / 100,
            priority: Math.round(priority),
            anchorText: `Learn more about ${k}`,
            expectedImpact: `+${expectedImpact} clicks/month`,
            volume: volume,
            difficulty: kd,
            currentPosition: bestTarget.currentPosition,
          });
        }
      });
    });

    opportunities.sort((a, b) => b.priority - a.priority);

    console.log(`Generated ${opportunities.length} opportunities`);

    // Calculate stats
    const stats = {
      totalPages: pages.length,
      totalKeywords: Object.values(keywordsByPage).flat().length,
      totalOpportunities: opportunities.length,
      avgPriority: opportunities.length > 0 
        ? Math.round(opportunities.reduce((sum, o) => sum + o.priority, 0) / opportunities.length)
        : 0,
    };

    return new Response(
      JSON.stringify({
        keywordsByPage,
        opportunities: opportunities.slice(0, 50),
        stats,
        pages: pages.map(p => ({ url: p.url, title: p.title || p.url })),
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in analyze-seo:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
