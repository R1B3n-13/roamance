import { cn } from '@/lib/utils';
import { Bookmark, Compass, Globe, Hash, Home, MessageCircle, Search, Sparkles, User, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { routes } from '@/constants/routes';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
  onClick?: () => void;
}

const NavItem = ({ icon, label, href, isActive = false, onClick }: NavItemProps) => (
  <Link
    href={href}
    onClick={onClick}
    className={cn(
      'flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 whitespace-nowrap group relative overflow-hidden',
      isActive
        ? 'bg-gradient-to-r from-purple-100/80 to-indigo-100/80 dark:from-purple-900/30 dark:to-indigo-900/30 text-purple-700 dark:text-purple-300 font-medium shadow-md shadow-purple-200/20 dark:shadow-purple-900/10'
        : 'hover:bg-gray-100/80 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:scale-[1.02] hover:shadow-sm'
    )}
  >
    <div className={cn(
      "relative z-10 transition-transform duration-200 group-hover:scale-110",
      isActive ? "text-purple-600 dark:text-purple-400" : "text-gray-500 dark:text-gray-400"
    )}>
      {icon}
    </div>
    <span className="relative z-10 font-medium">{label}</span>
    {isActive && (
      <motion.div
        layoutId="nav-indicator"
        className="absolute inset-0 bg-gradient-to-r from-purple-100/80 to-indigo-100/80 dark:from-purple-900/30 dark:to-indigo-900/30 border-l-4 border-purple-500 dark:border-purple-600 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      />
    )}
  </Link>
);

interface SideNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function DesktopSideNavigation({ activeTab, setActiveTab }: SideNavigationProps) {
  return (
    <aside className="hidden md:block w-72 flex-shrink-0 relative">
      <div className="absolute top-8 left-4 w-16 h-16 bg-gradient-to-br from-purple-200/20 to-indigo-300/20 dark:from-purple-800/10 dark:to-indigo-700/10 rounded-full blur-xl z-0"></div>
      <div className="absolute bottom-12 right-4 w-24 h-24 bg-gradient-to-tl from-purple-200/20 to-purple-300/20 dark:from-purple-800/10 dark:to-purple-700/10 rounded-full blur-xl z-0"></div>

      <div className="sticky top-24 p-4 rounded-3xl bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm shadow-xl shadow-purple-200/5 dark:shadow-purple-900/5 border border-gray-100/80 dark:border-gray-800/30 space-y-2 z-10">
        <NavItem
          icon={<Home className="h-5 w-5" />}
          label={routes.home.title}
          href={routes.home.href}
          isActive={activeTab === 'home'}
          onClick={() => setActiveTab('home')}
        />
        <NavItem
          icon={<Compass className="h-5 w-5" />}
          label={routes.explore.title}
          href={routes.explore.href}
          isActive={activeTab === 'explore'}
          onClick={() => setActiveTab('explore')}
        />
        <NavItem
          icon={<Globe className="h-5 w-5" />}
          label={routes.destinations.title}
          href={routes.destinations.href}
          isActive={activeTab === 'destinations'}
          onClick={() => setActiveTab('destinations')}
        />
        <NavItem
          icon={<Hash className="h-5 w-5" />}
          label={routes.hashtags.title}
          href={routes.hashtags.href}
          isActive={activeTab === 'hashtags'}
          onClick={() => setActiveTab('hashtags')}
        />
        <NavItem
          icon={<Sparkles className="h-5 w-5" />}
          label={routes.discover.title}
          href={routes.discover.href}
          isActive={activeTab === 'discover'}
          onClick={() => setActiveTab('discover')}
        />
        <NavItem
          icon={<User className="h-5 w-5" />}
          label={routes.profile.title}
          href={routes.profile.href}
          isActive={activeTab === 'profile'}
          onClick={() => setActiveTab('profile')}
        />
        <NavItem
          icon={<MessageCircle className="h-5 w-5" />}
          label={routes.messages.title}
          href={routes.messages.href}
          isActive={activeTab === 'messages'}
          onClick={() => setActiveTab('messages')}
        />
        <NavItem
          icon={<Bookmark className="h-5 w-5" />}
          label={routes.saved.title}
          href={routes.saved.href}
          isActive={activeTab === 'saved'}
          onClick={() => setActiveTab('saved')}
        />
      </div>
    </aside>
  );
}

