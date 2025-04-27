'use client';

import { Navbar } from '@/components/navigation';
import { SocialFeed } from '@/components/social/feed/social-feed';
import { PostCreator } from '@/components/social/post/post-creator';
import { TrendingSection } from '@/components/social/trending-section';
import { cn } from '@/lib/utils';
import { User } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bookmark,
  Compass,
  Globe,
  Hash,
  Home,
  MessageCircle,
  Search,
  Sparkles,
  User as UserIcon,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

const mockTrendingItems = [
  { id: '1', title: 'Paris', count: 1245, type: 'location' as const },
  { id: '2', title: 'Adventure Travel', count: 890, type: 'topic' as const },
  { id: '3', title: '#backpacking', count: 756, type: 'hashtag' as const },
  { id: '4', title: 'Santorini', count: 612, type: 'location' as const },
  { id: '5', title: 'Budget Travel', count: 543, type: 'topic' as const },
];

const mockTrendingUsers: User[] = [
  {
    id: 'user1',
    name: 'Maya Expedition',
    email: 'maya@mail.com',
    profile_image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    audit: {
      created_at: new Date().toISOString(),
      last_modified_at: new Date().toISOString(),
    },
  },
  {
    id: 'user2',
    name: 'Ravi Explorer',
    email: '',
    profile_image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    audit: {
      created_at: new Date().toISOString(),
      last_modified_at: new Date().toISOString(),
    },
  },
  {
    id: 'user3',
    name: 'Emma Nomad',
    email: '',
    profile_image:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    audit: {
      created_at: new Date().toISOString(),
      last_modified_at: new Date().toISOString(),
    },
  },
  {
    id: 'user4',
    name: 'Leo Wanderer',
    email: '',
    profile_image:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
    audit: {
      created_at: new Date().toISOString(),
      last_modified_at: new Date().toISOString(),
    },
  },
  {
    id: 'user5',
    name: 'Sofia Journey',
    email: '',
    profile_image:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    audit: {
      created_at: new Date().toISOString(),
      last_modified_at: new Date().toISOString(),
    },
  },
  {
    id: 'user6',
    name: 'Kai Adventure',
    email: '',
    profile_image:
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6',
    audit: {
      created_at: new Date().toISOString(),
      last_modified_at: new Date().toISOString(),
    },
  },
];

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

