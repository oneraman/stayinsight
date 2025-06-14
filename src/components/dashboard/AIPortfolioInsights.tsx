
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, TrendingUp } from 'lucide-react';
import { generateDataSummary } from '@/lib/gemini';
import { toast } from 'sonner';

interface AIPortfolioInsightsProps {
  customers: any[];
}

const AIPortfolioInsights = ({ customers }: AIPortfolioInsightsProps) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateInsights = async () => {
    if (customers.length === 0) {
      toast.error('No customer data available for analysis');
      return;
    }

    setIsLoading(true);
    try {
      const aiInsights = await generateDataSummary(customers);
      setInsights(aiInsights);
      toast.success('Portfolio insights generated successfully!');
    } catch (error) {
      console.error('Error generating portfolio insights:', error);
      toast.error('Failed to generate portfolio insights');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#5E5AFF]" />
          AI Portfolio Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!insights ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              Get AI-powered strategic insights about your entire customer portfolio.
            </p>
            <Button 
              onClick={handleGenerateInsights}
              disabled={isLoading || customers.length === 0}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing Portfolio...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Portfolio Insights
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {insights}
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleGenerateInsights}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Refresh Analysis
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIPortfolioInsights;
