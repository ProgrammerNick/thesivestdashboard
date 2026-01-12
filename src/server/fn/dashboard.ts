import { createServerFn } from "@tanstack/react-start";
import { getCommunityPosts, getContributors } from "../features/contributors.server";

export const getDashboardData = createServerFn({ method: "GET" }).handler(async () => {
    const [posts, contributors] = await Promise.all([
        getCommunityPosts(10),
        getContributors()
    ]);
    return { posts, contributors: contributors.slice(0, 5) };
});
