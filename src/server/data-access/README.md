# Data Access Layer

This folder contains the data access layer for the Thesivest application. The data access layer is responsible for all direct database interactions using Drizzle ORM.

## Architecture

The application now follows a clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                 Feature Layer                           │
│  (src/server/features/contributors.ts, theses.ts,     │
│   tournaments.ts)                                       │
│                                                         │
│  - Business logic                                       │
│  - Interface definitions                                 │
│  - Data transformation                                 │
└──────────────────────┬──────────────────────────────────┘
                       │ calls
                       ↓
┌─────────────────────────────────────────────────────────┐
│              Data Access Layer                         │
│  (src/server/data-access/posts.ts, users.ts,         │
│   tournaments.ts)                                      │
│                                                         │
│  - Drizzle ORM queries                                 │
│  - Database operations                                 │
│  - SQL generation                                     │
└──────────────────────┬──────────────────────────────────┘
                       │ queries
                       ↓
┌─────────────────────────────────────────────────────────┐
│                  Database                            │
│  (Neon PostgreSQL)                                    │
└─────────────────────────────────────────────────────────┘
```

## Files

### `posts.ts`
Handles all post-related database operations:
- `getAllPosts(limit?)` - Get all posts with optional limit
- `getPostById(id)` - Get a single post with all details
- `getPostsByUserId(userId)` - Get all posts for a specific user
- `getPostsByType(type)` - Get posts by type (trade, thought, update)
- `getPostsBySymbol(symbol)` - Get all posts for a specific stock symbol
- `incrementPostViews(id)` - Increment the view count for a post
- `getTradePerformance(postId)` - Get trade performance data
- `updateTradePerformance(postId, data)` - Update trade performance

### `users.ts`
Handles all user-related database operations:
- `getUserById(id)` - Get user by ID
- `getUserByEmail(email)` - Get user by email
- `getUserByUsername(username)` - Get user by username
- `getAllUsers(limit?)` - Get all users
- `isFollowing(followerId, followingId)` - Check if user A follows user B
- `followUser(followerId, followingId)` - Follow a user
- `unfollowUser(followerId, followingId)` - Unfollow a user
- `getFollowers(userId, limit?)` - Get followers for a user
- `getFollowing(userId, limit?)` - Get users that a user follows
- `updateUser(id, data)` - Update user profile

### `tournaments.ts`
Handles all tournament-related database operations:
- `getAllTournaments()` - Get all tournaments
- `getTournamentById(id)` - Get a specific tournament
- `getTournamentsByCategory(category)` - Get tournaments by category
- `getActiveTournaments()` - Get all active tournaments
- `getTournamentsByStatus(status)` - Get tournaments by status
- `getTournamentParticipants(tournamentId, limit?)` - Get participants for a tournament
- `getUserTournamentParticipations(userId)` - Get all tournaments a user has joined
- `isUserInTournament(tournamentId, userId)` - Check if user is in a tournament
- `joinTournament(tournamentId, userId, postId)` - Join a tournament
- `updateTournamentParticipant(tournamentId, userId, data)` - Update participant score/rank

### `index.ts`
Public API export file that re-exports all data access functions and types.

## Usage Example

```typescript
// In feature layer (e.g., contributors.ts)
import { getAllPosts, getUserById } from "../data-access";

export async function getContributors() {
  const users = await getAllUsers();
  // Transform user data as needed
  return users.map(transformUser);
}
```

## Benefits

1. **Separation of Concerns**: Clear separation between business logic and data access
2. **Reusability**: Data access functions can be called from multiple feature layers
3. **Testability**: Easier to test data access in isolation
4. **Maintainability**: Database queries are centralized in one place
5. **Type Safety**: Strong TypeScript types for all database operations

## Database Schema

The data access layer works with the following tables (defined in `src/db/schema.ts`):

### Core Tables
- `user` - User accounts with profile fields
- `post` - Trade/thought/update posts
- `tag` - Post tags
- `post_tag` - Many-to-many relationship between posts and tags

### Performance Tables
- `trade_performance` - Performance tracking for trades

### Social Tables
- `follow` - User following system
- `post_like` - Post likes
- `comment` - Post comments

### Tournament Tables
- `tournament` - Tournament definitions
- `tournament_participant` - User participation in tournaments

