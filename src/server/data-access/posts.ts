/**
 * Data Access Layer for Posts
 * Handles all database queries related to posts, trade performance, tags, and engagement
 */

import { db } from "../../db/index";
import { post, postTag, tag, tradePerformance, user } from "../../db/schema";
import { eq, desc, sql, like, or } from "drizzle-orm";

export interface PostWithDetails {
  id: string;
  userId: string;
  type: "trade" | "thought" | "update";
  symbol?: string;
  title: string;
  content: string;
  buyPrice?: number;
  buyDate?: Date;
  currentPrice?: number;
  targetPrice?: number;
  stopLoss?: number;
  entryThoughts?: string;
  publishedAt: Date;
  updatedAt: Date;
  views: number;
  likes: number;
  comments: number;
  tags: string[];
  user?: {
    id: string;
    name: string;
    username?: string;
    image?: string;
    bio?: string;
    isClub?: boolean;
    clubName?: string;
    verified?: boolean;
  };
  performance?: {
    returnPercent: number;
    returnAmount?: number;
    status: "active" | "win" | "loss" | "breakeven";
  };
}

// Type for post query result
type PostQueryResult = {
  id: string;
  userId: string;
  type: string;
  symbol: string | null;
  title: string;
  content: string;
  buyPrice: string | null;
  buyDate: Date | null;
  currentPrice: string | null;
  targetPrice: string | null;
  stopLoss: string | null;
  entryThoughts: string | null;
  publishedAt: Date;
  updatedAt: Date;
  views: number;
  likes: number;
  comments: number;
};

// Type for tag query result
type TagQueryResult = {
  name: string;
};

// Type for user query result
type UserQueryResult = {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
  bio: string | null;
  isClub: boolean | null;
  clubName: string | null;
  verified: boolean | null;
};

// Type for performance query result
type PerformanceQueryResult = {
  returnPercent: string;
  returnAmount: string | null;
  status: string;
};

/**
 * Helper function to convert database post result to PostWithDetails
 */
function convertPostToPostWithDetails(
  post: PostQueryResult,
  tags: string[],
  user?: UserQueryResult,
  performance?: PerformanceQueryResult
): PostWithDetails {
  return {
    id: post.id,
    userId: post.userId,
    type: post.type as "trade" | "thought" | "update",
    symbol: post.symbol || undefined,
    title: post.title,
    content: post.content,
    buyPrice: post.buyPrice ? Number(post.buyPrice) : undefined,
    buyDate: post.buyDate || undefined,
    currentPrice: post.currentPrice ? Number(post.currentPrice) : undefined,
    targetPrice: post.targetPrice ? Number(post.targetPrice) : undefined,
    stopLoss: post.stopLoss ? Number(post.stopLoss) : undefined,
    entryThoughts: post.entryThoughts || undefined,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    views: post.views,
    likes: post.likes,
    comments: post.comments,
    tags,
    user: user
      ? {
        id: user.id,
        name: user.name,
        username: user.username || undefined,
        image: user.image || undefined,
        bio: user.bio || undefined,
        isClub: user.isClub || undefined,
        clubName: user.clubName || undefined,
        verified: user.verified || undefined,
      }
      : undefined,
    performance: performance
      ? {
        returnPercent: Number(performance.returnPercent),
        returnAmount: performance.returnAmount
          ? Number(performance.returnAmount)
          : undefined,
        status: performance.status as "active" | "win" | "loss" | "breakeven",
      }
      : undefined,
  };
}

/**
 * Get all posts with optional limit
 */
export async function getAllPosts(limit?: number): Promise<PostWithDetails[]> {
  let query = db
    .select({
      id: post.id,
      userId: post.userId,
      type: post.type,
      symbol: post.symbol,
      title: post.title,
      content: post.content,
      buyPrice: post.buyPrice,
      buyDate: post.buyDate,
      currentPrice: post.currentPrice,
      targetPrice: post.targetPrice,
      stopLoss: post.stopLoss,
      entryThoughts: post.entryThoughts,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      views: post.views,
      likes: post.likes,
      comments: post.comments,
    })
    .from(post)
    .orderBy(desc(post.publishedAt));

  if (limit) {
    (query as any).limit(limit);
  }

  const posts = (await query) as PostQueryResult[];

  // Get tags for each post
  const postsWithTags = await Promise.all(
    posts.map(async (p: PostQueryResult) => {
      const tagsResult = await db
        .select({ name: tag.name })
        .from(tag)
        .innerJoin(postTag, eq(postTag.tagId, tag.id))
        .where(eq(postTag.postId, p.id));

      return convertPostToPostWithDetails(
        p,
        tagsResult.map((t: TagQueryResult) => t.name)
      );
    })
  );

  return postsWithTags;
}

