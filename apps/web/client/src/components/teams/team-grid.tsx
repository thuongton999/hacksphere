import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Team } from "@/types";

interface TeamGridProps {
  teams: Team[];
}

export default function TeamGrid({ teams }: TeamGridProps) {
  // Mock data for demonstration
  const mockTeams = [
    {
      id: "1",
      name: "AI Innovators",
      description: "Building an AI-powered study assistant that adapts to individual learning styles.",
      tags: ["AI/ML", "Education"],
      memberCount: 3,
      maxMembers: 4,
      status: "forming",
      members: [
        { avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" },
        { avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=32&h=32&fit=crop&crop=face" },
        { avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face" },
      ],
    },
    {
      id: "2",
      name: "Blockchain Pioneers",
      description: "Developing a decentralized voting system for secure and transparent elections.",
      tags: ["Blockchain", "Security"],
      memberCount: 2,
      maxMembers: 4,
      status: "forming",
      members: [
        { avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face" },
        { avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face" },
      ],
    },
    {
      id: "3",
      name: "Green Tech Solutions",
      description: "Creating an IoT system for smart energy management in residential buildings.",
      tags: ["IoT", "Sustainability"],
      memberCount: 4,
      maxMembers: 4,
      status: "active",
      members: [
        { avatar: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=32&h=32&fit=crop&crop=face" },
        { avatar: "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=32&h=32&fit=crop&crop=face" },
        { avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=32&h=32&fit=crop&crop=face" },
        { avatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=32&h=32&fit=crop&crop=face" },
      ],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "forming":
        return "bg-warning bg-opacity-10 text-warning";
      case "active":
        return "bg-success bg-opacity-10 text-success";
      default:
        return "bg-mid-grey bg-opacity-10 text-dark-grey";
    }
  };

  const displayTeams = teams.length > 0 ? teams : mockTeams;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {displayTeams.map((team: any) => (
        <Card key={team.id} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-deep-navy" data-testid={`team-name-${team.id}`}>
                {team.name}
              </h3>
              <Badge className={getStatusColor(team.status)} data-testid={`team-status-${team.id}`}>
                {team.memberCount || 0}/{team.maxMembers} members
              </Badge>
            </div>
            
            <p className="text-sm text-dark-grey mb-4" data-testid={`team-description-${team.id}`}>
              {team.description}
            </p>
            
            <div className="flex space-x-2 mb-4">
              {(team.tags || []).map((tag: string, index: number) => (
                <Badge 
                  key={index}
                  className="bg-primary-blue text-white text-xs"
                  data-testid={`team-tag-${team.id}-${index}`}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                {(team.members || []).map((member: any, index: number) => (
                  <Avatar 
                    key={index}
                    className="w-8 h-8 border-2 border-white"
                    data-testid={`team-member-avatar-${team.id}-${index}`}
                  >
                    <AvatarImage src={member.avatar} className="object-cover" />
                    <AvatarFallback>M{index + 1}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              {team.status === "active" ? (
                <span className="text-dark-grey text-sm">Team Full</span>
              ) : (
                <Button 
                  variant="outline"
                  className="text-primary-blue hover:bg-primary-blue hover:text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors border border-primary-blue"
                  data-testid={`join-team-button-${team.id}`}
                >
                  Join Team
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
