import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getCommunityPosts, getContributors, searchCommunityPosts } from "../server/features/contributors";
import { useLoaderData } from "@tanstack/react-router";
import {
  Users,
  Search,
  TrendingUp,
  Clock,
  Flame,
  Filter
} from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { FeedPost } from "../components/FeedPost";
import { MarketMovers } from "../components/MarketMovers";
import { WhoToFollow } from "../components/WhoToFollow";
import { UserLeaderboard } from "../components/UserLeaderboard";
import { Button } from "../components/ui/button";

// Server Function - Fetch Posts + Users (for author info)
const getCommunityDataFn = createServerFn({ method: "GET" })
  .inputValidator(z.string().optional())
  .handler(async ({ data }) => {
    const query = data;

    // Select function based on query
    const postsPromise = query
      ? searchCommunityPosts(query, 20)
      : getCommunityPosts(20);

    const [posts, users] = await Promise.all([
      postsPromise,
      getContributors()
    ]);
    return { posts, users };
  });

type SearchParams = {
  q?: string;
};

export const Route = createFileRoute("/contributors")({
  component: Contributors,
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      q: typeof search.q === 'string' ? search.q : undefined,
    };
  },
  loaderDeps: ({ search }) => ({ q: search.q }),
  loader: async ({ deps }) => {
    return await getCommunityDataFn({ data: deps.q });
  },
});

type FilterType = "trending" | "latest" | "top";

function Contributors() {
  const { posts, users } = useLoaderData({ from: "/contributors" });
  const navigate = Route.useNavigate();
  const search = Route.useSearch();

  const [activeFilter, setActiveFilter] = useState<FilterType>("trending");
  const [searchQuery, setSearchQuery] = useState(search.q || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      search: { q: searchQuery || undefined },
    });
  };

  // Helper to find author details
  const getAuthor = (userId: string) => {
    return users.find(u => u.id === userId) || {
      id: userId,
      name: "Unknown User",
      totalPosts: 0,
      followers: 0,
      following: 0,
      joinedAt: ""
    };
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Navigation / Mobile Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/60">
        <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Users className="w-5 h-5 text-primary" />
            <span>Thesivest Community</span>
          </div>

          {/* Search Bar - Hidden on mobile, visible on md+ */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center relative w-96">
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search symbols, users, or keywords..."
              className="w-full bg-muted/40 border border-border/50 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6">
            + New Post
          </Button>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

          {/* LEFT SIDEBAR - Navigation (Hidden on mobile) */}
          <div className="hidden md:block md:col-span-3 lg:col-span-2 space-y-6 sticky top-24 h-fit">
            <div className="space-y-1">
              <button
                onClick={() => setActiveFilter('trending')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeFilter === 'trending' ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'}`}
              >
                <Flame className="w-5 h-5" />
                Trending
              </button>
              <button
                onClick={() => setActiveFilter('latest')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeFilter === 'latest' ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'}`}
              >
                <Clock className="w-5 h-5" />
                Latest
              </button>
              <button
                onClick={() => setActiveFilter('top')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeFilter === 'top' ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'}`}
              >
                <TrendingUp className="w-5 h-5" />
                Top Rated
              </button>
            </div>

            <div className="pt-6 border-t border-border/50">
              <h3 className="px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">My Community</h3>
              <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-muted text-sm text-muted-foreground transition-colors">
                <Users className="w-4 h-4" />
                Following
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-muted text-sm text-muted-foreground transition-colors">
                <Filter className="w-4 h-4" />
                Watchlist Feed
              </button>
            </div>
          </div>

          {/* CENTER FEED - Main Content */}
          <div className="col-span-1 md:col-span-9 lg:col-span-7 space-y-6">
            {/* Mobile Filter Tabs */}
            <div className="flex md:hidden items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <Button variant={activeFilter === 'trending' ? 'default' : 'outline'} size="sm" onClick={() => setActiveFilter('trending')} className="rounded-full">
                Trending
              </Button>
              <Button variant={activeFilter === 'latest' ? 'default' : 'outline'} size="sm" onClick={() => setActiveFilter('latest')} className="rounded-full">
                Latest
              </Button>
              <Button variant={activeFilter === 'top' ? 'default' : 'outline'} size="sm" onClick={() => setActiveFilter('top')} className="rounded-full">
                Top Rated
              </Button>
            </div>

            {/* Feed Posts */}
            <div className="space-y-6">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <FeedPost key={post.id} post={post} author={getAuthor(post.userId)} />
                ))
              ) : (
                <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed border-border">
                  <h3 className="text-lg font-semibold text-muted-foreground">No posts yet</h3>
                  <p className="text-sm text-muted-foreground/60">Be the first to share your thesis!</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR - Widgets (Hidden on mobile/tablet) */}
          <div className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24 h-fit">
            <UserLeaderboard />
            <WhoToFollow />
            <MarketMovers />

            <div className="text-[10px] text-muted-foreground text-center pt-8">
              © 2024 Thesivest Inc. • Privacy • Terms • Cookies
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
