'use client';

import { api } from '@/api/roamance-api';
import { USER_ENDPOINTS } from '@/constants/api';
import { User, UserResponse } from '@/types';
import { motion } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { ProfileHeader } from './profile-header';
import { ProfileInfo } from './profile-info';
import { ProfilePreferences } from './profile-preferences';
import { ProfileSavedPlaces } from './profile-saved-places';
import { ProfileTabs } from './profile-tabs';
import { ProfileTrips } from './profile-trips';

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState('info');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<UserResponse>(USER_ENDPOINTS.PROFILE);
      setUser(response.data.data);
    } catch (error) {
      console.error('Failed to fetch user profile', error);
      toast.error('Failed to load profile information');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return <ProfileInfo user={user} loading={loading} />;
      case 'preferences':
        return <ProfilePreferences user={user} loading={loading} />;
      case 'trips':
        return <ProfileTrips user={user} loading={loading} />;
      case 'saved':
        return <ProfileSavedPlaces user={user} loading={loading} />;
      default:
        return <ProfileInfo user={user} loading={loading} />;
    }
  };

  // Variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

  return (
    <motion.div
      className="relative min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Decorative background elements */}
      <div className="fixed top-10 left-5 w-96 h-96 bg-gradient-radial from-ocean/5 to-transparent rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-20 right-10 w-72 h-72 bg-gradient-radial from-sunset/5 to-transparent rounded-full blur-3xl -z-10" />
      <div className="fixed top-1/2 right-1/4 w-48 h-48 bg-gradient-radial from-forest/5 to-transparent rounded-full blur-2xl -z-10" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container max-w-5xl px-4 py-12 mx-auto"
      >
        <motion.div variants={itemVariants}>
          <ProfileHeader user={user} loading={loading} onProfileUpdate={fetchUserProfile} />
        </motion.div>

        <motion.div variants={itemVariants} className="mt-8">
          <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </motion.div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
            duration: 0.4
          }}
          className="mt-8"
        >
          {renderTabContent()}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
