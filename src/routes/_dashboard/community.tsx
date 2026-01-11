import { createFileRoute, Link } from "@tanstack/react-router";
import { getFeedPosts } from "@/server/fn/posts";
import { useLoaderData } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, ThumbsUp, TrendingUp, Users } from "lucide-react";

export const Route = createFileRoute("/_dashboard/community")({
  component: CommunityPage,
  loader: async () => {
    const posts = await getFeedPosts();
    return { posts };
  },
});

function CommunityPage() {
  const { posts } = useLoaderData({ from: "/_dashboard/community" });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" />
            Community Research
          </h1>
          <p className="text-muted-foreground mt-2">
            Discover investment ideas from the smartest minds in the room.
          </p>
        </div>
        <Button asChild>
          <Link to="/research">Write Research</Link>
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Research</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Featured / Clean Example Post as requested */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Featured Analysis</span>
            </div>

            <Link to="/post/featured-example" className="block group">
              <Card className="border-border/60 shadow-sm transition-all hover:border-primary/50 hover:shadow-md bg-card/50">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border border-border">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">Sebastian Newberry</span>
                          <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">PRO</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">Oct 24 • Long-bias</span>
                      </div>
                    </div>
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20">
                      HIGH CONVICTION
                    </Badge>
                  </div>
                  <CardTitle className="mt-4 text-2xl font-heading group-hover:text-primary transition-colors">
                    The Bull Case for Palantir (PLTR): Why the Market is Wrong about AIP
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed line-clamp-3">
                    Most analysts are treating Palantir as just another consulting firm, ignoring the scalable economics of their new Artificial Intelligence Platform (AIP). Bootcamp conversions are accelerating...
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="secondary" className="font-mono text-xs">AI</Badge>
                    <Badge variant="secondary" className="font-mono text-xs">SaaS</Badge>
                    <Badge variant="secondary" className="font-mono text-xs">Defense</Badge>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 border-t border-border/50 p-4 bg-muted/20 flex justify-between items-center text-sm text-muted-foreground">
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1 hover:text-foreground transition-colors"><ThumbsUp className="w-4 h-4" /> 142</span>
                    <span className="flex items-center gap-1 hover:text-foreground transition-colors"><MessageSquare className="w-4 h-4" /> 38</span>
                  </div>
                  <div className="font-mono text-xs opacity-70">
                    Read 5 min
                  </div>
                </CardFooter>
              </Card>
            </Link>
          </div>
        </TabsContent>
        <TabsContent value="following">
          <Card className="text-center py-12">
            <CardContent>
              <UserGroupPlaceholder />
              <p className="text-muted-foreground mt-4">Follow creators to see their research here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="trending">
          <Card className="text-center py-12">
            <CardContent>
              <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Trending analysis coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UserGroupPlaceholder() {
  return (
    <div className="flex justify-center -space-x-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="w-12 h-12 rounded-full bg-muted border-4 border-background flex items-center justify-center text-muted-foreground">
          <Users className="w-5 h-5" />
        </div>
      ))}
    </div>
  )
}
