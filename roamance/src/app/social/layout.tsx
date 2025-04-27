'use client';

import { SocialProvider } from '@/context/SocialContext';
import React from 'react';

const SocialLayout = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  return <SocialProvider>{children}</SocialProvider>;
};

export default SocialLayout;
