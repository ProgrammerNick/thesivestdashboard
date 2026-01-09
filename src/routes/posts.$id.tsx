import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  getContributorById,
  getPostById,
  type UserPost,
} from "../server/features/contributors";
import { useLoaderData } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Target,
  TrendingUp,
  Eye,
  Heart,
  Clock,
  Tag,
  FileText,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Link } from "@tanstack/react-router";

// Server Function to get post details
const getPostFn = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      id: z.string(),
    })
  )
  .handler(async ({ data }) => {
    const post = await getPostById(data.id);

    if (!post) {
      throw new Error("Post not found");
    }

    const member = await getContributorById(post.userId);

    return { post, member };
  });

export const Route = createFileRoute("/posts/$id")({
  component: PostDetailPage,
  loader: async ({ params }) => {
    const { id } = params;
    return await getPostFn({ data: { id } });
  },
});

function PostDetailPage() {
  const { post, member } = useLoaderData({ from: "/posts/$id" });

  if (!member) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="mb-8">
            <Link to="/">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
          <Card className="bg-card/50 backdrop-blur-xl border-border">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Member not found
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getTypeColor = (type: UserPost["type"]) => {
    switch (type) {
      case "trade":
        return "bg-primary/10 text-primary border-primary/20";
      case "thought":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "update":
        return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const formatReturn = (returnPercent?: number, status?: string) => {
    if (!returnPercent) return null;
    const sign = returnPercent >= 0 ? "+" : "";
    const color =
      status === "win"
        ? "text-green-600"
        : status === "loss"
        ? "text-red-600"
        : "text-muted-foreground";
    return (
      <span className={color}>
        {sign}
        {returnPercent.toFixed(2)}%
      </span>
    );
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="mb-8">
            <Link to="/">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
          <Card className="bg-card/50 backdrop-blur-xl border-border">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Post not found
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <Card className="bg-card/50 backdrop-blur-xl border-border">
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <Badge variant="outline" className={getTypeColor(post.type)}>
                {post.type === "trade"
                  ? "Trade"
                  : post.type === "thought"
                  ? "Thought"
                  : "Update"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {post.publishedAt}
              </span>
            </div>
            <CardTitle className="text-2xl mb-2">{post.title}</CardTitle>
            {post.symbol && (
              <div className="mb-4">
                <Badge
                  variant="outline"
                  className="bg-secondary/10 text-secondary-foreground border-secondary/20"
                >
                  {post.symbol}
                </Badge>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Author Info */}
              <div className="flex items-center gap-4 pb-6 border-b border-border/50">
                <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-xl font-bold text-primary">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-lg">
                    {member.isClub ? member.clubName : member.name}
                  </div>
                  {member.username && (
                    <div className="text-muted-foreground">
                      @{member.username}
                    </div>
                  )}
                  {member.isClub && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      Club
                    </Badge>
                  )}
                </div>
              </div>

              {/* Post Content */}
              <div className="prose max-w-none">
                <p className="text-lg leading-relaxed mb-6">{post.content}</p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Trade Details */}
              {post.type === "trade" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="grid md:grid-cols-2 gap-6 p-6 bg-muted/20 rounded-lg border border-border/50"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-semibold">Entry Price:</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      ${post.buyPrice?.toFixed(2)}
                    </div>
                  </div>

                  {post.currentPrice && (
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold">Current Price:</span>
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        ${post.currentPrice.toFixed(2)}
                      </div>
                    </div>
                  )}

                  {post.targetPrice && (
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                        <Target className="w-4 h-4" />
                        <span className="font-semibold">Target Price:</span>
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        ${post.targetPrice.toFixed(2)}
                      </div>
                    </div>
                  )}

                  {post.stopLoss && (
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                        <TrendingUp className="w-4 h-4 rotate-180" />
                        <span className="font-semibold">Stop Loss:</span>
                      </div>
                      <div className="text-2xl font-bold text-red-600">
                        ${post.stopLoss.toFixed(2)}
                      </div>
                    </div>
                  )}

                  {post.entryThoughts && (
                    <div className="md:col-span-2">
                      <div className="flex items-start gap-2 mb-2 text-sm font-semibold text-muted-foreground">
                        <FileText className="w-4 h-4 shrink-0" />
                        <span>Entry Thoughts</span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">
                        {post.entryThoughts}
                      </p>
                    </div>
                  )}

                  {post.performance && (
                    <div className="md:col-span-2 mt-4 pt-4 border-t border-border/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-primary" />
                          <span className="font-semibold text-lg">
                            Performance:
                          </span>
                        </div>
                        {formatReturn(
                          post.performance.returnPercent,
                          post.performance.status
                        )}
                      </div>
                      {post.performance.status === "active" && (
                        <div className="mt-2">
                          <Badge
                            variant="outline"
                            className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"
                          >
                            Active Position
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Thought/Update Details */}
              {(post.type === "thought" || post.type === "update") && (
                <div className="p-6 bg-muted/20 rounded-lg border border-border/50">
                  <div className="flex items-start gap-2 mb-2 text-sm font-semibold text-muted-foreground">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>
                      Published {post.type === "thought" ? "on" : "at"}{" "}
                      {post.publishedAt}
                    </span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {post.type === "thought"
                      ? "This is an investment thought or analysis shared by an investor."
                      : "This is an update to a previously shared trade position."}
                  </p>
                </div>
              )}

              {/* Metadata */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-border/50">
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{post.views}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{post.comments} comments</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
