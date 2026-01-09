# Database Schema Proposal for Thesivest

## Overview
Schema design for user posts, trades, performance tracking, and social features.

## Tables

### 1. User Profile Extensions
```sql
ALTER TABLE "user" ADD COLUMN "username" text UNIQUE;
ALTER TABLE "user" ADD COLUMN "bio" text;
ALTER TABLE "user" ADD COLUMN "is_club" boolean DEFAULT false;
ALTER TABLE "user" ADD COLUMN "club_name" text;
ALTER TABLE "user" ADD COLUMN "verified" boolean DEFAULT false;
ALTER TABLE "user" ADD COLUMN "first_name" text;
ALTER TABLE "user" ADD COLUMN "last_name" text;
```

### 2. Posts Table
```sql
CREATE TABLE "post" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id"),
  "type" text NOT NULL, -- 'trade', 'thought', 'update'
  "symbol" text, -- Required for trades
  "title" text NOT NULL,
  "content" text NOT NULL,
  "buy_price" numeric,
  "buy_date" timestamp,
  "current_price" numeric,
  "target_price" numeric,
  "stop_loss" numeric,
  "entry_thoughts" text,
  "published_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL,
  "views" integer DEFAULT 0,
  "likes" integer DEFAULT 0,
  "comments" integer DEFAULT 0
);

CREATE INDEX "post_user_id_idx" ON "post"("user_id");
CREATE INDEX "post_symbol_idx" ON "post"("symbol");
CREATE INDEX "post_published_at_idx" ON "post"("published_at");
```

### 3. Post Tags (Many-to-Many)
```sql
CREATE TABLE "tag" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL UNIQUE
);

CREATE TABLE "post_tag" (
  "post_id" text NOT NULL REFERENCES "post"("id") ON DELETE CASCADE,
  "tag_id" text NOT NULL REFERENCES "tag"("id") ON DELETE CASCADE,
  PRIMARY KEY ("post_id", "tag_id")
);
```

### 4. Performance Tracking
```sql
CREATE TABLE "trade_performance" (
  "id" text PRIMARY KEY NOT NULL,
  "post_id" text NOT NULL REFERENCES "post"("id"),
  "user_id" text NOT NULL REFERENCES "user"("id"),
  "current_price" numeric NOT NULL,
  "return_percent" numeric NOT NULL,
  "return_amount" numeric,
  "status" text NOT NULL, -- 'active', 'win', 'loss', 'breakeven'
  "updated_at" timestamp NOT NULL
);

CREATE INDEX "trade_performance_post_id_idx" ON "trade_performance"("post_id");
CREATE INDEX "trade_performance_user_id_idx" ON "trade_performance"("user_id");
```

### 5. Social Features

#### Followers
```sql
CREATE TABLE "follow" (
  "follower_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "following_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "created_at" timestamp NOT NULL,
  PRIMARY KEY ("follower_id", "following_id"),
  CHECK ("follower_id" != "following_id")
);

CREATE INDEX "follow_follower_id_idx" ON "follow"("follower_id");
CREATE INDEX "follow_following_id_idx" ON "follow"("following_id");
```

#### Likes
```sql
CREATE TABLE "post_like" (
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "post_id" text NOT NULL REFERENCES "post"("id") ON DELETE CASCADE,
  "created_at" timestamp NOT NULL,
  PRIMARY KEY ("user_id", "post_id")
);

CREATE INDEX "post_like_post_id_idx" ON "post_like"("post_id");
```

#### Comments
```sql
CREATE TABLE "comment" (
  "id" text PRIMARY KEY NOT NULL,
  "post_id" text NOT NULL REFERENCES "post"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL REFERENCES "user"("id"),
  "content" text NOT NULL,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL
);

CREATE INDEX "comment_post_id_idx" ON "comment"("post_id");
CREATE INDEX "comment_user_id_idx" ON "comment"("user_id");
```

### 6. Tournament Participation
```sql
CREATE TABLE "tournament_participant" (
  "id" text PRIMARY KEY NOT NULL,
  "tournament_id" text NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id"),
  "post_id" text NOT NULL REFERENCES "post"("id"),
  "rank" integer,
  "score" numeric,
  "joined_at" timestamp NOT NULL
);

CREATE INDEX "tournament_participant_tournament_id_idx" ON "tournament_participant"("tournament_id");
CREATE INDEX "tournament_participant_user_id_idx" ON "tournament_participant"("user_id");
```

## Notes

- Posts can be trades (with symbol, prices, etc.), thoughts (general posts), or updates (on existing trades)
- Performance is tracked separately and can be updated over time
- Follow system allows users to subscribe to each other
- Tags are shared across all posts
- Tournament participation links users' posts to tournaments

