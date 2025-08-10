import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import MobileNav from "@/components/layout/mobile-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, Video } from "lucide-react";

export default function Schedule() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-soft-grey flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-dark-grey">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const sessions = [
    {
      id: "1",
      title: "Opening Ceremony",
      description: "Welcome to TechHack 2024! Meet the organizers and learn about the rules.",
      type: "keynote",
      startTime: "2024-03-15T09:00:00",
      endTime: "2024-03-15T10:00:00",
      location: "Main Auditorium",
      speaker: "Dr. Emily Watson",
      isLive: false,
    },
    {
      id: "2",
      title: "AI Workshop: Building with GPT-4",
      description: "Learn how to integrate GPT-4 into your applications effectively.",
      type: "workshop",
      startTime: "2024-03-15T10:30:00",
      endTime: "2024-03-15T12:00:00",
      location: "Workshop Room A",
      speaker: "Prof. James Liu",
      isLive: true,
    },
    {
      id: "3",
      title: "Team Formation Session",
      description: "Find your perfect teammates and start your hackathon journey.",
      type: "networking",
      startTime: "2024-03-15T14:00:00",
      endTime: "2024-03-15T15:30:00",
      location: "Community Space",
      speaker: "Hackathon Organizers",
      isLive: false,
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "keynote":
        return "bg-primary-blue";
      case "workshop":
        return "bg-accent-teal";
      case "networking":
        return "bg-soft-purple";
      default:
        return "bg-dark-grey";
    }
  };

  const formatTime = (timeStr: string) => {
    return new Date(timeStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-soft-grey">
      <Sidebar />
      
      <div className="lg:ml-64">
        <TopBar title="Schedule" />
        
        <main className="p-6">
          {/* Calendar View Controls */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-deep-navy" data-testid="schedule-title">
                TechHack 2024 Schedule
              </h2>
              <div className="flex items-center space-x-4">
                <Button variant="outline" className="border-mid-grey" data-testid="button-export">
                  <Calendar className="w-4 h-4 mr-2" />
                  Export Calendar
                </Button>
                <select className="px-4 py-2 border border-mid-grey rounded-xl focus:border-primary-blue" data-testid="select-view">
                  <option value="day">Day View</option>
                  <option value="week">Week View</option>
                  <option value="agenda">Agenda View</option>
                </select>
              </div>
            </div>

            {/* Filter Tags */}
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-primary-blue text-white cursor-pointer" data-testid="filter-keynote">
                Keynote
              </Badge>
              <Badge variant="outline" className="cursor-pointer" data-testid="filter-workshop">
                Workshop
              </Badge>
              <Badge variant="outline" className="cursor-pointer" data-testid="filter-networking">
                Networking
              </Badge>
              <Badge variant="outline" className="cursor-pointer" data-testid="filter-mentoring">
                Mentoring
              </Badge>
            </div>
          </div>

          {/* Sessions List */}
          <div className="space-y-6">
            {sessions.map((session) => (
              <Card key={session.id} className="shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${getTypeColor(session.type)} rounded-xl flex items-center justify-center`}>
                        {session.type === "keynote" && <Users className="w-6 h-6 text-white" />}
                        {session.type === "workshop" && <Video className="w-6 h-6 text-white" />}
                        {session.type === "networking" && <Users className="w-6 h-6 text-white" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-deep-navy" data-testid={`session-title-${session.id}`}>
                          {session.title}
                        </h3>
                        <p className="text-sm text-dark-grey">{session.speaker}</p>
                      </div>
                    </div>
                    {session.isLive && (
                      <Badge className="bg-warm-coral text-white animate-pulse" data-testid={`live-badge-${session.id}`}>
                        Live Now
                      </Badge>
                    )}
                  </div>

                  <p className="text-dark-grey mb-4" data-testid={`session-description-${session.id}`}>
                    {session.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6 text-sm text-dark-grey">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span data-testid={`session-time-${session.id}`}>
                          {formatTime(session.startTime)} - {formatTime(session.endTime)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span data-testid={`session-location-${session.id}`}>
                          {session.location}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {session.type}
                      </Badge>
                    </div>
                    
                    {session.isLive ? (
                      <Button 
                        className="bg-primary-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                        data-testid={`button-join-${session.id}`}
                      >
                        Join Session
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white"
                        data-testid={`button-remind-${session.id}`}
                      >
                        Set Reminder
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {sessions.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-mid-grey mx-auto mb-4" />
              <h3 className="text-lg font-medium text-deep-navy mb-2">No sessions scheduled</h3>
              <p className="text-dark-grey">Sessions will appear here once they are published.</p>
            </div>
          )}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
