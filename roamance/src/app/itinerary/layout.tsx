'use client';

import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/footer';
import React from 'react';

export default function ItineraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar title="RoamPlanner" />
      <main className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-8 md:px-6">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
