/**
 * Data Access Layer for User Profiles
 * Handles all database queries related to user profiles, education, certifications, and performance
 */

import { db } from "../../db/index";
import {
  user,
  education,
  certification,
  post,
  tradePerformance,
  follow,
} from "../../db/schema";
import { eq, desc, sql, and, gte } from "drizzle-orm";

/**
 * Complete user profile with all details
 */
export interface UserProfile {
  id: string;
  name: string;
  username?: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  bio?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  isClub?: boolean;
  clubName?: string;
  verified?: boolean;
  seekingEmployment?: boolean;
  availableForHire?: boolean;
  createdAt: Date;
  updatedAt: Date;
  totalPosts: number;
  followersCount: number;
  followingCount: number;
  // Performance metrics
  totalTrades: number;
  activeTrades: number;
  winRate: number;
  totalReturn: number;
  averageReturn: number;
  bestTrade: number;
  worstTrade: number;
  streaks: {
    currentWinStreak: number;
    longestWinStreak: number;
    currentLossStreak: number;
    longestLossStreak: number;
  };
  // Engagement metrics
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  // Educations and certifications
  educations: Education[];
  certifications: Certification[];
}

/**
 * Education record
 */
export interface Education {
  id: string;
  school: string;
  degree: string;
  field?: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  gpa?: string;
  honors?: string;
  activities?: string;
}

/**
 * Certification record
 */
export interface Certification {
  id: string;
  name: string;
  organization: string;
  issueDate: Date;
  expirationDate?: Date;
  credentialId?: string;
  credentialUrl?: string;
}

/**
 * Trade history entry
 */
export interface TradeHistoryEntry {
  id: string;
  type: "trade" | "thought" | "update";
  symbol?: string;
  title: string;
  content: string;
  buyPrice?: number;
  buyDate?: Date;
  sellPrice?: number;
  sellDate?: Date;
  currentPrice?: number;
  targetPrice?: number;
  stopLoss?: number;
  entryThoughts?: string;
  exitThoughts?: string;
  publishedAt: Date;
  returnPercent?: number;
  returnAmount?: number;
  status: "active" | "win" | "loss" | "breakeven";
  views: number;
  likes: number;
  comments: number;
}

/**
 * Performance metrics for a time period
 */
export interface PerformanceMetrics {
  period: string;
  totalTrades: number;
  winRate: number;
  totalReturn: number;
  averageReturn: number;
  bestTrade: number;
  worstTrade: number;
  sharpeRatio?: number;
  maxDrawdown?: number;
}

/**
 * Get complete user profile by ID with all metrics
 */
