'use client';

import { User } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { userService } from '@/service/user-service';

interface SocialContextValue {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  postCreated: boolean;
  triggerRefresh: () => void;
  isLoading: boolean;
}

const SocialContext = createContext<SocialContextValue>({
  user: {} as User,
  setUser: () => {},
  postCreated: false,
  triggerRefresh: () => {},
  isLoading: false,
});

interface SocialProviderProps {
  children: ReactNode;
}

export const SocialProvider = ({ children }: SocialProviderProps) => {
  const [user, setUser] = useState<User>({} as User);
  const [postCreated, setPostCreated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const triggerRefresh = () => {
    setPostCreated((prev) => !prev);
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const userData = await userService.getUserProfile();
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <SocialContext.Provider value={{ user, setUser, postCreated, triggerRefresh, isLoading }}>
      {children}
    </SocialContext.Provider>
  );
};

export const useSocialContext = () => useContext(SocialContext);
