/**
 * SEO scoring formulas based on real SEO math
 * These formulas quantify opportunity for internal linking
 */

export interface KeywordMetrics {
  keyword: string;
  volume: number;
  difficulty: number;
  impressions: number;
  clicks: number;
  position: number;
}

export interface PageMetrics {
  url: string;
  impressions: number;
  clicks: number;
  position: number;
  incomingLinks: number;
  outgoingLinks: number;
}

export interface LinkOpportunity {
  sourceUrl: string;
  targetUrl: string;
  keyword: string;
  anchorText: string;
  keywordScore: number;
  pageScore: number;
  priority: number;
  expectedImpact: string;
}

/**
 * Calculate keyword opportunity score
 * Formula: (Volume × Impressions) / (Difficulty + 1) × Relevance
 */
export function calculateKeywordScore(
  volume: number,
  impressions: number,
  difficulty: number,
  relevance: number = 1
): number {
  return (volume * impressions) / (difficulty + 1) * relevance;
}

/**
 * Calculate page opportunity score for targeting
 * Formula: (Impressions × CTR_potential) / (IncomingLinks + 1) × (1 - CurrentRank/100)
 */
export function calculatePageScore(
  impressions: number,
  position: number,
  incomingLinks: number
): number {
  // CTR curve approximation based on position
  const ctrPotential = Math.max(0, 0.30 - (position * 0.002));
  const rankFactor = 1 - Math.min(position, 100) / 100;
  
  return (impressions * ctrPotential) / (incomingLinks + 1) * rankFactor;
}

/**
 * Calculate final priority score
 */
export function calculatePriority(
  keywordScore: number,
  pageScore: number
): number {
  return keywordScore * pageScore;
}

/**
 * Estimate traffic impact from adding internal link
 */
export function estimateTrafficImpact(
  currentClicks: number,
  currentPosition: number,
  targetPosition: number = Math.max(1, currentPosition - 3)
): { estimated: number; increase: number; percentage: number } {
  // CTR by position (industry averages)
  const ctrByPosition = [
    0.284, 0.152, 0.098, 0.070, 0.055, // 1-5
    0.045, 0.038, 0.033, 0.029, 0.025  // 6-10
  ];

  const currentCtr = currentPosition <= 10 
    ? ctrByPosition[currentPosition - 1] 
    : 0.015;
  
  const targetCtr = targetPosition <= 10 
    ? ctrByPosition[targetPosition - 1] 
    : 0.015;

  const currentImpressions = currentClicks / (currentCtr || 0.001);
  const estimatedClicks = Math.round(currentImpressions * targetCtr);
  const increase = estimatedClicks - currentClicks;
  const percentage = ((increase / currentClicks) * 100);

  return {
    estimated: estimatedClicks,
    increase,
    percentage: Math.round(percentage)
  };
}

/**
 * Score relevance between source and target content
 */
export function calculateRelevance(
  sourceTokens: string[],
  targetTokens: string[],
  keyword: string
): number {
  const sourceHasKeyword = sourceTokens.includes(keyword.toLowerCase());
  const targetHasKeyword = targetTokens.includes(keyword.toLowerCase());
  
  // Basic relevance: both pages must mention the keyword
  if (!sourceHasKeyword || !targetHasKeyword) return 0.3;

  // Calculate Jaccard similarity for additional context
  const sourceSet = new Set(sourceTokens);
  const targetSet = new Set(targetTokens);
  const intersection = new Set([...sourceSet].filter(x => targetSet.has(x)));
  const union = new Set([...sourceSet, ...targetSet]);
  
  const jaccard = intersection.size / union.size;
  
  return Math.min(1, 0.5 + jaccard);
}

/**
 * Determine score tier for visual display
 */
export function getScoreTier(score: number, type: 'keyword' | 'page' | 'priority'): {
  tier: 'excellent' | 'good' | 'fair' | 'low';
  color: string;
  label: string;
} {
  if (type === 'keyword') {
    if (score > 1000) return { tier: 'excellent', color: 'success', label: 'High Opportunity' };
    if (score > 500) return { tier: 'good', color: 'info', label: 'Good Opportunity' };
    if (score > 100) return { tier: 'fair', color: 'warning', label: 'Fair Opportunity' };
    return { tier: 'low', color: 'muted', label: 'Low Opportunity' };
  }

  if (type === 'page') {
    if (score > 100) return { tier: 'excellent', color: 'success', label: 'High Priority' };
    if (score > 50) return { tier: 'good', color: 'info', label: 'Good Target' };
    if (score > 20) return { tier: 'fair', color: 'warning', label: 'Fair Target' };
    return { tier: 'low', color: 'muted', label: 'Low Priority' };
  }

  // priority
  if (score > 100000) return { tier: 'excellent', color: 'success', label: 'Critical' };
  if (score > 50000) return { tier: 'good', color: 'info', label: 'High' };
  if (score > 10000) return { tier: 'fair', color: 'warning', label: 'Medium' };
  return { tier: 'low', color: 'muted', label: 'Low' };
}
