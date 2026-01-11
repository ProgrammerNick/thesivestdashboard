import { createFileRoute } from "@tanstack/react-router";
import { getPost } from "@/server/fn/posts";
import { useLoaderData } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Calendar } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/post/$postId")({
  component: PostPage,
  loader: async ({ params }) => {
    const post = await getPost({ data: { id: params.postId } });
    if (!post) {
      throw new Error("Post not found");
    }
    return { post };
  },
});

function PostPage() {
  const { post } = useLoaderData({ from: "/_dashboard/post/$postId" });

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Button variant="ghost" className="mb-6 pl-0 hover:pl-2 transition-all" asChild>
        <Link to="/community">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Community
        </Link>
      </Button>

      <article className="space-y-8">
        {/* Header */}
        <header className="space-y-4 border-b pb-8">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Badge variant={post.type === 'trade' ? 'default' : 'secondary'}>
              {post.type.toUpperCase()}
            </Badge>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(post.publishedAt), 'MMMM d, yyyy')}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-heading font-bold leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 pt-2">
            <Avatar className="w-12 h-12 border-2 border-background shadow-sm">
              <AvatarImage src={post.user?.image || undefined} alt={post.user?.name} />
              <AvatarFallback>{post.user?.name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-foreground">{post.user?.name}</div>
              <div className="text-xs text-muted-foreground">Author</div>
            </div>
          </div>
        </header>

        {/* Trade Details Block */}
        {post.type === 'trade' && (
          <div className="bg-muted/30 border rounded-xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Symbol</span>
              <span className="text-2xl font-mono font-bold">{post.symbol}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Entry</span>
              <span className="text-xl font-mono">${post.buyPrice}</span>
            </div>
            {post.targetPrice && (
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Target</span>
                <span className="text-xl font-mono text-green-600">${post.targetPrice}</span>
              </div>
            )}
            {post.stopLoss && (
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Stop</span>
                <span className="text-xl font-mono text-red-600">${post.stopLoss}</span>
              </div>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-heading prose-img:rounded-xl">
          <ReactMarkdown>
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Footer / Engagement */}
        <div className="border-t pt-8 mt-12 flex justify-between items-center text-muted-foreground">
          <div>
            {post.tags?.map(tag => (
              <span key={tag} className="mr-2 text-sm italic">#{tag}</span>
            ))}
          </div>
          <div className="text-sm">
            {post.views} Views
          </div>
        </div>
      </article>
    </div>
  );
}
