import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, TrendingUp, Users, MapPin, Zap, Eye } from 'lucide-react';
import { ChipButton } from './components/ChipButton';
import { FilterPills } from './components/FilterPills';

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
  matchScore?: number;
  isCompetitor?: boolean;
}

interface VoronoiCell {
  team: TeamData;
  polygon: [number, number][];
  centroid: [number, number];
  area: number;
}

// Mock Voronoi calculation for investor/team territories
const generateInvestorVoronoi = (teams: TeamData[], investors: any[], width: number, height: number): VoronoiCell[] => {
  const padding = 50;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;
  
  return teams.map((team, index) => {
    const angle = (index / teams.length) * 2 * Math.PI;
    const radius = Math.min(usableWidth, usableHeight) * 0.25;
    const centerX = width / 2 + Math.cos(angle) * radius;
    const centerY = height / 2 + Math.sin(angle) * radius;
    
    // Scale by chips allocated (investment activity)
    const baseArea = 3000;
    const chipsMultiplier = Math.max(0.3, Math.min(2.5, team.totalChips / 30));
    const scaledArea = baseArea * chipsMultiplier;
    const polygonRadius = Math.sqrt(scaledArea / Math.PI);
    
    // Generate organic polygon shape
    const sides = 8;
    const polygon: [number, number][] = [];
    for (let i = 0; i < sides; i++) {
      const sideAngle = (i / sides) * 2 * Math.PI + angle;
      const variance = 0.7 + Math.random() * 0.6;
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

const FILTER_OPTIONS = [
  'All Teams',
  'AI/ML',
  'High Potential',
  'Early Stage',
  'Series A Ready',
  'EdTech',
  'FinTech',
  'HealthTech',
  'Climate',
];

export function InvestorsPlanetEnhanced() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All Teams');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamData | null>(null);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [mapDimensions, setMapDimensions] = useState({ width: 900, height: 700 });

  const { data: teams = [] } = useQuery<TeamData[]>({
    queryKey: ['/api/v1/planets/lands'],
    select: (data: TeamData[]) => data.map(team => ({
      ...team,
      awardScore: Math.floor(Math.random() * 100) + 30,
      matchScore: Math.floor(Math.random() * 40) + 60,
      isCompetitor: Math.random() > 0.7
    }))
  });

  const { data: aiMatches = [] } = useQuery<TeamData[]>({
    queryKey: ['/api/v1/planets/match/investors'],
    enabled: teams.length > 0
  });

  const { data: investorAccount } = useQuery({
    queryKey: ['/api/v1/planets/investors/account'],
  });

  useEffect(() => {
    const updateDimensions = () => {
      const container = document.getElementById('investor-galaxy-map');
      if (container) {
        const rect = container.getBoundingClientRect();
        setMapDimensions({ 
          width: Math.max(900, rect.width), 
          height: Math.max(700, rect.height || 700) 
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const filteredTeams = useMemo(() => {
    let filtered = teams;
    
    // Apply text search
    if (searchQuery.trim()) {
      filtered = filtered.filter(team => 
        team.land.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.land.badges.some(badge => badge.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply filter
    if (selectedFilter !== 'All Teams') {
      if (selectedFilter === 'High Potential') {
        filtered = filtered.filter(team => (team.matchScore || 0) > 80);
      } else if (selectedFilter === 'Early Stage') {
        filtered = filtered.filter(team => team.totalChips < 30);
      } else if (selectedFilter === 'Series A Ready') {
        filtered = filtered.filter(team => team.totalChips > 50);
      } else {
        filtered = filtered.filter(team => 
          team.land.badges.some(badge => badge.toLowerCase().includes(selectedFilter.toLowerCase()))
        );
      }
    }
    
    return filtered;
  }, [teams, searchQuery, selectedFilter]);

  const voronoiCells = useMemo(() => 
    generateInvestorVoronoi(filteredTeams, [], mapDimensions.width, mapDimensions.height),
    [filteredTeams, mapDimensions]
  );

  const handleCellClick = (cell: VoronoiCell) => {
    setSelectedTeam(cell.team);
  };

  const competitors = teams.filter(team => team.isCompetitor);

  return (
    <div className="min-h-screen planets-galaxy-bg">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Investors & Sponsors Galaxy
          </h1>
          <p className="text-white/80 text-lg max-w-3xl mx-auto">
            Discover promising teams, allocate investment chips, and track your portfolio across the galaxy
          </p>
        </div>

        {/* Google-Style Search Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <Input
              placeholder="Search teams, technologies, or investment opportunities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-16 pr-16 py-4 text-lg rounded-full border-0 bg-white shadow-lg text-center focus:shadow-xl transition-shadow"
              style={{ fontSize: '18px', paddingTop: '16px', paddingBottom: '16px' }}
              data-testid="search-investments"
            />
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="ghost"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full"
              data-testid="button-toggle-filters"
            >
              <Filter className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Filter Pills */}
          {showFilters && (
            <div className="mt-4 flex justify-center">
              <FilterPills
                options={FILTER_OPTIONS}
                selectedOption={selectedFilter}
                onSelect={setSelectedFilter}
              />
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Investment Galaxy Map */}
          <div className="lg:col-span-3">
            <div className="planets-card p-6 bg-white/95 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Investment Opportunities Map</h2>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {filteredTeams.length} Teams Found
                    </Badge>
                    {investorAccount && (
                      <Badge className="planets-badge-teal">
                        {investorAccount.chipsRemainingDaily || 7} Chips Left Today
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div 
                id="investor-galaxy-map"
                className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-lg overflow-hidden"
                style={{ height: `${mapDimensions.height}px` }}
              >
                <svg 
                  width={mapDimensions.width} 
                  height={mapDimensions.height}
                  className="absolute inset-0"
                >
                  {/* Background grid pattern */}
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.3"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  
                  {voronoiCells.map((cell) => (
                    <g key={cell.team.team.id}>
                      {/* Investment territory polygon */}
                      <polygon
                        points={cell.polygon.map(p => p.join(',')).join(' ')}
                        fill={cell.team.isCompetitor ? 'var(--planets-warm-coral)' : 'var(--planets-accent-teal)'}
                        fillOpacity={hoveredCell === cell.team.team.id ? 0.8 : 0.6}
                        stroke={cell.team.isCompetitor ? 'var(--planets-warm-coral)' : 'var(--planets-primary-blue)'}
                        strokeWidth={cell.team.isCompetitor ? 3 : 2}
                        className="cursor-pointer transition-all duration-200"
                        style={{
                          filter: hoveredCell === cell.team.team.id ? 
                            'drop-shadow(0 6px 12px rgba(0,0,0,0.25))' : 
                            'drop-shadow(0 2px 6px rgba(0,0,0,0.1))'
                        }}
                        onMouseEnter={() => setHoveredCell(cell.team.team.id)}
                        onMouseLeave={() => setHoveredCell(null)}
                        onClick={() => handleCellClick(cell)}
                        data-testid={`investment-territory-${cell.team.team.id}`}
                      />
                      
                      {/* Team/Competitor label */}
                      <text
                        x={cell.centroid[0]}
                        y={cell.centroid[1] - 10}
                        textAnchor="middle"
                        className="fill-current text-xs font-bold pointer-events-none"
                        fill="white"
                      >
                        {cell.team.team.name}
                      </text>
                      
                      {/* Investment indicators */}
                      <text
                        x={cell.centroid[0]}
                        y={cell.centroid[1] + 8}
                        textAnchor="middle"
                        className="fill-current text-xs pointer-events-none"
                        fill="white"
                        opacity="0.9"
                      >
                        {cell.team.isCompetitor ? '👥 Peer Investor' : `💎 ${cell.team.totalChips} chips`}
                      </text>
                      
                      {/* High match score indicator */}
                      {(cell.team.matchScore || 0) > 85 && (
                        <circle
                          cx={cell.centroid[0] + 25}
                          cy={cell.centroid[1] - 25}
                          r="8"
                          fill="var(--planets-gold)"
                          className="pointer-events-none planets-pulse"
                        />
                      )}
                    </g>
                  ))}
                </svg>

                {/* Advanced Hover Card */}
                {hoveredCell && (
                  <div className="absolute top-4 right-4 w-96">
                    {(() => {
                      const hoveredTeam = voronoiCells.find(cell => cell.team.team.id === hoveredCell)?.team;
                      return hoveredTeam ? (
                        <Card className="shadow-xl border-2 border-blue-200">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg">{hoveredTeam.land.title}</CardTitle>
                              {hoveredTeam.matchScore && (
                                <Badge className="planets-badge-gold text-xs">
                                  {hoveredTeam.matchScore}% Match
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{hoveredTeam.land.tagline}</p>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="flex gap-1 flex-wrap mb-3">
                              {hoveredTeam.land.badges.map(badge => (
                                <Badge key={badge} variant="outline" className="text-xs">{badge}</Badge>
                              ))}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="font-medium">{hoveredTeam.totalChips}</span>
                                <span className="text-gray-500 ml-1">Total Chips</span>
                              </div>
                              <div>
                                <span className="font-medium">{hoveredTeam.chipCount || 0}</span>
                                <span className="text-gray-500 ml-1">Investors</span>
                              </div>
                            </div>
                            {hoveredTeam.isCompetitor && (
                              <Badge className="mt-2 planets-badge-coral text-xs">
                                👥 Competitor Investor Territory
                              </Badge>
                            )}
                          </CardContent>
                        </Card>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Investment Sidebar */}
          <div className="space-y-6">
            {/* Account Summary */}
            {investorAccount && (
              <Card className="bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-500" />
                    My Investment Account
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{investorAccount.chipsRemainingDaily || 7}</p>
                      <p className="text-gray-600">Chips Left Today</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{investorAccount.totalChipsAllocated || 45}</p>
                      <p className="text-gray-600">Total Allocated</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      <strong>{investorAccount.introRequestsRemaining || 5}</strong> intro requests remaining
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI-Powered Matches */}
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  AI-Powered Matches
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {aiMatches.slice(0, 3).map((team: any) => (
                  <div key={team.team.id} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer" 
                       onClick={() => setSelectedTeam(team)}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm">{team.land.title}</h4>
                      <Badge className="planets-badge-gold text-xs">
                        {team.score || 88}%
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{team.land.tagline}</p>
                    <div className="flex gap-1">
                      {team.land.badges.slice(0, 2).map((badge: string) => (
                        <Badge key={badge} variant="outline" className="text-xs">{badge}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Competitor Insights */}
            {competitors.length > 0 && (
              <Card className="bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-orange-500" />
                    Peer Investors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {competitors.slice(0, 3).map(competitor => (
                    <div key={competitor.team.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{competitor.team.name}</p>
                        <p className="text-xs text-gray-500">Active investor</p>
                      </div>
                      <MapPin className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Team Detail Modal */}
        {selectedTeam && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{selectedTeam.land.title}</CardTitle>
                    <p className="text-gray-600 mt-1">{selectedTeam.land.tagline}</p>
                  </div>
                  <button
                    onClick={() => setSelectedTeam(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                    data-testid="button-close-investment-modal"
                  >
                    ×
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Team Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Team:</strong> {selectedTeam.team.name}</p>
                      <p><strong>Total Investment:</strong> {selectedTeam.totalChips} chips</p>
                      <p><strong>Investor Count:</strong> {selectedTeam.chipCount || 0}</p>
                      {selectedTeam.matchScore && (
                        <p><strong>AI Match Score:</strong> {selectedTeam.matchScore}%</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Technologies</h4>
                    <div className="flex gap-2 flex-wrap mb-4">
                      {selectedTeam.land.badges.map(badge => (
                        <Badge key={badge} variant="outline">{badge}</Badge>
                      ))}
                    </div>
                    
                    <div className="flex gap-3">
                      <ChipButton
                        teamId={selectedTeam.team.id}
                        teamName={selectedTeam.team.name}
                        onSuccess={() => {
                          // Refresh data
                        }}
                      />
                      
                      {selectedTeam.land.demoUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={selectedTeam.land.demoUrl} target="_blank" rel="noopener noreferrer">
                            <Eye className="w-4 h-4 mr-2" />
                            View Demo
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}