import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import React from 'react';

interface NotesInputProps {
  notes: string[];
  newNote: string;
  onNoteChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddNote: () => void;
  onRemoveNote: (index: number) => void;
}

export const NotesInput: React.FC<NotesInputProps> = ({
  notes,
  newNote,
  onNoteChange,
  onAddNote,
  onRemoveNote,
}) => {
  return (
    <>
      {notes?.length > 0 && (
        <Badge
          variant="outline"
          className="text-xs h-5 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/30"
        >
          {notes?.length}
        </Badge>
      )}

      <div className="flex space-x-2">
        <Input
          type="text"
          value={newNote}
          onChange={onNoteChange}
          className="h-9 text-sm"
          placeholder="Add a note..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onAddNote();
            }
          }}
        />
        <Button
          type="button"
          onClick={onAddNote}
          variant="outline"
          size="sm"
          className="h-9 shrink-0 border-indigo-200 dark:border-indigo-800/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/30 transition-colors"
        >
          Add
        </Button>
      </div>

      <div className="space-y-1 max-h-[180px] overflow-y-auto pr-1 scrollbar-hide rounded-lg border border-muted/30 bg-background/50 divide-y divide-muted/20">
        {notes?.length > 0 ? (
          notes.map((note, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 group p-2.5 hover:bg-muted/10 transition-colors duration-200"
            >
              <span className="text-sm text-foreground/80 flex-1 line-clamp-1">
                {note}
              </span>
              <Button
                type="button"
                onClick={() => onRemoveNote(index)}
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
            No notes added yet
          </div>
        )}
      </div>
    </>
  );
};
