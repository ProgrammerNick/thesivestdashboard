import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { auth } from "@/lib/auth";
import { createPost, getUserOpenTrades } from "@/server/features/posts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Loader2, TrendingUp, PenTool, RefreshCw, CheckCircle2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/_dashboard/research")({
  component: ResearchPage,
});

function ResearchPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState<"trade" | "thought" | "update" | "close_trade" | "market_outlook" | "quarterly_letter">("thought");
  const [content, setContent] = useState("");
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
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold flex items-center gap-2">
          <PenTool className="w-8 h-8 text-primary" />
          Write Research
        </h1>
        <p className="text-muted-foreground mt-2">
          Share deep-dive analysis, trade ideas, or market thoughts depending on your conviction.
        </p>
      </div>

      <Card className="border-border/60 shadow-md">
        <CardHeader>
          <CardTitle>New Entry</CardTitle>
          <CardDescription>
            Use Markdown to format your post like a pro (headers, lists, images).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Post Type</Label>
                <Select value={type} onValueChange={(v: any) => setType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="thought">Investment Thesis / Blog</SelectItem>
                    <SelectItem value="trade">New Trade (Buy/Signal)</SelectItem>
                    <SelectItem value="update">Update Existing Position</SelectItem>
                    <SelectItem value="close_trade">Close Trade</SelectItem>
                    <SelectItem value="market_outlook">Market Outlook</SelectItem>
                    <SelectItem value="quarterly_letter">Quarterly Letter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Headline</Label>
                <Input id="title" name="title" placeholder={type === 'close_trade' ? "Exiting [Symbol]: Thesis Changed" : "e.g. The Bull Case for Nuclear Energy"} required className="font-bold text-lg" />
              </div>
            </div>

            {/* Logic for NEW Trade */}
            {(type === 'trade') && (
              <div className="p-4 border rounded-lg bg-muted/20">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">
                  <TrendingUp className="w-4 h-4" /> New Trade Details
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <Label htmlFor="symbol">Symbol</Label>
                    <Input id="symbol" name="symbol" placeholder="AAPL" className="uppercase font-mono" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buyPrice">Entry Price</Label>
                    <Input id="buyPrice" name="buyPrice" type="number" step="0.01" placeholder="0.00" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetPrice">Target</Label>
                    <Input id="targetPrice" name="targetPrice" type="number" step="0.01" placeholder="Optional" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stopLoss">Stop</Label>
                    <Input id="stopLoss" name="stopLoss" type="number" step="0.01" placeholder="Optional" />
                  </div>
                </div>
              </div>
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

            <div className="space-y-2">
              <Tabs defaultValue="write" className="w-full">
                <div className="flex justify-between items-center mb-1">
                  <Label>Content (Markdown Supported)</Label>
                  <TabsList className="h-8">
                    <TabsTrigger value="write" className="text-xs">Write</TabsTrigger>
                    <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="write" className="space-y-2 mt-0">
                  <Textarea
                    id="content"
                    placeholder={type === 'close_trade' ? "Reason for exit, lessons learned..." : "# My Thesis...&#10;&#10;Here is why I believe..."}
                    className="min-h-[400px] font-mono text-sm leading-relaxed p-4"
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </TabsContent>
                <TabsContent value="preview" className="mt-0">
                  <div className="min-h-[400px] border rounded-md p-6 bg-card prose prose-sm dark:prose-invert max-w-none prose-headings:font-heading prose-a:text-primary">
                    {content ? (
                      <ReactMarkdown>{content}</ReactMarkdown>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground italic">
                        Start writing to generate a preview.
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button type="button" variant="ghost" onClick={() => navigate({ to: "/dashboard" })}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} size="lg">
                {isLoading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                {type === 'close_trade' ? 'Close Trade' : 'Publish'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
