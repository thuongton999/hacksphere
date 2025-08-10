import React, { useState } from 'react';
import { Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface ChipButtonProps {
  teamId: string;
  teamName: string;
  onAllocate: (data: { teamId: string; amount: number; note?: string }) => Promise<void>;
  disabled?: boolean;
  remainingChips?: number;
  className?: string;
}

export function ChipButton({ 
  teamId, 
  teamName, 
  onAllocate, 
  disabled = false,
  remainingChips = 10,
  className = '' 
}: ChipButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState([5]); // Slider uses array
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (amount[0] < 1 || amount[0] > 10 || amount[0] > remainingChips) return;

    setIsSubmitting(true);
    
    try {
      await onAllocate({
        teamId,
        amount: amount[0],
        note: note.trim() || undefined,
      });
      
      // Reset form and close modal
      setAmount([5]);
      setNote('');
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to allocate chips:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const maxAmount = Math.min(10, remainingChips);
  const canSubmit = amount[0] >= 1 && amount[0] <= maxAmount && !isSubmitting;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={disabled || remainingChips <= 0}
          className={`planets-btn-coral flex items-center gap-2 ${className}`}
          data-testid={`chip-button-${teamId}`}
        >
          <Zap className="w-4 h-4" />
          Allocate Chips
          {remainingChips < 10 && (
            <span className="text-xs opacity-80">({remainingChips} left)</span>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md" data-testid="chip-allocation-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-planets-warm-coral" />
            Allocate Chips to {teamName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount selector */}
          <div className="space-y-3">
            <Label htmlFor="chip-amount" className="text-sm font-medium">
              Number of Chips (1-{maxAmount})
            </Label>
            
            <div className="space-y-3">
              <Slider
                id="chip-amount"
                min={1}
                max={maxAmount}
                step={1}
                value={amount}
                onValueChange={setAmount}
                className="w-full"
                disabled={isSubmitting}
                data-testid="chip-amount-slider"
              />
              
              <div className="flex justify-between text-sm text-planets-dark-grey">
                <span>1 chip</span>
                <span className="font-semibold text-planets-warm-coral">
                  {amount[0]} chips
                </span>
                <span>{maxAmount} chips</span>
              </div>
            </div>

            {/* Manual input */}
            <Input
              type="number"
              min={1}
              max={maxAmount}
              value={amount[0]}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1;
                setAmount([Math.max(1, Math.min(maxAmount, value))]);
              }}
              className="w-20 text-center"
              disabled={isSubmitting}
              data-testid="chip-amount-input"
            />
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="chip-note" className="text-sm font-medium">
              Optional Note
            </Label>
            <Textarea
              id="chip-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Why are you interested in this team? (optional)"
              className="min-h-[80px] resize-none"
              maxLength={200}
              disabled={isSubmitting}
              data-testid="chip-note"
            />
            <div className="text-xs text-planets-dark-grey opacity-60">
              {note.length}/200 characters
            </div>
          </div>

          {/* Chip value explanation */}
          <div className="bg-planets-soft-grey rounded-lg p-3 text-sm">
            <div className="font-medium text-planets-dark-grey mb-1">
              💡 Chip Allocation Impact
            </div>
            <ul className="text-planets-dark-grey opacity-80 space-y-1">
              <li>• Boosts team's leaderboard ranking</li>
              <li>• Shows your investment interest</li>
              <li>• Unlocks intro opportunities at 10+ chips</li>
              <li>• Teams get +15 points per chip received</li>
            </ul>
          </div>

          {/* Daily limit warning */}
          {remainingChips <= 3 && (
            <div className="bg-planets-sunshine bg-opacity-10 border border-planets-sunshine rounded-lg p-3">
              <div className="flex items-center gap-2 text-planets-dark-grey">
                <Zap className="w-4 h-4 text-planets-sunshine" />
                <span className="text-sm font-medium">
                  Low on chips! Only {remainingChips} remaining today.
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-planets-mid-grey">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              data-testid="cancel-chip-allocation"
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              disabled={!canSubmit}
              className="planets-btn-coral"
              data-testid="confirm-chip-allocation"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              Allocate {amount[0]} Chip{amount[0] !== 1 ? 's' : ''}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}