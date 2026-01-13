import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";
import { useLoaderData } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { redirect } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

import {
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Trash2,
  Settings
} from "lucide-react";
import { Link } from "@tanstack/react-router"; // Added Link import
import { getPortfolios, createPortfolio, getPortfolio, addTransaction, deletePortfolio } from "@/server/fn/portfolio";

// Server function to get current profile and posts
const getProfileData = createServerFn({ method: "GET" }).handler(async () => {
  const request = getRequest();
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session || !session.user) {
    throw redirect({ to: "/login" });
  }

  const { getPostsByUserId: getPostsByUserIdDA } = await import("@/server/data-access/posts");
  const posts = await getPostsByUserIdDA(session.user.id);

  return { user: session.user, posts };
});

export const Route = createFileRoute("/_dashboard/profile")({
  component: ProfilePage,
  loader: async () => {
    return getProfileData();
  },
});

function ProfilePage() {
  const { user, posts } = useLoaderData({ from: "/_dashboard/profile" });
  // Removed edit profile state and handlers

  const investingStyles = ["Value", "Growth", "Momentum", "Dividend", "Index", "Quantitative", "Day Trading"];
  const experienceLevels = ["Beginner", "Intermediate", "Advanced", "Professional"];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-card rounded-xl border border-border shadow-sm">
        <Avatar className="w-24 h-24 border-4 border-background shadow-md">
          <AvatarImage src={user.image || undefined} alt={user.name} />
          <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 text-center md:text-left space-y-2">
          <h1 className="text-3xl font-bold font-heading">{user.name}</h1>
          {(user as any).bio && (
            <p className="text-sm text-muted-foreground max-w-md">{(user as any).bio}</p>
          )}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {(user as any).investingStyle && (
              <Badge className="bg-primary/10 text-primary border-primary/20">
                {(user as any).investingStyle}
              </Badge>
            )}
            {(user as any).experienceLevel && (
              <Badge variant="outline">{(user as any).experienceLevel}</Badge>
            )}
            {posts.length > 0 && <Badge variant="secondary">{posts.length} Posts</Badge>}
          </div>
        </div>

        {/* Edit Profile Button */}
        <Button variant="outline" asChild>
          <Link to="/settings">
            <Settings className="w-4 h-4 mr-2" />
            Edit Profile
          </Link>
        </Button>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList>
          <TabsTrigger value="posts">My Research</TabsTrigger>
          <TabsTrigger value="portfolios">Portfolios</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4 mt-4">
          <h2 className="text-xl font-bold">Your Contributions</h2>
          {posts.length === 0 ? (
            <p className="text-muted-foreground italic">You haven't posted any research yet.</p>
          ) : (
            <div className="grid gap-4">
              {posts.map((post) => {
                // Helper to parse Tiptap JSON and get text preview
                const getContentPreview = (content: string) => {
                  try {
                    const doc = JSON.parse(content);
                    if (doc.type === 'doc' && doc.content) {
                      return doc.content
                        .filter((node: any) => node.type === 'paragraph' && node.content)
                        .map((node: any) => node.content.map((c: any) => c.text || '').join(''))
                        .join(' ')
                        .slice(0, 150);
                    }
                    return content.slice(0, 150);
                  } catch {
                    return content.slice(0, 150);
                  }
                };

                return (
                  <Card key={post.id} className="hover:border-primary/50 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <CardTitle className="text-lg">{post.title}</CardTitle>
                        <span className="text-xs text-muted-foreground">{format(new Date(post.publishedAt), 'MMM d, yyyy')}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">{getContentPreview(post.content)}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="portfolios" className="mt-4">
          <PortfoliosTab />
        </TabsContent>

        <TabsContent value="saved">
          <div className="py-12 text-center text-muted-foreground">
            Saved items feature coming soon.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Portfolio Tab Component
function PortfoliosTab() {
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPortfolio, setSelectedPortfolio] = useState<any>(null);
  const [newPortfolioName, setNewPortfolioName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Fetch portfolios on mount
  useEffect(() => {
    loadPortfolios();
  }, []);

  async function loadPortfolios() {
    setIsLoading(true);
    try {
      const data = await getPortfolios();
      setPortfolios(data);
    } catch (err) {
      console.error("Failed to load portfolios:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreatePortfolio() {
    if (!newPortfolioName.trim()) return;
    setIsCreating(true);
    try {
      await createPortfolio({ data: { name: newPortfolioName, type: "manual" } });
      setNewPortfolioName("");
      await loadPortfolios();
    } catch (err) {
      console.error("Failed to create portfolio:", err);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDeletePortfolio(id: string) {
    if (!confirm("Are you sure you want to delete this portfolio?")) return;
    try {
      await deletePortfolio({ data: id });
      await loadPortfolios();
    } catch (err) {
      console.error("Failed to delete portfolio:", err);
    }
  }

  async function openPortfolio(id: string) {
    try {
      const data = await getPortfolio({ data: id });
      setSelectedPortfolio(data);
    } catch (err) {
      console.error("Failed to load portfolio:", err);
    }
  }

  if (selectedPortfolio) {
    return (
      <PortfolioDetail
        portfolio={selectedPortfolio}
        onBack={() => {
          setSelectedPortfolio(null);
          loadPortfolios();
        }}
        onRefresh={async () => {
          const data = await getPortfolio({ data: selectedPortfolio.id });
          setSelectedPortfolio(data);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Your Portfolios</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Portfolio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Portfolio</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Portfolio Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., My Brokerage, Roth IRA"
                  value={newPortfolioName}
                  onChange={(e) => setNewPortfolioName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button onClick={handleCreatePortfolio} disabled={isCreating}>
                  {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : portfolios.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No portfolios yet</h3>
            <p className="text-muted-foreground text-sm text-center mb-4">
              Create a portfolio to start tracking your investments
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {portfolios.map((p) => (
            <Card
              key={p.id}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => openPortfolio(p.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{p.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePortfolio(p.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
                <CardDescription>{p.holdingsCount} holdings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold font-mono">
                      ${p.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Value</p>
                  </div>
                  <div className={`flex items-center gap-1 ${p.totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {p.totalGainLoss >= 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    <span className="font-mono font-semibold">
                      {p.totalGainLossPercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Portfolio Detail Component
function PortfolioDetail({ portfolio, onBack, onRefresh }: { portfolio: any, onBack: () => void, onRefresh: () => void }) {
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [txType, setTxType] = useState<"buy" | "sell">("buy");
  const [txSymbol, setTxSymbol] = useState("");
  const [txShares, setTxShares] = useState("");
  const [txPrice, setTxPrice] = useState("");
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAddTransaction() {
    if (!txSymbol || !txShares || !txPrice) return;
    setIsSubmitting(true);
    try {
      await addTransaction({
        data: {
          portfolioId: portfolio.id,
          symbol: txSymbol,
          type: txType,
          shares: parseFloat(txShares),
          pricePerShare: parseFloat(txPrice),
          date: txDate,
        }
      });
      setTxSymbol("");
      setTxShares("");
      setTxPrice("");
      setIsAddingTransaction(false);
      await onRefresh();
    } catch (err) {
      console.error("Failed to add transaction:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>← Back</Button>
          <h2 className="text-xl font-bold">{portfolio.name}</h2>
        </div>
        <Dialog open={isAddingTransaction} onOpenChange={setIsAddingTransaction}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Transaction</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex gap-2">
                <Button
                  variant={txType === "buy" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setTxType("buy")}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Buy
                </Button>
                <Button
                  variant={txType === "sell" ? "destructive" : "outline"}
                  className="flex-1"
                  onClick={() => setTxType("sell")}
                >
                  <TrendingDown className="w-4 h-4 mr-2" />
                  Sell
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Symbol</Label>
                <Input
                  placeholder="AAPL"
                  value={txSymbol}
                  onChange={(e) => setTxSymbol(e.target.value.toUpperCase())}
                  className="uppercase font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Shares</Label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={txShares}
                    onChange={(e) => setTxShares(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price per Share</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="150.00"
                    value={txPrice}
                    onChange={(e) => setTxPrice(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingTransaction(false)}>Cancel</Button>
              <Button onClick={handleAddTransaction} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Add {txType === "buy" ? "Purchase" : "Sale"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Holdings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          {portfolio.holdings.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No holdings yet. Add a transaction to get started.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">Symbol</th>
                    <th className="text-right py-2 px-3">Shares</th>
                    <th className="text-right py-2 px-3">Avg Cost</th>
                    <th className="text-right py-2 px-3">Value</th>
                    <th className="text-right py-2 px-3">Gain/Loss</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.holdings.map((h: any) => (
                    <tr key={h.id} className="border-b hover:bg-muted/30">
                      <td className="py-3 px-3 font-mono font-semibold text-primary">{h.symbol}</td>
                      <td className="py-3 px-3 text-right font-mono">{h.shares.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right font-mono">${h.avgCostBasis.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right font-mono">
                        ${(h.shares * h.avgCostBasis).toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="text-muted-foreground text-xs">--</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {portfolio.transactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No transactions recorded.
            </p>
          ) : (
            <div className="space-y-2">
              {portfolio.transactions.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded ${tx.type === 'buy' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                      {tx.type === 'buy' ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">
                        <span className={tx.type === 'buy' ? 'text-green-500' : 'text-red-500'}>
                          {tx.type.toUpperCase()}
                        </span>
                        {' '}{tx.shares} {tx.symbol}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @ ${tx.pricePerShare.toFixed(2)} • {format(new Date(tx.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <p className="font-mono font-semibold">
                    ${tx.totalValue.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
