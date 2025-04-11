'use client';

import { api } from '@/api/roamance-api';
import { USER_ENDPOINTS } from '@/constants/api';
import { User, UserResponse } from '@/types';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
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

  useEffect(() => {
    async function fetchUserProfile() {
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
    }

    fetchUserProfile();
  }, []);

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container max-w-5xl px-4 py-12 mx-auto"
    >
      <ProfileHeader user={user} loading={loading} />
      <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-8"
      >
        {renderTabContent()}
      </motion.div>
    </motion.div>
  );
}
