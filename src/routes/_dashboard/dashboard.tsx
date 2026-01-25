import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ChevronRight } from "lucide-react";
import { Link, useLoaderData } from "@tanstack/react-router";
import { getDashboardData } from "@/server/fn/dashboard";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_dashboard/dashboard")({
    component: DashboardHome,
    loader: async () => {
        const dashboardData = await getDashboardData();
        // Chat sessions require auth - will be fetched client-side or via parent layout
        return { ...dashboardData, chatSessions: [] as any[] };
    },
});


// Helper to parse Tiptap JSON and get text preview
const getContentPreview = (content: string) => {
    try {
        const doc = JSON.parse(content);
        if (doc.type === 'doc' && doc.content) {
            return doc.content
                .filter((node: any) => node.type === 'paragraph' && node.content)
                .map((node: any) => node.content.map((c: any) => c.text || '').join(''))
                .join(' ')
                .slice(0, 100);
        }
        return content.slice(0, 100);
    } catch {
        return content.slice(0, 100);
    }
};

function DashboardHome() {
    const { posts, chatSessions } = useLoaderData({ from: "/_dashboard/dashboard" });

    return (
        <div className="space-y-8 max-w-6xl mx-auto p-6 md:p-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold">Welcome Back</h1>
                    <p className="text-muted-foreground mt-1">Here's what's happening in your research community.</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/research">
                        <Button>
                            Write Research
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Feed - Trending Research */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">
                            Trending Research
                        </h2>
                        <Link to="/community">
                            <Button variant="ghost" size="sm">
                                View All <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                    </div>

                    {posts.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                <h3 className="text-lg font-bold mb-2">No Research Yet</h3>
                                <p className="text-muted-foreground max-w-sm mb-6">
                                    Be the first to share your investment thesis with the community.
                                </p>
                                <Link to="/research">
                                    <Button>Post Research</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {posts.slice(0, 5).map((post) => (
                                <Link key={post.id} to="/post/$postId" params={{ postId: post.id }}>
                                    <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className="text-xs font-normal">
                                                        {post.type === 'thought' ? 'Thesis' : post.type}
                                                    </Badge>
                                                    <CardDescription className="text-xs">
                                                        {post.publishedAt}
                                                    </CardDescription>
                                                </div>
                                                {post.performance && (
                                                    <Badge variant={post.performance.status === 'win' ? 'default' : 'destructive'} className="text-xs font-bold">
                                                        {post.performance.returnPercent > 0 ? '+' : ''}{post.performance.returnPercent}%
                                                    </Badge>
                                                )}
                                            </div>
                                            <CardTitle className="text-lg group-hover:text-primary transition-colors mt-2">{post.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-muted-foreground text-sm line-clamp-2">
                                                {getContentPreview(post.content)}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Sidebar - Recent AI Chats */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">
                            Recent Chats
                        </h2>
                    </div>

                    <Card>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border">
                                {chatSessions.length === 0 ? (
                                    <div className="p-6 text-center">
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Start analyzing stocks and funds with AI
                                        </p>
                                        <div className="flex flex-col gap-2">
                                            <Link to="/stocks">
                                                <Button variant="outline" size="sm" className="w-full">
                                                    Stock Research
                                                </Button>
                                            </Link>
                                            <Link to="/fund-intelligence">
                                                <Button variant="outline" size="sm" className="w-full">
                                                    Fund Intelligence
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    chatSessions.slice(0, 5).map((session) => (
                                        <Link
                                            key={session.id}
                                            to={session.sessionType === 'fund' ? '/fund-intelligence' : '/stocks'}
                                            className="block"
                                        >
                                            <div className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge variant="outline" className="text-xs">
                                                                {session.sessionType === 'fund' ? 'Fund' : 'Stock'}
                                                            </Badge>
                                                            {session.ticker && (
                                                                <span className="text-xs font-mono text-primary font-medium">
                                                                    {session.ticker}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm font-medium truncate">
                                                            {session.title || `${session.ticker} Analysis`}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center text-xs text-muted-foreground">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="bg-gradient-to-br from-primary/5 to-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Link to="/stocks" className="block">
                                <Button variant="ghost" className="w-full justify-start" size="sm">
                                    Research a Stock
                                </Button>
                            </Link>
                            <Link to="/fund-intelligence" className="block">
                                <Button variant="ghost" className="w-full justify-start" size="sm">
                                    Analyze a Fund
                                </Button>
                            </Link>
                            <Link to="/community" className="block">
                                <Button variant="ghost" className="w-full justify-start" size="sm">
                                    Browse Community
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

