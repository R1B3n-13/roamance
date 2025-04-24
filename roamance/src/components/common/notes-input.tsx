import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';
import { useTheme } from 'next-themes';

interface NotesInputProps {
  notes: string[];
  newNote: string;
  onNoteChange: (value: string) => void;
  onAddNote: () => void;
  onRemoveNote: (index?: number) => void;
}

export const NotesInput: React.FC<NotesInputProps> = ({
  notes,
  newNote,
  onNoteChange,
  onAddNote,
  onRemoveNote,
}) => {
  // Handle the case where we may receive a single note as an array with one item
  const hasNote = notes?.length > 0 && notes[0] !== '';
  const [showPreview, setShowPreview] = useState(false);
  const { theme } = useTheme();
  const [themeState, setThemeState] = useState<'light' | 'dark'>('light');

  // Update the theme state when the theme changes
  useEffect(() => {
    setThemeState(theme === 'dark' ? 'dark' : 'light');
  }, [theme]);

  // Auto-save the note when it changes
  useEffect(() => {
    // Only auto-save if there's content and it's not already saved
    if (newNote && newNote.trim() && !hasNote) {
      const debounceTimer = setTimeout(() => {
        onAddNote();
      }, 1000); // Auto-save after 1 second of inactivity

      return () => clearTimeout(debounceTimer);
    }
  }, [newNote, hasNote, onAddNote]);

  const handleNoteChange = (value: string | undefined) => {
    onNoteChange(value || '');

    // If we already have a note, update it directly
    if (hasNote) {
      // In this case, we'll just call onAddNote which now updates the existing note
      onAddNote();
    }
  };

  return (
    <div data-color-mode={themeState}>
      {hasNote && (
        <div className="flex items-center gap-2 mb-2">
          <Badge
            variant="outline"
            className="text-xs h-5 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/30"
          >
            Note
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="text-xs h-7"
          >
            {showPreview ? 'Edit' : 'Preview'}
          </Button>
          <Button
            type="button"
            onClick={() => onRemoveNote()}
            variant="ghost"
            size="icon"
            className="h-7 w-7 ml-auto shrink-0 text-muted-foreground hover:text-destructive"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      {/* Editor or Preview */}
      {hasNote && showPreview ? (
        // Preview mode
        <div className="mb-4 rounded-lg border border-muted/30 overflow-hidden">
          <div className="bg-muted/10 p-2 border-b border-muted/20">
            <span className="text-sm font-medium text-foreground/70">Preview</span>
          </div>
          <div className="p-3">
            <MDEditor.Markdown
              source={notes[0]}
              rehypePlugins={[[rehypeSanitize]]}
              className="markdown-body"
            />
          </div>
        </div>
      ) : (
        // Editor mode (editing existing note or creating new one)
        <div className="mb-4">
          <MDEditor
            value={hasNote ? notes[0] : newNote}
            onChange={handleNoteChange}
            preview="edit"
            height={200}
            visibleDragbar={false}
            highlightEnable={true}
            previewOptions={{
              rehypePlugins: [[rehypeSanitize]],
            }}
          />
        </div>
      )}

      {!hasNote && !newNote && (
        <div className="text-sm text-muted-foreground py-2 text-center">
          Add a note using Markdown
        </div>
      )}
    </div>
  );
};
