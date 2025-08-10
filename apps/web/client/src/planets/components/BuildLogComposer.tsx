import React, { useState } from 'react';
import { Send, Image, Link, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface BuildLogComposerProps {
  onSubmit: (data: { body: string; mediaUrl?: string }) => Promise<void>;
  placeholder?: string;
  maxLength?: number;
  isSubmitting?: boolean;
}

export function BuildLogComposer({ 
  onSubmit, 
  placeholder = "Share your build progress...",
  maxLength = 500,
  isSubmitting = false 
}: BuildLogComposerProps) {
  const [body, setBody] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [showMediaInput, setShowMediaInput] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!body.trim()) return;

    try {
      await onSubmit({
        body: body.trim(),
        mediaUrl: mediaUrl.trim() || undefined,
      });
      
      // Reset form
      setBody('');
      setMediaUrl('');
      setShowMediaInput(false);
    } catch (error) {
      console.error('Failed to submit build log:', error);
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const canSubmit = body.trim().length > 0 && 
                   body.length <= maxLength && 
                   (!mediaUrl || isValidUrl(mediaUrl)) &&
                   !isSubmitting;

  return (
    <form onSubmit={handleSubmit} className="planets-card p-4" data-testid="build-log-composer">
      {/* Main text input */}
      <div className="mb-3">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={placeholder}
          className="min-h-[100px] resize-none border-planets-mid-grey focus:border-planets-primary-blue"
          maxLength={maxLength}
          disabled={isSubmitting}
          data-testid="build-log-body"
        />
        <div className="flex justify-between items-center mt-1">
          <span className={`text-xs ${
            body.length > maxLength * 0.8 
              ? 'text-planets-warm-coral' 
              : 'text-planets-dark-grey opacity-50'
          }`}>
            {body.length}/{maxLength}
          </span>
        </div>
      </div>

      {/* Media URL input */}
      {showMediaInput && (
        <div className="mb-3">
          <Input
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="Paste image or video URL (optional)"
            className="border-planets-mid-grey focus:border-planets-primary-blue"
            disabled={isSubmitting}
            data-testid="build-log-media-url"
          />
          {mediaUrl && !isValidUrl(mediaUrl) && (
            <p className="text-planets-warm-coral text-xs mt-1">
              Please enter a valid URL
            </p>
          )}
        </div>
      )}

      {/* Media preview */}
      {mediaUrl && isValidUrl(mediaUrl) && (
        <div className="mb-3">
          <div className="border border-planets-mid-grey rounded-lg p-3 bg-planets-soft-grey">
            <div className="flex items-center gap-2 text-sm text-planets-dark-grey">
              <Link className="w-4 h-4" />
              <span className="truncate">{mediaUrl}</span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowMediaInput(!showMediaInput)}
            className="text-planets-dark-grey hover:text-planets-primary-blue"
            disabled={isSubmitting}
            data-testid="toggle-media-input"
          >
            <Image className="w-4 h-4 mr-1" />
            {showMediaInput ? 'Remove Media' : 'Add Media'}
          </Button>
        </div>

        <Button
          type="submit"
          disabled={!canSubmit}
          className="planets-btn-primary flex items-center gap-2"
          data-testid="submit-build-log"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Post Update
        </Button>
      </div>

      {/* Daily limit hint */}
      <div className="mt-2 text-xs text-planets-dark-grey opacity-60">
        💡 Tip: One build log per day earns maximum points!
      </div>
    </form>
  );
}