export async function getUserProfile(id: string): Promise<UserProfile | null> {
  const users = await db.select().from(user).where(eq(user.id, id)).limit(1);

  if (users.length === 0) return null;

  const userData = users[0];

  // Get basic counts
  const posts = await db
    .select({ count: sql<number>`count(*)` })
    .from(post)
    .where(eq(post.userId, userData.id));

  const followers = await db
    .select({ count: sql<number>`count(*)` })
    .from(follow)
    .where(eq(follow.followingId, id));

  const following = await db
    .select({ count: sql<number>`count(*)` })
    .from(follow)
    .where(eq(follow.followerId, id));

  // Get trade posts
  const trades = await db
    .select()
    .from(post)
    .where(and(eq(post.userId, id), eq(post.type, "trade")));

  // Get trade performance data
  const performances = await db
    .select()
    .from(tradePerformance)
    .where(eq(tradePerformance.userId, id));

  // Calculate metrics
  const totalTrades = trades.length;
  const activeTrades = trades.filter((t) => !t.sellDate).length;
  const completedTrades = trades.filter((t) => t.sellDate);

  const wins = completedTrades.filter((t) => {
    const perf = performances.find((p) => p.postId === t.id);
    return perf?.status === "win";
  }).length;

  const winRate =
    completedTrades.length > 0 ? (wins / completedTrades.length) * 100 : 0;

  const totalReturn = performances.reduce(
    (sum, p) => sum + Number(p.returnAmount || 0),
    0
  );

  const averageReturn =
    performances.length > 0
      ? performances.reduce((sum, p) => sum + Number(p.returnPercent), 0) /
        performances.length
      : 0;

  const bestTrade =
    performances.length > 0
      ? Math.max(...performances.map((p) => Number(p.returnPercent)))
      : 0;

  const worstTrade =
    performances.length > 0
      ? Math.min(...performances.map((p) => Number(p.returnPercent)))
      : 0;

  // Calculate streaks
  const sortedTrades = trades
    .filter((t) => t.sellDate)
    .sort(
      (a, b) => (a.sellDate?.getTime() || 0) - (b.sellDate?.getTime() || 0)
    );

  let currentWinStreak = 0;
  let longestWinStreak = 0;
  let currentLossStreak = 0;
  let longestLossStreak = 0;
  let tempWinStreak = 0;
  let tempLossStreak = 0;

  for (const trade of sortedTrades) {
    const perf = performances.find((p) => p.postId === trade.id);
    if (perf?.status === "win") {
      tempWinStreak++;
      tempLossStreak = 0;
    } else if (perf?.status === "loss") {
      tempLossStreak++;
      tempWinStreak = 0;
    }
    longestWinStreak = Math.max(longestWinStreak, tempWinStreak);
    longestLossStreak = Math.max(longestLossStreak, tempLossStreak);
  }

  currentWinStreak = tempWinStreak;
  currentLossStreak = tempLossStreak;

  // Get engagement metrics
  const engagement = await db
    .select({
      totalViews: sql<number>`sum(${post.views})`,
      totalLikes: sql<number>`sum(${post.likes})`,
      totalComments: sql<number>`sum(${post.comments})`,
    })
    .from(post)
    .where(eq(post.userId, id));

  const engagementData = engagement[0] || {
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
  };

  // Get education
  const educations = await db
    .select()
    .from(education)
    .where(eq(education.userId, id))
    .orderBy(desc(education.startDate));

  // Get certifications
  const certifications = await db
    .select()
    .from(certification)
    .where(eq(certification.userId, id))
    .orderBy(desc(certification.issueDate));

  return {
    id: userData.id,
    name: userData.name,
    username: userData.username || undefined,
    email: userData.email,
    emailVerified: userData.emailVerified,
    image: userData.image || undefined,
    bio: userData.bio || undefined,
    location: userData.location || undefined,
    website: userData.website || undefined,
    linkedin: userData.linkedin || undefined,
    twitter: userData.twitter || undefined,
    isClub: userData.isClub || undefined,
    clubName: userData.clubName || undefined,
    verified: userData.verified || undefined,
    seekingEmployment: userData.seekingEmployment || undefined,
    availableForHire: userData.availableForHire || undefined,
    createdAt: userData.createdAt,
    updatedAt: userData.updatedAt,
    totalPosts: Number(posts[0]?.count || 0),
    followersCount: Number(followers[0]?.count || 0),
    followingCount: Number(following[0]?.count || 0),
    totalTrades,
    activeTrades,
    winRate,
    totalReturn,
    averageReturn,
    bestTrade,
    worstTrade,
    streaks: {
      currentWinStreak,
      longestWinStreak,
      currentLossStreak,
      longestLossStreak,
    },
    totalViews: Number(engagementData.totalViews || 0),
    totalLikes: Number(engagementData.totalLikes || 0),
    totalComments: Number(engagementData.totalComments || 0),
    educations: educations.map((e) => ({
      id: e.id,
      school: e.school,
      degree: e.degree,
      field: e.field || undefined,
      startDate: e.startDate,
      endDate: e.endDate || undefined,
      current: e.current || false,
      gpa: e.gpa || undefined,
      honors: e.honors || undefined,
      activities: e.activities || undefined,
    })),
    certifications: certifications.map((c) => ({
      id: c.id,
      name: c.name,
      organization: c.organization,
      issueDate: c.issueDate,
      expirationDate: c.expirationDate || undefined,
      credentialId: c.credentialId || undefined,
      credentialUrl: c.credentialUrl || undefined,
    })),
  };
}

/**
 * Get user by username
 */
export async function getUserProfileByUsername(
  username: string
): Promise<UserProfile | null> {
  const users = await db
    .select()
    .from(user)
    .where(eq(user.username, username))
    .limit(1);

  if (users.length === 0) return null;

  return getUserProfile(users[0].id);
}

/**
 * Get user's trade history
 */
