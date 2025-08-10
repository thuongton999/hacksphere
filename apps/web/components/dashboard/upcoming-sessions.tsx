import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Presentation, GraduationCap } from "lucide-react";

export default function UpcomingSessions() {
  const sessions = [
    {
      id: "1",
      title: "Keynote: Future of AI",
      speaker: "Dr. Emily Watson",
      location: "Main Auditorium",
      time: "Today, 2:00 PM - 3:00 PM",
      type: "keynote",
      canJoin: true,
    },
    {
      id: "2",
      title: "Mentor Session: AI Ethics",
      speaker: "Prof. James Liu",
      location: "Room 205",
      time: "Today, 4:30 PM - 5:30 PM",
      type: "mentoring",
      canJoin: false,
    },
  ];

  return (
    <Card className="bg-white rounded-2xl shadow-md">
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold text-deep-navy mb-6" data-testid="upcoming-sessions-title">
          Upcoming Sessions
        </h3>
        
        <div className="space-y-4">
          {sessions.map((session) => (
            <div 
              key={session.id}
              className="flex items-center justify-between p-4 bg-soft-grey rounded-xl"
              data-testid={`session-${session.id}`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  session.type === "keynote" ? "bg-primary-blue" : "bg-accent-teal"
                }`}>
                  {session.type === "keynote" ? (
                    <Presentation className="w-6 h-6 text-white" />
                  ) : (
                    <GraduationCap className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-deep-navy" data-testid={`session-title-${session.id}`}>
                    {session.title}
                  </h4>
                  <p className="text-sm text-dark-grey" data-testid={`session-speaker-${session.id}`}>
                    {session.speaker} • {session.location}
                  </p>
                  <p className="text-xs text-dark-grey" data-testid={`session-time-${session.id}`}>
                    {session.time}
                  </p>
                </div>
              </div>
              <Button 
                className={session.canJoin 
                  ? "bg-primary-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                  : "border border-primary-blue text-primary-blue px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-blue hover:text-white transition-colors"
                }
                variant={session.canJoin ? "default" : "outline"}
                data-testid={`session-action-${session.id}`}
              >
                {session.canJoin ? "Join" : "Book"}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