/**
 * Get post by ID with all details
 */
export async function getPostById(id: string): Promise<PostWithDetails | null> {
  const query = db
    .select({
      id: post.id,
      userId: post.userId,
      type: post.type,
      symbol: post.symbol,
      title: post.title,
      content: post.content,
      buyPrice: post.buyPrice,
      buyDate: post.buyDate,
      currentPrice: post.currentPrice,
      targetPrice: post.targetPrice,
      stopLoss: post.stopLoss,
      entryThoughts: post.entryThoughts,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      views: post.views,
      likes: post.likes,
      comments: post.comments,
    })
    .from(post)
    .where(eq(post.id, id)) as any;

  const posts = await (query as any).limit(1);

  if (posts.length === 0) return null;

  const postData = posts[0] as PostQueryResult;

  // Get tags
  const tagsResult = await db
    .select({ name: tag.name })
    .from(tag)
    .innerJoin(postTag, eq(postTag.tagId, tag.id))
    .where(eq(postTag.postId, id));

  // Get user info
  const usersQuery = db
    .select({
      id: user.id,
      name: user.name,
      username: user.displayName,
      image: user.image,
      bio: user.bio,
      isClub: user.isClub,
      clubName: user.clubName,
      verified: user.verified,
    })
    .from(user)
    .where(eq(user.id, postData.userId));

  const usersResult = await (usersQuery as any).limit(1);

  // Get performance if it's a trade
  let performance = undefined;
  if (postData.type === "trade") {
    const performanceQuery = db
      .select({
        returnPercent: tradePerformance.returnPercent,
        returnAmount: tradePerformance.returnAmount,
        status: tradePerformance.status,
      })
      .from(tradePerformance)
      .where(eq(tradePerformance.postId, id)) as any;

    const performances = await (performanceQuery as any).limit(1);

    if (performances.length > 0) {
      performance = performances[0] as PerformanceQueryResult;
    }
  }

  return convertPostToPostWithDetails(
    postData,
    tagsResult.map((t: TagQueryResult) => t.name),
    usersResult[0] as UserQueryResult,
    performance
  );
}

/**
 * Get posts by user ID
 */
export async function getPostsByUserId(
  userId: string
): Promise<PostWithDetails[]> {
  const posts = await db
    .select({
      id: post.id,
      userId: post.userId,
      type: post.type,
      symbol: post.symbol,
      title: post.title,
      content: post.content,
      buyPrice: post.buyPrice,
      buyDate: post.buyDate,
      currentPrice: post.currentPrice,
      targetPrice: post.targetPrice,
      stopLoss: post.stopLoss,
      entryThoughts: post.entryThoughts,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      views: post.views,
      likes: post.likes,
      comments: post.comments,
    })
    .from(post)
    .where(eq(post.userId, userId))
    .orderBy(desc(post.publishedAt));

  const typedPosts = posts as PostQueryResult[];

  // Get tags for each post
  const postsWithTags = await Promise.all(
    typedPosts.map(async (p: PostQueryResult) => {
      const tagsResult = await db
        .select({ name: tag.name })
        .from(tag)
        .innerJoin(postTag, eq(postTag.tagId, tag.id))
        .where(eq(postTag.postId, p.id));

      return convertPostToPostWithDetails(
        p,
        tagsResult.map((t: TagQueryResult) => t.name)
      );
    })
  );

  return postsWithTags;
}

/**
 * Get posts by type (trade, thought, update)
 */
export async function getPostsByType(
  type: "trade" | "thought" | "update",
  limit?: number
): Promise<PostWithDetails[]> {
  let query = db
    .select({
      id: post.id,
      userId: post.userId,
      type: post.type,
      symbol: post.symbol,
      title: post.title,
      content: post.content,
      buyPrice: post.buyPrice,
      buyDate: post.buyDate,
      currentPrice: post.currentPrice,
      targetPrice: post.targetPrice,
      stopLoss: post.stopLoss,
      entryThoughts: post.entryThoughts,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      views: post.views,
      likes: post.likes,
      comments: post.comments,
    })
    .from(post)
    .where(eq(post.type, type))
    .orderBy(desc(post.publishedAt));

  if (limit) {
    (query as any).limit(limit);
  }

  const posts = (await query) as PostQueryResult[];

  // Get tags for each post
  const postsWithTags = await Promise.all(
    posts.map(async (p: PostQueryResult) => {
      const tagsResult = await db
        .select({ name: tag.name })
        .from(tag)
        .innerJoin(postTag, eq(postTag.tagId, tag.id))
        .where(eq(postTag.postId, p.id));

      return convertPostToPostWithDetails(
        p,
        tagsResult.map((t: TagQueryResult) => t.name)
      );
    })
  );

  return postsWithTags;
}

