/**
 * Shared Logic for Tournaments
 * Uses the data access layer to fetch data from the database.
 */

import {
  getAllTournaments,
  getTournamentById as getTournamentByIdDAL,
  getTournamentsByCategory as getTournamentsByCategoryDAL,
  getActiveTournaments as getActiveTournamentsDAL
} from "../data-access/tournaments";

export interface Tournament {
  id: string;
  name: string;
  description: string;
  category: "Value Investing" | "Growth Investing" | "Sector Focus" | "Options Trading" | "Crypto";
  status: "Upcoming" | "Active" | "Completed";
  startDate: string;
  endDate: string;
  participants: number;
  prizePool: string;
  rules: string[];
  icon: string; // lucide icon name
}

// Helper function to format date for display
function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split('T')[0]; // Returns YYYY-MM-DD
}

/**
 * Get all tournaments
 */
export async function getTournaments(): Promise<Tournament[]> {
  const tournaments = await getAllTournaments();

  return tournaments.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    category: t.category,
    status: t.status,
    startDate: formatDate(t.startDate),
    endDate: formatDate(t.endDate),
    participants: t.participants,
    prizePool: t.prizePool,
    rules: t.rules || [],
    icon: t.icon
  }));
}

/**
 * Get tournament by ID
 */
export async function getTournamentById(id: string): Promise<Tournament | null> {
  const tournament = await getTournamentByIdDAL(id);

  if (!tournament) return null;

  return {
    id: tournament.id,
    name: tournament.name,
    description: tournament.description,
    category: tournament.category,
    status: tournament.status,
    startDate: formatDate(tournament.startDate),
    endDate: formatDate(tournament.endDate),
    participants: tournament.participants,
    prizePool: tournament.prizePool,
    rules: tournament.rules || [],
    icon: tournament.icon
  };
}

/**
 * Get tournaments by category
 */
export async function getTournamentsByCategory(category: Tournament["category"]): Promise<Tournament[]> {
  const tournaments = await getTournamentsByCategoryDAL(category);

  return tournaments.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    category: t.category,
    status: t.status,
    startDate: formatDate(t.startDate),
    endDate: formatDate(t.endDate),
    participants: t.participants,
    prizePool: t.prizePool,
    rules: t.rules || [],
    icon: t.icon
  }));
}

/**
 * Get active tournaments
 */
export async function getActiveTournaments(): Promise<Tournament[]> {
  const tournaments = await getActiveTournamentsDAL();

  return tournaments.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    category: t.category,
    status: t.status,
    startDate: formatDate(t.startDate),
    endDate: formatDate(t.endDate),
    participants: t.participants,
    prizePool: t.prizePool,
    rules: t.rules || [],
    icon: t.icon
  }));
}