export async function getUserTradeHistory(
  userId: string,
  limit?: number
): Promise<TradeHistoryEntry[]> {
  let query = db
    .select()
    .from(post)
    .where(eq(post.userId, userId))
    .orderBy(desc(post.publishedAt));

  if (limit) {
    query.limit(limit);
  }

  const posts = await query;

  // Get performance for each trade
  const trades = await Promise.all(
    posts.map(async (p) => {
      const perf = await db
        .select()
        .from(tradePerformance)
        .where(eq(tradePerformance.postId, p.id))
        .limit(1);

      return {
        id: p.id,
        type: p.type as "trade" | "thought" | "update",
        symbol: p.symbol || undefined,
        title: p.title,
        content: p.content,
        buyPrice: p.buyPrice ? Number(p.buyPrice) : undefined,
        buyDate: p.buyDate || undefined,
        sellPrice: p.sellPrice ? Number(p.sellPrice) : undefined,
        sellDate: p.sellDate || undefined,
        currentPrice: p.currentPrice ? Number(p.currentPrice) : undefined,
        targetPrice: p.targetPrice ? Number(p.targetPrice) : undefined,
        stopLoss: p.stopLoss ? Number(p.stopLoss) : undefined,
        entryThoughts: p.entryThoughts || undefined,
        exitThoughts: p.exitThoughts || undefined,
        publishedAt: p.publishedAt,
        returnPercent: perf[0] ? Number(perf[0].returnPercent) : undefined,
        returnAmount: perf[0] ? Number(perf[0].returnAmount || 0) : undefined,
        status: (perf[0]?.status || "active") as
          | "active"
          | "win"
          | "loss"
          | "breakeven",
        views: p.views || 0,
        likes: p.likes || 0,
        comments: p.comments || 0,
      };
    })
  );

  return trades;
}

/**
 * Get user's active trades
 */
export async function getUserActiveTrades(
  userId: string
): Promise<TradeHistoryEntry[]> {
  const trades = await db
    .select()
    .from(post)
    .where(
      and(
        eq(post.userId, userId),
        eq(post.type, "trade"),
        sql`${post.sellDate} IS NULL`
      )
    )
    .orderBy(desc(post.publishedAt));

  const activeTrades = await Promise.all(
    trades.map(async (p) => {
      const perf = await db
        .select()
        .from(tradePerformance)
        .where(eq(tradePerformance.postId, p.id))
        .limit(1);

      return {
        id: p.id,
        type: p.type as "trade" | "thought" | "update",
        symbol: p.symbol || undefined,
        title: p.title,
        content: p.content,
        buyPrice: p.buyPrice ? Number(p.buyPrice) : undefined,
        buyDate: p.buyDate || undefined,
        sellPrice: p.sellPrice ? Number(p.sellPrice) : undefined,
        sellDate: p.sellDate || undefined,
        currentPrice: p.currentPrice ? Number(p.currentPrice) : undefined,
        targetPrice: p.targetPrice ? Number(p.targetPrice) : undefined,
        stopLoss: p.stopLoss ? Number(p.stopLoss) : undefined,
        entryThoughts: p.entryThoughts || undefined,
        exitThoughts: p.exitThoughts || undefined,
        publishedAt: p.publishedAt,
        returnPercent: perf[0] ? Number(perf[0].returnPercent) : undefined,
        returnAmount: perf[0] ? Number(perf[0].returnAmount || 0) : undefined,
        status: (perf[0]?.status || "active") as
          | "active"
          | "win"
          | "loss"
          | "breakeven",
        views: p.views || 0,
        likes: p.likes || 0,
        comments: p.comments || 0,
      };
    })
  );

  return activeTrades;
}

/**
 * Get user's closed trades with wins/losses
 */
export async function getUserClosedTrades(
  userId: string,
  limit?: number
): Promise<TradeHistoryEntry[]> {
  let query = db
    .select()
    .from(post)
    .where(
      and(
        eq(post.userId, userId),
        eq(post.type, "trade"),
        sql`${post.sellDate} IS NOT NULL`
      )
    )
    .orderBy(desc(post.sellDate));

  if (limit) {
    query.limit(limit);
  }

  const trades = await query;

  const closedTrades = await Promise.all(
    trades.map(async (p) => {
      const perf = await db
        .select()
        .from(tradePerformance)
        .where(eq(tradePerformance.postId, p.id))
        .limit(1);

      return {
        id: p.id,
        type: p.type as "trade" | "thought" | "update",
        symbol: p.symbol || undefined,
        title: p.title,
        content: p.content,
        buyPrice: p.buyPrice ? Number(p.buyPrice) : undefined,
        buyDate: p.buyDate || undefined,
        sellPrice: p.sellPrice ? Number(p.sellPrice) : undefined,
        sellDate: p.sellDate || undefined,
        currentPrice: p.currentPrice ? Number(p.currentPrice) : undefined,
        targetPrice: p.targetPrice ? Number(p.targetPrice) : undefined,
        stopLoss: p.stopLoss ? Number(p.stopLoss) : undefined,
        entryThoughts: p.entryThoughts || undefined,
        exitThoughts: p.exitThoughts || undefined,
        publishedAt: p.publishedAt,
        returnPercent: perf[0] ? Number(perf[0].returnPercent) : undefined,
        returnAmount: perf[0] ? Number(perf[0].returnAmount || 0) : undefined,
        status: (perf[0]?.status || "active") as
          | "active"
          | "win"
          | "loss"
          | "breakeven",
        views: p.views || 0,
        likes: p.likes || 0,
        comments: p.comments || 0,
      };
    })
  );

  return closedTrades;
}

