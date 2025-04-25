import { LocationMap } from '@/components/maps/LocationViwer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  ChecklistItem,
  SubsectionDetailResponseDto,
  SubsectionType,
} from '@/types/subsection';
import MDEditor from '@uiw/react-md-editor';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Clock,
  Edit,
  Eye,
  ListChecks,
  Loader2,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Route,
  Save,
  StickyNote,
  Trash2,
  X,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import React, { useCallback, useEffect, useState } from 'react';
import { formatRelativeTime } from '@/utils/format';

interface SubsectionDetailProps {
  subsection: SubsectionDetailResponseDto;
  isActive: boolean;
  toggleSubsection: () => void;
  colors: {
    bg: string;
    icon: string;
    border: string;
    badge: string;
    bgSolid: string;
    gradient: string;
  };
  index: number;
  onUpdateSubsection?: (subsection: SubsectionDetailResponseDto) => Promise<void>;
}

type EditableField = 'title' | 'note' | 'checklist' | null;

export const SubsectionDetail: React.FC<SubsectionDetailProps> = ({
  subsection,
  isActive,
  toggleSubsection,
  colors,
  index,
  onUpdateSubsection,
}) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const [editingField, setEditingField] = useState<EditableField>(null);
  const [editedTitle, setEditedTitle] = useState(subsection.title);
  const [editedNote, setEditedNote] = useState(subsection.note || '');
  const [editedChecklist, setEditedChecklist] = useState<ChecklistItem[]>(
    subsection.checklists || []
  );
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Reset edited values when subsection changes
  useEffect(() => {
    setEditedTitle(subsection.title);
    setEditedNote(subsection.note || '');
    setEditedChecklist(subsection.checklists || []);
    setEditingField(null);
  }, [subsection]);

  const handleSave = useCallback(async (field: EditableField) => {
    if (!onUpdateSubsection) return;

    setIsSaving(true);
    setSaveStatus('saving');

    try {
      const updatedSubsection = { ...subsection };

      if (field === 'title') {
        updatedSubsection.title = editedTitle;
      } else if (field === 'note') {
        updatedSubsection.note = editedNote;
      } else if (field === 'checklist') {
        updatedSubsection.checklists = editedChecklist;
      }

      await onUpdateSubsection(updatedSubsection);
      setSaveStatus('saved');

      // Reset status after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);

      setEditingField(null);
    } catch (error) {
      console.error('Error saving subsection:', error);
      setSaveStatus('error');

      // Reset status after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } finally {
      setIsSaving(false);
    }
  }, [subsection, editedTitle, editedNote, editedChecklist, onUpdateSubsection]);

  const handleToggleCheckItem = async (index: number) => {
    const newChecklist = [...editedChecklist];
    newChecklist[index] = {
      ...newChecklist[index],
      completed: !newChecklist[index].completed,
    };

    setEditedChecklist(newChecklist);

    // If not in edit mode, save immediately for seamless interaction
    if (editingField !== 'checklist' && onUpdateSubsection) {
      const updatedSubsection = {
        ...subsection,
        checklists: newChecklist
      };

      setSaveStatus('saving');
      try {
        await onUpdateSubsection(updatedSubsection);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        console.error('Error updating checklist:', error);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }
    }
  };

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setEditedChecklist([
        ...editedChecklist,
        { title: newChecklistItem.trim(), completed: false },
      ]);
      setNewChecklistItem('');
    }
  };

  const handleRemoveChecklistItem = (index: number) => {
    setEditedChecklist(editedChecklist.filter((_, i) => i !== index));
  };

  const handleCancel = (field: EditableField) => {
    if (field === 'title') {
      setEditedTitle(subsection.title);
    } else if (field === 'note') {
      setEditedNote(subsection.note || '');
    } else if (field === 'checklist') {
      setEditedChecklist(subsection.checklists || []);
    }

    setEditingField(null);
  };

  // Generate save status indicator
  const getSaveStatusIndicator = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-medium"
          >
            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving changes...
          </motion.span>
        );
      case 'saved':
        return (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-medium"
          >
            <CheckCircle2 className="h-3 w-3" />
            Changes saved
          </motion.span>
        );
      case 'error':
        return (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-medium"
          >
            <AlertCircle className="h-3 w-3" />
            Error saving changes
          </motion.span>
        );
      default:
        return null;
    }
  };

  // Get appropriate icon based on subsection type
  const getIcon = () => {
    switch (subsection.type) {
      case SubsectionType.ACTIVITY:
        return <Activity className={cn("h-5 w-5", colors.icon)} />;
      case SubsectionType.ROUTE:
        return <Route className={cn("h-5 w-5", colors.icon)} />;
      default:
        return <MapPin className={cn("h-5 w-5", colors.icon)} />;
    }
  };

  return (
    <div className="mb-4">
      <motion.div
        layout
        className={cn(
          "border rounded-xl overflow-hidden transition-all duration-300",
          isActive ? "shadow-md" : "shadow-sm hover:shadow-md",
          colors.border,
          isActive ? "bg-white dark:bg-slate-900" : "bg-white/80 dark:bg-slate-900/80"
        )}
      >
        {/* Header */}
        <div
          onClick={toggleSubsection}
          className={cn(
            "p-4 flex items-center justify-between cursor-pointer",
            isActive ? "border-b border-muted/40" : "",
            "hover:bg-muted/5 transition-colors duration-200"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              colors.bg
            )}>
              {getIcon()}
            </div>

            <div>
              <h3 className="font-medium text-foreground">
                {subsection.title || "Untitled Section"}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge
                  variant="outline"
                  className={cn("text-xs font-medium", colors.badge)}
                >
                  {subsection.type}
                </Badge>

                {/* Created/Updated time */}
                {subsection.audit && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(new Date(subsection.audit.last_modified_at))}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getSaveStatusIndicator()}

            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-full transition-transform duration-300",
                isActive && "rotate-180"
              )}
              onClick={(e) => {
                e.stopPropagation();
                toggleSubsection();
              }}
            >
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>

        {/* Subsection Content (expanded) */}
        <AnimatePresence initial={false}>
          {isActive && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-5 space-y-6">
                {/* Title editing */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                      <Pencil className="h-3.5 w-3.5" />
                      Title
                    </h4>

                    {editingField === 'title' ? (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCancel('title')}
                          className="h-7 px-2 text-xs font-medium"
                          disabled={isSaving}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleSave('title')}
                          className="h-7 px-2 text-xs font-medium bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Save className="h-3 w-3 mr-1" />
                          )}
                          Save
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingField('title')}
                        className="h-7 px-2 text-xs font-medium text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>

                  {editingField === 'title' ? (
                    <Input
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="border border-blue-200 dark:border-blue-800 focus-visible:ring-blue-500/20 focus-visible:ring-offset-0"
                      autoFocus
                    />
                  ) : (
                    <p className="text-foreground rounded-md py-2 px-3 bg-muted/30">
                      {subsection.title || "Untitled Section"}
                    </p>
                  )}
                </div>

                {/* Notes section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                      <StickyNote className="h-3.5 w-3.5" />
                      Notes
                    </h4>

                    {editingField === 'note' ? (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCancel('note')}
                          className="h-7 px-2 text-xs font-medium"
                          disabled={isSaving}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleSave('note')}
                          className="h-7 px-2 text-xs font-medium bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Save className="h-3 w-3 mr-1" />
                          )}
                          Save
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingField('note')}
                        className="h-7 px-2 text-xs font-medium text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>

                  {editingField === 'note' ? (
                    <div data-color-mode={isDarkMode ? "dark" : "light"}>
                      <MDEditor
                        value={editedNote}
                        onChange={(value) => setEditedNote(value || '')}
                        preview="edit"
                        height={200}
                        className={cn(
                          "border border-blue-200 dark:border-blue-800 rounded-md overflow-hidden",
                          isDarkMode ? "dark-md-editor" : ""
                        )}
                      />
                    </div>
                  ) : (
                    <div className="rounded-md py-3 px-4 bg-muted/30 prose prose-sm dark:prose-invert max-w-none min-h-[60px]">
                      {subsection.note ? (
                        <MDEditor.Markdown source={subsection.note} />
                      ) : (
                        <p className="text-muted-foreground italic">No notes added yet.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Location map (if available) */}
                {subsection.location && subsection.location.latitude !== 0 && subsection.location.longitude !== 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      Location
                    </h4>
                    <div className="rounded-md overflow-hidden border border-muted">
                      <LocationMap
                        location={subsection.location}
                        type="single"
                        height="200px"
                        className="w-full"
                        zoom={14}
                      />
                    </div>
                  </div>
                )}

                {/* Checklist section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                      <ListChecks className="h-3.5 w-3.5" />
                      Checklist
                    </h4>

                    {editingField === 'checklist' ? (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCancel('checklist')}
                          className="h-7 px-2 text-xs font-medium"
                          disabled={isSaving}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleSave('checklist')}
                          className="h-7 px-2 text-xs font-medium bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Save className="h-3 w-3 mr-1" />
                          )}
                          Save
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingField('checklist')}
                        className="h-7 px-2 text-xs font-medium text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>

                  <div className="rounded-md border border-muted overflow-hidden">
                    {editingField === 'checklist' ? (
                      <div>
                        <div className="divide-y divide-muted">
                          {editedChecklist.map((item, index) => (
                            <div key={index} className="flex items-center p-3 gap-2 bg-background">
                              <Checkbox
                                checked={item.completed}
                                onCheckedChange={() => {
                                  const newList = [...editedChecklist];
                                  newList[index] = {
                                    ...newList[index],
                                    completed: !newList[index].completed,
                                  };
                                  setEditedChecklist(newList);
                                }}
                                className="h-4 w-4 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                              />
                              <Input
                                value={item.title}
                                onChange={(e) => {
                                  const newList = [...editedChecklist];
                                  newList[index] = {
                                    ...newList[index],
                                    title: e.target.value,
                                  };
                                  setEditedChecklist(newList);
                                }}
                                className="flex-1 border-muted h-8"
                              />
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => handleRemoveChecklistItem(index)}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>

                        <div className="p-3 bg-muted/20 border-t border-muted">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add new item"
                              value={newChecklistItem}
                              onChange={(e) => setNewChecklistItem(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleAddChecklistItem();
                                }
                              }}
                              className="flex-1 border-muted h-8"
                            />
                            <Button
                              type="button"
                              size="sm"
                              onClick={handleAddChecklistItem}
                              className="h-8 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="divide-y divide-muted/50 bg-muted/10">
                        {subsection.checklists && subsection.checklists.length > 0 ? (
                          subsection.checklists.map((item, index) => (
                            <div
                              key={index}
                              className={cn(
                                "flex items-center p-3 gap-3",
                                item.completed ? "opacity-80" : "opacity-100"
                              )}
                            >
                              <Checkbox
                                checked={item.completed}
                                onCheckedChange={() => handleToggleCheckItem(index)}
                                className={cn(
                                  "h-4 w-4",
                                  item.completed
                                    ? "data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                                    : "data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                                )}
                              />
                              <span
                                className={cn(
                                  "text-sm",
                                  item.completed
                                    ? "line-through text-muted-foreground"
                                    : "text-foreground"
                                )}
                              >
                                {item.title}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-muted-foreground text-sm">
                            <CheckCircle2 className="w-6 h-6 mx-auto mb-2 opacity-40" />
                            <p>No checklist items added yet</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional information (routes, etc.) */}
                {subsection.type === SubsectionType.ROUTE && subsection.waypoints && subsection.waypoints.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                      <Route className="h-3.5 w-3.5" />
                      Route Details
                    </h4>

                    <div className="rounded-md border border-muted overflow-hidden">
                      <div className="grid grid-cols-2 gap-4 p-3 bg-muted/10">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Total Time</p>
                            <p className="font-medium">
                              {subsection.total_time ? `${subsection.total_time} minutes` : 'Not specified'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Route className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Total Distance</p>
                            <p className="font-medium">
                              {subsection.total_distance ? `${subsection.total_distance} km` : 'Not specified'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 border-t border-muted">
                        <h5 className="text-xs font-medium text-muted-foreground mb-2">Waypoints</h5>
                        <div className="space-y-2">
                          {subsection.waypoints.map((waypoint, index) => (
                            <div key={index} className="bg-muted/20 p-2 rounded text-sm flex justify-between">
                              <div className="flex items-center gap-2">
                                <div className="h-5 w-5 rounded-full bg-muted/60 flex items-center justify-center text-xs font-medium">
                                  {index + 1}
                                </div>
                                <span>Waypoint {index + 1}</span>
                              </div>
                              <div className="text-muted-foreground text-xs">
                                {waypoint.latitude.toFixed(6)}, {waypoint.longitude.toFixed(6)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="pt-2 flex justify-end gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-muted-foreground h-9 border-muted gap-1"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="gap-2 cursor-pointer">
                        <Edit className="h-4 w-4" />
                        Edit All Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 cursor-pointer">
                        <Pencil className="h-4 w-4" />
                        Duplicate Section
                      </DropdownMenuItem>
                      <DropdownMenuTrigger className="w-full">
                        <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                          <Trash2 className="h-4 w-4" />
                          Delete Section
                        </DropdownMenuItem>
                      </DropdownMenuTrigger>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
