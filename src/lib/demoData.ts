/**
 * Demo data for showcasing the SEO analysis tool
 * This simulates real Firecrawl, DataForSEO, and GSC responses
 */

import { TokenScore } from "@/utils/tfidf";
import { LinkOpportunity } from "@/utils/seoScoring";

export const demoPages = [
  {
    url: "https://example.com/blog/seo-guide",
    title: "Complete SEO Guide for 2025",
    content: `Search engine optimization is crucial for driving organic traffic. Internal linking 
              helps distribute page authority and improves site navigation. Keyword research tools 
              like DataForSEO provide valuable insights. Link building strategies include creating 
              high-quality content and strategic internal links. SEO metrics include traffic, rankings, 
              and conversion rates.`
  },
  {
    url: "https://example.com/guides/internal-linking",
    title: "Internal Linking Best Practices",
    content: `Internal linking is a powerful SEO technique that connects your content. Strategic 
              anchor text placement improves search rankings. Link equity flows through internal links 
              to boost page authority. SEO professionals recommend 2-5 internal links per page. 
              Keyword-rich anchors help search engines understand content relevance.`
  },
  {
    url: "https://example.com/tools/keyword-research",
    title: "Keyword Research Tools Guide",
    content: `Keyword research is fundamental to SEO success. DataForSEO provides search volume and 
              keyword difficulty metrics. Long-tail keywords often have lower competition. Search intent 
              matters more than pure volume. Competitive analysis reveals keyword opportunities.`
  }
];

export const demoTokensByPage: Record<string, TokenScore[]> = {
  "https://example.com/blog/seo-guide": [
    { token: "internal linking", score: 0.452, frequency: 8 },
    { token: "keyword research", score: 0.389, frequency: 6 },
    { token: "seo optimization", score: 0.356, frequency: 7 },
    { token: "search rankings", score: 0.298, frequency: 5 },
    { token: "link building", score: 0.276, frequency: 4 },
    { token: "page authority", score: 0.245, frequency: 4 },
    { token: "organic traffic", score: 0.234, frequency: 3 },
    { token: "anchor text", score: 0.198, frequency: 3 },
    { token: "seo metrics", score: 0.187, frequency: 3 },
    { token: "content strategy", score: 0.165, frequency: 2 }
  ],
  "https://example.com/guides/internal-linking": [
    { token: "internal links", score: 0.512, frequency: 10 },
    { token: "anchor text", score: 0.445, frequency: 7 },
    { token: "link equity", score: 0.398, frequency: 6 },
    { token: "page authority", score: 0.334, frequency: 5 },
    { token: "search rankings", score: 0.287, frequency: 4 },
    { token: "seo technique", score: 0.256, frequency: 4 },
    { token: "content linking", score: 0.223, frequency: 3 },
    { token: "keyword rich", score: 0.198, frequency: 3 }
  ],
  "https://example.com/tools/keyword-research": [
    { token: "keyword research", score: 0.534, frequency: 9 },
    { token: "search volume", score: 0.467, frequency: 7 },
    { token: "keyword difficulty", score: 0.412, frequency: 6 },
    { token: "long tail keywords", score: 0.356, frequency: 5 },
    { token: "search intent", score: 0.298, frequency: 4 },
    { token: "competitive analysis", score: 0.267, frequency: 4 }
  ]
};

export const demoOpportunities: LinkOpportunity[] = [
  {
    sourceUrl: "https://example.com/blog/seo-guide",
    targetUrl: "https://example.com/guides/internal-linking",
    keyword: "internal linking",
    anchorText: "master internal linking strategies",
    keywordScore: 778846,
    pageScore: 105.3,
    priority: 82020000,
    expectedImpact: "+320 clicks/mo"
  },
  {
    sourceUrl: "https://example.com/blog/seo-guide",
    targetUrl: "https://example.com/tools/keyword-research",
    keyword: "keyword research",
    anchorText: "keyword research tools",
    keywordScore: 654320,
    pageScore: 89.7,
    priority: 58690000,
    expectedImpact: "+245 clicks/mo"
  },
  {
    sourceUrl: "https://example.com/guides/internal-linking",
    targetUrl: "https://example.com/blog/seo-guide",
    keyword: "seo optimization",
    anchorText: "comprehensive SEO optimization guide",
    keywordScore: 543210,
    pageScore: 76.2,
    priority: 41390000,
    expectedImpact: "+189 clicks/mo"
  },
  {
    sourceUrl: "https://example.com/tools/keyword-research",
    targetUrl: "https://example.com/blog/seo-guide",
    keyword: "link building",
    anchorText: "effective link building strategies",
    keywordScore: 432100,
    pageScore: 68.9,
    priority: 29770000,
    expectedImpact: "+156 clicks/mo"
  },
  {
    sourceUrl: "https://example.com/blog/seo-guide",
    targetUrl: "https://example.com/guides/internal-linking",
    keyword: "anchor text",
    anchorText: "anchor text optimization",
    keywordScore: 387650,
    pageScore: 54.3,
    priority: 21050000,
    expectedImpact: "+127 clicks/mo"
  }
];

export const demoStats = {
  totalPages: 3,
  totalKeywords: 28,
  totalOpportunities: 5,
  avgKeywordScore: 559225
};
