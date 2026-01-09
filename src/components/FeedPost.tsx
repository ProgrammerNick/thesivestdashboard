import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"; // Assuming these exist or I'll use standard img
import { MessageSquare, Heart, Share2, TrendingUp, TrendingDown, MoreHorizontal } from "lucide-react";
import type { UserPost, CommunityMember } from "../server/features/contributors";
import { Link } from "@tanstack/react-router";

interface FeedPostProps {
    post: UserPost;
    author: CommunityMember;
}

export function FeedPost({ post, author }: FeedPostProps) {
    const isTrade = post.type === 'trade';
    const isUpdate = post.type === 'update';

    const getReturnColor = (percent: number) => {
        if (percent > 0) return "text-green-600 dark:text-green-400";
        if (percent < 0) return "text-red-600 dark:text-red-400";
        return "text-muted-foreground";
    };

    return (
        <Card className="mb-6 border-border/60 hover:border-primary/20 transition-all bg-card/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
                <div className="flex gap-3">
                    <Link to={`/profiles/${author.id}`} className="relative group">
                        <div className="w-10 h-10 rounded-full bg-muted overflow-hidden border border-border group-hover:border-primary/50 transition-colors">
                            {author.avatar ? (
                                <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold">
                                    {author.name.charAt(0)}
                                </div>
                            )}
                        </div>
                    </Link>

                    <div>
                        <div className="flex items-center gap-2">
                            <Link to={`/profiles/${author.id}`} className="font-semibold text-foreground hover:underline decoration-primary/50 underline-offset-4">
                                {author.name}
                            </Link>
                            {author.verified && <span className="text-blue-500 text-[10px]">✓</span>}
                            <span className="text-muted-foreground text-xs">• {post.publishedAt}</span>
                        </div>
                        {author.clubName && (
                            <div className="text-xs text-muted-foreground/80">{author.clubName}</div>
                        )}
                    </div>
                </div>

                <button className="text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            </CardHeader>

            <CardContent className="pb-4">
                {/* Chips / Type Indicators */}
                <div className="flex gap-2 mb-3">
                    <Badge variant={isTrade ? "default" : "secondary"} className={`text-xs ${isTrade ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20' : ''}`}>
                        {post.type.toUpperCase()}
                    </Badge>
                    {post.symbol && (
                        <Badge variant="outline" className="text-xs font-medium tabular-nums">
                            ${post.symbol}
                        </Badge>
                    )}
                    {post.performance && (
                        <Badge variant="outline" className={`text-xs font-medium tabular-nums border-transparent bg-muted/30 ${getReturnColor(post.performance.returnPercent)}`}>
                            {post.performance.returnPercent > 0 ? '+' : ''}{post.performance.returnPercent}%
                        </Badge>
                    )}
                </div>

                <h3 className="text-lg font-bold mb-2 text-foreground">{post.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line mb-4">
                    {post.content}
                </p>

                {/* Trade Details Box */}
                {isTrade && (
                    <div className="bg-muted/30 rounded-lg p-3 mb-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium tabular-nums border border-border/50">
                        <div className="flex flex-col">
                            <span className="text-muted-foreground">Entry</span>
                            <span className="font-medium">${post.buyPrice?.toFixed(2)}</span>
                        </div>
                        {post.targetPrice && (
                            <div className="flex flex-col">
                                <span className="text-muted-foreground">Target</span>
                                <span className="font-medium text-green-600">${post.targetPrice.toFixed(2)}</span>
                            </div>
                        )}
                        {post.stopLoss && (
                            <div className="flex flex-col">
                                <span className="text-muted-foreground">Stop</span>
                                <span className="font-medium text-red-600">${post.stopLoss.toFixed(2)}</span>
                            </div>
                        )}
                        {post.entryThoughts && (
                            <div className="col-span-2 md:col-span-4 mt-2 pt-2 border-t border-border/50">
                                <span className="text-muted-foreground block mb-1">Thesis</span>
                                <span className="italic text-foreground/80">"{post.entryThoughts}"</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between text-muted-foreground text-sm pt-4 border-t border-border/40">
                    <button className="flex items-center gap-1 hover:text-primary transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.comments}</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                        <Heart className="w-4 h-4" />
                        <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>

            </CardContent>
        </Card>
    );
}
