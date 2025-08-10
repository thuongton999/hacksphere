import { Users, GraduationCap, Award, Settings, Briefcase, Globe } from "lucide-react";

export const USER_ROLES = [
  {
    value: "participant",
    label: "Participant",
    description: "Join teams, build projects, learn",
    color: "bg-primary-blue",
    icon: Users,
  },
  {
    value: "mentor",
    label: "Mentor", 
    description: "Guide teams, share expertise",
    color: "bg-accent-teal",
    icon: GraduationCap,
  },
  {
    value: "judge",
    label: "Judge",
    description: "Evaluate projects, provide feedback",
    color: "bg-soft-purple",
    icon: Award,
  },
  {
    value: "organizer",
    label: "Organizer",
    description: "Manage events, oversee hackathons",
    color: "bg-warning",
    icon: Settings,
  },
  {
    value: "sponsor",
    label: "Sponsor",
    description: "Support events, discover talent",
    color: "bg-warm-coral",
    icon: Briefcase,
  },
];

export const SKILLS = [
  "AI/ML",
  "Frontend",
  "Backend", 
  "Mobile",
  "Design",
  "Blockchain",
  "Data Science",
  "DevOps",
  "IoT",
  "Cybersecurity",
  "Product Management",
  "Marketing",
];

// Check if Planets feature is enabled
const isPlanetsEnabled = () => {
  return import.meta.env.VITE_HACKSPHERE_PLANETS_ENABLED === 'true' || 
         typeof window !== 'undefined' && 
         (window as any).__PLANETS_ENABLED === true;
};

// Check if Planet Home is enabled 
export const isPlanetHomeEnabled = () => {
  return import.meta.env.VITE_HACKSPHERE_PLANET_HOME_ENABLED === 'true' ||
         typeof window !== 'undefined' && 
         (window as any).__PLANET_HOME_ENABLED === true;
};

export const NAVBAR_ITEMS = {
  participant: [
    { href: "/", icon: "Home", label: isPlanetHomeEnabled() ? "Planet Home" : "Dashboard" },
    { href: "/teams", icon: "Users", label: "Teams" },
    { href: "/schedule", icon: "Calendar", label: "Schedule" },
    { href: "/submissions", icon: "Upload", label: "Submissions" },
    { href: "/judging", icon: "Award", label: "Judging" },
    { href: "/mentors", icon: "GraduationCap", label: "Mentors" },
    ...(isPlanetsEnabled() && !isPlanetHomeEnabled() ? [{ href: "/planets/participants", icon: "Globe", label: "Planets" }] : []),
    { href: "/community", icon: "MessageCircle", label: "Community" },
    { href: "/profile", icon: "User", label: "Profile" },
    { type: "divider" },
    { href: "/settings", icon: "Settings", label: "Settings" },
  ],
  mentor: [
    { href: "/", icon: "Home", label: isPlanetHomeEnabled() ? "Planet Home" : "Dashboard" },
    { href: "/teams", icon: "Users", label: "Teams" },
    { href: "/schedule", icon: "Calendar", label: "Schedule" },
    { href: "/mentors", icon: "GraduationCap", label: "Mentors" },
    ...(isPlanetsEnabled() && !isPlanetHomeEnabled() ? [{ href: "/planets/participants", icon: "Globe", label: "Planets" }] : []),
    { href: "/community", icon: "MessageCircle", label: "Community" },
    { href: "/profile", icon: "User", label: "Profile" },
    { type: "divider" },
    { href: "/settings", icon: "Settings", label: "Settings" },
  ],
  judge: [
    { href: "/", icon: "Home", label: "Dashboard" },
    { href: "/judging", icon: "Award", label: "Judging" },
    { href: "/submissions", icon: "Upload", label: "Submissions" },
    { href: "/schedule", icon: "Calendar", label: "Schedule" },
    { href: "/community", icon: "MessageCircle", label: "Community" },
    ...(isPlanetsEnabled() ? [{ href: "/planets/judges", icon: "Globe", label: "Planets" }] : []),
    { href: "/profile", icon: "User", label: "Profile" },
    { href: "/settings", icon: "Settings", label: "Settings" },
  ],
  organizer: [
    { href: "/", icon: "Home", label: "Dashboard" },
    { href: "/events", icon: "Calendar", label: "Events" },
    { href: "/teams", icon: "Users", label: "Teams" },
    { href: "/submissions", icon: "Upload", label: "Submissions" },
    { href: "/judging", icon: "Award", label: "Judging" },
    { href: "/mentors", icon: "GraduationCap", label: "Mentors" },
    { href: "/analytics", icon: "BarChart", label: "Analytics" },
    ...(isPlanetsEnabled() ? [{ href: "/planets/judges", icon: "Globe", label: "Planets" }] : []),
    { href: "/settings", icon: "Settings", label: "Settings" },
  ],
  sponsor: [
    { href: "/", icon: "Home", label: isPlanetHomeEnabled() ? "Planet Home" : "Dashboard" },
    { href: "/teams", icon: "Users", label: "Teams" },
    { href: "/submissions", icon: "Upload", label: "Submissions" },
    { href: "/planets/investors", icon: "TrendingUp", label: "Investors" },
    { href: "/events", icon: "Calendar", label: "Events" },
    { href: "/analytics", icon: "BarChart", label: "Analytics" },
    { href: "/community", icon: "MessageCircle", label: "Community" },
    { href: "/profile", icon: "User", label: "Profile" },
    { type: "divider" },
    { href: "/settings", icon: "Settings", label: "Settings" },
  ],
};
