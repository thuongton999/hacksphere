import React from 'react';
import { GraduationCap, Star, Clock, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MentorInfo {
  id: string;
  name: string;
  avatarUrl?: string;
  expertise: string[];
  rating?: number;
  sessionsCompleted?: number;
  responseTime?: string; // e.g., "< 2 hours"
  isAvailable?: boolean;
}

interface MentorBadgeProps {
  mentor: MentorInfo;
  onClick?: () => void;
  compact?: boolean;
  className?: string;
}

export function MentorBadge({ 
  mentor, 
  onClick, 
  compact = false,
  className = '' 
}: MentorBadgeProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        className={`w-3 h-3 ${
          i < rating ? 'text-planets-sunshine fill-current' : 'text-planets-mid-grey'
        }`}
      />
    ));
  };

  return (
    <div 
      className={`planets-card transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-lg hover:border-planets-accent-teal' : ''
      } ${compact ? 'p-3' : 'p-4'} ${className}`}
      onClick={onClick}
      data-testid={`mentor-badge-${mentor.id}`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar with availability indicator */}
        <div className="relative">
          <Avatar className={compact ? 'w-10 h-10' : 'w-12 h-12'}>
            <AvatarImage src={mentor.avatarUrl} />
            <AvatarFallback className="bg-planets-accent-teal text-white">
              {mentor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {/* Availability indicator */}
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
            mentor.isAvailable ? 'bg-planets-success-green' : 'bg-planets-mid-grey'
          }`} />
        </div>

        {/* Mentor info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-semibold text-planets-dark-grey truncate ${
              compact ? 'text-sm' : 'text-base'
            }`}>
              {mentor.name}
            </h4>
            <GraduationCap className="w-4 h-4 text-planets-accent-teal flex-shrink-0" />
          </div>

          {/* Rating and stats */}
          {!compact && (
            <div className="flex items-center gap-3 mb-2">
              {mentor.rating && (
                <div className="flex items-center gap-1">
                  {renderStars(mentor.rating)}
                  <span className="text-xs text-planets-dark-grey opacity-70 ml-1">
                    ({mentor.rating}/5)
                  </span>
                </div>
              )}

              {mentor.sessionsCompleted && (
                <div className="text-xs text-planets-dark-grey opacity-70">
                  {mentor.sessionsCompleted} sessions
                </div>
              )}
            </div>
          )}

          {/* Expertise tags */}
          <div className="flex flex-wrap gap-1 mb-2">
            {mentor.expertise.slice(0, compact ? 2 : 3).map((skill, i) => (
              <Badge key={i} className="planets-badge-teal text-xs">
                {skill}
              </Badge>
            ))}
            {mentor.expertise.length > (compact ? 2 : 3) && (
              <Badge className="planets-badge text-xs">
                +{mentor.expertise.length - (compact ? 2 : 3)}
              </Badge>
            )}
          </div>

          {/* Response time and availability */}
          <div className="flex items-center gap-3 text-xs">
            {mentor.responseTime && (
              <div className="flex items-center gap-1 text-planets-dark-grey opacity-70">
                <Clock className="w-3 h-3" />
                <span>Responds {mentor.responseTime}</span>
              </div>
            )}

            <div className={`flex items-center gap-1 ${
              mentor.isAvailable ? 'text-planets-success-green' : 'text-planets-dark-grey opacity-50'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                mentor.isAvailable ? 'bg-planets-success-green' : 'bg-planets-mid-grey'
              }`} />
              <span>{mentor.isAvailable ? 'Available' : 'Busy'}</span>
            </div>
          </div>
        </div>

        {/* Quick action indicator */}
        {onClick && (
          <div className="text-planets-accent-teal opacity-60">
            <MessageCircle className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Mentor mode indicator */}
      {!compact && (
        <div className="mt-3 pt-2 border-t border-planets-mid-grey text-xs text-planets-accent-teal">
          💫 Mentor Mode • Click to view office hours
        </div>
      )}
    </div>
  );
}