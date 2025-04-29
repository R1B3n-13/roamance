'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Check, CheckCheck, PackageCheck, Plus, Tag, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface ChecklistItem {
  id: string;
  text: string;
  category: string;
  isChecked: boolean;
}

interface TripChecklistProps {
  itineraryId: string;
  isDarkMode: boolean;
}

export function TripChecklist({ itineraryId, isDarkMode }: TripChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('essentials');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState(true);

  useEffect(() => {
    // In a real app, we'd fetch this from an API
    // For now, we'll load from localStorage with some default items if none exist
    const savedItems = localStorage.getItem(`checklist-${itineraryId}`);

    if (savedItems) {
      setItems(JSON.parse(savedItems));
    } else {
      // Default checklist items
      const defaultItems: ChecklistItem[] = [
        { id: '1', text: 'Passport', category: 'documents', isChecked: false },
        { id: '2', text: 'Travel insurance', category: 'documents', isChecked: false },
        { id: '3', text: 'Flight tickets', category: 'documents', isChecked: false },
        { id: '4', text: 'Hotel reservations', category: 'documents', isChecked: false },
        { id: '5', text: 'Phone charger', category: 'electronics', isChecked: false },
        { id: '6', text: 'Camera', category: 'electronics', isChecked: false },
        { id: '7', text: 'Adapter plug', category: 'electronics', isChecked: false },
        { id: '8', text: 'Medications', category: 'health', isChecked: false },
        { id: '9', text: 'First aid kit', category: 'health', isChecked: false },
        { id: '10', text: 'Toothbrush', category: 'toiletries', isChecked: false },
        { id: '11', text: 'Shampoo', category: 'toiletries', isChecked: false },
        { id: '12', text: 'Sunscreen', category: 'toiletries', isChecked: false },
        { id: '13', text: 'T-shirts', category: 'clothing', isChecked: false },
        { id: '14', text: 'Pants/shorts', category: 'clothing', isChecked: false },
        { id: '15', text: 'Underwear', category: 'clothing', isChecked: false },
        { id: '16', text: 'Socks', category: 'clothing', isChecked: false },
        { id: '17', text: 'Jacket', category: 'clothing', isChecked: false },
        { id: '18', text: 'Swimwear', category: 'clothing', isChecked: false },
        { id: '19', text: 'Walking shoes', category: 'footwear', isChecked: false },
        { id: '20', text: 'Sandals', category: 'footwear', isChecked: false },
      ];
      setItems(defaultItems);
      localStorage.setItem(`checklist-${itineraryId}`, JSON.stringify(defaultItems));
    }
  }, [itineraryId]);

  useEffect(() => {
    // Save to localStorage whenever items change
    localStorage.setItem(`checklist-${itineraryId}`, JSON.stringify(items));
  }, [items, itineraryId]);

  const handleAddItem = () => {
    if (newItemText.trim() === '') return;

    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: newItemText.trim(),
      category: newItemCategory,
      isChecked: false,
    };

    setItems([...items, newItem]);
    setNewItemText('');
  };

  const handleToggleItem = (id: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, isChecked: !item.isChecked } : item
      )
    );
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  // Filter items based on category and completion status
  const filteredItems = items.filter((item) => {
    if (!showCompleted && item.isChecked) return false;
    if (filterCategory === 'all') return true;
    return item.category === filterCategory;
  });

  // Group items by category
  const groupedItems: Record<string, ChecklistItem[]> = {};

  filteredItems.forEach((item) => {
    if (!groupedItems[item.category]) {
      groupedItems[item.category] = [];
    }
    groupedItems[item.category].push(item);
  });

  // Calculate progress
  const totalItems = items.length;
  const completedItems = items.filter((item) => item.isChecked).length;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  // Category options
  const categories = [
    { value: 'essentials', label: 'Essentials' },
    { value: 'documents', label: 'Documents' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'footwear', label: 'Footwear' },
    { value: 'toiletries', label: 'Toiletries' },
    { value: 'health', label: 'Health & Medicine' },
    { value: 'other', label: 'Other' },
  ];

  const getCategoryLabel = (value: string) => {
    const category = categories.find((c) => c.value === value);
    return category ? category.label : value;
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'essentials':
        return 'bg-primary text-primary-foreground';
      case 'documents':
        return 'bg-forest text-forest-foreground';
      case 'electronics':
        return 'bg-ocean text-ocean-foreground';
      case 'clothing':
        return 'bg-sunset text-sunset-foreground';
      case 'footwear':
        return 'bg-sand text-sand-foreground';
      case 'toiletries':
        return 'bg-purple-500 text-white';
      case 'health':
        return 'bg-red-500 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="border-muted/20 bg-background/70 backdrop-blur-sm shadow-md rounded-2xl">
      <CardHeader className="border-b border-muted/10 bg-gradient-to-r from-background/80 to-background/40">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <PackageCheck className="h-5 w-5 text-primary/80" />
            Trip Packing Checklist
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              {completedItems}/{totalItems} Packed
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Packing progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-forest to-primary"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Add new item */}
        <div className="mb-6 flex flex-col sm:flex-row gap-2">
          <Input
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add item to pack..."
            className="flex-1"
          />
          <Select
            value={newItemCategory}
            onValueChange={setNewItemCategory}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAddItem} className="px-3 whitespace-nowrap">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Select
            value={filterCategory}
            onValueChange={setFilterCategory}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            className={cn(
              'flex gap-2 border-muted',
              showCompleted ? 'bg-muted/10' : 'bg-muted/20'
            )}
            onClick={() => setShowCompleted(!showCompleted)}
          >
            <Checkbox checked={showCompleted} />
            Show Completed
          </Button>
        </div>

        {/* Checklist items grouped by category */}
        <div className="space-y-6">
          {Object.keys(groupedItems).length > 0 ? (
            Object.entries(groupedItems).map(([category, categoryItems]) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={cn("px-2 py-1 text-xs", getCategoryColor(category))}>
                    <Tag className="h-3 w-3 mr-1" />
                    {getCategoryLabel(category)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {categoryItems.filter(item => item.isChecked).length}/{categoryItems.length} items packed
                  </span>
                </div>

                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-all",
                      item.isChecked
                        ? (isDarkMode ? "bg-muted/20 border-muted/30" : "bg-muted/10 border-muted/20")
                        : (isDarkMode ? "bg-background/40 border-muted/20" : "bg-background/80 border-muted/10"),
                      item.isChecked && "line-through text-muted-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={item.isChecked}
                        onCheckedChange={() => handleToggleItem(item.id)}
                        className={item.isChecked ? "text-primary border-primary" : ""}
                      />
                      <span>{item.text}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteItem(item.id)}
                      className="h-7 w-7 rounded-full hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className="text-center py-8 border border-dashed rounded-xl border-muted/30">
              <CheckCheck className="mx-auto h-12 w-12 text-muted-foreground/30 mb-2" />
              <p className="text-muted-foreground">
                {items.length === 0
                  ? "Add items to your packing list"
                  : "No items match your current filters"}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
