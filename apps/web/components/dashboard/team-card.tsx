import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function TeamCard() {
  const teamMembers = [
    {
      id: "1",
      name: "Alex Johnson",
      role: "Team Lead",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    },
    {
      id: "2", 
      name: "Sarah Chen",
      role: "Developer",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face",
    },
    {
      id: "3",
      name: "Mike Rodriguez", 
      role: "Designer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
  ];

  return (
    <Card className="bg-white rounded-2xl shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-deep-navy" data-testid="team-name">
            My Team: AI Innovators
          </h3>
          <Badge className="bg-success bg-opacity-10 text-success" data-testid="team-status">
            Active
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {teamMembers.map((member) => (
            <div 
              key={member.id} 
              className="flex items-center space-x-3 p-3 bg-soft-grey rounded-xl"
              data-testid={`team-member-${member.id}`}
            >
              <Avatar className="w-10 h-10">
                <AvatarImage src={member.avatar} alt={member.name} className="object-cover" />
                <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-deep-navy text-sm">{member.name}</div>
                <div className="text-xs text-dark-grey">{member.role}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-soft-grey rounded-xl p-4">
          <h4 className="font-medium text-deep-navy mb-2" data-testid="project-title">
            Project: AI-Powered Study Assistant
          </h4>
          <p className="text-sm text-dark-grey mb-3" data-testid="project-description">
            An intelligent learning companion that adapts to individual learning styles using machine learning algorithms.
          </p>
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Badge className="bg-primary-blue text-white text-xs" data-testid="project-tag-1">
                AI/ML
              </Badge>
              <Badge className="bg-accent-teal text-white text-xs" data-testid="project-tag-2">
                Education
              </Badge>
            </div>
            <Button 
              variant="link" 
              className="text-primary-blue hover:underline text-sm font-medium p-0"
              data-testid="view-details-button"
            >
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
