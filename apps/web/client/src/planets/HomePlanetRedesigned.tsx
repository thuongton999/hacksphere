import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Trophy, 
  Users, 
  Search, 
  Star, 
  TrendingUp, 
  Award, 
  Clock,
  MapPin,
  Activity,
  Rocket,
  Target,
  Calendar,
  Zap
} from "lucide-react";
import { Link } from "wouter";
import { HeroGalaxyMap } from "./components/HeroGalaxyMap";

interface TeamLand {
  land: {
    id: string;
    title: string;
    tagline: string;
    badges: string[];
    totalChips: number;
  };
  team: {
    id: string;
    name: string;
  };
  totalChips: number;
  chipCount: number;
}

interface LeaderboardEntry {
  rank: number;
  team: {
    id: string;
    name: string;
  };
  totalChips: number;
}

export default function HomePlanetRedesigned() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: teamLands = [] } = useQuery<TeamLand[]>({
    queryKey: ["/api/v1/planets/lands"],
  });

  const { data: leaderboard = [] } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/v1/planets/leaderboard/global"],
  });

  // Mock activity data
  const recentActivity = [
    { type: "award", text: "Neural Networks gained 12 points", time: "2m ago", icon: Award },
    { type: "join", text: "3 new participants joined", time: "5m ago", icon: Users },
    { type: "submit", text: "Quantum Leap submitted project", time: "8m ago", icon: Rocket },
    { type: "mentor", text: "Mentor session booked", time: "12m ago", icon: Clock },
  ];

  return (
    <div 
      className="min-h-screen"
      style={{
        background: "linear-gradient(135deg, #2F47D3 0%, #9B4DFF 100%)"
      }}
    >
      {/* Header Section */}
      <div className="relative pt-12 pb-8 px-6">
        {/* Subtle stars background */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 15 }, (_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${2 + Math.random() * 3}px`,
                height: `${2 + Math.random() * 3}px`,
                backgroundColor: '#FFD966',
                borderRadius: '50%',
                opacity: 0.6,
                animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite alternate`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Galaxy Participants Planet
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Explore team lands, discover projects, and connect with fellow participants and mentors
          </p>

          {/* Google-style Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search teams, projects, or technologies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg bg-white border-0 rounded-full shadow-lg focus:ring-2 focus:ring-white/20 focus:outline-none"
                style={{ 
                  fontSize: '16px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)'
                }}
                data-testid="hero-search-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Galaxy Map - Main Hero Element */}
            <div className="lg:col-span-3">
              <Card 
                className="bg-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300"
                style={{
                  borderRadius: '16px',
                  border: '1px solid #E9EEF8',
                  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
                  position: 'relative',
                  overflow: 'visible'
                }}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold text-gray-900">
                          Team Galaxy Map
                        </CardTitle>
                        <p className="text-gray-600 mt-1">
                          Interactive territories scaled by team achievements
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant="secondary"
                      className="bg-blue-50 text-blue-700 border-blue-200"
                    >
                      Live
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-b-2xl">
                    <HeroGalaxyMap 
                      width={800} 
                      height={500}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar Panels */}
            <div className="space-y-6">
              
              {/* Top Teams Card */}
              <Card 
                className="bg-white shadow-lg border-0"
                style={{
                  borderRadius: '16px',
                  border: '1px solid #E9EEF8',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
                }}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <CardTitle className="text-lg font-bold text-gray-900">
                      Top Teams
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {leaderboard.slice(0, 3).map((entry, index) => (
                    <div key={entry.team.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                        }`}>
                          {entry.rank}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {entry.team.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">
                          {entry.totalChips}
                        </p>
                        <p className="text-xs text-gray-500">points</p>
                      </div>
                    </div>
                  ))}
                  
                  <Link href="/teams">
                    <Button 
                      type="button"
                      variant="ghost" 
                      className="w-full mt-4 hover:bg-blue-50"
                      style={{ color: 'var(--brand-primary)' }}
                      data-testid="view-all-teams"
                    >
                      View All Teams
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Quick Actions Card */}
              <Card 
                className="bg-white shadow-lg border-0"
                style={{
                  borderRadius: '16px',
                  border: '1px solid #E9EEF8',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
                }}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-500" />
                    <CardTitle className="text-lg font-bold text-gray-900">
                      Quick Actions
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/teams">
                    <Button 
                      type="button"
                      className="w-full justify-start text-white"
                      style={{ 
                        backgroundColor: 'var(--brand-primary)', 
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--brand-light)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--brand-primary)';
                      }}
                      data-testid="manage-team-button"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Manage My Team
                    </Button>
                  </Link>
                  
                  <Link href="/mentors">
                    <Button 
                      type="button"
                      variant="outline" 
                      className="w-full justify-start border-gray-200 hover:bg-gray-50"
                      data-testid="find-mentor-button"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Find Mentor
                    </Button>
                  </Link>
                  
                  <Link href="/schedule">
                    <Button 
                      type="button"
                      variant="outline" 
                      className="w-full justify-start border-gray-200 hover:bg-gray-50"
                      data-testid="view-schedule-button"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      View Schedule
                    </Button>
                  </Link>
                  
                  <Link href="/submissions">
                    <Button 
                      type="button"
                      variant="outline" 
                      className="w-full justify-start border-gray-200 hover:bg-gray-50"
                      data-testid="my-submissions-button"
                    >
                      <Rocket className="w-4 h-4 mr-2" />
                      My Submissions
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Planet Activity Card */}
              <Card 
                className="bg-white shadow-lg border-0"
                style={{
                  borderRadius: '16px',
                  border: '1px solid #E9EEF8',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
                }}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-500" />
                    <CardTitle className="text-lg font-bold text-gray-900">
                      Planet Activity
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-2">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <activity.icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 leading-relaxed">
                          {activity.text}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-2 mt-4 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-lg font-bold text-blue-600">24</p>
                        <p className="text-xs text-gray-500">Active Teams</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-green-600">156</p>
                        <p className="text-xs text-gray-500">Total Projects</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for star animation is handled via Tailwind/CSS */}
    </div>
  );
}