import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";
import { useLoaderData } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { redirect } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

// Server function to get current profile and posts
const getProfileData = createServerFn({ method: "GET" }).handler(async () => {
  const request = getRequest();
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session || !session.user) {
    throw redirect({ to: "/login" });
  }

  const { getPostsByUserId: getPostsByUserIdDA } = await import("@/server/data-access/posts");
  const posts = await getPostsByUserIdDA(session.user.id);

  return { user: session.user, posts };
});

export const Route = createFileRoute("/_dashboard/profile")({
  component: ProfilePage,
  loader: async () => {
    return getProfileData();
  },
});

function ProfilePage() {
  const { user, posts } = useLoaderData({ from: "/_dashboard/profile" });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-card rounded-xl border border-border shadow-sm">
        <Avatar className="w-24 h-24 border-4 border-background shadow-md">
          <AvatarImage src={user.image || undefined} alt={user.name} />
          <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 text-center md:text-left space-y-2">
          <h1 className="text-3xl font-bold font-heading">{user.name}</h1>
          <p className="text-muted-foreground">{user.email}</p>
          <div className="flex gap-2 justify-center md:justify-start">
            <Badge variant="secondary">Member</Badge>
            {posts.length > 0 && <Badge variant="outline">{posts.length} Posts</Badge>}
          </div>
        </div>
        <Button variant="outline">Edit Profile</Button>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList>
          <TabsTrigger value="posts">My Research</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="space-y-4 mt-4">
          <h2 className="text-xl font-bold">Your Contributions</h2>
          {posts.length === 0 ? (
            <p className="text-muted-foreground italic">You haven't posted any research yet.</p>
          ) : (
            <div className="grid gap-4">
              {posts.map((post) => (
                <Card key={post.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-lg">{post.title}</CardTitle>
                      <span className="text-xs text-muted-foreground">{format(new Date(post.publishedAt), 'MMM d, yyyy')}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="saved">
          <div className="py-12 text-center text-muted-foreground">
            Saved items feature coming soon.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
