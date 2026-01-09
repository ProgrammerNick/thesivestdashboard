/**
 * Data Access Layer - Public API
 * Export all data access functions for use in feature layers
 */

// Posts
export {
  getAllPosts,
  getPostById,
  getPostsByUserId,
  getPostsByType,
  getPostsBySymbol,
  incrementPostViews,
  getTradePerformance,
  updateTradePerformance,
  type PostWithDetails,
} from "./posts";

// Users
export {
  getUserById,
  getUserByEmail,
  getUserByUsername,
  getAllUsers,
  isFollowing,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  updateUser,
  type UserWithStats,
} from "./users";

// Tournaments
export {
  getAllTournaments,
  getTournamentById,
  getTournamentsByCategory,
  getActiveTournaments,
  getTournamentsByStatus,
  getTournamentParticipants,
  getUserTournamentParticipations,
  isUserInTournament,
  joinTournament,
  updateTournamentParticipant,
  type TournamentWithParticipants,
  type TournamentParticipant,
} from "./tournaments";

// Profiles
export {
  getUserProfile,
  getUserProfileByUsername,
  getUserTradeHistory,
  getUserActiveTrades,
  getUserClosedTrades,
  getUserPerformanceMetrics,
  addEducation,
  updateEducation,
  deleteEducation,
  addCertification,
  updateCertification,
  deleteCertification,
  type UserProfile,
  type Education,
  type Certification,
  type TradeHistoryEntry,
  type PerformanceMetrics,
} from "./profiles";