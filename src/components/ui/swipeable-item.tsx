import { useState, useRef, ReactNode } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SwipeableItemProps {
  children: ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  editLabel?: string;
  deleteLabel?: string;
  className?: string;
}

export function SwipeableItem({
  children,
  onEdit,
  onDelete,
  editLabel = "Modifica",
  deleteLabel = "Elimina",
  className,
}: SwipeableItemProps) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const ACTION_WIDTH = 140; // Width of action buttons area
  const SWIPE_THRESHOLD = 50; // Minimum swipe distance to trigger

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      // Only allow left swipe (negative deltaX)
      if (eventData.deltaX < 0) {
        const newOffset = Math.max(-ACTION_WIDTH, eventData.deltaX);
        setSwipeOffset(newOffset);
      } else if (isRevealed) {
        // Allow right swipe to close
        const newOffset = Math.min(0, -ACTION_WIDTH + eventData.deltaX);
        setSwipeOffset(newOffset);
      }
    },
    onSwipedLeft: (eventData) => {
      if (Math.abs(eventData.deltaX) > SWIPE_THRESHOLD) {
        setSwipeOffset(-ACTION_WIDTH);
        setIsRevealed(true);
      } else {
        setSwipeOffset(0);
        setIsRevealed(false);
      }
    },
    onSwipedRight: () => {
      setSwipeOffset(0);
      setIsRevealed(false);
    },
    onTouchEndOrOnMouseUp: () => {
      // Snap to closest position
      if (Math.abs(swipeOffset) > ACTION_WIDTH / 2) {
        setSwipeOffset(-ACTION_WIDTH);
        setIsRevealed(true);
      } else {
        setSwipeOffset(0);
        setIsRevealed(false);
      }
    },
    trackMouse: false, // Only track touch for mobile
    trackTouch: true,
    delta: 10,
    preventScrollOnSwipe: true,
  });

  const handleEdit = () => {
    setSwipeOffset(0);
    setIsRevealed(false);
    onEdit?.();
  };

  const handleDelete = () => {
    setSwipeOffset(0);
    setIsRevealed(false);
    onDelete?.();
  };

  const closeSwipe = () => {
    setSwipeOffset(0);
    setIsRevealed(false);
  };

  return (
    <div 
      ref={containerRef}
      className={cn("relative overflow-hidden md:overflow-visible", className)}
    >
      {/* Action buttons revealed on swipe - mobile only */}
      <div 
        className="absolute right-0 top-0 bottom-0 flex items-center gap-1 p-2 md:hidden"
        style={{ width: ACTION_WIDTH }}
      >
        {onEdit && (
          <Button
            variant="default"
            size="icon"
            aria-label={editLabel}
            className={cn(
              'h-12 w-12 bg-accent text-accent-foreground border-2 border-foreground',
              'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-foreground',
              'touch-action-manipulation'
            )}
            onClick={handleEdit}
          >
            <Pencil className="h-5 w-5" aria-hidden="true" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="destructive"
            size="icon"
            aria-label={deleteLabel}
            className={cn(
              'h-12 w-12 border-2 border-foreground',
              'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-foreground',
              'touch-action-manipulation'
            )}
            onClick={handleDelete}
          >
            <Trash2 className="h-5 w-5" aria-hidden="true" />
          </Button>
        )}
      </div>

      {/* Swipeable content - mobile only swipes */}
      <div
        {...handlers}
        className={cn(
          "relative bg-background transition-transform duration-200 ease-out",
          "md:translate-x-0 md:transition-none"
        )}
        style={{ 
          transform: `translateX(${swipeOffset}px)`,
        }}
        onClick={isRevealed ? closeSwipe : undefined}
      >
        {children}
      </div>
    </div>
  );
}
