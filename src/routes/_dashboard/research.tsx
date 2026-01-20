import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { createPost, getUserOpenTrades } from "@/server/fn/posts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Loader2, TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw, CheckCircle2 } from "lucide-react";
import TiptapEditor from "@/components/Editor/TiptapEditor";
import { z } from "zod";

const researchSearchSchema = z.object({
  type: z.enum(["trade", "thesis", "update", "close_trade", "market_outlook"]).optional(),
});

export const Route = createFileRoute("/_dashboard/research")({
  component: ResearchPage,
  validateSearch: researchSearchSchema,
});

function ResearchPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/_dashboard/research" });
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState<"trade" | "thesis" | "update" | "close_trade" | "market_outlook">(
    (search.type as any) || "thesis"
  );
  const [positionType, setPositionType] = useState<"long" | "short">("long");
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
          published: true, // Publish immediately so it appears in community feed
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
    <div className="max-w-5xl mx-auto px-2 py-4 space-y-5">
      {/* Compact Header - No Icon */}
      <div>
        <h1 className="text-3xl font-heading font-bold">Write Research</h1>
        <p className="text-muted-foreground text-sm mt-1">Share your analysis with the community</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Post Type - Inline pills style */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { value: "thesis", label: "Thesis" },
            { value: "trade", label: "Trade" },
            { value: "market_outlook", label: "Market Outlook" },
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
        <div className="py-2">
          <Input
            id="title"
            name="title"
            placeholder={type === 'close_trade' ? "Exiting [Symbol]: Thesis Changed" : "Enter your headline..."}
            required
            className="!text-4xl font-heading font-bold border-none shadow-none p-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/40 placeholder:font-normal"
          />
        </div>

        {/* Ticker Field - Required for all post types */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <Label htmlFor="symbol" className="text-sm font-medium">Ticker</Label>
          </div>
          <Input
            id="symbol"
            name="symbol"
            placeholder="AAPL"
            required
            className="w-32 uppercase font-mono text-center"
          />
        </div>

        {/* Trade Details - Position Type, Entry, Target/Exit */}
        {(type === 'trade') && (
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Trade Details</span>
              </div>

              {/* Long/Short Selection */}
              <div className="space-y-2">
                <Label className="text-xs">Position Type</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={positionType === "long" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPositionType("long")}
                    className="flex-1"
                  >
                    <ArrowUpRight className="w-4 h-4 mr-2 text-green-500" />
                    Long
                  </Button>
                  <Button
                    type="button"
                    variant={positionType === "short" ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => setPositionType("short")}
                    className="flex-1"
                  >
                    <ArrowDownRight className="w-4 h-4 mr-2 text-red-500" />
                    Short
                  </Button>
                </div>
              </div>

              {/* Entry and Exit Price */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="buyPrice" className="text-xs">Entry Price</Label>
                  <Input id="buyPrice" name="buyPrice" type="number" step="0.01" placeholder="0.00" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="targetPrice" className="text-xs">Target Price (optional)</Label>
                  <Input id="targetPrice" name="targetPrice" type="number" step="0.01" placeholder="0.00" />
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

