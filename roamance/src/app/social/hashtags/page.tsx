'use client';

import { useState } from 'react';
import { DesktopSideNavigation, MobileSideNavigation } from '@/components/navigation/SideNavigation';
import { Hash, Menu } from 'lucide-react';

export default function HashtagsPage() {
  const [activeTab, setActiveTab] = useState('hashtags');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-gray-50 via-purple-50/30 to-indigo-50/40 dark:from-gray-900 dark:via-purple-950/10 dark:to-indigo-950/10">
      {/* Content starts after the navbar */}
      <div className="pt-20">
        <main className="container mx-auto px-4 py-6">
          {/* Mobile menu button - visible only on mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden mb-4 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </button>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Desktop Side Navigation */}
            <DesktopSideNavigation
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

            {/* Mobile Navigation */}
            <MobileSideNavigation
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              isOpen={isMobileMenuOpen}
              onClose={() => setIsMobileMenuOpen(false)}
            />

            {/* Main content - Hashtags */}
            <div className="flex-1">
              <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Hash className="h-6 w-6 mr-2 text-purple-500 dark:text-purple-400" />
                  Hashtags
                </h1>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                  <p className="text-gray-600 dark:text-gray-300">Trending travel hashtags will be displayed here.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
