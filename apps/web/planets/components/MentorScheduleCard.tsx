import React, { useState } from 'react';
import { Calendar, Clock, Video, BookOpen, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  available: boolean;
  booked?: boolean;
}

interface MentorSession {
  id: string;
  mentorName: string;
  date: string;
  timeSlots: TimeSlot[];
  topics: string[];
  sessionType: 'one-on-one' | 'group' | 'office-hours';
  maxAttendees?: number;
  currentAttendees?: number;
}

interface MentorScheduleCardProps {
  session: MentorSession;
  onBookSlot?: (sessionId: string, slotId: string) => Promise<void>;
  isBooking?: boolean;
  userTeamId?: string;
}

export function MentorScheduleCard({ 
  session, 
  onBookSlot,
  isBooking = false,
  userTeamId 
}: MentorScheduleCardProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getSessionTypeIcon = () => {
    switch (session.sessionType) {
      case 'one-on-one':
        return <User className="w-4 h-4" />;
      case 'group':
        return <Users className="w-4 h-4" />;
      case 'office-hours':
        return <BookOpen className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getSessionTypeLabel = () => {
    switch (session.sessionType) {
      case 'one-on-one':
        return 'One-on-One';
      case 'group':
        return 'Group Session';
      case 'office-hours':
        return 'Office Hours';
      default:
        return 'Session';
    }
  };

  const handleBookSlot = async (slotId: string) => {
    if (!onBookSlot) return;
    
    try {
      await onBookSlot(session.id, slotId);
      setIsModalOpen(false);
      setSelectedSlot(null);
    } catch (error) {
      console.error('Failed to book slot:', error);
    }
  };

  const availableSlots = session.timeSlots.filter(slot => slot.available && !slot.booked);

  return (
    <div className="planets-card p-4" data-testid={`mentor-schedule-${session.id}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-planets-dark-grey mb-1">
            {session.mentorName}
          </h3>
          <div className="flex items-center gap-2 text-sm text-planets-dark-grey opacity-70">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(session.date)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getSessionTypeIcon()}
          <Badge className="planets-badge-teal text-xs">
            {getSessionTypeLabel()}
          </Badge>
        </div>
      </div>

      {/* Topics */}
      {session.topics.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-planets-dark-grey opacity-70 mb-1">Topics:</div>
          <div className="flex flex-wrap gap-1">
            {session.topics.map((topic, i) => (
              <Badge key={i} className="planets-badge text-xs">
                {topic}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Availability info */}
      <div className="flex items-center justify-between mb-3 text-sm">
        <div className="text-planets-dark-grey opacity-70">
          {availableSlots.length} slot{availableSlots.length !== 1 ? 's' : ''} available
        </div>

        {session.sessionType === 'group' && session.maxAttendees && (
          <div className="text-planets-dark-grey opacity-70">
            {session.currentAttendees || 0}/{session.maxAttendees} attendees
          </div>
        )}
      </div>

      {/* Time slots preview */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {session.timeSlots.slice(0, 3).map((slot) => (
            <div
              key={slot.id}
              className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
                slot.available && !slot.booked
                  ? 'bg-planets-success-green bg-opacity-20 text-planets-success-green'
                  : 'bg-planets-mid-grey text-planets-dark-grey opacity-50'
              }`}
            >
              <Clock className="w-3 h-3" />
              {formatTime(slot.startTime)}
            </div>
          ))}
          
          {session.timeSlots.length > 3 && (
            <div className="px-2 py-1 rounded text-xs bg-planets-soft-grey text-planets-dark-grey">
              +{session.timeSlots.length - 3} more
            </div>
          )}
        </div>
      </div>

      {/* Book session button */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button
            disabled={availableSlots.length === 0 || isBooking}
            className="w-full planets-btn-primary"
            data-testid={`book-session-${session.id}`}
          >
            <Video className="w-4 h-4 mr-2" />
            {availableSlots.length === 0 ? 'No Slots Available' : 'Book Session'}
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md" data-testid="booking-modal">
          <DialogHeader>
            <DialogTitle>Book Session with {session.mentorName}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Session info */}
            <div className="bg-planets-soft-grey rounded-lg p-3">
              <div className="text-sm text-planets-dark-grey opacity-70 mb-1">
                {formatDate(session.date)} • {getSessionTypeLabel()}
              </div>
              {session.topics.length > 0 && (
                <div className="text-sm text-planets-dark-grey">
                  Topics: {session.topics.join(', ')}
                </div>
              )}
            </div>

            {/* Available time slots */}
            <div>
              <div className="text-sm font-medium text-planets-dark-grey mb-2">
                Choose a time slot:
              </div>
              <div className="grid grid-cols-2 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot.id)}
                    className={`p-3 rounded-lg border text-sm transition-all ${
                      selectedSlot === slot.id
                        ? 'border-planets-primary-blue bg-planets-primary-blue bg-opacity-10 text-planets-primary-blue'
                        : 'border-planets-mid-grey hover:border-planets-primary-blue'
                    }`}
                    data-testid={`time-slot-${slot.id}`}
                  >
                    <div className="flex items-center gap-1 justify-center">
                      <Clock className="w-3 h-3" />
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Booking note */}
            <div className="bg-planets-primary-blue bg-opacity-10 rounded-lg p-3 text-sm text-planets-dark-grey">
              📅 You'll receive a calendar invite with video call details after booking.
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                data-testid="cancel-booking"
              >
                Cancel
              </Button>
              
              <Button
                onClick={() => selectedSlot && handleBookSlot(selectedSlot)}
                disabled={!selectedSlot || isBooking}
                className="planets-btn-primary"
                data-testid="confirm-booking"
              >
                {isBooking ? 'Booking...' : 'Confirm Booking'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}