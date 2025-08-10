export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role: 'participant' | 'mentor' | 'judge' | 'organizer' | 'sponsor';
  skills?: string[];
  bio?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Event {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'published' | 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  location?: string;
  maxParticipants?: number;
  organizerId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  status: 'forming' | 'active' | 'submitted' | 'complete';
  maxMembers: number;
  projectIdea?: string;
  tags?: string[];
  eventId: string;
  leaderId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role?: string;
  joinedAt?: string;
  user?: User;
}

export interface Submission {
  id: string;
  teamId: string;
  title: string;
  description?: string;
  status: 'draft' | 'submitted' | 'under_review' | 'reviewed';
  repoUrl?: string;
  demoUrl?: string;
  videoUrl?: string;
  fileUrls?: string[];
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Judgment {
  id: string;
  judgeId: string;
  submissionId: string;
  innovationScore?: number;
  technicalScore?: number;
  designScore?: number;
  presentationScore?: number;
  overallScore?: number;
  feedback?: string;
  completedAt?: string;
  createdAt?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  eventId: string;
  authorId: string;
  pinned: boolean;
  createdAt?: string;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  content: string;
  eventId?: string;
  parentId?: string;
  likes: number;
  createdAt?: string;
  author?: User;
}

export interface EventSession {
  id: string;
  title: string;
  description?: string;
  type: string;
  startTime: string;
  endTime: string;
  location?: string;
  speakerId?: string;
  eventId: string;
  maxAttendees?: number;
  createdAt?: string;
}

export interface MentorSession {
  id: string;
  mentorId: string;
  teamId?: string;
  sessionTime: string;
  duration: number;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt?: string;
  mentor?: User;
  team?: Team;
}
