import { Card, CardContent } from "@/components/ui/card";
import { Users, Briefcase, GraduationCap, Upload } from "lucide-react";

export default function EventStats() {
  const stats = [
    {
      label: "Participants",
      value: "1,247",
      icon: Users,
      color: "bg-primary-blue",
    },
    {
      label: "Teams",
      value: "312",
      icon: Briefcase,
      color: "bg-accent-teal",
    },
    {
      label: "Mentors",
      value: "89",
      icon: GraduationCap,
      color: "bg-soft-purple",
    },
    {
      label: "Submissions",
      value: "156",
      icon: Upload,
      color: "bg-warning",
    },
  ];

  return (
    <Card className="bg-white rounded-2xl shadow-md">
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold text-deep-navy mb-6" data-testid="event-stats-title">
          Event Stats
        </h3>
        
        <div className="space-y-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index}
                className="flex items-center justify-between"
                data-testid={`stat-${stat.label.toLowerCase()}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-dark-grey">{stat.label}</span>
                </div>
                <span className="font-semibold text-deep-navy" data-testid={`stat-value-${stat.label.toLowerCase()}`}>
                  {stat.value}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
