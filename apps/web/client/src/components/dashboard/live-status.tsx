import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LiveStatus() {
  const liveEvents = [
    {
      id: "1",
      title: "Tech Talk: React Best Practices",
      participants: "65 participants",
      color: "bg-warm-coral",
      action: "Join",
    },
    {
      id: "2",
      title: "Mentor Office Hours",
      participants: "12 mentors available",
      color: "bg-accent-teal",
      action: "Book",
    },
  ];

  return (
    <Card className="bg-white rounded-2xl shadow-md">
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold text-deep-navy mb-6" data-testid="live-status-title">
          Live Now
        </h3>
        
        <div className="space-y-3">
          {liveEvents.map((event) => (
            <div 
              key={event.id}
              className={`flex items-center justify-between p-3 ${event.color} bg-opacity-10 rounded-xl`}
              data-testid={`live-event-${event.id}`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 ${event.color} rounded-full animate-pulse`}></div>
                <div>
                  <div className="font-medium text-deep-navy text-sm" data-testid={`live-event-title-${event.id}`}>
                    {event.title}
                  </div>
                  <div className="text-xs text-dark-grey" data-testid={`live-event-participants-${event.id}`}>
                    {event.participants}
                  </div>
                </div>
              </div>
              <Button 
                className={`${event.color} text-white px-3 py-1 rounded-lg text-xs font-medium hover:opacity-90`}
                data-testid={`live-event-action-${event.id}`}
              >
                {event.action}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
