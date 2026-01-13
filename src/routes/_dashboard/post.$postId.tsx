import { createFileRoute } from "@tanstack/react-router";
import { getPost } from "@/server/fn/posts";
import { useLoaderData } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
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

// Helper to render Tiptap JSON as React elements
function renderTiptapContent(content: string) {
  try {
    const doc = JSON.parse(content);
    if (doc.type === 'doc' && doc.content) {
      return doc.content.map((node: any, i: number) => renderNode(node, i));
    }
    // If it's not valid Tiptap JSON, just return as text
    return <p>{content}</p>;
  } catch {
    // Not JSON, return as plain text
    return <p>{content}</p>;
  }
}

function renderNode(node: any, key: number): React.ReactNode {
  switch (node.type) {
    case 'paragraph':
      if (!node.content) return <p key={key} className="mb-4">&nbsp;</p>;
      return (
        <p key={key} className="mb-4 leading-relaxed">
          {node.content.map((c: any, i: number) => renderInline(c, i))}
        </p>
      );
    case 'heading':
      const level = node.attrs?.level || 1;
      const headingClasses: Record<number, string> = {
        1: 'text-3xl font-bold mb-4 mt-8',
        2: 'text-2xl font-bold mb-3 mt-6',
        3: 'text-xl font-semibold mb-3 mt-5',
        4: 'text-lg font-semibold mb-2 mt-4',
        5: 'text-base font-semibold mb-2 mt-3',
      };
      const headingContent = node.content?.map((c: any, i: number) => renderInline(c, i));
      const className = headingClasses[level] || headingClasses[1];
      if (level === 1) return <h1 key={key} className={className}>{headingContent}</h1>;
      if (level === 2) return <h2 key={key} className={className}>{headingContent}</h2>;
      if (level === 3) return <h3 key={key} className={className}>{headingContent}</h3>;
      if (level === 4) return <h4 key={key} className={className}>{headingContent}</h4>;
      return <h5 key={key} className={className}>{headingContent}</h5>;
    case 'bulletList':
      return (
        <ul key={key} className="list-disc list-inside mb-4 space-y-1">
          {node.content?.map((item: any, i: number) => renderNode(item, i))}
        </ul>
      );
    case 'orderedList':
      return (
        <ol key={key} className="list-decimal list-inside mb-4 space-y-1">
          {node.content?.map((item: any, i: number) => renderNode(item, i))}
        </ol>
      );
    case 'listItem':
      return (
        <li key={key}>
          {node.content?.map((c: any, i: number) => {
            if (c.type === 'paragraph') {
              return c.content?.map((t: any, j: number) => renderInline(t, j));
            }
            return renderNode(c, i);
          })}
        </li>
      );
    case 'blockquote':
      return (
        <blockquote key={key} className="border-l-4 border-primary/50 pl-4 italic my-4 text-muted-foreground">
          {node.content?.map((c: any, i: number) => renderNode(c, i))}
        </blockquote>
      );
    case 'codeBlock':
      return (
        <pre key={key} className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">
          <code>{node.content?.map((c: any) => c.text).join('')}</code>
        </pre>
      );
    case 'horizontalRule':
      return <hr key={key} className="my-8 border-border" />;
    default:
      return null;
  }
}

function renderInline(node: any, key: number): React.ReactNode {
  if (node.type === 'text') {
    let content: React.ReactNode = node.text;

    if (node.marks) {
      for (const mark of node.marks) {
        switch (mark.type) {
          case 'bold':
            content = <strong key={key}>{content}</strong>;
            break;
          case 'italic':
            content = <em key={key}>{content}</em>;
            break;
          case 'underline':
            content = <u key={key}>{content}</u>;
            break;
          case 'link':
            content = (
              <a key={key} href={mark.attrs?.href} className="text-primary underline hover:no-underline" target="_blank" rel="noopener noreferrer">
                {content}
              </a>
            );
            break;
          case 'code':
            content = <code key={key} className="bg-muted px-1.5 py-0.5 rounded text-sm">{content}</code>;
            break;
        }
      }
    }
    return <span key={key}>{content}</span>;
  }
  return null;
}

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
              {post.type === 'thought' ? 'THESIS' : post.type.toUpperCase()}
            </Badge>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {post.publishedAt && format(new Date(post.publishedAt), 'MMMM d, yyyy')}
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
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {renderTiptapContent(post.content)}
        </div>

        {/* Footer / Engagement */}
        <div className="border-t pt-8 mt-12 flex justify-between items-center text-muted-foreground">
          <div>
            {post.symbol && <span className="text-sm font-mono text-primary">{post.symbol}</span>}
          </div>
          <div className="text-sm">
            {post.views} Views
          </div>
        </div>
      </article>
    </div>
  );
}

