import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreIndicator } from "./ScoreIndicator";
import { LinkOpportunity } from "@/utils/seoScoring";
import { ExternalLink, TrendingUp } from "lucide-react";

interface OpportunityTableProps {
  opportunities: LinkOpportunity[];
}

export const OpportunityTable = ({ opportunities }: OpportunityTableProps) => {
  if (opportunities.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          No link opportunities found. Try analyzing different pages or adjusting your criteria.
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[50px]">Rank</TableHead>
            <TableHead className="min-w-[150px]">Keyword</TableHead>
            <TableHead>Source Page</TableHead>
            <TableHead>Target Page</TableHead>
            <TableHead>Anchor Text</TableHead>
            <TableHead className="text-right">Keyword Score</TableHead>
            <TableHead className="text-right">Page Score</TableHead>
            <TableHead className="text-right">Priority</TableHead>
            <TableHead className="text-right">Est. Impact</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {opportunities.map((opp, index) => (
            <TableRow key={index} className="hover:bg-muted/30 transition-base">
              <TableCell>
                <Badge 
                  variant={index < 3 ? "default" : "outline"}
                  className="font-mono"
                >
                  {index + 1}
                </Badge>
              </TableCell>
              
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="text-sm">{opp.keyword}</span>
                </div>
              </TableCell>
              
              <TableCell>
                <a 
                  href={opp.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  {new URL(opp.sourceUrl).pathname.slice(0, 30)}...
                  <ExternalLink className="h-3 w-3" />
                </a>
              </TableCell>
              
              <TableCell>
                <a 
                  href={opp.targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  {new URL(opp.targetUrl).pathname.slice(0, 30)}...
                  <ExternalLink className="h-3 w-3" />
                </a>
              </TableCell>
              
              <TableCell>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {opp.anchorText}
                </code>
              </TableCell>
              
              <TableCell className="text-right">
                <ScoreIndicator 
                  score={opp.keywordScore} 
                  type="keyword"
                  showLabel={false}
                />
              </TableCell>
              
              <TableCell className="text-right">
                <ScoreIndicator 
                  score={opp.pageScore} 
                  type="page"
                  showLabel={false}
                />
              </TableCell>
              
              <TableCell className="text-right">
                <ScoreIndicator 
                  score={opp.priority} 
                  type="priority"
                  showLabel={false}
                />
              </TableCell>
              
              <TableCell className="text-right">
                <span className="text-sm font-medium text-success">
                  {opp.expectedImpact}
                </span>
              </TableCell>
              
              <TableCell className="text-right">
                <Button size="sm" variant="outline">
                  Implement
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
