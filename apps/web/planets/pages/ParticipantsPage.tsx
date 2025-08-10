import React, { useState, useEffect } from 'react';
import { Plus, Users, TrendingUp, Zap } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { GalaxyMap } from '../components/GalaxyMap';
import { LandCard } from '../components/LandCard';
import { BuildLogComposer } from '../components/BuildLogComposer';
import { LeaderboardPanel } from '../components/LeaderboardPanel';
import { MentorBadge } from '../components/MentorBadge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import '../styles/variables.css';

export default function ParticipantsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedLandId, setSelectedLandId] = useState<string | null>(null);
  const [mentorMode, setMentorMode] = useState(false);
  const [isCreateLandOpen, setIsCreateLandOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  // Form state for creating land
  const [landForm, setLandForm] = useState({
    title: '',
    tagline: '',
    demoUrl: '',
    teamId: '',
  });

  // Fetch lands
  const { data: lands = [], isLoading: landsLoading } = useQuery({
    queryKey: ['/api/v1/planets/lands'],
    enabled: !!user,
  });

  // Fetch user teams
  const { data: teams = [] } = useQuery({
    queryKey: ['/api/teams'],
    enabled: !!user,
  });

  // Fetch leaderboard
  const { data: leaderboard = [] } = useQuery({
    queryKey: ['/api/v1/planets/leaderboard', 'global'],
    enabled: !!user,
  });

  // Fetch posts for selected land
  const { data: posts = [] } = useQuery({
    queryKey: ['/api/v1/planets/lands', selectedLandId, 'posts'],
    enabled: !!selectedLandId,
  });

  // Mock mentor data - in real implementation this would come from API
  const mockMentors = [
    {
      id: '1',
      name: 'Sarah Chen',
      expertise: ['AI/ML', 'Python', 'TensorFlow'],
      rating: 5,
      sessionsCompleted: 47,
      responseTime: '< 2 hours',
      isAvailable: true,
    },
    {
      id: '2', 
      name: 'Marcus Johnson',
      expertise: ['React', 'Node.js', 'AWS'],
      rating: 4,
      sessionsCompleted: 32,
      responseTime: '< 4 hours',
      isAvailable: true,
    },
  ];

  // Create land mutation
  const createLandMutation = useMutation({
    mutationFn: async (data: typeof landForm) => {
      return apiRequest('/api/v1/planets/lands', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/planets/lands'] });
      setIsCreateLandOpen(false);
      setLandForm({ title: '', tagline: '', demoUrl: '', teamId: '' });
      toast({
        title: 'Success',
        description: 'Your Land has been created! You earned 50 points.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create Land',
        variant: 'destructive',
      });
    },
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: { body: string; mediaUrl?: string }) => {
      return apiRequest(`/api/v1/planets/lands/${selectedLandId}/posts`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/v1/planets/lands', selectedLandId, 'posts'] 
      });
      toast({
        title: 'Build log posted!',
        description: 'You earned 25 points for today\'s update.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to post build log',
        variant: 'destructive',
      });
    },
  });

  const selectedLand = lands.find((land: any) => land.land?.id === selectedLandId);
  const userTeams = teams.filter((team: any) => 
    team.leaderId === user?.id || 
    team.members?.some((member: any) => member.userId === user?.id)
  );

  // Check if user can toggle mentor mode
  const canUseMentorMode = user?.role === 'mentor' || user?.role === 'organizer';

  return (
    <div className="min-h-screen bg-planets-soft-grey">
      <div className="container mx-auto p-6">
        {/* Welcome Banner */}
        <div className="planets-galaxy-bg rounded-xl p-8 mb-6 text-white">
          <div className="max-w-4xl">
            <h1 className="text-3xl font-bold mb-3">
              Welcome to Participants Planet
            </h1>
            <p className="text-lg opacity-90 mb-4">
              Build amazing projects, connect with mentors, and climb the leaderboards in our gamified hackathon galaxy.
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              <Button
                onClick={() => setIsCreateLandOpen(true)}
                className="planets-btn-primary bg-white text-planets-primary-blue hover:bg-gray-100"
                data-testid="claim-land-banner-btn"
              >
                <Plus className="w-4 h-4 mr-2" />
                Claim Your Land
              </Button>

              {canUseMentorMode && (
                <Button
                  variant="outline"
                  onClick={() => setMentorMode(!mentorMode)}
                  className="border-white text-white hover:bg-white hover:text-planets-primary-blue"
                  data-testid="mentor-mode-toggle"
                >
                  <Users className="w-4 h-4 mr-2" />
                  {mentorMode ? 'Exit Mentor Mode' : 'Mentor Mode'}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Galaxy Map */}
            <div className="planets-card p-6">
              <h2 className="text-xl font-bold text-planets-dark-grey mb-4">
                Galaxy Map
              </h2>
              <GalaxyMap
                lands={lands.map((item: any) => ({ ...item.land, team: item.team }))}
                onLandSelect={(land) => setSelectedLandId(land.id)}
                onCreateLand={() => setIsCreateLandOpen(true)}
                selectedLandId={selectedLandId}
                mentorMode={mentorMode}
              />
            </div>

            {/* Selected Land Details */}
            {selectedLand && (
              <div className="planets-card p-6">
                <h2 className="text-xl font-bold text-planets-dark-grey mb-4">
                  {selectedLand.land.title}
                </h2>

                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="posts">Build Logs</TabsTrigger>
                    <TabsTrigger value="team">Team</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-4">
                    <LandCard 
                      land={selectedLand.land}
                      isSelected={true}
                    />
                  </TabsContent>

                  <TabsContent value="posts" className="mt-4">
                    <div className="space-y-4">
                      {/* Build log composer */}
                      <BuildLogComposer
                        onSubmit={createPostMutation.mutateAsync}
                        isSubmitting={createPostMutation.isPending}
                      />

                      {/* Posts feed */}
                      <div className="space-y-3">
                        {posts.map((post: any) => (
                          <div key={post.post.id} className="planets-card p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-planets-primary-blue rounded-full flex items-center justify-center text-white text-sm font-bold">
                                {post.author?.firstName?.[0] || 'U'}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-planets-dark-grey">
                                    {post.author?.firstName} {post.author?.lastName}
                                  </span>
                                  <span className="text-xs text-planets-dark-grey opacity-50">
                                    {new Date(post.post.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-planets-dark-grey mb-2">{post.post.body}</p>
                                {post.post.mediaUrl && (
                                  <div className="border border-planets-mid-grey rounded p-2 text-sm">
                                    <a 
                                      href={post.post.mediaUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-planets-primary-blue hover:underline"
                                    >
                                      View Media
                                    </a>
                                  </div>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                  <Button variant="ghost" size="sm" className="text-xs">
                                    ❤️ {post.reactionsCount || 0}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="team" className="mt-4">
                    {selectedLand.team && (
                      <div className="planets-card p-4">
                        <h3 className="font-bold text-planets-dark-grey mb-2">
                          {selectedLand.team.name}
                        </h3>
                        <p className="text-planets-dark-grey opacity-80 mb-3">
                          {selectedLand.team.description}
                        </p>
                        <div className="text-sm text-planets-dark-grey opacity-70">
                          Team members information would be displayed here
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Leaderboard */}
            <LeaderboardPanel
              globalLeaderboard={leaderboard}
              trackLeaderboard={[]}
              rookieLeaderboard={[]}
            />

            {/* Mentors (in mentor mode) */}
            {mentorMode && (
              <div className="planets-card p-6">
                <h3 className="text-lg font-bold text-planets-dark-grey mb-4">
                  Available Mentors
                </h3>
                <div className="space-y-3">
                  {mockMentors.map((mentor) => (
                    <MentorBadge
                      key={mentor.id}
                      mentor={mentor}
                      compact={true}
                      onClick={() => {
                        toast({
                          title: 'Mentor Details',
                          description: `Viewing ${mentor.name}'s profile and office hours`,
                        });
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Land Modal */}
      <Dialog open={isCreateLandOpen} onOpenChange={setIsCreateLandOpen}>
        <DialogContent className="sm:max-w-md" data-testid="create-land-modal">
          <DialogHeader>
            <DialogTitle>Claim Your Land</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (landForm.title && landForm.teamId) {
                createLandMutation.mutate(landForm);
              }
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="team-select">Select Team</Label>
              <Select
                value={landForm.teamId}
                onValueChange={(value) => setLandForm({ ...landForm, teamId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose your team" />
                </SelectTrigger>
                <SelectContent>
                  {userTeams.map((team: any) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="land-title">Land Title</Label>
              <Input
                id="land-title"
                value={landForm.title}
                onChange={(e) => setLandForm({ ...landForm, title: e.target.value })}
                placeholder="e.g., AI-Powered Study Buddy"
                required
              />
            </div>

            <div>
              <Label htmlFor="land-tagline">Tagline (Optional)</Label>
              <Input
                id="land-tagline"
                value={landForm.tagline}
                onChange={(e) => setLandForm({ ...landForm, tagline: e.target.value })}
                placeholder="One-line description of your project"
              />
            </div>

            <div>
              <Label htmlFor="demo-url">Demo URL (Optional)</Label>
              <Input
                id="demo-url"
                type="url"
                value={landForm.demoUrl}
                onChange={(e) => setLandForm({ ...landForm, demoUrl: e.target.value })}
                placeholder="https://your-demo.com"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateLandOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!landForm.title || !landForm.teamId || createLandMutation.isPending}
                className="planets-btn-primary"
              >
                {createLandMutation.isPending ? 'Creating...' : 'Claim Land (+50 pts)'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}