import {
  users,
  events,
  teams,
  teamMembers,
  submissions,
  judgments,
  announcements,
  communityPosts,
  eventSessions,
  mentorSessions,
  type User,
  type UpsertUser,
  type Event,
  type InsertEvent,
  type Team,
  type InsertTeam,
  type TeamMember,
  type InsertTeamMember,
  type Submission,
  type InsertSubmission,
  type Judgment,
  type InsertJudgment,
  type Announcement,
  type InsertAnnouncement,
  type CommunityPost,
  type InsertCommunityPost,
  type EventSession,
  type InsertEventSession,
  type MentorSession,
  type InsertMentorSession,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, or, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUsersByRole(role: string): Promise<User[]>;
  updateUserProfile(id: string, data: Partial<User>): Promise<User>;

  // Event operations
  getEvents(): Promise<Event[]>;
  getEvent(id: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent, organizerId: string): Promise<Event>;
  updateEvent(id: string, data: Partial<Event>): Promise<Event>;
  getEventsByOrganizer(organizerId: string): Promise<Event[]>;

  // Team operations
  getTeams(eventId?: string): Promise<Team[]>;
  getTeam(id: string): Promise<Team | undefined>;
  createTeam(team: InsertTeam, leaderId: string): Promise<Team>;
  updateTeam(id: string, data: Partial<Team>): Promise<Team>;
  getTeamsByUser(userId: string): Promise<Team[]>;
  getTeamMembers(teamId: string): Promise<(TeamMember & { user: User })[]>;
  addTeamMember(teamMember: InsertTeamMember): Promise<TeamMember>;
  removeTeamMember(teamId: string, userId: string): Promise<void>;

  // Submission operations
  getSubmissions(eventId?: string): Promise<Submission[]>;
  getSubmission(id: string): Promise<Submission | undefined>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  updateSubmission(id: string, data: Partial<Submission>): Promise<Submission>;
  getSubmissionsByTeam(teamId: string): Promise<Submission[]>;

  // Judgment operations
  getJudgments(submissionId?: string): Promise<Judgment[]>;
  createJudgment(judgment: InsertJudgment): Promise<Judgment>;
  updateJudgment(id: string, data: Partial<Judgment>): Promise<Judgment>;
  getJudgmentsByJudge(judgeId: string): Promise<Judgment[]>;

  // Announcement operations
  getAnnouncements(eventId: string): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: string, data: Partial<Announcement>): Promise<Announcement>;

  // Community operations
  getCommunityPosts(eventId?: string): Promise<CommunityPost[]>;
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;

  // Session operations
  getEventSessions(eventId: string): Promise<EventSession[]>;
  getMentorSessions(mentorId?: string): Promise<MentorSession[]>;
  createMentorSession(session: InsertMentorSession): Promise<MentorSession>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role as any));
  }

  async updateUserProfile(id: string, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Event operations
  async getEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(desc(events.startDate));
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async createEvent(event: InsertEvent, organizerId: string): Promise<Event> {
    const [newEvent] = await db
      .insert(events)
      .values({ ...event, organizerId })
      .returning();
    return newEvent;
  }

  async updateEvent(id: string, data: Partial<Event>): Promise<Event> {
    const [event] = await db
      .update(events)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    return event;
  }

  async getEventsByOrganizer(organizerId: string): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.organizerId, organizerId))
      .orderBy(desc(events.startDate));
  }

  // Team operations
  async getTeams(eventId?: string): Promise<Team[]> {
    let query = db.select().from(teams);
    
    if (eventId) {
      return await query.where(eq(teams.eventId, eventId)).orderBy(desc(teams.createdAt));
    }
    
    return await query.orderBy(desc(teams.createdAt));
  }

  async getTeam(id: string): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team;
  }

  async createTeam(team: InsertTeam, leaderId: string): Promise<Team> {
    const [newTeam] = await db
      .insert(teams)
      .values({ ...team, leaderId })
      .returning();
    
    // Add leader as team member
    await this.addTeamMember({
      teamId: newTeam.id,
      userId: leaderId,
      role: "Team Lead",
    });
    
    return newTeam;
  }

  async updateTeam(id: string, data: Partial<Team>): Promise<Team> {
    const [team] = await db
      .update(teams)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(teams.id, id))
      .returning();
    return team;
  }

  async getTeamsByUser(userId: string): Promise<Team[]> {
    const userTeams = await db
      .select({ team: teams })
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(eq(teamMembers.userId, userId));
    
    return userTeams.map(row => row.team);
  }

  async getTeamMembers(teamId: string): Promise<(TeamMember & { user: User })[]> {
    const members = await db
      .select()
      .from(teamMembers)
      .innerJoin(users, eq(teamMembers.userId, users.id))
      .where(eq(teamMembers.teamId, teamId))
      .orderBy(asc(teamMembers.joinedAt));
    
    return members.map(row => ({
      ...row.team_members,
      user: row.users,
    }));
  }

  async addTeamMember(teamMember: InsertTeamMember): Promise<TeamMember> {
    const [member] = await db
      .insert(teamMembers)
      .values(teamMember)
      .returning();
    return member;
  }

  async removeTeamMember(teamId: string, userId: string): Promise<void> {
    await db
      .delete(teamMembers)
      .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));
  }

  // Submission operations
  async getSubmissions(eventId?: string): Promise<Submission[]> {
    if (eventId) {
      const eventSubmissions = await db
        .select({ submission: submissions })
        .from(submissions)
        .innerJoin(teams, eq(submissions.teamId, teams.id))
        .where(eq(teams.eventId, eventId))
        .orderBy(desc(submissions.submittedAt));
      
      return eventSubmissions.map(row => row.submission);
    }
    
    return await db.select().from(submissions).orderBy(desc(submissions.submittedAt));
  }

  async getSubmission(id: string): Promise<Submission | undefined> {
    const [submission] = await db.select().from(submissions).where(eq(submissions.id, id));
    return submission;
  }

  async createSubmission(submission: InsertSubmission): Promise<Submission> {
    const [newSubmission] = await db
      .insert(submissions)
      .values(submission)
      .returning();
    return newSubmission;
  }

  async updateSubmission(id: string, data: Partial<Submission>): Promise<Submission> {
    const [submission] = await db
      .update(submissions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(submissions.id, id))
      .returning();
    return submission;
  }

  async getSubmissionsByTeam(teamId: string): Promise<Submission[]> {
    return await db
      .select()
      .from(submissions)
      .where(eq(submissions.teamId, teamId))
      .orderBy(desc(submissions.createdAt));
  }

  // Judgment operations
  async getJudgments(submissionId?: string): Promise<Judgment[]> {
    let query = db.select().from(judgments);
    
    if (submissionId) {
      return await query
        .where(eq(judgments.submissionId, submissionId))
        .orderBy(desc(judgments.createdAt));
    }
    
    return await query.orderBy(desc(judgments.createdAt));
  }

  async createJudgment(judgment: InsertJudgment): Promise<Judgment> {
    const [newJudgment] = await db
      .insert(judgments)
      .values(judgment)
      .returning();
    return newJudgment;
  }

  async updateJudgment(id: string, data: Partial<Judgment>): Promise<Judgment> {
    const [judgment] = await db
      .update(judgments)
      .set(data)
      .where(eq(judgments.id, id))
      .returning();
    return judgment;
  }

  async getJudgmentsByJudge(judgeId: string): Promise<Judgment[]> {
    return await db
      .select()
      .from(judgments)
      .where(eq(judgments.judgeId, judgeId))
      .orderBy(desc(judgments.createdAt));
  }

  // Announcement operations
  async getAnnouncements(eventId: string): Promise<Announcement[]> {
    return await db
      .select()
      .from(announcements)
      .where(eq(announcements.eventId, eventId))
      .orderBy(desc(announcements.pinned), desc(announcements.createdAt));
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [newAnnouncement] = await db
      .insert(announcements)
      .values(announcement)
      .returning();
    return newAnnouncement;
  }

  async updateAnnouncement(id: string, data: Partial<Announcement>): Promise<Announcement> {
    const [announcement] = await db
      .update(announcements)
      .set(data)
      .where(eq(announcements.id, id))
      .returning();
    return announcement;
  }

  // Community operations
  async getCommunityPosts(eventId?: string): Promise<CommunityPost[]> {
    let query = db.select().from(communityPosts);
    
    if (eventId) {
      return await query
        .where(eq(communityPosts.eventId, eventId))
        .orderBy(desc(communityPosts.createdAt));
    }
    
    return await query.orderBy(desc(communityPosts.createdAt));
  }

  async createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost> {
    const [newPost] = await db
      .insert(communityPosts)
      .values(post)
      .returning();
    return newPost;
  }

  // Session operations
  async getEventSessions(eventId: string): Promise<EventSession[]> {
    return await db
      .select()
      .from(eventSessions)
      .where(eq(eventSessions.eventId, eventId))
      .orderBy(asc(eventSessions.startTime));
  }

  async getMentorSessions(mentorId?: string): Promise<MentorSession[]> {
    let query = db.select().from(mentorSessions);
    
    if (mentorId) {
      return await query
        .where(eq(mentorSessions.mentorId, mentorId))
        .orderBy(desc(mentorSessions.sessionTime));
    }
    
    return await query.orderBy(desc(mentorSessions.sessionTime));
  }

  async createMentorSession(session: InsertMentorSession): Promise<MentorSession> {
    const [newSession] = await db
      .insert(mentorSessions)
      .values(session)
      .returning();
    return newSession;
  }
}

export const storage = new DatabaseStorage();
