import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { getFeedPosts, deletePost } from "@/server/fn/posts";
import { getDashboardData } from "@/server/fn/dashboard";
import { useLoaderData } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  MessageSquare,
  Search,
  MoreHorizontal,
  Trash2,
  Edit,
  TrendingUp,
  Sparkles,
  Users,
  ArrowRight
} from "lucide-react";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/_dashboard/community")({
  component: CommunityPage,
  loader: async () => {
    const posts = await getFeedPosts();
    const dashboardData = await getDashboardData();
    return { posts, contributors: dashboardData.contributors };
  },
});

// Type for posts from the feed
interface FeedPost {
  id: string;
  title: string;
  content: string;
  type: string;
  symbol?: string;
  publishedAt: Date | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  user: {
    id: string;
    name: string;
    displayName: string;
    image?: string;
    verified?: boolean;
  };
}

interface Contributor {
  id: string;
  name: string;
  avatar: string | null;
  totalPosts: number;
}

function CommunityPage() {
  const { posts, contributors } = useLoaderData({ from: "/_dashboard/community" }) as {
    posts: FeedPost[];
    contributors: Contributor[];
  };
  const [searchQuery, setSearchQuery] = useState("");
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();

  // Filter posts by ticker or title
  const filteredPosts = posts.filter(post => {
    const query = searchQuery.toLowerCase();
    if (!query) return true;
    return (
      post.title.toLowerCase().includes(query) ||
      post.symbol?.toLowerCase().includes(query) ||
      post.user.name.toLowerCase().includes(query) ||
      post.user.displayName?.toLowerCase().includes(query)
    );
  });

  // Calculate trending tickers from displayed posts
  const trendingTickers = posts
    .filter(post => post.symbol)
    .reduce((acc, post) => {
      const symbol = post.symbol!.toUpperCase();
      acc[symbol] = (acc[symbol] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const topTickers = Object.entries(trendingTickers)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 5);

  const handleDeletePost = async (postId: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();

    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deletePost({ data: { id: postId } });
        // Refresh page data
        navigate({ from: "/_dashboard/community", replace: true });
      } catch (error) {
        console.error("Failed to delete post:", error);
        alert("Failed to delete post.");
      }
    }
  };

  // Helper to get type badge color
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "trade":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20">TRADE</Badge>;
      case "market_outlook":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20">OUTLOOK</Badge>;
      case "thesis":
      case "thought":
      default:
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20">THESIS</Badge>;
    }
  };

  // Helper to truncate content preview
  const getContentPreview = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      if (parsed.content) {
        const text = parsed.content
          .filter((node: any) => node.type === "paragraph")
          .map((node: any) => node.content?.map((c: any) => c.text).join("") || "")
          .join(" ");
        return text.slice(0, 180) + (text.length > 180 ? "..." : "");
      }
      return "";
    } catch {
      return content.slice(0, 180) + (content.length > 180 ? "..." : "");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold">Community</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Discover research, trade ideas, and market insights.
          </p>
        </div>
        <Button asChild className="rounded-full px-6 shadow-md hover:shadow-lg transition-all">
          <Link to="/research">Write Research</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT COLUMN: Main Feed (8 cols) */}
        <div className="lg:col-span-8 space-y-6">

          <Tabs defaultValue="for_you" className="w-full">

            {/* Feed Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <TabsList className="bg-muted/50 p-1 rounded-full self-start">
                <TabsTrigger value="for_you" className="rounded-full px-5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  For You
                </TabsTrigger>
                <TabsTrigger value="following" className="rounded-full px-5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  Following
                </TabsTrigger>
                <TabsTrigger value="top" className="rounded-full px-5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  Top
                </TabsTrigger>
              </TabsList>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickers or authors..."
                  className="pl-9 h-9 text-sm bg-muted/30 border-none focus-visible:ring-1 rounded-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <TabsContent value="for_you" className="space-y-4 m-0">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-20 bg-muted/10 rounded-xl border border-dashed border-border/50">
                  <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <h3 className="text-lg font-semibold text-foreground">No research found</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-1">
                    We couldn't find any posts matching your search. Try adjustment your filters or write your own!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {filteredPosts.map((post) => (
                    <div key={post.id} className="group relative bg-card hover:bg-muted/20 border border-border/40 rounded-xl transition-all duration-200 hover:shadow-sm overflow-hidden">
                      <Link to="/post/$postId" params={{ postId: post.id }} className="block p-5">
                        <div className="flex gap-4">
                          {/* Avatar Column */}
                          <div className="flex-shrink-0 pt-1 relative z-10" onClick={(e) => e.stopPropagation()}>
                            <Link to={`/profiles/${post.user.id}`}>
                              <Avatar className="h-10 w-10 border border-border/50 hover:ring-2 hover:ring-primary/20 transition-all">
                                <AvatarImage src={post.user.image} />
                                <AvatarFallback>{post.user.name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                            </Link>
                          </div>

                          {/* Content Column */}
                          <div className="flex-1 min-w-0">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2 text-xs" onClick={(e) => e.stopPropagation()}>
                                <Link to={`/profiles/${post.user.id}`} className="font-semibold text-foreground hover:underline">
                                  {post.user.displayName || post.user.name}
                                </Link>
                                {post.user.verified && <Badge variant="secondary" className="text-[10px] px-1 h-4">✓</Badge>}
                                <span className="text-muted-foreground">•</span>
                                <span className="text-muted-foreground">{post.publishedAt && format(new Date(post.publishedAt), "MMM d")}</span>
                              </div>

                              {/* More Options */}
                              {(session?.user?.id === post.user.id) && (
                                <div onClick={(e) => e.preventDefault()}>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 text-muted-foreground hover:text-foreground">
                                        <MoreHorizontal className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => navigate({ to: "/research", search: { editId: post.id } })}>
                                        <Edit className="w-4 h-4 mr-2" /> Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={(e) => handleDeletePost(post.id, e as any)} className="text-red-500 focus:text-red-500">
                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              )}
                            </div>

                            {/* Title & Preview */}
                            <h3 className="text-base sm:text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors leading-tight">
                              {post.title}
                            </h3>

                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                              {getContentPreview(post.content)}
                            </p>

                            {/* Footer Metrics */}
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-3">
                                {post.symbol && (
                                  <Badge variant="outline" className="font-mono text-xs border-primary/20 bg-primary/5 text-primary">
                                    ${post.symbol}
                                  </Badge>
                                )}
                                {getTypeBadge(post.type)}
                              </div>

                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1.5 hover:text-red-500 transition-colors">
                                  <Heart className="w-3.5 h-3.5" />
                                  <span>{post.likes || 0}</span>
                                </div>
                                <div className="flex items-center gap-1.5 hover:text-blue-500 transition-colors">
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>{post.comments || 0}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="following">
              <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-xl border border-dashed">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Your Feed is Empty</h3>
                <p className="text-muted-foreground max-w-sm mb-6 text-sm">
                  Follow analysts and researchers from the sidebar to curate your personal investment feed.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="top">
              <div className="text-center py-20">
                <p className="text-muted-foreground">Trending research coming soon.</p>
              </div>
            </TabsContent>
          </Tabs>

        </div>

        {/* RIGHT COLUMN: Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-6">

          {/* Widget 1: AI Market Pulse */}
          <Card className="bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 border-primary/10 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-primary">
                <Sparkles className="w-4 h-4" />
                AI Market Pulse
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/80 leading-relaxed">
                <span className="font-semibold text-foreground">Bullish sentiment</span> on semi-conductors is rising as TSMC earnings beat expectations. <span className="font-semibold text-foreground">Macro concerns</span> persist around inflation data affecting small-caps.
              </p>
              <div className="mt-3 flex gap-2">
                <Badge variant="secondary" className="text-[10px]">#Semi</Badge>
                <Badge variant="secondary" className="text-[10px]">#Macro</Badge>
                <Badge variant="secondary" className="text-[10px]">#Tech</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Widget 2: Trending Tickers */}
          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Trending Tickers
              </CardTitle>
              <CardDescription className="text-xs">
                Most discussed in the last 24h
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 px-0">
              {topTickers.length > 0 ? (
                <div className="space-y-0.5">
                  {topTickers.map(([symbol, count], i) => (
                    <div key={symbol} className="flex items-center justify-between py-2 px-4 hover:bg-muted/50 cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground text-xs font-mono w-4 text-center">{i + 1}</span>
                        <div className="font-semibold text-sm">{symbol}</div>
                      </div>
                      <Badge variant="outline" className="h-5 text-[10px] px-1.5 font-normal text-muted-foreground">
                        {count} posts
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-muted-foreground text-xs text-center">
                  No trending data yet.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Widget 3: Who to Follow */}
          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                Who to Follow
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 px-4 space-y-4">
              {contributors.slice(0, 4).map(c => (
                <div key={c.id} className="flex items-center justify-between">
                  <Link to={`/profiles/${c.id}`} className="flex items-center gap-3 group">
                    <Avatar className="h-8 w-8 border border-border">
                      <AvatarImage src={c.avatar || undefined} />
                      <AvatarFallback>{c.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="leading-none">
                      <p className="text-sm font-medium group-hover:text-primary transition-colors">{c.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{c.totalPosts} posts</p>
                    </div>
                  </Link>
                  <Button variant="outline" size="sm" className="h-7 text-xs px-2">
                    Follow
                  </Button>
                </div>
              ))}
              <Button variant="ghost" className="w-full text-xs text-muted-foreground h-8 mt-2">
                View all contributors <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </CardContent>
          </Card>

          {/* Footer Links */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-muted-foreground px-2">
            <a href="#" className="hover:underline">Terms</a>
            <a href="#" className="hover:underline">Privacy</a>
            <a href="#" className="hover:underline">Guidelines</a>
            <span>© 2024 Thesivest</span>
          </div>

        </div>
      </div>
    </div>
  );
}
