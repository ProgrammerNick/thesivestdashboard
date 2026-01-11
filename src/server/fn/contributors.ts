/**
 * Shared Logic for Community Members and their Posts/Trades
 * This layer calls the data access layer to fetch data from the database
 */

import {
  getAllUsers,
  getUserById as getUserByIdDAL,
} from "../data-access/users";
import {
  getAllPosts,
  getPostById as getPostByIdDAL,
  getPostsByUserId,
  searchPosts,
} from "../data-access/posts";

export interface CommunityMember {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
  bio?: string;
  isClub?: boolean; // For school clubs
  clubName?: string;
  totalPosts: number;
  followers: number;
  following: number;
  verified?: boolean;
  joinedAt: string;
}

export interface UserPost {
  id: string;
  userId: string;
  type: "trade" | "thought" | "update"; // trade entry, general thought, or update on existing trade
  symbol?: string; // Required for trades
  title: string;
  content: string;
  buyPrice?: number; // For trades
  buyDate?: string; // For trades - formatted date string (e.g., "2h ago", "2024-01-15")
  currentPrice?: number; // Updated performance
  targetPrice?: number;
  stopLoss?: number;
  entryThoughts?: string; // Why they bought
  tags: string[];
  publishedAt: string; // Formatted date string (e.g., "3h ago", "2d ago")
  views: number;
  likes: number;
  comments: number;
  performance?: {
    returnPercent: number;
    returnAmount?: number;
    status: "active" | "win" | "loss" | "breakeven";
  };
}

// Helper function to format date for display
function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - d.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return d.toLocaleDateString();
}

// Helper function to convert DB post to UserPost interface
function dbPostToUserPost(dbPost: any): UserPost {
  return {
    id: dbPost.id,
    userId: dbPost.userId,
    type: dbPost.type,
    symbol: dbPost.symbol,
    title: dbPost.title,
    content: dbPost.content,
    buyPrice: dbPost.buyPrice ? Number(dbPost.buyPrice) : undefined,
    buyDate: dbPost.buyDate,
    currentPrice: dbPost.currentPrice ? Number(dbPost.currentPrice) : undefined,
    targetPrice: dbPost.targetPrice ? Number(dbPost.targetPrice) : undefined,
    stopLoss: dbPost.stopLoss ? Number(dbPost.stopLoss) : undefined,
    entryThoughts: dbPost.entryThoughts,
    tags: dbPost.tags || [],
    publishedAt: formatDate(dbPost.publishedAt),
    views: dbPost.views,
    likes: dbPost.likes,
    comments: dbPost.comments,
    performance: dbPost.performance
      ? {
        returnPercent: Number(dbPost.performance.returnPercent),
        returnAmount: dbPost.performance.returnAmount
          ? Number(dbPost.performance.returnAmount)
          : undefined,
        status: dbPost.performance.status,
      }
      : undefined,
  };
}

// Helper function to convert DB user to CommunityMember interface
function dbUserToCommunityMember(dbUser: any): CommunityMember {
  return {
    id: dbUser.id,
    name: dbUser.name,
    username: dbUser.username,
    avatar: dbUser.image,
    bio: dbUser.bio,
    isClub: dbUser.isClub,
    clubName: dbUser.clubName,
    verified: dbUser.verified,
    totalPosts: dbUser.totalPosts || 0,
    followers: dbUser.followersCount || 0,
    following: dbUser.followingCount || 0,
    joinedAt: formatDate(dbUser.createdAt),
  };
}

export async function getContributors(): Promise<CommunityMember[]> {
  console.log("Starting getContributors...");
  try {
    const users = await getAllUsers();
    console.log("getAllUsers result count:", users.length);
    return users.map(dbUserToCommunityMember);
  } catch (error) {
    console.error("Error in getContributors:", error);
    throw error;
  }
}

// Keep for backward compatibility but use new interface
export async function getContributorAnalyses(
  limit?: number
): Promise<UserPost[]> {
  const posts = await getAllPosts(limit);
  return posts.map(dbPostToUserPost);
}

export async function getContributorById(
  id: string
): Promise<CommunityMember | null> {
  const user = await getUserByIdDAL(id);
  return user ? dbUserToCommunityMember(user) : null;
}

export async function getAnalysesByContributor(
  userId: string
): Promise<UserPost[]> {
  const posts = await getPostsByUserId(userId);
  return posts.map(dbPostToUserPost);
}

// New functions for community posts
export async function getCommunityPosts(limit?: number): Promise<UserPost[]> {
  const posts = await getAllPosts(limit);
  return posts.map(dbPostToUserPost);
}

export async function getPostsByUser(userId: string): Promise<UserPost[]> {
  const posts = await getPostsByUserId(userId);
  return posts.map(dbPostToUserPost);
}

export async function getPostById(id: string): Promise<UserPost | null> {
  const post = await getPostByIdDAL(id);
  return post ? dbPostToUserPost(post) : null;
}

export async function searchCommunityPosts(query: string, limit?: number): Promise<UserPost[]> {
  const posts = await searchPosts(query, limit);
  return posts.map(dbPostToUserPost);
}
