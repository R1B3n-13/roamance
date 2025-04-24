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
  CheckCircle2,
  ChevronDown,
  Clock,
  Edit,
  Eye,
  ListChecks,
  MapPin,
  MoreHorizontal,
  Pencil,
  Route,
  Save,
  StickyNote,
  Trash2,
  X,
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
  onUpdateSubsection?: (subsection: SubsectionDetailResponseDto) => Promise<void>;
}

type EditableField = 'title' | 'note' | 'checklist' | null;

export const SubsectionDetail: React.FC<SubsectionDetailProps> = ({
  subsection,
  isActive,
  toggleSubsection,
  colors,
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
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium"
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
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-medium"
          >
            <X className="h-3 w-3" />
            Error saving changes
          </motion.span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        'mb-6 rounded-xl transition-all relative overflow-hidden group/section',
        'backdrop-blur-sm shadow-sm hover:shadow-md',
        'border border-slate-200/80 dark:border-slate-800/80',
        isActive
          ? 'ring-2 ring-offset-2 dark:ring-offset-slate-950 ring-sky-500/20 dark:ring-sky-600/20'
          : 'hover:ring-1 hover:ring-offset-1 dark:hover:ring-offset-slate-950 hover:ring-sky-500/10 dark:hover:ring-sky-600/10',
        'bg-white/70 dark:bg-slate-900/70',
        'hover:bg-white dark:hover:bg-slate-900 transition-all duration-300'
      )}
    >
      {/* Background gradient overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-5 group-hover/section:opacity-8 transition-opacity duration-300",
          colors.gradient
        )}
      />

      {/* Frost effect overlay */}
      <div className="absolute inset-0 bg-white/10 dark:bg-slate-900/10 backdrop-blur-[1px]" />

      {/* Header button - always visible */}
      <div
        onClick={() => {
          if (!editingField) toggleSubsection();
        }}
        className={cn(
          'flex items-center justify-between w-full p-5 cursor-pointer transition-all relative z-10',
          'border-b',
          isActive ? 'border-slate-200 dark:border-slate-800' : 'border-transparent'
        )}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className={cn(
              'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center',
              colors.bgSolid,
              'ring-1 ring-black/5 dark:ring-white/5 shadow-sm'
            )}
          >
            {subsection.type === SubsectionType.SIGHTSEEING && (
              <div className={cn('w-6 h-6 flex items-center justify-center', colors.icon)}>
                <Eye className="w-5 h-5 transition-transform group-hover/section:scale-110" />
              </div>
            )}
            {subsection.type === SubsectionType.ACTIVITY && (
              <div className={cn('w-6 h-6 flex items-center justify-center', colors.icon)}>
                <Activity className="w-5 h-5 transition-transform group-hover/section:scale-110" />
              </div>
            )}
            {subsection.type === SubsectionType.ROUTE && (
              <div className={cn('w-6 h-6 flex items-center justify-center', colors.icon)}>
                <Route className="w-5 h-5 transition-transform group-hover/section:scale-110" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {editingField === 'title' ? (
              <div className="flex items-center gap-2 py-1">
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  autoFocus
                  placeholder="Section title"
                  className="w-full border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    disabled={isSaving}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancel('title');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                    disabled={isSaving}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSave('title');
                    }}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 group">
                <h3 className="font-medium text-lg truncate tracking-tight">{subsection.title}</h3>
                {onUpdateSubsection && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 rounded-full text-muted-foreground hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingField('title');
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 mt-0.5">
              <Badge className={cn(
                colors.badge,
                "px-2 py-0.5 text-xs font-medium rounded-full"
              )}>
                {subsection.type === SubsectionType.SIGHTSEEING &&
                  'Sightseeing'}
                {subsection.type === SubsectionType.ACTIVITY && 'Activity'}
                {subsection.type === SubsectionType.ROUTE && 'Route'}
              </Badge>

              {subsection.type === SubsectionType.ACTIVITY &&
                subsection.activity_type && (
                  <span className="text-xs text-muted-foreground/80">
                    {subsection.activity_type}
                  </span>
                )}

              {subsection.type === SubsectionType.ROUTE &&
                subsection.waypoints && (
                  <span className="text-xs text-muted-foreground/80">
                    {subsection.waypoints.length} waypoints
                  </span>
                )}

              {/* Save status indicator */}
              {getSaveStatusIndicator()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onUpdateSubsection && isActive && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-xl p-1.5 border-slate-200 dark:border-slate-800">
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer rounded-lg focus:bg-slate-100 dark:focus:bg-slate-800">
                  <Edit className="h-4 w-4 text-muted-foreground" />
                  <span>Edit Section</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer rounded-lg focus:bg-slate-100 dark:focus:bg-slate-800">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>View Timeline</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-destructive rounded-lg focus:bg-destructive/10 dark:focus:bg-destructive/20">
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Section</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            "text-muted-foreground hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20",
            "transition-transform duration-300",
            isActive ? "rotate-180" : ""
          )}>
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Content area - only visible when active */}
      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden relative z-10"
          >
            <div className="p-5 space-y-5">
              {/* Location for sightseeing */}
              {subsection.type === SubsectionType.SIGHTSEEING &&
                subsection.location &&
                subsection.location.latitude !== 0 &&
                subsection.location.longitude !== 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <MapPin className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                    <span>Location</span>
                  </h4>
                  <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                    <LocationMap
                      location={subsection.location}
                      type="single"
                      height="250px"
                      className="w-full"
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>
                      {subsection.location.latitude.toFixed(6)}, {subsection.location.longitude.toFixed(6)}
                    </span>
                  </div>
                </div>
              )}

              {/* Activity details */}
              {subsection.type === SubsectionType.ACTIVITY && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Activity className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                    <span>Activity Details</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Type</div>
                      <div className="font-medium">{subsection.activity_type || 'General Activity'}</div>
                    </div>
                    {subsection.location && subsection.location.latitude !== 0 && subsection.location.longitude !== 0 && (
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Location</div>
                        <div className="font-medium text-sm">
                          {subsection.location.latitude.toFixed(6)}, {subsection.location.longitude.toFixed(6)}
                        </div>
                      </div>
                    )}
                  </div>
                  {subsection.location && subsection.location.latitude !== 0 && subsection.location.longitude !== 0 && (
                    <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm mt-3">
                      <LocationMap
                        location={subsection.location}
                        type="single"
                        height="250px"
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Route details */}
              {subsection.type === SubsectionType.ROUTE && subsection.waypoints && subsection.waypoints.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Route className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                    <span>Route Details</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {subsection.total_distance !== undefined && (
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Distance</div>
                        <div className="font-medium">{subsection.total_distance.toFixed(1)} km</div>
                      </div>
                    )}
                    {subsection.total_time !== undefined && (
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Duration</div>
                        <div className="font-medium">{subsection.total_time} mins</div>
                      </div>
                    )}
                  </div>
                  <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                    <LocationMap
                      waypoints={subsection.waypoints}
                      type="route"
                      height="250px"
                      className="w-full"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-2 mt-3">
                    <h5 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Waypoints</h5>
                    {subsection.waypoints.map((waypoint, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800"
                      >
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-700 dark:text-slate-300">
                          {index + 1}
                        </div>
                        <div className="text-sm">
                          {waypoint.latitude.toFixed(6)}, {waypoint.longitude.toFixed(6)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes section */}
              {editingField === 'note' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <StickyNote className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                      <span>Notes</span>
                    </h4>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        disabled={isSaving}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancel('note');
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 rounded-full text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                        disabled={isSaving}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSave('note');
                        }}
                      >
                        <Save className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div data-color-mode={isDarkMode ? "dark" : "light"}>
                    <MDEditor
                      value={editedNote}
                      onChange={(value) => setEditedNote(value || '')}
                      preview="edit"
                      height={200}
                      className="w-full border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden"
                    />
                  </div>
                </div>
              ) : (
                subsection.note && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between group">
                      <h4 className="text-sm font-medium flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <StickyNote className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                        <span>Notes</span>
                      </h4>
                      {onUpdateSubsection && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 rounded-full text-muted-foreground hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingField('note');
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none break-words overflow-hidden bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                      <MDEditor.Markdown source={subsection.note} />
                    </div>
                  </div>
                )
              )}

              {/* Checklist section */}
              {editingField === 'checklist' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <ListChecks className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                      <span>Checklist</span>
                    </h4>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        disabled={isSaving}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancel('checklist');
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 rounded-full text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                        disabled={isSaving}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSave('checklist');
                        }}
                      >
                        <Save className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2 bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                    {editedChecklist.length > 0 ? (
                      <div className="space-y-2">
                        {editedChecklist.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/80 group"
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
                              className="h-4 w-4 rounded-sm data-[state=checked]:bg-sky-600 data-[state=checked]:text-white"
                            />
                            <span className={cn(
                              "flex-1 text-sm",
                              item.completed && "line-through text-muted-foreground"
                            )}>
                              {item.title}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveChecklistItem(index)}
                              className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-2">
                        <p className="text-sm">No items in checklist</p>
                      </div>
                    )}
                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <Input
                        placeholder="Add new item"
                        value={newChecklistItem}
                        onChange={(e) => setNewChecklistItem(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddChecklistItem();
                          }
                        }}
                        className="h-8 text-sm flex-1"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="default"
                        onClick={handleAddChecklistItem}
                        className="h-8 bg-sky-600 hover:bg-sky-700 text-white"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                subsection.checklists && subsection.checklists.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between group">
                      <h4 className="text-sm font-medium flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <ListChecks className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                        <span>Checklist</span>
                      </h4>
                      {onUpdateSubsection && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 rounded-full text-muted-foreground hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingField('checklist');
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2 bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                      {subsection.checklists.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/30"
                        >
                          <Checkbox
                            checked={item.completed}
                            onCheckedChange={() => handleToggleCheckItem(idx)}
                            className="h-4 w-4 rounded-sm data-[state=checked]:bg-sky-600 data-[state=checked]:text-white"
                          />
                          <span className={cn(
                            "text-sm",
                            item.completed && "line-through text-muted-foreground"
                          )}>
                            {item.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Subsection detail skeleton for loading state
const SubsectionDetailSkeleton = () => {
  return (
    <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm shadow-sm overflow-hidden">
      <div className="p-4 flex items-start justify-between relative">
        {/* Left content */}
        <div className="flex items-start space-x-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800/60 animate-pulse flex-shrink-0"></div>
          <div className="space-y-2 flex-1 min-w-0 pt-0.5">
            <div className="h-5 w-3/4 bg-slate-200/80 dark:bg-slate-700/80 rounded-md animate-pulse"></div>
            <div className="flex items-center space-x-2">
              <div className="h-5 w-20 bg-indigo-100/80 dark:bg-indigo-900/60 rounded-full animate-pulse"></div>
              <div className="h-4 w-24 bg-slate-100/80 dark:bg-slate-800/80 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Right content */}
        <div className="w-6 h-6 rounded-full bg-slate-100/80 dark:bg-slate-800/80 animate-pulse"></div>

        {/* Shimmer effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -inset-x-full top-0 bottom-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent animate-[shimmer_1.5s_infinite]"
            style={{transform: 'translateX(-10%) skewX(-20deg)'}}
          ></div>
        </div>
      </div>

      {/* Expanded content placeholder */}
      <div className="border-t border-slate-200/50 dark:border-slate-700/50 px-4 py-5 space-y-4">
        <div className="space-y-3">
          <div className="h-4 bg-slate-200/80 dark:bg-slate-700/80 rounded-md w-full animate-pulse"></div>
          <div className="h-4 bg-slate-200/80 dark:bg-slate-700/80 rounded-md w-11/12 animate-pulse"></div>
          <div className="h-4 bg-slate-200/80 dark:bg-slate-700/80 rounded-md w-4/5 animate-pulse"></div>
        </div>

        <div className="h-24 w-full rounded-lg bg-slate-100/80 dark:bg-slate-800/60 animate-pulse"></div>

        <div className="space-y-2">
          <div className="flex items-center">
            <div className="w-5 h-5 rounded-full bg-slate-200/80 dark:bg-slate-700/80 mr-2"></div>
            <div className="h-4 w-32 bg-slate-200/80 dark:bg-slate-700/80 rounded-md"></div>
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 rounded-full bg-slate-200/80 dark:bg-slate-700/80 mr-2"></div>
            <div className="h-4 w-24 bg-slate-200/80 dark:bg-slate-700/80 rounded-md"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
