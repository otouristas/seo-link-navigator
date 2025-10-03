/**
 * Simple TF-IDF (Term Frequency-Inverse Document Frequency) implementation
 * for keyword extraction from page content
 */

export interface TokenScore {
  token: string;
  score: number;
  frequency: number;
}

export class TFIDFCalculator {
  private documents: Map<string, string[]> = new Map();
  private documentFrequency: Map<string, number> = new Map();
  private stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'been', 'be',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
    'it', 'its', 'you', 'your', 'we', 'our', 'they', 'their', 'them'
  ]);

  /**
   * Tokenize text into meaningful words
   */
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

  /**
   * Add a document to the corpus
   */
  addDocument(id: string, content: string): void {
    const tokens = this.tokenize(content);
    this.documents.set(id, tokens);

    // Update document frequency
    const uniqueTokens = new Set(tokens);
    uniqueTokens.forEach(token => {
      this.documentFrequency.set(
        token,
        (this.documentFrequency.get(token) || 0) + 1
      );
    });
  }

  /**
   * Calculate TF-IDF score for a specific document
   */
  calculate(documentId: string, topN: number = 20): TokenScore[] {
    const tokens = this.documents.get(documentId);
    if (!tokens) return [];

    const totalDocs = this.documents.size;
    const tokenFrequency = new Map<string, number>();

    // Calculate term frequency
    tokens.forEach(token => {
      tokenFrequency.set(token, (tokenFrequency.get(token) || 0) + 1);
    });

    // Calculate TF-IDF for each unique token
    const scores: TokenScore[] = [];
    tokenFrequency.forEach((freq, token) => {
      const tf = freq / tokens.length;
      const df = this.documentFrequency.get(token) || 1;
      const idf = Math.log(totalDocs / df);
      const tfidf = tf * idf;

      scores.push({
        token,
        score: tfidf,
        frequency: freq
      });
    });

    // Sort by score and return top N
    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, topN);
  }

  /**
   * Get all documents
   */
  getDocuments(): string[] {
    return Array.from(this.documents.keys());
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.documents.clear();
    this.documentFrequency.clear();
  }
}
