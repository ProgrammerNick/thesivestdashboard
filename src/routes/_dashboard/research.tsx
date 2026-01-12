import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createPost, getUserOpenTrades } from "@/server/fn/posts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Loader2, TrendingUp, PenTool, RefreshCw, CheckCircle2 } from "lucide-react";
import TiptapEditor from "@/components/Editor/TiptapEditor";

export const Route = createFileRoute("/_dashboard/research")({
  component: ResearchPage,
});

function ResearchPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState<"trade" | "thought" | "update" | "close_trade" | "market_outlook" | "quarterly_letter">("thought");
  const [content, setContent] = useState<any>(null);
  const [openTrades, setOpenTrades] = useState<any[]>([]);
  const [selectedTradeId, setSelectedTradeId] = useState<string>("");

  useEffect(() => {
    if (type === 'update' || type === 'close_trade') {
      // Fetch open trades
      getUserOpenTrades().then(setOpenTrades);
    }
  }, [type]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      await createPost({
        data: {
          title: formData.get("title") as string,
          content: content,
          type: type as any,
          symbol: (formData.get("symbol") as string)?.toUpperCase(),
          buyPrice: formData.get("buyPrice") ? Number(formData.get("buyPrice")) : undefined,
          targetPrice: formData.get("targetPrice") ? Number(formData.get("targetPrice")) : undefined,
          stopLoss: formData.get("stopLoss") ? Number(formData.get("stopLoss")) : undefined,
          referencePostId: selectedTradeId || undefined,
          closePrice: formData.get("closePrice") ? Number(formData.get("closePrice")) : undefined,
        }
      });
      navigate({ to: "/dashboard" });
    } catch (error) {
      console.error("Failed to post research:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <PenTool className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-heading font-semibold">Write Research</h1>
            <p className="text-muted-foreground text-xs">Share your analysis</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Post Type - Inline pills style */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { value: "thought", label: "Investment Thesis", icon: PenTool },
            { value: "trade", label: "New Trade", icon: TrendingUp },
            { value: "market_outlook", label: "Market Outlook", icon: TrendingUp },
            { value: "quarterly_letter", label: "Quarterly Letter", icon: PenTool },
          ].map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={type === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setType(option.value as any)}
              className="rounded-full"
            >
              {option.label}
            </Button>
          ))}
        </div>

        {/* Title - Large, prominent input */}
        <div>
          <Input
            id="title"
            name="title"
            placeholder={type === 'close_trade' ? "Exiting [Symbol]: Thesis Changed" : "Your headline..."}
            required
            className="text-2xl font-semibold border-none shadow-none p-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Trade Details - Cleaner card */}
        {(type === 'trade') && (
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Trade Details</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="symbol" className="text-xs">Symbol</Label>
                  <Input id="symbol" name="symbol" placeholder="AAPL" className="uppercase font-mono" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="buyPrice" className="text-xs">Entry Price</Label>
                  <Input id="buyPrice" name="buyPrice" type="number" step="0.01" placeholder="0.00" required />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Logic for UPDATE or CLOSE Trade */}
        {(type === 'update' || type === 'close_trade') && (
          <div className="p-4 border rounded-lg bg-muted/20">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">
              {type === 'close_trade' ? <CheckCircle2 className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
              {type === 'close_trade' ? 'Close Position' : 'Update Position'}
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Active Trade</Label>
                <Select value={selectedTradeId} onValueChange={setSelectedTradeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a position..." />
                  </SelectTrigger>
                  <SelectContent>
                    {openTrades.length === 0 ? (
                      <SelectItem value="none" disabled>No active trades found</SelectItem>
                    ) : (
                      openTrades.map(trade => (
                        <SelectItem key={trade.id} value={trade.id}>
                          {trade.symbol} - {trade.title} (Entry: ${trade.buyPrice})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {type === 'close_trade' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="closePrice">Close Price</Label>
                    <Input id="closePrice" name="closePrice" type="number" step="0.01" placeholder="0.00" required />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* WYSIWYG Editor - Fluid, no label */}
        <TiptapEditor
          content={content}
          onChange={setContent}
        />

        <div className="flex justify-end gap-4 pt-8 mt-8 border-t">
          <Button type="button" variant="ghost" onClick={() => navigate({ to: "/dashboard" })}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} size="lg">
            {isLoading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
            {type === 'close_trade' ? 'Close Trade' : 'Publish'}
          </Button>
        </div>
      </form>
    </div>
  );
}
