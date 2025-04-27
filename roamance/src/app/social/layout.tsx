'use client';

import { Navbar } from '@/components/navigation';
import { SocialProvider } from '@/context/SocialContext';
import React, { useState } from 'react';
import { DesktopSideNavigation, MobileSideNavigation } from '@/components/social/SideNavigation';
import { Menu } from 'lucide-react';

const SocialLayout = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  const [activeTab, setActiveTab] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <SocialProvider>
      <div className="min-h-screen bg-gradient-to-tr from-gray-50 via-purple-50/30 to-indigo-50/40 dark:from-gray-900 dark:via-purple-950/10 dark:to-indigo-950/10">
        {/* Using the Navbar component with title */}
        <Navbar title="RoamSocial" />

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

              {/* Main content */}
              {children}
            </div>
          </main>
        </div>
      </div>
    </SocialProvider>
  );
};

export default SocialLayout;
