import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils'; // Import cn

export const DialogXButton = ({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close> & {
  onClick?: () => void;
  className?: string;
}) => {
  return (
    <DialogPrimitive.Close asChild {...props} onClick={onClick}>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'rounded-full text-muted-foreground hover:text-foreground transition-colors',
          className
        )}
      >
        <X className="w-5 h-5" />
        <span className="sr-only">Close</span>
      </Button>
    </DialogPrimitive.Close>
  );
};
