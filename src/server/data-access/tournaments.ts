/**
 * Data Access Layer for Tournaments
 * Handles all database queries related to tournaments and tournament participants
 */

import { db } from "../../db/index";
import {
  tournament,
  tournamentParticipant,
  user,
  post,
  TournamentCategory,
  TournamentStatus,
} from "../../db/schema";
import { eq, desc, and } from "drizzle-orm";

export interface TournamentWithParticipants {
  id: string;
  name: string;
  description: string;
  category: TournamentCategory;
  status: TournamentStatus;
  startDate: Date;
  endDate: Date;
  participants: number;
  prizePool: string;
  rules: string[];
  icon: string;
}

export interface TournamentParticipant {
  id: string;
  tournamentId: string;
  userId: string;
  postId: string;
  rank?: number;
  score?: number;
  joinedAt: Date;
  user?: {
    id: string;
    name: string;
    image?: string;
  };
  post?: {
    id: string;
    title: string;
    type: string;
    symbol?: string;
  };
}

/**
 * Get all tournaments
 */
export async function getAllTournaments(): Promise<
  TournamentWithParticipants[]
> {
  const tournaments = await db.select().from(tournament);

  return tournaments.map((t: any) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    category: t.category as TournamentCategory,
    status: t.status as TournamentStatus,
    startDate: t.startDate,
    endDate: t.endDate,
    participants: t.participants || 0,
    prizePool: t.prizePool,
    rules: Array.isArray(t.rules) ? t.rules : [],
    icon: t.icon,
  }));
}

/**
 * Get tournament by ID
 */
export async function getTournamentById(
  id: string
): Promise<TournamentWithParticipants | null> {
  const tournaments = await db
    .select()
    .from(tournament)
    .where(eq(tournament.id, id))
    .limit(1);

  if (tournaments.length === 0) return null;

  const t = tournaments[0];

  return {
    id: t.id,
    name: t.name,
    description: t.description,
    category: t.category as TournamentCategory,
    status: t.status as TournamentStatus,
    startDate: t.startDate,
    endDate: t.endDate,
    participants: t.participants || 0,
    prizePool: t.prizePool,
    rules: Array.isArray(t.rules) ? t.rules : [],
    icon: t.icon,
  };
}

/**
 * Get tournaments by category
 */
export async function getTournamentsByCategory(
  category: TournamentCategory
): Promise<TournamentWithParticipants[]> {
  const tournaments = await db
    .select()
    .from(tournament)
    .where(eq(tournament.category, category));

  return tournaments.map((t: any) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    category: t.category as TournamentCategory,
    status: t.status as TournamentStatus,
    startDate: t.startDate,
    endDate: t.endDate,
    participants: t.participants || 0,
    prizePool: t.prizePool,
    rules: Array.isArray(t.rules) ? t.rules : [],
    icon: t.icon,
  }));
}

/**
 * Get active tournaments
 */
export async function getActiveTournaments(): Promise<
  TournamentWithParticipants[]
> {
  const tournaments = await db
    .select()
    .from(tournament)
    .where(eq(tournament.status, "Active"));

  return tournaments.map((t: any) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    category: t.category as TournamentCategory,
    status: t.status as TournamentStatus,
    startDate: t.startDate,
    endDate: t.endDate,
    participants: t.participants || 0,
    prizePool: t.prizePool,
    rules: Array.isArray(t.rules) ? t.rules : [],
    icon: t.icon,
  }));
}

/**
 * Get tournaments by status
 */
export async function getTournamentsByStatus(
  status: TournamentStatus
): Promise<TournamentWithParticipants[]> {
  const tournaments = await db
    .select()
    .from(tournament)
    .where(eq(tournament.status, status));

  return tournaments.map((t: any) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    category: t.category as TournamentCategory,
    status: t.status as TournamentStatus,
    startDate: t.startDate,
    endDate: t.endDate,
    participants: t.participants || 0,
    prizePool: t.prizePool,
    rules: Array.isArray(t.rules) ? t.rules : [],
    icon: t.icon,
  }));
}

/**
 * Get tournament participants
 */
