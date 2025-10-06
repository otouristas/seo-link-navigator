import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KeywordToken } from "@/components/KeywordToken";
import { OpportunityTable } from "@/components/OpportunityTable";
import { AnalysisStats } from "@/components/AnalysisStats";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Link2, Target, Sparkles } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Index = () => {
  const { toast } = useToast();
  const [siteUrl, setSiteUrl] = useState("");
  const [gscProperty, setGscProperty] = useState("");
  const [gscProperties, setGscProperties] = useState<any[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedPage, setSelectedPage] = useState("");
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);

  useEffect(() => {
    loadGscProperties();
  }, []);

  const loadGscProperties = async () => {
    setIsLoadingProperties(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/list-gsc-properties`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setGscProperties(data.properties || []);
      }
    } catch (error) {
      console.error('Error loading GSC properties:', error);
    } finally {
      setIsLoadingProperties(false);
    }
  };

  const handleAnalyze = async () => {
    if (!siteUrl) {
      toast({
        title: "Error",
        description: "Please enter a site URL",
        variant: "destructive",
      });
      return;
    }

    if (!gscProperty) {
      toast({
        title: "Error",
        description: "Please select a Google Search Console property",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-seo`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ siteUrl, gscProperty }),
        }
      );

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setAnalysisData(data);
      setHasAnalyzed(true);
      setSelectedPage(data.pages[0]?.url || '');
      
      toast({
        title: "Analysis Complete",
        description: `Found ${data.stats.totalOpportunities} high-priority link opportunities`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze site. Please check your API credentials.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
                <Link2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  SEO Link Analyzer
                </h1>
                <p className="text-sm text-muted-foreground">
                  Math-driven internal linking optimization
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Target className="h-4 w-4 mr-2" />
              Connect APIs
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Analysis Input */}
        <Card className="p-6 gradient-hero border-2">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Analyze Your Site
                </h2>
                <p className="text-sm text-muted-foreground">
                  Extract keywords using TF-IDF and discover high-impact linking opportunities
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="gscProperty" className="text-sm font-medium mb-2">
                  Google Search Console Property
                </Label>
                <Select value={gscProperty} onValueChange={setGscProperty} disabled={isAnalyzing || isLoadingProperties}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={isLoadingProperties ? "Loading properties..." : "Select a property"} />
                  </SelectTrigger>
                  <SelectContent>
                    {gscProperties.map((prop) => (
                      <SelectItem key={prop.siteUrl} value={prop.siteUrl}>
                        {prop.siteUrl}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="siteUrl" className="text-sm font-medium mb-2">
                  Site URL to Crawl
                </Label>
                <Input
                  id="siteUrl"
                  type="url"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  placeholder="https://yoursite.com"
                  className="mt-1"
                  disabled={isAnalyzing}
                />
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="gradient-primary text-white shadow-glow"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4 mr-2" />
                      Run Analysis
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Results */}
        {hasAnalyzed && analysisData && (
          <>
            {/* Stats */}
            <AnalysisStats {...analysisData.stats} />

            {/* Tabs */}
            <Tabs defaultValue="keywords" className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="keywords">
                  Keyword Tokens
                </TabsTrigger>
                <TabsTrigger value="opportunities">
                  Link Opportunities
                </TabsTrigger>
              </TabsList>

              <TabsContent value="keywords" className="space-y-4">
                <Card className="p-4">
                  <Label htmlFor="pageSelect" className="text-sm font-medium mb-2">
                    Select Source Page
                  </Label>
                  <Select value={selectedPage} onValueChange={setSelectedPage}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Choose a page" />
                    </SelectTrigger>
                    <SelectContent>
                      {analysisData.pages.map((page: any) => (
                        <SelectItem key={page.url} value={page.url}>
                          {page.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Card>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">
                    Extracted Keywords (TF-IDF Tokenization)
                  </h3>
                  {selectedPage && analysisData.keywordsByPage[selectedPage]?.map((token: any, index: number) => (
                    <KeywordToken 
                      key={index} 
                      token={token} 
                      index={index}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="opportunities" className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">
                      Top Link Opportunities (Ranked by Priority)
                    </h3>
                    <Button variant="outline" size="sm">
                      Export CSV
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    These recommendations are calculated using keyword score × page score = priority. 
                    Higher priority = more traffic impact.
                  </p>
                  <OpportunityTable opportunities={analysisData.opportunities} />
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* Empty State */}
        {!hasAnalyzed && (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="h-16 w-16 rounded-full gradient-primary mx-auto flex items-center justify-center">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Ready to Optimize Your Internal Links?
              </h3>
              <p className="text-muted-foreground">
                Enter your site URL above and click "Run Analysis" to extract keywords, 
                calculate opportunity scores, and discover high-impact linking recommendations.
              </p>
            </div>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Powered by TF-IDF tokenization, DataForSEO metrics, and real SEO math. 
            Built with React, Vite, and Tailwind CSS.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
