import { Users, GraduationCap, Award, Settings, Briefcase } from "lucide-react";
import type { User } from "@/types";

interface RoleBadgeProps {
  user: User;
}

const roleConfig = {
  participant: {
    icon: Users,
    color: "bg-primary-blue",
    label: "Participant",
  },
  mentor: {
    icon: GraduationCap,
    color: "bg-accent-teal",
    label: "Mentor",
  },
  judge: {
    icon: Award,
    color: "bg-soft-purple",
    label: "Judge",
  },
  organizer: {
    icon: Settings,
    color: "bg-warning",
    label: "Organizer",
  },
  sponsor: {
    icon: Briefcase,
    color: "bg-warm-coral",
    label: "Sponsor",
  },
};

export default function RoleBadge({ user }: RoleBadgeProps) {
  const config = roleConfig[user.role];
  const Icon = config.icon;

  return (
    <div className="bg-primary-blue bg-opacity-10 rounded-xl p-4" data-testid="role-badge">
      <div className="flex items-center">
        <div className={`w-8 h-8 ${config.color} rounded-lg flex items-center justify-center mr-3`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="font-medium text-deep-navy text-sm" data-testid="role-label">
            {config.label}
          </div>
          <div className="text-xs text-dark-grey" data-testid="user-name">
            {user.firstName} {user.lastName}
          </div>
        </div>
      </div>
    </div>
  );
}