export async function getTournamentParticipants(
  tournamentId: string,
  limit?: number
): Promise<TournamentParticipant[]> {
  let query = db
    .select({
      id: tournamentParticipant.id,
      tournamentId: tournamentParticipant.tournamentId,
      userId: tournamentParticipant.userId,
      postId: tournamentParticipant.postId,
      rank: tournamentParticipant.rank,
      score: tournamentParticipant.score,
      joinedAt: tournamentParticipant.joinedAt,
    })
    .from(tournamentParticipant)
    .where(eq(tournamentParticipant.tournamentId, tournamentId))
    .orderBy(desc(tournamentParticipant.score));

  if (limit) {
    query.limit(limit);
  }

  const participants = await query;

  // Get user and post info for each participant
  const participantsWithDetails = await Promise.all(
    participants.map(async (p: any) => {
      const usersQuery = await db
        .select({
          id: user.id,
          name: user.name,
          image: user.image,
        })
        .from(user)
        .where(eq(user.id, p.userId));

      const usersResult = usersQuery;

      const postsQuery = await db
        .select({
          id: post.id,
          title: post.title,
          type: post.type,
          symbol: post.symbol,
        })
        .from(post)
        .where(eq(post.id, p.postId));

      const postsResult = postsQuery;

      return {
        ...p,
        user: usersResult[0]
          ? {
              id: usersResult[0].id,
              name: usersResult[0].name,
              image: usersResult[0].image || undefined,
            }
          : undefined,
        post: postsResult[0]
          ? {
              id: postsResult[0].id,
              title: postsResult[0].title,
              type: postsResult[0].type,
              symbol: postsResult[0].symbol || undefined,
            }
          : undefined,
        rank: p.rank || undefined,
        score: p.score ? Number(p.score) : undefined,
      };
    })
  );

  return participantsWithDetails;
}

/**
 * Get user's tournament participations
 */
export async function getUserTournamentParticipations(
  userId: string
): Promise<TournamentParticipant[]> {
  const participants = await db
    .select({
      id: tournamentParticipant.id,
      tournamentId: tournamentParticipant.tournamentId,
      userId: tournamentParticipant.userId,
      postId: tournamentParticipant.postId,
      rank: tournamentParticipant.rank,
      score: tournamentParticipant.score,
      joinedAt: tournamentParticipant.joinedAt,
    })
    .from(tournamentParticipant)
    .where(eq(tournamentParticipant.userId, userId));

  // Get user and post info for each participant
  const participantsWithDetails = await Promise.all(
    participants.map(async (p: any) => {
      const postsQuery = await db
        .select({
          id: post.id,
          title: post.title,
          type: post.type,
          symbol: post.symbol,
        })
        .from(post)
        .where(eq(post.id, p.postId));

      const postsResult = postsQuery;

      return {
        ...p,
        user: { id: userId },
        post: postsResult[0]
          ? {
              id: postsResult[0].id,
              title: postsResult[0].title,
              type: postsResult[0].type,
              symbol: postsResult[0].symbol || undefined,
            }
          : undefined,
        rank: p.rank || undefined,
        score: p.score ? Number(p.score) : undefined,
      };
    })
  );

  return participantsWithDetails;
}

/**
 * Check if user is participating in a tournament
 */
export async function isUserInTournament(
  tournamentId: string,
  userId: string
): Promise<boolean> {
  const result = await db
    .select()
    .from(tournamentParticipant)
    .where(
      and(
        eq(tournamentParticipant.tournamentId, tournamentId),
        eq(tournamentParticipant.userId, userId)
      )
    )
    .limit(1);

  return result.length > 0;
}

/**
 * Join tournament
 */
export async function joinTournament(
  tournamentId: string,
  userId: string,
  postId: string
): Promise<void> {
  await db.insert(tournamentParticipant).values({
    id: crypto.randomUUID(),
    tournamentId,
    userId,
    postId,
    joinedAt: new Date(),
  });
}

/**
 * Update tournament participant score/rank
 */
export async function updateTournamentParticipant(
  tournamentId: string,
  userId: string,
  data: {
    rank?: number;
    score?: number;
  }
): Promise<void> {
  await db
    .update(tournamentParticipant)
    .set({
      rank: data.rank,
      score: data.score ? String(data.score) : null,
    })
    .where(
      and(
        eq(tournamentParticipant.tournamentId, tournamentId),
        eq(tournamentParticipant.userId, userId)
      )
    );
}
