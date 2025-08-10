import React from 'react';
import { Play, X, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Land, Team } from '@shared/schema';

interface PitchReelModalProps {
  isOpen: boolean;
  onClose: () => void;
  land: Land & { team?: Team };
  onInterested?: () => void;
}

export function PitchReelModal({ isOpen, onClose, land, onInterested }: PitchReelModalProps) {
  // Mock pitch reel data - in real implementation this would come from PitchPerfect AI
  const pitchReel = {
    videoUrl: land.demoUrl || '/api/pitch-reels/placeholder.mp4',
    duration: '1:30',
    generatedAt: new Date().toISOString(),
    highlights: [
      'AI-powered team matching',
      'Real-time collaboration',
      'Gamified experience'
    ]
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl" data-testid="pitch-reel-modal">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-planets-primary-blue" />
              {land.title} - 90 Second Pitch
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              data-testid="close-pitch-modal"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Video Player */}
          <div className="relative bg-planets-dark-grey rounded-lg overflow-hidden aspect-video">
            {land.demoUrl ? (
              <video
                controls
                className="w-full h-full"
                poster="/api/placeholder-thumbnail.jpg"
                data-testid="pitch-video"
              >
                <source src={pitchReel.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="flex items-center justify-center h-full text-white">
                <div className="text-center">
                  <Play className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium mb-2">Pitch Reel Coming Soon</p>
                  <p className="text-sm opacity-80">
                    Upload a demo to generate your 90-second pitch automatically
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Team Info */}
          <div className="bg-planets-soft-grey rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-lg text-planets-dark-grey">{land.title}</h3>
                {land.tagline && (
                  <p className="text-planets-dark-grey opacity-80">{land.tagline}</p>
                )}
                {land.team && (
                  <p className="text-sm text-planets-dark-grey opacity-60 mt-1">
                    Team: {land.team.name}
                  </p>
                )}
              </div>
              
              <div className="text-right">
                <div className="text-sm text-planets-dark-grey opacity-60">
                  Duration: {pitchReel.duration}
                </div>
                {land.totalChips && land.totalChips > 0 && (
                  <div className="text-planets-sunshine font-semibold">
                    ⚡ {land.totalChips} chips
                  </div>
                )}
              </div>
            </div>

            {/* Highlights */}
            {pitchReel.highlights.length > 0 && (
              <div>
                <h4 className="font-medium text-planets-dark-grey mb-2">Key Highlights:</h4>
                <ul className="space-y-1">
                  {pitchReel.highlights.map((highlight, index) => (
                    <li key={index} className="text-sm text-planets-dark-grey opacity-80 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-planets-primary-blue rounded-full" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Demo Link */}
          {land.demoUrl && (
            <div className="flex items-center gap-2 p-3 bg-planets-primary-blue bg-opacity-10 rounded-lg">
              <ExternalLink className="w-4 h-4 text-planets-primary-blue" />
              <a
                href={land.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-planets-primary-blue hover:underline font-medium"
                data-testid="demo-link-in-modal"
              >
                Try Live Demo
              </a>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-planets-mid-grey">
            <Button
              variant="outline"
              onClick={onClose}
              data-testid="close-modal-btn"
            >
              Close
            </Button>
            
            {onInterested && (
              <Button
                onClick={() => {
                  onInterested();
                  onClose();
                }}
                className="planets-btn-primary"
                data-testid="interested-btn"
              >
                I'm Interested
              </Button>
            )}
          </div>

          {/* AI Generated Notice */}
          <div className="text-xs text-planets-dark-grey opacity-50 text-center">
            🤖 This pitch reel was automatically generated by PitchPerfect AI
            <br />
            Generated on {new Date(pitchReel.generatedAt).toLocaleDateString()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}