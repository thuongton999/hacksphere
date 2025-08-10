import React from 'react';
import { ExternalLink, MapPin, Zap, Trophy, Users } from 'lucide-react';
import { Land, Team } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LandCardProps {
  land: Land & { 
    team?: Team;
    totalChips?: number;
    chipCount?: number;
    rank?: number;
  };
  onSelect?: () => void;
  onChipAllocate?: () => void;
  showChipButton?: boolean;
  isSelected?: boolean;
  compact?: boolean;
}

export function LandCard({ 
  land, 
  onSelect, 
  onChipAllocate, 
  showChipButton = false,
  isSelected = false,
  compact = false 
}: LandCardProps) {
  const formatRank = (rank?: number) => {
    if (!rank) return null;
    const suffix = rank === 1 ? 'st' : rank === 2 ? 'nd' : rank === 3 ? 'rd' : 'th';
    return `${rank}${suffix}`;
  };

  return (
    <div 
      className={`planets-card transition-all duration-200 ${
        isSelected ? 'ring-2 ring-planets-primary-blue' : ''
      } ${onSelect ? 'cursor-pointer hover:shadow-lg' : ''} ${
        compact ? 'p-4' : 'p-6'
      }`}
      onClick={onSelect}
      data-testid={`land-card-${land.id}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-bold text-planets-dark-grey ${compact ? 'text-lg' : 'text-xl'}`}>
              {land.title}
            </h3>
            {land.rank && (
              <Badge className="planets-badge-gold text-xs">
                <Trophy className="w-3 h-3 mr-1" />
                {formatRank(land.rank)}
              </Badge>
            )}
          </div>
          
          {land.tagline && (
            <p className={`text-planets-dark-grey opacity-80 ${compact ? 'text-sm' : 'text-base'}`}>
              {land.tagline}
            </p>
          )}

          {land.team && (
            <div className="flex items-center gap-1 mt-1 text-sm text-planets-dark-grey opacity-70">
              <Users className="w-3 h-3" />
              {land.team.name}
            </div>
          )}
        </div>

        {land.avatarUrl && (
          <div className="w-12 h-12 rounded-lg bg-planets-soft-grey overflow-hidden ml-3">
            <img 
              src={land.avatarUrl} 
              alt={`${land.title} avatar`}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="flex items-center gap-4 mb-4">
        {(land.totalChips ?? 0) > 0 && (
          <div className="flex items-center gap-1 text-planets-sunshine">
            <Zap className="w-4 h-4" />
            <span className="font-semibold">{land.totalChips}</span>
            <span className="text-xs opacity-80">chips</span>
          </div>
        )}

        {(land.chipCount ?? 0) > 0 && (
          <div className="text-sm text-planets-dark-grey opacity-70">
            {land.chipCount} investors
          </div>
        )}
      </div>

      {/* Badges */}
      {land.badges && land.badges.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {land.badges.slice(0, compact ? 2 : 4).map((badge, index) => (
            <Badge key={index} className="planets-badge text-xs">
              {badge}
            </Badge>
          ))}
          {land.badges.length > (compact ? 2 : 4) && (
            <Badge className="planets-badge text-xs">
              +{land.badges.length - (compact ? 2 : 4)} more
            </Badge>
          )}
        </div>
      )}

      {/* Demo link */}
      {land.demoUrl && (
        <div className="mb-4">
          <a
            href={land.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-planets-primary-blue hover:text-planets-land-hover text-sm font-medium"
            onClick={(e) => e.stopPropagation()}
            data-testid={`demo-link-${land.id}`}
          >
            <ExternalLink className="w-3 h-3" />
            View Demo
          </a>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {showChipButton && onChipAllocate && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onChipAllocate();
            }}
            className="planets-btn-coral text-sm flex-1"
            data-testid={`chip-button-${land.id}`}
          >
            <Zap className="w-3 h-3 mr-1" />
            Allocate Chips
          </Button>
        )}

        {onSelect && !isSelected && (
          <Button
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="text-sm"
            data-testid={`select-button-${land.id}`}
          >
            <MapPin className="w-3 h-3 mr-1" />
            View Land
          </Button>
        )}
      </div>

      {/* Status indicators */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-planets-mid-grey">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            land.demoUrl ? 'bg-planets-success-green' : 'bg-planets-mid-grey'
          }`} />
          <span className="text-xs text-planets-dark-grey opacity-70">
            {land.demoUrl ? 'Demo Live' : 'In Development'}
          </span>
        </div>

        {land.createdAt && (
          <span className="text-xs text-planets-dark-grey opacity-50">
            {new Date(land.createdAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}