/**
 * Get posts by symbol
 */
export async function getPostsBySymbol(
  symbol: string
): Promise<PostWithDetails[]> {
  const posts = await db
    .select({
      id: post.id,
      userId: post.userId,
      type: post.type,
      symbol: post.symbol,
      title: post.title,
      content: post.content,
      buyPrice: post.buyPrice,
      buyDate: post.buyDate,
      currentPrice: post.currentPrice,
      targetPrice: post.targetPrice,
      stopLoss: post.stopLoss,
      entryThoughts: post.entryThoughts,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      views: post.views,
      likes: post.likes,
      comments: post.comments,
    })
    .from(post)
    .where(eq(post.symbol, symbol))
    .orderBy(desc(post.publishedAt));

  const typedPosts = posts as PostQueryResult[];

  // Get tags for each post
  const postsWithTags = await Promise.all(
    typedPosts.map(async (p: PostQueryResult) => {
      const tagsResult = await db
        .select({ name: tag.name })
        .from(tag)
        .innerJoin(postTag, eq(postTag.tagId, tag.id))
        .where(eq(postTag.postId, p.id));

      return convertPostToPostWithDetails(
        p,
        tagsResult.map((t: TagQueryResult) => t.name)
      );
    })
  );

  return postsWithTags;
}

/**
 * Increment post view count
 */
export async function incrementPostViews(id: string): Promise<void> {
  await db
    .update(post)
    .set({ views: sql`${post.views} + 1` })
    .where(eq(post.id, id));
}

/**
 * Get trade performance for a post
 */
export async function getTradePerformance(postId: string) {
  const performance = (await db
    .select()
    .from(tradePerformance)
    .where(eq(tradePerformance.postId, postId))) as any;

  const result = await (performance as any).limit(1);

  return result[0] || null;
}

/**
 * Update trade performance
 */
export async function updateTradePerformance(
  postId: string,
  data: {
    currentPrice: number;
    returnPercent: number;
    returnAmount?: number;
    status: "active" | "win" | "loss" | "breakeven";
  }
) {
  await db
    .update(tradePerformance)
    .set({
      currentPrice: String(data.currentPrice),
      returnPercent: String(data.returnPercent),
      returnAmount: data.returnAmount ? String(data.returnAmount) : null,
      status: data.status,
      updatedAt: new Date(),
    })
    .where(eq(tradePerformance.postId, postId));
}

/**
 * Search posts by title, content, or symbol
 */
export async function searchPosts(
  queryStr: string,
  limit: number = 20
): Promise<PostWithDetails[]> {
  const searchPattern = `%${queryStr}%`;

  let query = db
    .select({
      id: post.id,
      userId: post.userId,
      type: post.type,
      symbol: post.symbol,
      title: post.title,
      content: post.content,
      buyPrice: post.buyPrice,
      buyDate: post.buyDate,
      currentPrice: post.currentPrice,
      targetPrice: post.targetPrice,
      stopLoss: post.stopLoss,
      entryThoughts: post.entryThoughts,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      views: post.views,
      likes: post.likes,
      comments: post.comments,
    })
    .from(post)
    .where(
      or(
        like(post.title, searchPattern),
        like(post.content, searchPattern),
        like(post.symbol, searchPattern)
      )
    )
    .orderBy(desc(post.publishedAt));

  (query as any).limit(limit);

  const posts = (await query) as PostQueryResult[];

  // Get tags for each post
  const postsWithTags = await Promise.all(
    posts.map(async (p: PostQueryResult) => {
      const tagsResult = await db
        .select({ name: tag.name })
        .from(tag)
        .innerJoin(postTag, eq(postTag.tagId, tag.id))
        .where(eq(postTag.postId, p.id));

      const usersQuery = db
        .select({
          id: user.id,
          name: user.name,
          username: user.displayName,
          image: user.image,
          bio: user.bio,
          isClub: user.isClub,
          clubName: user.clubName,
          verified: user.verified,
        })
        .from(user)
        .where(eq(user.id, p.userId));

      const usersResult = await (usersQuery as any).limit(1);

      return convertPostToPostWithDetails(
        p,
        tagsResult.map((t: TagQueryResult) => t.name),
        usersResult[0] as UserQueryResult
      );
    })
  );

  return postsWithTags;
}
