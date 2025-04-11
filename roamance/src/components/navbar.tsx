'use client';

import { ThemeToggle } from '@/components/common/theme-toggle';
import { Button } from '@/components/ui/button';
import { routes } from '@/constants/routes';
import { cn } from '@/lib/utils';
import {
  Globe,
  MapPin,
  Menu,
  PlaneTakeoff,
  Umbrella,
  User,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isAuthRoute = pathname?.startsWith('/auth');

  React.useEffect(() => {
    const checkAuth = () => {
      const cookies = document.cookie.split(';');
      const tokenCookie = cookies.find((cookie) =>
        cookie.trim().startsWith('access_token=')
      );
      setIsAuthenticated(!!tokenCookie);
    };

    checkAuth();

    const intervalId = setInterval(checkAuth, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleProfileClick = () => {
    if (isAuthenticated) {
      router.push(routes.profile.href);
    } else {
      router.push(routes.signIn.href);
    }
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="fixed top-0 z-50 w-full shadow-[0_1px_3px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
      <div className="absolute inset-0 bg-background/80 dark:bg-background/70" />

      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-primary/10 to-purple-500/10 dark:from-blue-500/15 dark:via-primary/15 dark:to-purple-500/15" />
      <div className="absolute inset-0 backdrop-blur-lg" />

      <div className="absolute inset-0 opacity-20 mix-blend-soft-light bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMjAwdjIwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />

      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-b from-transparent to-black/3 dark:to-black/5"></div>

      <nav className="relative h-16">
        <div className="container mx-auto flex items-center justify-between h-full px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Link
              href={routes.home.href}
              className="flex items-center gap-2 cursor-pointer transition-opacity duration-200 hover:opacity-80"
            >
              <Image
                src="/images/roamance-logo-no-text.png"
                alt="Logo"
                width={40}
                height={40}
                className="rounded-md"
              />
            </Link>
          </div>

          <div className="hidden md:flex items-center justify-center space-x-4">
            <Link
              href={routes.map.href}
              className="text-sm font-medium transition-all duration-200 hover:text-blue-500 flex items-center gap-2 cursor-pointer relative group px-3 py-1.5"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-900/10 dark:to-cyan-900/10 opacity-0 group-hover:opacity-100 rounded-xl transition-all duration-300" />
              <div className="absolute inset-x-0 h-0.5 bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 -bottom-1 rounded-full" />
              <MapPin className="h-4 w-4 text-blue-400 group-hover:text-blue-500 transition-colors duration-200" />
              <span className="relative z-10">Explore Map</span>
            </Link>
            <Link
              href={routes.destinations.href}
              className="text-sm font-medium transition-all duration-200 hover:text-purple-500 flex items-center gap-2 cursor-pointer relative group px-3 py-1.5"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-fuchsia-50/50 dark:from-purple-900/10 dark:to-fuchsia-900/10 opacity-0 group-hover:opacity-100 rounded-xl transition-all duration-300" />
              <div className="absolute inset-x-0 h-0.5 bg-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 -bottom-1 rounded-full" />
              <Globe className="h-4 w-4 text-purple-400 group-hover:text-purple-500 transition-colors duration-200" />
              <span className="relative z-10">Destinations</span>
            </Link>
            <Link
              href={routes.activities.href}
              className="text-sm font-medium transition-all duration-200 hover:text-emerald-500 flex items-center gap-2 cursor-pointer relative group px-3 py-1.5"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/10 dark:to-teal-900/10 opacity-0 group-hover:opacity-100 rounded-xl transition-all duration-300" />
              <div className="absolute inset-x-0 h-0.5 bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 -bottom-1 rounded-full" />
              <Umbrella className="h-4 w-4 text-emerald-400 group-hover:text-emerald-500 transition-colors duration-200" />
              <span className="relative z-10">Activities</span>
            </Link>
            <Link
              href={routes.plans.href}
              className="text-sm font-medium transition-all duration-200 hover:text-amber-500 flex items-center gap-2 cursor-pointer relative group px-3 py-1.5"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-900/10 dark:to-orange-900/10 opacity-0 group-hover:opacity-100 rounded-xl transition-all duration-300" />
              <div className="absolute inset-x-0 h-0.5 bg-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 -bottom-1 rounded-full" />
              <PlaneTakeoff className="h-4 w-4 text-amber-400 group-hover:text-amber-500 transition-colors duration-200" />
              <span className="relative z-10">Travel Plans</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex">
              <ThemeToggle className="hover:bg-muted/80" />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex rounded-full cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={handleProfileClick}
              title={isAuthenticated ? 'Your Profile' : 'Sign In'}
            >
              <User
                className={cn(
                  'h-[18px] w-[18px]',
                  isAuthenticated ? 'text-primary' : 'text-muted-foreground'
                )}
              />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden cursor-pointer rounded-full hover:bg-muted/80 transition-colors"
              onClick={toggleMenu}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </nav>

      <div
        className={cn(
          'md:hidden fixed inset-x-0 top-16 transition-all duration-300 ease-in-out',
          isMenuOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-full pointer-events-none'
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background/70 backdrop-blur-xl" />
        <div className="absolute inset-0 opacity-30 mix-blend-soft-light bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMjAwdjIwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />

        <div className="relative container px-4 py-4 flex flex-col gap-4">
          <Link
            href={routes.map.href}
            className="flex items-center gap-3 p-3 hover:bg-muted/60 rounded-lg cursor-pointer transition-colors duration-200"
            onClick={toggleMenu}
          >
            <div className="bg-primary/10 p-2 rounded-md">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <span className="font-medium">Explore Map</span>
          </Link>
          <Link
            href={routes.destinations.href}
            className="flex items-center gap-3 p-3 hover:bg-muted/60 rounded-lg cursor-pointer transition-colors duration-200"
            onClick={toggleMenu}
          >
            <div className="bg-primary/10 p-2 rounded-md">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <span className="font-medium">Destinations</span>
          </Link>
          <Link
            href={routes.activities.href}
            className="flex items-center gap-3 p-3 hover:bg-muted/60 rounded-lg cursor-pointer transition-colors duration-200"
            onClick={toggleMenu}
          >
            <div className="bg-primary/10 p-2 rounded-md">
              <Umbrella className="h-5 w-5 text-primary" />
            </div>
            <span className="font-medium">Activities</span>
          </Link>
          <Link
            href={routes.plans.href}
            className="flex items-center gap-3 p-3 hover:bg-muted/60 rounded-lg cursor-pointer transition-colors duration-200"
            onClick={toggleMenu}
          >
            <div className="bg-primary/10 p-2 rounded-md">
              <PlaneTakeoff className="h-5 w-5 text-primary" />
            </div>
            <span className="font-medium">Travel Plans</span>
          </Link>
          <div className="flex flex-col gap-3 pt-3 border-t mt-1">
            {!isAuthRoute && (
              <Button
                variant="outline"
                className="w-full justify-start cursor-pointer rounded-lg py-5 transition-colors"
                onClick={handleProfileClick}
              >
                <User
                  className={cn(
                    'h-5 w-5 mr-3',
                    isAuthenticated ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
                <span className="font-medium">
                  {isAuthenticated ? 'Your Profile' : 'Sign In'}
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
