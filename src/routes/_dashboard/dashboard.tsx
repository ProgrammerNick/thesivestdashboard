import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Zap, Newspaper, Users, UserPlus, Search } from "lucide-react";
import { Link, useLoaderData } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getCommunityPosts, getContributors } from "@/server/features/contributors";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const getDashboardData = createServerFn({ method: "GET" }).handler(async () => {
    const [posts, contributors] = await Promise.all([
        getCommunityPosts(10),
        getContributors()
    ]);
    return { posts, contributors: contributors.slice(0, 5) };
});

export const Route = createFileRoute("/_dashboard/dashboard")({
    component: DashboardHome,
    loader: async () => await getDashboardData(),
});

function DashboardHome() {
    const { posts, contributors } = useLoaderData({ from: "/_dashboard/dashboard" });

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-6 md:p-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold">Market Overview</h1>
                    <p className="text-muted-foreground mt-1">Welcome back. Here's your daily briefing.</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/funds">
                        <Button>
                            <TrendingUp className="w-4 h-4 mr-2" /> New Analysis
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-primary/10 via-card to-card border-primary/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-primary uppercase tracking-wider">Portfolio Alpha</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-heading font-bold">+0.0%</div>
                        <p className="text-xs text-muted-foreground mt-1">Start tracking to see metrics</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-heading font-bold">0</div>
                        <p className="text-xs text-muted-foreground mt-1">No active alerts</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Watchlist Movers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-heading font-bold text-muted-foreground">--</div>
                        <p className="text-xs text-muted-foreground mt-1">Add stocks to watchlist</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" /> Recent Insights
                    </h2>

                    {posts.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                <Search className="w-12 h-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-bold mb-2">No Research Found</h3>
                                <p className="text-muted-foreground max-w-sm mb-6">
                                    Be the first to share your investment thesis or join a tournament to compete.
                                </p>
                                <div className="flex gap-3">
                                    <Link to="/funds">
                                        <Button>Post Research</Button>
                                    </Link>
                                    <Link to="/tournaments">
                                        <Button variant="outline">Join Tournament</Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {posts.map((post) => (
                                <Link key={post.id} to="/posts/$id" params={{ id: post.id }}>
                                    <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge variant="secondary" className="text-xs font-normal">
                                                            {post.type}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground">{post.publishedAt}</span>
                                                    </div>
                                                    <h3 className="text-lg font-bold mb-1">{post.title}</h3>
                                                    <p className="text-muted-foreground text-sm line-clamp-2">
                                                        {post.content}
                                                    </p>
                                                </div>
                                                {post.performance && (
                                                    <div className={`text-sm font-bold ${post.performance.status === 'win' ? 'text-green-500' :
                                                        post.performance.status === 'loss' ? 'text-red-500' : 'text-muted-foreground'
                                                        }`}>
                                                        {post.performance.returnPercent > 0 ? '+' : ''}{post.performance.returnPercent}%
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Sidebar */}
                <div className="space-y-8">
                    {/* Discover / Suggested Users */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-500" /> Discover
                            </h2>
                            <Link to="/contributors" className="text-xs text-primary hover:underline">View All</Link>
                        </div>
                        <Card>
                            <CardContent className="p-0">
                                <div className="divide-y divide-border">
                                    {contributors.map((user) => (
                                        <div key={user.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={user.avatar} />
                                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="text-sm font-medium leading-none">{user.name}</div>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {user.totalPosts} posts
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                <UserPlus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {contributors.length === 0 && (
                                        <div className="p-4 text-center text-sm text-muted-foreground">
                                            No users found to follow nearby.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Followers / Your Network (Placeholder/Implementation) */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Newspaper className="w-5 h-5 text-purple-500" /> Your Network
                        </h2>
                        <Card className="bg-muted/20">
                            <CardContent className="p-6 text-center space-y-3">
                                <div className="mx-auto w-10 h-10 rounded-full bg-background flex items-center justify-center border border-border">
                                    <Users className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Connect with others</p>
                                    <p className="text-xs text-muted-foreground mt-1">Follow investors to see their activity here.</p>
                                </div>
                                <Button variant="outline" size="sm" className="w-full">Find People</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
