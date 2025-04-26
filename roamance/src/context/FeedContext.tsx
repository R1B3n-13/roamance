'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FeedContextValue {
  postCreated: boolean;
  triggerRefresh: () => void;
}

const FeedContext = createContext<FeedContextValue>({
  postCreated: false,
  triggerRefresh: () => {},
});

interface FeedProviderProps {
  children: ReactNode;
}

export const FeedProvider = ({ children }: FeedProviderProps) => {
  const [postCreated, setPostCreated] = useState(false);

  const triggerRefresh = () => {
    setPostCreated(prev => !prev);
  };

  return (
    <FeedContext.Provider value={{ postCreated, triggerRefresh }}>
      {children}
    </FeedContext.Provider>
  );
};

export const useFeedContext = () => useContext(FeedContext);
