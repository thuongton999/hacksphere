import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import MobileNav from "@/components/layout/mobile-nav";
import EventOverview from "@/components/dashboard/event-overview";
import QuickActions from "@/components/dashboard/quick-actions";
import TeamCard from "@/components/dashboard/team-card";
import UpcomingSessions from "@/components/dashboard/upcoming-sessions";
import EventStats from "@/components/dashboard/event-stats";
import Announcements from "@/components/dashboard/announcements";
import LiveStatus from "@/components/dashboard/live-status";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

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

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-soft-grey">
      <Sidebar />
      
      <div className="lg:ml-64">
        <TopBar title="Dashboard" />
        
        <main className="p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-deep-navy mb-2" data-testid="welcome-title">
              Welcome back, {user.firstName || 'User'}! 👋
            </h2>
            <p className="text-dark-grey" data-testid="welcome-subtitle">
              Ready to build something amazing at TechHack 2024?
            </p>
          </div>

          {/* Event Overview Card */}
          <EventOverview />

          {/* Quick Actions */}
          <QuickActions />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              <TeamCard />
              <UpcomingSessions />
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              <EventStats />
              <Announcements />
              <LiveStatus />
            </div>
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
