import React, { useState } from 'react';
import { Settings, Award, BarChart3, Archive, Plus, Users, Calendar, MessageSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { LeaderboardPanel } from '../components/LeaderboardPanel';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import '../styles/variables.css';

interface QuickStat {
  label: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  color?: string;
}

export default function JudgesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<'organizer' | 'judge'>('organizer');

  // Mock data - in real implementation these would come from APIs
  const organizerStats: QuickStat[] = [
    { label: 'Total Teams', value: 42, change: '+8', icon: <Users className="w-4 h-4" />, color: 'text-planets-primary-blue' },
    { label: 'Submissions', value: 38, change: '+12', icon: <Archive className="w-4 h-4" />, color: 'text-planets-success-green' },
    { label: 'Active Judges', value: 12, icon: <Award className="w-4 h-4" />, color: 'text-planets-sunshine' },
    { label: 'Pending Reviews', value: 15, icon: <MessageSquare className="w-4 h-4" />, color: 'text-planets-warm-coral' },
  ];

  // Fetch leaderboard
  const { data: leaderboard = [] } = useQuery({
    queryKey: ['/api/v1/planets/leaderboard', 'global'],
    enabled: !!user,
  });

  // Mock submissions queue for judges
  const submissionsQueue = [
    {
      id: '1',
      teamName: 'AI Study Buddy',
      submittedAt: '2024-01-10T14:30:00Z',
      track: 'AI/ML',
      status: 'pending',
      priority: 'high',
    },
    {
      id: '2', 
      teamName: 'EcoTracker Pro',
      submittedAt: '2024-01-10T13:15:00Z',
      track: 'Sustainability',
      status: 'in-review',
      priority: 'medium',
    },
    {
      id: '3',
      teamName: 'FinanceFlow',
      submittedAt: '2024-01-10T12:00:00Z',
      track: 'FinTech',
      status: 'pending',
      priority: 'low',
    },
  ];

  const handleQuickAction = (action: string) => {
    toast({
      title: `${action} Action`,
      description: `This would ${action.toLowerCase()} - feature coming soon!`,
    });
  };

  const isOrganizer = user?.role === 'organizer';
  const isJudge = user?.role === 'judge';

  return (
    <div className="min-h-screen bg-planets-soft-grey">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="planets-card p-8 mb-6">
          <h1 className="text-3xl font-bold text-planets-dark-grey mb-3">
            Judges & Organizers Planet
          </h1>
          <p className="text-lg text-planets-dark-grey opacity-80 mb-6">
            Manage events, evaluate submissions, and maintain the quality and fairness of the hackathon experience.
          </p>

          {/* Role Toggle */}
          {isOrganizer && (
            <div className="flex gap-2">
              <Button
                onClick={() => setActiveView('organizer')}
                variant={activeView === 'organizer' ? 'default' : 'outline'}
                className={activeView === 'organizer' ? 'planets-btn-primary' : ''}
                data-testid="organizer-view-btn"
              >
                <Settings className="w-4 h-4 mr-2" />
                Organizer Console
              </Button>
              <Button
                onClick={() => setActiveView('judge')}
                variant={activeView === 'judge' ? 'default' : 'outline'}
                className={activeView === 'judge' ? 'planets-btn-primary' : ''}
                data-testid="judge-view-btn"
              >
                <Award className="w-4 h-4 mr-2" />
                Judge Panel
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeView === 'organizer' && isOrganizer && (
              <>
                {/* Organizer Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {organizerStats.map((stat, index) => (
                    <Card key={index} className="planets-card">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className={`${stat.color}`}>
                            {stat.icon}
                          </div>
                          {stat.change && (
                            <Badge className="planets-badge-teal text-xs">
                              {stat.change}
                            </Badge>
                          )}
                        </div>
                        <div className="mt-2">
                          <div className="text-2xl font-bold text-planets-dark-grey">
                            {stat.value}
                          </div>
                          <div className="text-sm text-planets-dark-grey opacity-70">
                            {stat.label}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Quick Actions */}
                <Card className="planets-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col gap-2"
                        onClick={() => handleQuickAction('Create Event')}
                        data-testid="create-event-btn"
                      >
                        <Plus className="w-5 h-5" />
                        <span className="text-xs">Create Event</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col gap-2"
                        onClick={() => handleQuickAction('Manage Teams')}
                        data-testid="manage-teams-btn"
                      >
                        <Users className="w-5 h-5" />
                        <span className="text-xs">Manage Teams</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col gap-2"
                        onClick={() => handleQuickAction('Schedule')}
                        data-testid="schedule-btn"
                      >
                        <Calendar className="w-5 h-5" />
                        <span className="text-xs">Schedule</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col gap-2"
                        onClick={() => handleQuickAction('Analytics')}
                        data-testid="analytics-btn"
                      >
                        <BarChart3 className="w-5 h-5" />
                        <span className="text-xs">Analytics</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Sponsor Pipeline */}
                <Card className="planets-card">
                  <CardHeader>
                    <CardTitle>Sponsor Pipeline & Intro Queue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-planets-soft-grey rounded-lg">
                        <div>
                          <span className="font-medium">TechCorp Inc.</span>
                          <span className="text-sm text-planets-dark-grey opacity-70 ml-2">
                            Interested in AI/ML teams
                          </span>
                        </div>
                        <Badge className="planets-badge-teal">Active</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-planets-soft-grey rounded-lg">
                        <div>
                          <span className="font-medium">Startup Ventures</span>
                          <span className="text-sm text-planets-dark-grey opacity-70 ml-2">
                            Wants intro to FinanceFlow team
                          </span>
                        </div>
                        <Badge className="planets-badge-coral">Pending</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {(activeView === 'judge' || isJudge) && (
              <>
                {/* Judging Queue */}
                <Card className="planets-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Submission Queue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {submissionsQueue.map((submission) => (
                        <div 
                          key={submission.id}
                          className="flex items-center justify-between p-4 border border-planets-mid-grey rounded-lg hover:border-planets-primary-blue transition-colors cursor-pointer"
                          data-testid={`submission-${submission.id}`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-medium text-planets-dark-grey">
                                {submission.teamName}
                              </h3>
                              <Badge className="planets-badge text-xs">
                                {submission.track}
                              </Badge>
                              <Badge 
                                className={`text-xs ${
                                  submission.priority === 'high' ? 'planets-badge-coral' :
                                  submission.priority === 'medium' ? 'planets-badge-gold' :
                                  'planets-badge'
                                }`}
                              >
                                {submission.priority} priority
                              </Badge>
                            </div>
                            <div className="text-sm text-planets-dark-grey opacity-70">
                              Submitted {new Date(submission.submittedAt).toLocaleString()}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge 
                              className={`${
                                submission.status === 'pending' ? 'bg-planets-sunshine text-white' :
                                'planets-badge-teal'
                              }`}
                            >
                              {submission.status}
                            </Badge>
                            <Button size="sm" className="planets-btn-primary">
                              Review
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Review Tools */}
                <Card className="planets-card">
                  <CardHeader>
                    <CardTitle>Review Tools & Criteria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium text-planets-dark-grey">Scoring Criteria</h4>
                        <ul className="text-sm text-planets-dark-grey opacity-70 space-y-1">
                          <li>• Innovation (1-10)</li>
                          <li>• Technical Implementation (1-10)</li>
                          <li>• Design & UX (1-10)</li>
                          <li>• Presentation (1-10)</li>
                        </ul>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-planets-dark-grey">AI Assistance</h4>
                        <div className="text-sm text-planets-dark-grey opacity-70">
                          🤖 JudgeAssist provides preliminary scoring and consistency checks
                        </div>
                        <Button variant="outline" size="sm" className="mt-2">
                          View AI Suggestions
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Archive & Knowledge Hub */}
            <Card className="planets-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Archive className="w-5 h-5" />
                  Archive & Knowledge Hub
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-planets-dark-grey opacity-70 mb-4">
                  Access past submissions, recordings, and event materials
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm">
                    View Past Events
                  </Button>
                  <Button variant="outline" size="sm">
                    Search Archives
                  </Button>
                  <Button variant="outline" size="sm">
                    Export Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Leaderboard */}
            <LeaderboardPanel
              globalLeaderboard={leaderboard}
              trackLeaderboard={[]}
              rookieLeaderboard={[]}
            />

            {/* Medal Distribution */}
            <Card className="planets-card">
              <CardHeader>
                <CardTitle className="text-lg">Awards Distributed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-planets-gold rounded-full flex items-center justify-center text-white text-sm font-bold">
                        🥇
                      </div>
                      <span className="text-sm">Gold Awards</span>
                    </div>
                    <span className="font-bold text-planets-gold">8</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-planets-silver rounded-full flex items-center justify-center text-planets-dark-grey text-sm font-bold">
                        🥈
                      </div>
                      <span className="text-sm">Silver Awards</span>
                    </div>
                    <span className="font-bold text-planets-dark-grey">12</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-planets-bronze rounded-full flex items-center justify-center text-white text-sm font-bold">
                        🥉
                      </div>
                      <span className="text-sm">Bronze Awards</span>
                    </div>
                    <span className="font-bold text-planets-bronze">18</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Judge Consistency */}
            {(activeView === 'judge' || isJudge) && (
              <Card className="planets-card">
                <CardHeader>
                  <CardTitle className="text-lg">Your Judge Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-planets-dark-grey opacity-70">
                        Reviews Completed
                      </span>
                      <span className="font-semibold">23</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-planets-dark-grey opacity-70">
                        Avg. Score Given
                      </span>
                      <span className="font-semibold">7.2/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-planets-dark-grey opacity-70">
                        Consistency Rating
                      </span>
                      <Badge className="planets-badge-teal">Excellent</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}