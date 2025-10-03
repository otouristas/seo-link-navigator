import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TokenScore } from "@/utils/tfidf";
import { cn } from "@/lib/utils";

interface KeywordTokenProps {
  token: TokenScore;
  index: number;
  selected?: boolean;
  onClick?: () => void;
}

export const KeywordToken = ({ token, index, selected, onClick }: KeywordTokenProps) => {
  return (
    <Card
      className={cn(
        "p-4 cursor-pointer transition-smooth hover:shadow-md hover:scale-[1.02] border-2",
        selected ? "border-primary shadow-glow bg-primary/5" : "border-border"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono">
              #{index + 1}
            </Badge>
            <h3 className="text-lg font-semibold text-foreground">
              {token.token}
            </h3>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="font-medium">TF-IDF:</span>
              <span className="font-mono text-foreground">
                {token.score.toFixed(3)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-medium">Frequency:</span>
              <span className="font-mono text-foreground">
                {token.frequency}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className={cn(
            "h-2 w-24 rounded-full overflow-hidden bg-muted",
            "relative"
          )}>
            <div
              className="h-full gradient-primary transition-smooth"
              style={{ width: `${Math.min(token.score * 100, 100)}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">
            Relevance Score
          </span>
        </div>
      </div>
    </Card>
  );
};