const NavItem = ({ icon, label, isActive = false, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      'flex items-center gap-3 p-3 rounded-xl transition-all whitespace-nowrap',
      isActive
        ? 'bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 text-purple-700 dark:text-purple-400 font-medium border border-purple-100 dark:border-purple-800/30 shadow-sm'
        : 'hover:bg-gray-100 dark:hover:bg-gray-800/70 text-gray-700 dark:text-gray-300'
    )}
  >
    <div>{icon}</div>
    <span>{label}</span>
  </button>
);

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-gray-50 via-purple-50/30 to-indigo-50/40 dark:from-gray-900 dark:via-purple-950/10 dark:to-indigo-950/10">
      {/* Using the Navbar component with title */}
      <Navbar title="RoamSocial" />

      {/* Content starts after the navbar */}
      <div className="pt-20">
        <main className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Side navigation (hidden on mobile) */}
            <aside className="hidden md:block w-60 flex-shrink-0">
              <div className="sticky top-24 space-y-1">
                <NavItem
                  icon={<Home className="h-5 w-5" />}
                  label="Home"
                  isActive={activeTab === 'home'}
                  onClick={() => setActiveTab('home')}
                />
                <NavItem
                  icon={<Compass className="h-5 w-5" />}
                  label="Explore"
                  isActive={activeTab === 'explore'}
                  onClick={() => setActiveTab('explore')}
                />
                <NavItem
                  icon={<Globe className="h-5 w-5" />}
                  label="Destinations"
                  isActive={activeTab === 'destinations'}
                  onClick={() => setActiveTab('destinations')}
                />
                <NavItem
                  icon={<Hash className="h-5 w-5" />}
                  label="Hashtags"
                  isActive={activeTab === 'hashtags'}
                  onClick={() => setActiveTab('hashtags')}
                />
                <NavItem
                  icon={<Sparkles className="h-5 w-5" />}
                  label="Discover"
                  isActive={activeTab === 'discover'}
                  onClick={() => setActiveTab('discover')}
                />
                <NavItem
                  icon={<UserIcon className="h-5 w-5" />}
                  label="Profile"
                  isActive={activeTab === 'profile'}
                  onClick={() => setActiveTab('profile')}
                />
                <NavItem
                  icon={<MessageCircle className="h-5 w-5" />}
                  label="Messages"
                  isActive={activeTab === 'messages'}
                  onClick={() => setActiveTab('messages')}
                />
                <NavItem
                  icon={<Bookmark className="h-5 w-5" />}
                  label="Saved"
                  isActive={activeTab === 'saved'}
                  onClick={() => setActiveTab('saved')}
                />
              </div>
            </aside>

            {/* Mobile menu (slide-in from left) */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                  />

                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="fixed left-0 top-0 h-full w-3/4 max-w-xs bg-white dark:bg-gray-900 z-40 md:hidden overflow-y-auto"
                  >
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="relative h-8 w-8">
                          <Image
                            src="/images/roamance-logo-no-text.png"
                            alt="Roamance"
                            layout="fill"
                            objectFit="contain"
                          />
                        </div>
                        <h1 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                          RoamSocial
                        </h1>
                      </div>

                      <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                      </button>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="relative flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2">
                        <Search className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                        <input
                          type="text"
                          placeholder="Search..."
                          className="bg-transparent text-sm text-gray-800 dark:text-gray-200 outline-none w-full"
                        />
                      </div>

                      <div className="pt-2 space-y-1">
                        <NavItem
                          icon={<Home className="h-5 w-5" />}
                          label="Home"
                          isActive={activeTab === 'home'}
                          onClick={() => {
                            setActiveTab('home');
                            setIsMobileMenuOpen(false);
                          }}
                        />
                        <NavItem
                          icon={<Compass className="h-5 w-5" />}
                          label="Explore"
                          isActive={activeTab === 'explore'}
                          onClick={() => {
                            setActiveTab('explore');
                            setIsMobileMenuOpen(false);
                          }}
                        />
                        <NavItem
                          icon={<Globe className="h-5 w-5" />}
                          label="Destinations"
                          isActive={activeTab === 'destinations'}
                          onClick={() => {
                            setActiveTab('destinations');
                            setIsMobileMenuOpen(false);
                          }}
                        />
                        <NavItem
                          icon={<Hash className="h-5 w-5" />}
                          label="Hashtags"
                          isActive={activeTab === 'hashtags'}
                          onClick={() => {
                            setActiveTab('hashtags');
                            setIsMobileMenuOpen(false);
                          }}
                        />
                        <NavItem
                          icon={<Sparkles className="h-5 w-5" />}
                          label="Discover"
                          isActive={activeTab === 'discover'}
                          onClick={() => {
                            setActiveTab('discover');
                            setIsMobileMenuOpen(false);
                          }}
                        />
                        <NavItem
                          icon={<UserIcon className="h-5 w-5" />}
                          label="Profile"
                          isActive={activeTab === 'profile'}
                          onClick={() => {
                            setActiveTab('profile');
                            setIsMobileMenuOpen(false);
                          }}
                        />
                        <NavItem
                          icon={<MessageCircle className="h-5 w-5" />}
                          label="Messages"
                          isActive={activeTab === 'messages'}
                          onClick={() => {
                            setActiveTab('messages');
                            setIsMobileMenuOpen(false);
                          }}
                        />
                        <NavItem
                          icon={<Bookmark className="h-5 w-5" />}
                          label="Saved"
                          isActive={activeTab === 'saved'}
                          onClick={() => {
                            setActiveTab('saved');
                            setIsMobileMenuOpen(false);
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Main content - Feed */}
            <div className="flex-1">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Sparkles className="h-6 w-6 mr-2 text-purple-500 dark:text-purple-400" />
                  Travel Feed
                </h2>

                {/* Post creation */}
                <div className="mb-8">
                  <PostCreator />
                </div>

                {/* Posts feed */}
                <SocialFeed />
              </div>
            </div>

            {/* Right sidebar - Trending */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                <TrendingSection
                  trendingItems={mockTrendingItems}
                  trendingUsers={mockTrendingUsers}
                />

                <div className="bg-white dark:bg-gray-800/90 backdrop-blur-md rounded-2xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-700/50 p-4">
                  <h3 className="font-semibold text-base text-gray-900 dark:text-white mb-4">
                    Discover Your Next Adventure
                  </h3>
                  <div className="relative h-40 w-full rounded-xl overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1503220317375-aaad61436b1b?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTF8fHRyYXZlbHxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"
                      alt="Travel destination"
                      layout="fill"
                      objectFit="cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                      <div className="text-white">
                        <h4 className="font-medium text-sm">Bali, Indonesia</h4>
                        <p className="text-xs text-white/80">
                          Explore paradise islands
                        </p>
                      </div>
                    </div>
                  </div>
                  <button className="w-full mt-3 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium text-sm hover:shadow-md transition-shadow">
                    Plan Your Trip
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
