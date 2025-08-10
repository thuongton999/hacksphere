import React, { useState } from 'react';
import { Search, Sparkles, Eye, TrendingUp } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { SearchBar } from '../components/SearchBar';
import { FilterPills, TRACK_FILTERS, STAGE_FILTERS } from '../components/FilterPills';
import { LandCard } from '../components/LandCard';
import { ChipButton } from '../components/ChipButton';
import { PitchReelModal } from '../components/PitchReelModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import '../styles/variables.css';

export default function InvestorsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedLand, setSelectedLand] = useState<any>(null);
  const [isPitchModalOpen, setIsPitchModalOpen] = useState(false);
  const [aiMatchMode, setAiMatchMode] = useState(false);

  // Fetch lands with search and filters
  const { data: lands = [], isLoading: landsLoading } = useQuery({
    queryKey: ['/api/v1/planets/lands', { q: searchQuery, track: selectedFilters.join(',') }],
    enabled: !!user,
  });

  // Fetch AI matches
  const { data: aiMatches = [], isLoading: matchesLoading } = useQuery({
    queryKey: ['/api/v1/planets/match/investors'],
    enabled: !!user && aiMatchMode,
  });

  // Fetch VC account info
  const { data: vcAccount } = useQuery({
    queryKey: ['/api/v1/planets/investors/account'],
    enabled: !!user,
  });

  // Allocate chips mutation
  const allocateChipsMutation = useMutation({
    mutationFn: async (data: { teamId: string; amount: number; note?: string }) => {
      return apiRequest('/api/v1/planets/investors/chips', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/planets/lands'] });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/planets/investors/account'] });
      toast({
        title: 'Chips allocated!',
        description: 'Your investment interest has been recorded.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to allocate chips',
        variant: 'destructive',
      });
    },
  });

  // Request intro mutation
  const requestIntroMutation = useMutation({
    mutationFn: async (data: { teamId: string; note?: string }) => {
      return apiRequest('/api/v1/planets/intros/request', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Intro requested!',
        description: 'The organizers will connect you with the team.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to request intro',
        variant: 'destructive',
      });
    },
  });

  const handleFilterToggle = (filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const clearAllFilters = () => {
    setSelectedFilters([]);
    setSearchQuery('');
  };

  const displayedLands = aiMatchMode ? aiMatches : lands;
  const remainingChips = vcAccount?.chipsRemainingDaily || 10;

  return (
    <div className="min-h-screen bg-planets-soft-grey">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="planets-card p-8 mb-6">
          <div className="max-w-4xl">
            <h1 className="text-3xl font-bold text-planets-dark-grey mb-3">
              Investors & Sponsors Planet
            </h1>
            <p className="text-lg text-planets-dark-grey opacity-80 mb-6">
              Discover exceptional teams, allocate investment chips, and connect with the next generation of innovators.
            </p>

            {/* Search and AI Match Toggle */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <div className="flex-1 max-w-md">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search teams by name, technology, or idea..."
                />
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setAiMatchMode(!aiMatchMode)}
                  variant={aiMatchMode ? "default" : "outline"}
                  className={aiMatchMode ? "planets-btn-primary" : ""}
                  data-testid="ai-match-toggle"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {aiMatchMode ? 'AI Matches' : 'Browse All'}
                </Button>

                <Badge className="planets-badge-coral">
                  {remainingChips}/10 chips today
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="planets-card p-4 mb-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-planets-dark-grey mb-2">Tracks</h3>
              <FilterPills
                options={TRACK_FILTERS}
                selectedFilters={selectedFilters}
                onFilterToggle={handleFilterToggle}
                onClearAll={selectedFilters.length > 0 ? clearAllFilters : undefined}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium text-planets-dark-grey mb-2">Stage</h3>
              <FilterPills
                options={STAGE_FILTERS}
                selectedFilters={selectedFilters}
                onFilterToggle={handleFilterToggle}
              />
            </div>
          </div>
        </div>

        {/* AI Match Banner */}
        {aiMatchMode && (
          <div className="bg-gradient-to-r from-planets-soft-purple to-planets-primary-blue rounded-xl p-6 mb-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-6 h-6" />
              <h2 className="text-xl font-bold">AI-Powered Matches</h2>
            </div>
            <p className="opacity-90">
              Teams recommended based on your investment profile, demo quality, and traction signals.
            </p>
          </div>
        )}

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(landsLoading || matchesLoading) ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="planets-card p-6 animate-pulse">
                <div className="h-4 bg-planets-soft-grey rounded mb-3"></div>
                <div className="h-3 bg-planets-soft-grey rounded mb-4"></div>
                <div className="h-8 bg-planets-soft-grey rounded"></div>
              </div>
            ))
          ) : displayedLands.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Search className="w-12 h-12 mx-auto text-planets-dark-grey opacity-50 mb-4" />
              <h3 className="text-lg font-medium text-planets-dark-grey mb-2">
                No teams found
              </h3>
              <p className="text-planets-dark-grey opacity-70">
                Try adjusting your search criteria or filters
              </p>
            </div>
          ) : (
            displayedLands.map((item: any) => {
              const land = item.land || item;
              const team = item.team;
              
              return (
                <div key={land.id} className="space-y-3">
                  <LandCard
                    land={{ ...land, team, totalChips: item.totalChips, chipCount: item.chipCount }}
                    onSelect={() => {
                      setSelectedLand({ ...land, team });
                      setIsPitchModalOpen(true);
                    }}
                    showChipButton={true}
                    onChipAllocate={() => {
                      // The ChipButton component handles the allocation
                    }}
                  />
                  
                  <div className="flex gap-2">
                    <ChipButton
                      teamId={team?.id || land.teamId}
                      teamName={team?.name || land.title}
                      onAllocate={allocateChipsMutation.mutateAsync}
                      remainingChips={remainingChips}
                      disabled={allocateChipsMutation.isPending}
                      className="flex-1"
                    />
                    
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedLand({ ...land, team });
                        setIsPitchModalOpen(true);
                      }}
                      className="flex-1"
                      data-testid={`view-pitch-${land.id}`}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Pitch
                    </Button>
                  </div>

                  {/* AI match score indicator */}
                  {aiMatchMode && item.score && (
                    <div className="bg-planets-soft-purple bg-opacity-20 rounded-lg p-2 text-center">
                      <div className="text-xs text-planets-soft-purple font-medium">
                        🤖 AI Match Score: {Math.round((item.score / 100) * 100)}%
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Load more button */}
        {displayedLands.length > 0 && displayedLands.length % 9 === 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" className="planets-btn-primary">
              <TrendingUp className="w-4 h-4 mr-2" />
              Load More Teams
            </Button>
          </div>
        )}
      </div>

      {/* Pitch Reel Modal */}
      {selectedLand && (
        <PitchReelModal
          isOpen={isPitchModalOpen}
          onClose={() => {
            setIsPitchModalOpen(false);
            setSelectedLand(null);
          }}
          land={selectedLand}
          onInterested={() => {
            if (selectedLand.team?.id) {
              requestIntroMutation.mutate({
                teamId: selectedLand.team.id,
                note: `Interested in ${selectedLand.title} after viewing pitch reel.`,
              });
            }
          }}
        />
      )}
    </div>
  );
}