import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Users, Trophy, Target } from 'lucide-react';
// import { LandCard } from './components/LandCard'; // Not needed for simplified cards
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

interface Team {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
}

interface Land {
  id: string;
  title: string;
  tagline: string;
  demoUrl?: string;
  badges: string[];
  totalChips: number;
  createdAt: string;
}

interface TeamData {
  land: Land;
  team: Team;
  totalChips: number;
  chipCount: number;
  awardScore?: number;
  isMyTeam?: boolean;
}

interface VoronoiCell {
  team: TeamData;
  polygon: [number, number][];
  centroid: [number, number];
  area: number;
}

// Mock Voronoi calculation (in production, use d3-voronoi)
const generateVoronoiCells = (teams: TeamData[], width: number, height: number): VoronoiCell[] => {
  const padding = 50;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;
  
  return teams.map((team, index) => {
    const angle = (index / teams.length) * 2 * Math.PI;
    const radius = Math.min(usableWidth, usableHeight) * 0.3;
    const centerX = width / 2 + Math.cos(angle) * radius * 0.5;
    const centerY = height / 2 + Math.sin(angle) * radius * 0.5;
    
    // Scale area by award score (clamp between min/max)
    const baseArea = 4000;
    const awardMultiplier = Math.max(0.5, Math.min(3, (team.awardScore || 50) / 50));
    const scaledArea = baseArea * awardMultiplier;
    const polygonRadius = Math.sqrt(scaledArea / Math.PI);
    
    // Generate hexagon-like polygon
    const sides = 6;
    const polygon: [number, number][] = [];
    for (let i = 0; i < sides; i++) {
      const sideAngle = (i / sides) * 2 * Math.PI + angle;
      const variance = 0.8 + Math.random() * 0.4; // Add organic shape
      const x = centerX + Math.cos(sideAngle) * polygonRadius * variance;
      const y = centerY + Math.sin(sideAngle) * polygonRadius * variance;
      polygon.push([Math.max(padding, Math.min(width - padding, x)), 
                   Math.max(padding, Math.min(height - padding, y))]);
    }
    
    return {
      team,
      polygon,
      centroid: [centerX, centerY],
      area: scaledArea
    };
  });
};

