import { Card, CardContent } from "@/components/ui/card";
import { Megaphone, Info, CheckCircle } from "lucide-react";

export default function Announcements() {
  const announcements = [
    {
      id: "1",
      title: "Submission Deadline Extended",
      content: "Project submissions now due Sunday at 11:59 PM",
      time: "2 hours ago",
      type: "warning",
      icon: Megaphone,
    },
    {
      id: "2",
      title: "New Workshop Added",
      content: '"Building with OpenAI GPT-4" tomorrow at 3 PM',
      time: "5 hours ago",
      type: "info",
      icon: Info,
    },
    {
      id: "3",
      title: "WiFi Issues Resolved",
      content: "Network connectivity has been restored",
      time: "8 hours ago",
      type: "success",
      icon: CheckCircle,
    },
  ];

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-sunshine-yellow bg-opacity-10 border-l-4 border-sunshine-yellow text-sunshine-yellow";
      case "info":
        return "bg-primary-blue bg-opacity-10 border-l-4 border-primary-blue text-primary-blue";
      case "success":
        return "bg-success bg-opacity-10 border-l-4 border-success text-success";
      default:
        return "bg-mid-grey bg-opacity-10 border-l-4 border-mid-grey text-dark-grey";
    }
  };

  return (
    <Card className="bg-white rounded-2xl shadow-md">
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold text-deep-navy mb-6" data-testid="announcements-title">
          Announcements
        </h3>
        
        <div className="space-y-4">
          {announcements.map((announcement) => {
            const Icon = announcement.icon;
            return (
              <div 
                key={announcement.id}
                className={`p-4 rounded-lg ${getTypeStyles(announcement.type)}`}
                data-testid={`announcement-${announcement.id}`}
              >
                <div className="flex items-start space-x-3">
                  <Icon className="w-5 h-5 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-deep-navy text-sm" data-testid={`announcement-title-${announcement.id}`}>
                      {announcement.title}
                    </h4>
                    <p className="text-xs text-dark-grey mt-1" data-testid={`announcement-content-${announcement.id}`}>
                      {announcement.content}
                    </p>
                    <p className="text-xs text-dark-grey mt-1" data-testid={`announcement-time-${announcement.id}`}>
                      {announcement.time}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
