import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';
import React from 'react';
import { ChecklistItem } from '@/types/subsection';

interface ChecklistInputProps {
  items: ChecklistItem[];
  newItem: string;
  onItemChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onToggleItem?: (index: number) => void;
}

export const ChecklistInput: React.FC<ChecklistInputProps> = ({
  items,
  newItem,
  onItemChange,
  onAddItem,
  onRemoveItem,
  onToggleItem,
}) => {
  return (
    <>
      {items?.length > 0 && (
        <Badge
          variant="outline"
          className="text-xs h-5 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30"
        >
          {items?.length}
        </Badge>
      )}

      <div className="flex space-x-2">
        <Input
          type="text"
          value={newItem}
          onChange={onItemChange}
          className="h-9 text-sm"
          placeholder="Add checklist item..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onAddItem();
            }
          }}
        />
        <Button
          type="button"
          onClick={onAddItem}
          variant="outline"
          size="sm"
          className="h-9 shrink-0 border-emerald-200 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/30 transition-colors"
        >
          Add
        </Button>
      </div>

      <div className="space-y-1 max-h-[180px] overflow-y-auto pr-1 scrollbar-hide rounded-lg border border-muted/30 bg-background/50 divide-y divide-muted/20">
        {items?.length > 0 ? (
          items.map((item, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 group p-2.5 hover:bg-muted/10 transition-colors duration-200"
            >
              <Checkbox
                checked={item.completed}
                onCheckedChange={() => onToggleItem?.(index)}
                className="h-4 w-4 flex-shrink-0"
              />
              <span className="text-sm text-foreground/80 flex-1 line-clamp-1">
                {item.title}
              </span>
              <Button
                type="button"
                onClick={() => onRemoveItem(index)}
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive rounded-full opacity-0 group-hover:opacity-100 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))
        ) : (
          <div className="text-sm text-muted-foreground py-4 text-center">
            No checklist items added yet
          </div>
        )}
      </div>
    </>
  );
};
