import { createFileRoute, Link } from "@tanstack/react-router";
import { getFeedPosts } from "@/server/fn/posts";
import { getDashboardData } from "@/server/fn/dashboard";
import { useLoaderData } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import { useState } from "react";

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

  // Filter creators by name - only show when searching
  const matchedCreators = searchQuery
    ? contributors.filter(creator =>
      creator.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];

  // Helper to get type badge color
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "trade":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">TRADE</Badge>;
      case "market_outlook":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">MARKET OUTLOOK</Badge>;
      case "thesis":
      case "thought":
      default:
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">THESIS</Badge>;
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
        return text.slice(0, 200) + (text.length > 200 ? "..." : "");
      }
      return "";
    } catch {
      return content.slice(0, 200) + (content.length > 200 ? "..." : "");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold">Community</h1>
          <p className="text-muted-foreground mt-1">
            Discover research and connect with contributors.
          </p>
        </div>
        <Button asChild>
          <Link to="/research">Write Research</Link>
        </Button>
      </div>

      {/* Unified Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search by ticker, title, or contributor..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12 text-base"
        />
      </div>

      {/* Matched Creators Section - Only show when searching and there are matches */}
      {matchedCreators.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Contributors</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {matchedCreators.slice(0, 5).map((creator) => (
              <Card key={creator.id} className="flex-shrink-0 w-48 hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={creator.avatar || undefined} />
                      <AvatarFallback>{creator.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{creator.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {creator.totalPosts} {creator.totalPosts === 1 ? 'post' : 'posts'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Research Posts */}
      <div className="space-y-4">
        {searchQuery && (
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">
              {filteredPosts.length} {filteredPosts.length === 1 ? 'result' : 'results'} for "{searchQuery}"
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")}>
              Clear
            </Button>
          </div>
        )}

        {filteredPosts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              {searchQuery ? (
                <>
                  <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No Results Found</h3>
                  <p className="text-muted-foreground mb-4">
                    No research found for "{searchQuery}"
                  </p>
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-lg mb-2">No Research Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Be the first to share your investment thesis with the community.
                  </p>
                  <Button asChild>
                    <Link to="/research">Write Research</Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <Link key={post.id} to="/post/$postId" params={{ postId: post.id }}>
                <Card className="hover:border-primary/50 transition-all cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={post.user.image} />
                          <AvatarFallback>{post.user.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-medium text-sm">{post.user.displayName || post.user.name}</span>
                          <span className="text-muted-foreground text-xs ml-2">
                            {post.publishedAt && format(new Date(post.publishedAt), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTypeBadge(post.type)}
                        {post.symbol && (
                          <Badge variant="outline" className="font-mono text-xs">{post.symbol}</Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors mt-2">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {getContentPreview(post.content)}
                    </p>
                  </CardContent>
                  <CardFooter className="text-xs text-muted-foreground pt-0">
                    <span>{post.views || 0} views</span>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
