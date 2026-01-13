import { createFileRoute, redirect, useLoaderData } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";
import { getUserProfile } from "@/server/fn/users";
import { getPortfolios } from "@/server/fn/portfolio";
import { getPostHistoryFn } from "@/server/fn/profile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { CreatorSettings } from "@/components/settings/CreatorSettings";

const getSettingsData = createServerFn({ method: "GET" }).handler(async () => {
  const request = getRequest();
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session || !session.user) {
    throw redirect({ to: "/login" });
  }

  const [userProfile, portfolios, posts] = await Promise.all([
    getUserProfile({ data: { userId: session.user.id } }),
    getPortfolios(),
    getPostHistoryFn({ data: { userId: session.user.id, limit: 100 } }),
  ]);

  return { user: userProfile, portfolios, posts };
});

export const Route = createFileRoute("/_dashboard/settings")({
  component: SettingsPage,
  loader: async () => {
    return getSettingsData();
  },
});

function SettingsPage() {
  const initialData = useLoaderData({ from: "/_dashboard/settings" });

  return (
    <div className="container max-w-4xl mx-auto py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-heading">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile settings and creator preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-background border-b border-border w-full justify-start rounded-none h-auto p-0 space-x-8">
          <TabsTrigger
            value="profile"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="creator"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3"
          >
            Creator
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="focus-visible:ring-0 focus-visible:outline-none">
          <ProfileSettings user={initialData.user} />
        </TabsContent>

        <TabsContent value="creator" className="focus-visible:ring-0 focus-visible:outline-none">
          <CreatorSettings user={initialData.user} portfolios={initialData.portfolios} posts={initialData.posts} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
