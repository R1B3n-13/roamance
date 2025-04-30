'use client';

import { PieChart } from '@/components/common/pie-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity } from '@/types/activity';
import { DayPlanBrief } from '@/types/itinerary';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
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

  // Calculate costs by day using DayPlanBrief.total_cost
  const costsByDay: { [key: string]: number } = {};
  const datesArray: Date[] = [];

  dayPlans.forEach(dp => {
    const parsedDate = parseISO(dp.date);
    const dateKey = format(parsedDate, 'MMM d');
    costsByDay[dateKey] = dp.total_cost;
    datesArray.push(parsedDate);
  });

  // Sort dates for determining range
  datesArray.sort((a, b) => a.getTime() - b.getTime());

  // Get start and end dates if dates exist
  const startDate = datesArray.length > 0 ? datesArray[0] : null;
  const endDate = datesArray.length > 0 ? datesArray[datesArray.length - 1] : null;
  const totalDays = datesArray.length;

  // Find highest daily cost for better visualization
  const highestDailyCost = Object.values(costsByDay).reduce(
    (max, cost) => (cost > max ? cost : max),
    0
  );

  // Format numbers as currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      }
    },
  };

  return (
    <Card className="border-muted/20 bg-background/80 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-muted/10 bg-gradient-to-r from-background/90 to-background/60 py-6">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Receipt className="h-5 w-5 text-sunset" />
          Trip Budget Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-6 p-6 rounded-xl bg-gradient-to-br from-background/70 to-background/40 backdrop-blur-md border border-muted/15 text-center shadow-lg">
          <p className="text-muted-foreground text-sm mb-2">Total Trip Cost</p>
          <h3 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sunset via-sunset-dark to-sunset">
            {formatCurrency(totalCost)}
          </h3>
        </div>

        <Tabs value={viewMode} onValueChange={(value: string) => setViewMode(value as 'summary' | 'by-day' | 'by-category')} className="mt-4">
          <TabsList className="grid grid-cols-3 mb-6 bg-background/70 backdrop-blur-sm p-1 border border-muted/20 rounded-xl shadow-md">
            <TabsTrigger
              value="summary"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-sunset/80 data-[state=active]:to-sunset-dark data-[state=active]:text-white rounded-lg transition-all duration-300"
            >
              <PieChartIcon className="h-4 w-4 mr-2" />
              Summary
            </TabsTrigger>
            <TabsTrigger
              value="by-day"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-ocean/80 data-[state=active]:to-ocean-dark data-[state=active]:text-white rounded-lg transition-all duration-300"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              By Day
            </TabsTrigger>
            <TabsTrigger
              value="by-category"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-forest/80 data-[state=active]:to-forest-dark data-[state=active]:text-white rounded-lg transition-all duration-300"
            >
              <Coins className="h-4 w-4 mr-2" />
              By Category
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            {pieChartData.length > 0 ? (
              <motion.div
                className="flex flex-col md:flex-row gap-6 items-center"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="w-full md:w-1/2 bg-gradient-to-br from-background/70 to-background/40 backdrop-blur-md rounded-xl p-4 border border-muted/15 shadow-lg">
                  <PieChart
                    data={pieChartData.map(item => ({
                      name: item.type,
                      value: item.amount,
                      color: item.color
                    }))}
                    isDarkMode={isDarkMode}
                  />
                </div>
                <div className="w-full md:w-1/2 space-y-3">
                  {pieChartData.map((item, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-br from-background/60 to-background/40 backdrop-blur-md border border-muted/15 hover:border-muted/30 shadow-md hover:shadow-lg transition-all duration-300"
                      style={{
                        borderLeft: `3px solid ${item.color}`
                      }}
                    >
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-lg mr-3 flex items-center justify-center" style={{ backgroundColor: `${item.color}20`, color: item.color }}>
                          {item.type.toLowerCase().includes('food') ? (
                            <Utensils className="h-4 w-4" />
                          ) : item.type.toLowerCase().includes('transport') ? (
                            <Plane className="h-4 w-4" />
                          ) : (
                            <DollarSign className="h-4 w-4" />
                          )}
                        </div>
                        <span className="font-medium">{item.type}</span>
                      </div>
                      <span className="font-bold">{formatCurrency(item.amount)}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-12 px-4 rounded-xl border border-dashed border-muted/30 bg-muted/5 backdrop-blur-md">
                <HelpCircle className="mx-auto h-14 w-14 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground text-lg">No cost data available</p>
                <p className="text-sm text-muted-foreground/70 mt-2 max-w-md mx-auto">
                  Add costs to your activities to see a breakdown of your expenses.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="by-day">
            {Object.keys(costsByDay).length > 0 ? (
              <motion.div
                className="space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Trip Date Range Summary */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-background/70 to-background/40 backdrop-blur-md border border-muted/15 shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <BarChart3 className="h-5 w-5 text-ocean mr-2" />
                      <h3 className="font-medium">Trip Date Range</h3>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {totalDays} {totalDays === 1 ? 'day' : 'days'}
                    </span>
                  </div>

                  {startDate && endDate && (
                    <div className="flex justify-between items-center px-2">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Start</p>
                        <p className="font-medium">{format(startDate, 'MMM d')}</p>
                      </div>

                      <div className="flex-1 px-2">
                        <div className="h-0.5 bg-gradient-to-r from-ocean/30 via-ocean to-ocean/30 rounded-full" />
                      </div>

                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">End</p>
                        <p className="font-medium">{format(endDate, 'MMM d')}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Daily Cost Breakdown */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Daily Cost Breakdown</h3>
                    <div className="px-2 py-1 text-xs rounded-full bg-ocean/10 text-ocean">
                      Avg: {formatCurrency(totalCost / totalDays)}
                    </div>
                  </div>

                  {/* Grid View for costs */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(costsByDay)
                      .sort((a, b) => {
                        const dateA = new Date(a[0]);
                        const dateB = new Date(b[0]);
                        return dateA.getTime() - dateB.getTime();
                      })
                      .map(([date, cost], index) => (
                        <motion.div
                          key={index}
                          variants={itemVariants}
                          className="p-3 rounded-lg bg-gradient-to-br from-background/60 to-background/40 backdrop-blur-md border border-muted/15 hover:border-ocean/20 shadow-sm hover:shadow-md transition-all duration-300"
                        >
                          <div className="flex justify-between items-center">
                            <p className="font-medium text-sm">{date}</p>
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{
                                backgroundColor: cost > (totalCost / totalDays)
                                  ? '#ff6d00' // Higher than average
                                  : '#2e7d32'  // Lower than average
                              }}
                            />
                          </div>
                          <p className="font-bold text-base mt-1">{formatCurrency(cost)}</p>
                          <div className="w-full bg-muted/20 h-1.5 rounded-full mt-2">
                            <div
                              className="bg-gradient-to-r from-ocean to-ocean-dark h-1.5 rounded-full"
                              style={{ width: `${Math.max((cost / highestDailyCost) * 100, 5)}%` }}
                            ></div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-12 px-4 rounded-xl border border-dashed border-muted/30 bg-muted/5 backdrop-blur-md">
                <HelpCircle className="mx-auto h-14 w-14 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground text-lg">No daily cost data available</p>
                <p className="text-sm text-muted-foreground/70 mt-2 max-w-md mx-auto">
                  Add costs to your activities to see a breakdown by day.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="by-category">
            {pieChartData.length > 0 ? (
              <motion.div
                className="space-y-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {pieChartData.map((item, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="flex items-center p-4 rounded-xl bg-gradient-to-br from-background/60 to-background/40 backdrop-blur-md border border-muted/15 hover:border-muted/30 shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center mr-4 shadow-sm"
                      style={{ backgroundColor: `${item.color}20`, color: item.color }}
                    >
                      {item.type.toLowerCase().includes('food') ? (
                        <Utensils className="h-5 w-5" />
                      ) : item.type.toLowerCase().includes('transport') ? (
                        <Plane className="h-5 w-5" />
                      ) : (
                        <DollarSign className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-medium text-base">{item.type}</p>
                        <p className="font-bold text-lg">{formatCurrency(item.amount)}</p>
                      </div>
                      <div className="w-full bg-muted/20 h-2 rounded-full">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${Math.max((item.amount / totalCost) * 100, 5)}%`,
                            background: `linear-gradient(to right, ${item.color}90, ${item.color})`
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center mt-1.5">
                        <p className="text-xs text-muted-foreground">
                          {Math.round((item.amount / totalCost) * 100)}% of total
                        </p>
                        <div
                          className="px-2 py-0.5 text-xs rounded-full"
                          style={{
                            backgroundColor: `${item.color}20`,
                            color: item.color
                          }}
                        >
                          {activities.filter(a => (a.type || 'Other') === item.type).length} items
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-12 px-4 rounded-xl border border-dashed border-muted/30 bg-muted/5 backdrop-blur-md">
                <HelpCircle className="mx-auto h-14 w-14 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground text-lg">No category cost data available</p>
                <p className="text-sm text-muted-foreground/70 mt-2 max-w-md mx-auto">
                  Add costs to your activities to see a breakdown by category.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