interface MobileSideNavigationProps extends SideNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSideNavigation({ activeTab, setActiveTab, isOpen, onClose }: MobileSideNavigationProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-30 md:hidden"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: '-100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0.5 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 h-full w-4/5 max-w-xs bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-40 md:hidden overflow-y-auto rounded-r-3xl shadow-2xl shadow-purple-500/10"
          >
            <div className="p-5 border-b border-gray-100/80 dark:border-gray-800/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative h-9 w-9 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-md shadow-purple-300/30 dark:shadow-purple-900/30 overflow-hidden p-1.5">
                  <Image
                    src="/images/roamance-logo-no-text.png"
                    alt="Roamance"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  RoamSocial
                </h1>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="relative flex items-center bg-gray-100/70 dark:bg-gray-800/50 rounded-xl px-4 py-2.5 border border-gray-200/50 dark:border-gray-700/30 shadow-inner">
                <Search className="h-4 w-4 text-purple-500 dark:text-purple-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent text-sm text-gray-800 dark:text-gray-200 outline-none w-full placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
              </div>

              <div className="pt-2 space-y-2">
                <NavItem
                  icon={<Home className="h-5 w-5" />}
                  label={routes.home.title}
                  href={routes.home.href}
                  isActive={activeTab === 'home'}
                  onClick={() => {
                    setActiveTab('home');
                    onClose();
                  }}
                />
                <NavItem
                  icon={<Compass className="h-5 w-5" />}
                  label={routes.explore.title}
                  href={routes.explore.href}
                  isActive={activeTab === 'explore'}
                  onClick={() => {
                    setActiveTab('explore');
                    onClose();
                  }}
                />
                <NavItem
                  icon={<Globe className="h-5 w-5" />}
                  label={routes.destinations.title}
                  href={routes.destinations.href}
                  isActive={activeTab === 'destinations'}
                  onClick={() => {
                    setActiveTab('destinations');
                    onClose();
                  }}
                />
                <NavItem
                  icon={<Hash className="h-5 w-5" />}
                  label={routes.hashtags.title}
                  href={routes.hashtags.href}
                  isActive={activeTab === 'hashtags'}
                  onClick={() => {
                    setActiveTab('hashtags');
                    onClose();
                  }}
                />
                <NavItem
                  icon={<Sparkles className="h-5 w-5" />}
                  label={routes.discover.title}
                  href={routes.discover.href}
                  isActive={activeTab === 'discover'}
                  onClick={() => {
                    setActiveTab('discover');
                    onClose();
                  }}
                />
                <NavItem
                  icon={<User className="h-5 w-5" />}
                  label={routes.profile.title}
                  href={routes.profile.href}
                  isActive={activeTab === 'profile'}
                  onClick={() => {
                    setActiveTab('profile');
                    onClose();
                  }}
                />
                <NavItem
                  icon={<MessageCircle className="h-5 w-5" />}
                  label={routes.messages.title}
                  href={routes.messages.href}
                  isActive={activeTab === 'messages'}
                  onClick={() => {
                    setActiveTab('messages');
                    onClose();
                  }}
                />
                <NavItem
                  icon={<Bookmark className="h-5 w-5" />}
                  label={routes.saved.title}
                  href={routes.saved.href}
                  isActive={activeTab === 'saved'}
                  onClick={() => {
                    setActiveTab('saved');
                    onClose();
                  }}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Export both components for convenience
export { NavItem };