/**
 * Get performance metrics for different time periods
 */
export async function getUserPerformanceMetrics(
  userId: string
): Promise<PerformanceMetrics[]> {
  const now = new Date();
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  const periods = [
    { name: "1 Month", start: oneMonthAgo },
    { name: "3 Months", start: threeMonthsAgo },
    { name: "6 Months", start: sixMonthsAgo },
    { name: "1 Year", start: oneYearAgo },
  ];

  const metrics = await Promise.all(
    periods.map(async (period) => {
      const trades = await db
        .select()
        .from(post)
        .where(
          and(
            eq(post.userId, userId),
            eq(post.type, "trade"),
            gte(post.buyDate, period.start)
          )
        );

      const perfData = await db
        .select()
        .from(tradePerformance)
        .where(eq(tradePerformance.userId, userId));

      const periodTrades = trades.filter((t) => {
        const perf = perfData.find((p) => p.postId === t.id);
        return perf !== undefined;
      });

      const completedPeriodTrades = periodTrades.filter((t) => t.sellDate);

      const periodWins = completedPeriodTrades.filter((t) => {
        const perf = perfData.find((p) => p.postId === t.id);
        return perf?.status === "win";
      }).length;

      const periodWinRate =
        completedPeriodTrades.length > 0
          ? (periodWins / completedPeriodTrades.length) * 100
          : 0;

      const periodTotalReturn = perfData
        .filter((p) => {
          const trade = trades.find((t) => t.id === p.postId);
          return trade && trade.buyDate && trade.buyDate >= period.start;
        })
        .reduce((sum, p) => sum + Number(p.returnAmount || 0), 0);

      const periodReturns = perfData
        .filter((p) => {
          const trade = trades.find((t) => t.id === p.postId);
          return trade && trade.buyDate && trade.buyDate >= period.start;
        })
        .map((p) => Number(p.returnPercent));

      const periodAverageReturn =
        periodReturns.length > 0
          ? periodReturns.reduce((sum, r) => sum + r, 0) / periodReturns.length
          : 0;

      const periodBestTrade =
        periodReturns.length > 0 ? Math.max(...periodReturns) : 0;

      const periodWorstTrade =
        periodReturns.length > 0 ? Math.min(...periodReturns) : 0;

      return {
        period: period.name,
        totalTrades: periodTrades.length,
        winRate: periodWinRate,
        totalReturn: periodTotalReturn,
        averageReturn: periodAverageReturn,
        bestTrade: periodBestTrade,
        worstTrade: periodWorstTrade,
      };
    })
  );

  return metrics;
}

/**
 * Add education to user profile
 */
export async function addEducation(
  userId: string,
  data: Omit<Education, "id">
) {
  await db.insert(education).values({
    userId: userId,
    school: data.school,
    degree: data.degree,
    field: data.field,
    startDate: data.startDate,
    endDate: data.endDate,
    current: data.current,
    gpa: data.gpa,
    honors: data.honors,
    activities: data.activities,
  });
}

/**
 * Update education record
 */
export async function updateEducation(
  educationId: string,
  data: Partial<Omit<Education, "id">>
) {
  await db.update(education).set(data).where(eq(education.id, educationId));
}

/**
 * Delete education record
 */
export async function deleteEducation(educationId: string) {
  await db.delete(education).where(eq(education.id, educationId));
}

/**
 * Add certification to user profile
 */
export async function addCertification(
  userId: string,
  data: Omit<Certification, "id">
) {
  await db.insert(certification).values({
    userId,
    name: data.name,
    organization: data.organization,
    issueDate: data.issueDate,
    expirationDate: data.expirationDate,
    credentialId: data.credentialId,
    credentialUrl: data.credentialUrl,
  });
}

/**
 * Update certification record
 */
export async function updateCertification(
  certificationId: string,
  data: Partial<Omit<Certification, "id">>
) {
  await db
    .update(certification)
    .set(data)
    .where(eq(certification.id, certificationId));
}

/**
 * Delete certification record
 */
export async function deleteCertification(certificationId: string) {
  await db.delete(certification).where(eq(certification.id, certificationId));
}
