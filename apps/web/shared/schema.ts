import { sql, relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles enum
export const userRoleEnum = pgEnum("user_role", [
  "participant",
  "mentor", 
  "judge",
  "organizer",
  "sponsor"
]);

// Event status enum
export const eventStatusEnum = pgEnum("event_status", [
  "draft",
  "published",
  "active",
  "completed",
  "cancelled"
]);

// Team status enum
export const teamStatusEnum = pgEnum("team_status", [
  "forming",
  "active",
  "submitted",
  "complete"
]);

// Submission status enum
export const submissionStatusEnum = pgEnum("submission_status", [
  "draft",
  "submitted",
  "under_review",
  "reviewed"
]);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").notNull().default("participant"),
  skills: text("skills").array(),
  bio: text("bio"),
  githubUrl: varchar("github_url"),
  linkedinUrl: varchar("linkedin_url"),
  websiteUrl: varchar("website_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Events table
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  status: eventStatusEnum("status").notNull().default("draft"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  location: varchar("location"),
  maxParticipants: integer("max_participants"),
  organizerId: varchar("organizer_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Teams table
export const teams = pgTable("teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  status: teamStatusEnum("status").notNull().default("forming"),
  maxMembers: integer("max_members").notNull().default(4),
  projectIdea: text("project_idea"),
  tags: text("tags").array(),
  eventId: varchar("event_id").notNull().references(() => events.id),
  leaderId: varchar("leader_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Team members table
export const teamMembers = pgTable("team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Sessions table for events
export const eventSessions = pgTable("event_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // keynote, workshop, mentoring, judging
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  location: varchar("location"),
  speakerId: varchar("speaker_id").references(() => users.id),
  eventId: varchar("event_id").notNull().references(() => events.id),
  maxAttendees: integer("max_attendees"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Mentor sessions table
export const mentorSessions = pgTable("mentor_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mentorId: varchar("mentor_id").notNull().references(() => users.id),
  teamId: varchar("team_id").references(() => teams.id),
  sessionTime: timestamp("session_time").notNull(),
  duration: integer("duration").notNull().default(30), // minutes
  notes: text("notes"),
  status: varchar("status").notNull().default("scheduled"), // scheduled, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

// Submissions table
export const submissions = pgTable("submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").notNull().references(() => teams.id),
  title: varchar("title").notNull(),
  description: text("description"),
  status: submissionStatusEnum("status").notNull().default("draft"),
  repoUrl: varchar("repo_url"),
  demoUrl: varchar("demo_url"),
  videoUrl: varchar("video_url"),
  fileUrls: text("file_urls").array(),
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Judgments table
export const judgments = pgTable("judgments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  judgeId: varchar("judge_id").notNull().references(() => users.id),
  submissionId: varchar("submission_id").notNull().references(() => submissions.id),
  innovationScore: integer("innovation_score"), // 1-10
  technicalScore: integer("technical_score"), // 1-10
  designScore: integer("design_score"), // 1-10
  presentationScore: integer("presentation_score"), // 1-10
  overallScore: integer("overall_score"), // 1-10
  feedback: text("feedback"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Announcements table
export const announcements = pgTable("announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  type: varchar("type").notNull().default("info"), // info, warning, success, error
  eventId: varchar("event_id").notNull().references(() => events.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  pinned: boolean("pinned").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Community posts table
export const communityPosts = pgTable("community_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  eventId: varchar("event_id").references(() => events.id),
  parentId: varchar("parent_id").references(() => communityPosts.id), // for replies
  likes: integer("likes").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  organizedEvents: many(events),
  teamMemberships: many(teamMembers),
  ledTeams: many(teams),
  mentorSessions: many(mentorSessions),
  judgments: many(judgments),
  announcements: many(announcements),
  communityPosts: many(communityPosts),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  organizer: one(users, {
    fields: [events.organizerId],
    references: [users.id],
  }),
  teams: many(teams),
  sessions: many(eventSessions),
  announcements: many(announcements),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  event: one(events, {
    fields: [teams.eventId],
    references: [events.id],
  }),
  leader: one(users, {
    fields: [teams.leaderId],
    references: [users.id],
  }),
  members: many(teamMembers),
  submissions: many(submissions),
  mentorSessions: many(mentorSessions),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
}));

export const submissionsRelations = relations(submissions, ({ one, many }) => ({
  team: one(teams, {
    fields: [submissions.teamId],
    references: [teams.id],
  }),
  judgments: many(judgments),
}));

export const judgmentsRelations = relations(judgments, ({ one }) => ({
  judge: one(users, {
    fields: [judgments.judgeId],
    references: [users.id],
  }),
  submission: one(submissions, {
    fields: [judgments.submissionId],
    references: [submissions.id],
  }),
}));

// Schema types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertEvent = typeof events.$inferInsert;
export type Event = typeof events.$inferSelect;

export type InsertTeam = typeof teams.$inferInsert;
export type Team = typeof teams.$inferSelect;

export type InsertTeamMember = typeof teamMembers.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;

export type InsertSubmission = typeof submissions.$inferInsert;
export type Submission = typeof submissions.$inferSelect;

export type InsertJudgment = typeof judgments.$inferInsert;
export type Judgment = typeof judgments.$inferSelect;

export type InsertAnnouncement = typeof announcements.$inferInsert;
export type Announcement = typeof announcements.$inferSelect;

export type InsertCommunityPost = typeof communityPosts.$inferInsert;
export type CommunityPost = typeof communityPosts.$inferSelect;

export type InsertEventSession = typeof eventSessions.$inferInsert;
export type EventSession = typeof eventSessions.$inferSelect;

export type InsertMentorSession = typeof mentorSessions.$inferInsert;
export type MentorSession = typeof mentorSessions.$inferSelect;

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  skills: true,
  bio: true,
  githubUrl: true,
  linkedinUrl: true,
  websiteUrl: true,
});

export const insertEventSchema = createInsertSchema(events).pick({
  name: true,
  description: true,
  startDate: true,
  endDate: true,
  location: true,
  maxParticipants: true,
});

export const insertTeamSchema = createInsertSchema(teams).pick({
  name: true,
  description: true,
  maxMembers: true,
  projectIdea: true,
  tags: true,
});

export const insertSubmissionSchema = createInsertSchema(submissions).pick({
  title: true,
  description: true,
  repoUrl: true,
  demoUrl: true,
  videoUrl: true,
  fileUrls: true,
});

export const insertJudgmentSchema = createInsertSchema(judgments).pick({
  innovationScore: true,
  technicalScore: true,
  designScore: true,
  presentationScore: true,
  overallScore: true,
  feedback: true,
});

// ===== PLANETS GAMIFICATION TABLES =====
// These tables are only used when HACKSPHERE_PLANETS_ENABLED=true

// Lands table - team hubs in the galaxy map
export const lands = pgTable("lands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  tagline: text("tagline"),
  demoUrl: varchar("demo_url"),
  avatarUrl: varchar("avatar_url"),
  badges: text("badges").array().default(sql`ARRAY[]::text[]`),
  totalChips: integer("total_chips").notNull().default(0),
  currentRank: integer("current_rank"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Posts table - build logs for each land
export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  landId: varchar("land_id").notNull().references(() => lands.id, { onDelete: "cascade" }),
  authorUserId: varchar("author_user_id").notNull().references(() => users.id),
  body: text("body"),
  mediaUrl: varchar("media_url"),
  likesCount: integer("likes_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reactions table - likes on posts
export const reactions = pgTable("reactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type").notNull().default("like"), // only 'like' for now
  createdAt: timestamp("created_at").defaultNow(),
});

// VC accounts table - investor verification and chip quotas
export const vcAccounts = pgTable("vc_accounts", {
  userId: varchar("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  verified: boolean("verified").notNull().default(false),
  chipsQuotaDaily: integer("chips_quota_daily").notNull().default(10),
  chipsRemainingDaily: integer("chips_remaining_daily").notNull().default(10),
  lastResetDate: timestamp("last_reset_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chips table - investor allocations to teams
export const chips = pgTable("chips", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vcUserId: varchar("vc_user_id").notNull().references(() => users.id),
  teamId: varchar("team_id").notNull().references(() => teams.id),
  amount: integer("amount").notNull(), // 1-10 chips
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Leaderboards table - weekly team rankings
export const leaderboards = pgTable("leaderboards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").notNull().references(() => teams.id),
  weekStart: timestamp("week_start").notNull(),
  score: integer("score").notNull().default(0),
  breakdown: jsonb("breakdown").notNull().default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at").defaultNow(),
});

// User points table - gamification points tracking
export const userPoints = pgTable("user_points", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  action: varchar("action").notNull(), // create_land, build_log, demo_added, etc.
  points: integer("points").notNull(),
  description: text("description"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Intro requests table - investor connection requests
export const introRequests = pgTable("intro_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  investorUserId: varchar("investor_user_id").notNull().references(() => users.id),
  teamId: varchar("team_id").notNull().references(() => teams.id),
  status: varchar("status").notNull().default("pending"), // pending, approved, declined
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Planets relations
export const landsRelations = relations(lands, ({ one, many }) => ({
  team: one(teams, {
    fields: [lands.teamId],
    references: [teams.id],
  }),
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  land: one(lands, {
    fields: [posts.landId],
    references: [lands.id],
  }),
  author: one(users, {
    fields: [posts.authorUserId],
    references: [users.id],
  }),
  reactions: many(reactions),
}));

export const reactionsRelations = relations(reactions, ({ one }) => ({
  post: one(posts, {
    fields: [reactions.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [reactions.userId],
    references: [users.id],
  }),
}));

export const vcAccountsRelations = relations(vcAccounts, ({ one }) => ({
  user: one(users, {
    fields: [vcAccounts.userId],
    references: [users.id],
  }),
}));

export const chipsRelations = relations(chips, ({ one }) => ({
  vcUser: one(users, {
    fields: [chips.vcUserId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [chips.teamId],
    references: [teams.id],
  }),
}));

export const leaderboardsRelations = relations(leaderboards, ({ one }) => ({
  team: one(teams, {
    fields: [leaderboards.teamId],
    references: [teams.id],
  }),
}));

export const userPointsRelations = relations(userPoints, ({ one }) => ({
  user: one(users, {
    fields: [userPoints.userId],
    references: [users.id],
  }),
}));

export const introRequestsRelations = relations(introRequests, ({ one }) => ({
  investor: one(users, {
    fields: [introRequests.investorUserId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [introRequests.teamId],
    references: [teams.id],
  }),
}));

// Planets schema types
export type Land = typeof lands.$inferSelect;
export type InsertLand = typeof lands.$inferInsert;

export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;

export type Reaction = typeof reactions.$inferSelect;
export type InsertReaction = typeof reactions.$inferInsert;

export type VcAccount = typeof vcAccounts.$inferSelect;
export type InsertVcAccount = typeof vcAccounts.$inferInsert;

export type Chip = typeof chips.$inferSelect;
export type InsertChip = typeof chips.$inferInsert;

export type Leaderboard = typeof leaderboards.$inferSelect;
export type InsertLeaderboard = typeof leaderboards.$inferInsert;

export type UserPoint = typeof userPoints.$inferSelect;
export type InsertUserPoint = typeof userPoints.$inferInsert;

export type IntroRequest = typeof introRequests.$inferSelect;
export type InsertIntroRequest = typeof introRequests.$inferInsert;

// Planets insert schemas
export const insertLandSchema = createInsertSchema(lands).pick({
  title: true,
  tagline: true,
  demoUrl: true,
  avatarUrl: true,
});

export const insertPostSchema = createInsertSchema(posts).pick({
  body: true,
  mediaUrl: true,
});

export const insertChipSchema = createInsertSchema(chips).pick({
  teamId: true,
  amount: true,
  note: true,
});

export const insertIntroRequestSchema = createInsertSchema(introRequests).pick({
  teamId: true,
  note: true,
});
