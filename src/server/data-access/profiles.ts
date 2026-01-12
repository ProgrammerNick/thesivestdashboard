/**
 * Data Access Layer for User Profiles
 * Handles all database queries related to user profiles, education, and certifications
 */

import { db } from "../../db/index";
import {
  user,
  education,
  certification,
  post,
  follow,
} from "../../db/schema";
import { eq, desc, sql, and } from "drizzle-orm";

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
  availableForHire?: boolean;
  createdAt: Date;
  updatedAt: Date;
  totalPosts: number;
  followersCount: number;
  followingCount: number;
  // Engagement metrics
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  // Performance metrics (placeholder values for UI compatibility)
  totalTrades: number;
  activeTrades: number;
  winRate: number;
  totalReturn: number;
  averageReturn: number;
  bestTrade?: number;
  worstTrade?: number;
  maxDrawdown?: number;
  sharpeRatio?: number;
  alpha?: number;
  beta?: number;
  winLossRatio?: number;
  recentPosts?: any[];
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
 * Post entry (for history)
 */
export interface PostHistoryEntry {
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
  views: number;
  likes: number;
  comments: number;
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
    username: userData.displayName || undefined,
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
    availableForHire: userData.availableForHire || undefined,
    createdAt: userData.createdAt,
    updatedAt: userData.updatedAt,
    totalPosts: Number(posts[0]?.count || 0),
    followersCount: Number(followers[0]?.count || 0),
    followingCount: Number(following[0]?.count || 0),
    totalViews: Number(engagementData.totalViews || 0),
    totalLikes: Number(engagementData.totalLikes || 0),
    totalComments: Number(engagementData.totalComments || 0),
    // Placeholder performance metrics (tradePerformance table was removed)
    totalTrades: 0,
    activeTrades: 0,
    winRate: 0,
    totalReturn: 0,
    averageReturn: 0,
    bestTrade: 0,
    worstTrade: 0,
    maxDrawdown: 0,
    sharpeRatio: 0,
    alpha: 0,
    beta: 1,
    winLossRatio: 0,
    recentPosts: [],
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
 * Get user by display name
 */
export async function getUserProfileByUsername(
  username: string
): Promise<UserProfile | null> {
  const users = await db
    .select()
    .from(user)
    .where(eq(user.displayName, username))
    .limit(1);

  if (users.length === 0) return null;

  return getUserProfile(users[0].id);
}

/**
 * Get user's post history
 */
export async function getUserPostHistory(
  userId: string,
  limit?: number
): Promise<PostHistoryEntry[]> {
  let query = db
    .select()
    .from(post)
    .where(eq(post.userId, userId))
    .orderBy(desc(post.publishedAt));

  if (limit) {
    query.limit(limit);
  }

  const posts = await query;

  return posts.map((p) => ({
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
    publishedAt: p.publishedAt || new Date(),
    views: p.views || 0,
    likes: p.likes || 0,
    comments: p.comments || 0,
  }));
}

/**
 * Get user's trade posts (type = 'trade')
 */
export async function getUserTrades(
  userId: string,
  limit?: number
): Promise<PostHistoryEntry[]> {
  let query = db
    .select()
    .from(post)
    .where(and(eq(post.userId, userId), eq(post.type, "trade")))
    .orderBy(desc(post.publishedAt));

  if (limit) {
    query.limit(limit);
  }

  const posts = await query;

  return posts.map((p) => ({
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
    publishedAt: p.publishedAt || new Date(),
    views: p.views || 0,
    likes: p.likes || 0,
    comments: p.comments || 0,
  }));
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
