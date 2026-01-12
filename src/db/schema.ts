import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Tournament Types
export type TournamentCategory =
  | "Value Investing"
  | "Growth Investing"
  | "Sector Focus"
  | "Options Trading"
  | "Crypto";

export type TournamentStatus = "Upcoming" | "Active" | "Completed";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  displayName: text("display_name").notNull().unique(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  bio: text("bio"),
  location: text("location"),
  website: text("website"),
  linkedin: text("linkedin"),
  twitter: text("twitter"),
  isClub: boolean("is_club").default(false),
  clubName: text("club_name"),
  verified: boolean("verified").default(false),
  availableForHire: boolean("available_for_hire").default(false),
  // Corporate Fields
  isCompany: boolean("is_company").default(false),
  companyName: text("company_name"),
  companyDescription: text("company_description"),
  companyWebsite: text("company_website"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// Posts Table
export const post = pgTable("post", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  type: text("type").notNull(), // 'trade', 'thought', 'update', 'market_outlook', 'quarterly_letter'
  symbol: text("symbol"), // Required for trades
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  slug: text("slug").unique(),
  coverImage: text("cover_image"),
  content: text("content").notNull(),
  published: boolean("published").default(false),
  buyPrice: numeric("buy_price"),
  buyDate: timestamp("buy_date"),
  sellPrice: numeric("sell_price"),
  sellDate: timestamp("sell_date"),
  currentPrice: numeric("current_price"),
  targetPrice: numeric("target_price"),
  stopLoss: numeric("stop_loss"),
  entryThoughts: text("entry_thoughts"),
  exitThoughts: text("exit_thoughts"),
  publishedAt: timestamp("published_at"),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
});

export const postRelations = relations(post, ({ one, many }) => ({
  user: one(user, {
    fields: [post.userId],
    references: [user.id],
  }),
  tags: many(postTag),
  likes: many(postLike),
  comments: many(comment),
  attachments: many(postAttachment),
  tournamentParticipants: many(tournamentParticipant),
}));

export const postAttachment = pgTable("post_attachment", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  postId: text("post_id")
    .notNull()
    .references(() => post.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  type: text("type").notNull(), // 'image' | 'pdf' | 'other'
  filename: text("filename").notNull(),
  size: integer("size").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const postAttachmentRelations = relations(postAttachment, ({ one }) => ({
  post: one(post, {
    fields: [postAttachment.postId],
    references: [post.id],
  }),
}));

// Tags
export const tag = pgTable("tag", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
});

export const tagRelations = relations(tag, ({ many }) => ({
  posts: many(postTag),
}));

export const postTag = pgTable("post_tag", {
  postId: text("post_id")
    .notNull()
    .references(() => post.id, { onDelete: "cascade" }),
  tagId: text("tag_id")
    .notNull()
    .references(() => tag.id, { onDelete: "cascade" }),
});

export const postTagRelations = relations(postTag, ({ one }) => ({
  post: one(post, {
    fields: [postTag.postId],
    references: [post.id],
  }),
  tag: one(tag, {
    fields: [postTag.tagId],
    references: [tag.id],
  }),
}));

// Follow System
export const follow = pgTable("follow", {
  followerId: text("follower_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  followingId: text("following_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const followRelations = relations(follow, ({ one }) => ({
  follower: one(user, {
    fields: [follow.followerId],
    references: [user.id],
    relationName: "following",
  }),
  following: one(user, {
    fields: [follow.followingId],
    references: [user.id],
    relationName: "followers",
  }),
}));

// Post Likes
export const postLike = pgTable("post_like", {
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  postId: text("post_id")
    .notNull()
    .references(() => post.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const postLikeRelations = relations(postLike, ({ one }) => ({
  user: one(user, {
    fields: [postLike.userId],
    references: [user.id],
  }),
  post: one(post, {
    fields: [postLike.postId],
    references: [post.id],
  }),
}));

// Comments
export const comment = pgTable("comment", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  postId: text("post_id")
    .notNull()
    .references(() => post.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const commentRelations = relations(comment, ({ one }) => ({
  post: one(post, {
    fields: [comment.postId],
    references: [post.id],
  }),
  user: one(user, {
    fields: [comment.userId],
    references: [user.id],
  }),
}));

// Tournament Tables
export const tournament = pgTable("tournament", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'Value Investing', 'Growth Investing', 'Sector Focus', 'Options Trading', 'Crypto'
  status: text("status").notNull(), // 'Upcoming', 'Active', 'Completed'
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  participants: integer("participants").default(0),
  prizePool: text("prize_pool").notNull(),
  rules: text("rules").array(), // Stored as JSON array
  icon: text("icon").notNull(), // lucide icon name
});

export const tournamentRelations = relations(tournament, ({ many }) => ({
  participants: many(tournamentParticipant),
}));

export const tournamentParticipant = pgTable("tournament_participant", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  tournamentId: text("tournament_id")
    .notNull()
    .references(() => tournament.id),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  postId: text("post_id")
    .notNull()
    .references(() => post.id),
  rank: integer("rank"),
  score: numeric("score"),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

export const tournamentParticipantRelations = relations(
  tournamentParticipant,
  ({ one }) => ({
    tournament: one(tournament, {
      fields: [tournamentParticipant.tournamentId],
      references: [tournament.id],
    }),
    user: one(user, {
      fields: [tournamentParticipant.userId],
      references: [user.id],
    }),
    post: one(post, {
      fields: [tournamentParticipant.postId],
      references: [post.id],
    }),
  })
);

// Education Table
export const education = pgTable("education", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  school: text("school").notNull(),
  degree: text("degree").notNull(),
  field: text("field"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  current: boolean("current").default(false),
  gpa: text("gpa"),
  honors: text("honors"),
  activities: text("activities"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const educationRelations = relations(education, ({ one }) => ({
  user: one(user, {
    fields: [education.userId],
    references: [user.id],
  }),
}));

// Certification Table
export const certification = pgTable("certification", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  organization: text("organization").notNull(),
  issueDate: timestamp("issue_date").notNull(),
  expirationDate: timestamp("expiration_date"),
  credentialId: text("credential_id"),
  credentialUrl: text("credential_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const certificationRelations = relations(certification, ({ one }) => ({
  user: one(user, {
    fields: [certification.userId],
    references: [user.id],
  }),
}));

// AI Analysis History
export const aiAnalysis = pgTable("ai_analysis", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'stock' | 'fund'
  query: text("query").notNull(),
  result: text("result"), // JSON string or text summary
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const aiAnalysisRelations = relations(aiAnalysis, ({ one }) => ({
  user: one(user, {
    fields: [aiAnalysis.userId],
    references: [user.id],
  }),
}));

// Stock Analysis (RAG)
export const stock = pgTable("stock", {
  symbol: text("symbol").primaryKey(),
  name: text("name").notNull(),
  ragAnalysisId: text("rag_analysis_id"),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const stockRelations = relations(stock, ({ many }) => ({
  analyses: many(stockAnalysis),
}));

export const stockAnalysis = pgTable("stock_analysis", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  symbol: text("symbol")
    .notNull()
    .references(() => stock.symbol, { onDelete: "cascade" }),
  ragAnalysisId: text("rag_analysis_id").notNull(),
  title: text("title"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const stockAnalysisRelations = relations(stockAnalysis, ({ one }) => ({
  user: one(user, {
    fields: [stockAnalysis.userId],
    references: [user.id],
  }),
  stock: one(stock, {
    fields: [stockAnalysis.symbol],
    references: [stock.symbol],
  }),
}));

// Fund Analysis (RAG)
export const fund = pgTable("fund", {
  id: text("id").primaryKey(), // Ticker or slug, e.g. "bridgewater"
  name: text("name").notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const fundRelations = relations(fund, ({ many }) => ({
  analyses: many(fundAnalysis),
}));

export const fundAnalysis = pgTable("fund_analysis", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .references(() => user.id, { onDelete: "cascade" }),
  fundId: text("fund_id")
    .notNull()
    .references(() => fund.id, { onDelete: "cascade" }),
  ragAnalysisId: text("rag_analysis_id").notNull(),
  title: text("title"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const fundAnalysisRelations = relations(fundAnalysis, ({ one }) => ({
  user: one(user, {
    fields: [fundAnalysis.userId],
    references: [user.id],
  }),
  fund: one(fund, {
    fields: [fundAnalysis.fundId],
    references: [fund.id],
  }),
}));

// Job Posting System (external job links)
export const jobPosting = pgTable("job_posting", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  companyId: text("company_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  type: text("type").notNull(), // 'Full-time', 'Contract', 'Internship'
  salaryRange: text("salary_range"),
  externalUrl: text("external_url"), // Link to external application
  tags: text("tags").array(), // Array of strings
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const jobPostingRelations = relations(jobPosting, ({ one }) => ({
  company: one(user, {
    fields: [jobPosting.companyId],
    references: [user.id],
  }),
}));

// User Relations (consolidated)
export const userRelations = relations(user, ({ many }) => ({
  posts: many(post),
  followers: many(follow, {
    relationName: "followers",
  }),
  following: many(follow, {
    relationName: "following",
  }),
  postLikes: many(postLike),
  comments: many(comment),
  tournamentParticipants: many(tournamentParticipant),
  educations: many(education),
  certifications: many(certification),
  aiAnalyses: many(aiAnalysis),
  stockAnalyses: many(stockAnalysis),
  fundAnalyses: many(fundAnalysis),
  jobPostings: many(jobPosting),
}));
