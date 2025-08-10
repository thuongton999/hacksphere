import React, { useState } from 'react';
import { Trophy, Zap, TrendingUp, Medal, Crown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface LeaderboardEntry {
  rank: number;
  team: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  land?: {
    title: string;
    badges?: string[];
  };
  totalPoints: number;
  totalChips: number;
  weeklyGrowth?: number;
}

interface LeaderboardPanelProps {
  globalLeaderboard: LeaderboardEntry[];
  trackLeaderboard?: LeaderboardEntry[];
  rookieLeaderboard?: LeaderboardEntry[];
  isLoading?: boolean;
  className?: string;
}

export function LeaderboardPanel({ 
  globalLeaderboard = [], 
  trackLeaderboard = [],
  rookieLeaderboard = [],
  isLoading = false,
  className = '' 
}: LeaderboardPanelProps) {
  const [activeTab, setActiveTab] = useState('global');

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-4 h-4 text-planets-gold" />;
      case 2:
        return <Medal className="w-4 h-4 text-planets-silver" />;
      case 3:
        return <Medal className="w-4 h-4 text-planets-bronze" />;
      default:
        return <span className="text-planets-dark-grey font-semibold">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-planets-gold text-white';
      case 2:
        return 'bg-planets-silver text-planets-dark-grey';
      case 3:
        return 'bg-planets-bronze text-white';
      default:
        return 'bg-planets-soft-grey text-planets-dark-grey';
    }
  };

  const renderLeaderboardList = (entries: LeaderboardEntry[]) => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="planets-leaderboard-item animate-pulse">
              <div className="h-12 bg-planets-soft-grey rounded"></div>
            </div>
          ))}
        </div>
      );
    }

    if (entries.length === 0) {
      return (
        <div className="text-center py-8 text-planets-dark-grey opacity-60">
          <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No teams to display yet</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {entries.slice(0, 10).map((entry) => (
          <div 
            key={entry.team.id}
            className="planets-leaderboard-item"
            data-testid={`leaderboard-entry-${entry.team.id}`}
          >
            <div className="flex items-center gap-3">
              {/* Rank */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankColor(entry.rank)}`}>
                {entry.rank <= 3 ? getRankIcon(entry.rank) : entry.rank}
              </div>

              {/* Team Avatar */}
              <Avatar className="w-10 h-10">
                <AvatarImage src={entry.team.avatarUrl} />
                <AvatarFallback className="bg-planets-primary-blue text-white">
                  {entry.team.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Team Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-planets-dark-grey truncate">
                    {entry.land?.title || entry.team.name}
                  </h4>
                  {entry.rank <= 3 && (
                    <Badge className={`planets-badge ${
                      entry.rank === 1 ? 'planets-badge-gold' : 
                      entry.rank === 2 ? 'bg-planets-silver text-planets-dark-grey' :
                      'planets-badge-bronze'
                    }`}>
                      {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                    </Badge>
                  )}
                </div>
                
                <div className="text-sm text-planets-dark-grey opacity-70">
                  {entry.team.name}
                </div>

                {/* Badges */}
                {entry.land?.badges && entry.land.badges.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {entry.land.badges.slice(0, 2).map((badge, i) => (
                      <Badge key={i} className="planets-badge text-xs">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="text-right">
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1 text-planets-primary-blue">
                    <TrendingUp className="w-3 h-3" />
                    <span className="font-semibold">{entry.totalPoints}</span>
                  </div>
                  
                  {entry.totalChips > 0 && (
                    <div className="flex items-center gap-1 text-planets-sunshine">
                      <Zap className="w-3 h-3" />
                      <span className="font-semibold">{entry.totalChips}</span>
                    </div>
                  )}
                </div>

                {entry.weeklyGrowth !== undefined && (
                  <div className={`text-xs ${
                    entry.weeklyGrowth > 0 ? 'text-planets-success-green' : 'text-planets-dark-grey opacity-60'
                  }`}>
                    {entry.weeklyGrowth > 0 ? '+' : ''}{entry.weeklyGrowth}% this week
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`planets-card p-6 ${className}`} data-testid="leaderboard-panel">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-planets-gold" />
        <h3 className="text-lg font-bold text-planets-dark-grey">Leaderboard</h3>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="global" data-testid="global-tab">
            Global
          </TabsTrigger>
          <TabsTrigger value="track" data-testid="track-tab">
            Track
          </TabsTrigger>
          <TabsTrigger value="rookie" data-testid="rookie-tab">
            Rookie
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="mt-0">
          <div className="mb-3 text-sm text-planets-dark-grey opacity-70">
            Top teams across all tracks and categories
          </div>
          {renderLeaderboardList(globalLeaderboard)}
        </TabsContent>

        <TabsContent value="track" className="mt-0">
          <div className="mb-3 text-sm text-planets-dark-grey opacity-70">
            Leading teams in your track
          </div>
          {renderLeaderboardList(trackLeaderboard)}
        </TabsContent>

        <TabsContent value="rookie" className="mt-0">
          <div className="mb-3 text-sm text-planets-dark-grey opacity-70">
            Newest teams (created in last 30 days)
          </div>
          {renderLeaderboardList(rookieLeaderboard)}
        </TabsContent>
      </Tabs>

      {/* Weekly reset notice */}
      <div className="mt-4 pt-3 border-t border-planets-mid-grey text-xs text-planets-dark-grey opacity-50 text-center">
        🔄 Rankings update weekly • Next reset in 3 days
      </div>
    </div>
  );
}