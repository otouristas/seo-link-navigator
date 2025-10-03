import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KeywordToken } from "@/components/KeywordToken";
import { OpportunityTable } from "@/components/OpportunityTable";
import { AnalysisStats } from "@/components/AnalysisStats";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Link2, Target, Sparkles, AlertCircle } from "lucide-react";
import { 
  demoPages, 
  demoTokensByPage, 
  demoOpportunities,
  demoStats 
} from "@/lib/demoData";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Index = () => {
  const { toast } = useToast();
  const [siteUrl, setSiteUrl] = useState("https://example.com");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedPage, setSelectedPage] = useState("");
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const handleAnalyze = async () => {
    if (!siteUrl) {
      toast({
        title: "Error",
        description: "Please enter a site URL",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setHasAnalyzed(true);
    setSelectedPage(demoPages[0].url);
    setIsAnalyzing(false);
    
    toast({
      title: "Analysis Complete",
      description: `Found ${demoStats.totalOpportunities} high-priority link opportunities`,
    });
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

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Demo Mode:</strong> This is a demonstration with sample data. 
                To analyze your own site, you'll need to connect Firecrawl, DataForSEO, and Google Search Console APIs.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="siteUrl" className="text-sm font-medium mb-2">
                  Site URL
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
        {hasAnalyzed && (
          <>
            {/* Stats */}
            <AnalysisStats {...demoStats} />

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
                  <select
                    id="pageSelect"
                    value={selectedPage}
                    onChange={(e) => setSelectedPage(e.target.value)}
                    className="w-full mt-2 px-3 py-2 rounded-md border border-input bg-background text-foreground"
                  >
                    {demoPages.map((page) => (
                      <option key={page.url} value={page.url}>
                        {page.title}
                      </option>
                    ))}
                  </select>
                </Card>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">
                    Extracted Keywords (TF-IDF Tokenization)
                  </h3>
                  {selectedPage && demoTokensByPage[selectedPage]?.map((token, index) => (
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
                  <OpportunityTable opportunities={demoOpportunities} />
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
