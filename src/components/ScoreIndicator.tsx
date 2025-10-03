import { cn } from "@/lib/utils";
import { getScoreTier } from "@/utils/seoScoring";
import { ArrowUp, ArrowRight, ArrowDown } from "lucide-react";

interface ScoreIndicatorProps {
  score: number;
  type: 'keyword' | 'page' | 'priority';
  showLabel?: boolean;
  className?: string;
}

export const ScoreIndicator = ({ 
  score, 
  type, 
  showLabel = true,
  className 
}: ScoreIndicatorProps) => {
  const { tier, color, label } = getScoreTier(score, type);
  
  const Icon = tier === 'excellent' ? ArrowUp : 
               tier === 'good' ? ArrowRight : 
               tier === 'fair' ? ArrowRight : ArrowDown;

  const colorClasses = {
    success: 'bg-success/10 text-success border-success/20',
    info: 'bg-info/10 text-info border-info/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    muted: 'bg-muted text-muted-foreground border-border'
  };

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-sm font-medium transition-smooth",
      colorClasses[color as keyof typeof colorClasses],
      className
    )}>
      <Icon className="h-3.5 w-3.5" />
      <span className="font-mono">{score.toFixed(0)}</span>
      {showLabel && <span className="text-xs opacity-80">• {label}</span>}
    </div>
  );
};
