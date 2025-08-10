import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import MobileNav from "@/components/layout/mobile-nav";
import AIRecommendations from "@/components/teams/ai-recommendations";
import TeamGrid from "@/components/teams/team-grid";
import SkillsFilter from "@/components/teams/skills-filter";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Team } from "@/types";

export default function Teams() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  const { data: teams = [], isLoading: teamsLoading } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
    enabled: isAuthenticated,
  });

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

  return (
    <div className="min-h-screen bg-soft-grey">
      <Sidebar />
      
      <div className="lg:ml-64">
        <TopBar 
          title="Teams"
          actions={
            <Button 
              className="bg-primary-blue text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-600 transition-colors"
              data-testid="button-create-team"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          }
        />
        
        <main className="p-6">
          {/* AI Team Suggestion */}
          <AIRecommendations />

          {/* Team Grid */}
          {teamsLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-dark-grey">Loading teams...</p>
            </div>
          ) : (
            <TeamGrid teams={teams} />
          )}

          {/* Skills Filter */}
          <SkillsFilter />
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
