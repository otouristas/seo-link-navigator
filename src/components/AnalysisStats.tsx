import { Card } from "@/components/ui/card";
import { TrendingUp, Link2, Target, Zap } from "lucide-react";

interface StatsProps {
  totalPages: number;
  totalKeywords: number;
  totalOpportunities: number;
  avgKeywordScore: number;
}

export const AnalysisStats = ({ 
  totalPages, 
  totalKeywords, 
  totalOpportunities,
  avgKeywordScore 
}: StatsProps) => {
  const stats = [
    {
      label: "Pages Analyzed",
      value: totalPages,
      icon: Link2,
      color: "text-primary"
    },
    {
      label: "Keywords Extracted",
      value: totalKeywords,
      icon: Target,
      color: "text-info"
    },
    {
      label: "Link Opportunities",
      value: totalOpportunities,
      icon: TrendingUp,
      color: "text-success"
    },
    {
      label: "Avg. Keyword Score",
      value: avgKeywordScore.toFixed(0),
      icon: Zap,
      color: "text-warning"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={index} 
            className="p-6 transition-smooth hover:shadow-md hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg bg-muted/50 ${stat.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