function HomePlanet() {
  const { user } = useAuth();
  const [selectedTeam, setSelectedTeam] = useState<TeamData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [mapDimensions, setMapDimensions] = useState({ width: 800, height: 600 });

  const { data: teams = [] } = useQuery<TeamData[]>({
    queryKey: ['/api/v1/planets/lands'],
    select: (data: TeamData[]) => data.map(team => ({
      ...team,
      awardScore: Math.floor(Math.random() * 100) + 30, // Mock award scores
      isMyTeam: team.team.name === 'Neural Networks' // Mock user team detection
    }))
  });

  const { data: leaderboard = [] } = useQuery<any[]>({
    queryKey: ['/api/v1/planets/leaderboard/global'],
  });

  useEffect(() => {
    const updateDimensions = () => {
      const container = document.getElementById('galaxy-map');
      if (container) {
        const rect = container.getBoundingClientRect();
        setMapDimensions({ 
          width: Math.max(800, rect.width), 
          height: Math.max(600, rect.height || 600) 
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) return teams;
    return teams.filter(team => 
      team.land.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.land.badges.some(badge => badge.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [teams, searchQuery]);

  const voronoiCells = useMemo(() => 
    generateVoronoiCells(filteredTeams, mapDimensions.width, mapDimensions.height),
    [filteredTeams, mapDimensions]
  );

  const handleCellClick = (cell: VoronoiCell) => {
    if (cell.team.isMyTeam) {
      // Navigate to existing team management
      window.location.href = '/teams';
    } else {
      setSelectedTeam(cell.team);
    }
  };

  const topTeams = leaderboard.slice(0, 3);

  return (
    <div className="min-h-screen planets-galaxy-bg">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Galaxy Participants Planet
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Explore team lands, discover projects, and connect with fellow participants and mentors
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search teams, projects, or technologies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-3 text-lg rounded-full border-2 bg-white/90 backdrop-blur-sm"
              data-testid="search-teams"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Galaxy Map */}
          <div className="lg:col-span-3">
            <div className="planets-card p-6 bg-white/95 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Team Galaxy Map</h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>My Team</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                    <span>Other Teams</span>
                  </div>
                </div>
              </div>
              
              <div 
                id="galaxy-map"
                className="relative bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg overflow-hidden"
                style={{ height: `${mapDimensions.height}px` }}
              >
                <svg 
                  width={mapDimensions.width} 
                  height={mapDimensions.height}
                  className="absolute inset-0"
                >
                  {voronoiCells.map((cell, index) => (
                    <g key={cell.team.team.id}>
                      {/* Country polygon */}
                      <polygon
                        points={cell.polygon.map(p => p.join(',')).join(' ')}
                        fill={cell.team.isMyTeam ? 'var(--planets-primary-blue)' : 'var(--planets-soft-grey)'}
                        fillOpacity={hoveredCell === cell.team.team.id ? 0.8 : 0.6}
                        stroke={cell.team.isMyTeam ? 'var(--planets-primary-blue)' : 'var(--planets-mid-grey)'}
                        strokeWidth={cell.team.isMyTeam ? 3 : 2}
                        className="cursor-pointer transition-all duration-200 hover:fill-opacity-80"
                        style={{
                          filter: hoveredCell === cell.team.team.id ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                        }}
                        onMouseEnter={() => setHoveredCell(cell.team.team.id)}
                        onMouseLeave={() => setHoveredCell(null)}
                        onClick={() => handleCellClick(cell)}
                        data-testid={`team-country-${cell.team.team.id}`}
                      />
                      
                      {/* Team label */}
                      <text
                        x={cell.centroid[0]}
                        y={cell.centroid[1]}
                        textAnchor="middle"
                        className="fill-current text-xs font-medium pointer-events-none"
                        fill={cell.team.isMyTeam ? 'white' : 'var(--planets-dark-grey)'}
                      >
                        {cell.team.team.name}
                      </text>
                      
                      {/* Award indicator */}
                      {(cell.team.awardScore || 0) > 75 && (
                        <circle
                          cx={cell.centroid[0] + 20}
                          cy={cell.centroid[1] - 15}
                          r="6"
                          fill="var(--planets-gold)"
                          className="pointer-events-none"
                        />
                      )}
                    </g>
                  ))}
                </svg>

                {/* Hover Card */}
                {hoveredCell && (
                  <div className="absolute top-4 right-4 w-80">
                    {(() => {
                      const hoveredTeam = voronoiCells.find(cell => cell.team.team.id === hoveredCell)?.team;
                      return hoveredTeam ? (
                        <div className="planets-card p-4">
                          <h4 className="font-bold text-lg">{hoveredTeam.land.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{hoveredTeam.land.tagline}</p>
                          <div className="flex gap-1 flex-wrap mb-2">
                            {hoveredTeam.land.badges.map(badge => (
                              <span key={badge} className="planets-badge text-xs">{badge}</span>
                            ))}
                          </div>
                          <p className="text-sm"><strong>{hoveredTeam.totalChips}</strong> chips</p>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="planets-card p-6 bg-white/95 backdrop-blur-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Top Teams
              </h3>
              <div className="space-y-3">
                {topTeams.map((team: any, index: number) => (
                  <div key={team.team.id} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{team.team.name}</p>
                      <p className="text-sm text-gray-500">{team.totalPoints} points</p>
                    </div>
                    <div className="planets-badge-teal">
                      {team.totalChips} chips
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="planets-card p-6 bg-white/95 backdrop-blur-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link href="/teams">
                  <Button className="w-full planets-btn-primary" data-testid="button-manage-team">
                    <Users className="w-4 h-4 mr-2" />
                    Manage My Team
                  </Button>
                </Link>
                <Link href="/mentors">
                  <Button variant="outline" className="w-full" data-testid="button-find-mentors">
                    Find Mentors
                  </Button>
                </Link>
                <Link href="/schedule">
                  <Button variant="outline" className="w-full" data-testid="button-view-schedule">
                    View Schedule
                  </Button>
                </Link>
                <Link href="/submissions">
                  <Button variant="outline" className="w-full" data-testid="button-submissions">
                    My Submissions
                  </Button>
                </Link>
              </div>
            </div>

            {/* Planet Stats */}
            <div className="planets-card p-6 bg-white/95 backdrop-blur-sm">
              <h3 className="text-lg font-bold mb-4">Planet Activity</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Teams</span>
                  <span className="font-medium">{teams.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Projects</span>
                  <span className="font-medium">{teams.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Chips Allocated</span>
                  <span className="font-medium">{teams.reduce((sum, team) => sum + team.totalChips, 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Team Modal */}
        {selectedTeam && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="max-w-2xl w-full planets-card p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold">{selectedTeam.land.title}</h3>
                <button
                  onClick={() => setSelectedTeam(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                  data-testid="button-close-modal"
                >
                  ×
                </button>
              </div>
              <p className="text-gray-600 mb-4">{selectedTeam.land.tagline}</p>
              <div className="flex gap-2 flex-wrap mb-4">
                {selectedTeam.land.badges.map(badge => (
                  <span key={badge} className="planets-badge">{badge}</span>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Team</p>
                  <p className="font-medium">{selectedTeam.team.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Chips</p>
                  <p className="font-medium">{selectedTeam.totalChips}</p>
                </div>
              </div>
              {selectedTeam.land.demoUrl && (
                <a 
                  href={selectedTeam.land.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="planets-btn-primary px-4 py-2 rounded-lg inline-block"
                  data-testid="link-demo"
                >
                  View Demo
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePlanet;