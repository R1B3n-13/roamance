import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export const DialogXButton = ({ onClose }: { onClose: () => void }) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClose}
      className="rounded-full text-muted-foreground hover:text-foreground transition-colors"
    >
      <X className="w-5 h-5" />
    </Button>
  );
};
