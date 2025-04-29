'use client';

import { PieChart } from '@/components/common/pie-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity } from '@/types/activity';
import { DayPlanBrief } from '@/types/itinerary';
import { format, parseISO } from 'date-fns';
import {
  BarChart3,
  Coins,
  DollarSign,
  HelpCircle,
  PieChart as PieChartIcon,
  Plane,
  Receipt,
  Utensils,
} from 'lucide-react';
import { useState } from 'react';
import { Calendar } from '../ui/calendar';

interface CostTrackerProps {
  activities: Activity[];
  dayPlans: DayPlanBrief[];
  isDarkMode: boolean;
}

interface CostCategory {
  type: string;
  amount: number;
  color: string;
}

export function CostTracker({
  activities,
  dayPlans,
  isDarkMode,
}: CostTrackerProps) {
  const [viewMode, setViewMode] = useState<'summary' | 'by-day' | 'by-category'>(
    'summary'
  );

  // Calculate total cost from activities
  const totalCost = activities.reduce((sum, activity) => sum + (activity.cost || 0), 0);

  // Calculate costs by category
  const costsByCategory: { [key: string]: number } = {};
  activities.forEach(activity => {
    const category = activity.type || 'Other';
    costsByCategory[category] = (costsByCategory[category] || 0) + (activity.cost || 0);
  });

  // Prepare data for pie chart
  const getTypeColor = (type: string): string => {
    const lowerType = type.toLowerCase();

    if (lowerType.includes('food') || lowerType.includes('dining')) {
      return '#ff6d00'; // sunset
    } else if (lowerType.includes('transport') || lowerType.includes('flight')) {
      return '#0277bd'; // ocean
    } else if (lowerType.includes('hotel') || lowerType.includes('lodging')) {
      return '#2e7d32'; // forest
    } else if (lowerType.includes('sight') || lowerType.includes('attraction')) {
      return '#f9a825'; // sand
    } else if (lowerType.includes('event') || lowerType.includes('entertainment')) {
      return '#7b1fa2'; // primary
    } else {
      return '#607d8b'; // muted
    }
  };

  const pieChartData: CostCategory[] = Object.entries(costsByCategory).map(
    ([type, amount]) => ({
      type,
      amount,
      color: getTypeColor(type),
    })
  ).sort((a, b) => b.amount - a.amount);

  // Calculate costs by day
  const costsByDay: { [key: string]: number } = {};
  activities.forEach(activity => {
    const dayPlan = dayPlans.find(dp =>
      dp.id === activity.day_plan_id
    );

    if (dayPlan) {
      const date = format(parseISO(dayPlan.date), 'MMM d');
      costsByDay[date] = (costsByDay[date] || 0) + (activity.cost || 0);
    }
  });

  // Format numbers as currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card className="border-muted/20 bg-background/70 backdrop-blur-sm shadow-md rounded-2xl">
      <CardHeader className="border-b border-muted/10 bg-gradient-to-r from-background/80 to-background/40">
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary/80" />
          Trip Budget Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="mb-6 p-4 rounded-xl bg-muted/5 border border-muted/10 text-center">
          <p className="text-muted-foreground text-sm mb-1">Total Trip Cost</p>
          <h3 className="text-3xl font-bold text-primary">{formatCurrency(totalCost)}</h3>
        </div>

        <Tabs defaultValue="summary" onValueChange={(v) => setViewMode(v as any)} className="mt-4">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="summary" className="rounded-lg">
              <PieChartIcon className="h-4 w-4 mr-2" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="by-day" className="rounded-lg">
              <BarChart3 className="h-4 w-4 mr-2" />
              By Day
            </TabsTrigger>
            <TabsTrigger value="by-category" className="rounded-lg">
              <Coins className="h-4 w-4 mr-2" />
              By Category
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            {pieChartData.length > 0 ? (
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="w-full md:w-1/2">
                  <PieChart
                    data={pieChartData.map(item => ({
                      name: item.type,
                      value: item.amount,
                      color: item.color
                    }))}
                    isDarkMode={isDarkMode}
                  />
                </div>
                <div className="w-full md:w-1/2 space-y-2">
                  {pieChartData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/10 border border-muted/20">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm">{item.type}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground/30 mb-2" />
                <p className="text-muted-foreground">No cost data available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="by-day">
            {Object.keys(costsByDay).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(costsByDay)
                  .sort((a, b) => {
                    const dateA = new Date(a[0]);
                    const dateB = new Date(b[0]);
                    return dateA.getTime() - dateB.getTime();
                  })
                  .map(([date, cost], index) => (
                    <div key={index} className="flex items-center p-3 rounded-lg bg-muted/10 border border-muted/20">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center bg-primary/10 text-primary mr-3">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <p className="font-medium">{date}</p>
                          <p className="font-bold">{formatCurrency(cost)}</p>
                        </div>
                        <div className="w-full bg-muted/20 h-1.5 rounded-full mt-1.5">
                          <div
                            className="bg-primary h-1.5 rounded-full"
                            style={{ width: `${(cost / totalCost) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground/30 mb-2" />
                <p className="text-muted-foreground">No daily cost data available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="by-category">
            {pieChartData.length > 0 ? (
              <div className="space-y-3">
                {pieChartData.map((item, index) => (
                  <div key={index} className="flex items-center p-3 rounded-lg bg-muted/10 border border-muted/20">
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center mr-3"
                      style={{ backgroundColor: `${item.color}20`, color: item.color }}
                    >
                      {item.type.toLowerCase().includes('food') ? (
                        <Utensils className="h-4 w-4" />
                      ) : item.type.toLowerCase().includes('transport') ? (
                        <Plane className="h-4 w-4" />
                      ) : (
                        <DollarSign className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="font-medium">{item.type}</p>
                        <p className="font-bold">{formatCurrency(item.amount)}</p>
                      </div>
                      <div className="w-full bg-muted/20 h-1.5 rounded-full mt-1.5">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${(item.amount / totalCost) * 100}%`,
                            backgroundColor: item.color
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.round((item.amount / totalCost) * 100)}% of total
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground/30 mb-2" />
                <p className="text-muted-foreground">No category cost data available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
