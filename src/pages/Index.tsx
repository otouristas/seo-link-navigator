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
import { Loader2, Link2, Target, Sparkles, LogOut } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { toast } = useToast();
  const { user, loading: authLoading, signInWithGoogle, signOut, getGoogleAccessToken } = useAuth();
  const [siteUrl, setSiteUrl] = useState("");
  const [gscProperty, setGscProperty] = useState("");
  const [gscProperties, setGscProperties] = useState<any[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedPage, setSelectedPage] = useState("");
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadGscProperties();
    }
  }, [user]);

  const loadGscProperties = async () => {
    const accessToken = getGoogleAccessToken();
    if (!accessToken) {
      console.error('No Google access token available');
      return;
    }

    setIsLoadingProperties(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/list-gsc-properties`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ accessToken }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setGscProperties(data.properties || []);
        toast({
          title: "Properties Loaded",
          description: `Found ${data.properties?.length || 0} Google Search Console properties`,
        });
      } else {
        throw new Error('Failed to load properties');
      }
    } catch (error) {
      console.error('Error loading GSC properties:', error);
      toast({
        title: "Error",
        description: "Failed to load Google Search Console properties",
        variant: "destructive",
      });
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

    const accessToken = getGoogleAccessToken();
    if (!accessToken) {
      toast({
        title: "Error",
        description: "Please log in with Google first",
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
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ siteUrl, gscProperty, accessToken }),
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
            {authLoading ? (
              <Button variant="outline" size="sm" disabled>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </Button>
            ) : user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
                <Button variant="outline" size="sm" onClick={() => signOut()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => signInWithGoogle()}>
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {!user && (
          <Card className="p-8 text-center gradient-hero border-2">
            <div className="max-w-md mx-auto space-y-4">
              <div className="h-16 w-16 rounded-full gradient-primary mx-auto flex items-center justify-center">
                <svg className="h-8 w-8 text-white" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Sign in to Get Started
              </h3>
              <p className="text-muted-foreground">
                Connect your Google account to access Google Search Console data and analyze your site's SEO performance.
              </p>
              <Button
                onClick={() => signInWithGoogle()}
                className="gradient-primary text-white shadow-glow"
                size="lg"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </Button>
            </div>
          </Card>
        )}

        {user && (
        <>
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
        {!hasAnalyzed && user && (
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
        </>
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
