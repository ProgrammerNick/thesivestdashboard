/**
 * Shared Logic for Thesivest (Under the Radar Stacks)
 * This lives on the server and is called by both the Public API and the App Loader.
 * Uses the data access layer to fetch data from the database.
 */

import { getAllPosts, getPostsByType } from "../data-access/posts";

export interface Thesis {
    id: string;
    title: string;
    symbol: string;
    price: number;
    marketCap: string;
    catalyst: string;
    conviction: "High" | "Medium" | "Low";
    description: string;
    postedAt: string;
}

// Helper function to format date for display
function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return d.toLocaleDateString();
}

/**
 * Get under the radar theses (trade posts from the database)
 * Returns trade posts formatted as Thesis interface
 */
export async function getUnderRadarTheses(): Promise<Thesis[]> {
    // Fetch trade posts from database
    const tradePosts = await getPostsByType("trade");

    // Convert trade posts to Thesis format
    return tradePosts.map((post) => ({
        id: post.id,
        title: post.title,
        symbol: post.symbol || "UNKNOWN",
        price: post.buyPrice ? Number(post.buyPrice) : 0,
        marketCap: "N/A", // Market cap would need to be fetched from external data source
        catalyst: post.targetPrice ? `Target: $${post.targetPrice}` : "Investment opportunity",
        conviction: post.stopLoss ? "High" : "Medium",
        description: post.content,
        postedAt: formatDate(post.publishedAt),
    }));
}
