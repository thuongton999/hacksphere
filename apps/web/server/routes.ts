import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
// Import planets routes - will be added inline to avoid conflicts
import { 
  insertEventSchema,
  insertTeamSchema,
  insertSubmissionSchema,
  insertJudgmentSchema,
  insertUserSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User routes
  app.put('/api/users/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updateData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUserProfile(userId, updateData);
      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(400).json({ message: "Failed to update profile" });
    }
  });

  app.get('/api/users/mentors', isAuthenticated, async (req, res) => {
    try {
      const mentors = await storage.getUsersByRole('mentor');
      res.json(mentors);
    } catch (error) {
      console.error("Error fetching mentors:", error);
      res.status(500).json({ message: "Failed to fetch mentors" });
    }
  });

  app.get('/api/users/judges', isAuthenticated, async (req, res) => {
    try {
      const judges = await storage.getUsersByRole('judge');
      res.json(judges);
    } catch (error) {
      console.error("Error fetching judges:", error);
      res.status(500).json({ message: "Failed to fetch judges" });
    }
  });

  // Event routes
  app.get('/api/events', isAuthenticated, async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get('/api/events/:id', isAuthenticated, async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.post('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData, userId);
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(400).json({ message: "Failed to create event" });
    }
  });

  // Team routes
  app.get('/api/teams', isAuthenticated, async (req, res) => {
    try {
      const eventId = req.query.eventId as string;
      const teams = await storage.getTeams(eventId);
      res.json(teams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  app.get('/api/teams/:id', isAuthenticated, async (req, res) => {
    try {
      const team = await storage.getTeam(req.params.id);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      res.json(team);
    } catch (error) {
      console.error("Error fetching team:", error);
      res.status(500).json({ message: "Failed to fetch team" });
    }
  });

  app.get('/api/teams/:id/members', isAuthenticated, async (req, res) => {
    try {
      const members = await storage.getTeamMembers(req.params.id);
      res.json(members);
    } catch (error) {
      console.error("Error fetching team members:", error);
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  app.post('/api/teams', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const teamData = insertTeamSchema.parse(req.body);
      const team = await storage.createTeam(teamData, userId);
      res.status(201).json(team);
    } catch (error) {
      console.error("Error creating team:", error);
      res.status(400).json({ message: "Failed to create team" });
    }
  });

  app.post('/api/teams/:id/join', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const teamId = req.params.id;
      const { role } = req.body;
      
      const member = await storage.addTeamMember({
        teamId,
        userId,
        role: role || "Member",
      });
      res.status(201).json(member);
    } catch (error) {
      console.error("Error joining team:", error);
      res.status(400).json({ message: "Failed to join team" });
    }
  });

  app.delete('/api/teams/:teamId/members/:userId', isAuthenticated, async (req, res) => {
    try {
      await storage.removeTeamMember(req.params.teamId, req.params.userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing team member:", error);
      res.status(400).json({ message: "Failed to remove team member" });
    }
  });

  app.get('/api/users/:id/teams', isAuthenticated, async (req, res) => {
    try {
      const teams = await storage.getTeamsByUser(req.params.id);
      res.json(teams);
    } catch (error) {
      console.error("Error fetching user teams:", error);
      res.status(500).json({ message: "Failed to fetch user teams" });
    }
  });

  // Submission routes
  app.get('/api/submissions', isAuthenticated, async (req, res) => {
    try {
      const eventId = req.query.eventId as string;
      const submissions = await storage.getSubmissions(eventId);
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  app.get('/api/submissions/:id', isAuthenticated, async (req, res) => {
    try {
      const submission = await storage.getSubmission(req.params.id);
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      res.json(submission);
    } catch (error) {
      console.error("Error fetching submission:", error);
      res.status(500).json({ message: "Failed to fetch submission" });
    }
  });

  app.post('/api/submissions', isAuthenticated, async (req, res) => {
    try {
      const submissionData = insertSubmissionSchema.extend({
        teamId: z.string(),
      }).parse(req.body);
      const submission = await storage.createSubmission(submissionData);
      res.status(201).json(submission);
    } catch (error) {
      console.error("Error creating submission:", error);
      res.status(400).json({ message: "Failed to create submission" });
    }
  });

  app.put('/api/submissions/:id', isAuthenticated, async (req, res) => {
    try {
      const updateData = insertSubmissionSchema.partial().parse(req.body);
      const submission = await storage.updateSubmission(req.params.id, updateData);
      res.json(submission);
    } catch (error) {
      console.error("Error updating submission:", error);
      res.status(400).json({ message: "Failed to update submission" });
    }
  });

  app.get('/api/teams/:id/submissions', isAuthenticated, async (req, res) => {
    try {
      const submissions = await storage.getSubmissionsByTeam(req.params.id);
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching team submissions:", error);
      res.status(500).json({ message: "Failed to fetch team submissions" });
    }
  });

  // Judgment routes
  app.get('/api/judgments', isAuthenticated, async (req, res) => {
    try {
      const submissionId = req.query.submissionId as string;
      const judgments = await storage.getJudgments(submissionId);
      res.json(judgments);
    } catch (error) {
      console.error("Error fetching judgments:", error);
      res.status(500).json({ message: "Failed to fetch judgments" });
    }
  });

  app.post('/api/judgments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const judgmentData = insertJudgmentSchema.extend({
        submissionId: z.string(),
      }).parse(req.body);
      
      const judgment = await storage.createJudgment({
        ...judgmentData,
        judgeId: userId,
      });
      res.status(201).json(judgment);
    } catch (error) {
      console.error("Error creating judgment:", error);
      res.status(400).json({ message: "Failed to create judgment" });
    }
  });

  app.get('/api/users/:id/judgments', isAuthenticated, async (req, res) => {
    try {
      const judgments = await storage.getJudgmentsByJudge(req.params.id);
      res.json(judgments);
    } catch (error) {
      console.error("Error fetching judge judgments:", error);
      res.status(500).json({ message: "Failed to fetch judge judgments" });
    }
  });

  // Announcement routes
  app.get('/api/events/:id/announcements', isAuthenticated, async (req, res) => {
    try {
      const announcements = await storage.getAnnouncements(req.params.id);
      res.json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.post('/api/announcements', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const announcementData = z.object({
        title: z.string(),
        content: z.string(),
        type: z.string().default("info"),
        eventId: z.string(),
        pinned: z.boolean().default(false),
      }).parse(req.body);
      
      const announcement = await storage.createAnnouncement({
        ...announcementData,
        authorId: userId,
      });
      res.status(201).json(announcement);
    } catch (error) {
      console.error("Error creating announcement:", error);
      res.status(400).json({ message: "Failed to create announcement" });
    }
  });

  // Community routes
  app.get('/api/community/posts', isAuthenticated, async (req, res) => {
    try {
      const eventId = req.query.eventId as string;
      const posts = await storage.getCommunityPosts(eventId);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching community posts:", error);
      res.status(500).json({ message: "Failed to fetch community posts" });
    }
  });

  app.post('/api/community/posts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postData = z.object({
        content: z.string(),
        eventId: z.string().optional(),
        parentId: z.string().optional(),
      }).parse(req.body);
      
      const post = await storage.createCommunityPost({
        ...postData,
        authorId: userId,
      });
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating community post:", error);
      res.status(400).json({ message: "Failed to create community post" });
    }
  });

  // Session routes
  app.get('/api/events/:id/sessions', isAuthenticated, async (req, res) => {
    try {
      const sessions = await storage.getEventSessions(req.params.id);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching event sessions:", error);
      res.status(500).json({ message: "Failed to fetch event sessions" });
    }
  });

  app.get('/api/mentor-sessions', isAuthenticated, async (req, res) => {
    try {
      const mentorId = req.query.mentorId as string;
      const sessions = await storage.getMentorSessions(mentorId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching mentor sessions:", error);
      res.status(500).json({ message: "Failed to fetch mentor sessions" });
    }
  });

  app.post('/api/mentor-sessions', isAuthenticated, async (req, res) => {
    try {
      const sessionData = z.object({
        mentorId: z.string(),
        teamId: z.string().optional(),
        sessionTime: z.string().transform(str => new Date(str)),
        duration: z.number().default(30),
        notes: z.string().optional(),
      }).parse(req.body);
      
      const session = await storage.createMentorSession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating mentor session:", error);
      res.status(400).json({ message: "Failed to create mentor session" });
    }
  });

  // Register Planets gamification routes inline
  // These would normally be imported but are added inline to avoid conflicts
  
  // Existing planets routes - using mock data for now since storage methods need to be implemented
  app.get("/api/v1/planets/lands", async (req, res) => {
    const mockLands = [
      {
        land: { id: "1", title: "AI Study Buddy", tagline: "Personalized learning with AI", badges: ["AI", "EdTech", "Mobile"], totalChips: 67 },
        team: { id: "1", name: "Neural Networks" },
        totalChips: 67,
        chipCount: 8
      },
      {
        land: { id: "2", title: "Smart Finance", tagline: "AI-powered financial planning", badges: ["FinTech", "AI", "Web"], totalChips: 54 },
        team: { id: "2", name: "Quantum Leap" },
        totalChips: 54,
        chipCount: 6
      }
    ];
    res.json(mockLands);
  });

  app.get("/api/v1/planets/leaderboard/:category", async (req, res) => {
    const mockLeaderboard = [
      { rank: 1, team: { id: "1", name: "Neural Networks" }, totalChips: 67 },
      { rank: 2, team: { id: "2", name: "Quantum Leap" }, totalChips: 54 }
    ];
    res.json(mockLeaderboard);
  });

  app.post("/api/v1/planets/chips", isAuthenticated, async (req, res) => {
    // Mock chip allocation
    res.json({ success: true, message: "Chips allocated successfully" });
  });

  app.get("/api/v1/planets/mentors/available", async (req, res) => {
    const mockMentors = [
      { id: "1", name: "Dr. Sarah Wilson", expertise: ["AI", "ML"], available: true }
    ];
    res.json(mockMentors);
  });

  app.post("/api/v1/planets/schedule", isAuthenticated, async (req, res) => {
    res.json({ success: true, message: "Session scheduled successfully" });
  });

  app.get("/api/v1/planets/teams/:teamId/build-logs", async (req, res) => {
    res.json([]);
  });

  app.post("/api/v1/planets/build-logs", isAuthenticated, async (req, res) => {
    res.json({ success: true });
  });

  // Add Planet Home routes inline to avoid import conflicts
  app.get("/api/v1/planets/map/teams", async (req, res) => {
    const mockTeamMapData = [
      { id: "1", awards: 85, centroid: [400, 300], track: "AI/ML", myTeam: true },
      { id: "2", awards: 62, centroid: [600, 200], track: "Web3", myTeam: false },
      { id: "3", awards: 78, centroid: [300, 500], track: "Mobile", myTeam: false },
      { id: "4", awards: 43, centroid: [700, 400], track: "IoT", myTeam: false },
      { id: "5", awards: 91, centroid: [500, 600], track: "FinTech", myTeam: false }
    ];
    res.json(mockTeamMapData);
  });

  app.get("/api/v1/planets/map/investors", async (req, res) => {
    const mockInvestorMapData = [
      { id: "inv1", interests: ["AI", "Healthcare", "EdTech"], chips: 45, competitor: false },
      { id: "inv2", interests: ["Web3", "DeFi", "Gaming"], chips: 32, competitor: true },
      { id: "inv3", interests: ["Climate", "Sustainability", "Energy"], chips: 28, competitor: false },
      { id: "inv4", interests: ["FinTech", "B2B", "Enterprise"], chips: 51, competitor: true }
    ];
    res.json(mockInvestorMapData);
  });

  app.get("/api/v1/planets/investors/account", async (req, res) => {
    const mockAccount = {
      chipsRemainingDaily: 7,
      totalChipsAllocated: 45,
      introRequestsRemaining: 5,
      portfolioValue: 12400
    };
    res.json(mockAccount);
  });

  const httpServer = createServer(app);
  return httpServer;
}
