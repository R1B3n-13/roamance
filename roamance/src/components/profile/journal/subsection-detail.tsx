import { LocationMap } from '@/components/maps/LocationViwer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  ChecklistItem,
  SubsectionDetailResponseDto,
  SubsectionType,
} from '@/types/subsection';
import { formatRelativeTime } from '@/utils/format';
import MDEditor from '@uiw/react-md-editor';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Clock,
  Edit,
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
} from 'lucide-react';
import { useTheme } from 'next-themes';
import React, { useCallback, useEffect, useState } from 'react';

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
  onUpdateSubsection?: (
    subsection: SubsectionDetailResponseDto
  ) => Promise<void>;
  editMode?: boolean; // Add editMode prop
}

type EditableField = 'title' | 'note' | 'checklist' | null;

export const SubsectionDetail: React.FC<SubsectionDetailProps> = ({
  subsection,
  isActive,
  toggleSubsection,
  colors,
  onUpdateSubsection,
  editMode = false, // Default to false
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
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');

  // Reset edited values when subsection changes
  useEffect(() => {
    setEditedTitle(subsection.title);
    setEditedNote(subsection.note || '');
    setEditedChecklist(subsection.checklists || []);
    setEditingField(null);
  }, [subsection]);

  const handleSave = useCallback(
    async (field: EditableField) => {
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
    },
    [subsection, editedTitle, editedNote, editedChecklist, onUpdateSubsection]
  );

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
        checklists: newChecklist,
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
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Saving changes...</span>
          </motion.span>
        );
      case 'saved':
        return (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium"
          >
            <CheckCircle2 className="h-3 w-3" />
            <span>Changes saved</span>
          </motion.span>
        );
      case 'error':
        return (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-medium"
          >
            <AlertCircle className="h-3 w-3" />
            <span>Error saving</span>
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
        return <Activity className={cn('h-5 w-5', colors.icon)} />;
      case SubsectionType.ROUTE:
        return <Route className={cn('h-5 w-5', colors.icon)} />;
      default:
        return <MapPin className={cn('h-5 w-5', colors.icon)} />;
    }
  };

  // Format creation date
  const getFormattedDate = () => {
    if (!subsection.audit?.created_at) return '';
    const date = new Date(subsection.audit.created_at);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={cn(
        'rounded-xl border bg-white dark:bg-slate-900 backdrop-blur-sm shadow-sm overflow-hidden transition-all duration-300 group',
        isActive ? 'shadow-md' : 'shadow-sm hover:shadow-md',
        isActive ? colors.border : 'border-slate-200 dark:border-slate-800',
        'mb-4'
      )}
    >
      {/* Header section - always visible */}
      <div
        className={cn(
          'p-4 flex items-center justify-between cursor-pointer',
          isActive && colors.bg
        )}
        onClick={toggleSubsection}
      >
        <div className="flex items-center space-x-3">
          <div
            className={cn(
              'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
              colors.bg
            )}
          >
            {getIcon()}
          </div>
          <div>
            <h4 className="font-medium text-slate-900 dark:text-slate-100">
              {subsection.title || 'Untitled Section'}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="outline"
                className={cn('text-xs px-2 h-5', colors.badge)}
              >
                {subsection.type.charAt(0).toUpperCase() +
                  subsection.type.slice(1).toLowerCase()}
              </Badge>
              {subsection.audit?.created_at && (
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatRelativeTime(new Date(subsection.audit.created_at))}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center">
          {saveStatus !== 'idle' && (
            <div className="mr-3">
              <AnimatePresence>{getSaveStatusIndicator()}</AnimatePresence>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'rounded-full h-8 w-8 transition-transform duration-300',
              isActive ? 'rotate-180' : ''
            )}
          >
            <ChevronDown className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </Button>
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-200/50 dark:border-slate-800/50 px-4 py-5 space-y-6">
              {/* Title section - editable */}
              {editingField === 'title' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Section Title
                    </label>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs border-slate-200 dark:border-slate-700"
                        onClick={() => handleCancel('title')}
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 px-2 text-xs bg-blue-500 hover:bg-blue-600 text-white"
                        onClick={() => handleSave('title')}
                        disabled={isSaving || !editedTitle.trim()}
                      >
                        {isSaving ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Save className="h-3 w-3 mr-1" />
                        )}
                        Save
                      </Button>
                    </div>
                  </div>
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full border-slate-300 dark:border-slate-700 focus:border-blue-500"
                    disabled={isSaving}
                    autoFocus
                  />
                </div>
              ) : (
                <div className="flex items-start justify-between group/title">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                      <StickyNote className="w-3.5 h-3.5" />
                      <span>Title</span>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                      {subsection.title}
                    </h3>
                  </div>
                  {editMode && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 rounded-full opacity-0 group-hover/title:opacity-100 transition-opacity text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingField('title');
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}

              {/* Notes section - editable */}
              {subsection.note || editingField === 'note' ? (
                <div className="pt-2">
                  {editingField === 'note' ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <StickyNote className="w-4 h-4" />
                          Notes (Markdown Supported)
                        </label>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs border-slate-200 dark:border-slate-700"
                            onClick={() => handleCancel('note')}
                            disabled={isSaving}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 px-2 text-xs bg-blue-500 hover:bg-blue-600 text-white"
                            onClick={() => handleSave('note')}
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
                      </div>
                      <div data-color-mode={isDarkMode ? 'dark' : 'light'}>
                        <MDEditor
                          value={editedNote}
                          onChange={(val) => setEditedNote(val || '')}
                          preview="edit"
                          height={200}
                          className={cn(
                            'w-full border rounded-md overflow-hidden',
                            isDarkMode ? 'dark-md-editor' : ''
                          )}
                        />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Tip: Use markdown for formatting. *italic*, **bold**, #
                        Heading, etc.
                      </p>
                    </div>
                  ) : (
                    <div className="group/note">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                          <StickyNote className="h-3.5 w-3.5" />
                          <span>Notes</span>
                        </div>
                        {editMode && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 rounded-full opacity-0 group-hover/note:opacity-100 transition-opacity text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingField('note');
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="bg-slate-50/70 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200/70 dark:border-slate-700/50">
                        <div data-color-mode={isDarkMode ? 'dark' : 'light'}>
                          <MDEditor.Markdown
                            source={subsection.note}
                            className={cn(
                              'prose dark:prose-invert prose-sm max-w-none',
                              'prose-headings:font-semibold prose-headings:text-slate-900 dark:prose-headings:text-slate-100',
                              'prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:m-0 prose-p:leading-relaxed'
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Location map (if location is set) */}
              {(subsection.type === SubsectionType.ACTIVITY ||
                subsection.type === SubsectionType.SIGHTSEEING) &&
                subsection.location &&
                subsection.location.latitude !== 0 &&
                subsection.location.longitude !== 0 && (
                  <div className="pt-2">
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mb-3">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>Location</span>
                    </div>
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                      <LocationMap
                        location={subsection.location}
                        type="single"
                        height="200px"
                        zoom={14}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <div>
                        <span>
                          Lat: {subsection.location.latitude.toFixed(6)}
                        </span>
                        <span className="mx-3">|</span>
                        <span>
                          Lng: {subsection.location.longitude.toFixed(6)}
                        </span>
                      </div>
                      {editMode && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs border-slate-200 dark:border-slate-700"
                          onClick={() => {
                            // Ideally we would open a location picker here
                            // But for simplicity, let's just use alert to inform user
                            alert(
                              'Location editing is not available in this view'
                            );
                          }}
                        >
                          <MapPin className="h-3 w-3 mr-1" />
                          Change Location
                        </Button>
                      )}
                    </div>
                  </div>
                )}

              {/* Checklist section - editable */}
              <div className="pt-2 group/checklist">
                {editingField === 'checklist' ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <ListChecks className="w-4 h-4" />
                        Checklist
                      </label>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs border-slate-200 dark:border-slate-700"
                          onClick={() => handleCancel('checklist')}
                          disabled={isSaving}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 px-2 text-xs bg-blue-500 hover:bg-blue-600 text-white"
                          onClick={() => handleSave('checklist')}
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
                    </div>

                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                      {/* Checklist items */}
                      <div className="p-2 max-h-60 overflow-y-auto">
                        {editedChecklist.length > 0 ? (
                          <div className="space-y-2">
                            {editedChecklist.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/60 group/item"
                              >
                                <Checkbox
                                  checked={item.completed}
                                  onCheckedChange={() => {
                                    const newChecklist = [...editedChecklist];
                                    newChecklist[index] = {
                                      ...newChecklist[index],
                                      completed: !newChecklist[index].completed,
                                    };
                                    setEditedChecklist(newChecklist);
                                  }}
                                  className="h-4 w-4 border-slate-300 dark:border-slate-700 rounded"
                                />
                                <div
                                  className={cn(
                                    'flex-1 text-sm',
                                    item.completed
                                      ? 'line-through text-slate-500 dark:text-slate-400'
                                      : 'text-slate-900 dark:text-slate-100'
                                  )}
                                >
                                  {item.title}
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 rounded-full text-slate-400 hover:text-rose-600 dark:hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 opacity-0 group-hover/item:opacity-100 transition-opacity"
                                  onClick={() =>
                                    handleRemoveChecklistItem(index)
                                  }
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-sm">
                            <ListChecks className="h-8 w-8 mx-auto mb-2 opacity-40" />
                            <p>No checklist items yet</p>
                          </div>
                        )}
                      </div>

                      {/* Add new checklist item */}
                      <div className="border-t border-slate-200 dark:border-slate-700 p-2 bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add new item"
                            value={newChecklistItem}
                            onChange={(e) =>
                              setNewChecklistItem(e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleAddChecklistItem();
                              }
                            }}
                            className="flex-1 h-8 text-sm border-slate-300 dark:border-slate-700"
                          />
                          <Button
                            size="sm"
                            onClick={handleAddChecklistItem}
                            disabled={!newChecklistItem.trim()}
                            className="h-8 bg-blue-500 hover:bg-blue-600 text-white px-3"
                          >
                            <Plus className="h-3.5 w-3.5 mr-1" /> Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                        <ListChecks className="h-3.5 w-3.5" />
                        <span>Checklist</span>
                        {subsection.checklists &&
                          subsection.checklists.length > 0 && (
                            <Badge
                              variant="outline"
                              className="ml-1.5 h-5 px-1.5 text-xs font-normal bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                            >
                              {
                                subsection.checklists.filter(
                                  (item) => item.completed
                                ).length
                              }{' '}
                              / {subsection.checklists.length}
                            </Badge>
                          )}
                      </div>
                      {editMode && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 rounded-full opacity-0 group-hover/checklist:opacity-100 transition-opacity text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingField('checklist');
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {subsection.checklists &&
                    subsection.checklists.length > 0 ? (
                      <div className="space-y-2 bg-slate-50/70 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200/70 dark:border-slate-700/50">
                        {subsection.checklists.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 p-2 rounded-md bg-white dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800/80"
                          >
                            <div
                              className={cn(
                                'mt-0.5 flex-shrink-0 h-4.5 w-4.5 rounded border cursor-pointer transition-colors duration-200',
                                item.completed
                                  ? `${colors.bgSolid} border-transparent`
                                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                              )}
                              onClick={() => handleToggleCheckItem(index)}
                            >
                              {item.completed && (
                                <CheckCircle2 className="h-4 w-4 text-white" />
                              )}
                            </div>
                            <div
                              className={cn(
                                'flex-1 text-sm transition-colors duration-200',
                                item.completed
                                  ? 'line-through text-slate-500 dark:text-slate-400'
                                  : 'text-slate-900 dark:text-slate-100'
                              )}
                            >
                              {item.title}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-slate-50/70 dark:bg-slate-800/50 rounded-lg p-4 text-center border border-slate-200/70 dark:border-slate-700/50">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          No checklist items found
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Metadata (date created, last updated, etc.) */}
              <div className="pt-3 mt-2 border-t border-slate-200/70 dark:border-slate-800/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Created: {getFormattedDate()}</span>
                </div>
                {editMode && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 rounded-full"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setEditingField('title')}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        <span>Edit Title</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setEditingField('note')}
                      >
                        <StickyNote className="h-4 w-4 mr-2" />
                        <span>Edit Notes</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setEditingField('checklist')}
                      >
                        <ListChecks className="h-4 w-4 mr-2" />
                        <span>Edit Checklist</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
