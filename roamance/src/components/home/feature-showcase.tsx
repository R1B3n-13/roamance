"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  Compass,
  Plane,
  Users,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { routes } from "@/constants/routes";

export function FeatureShowcase() {
  const features = [
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Explore Destinations",
      description:
        "Discover breathtaking locations around the world with detailed guides and insider tips.",
      colorClass: "bg-primary/20",
      textColorClass: "text-primary",
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Plan Your Journey",
      description:
        "Create detailed travel itineraries with our AI-powered planning tools.",
      colorClass: "bg-sunset/20",
      textColorClass: "text-sunset",
    },
    {
      icon: <Compass className="h-6 w-6" />,
      title: "Find Adventures",
      description:
        "Discover unique experiences and activities tailored to your interests.",
      colorClass: "bg-forest/20",
      textColorClass: "text-forest",
    },
    {
      icon: <Plane className="h-6 w-6" />,
      title: "Track Flights",
      description:
        "Find the best deals on flights and keep track of your travel arrangements.",
      colorClass: "bg-sunset/20",
      textColorClass: "text-sunset",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Connect with Travelers",
      description:
        "Join a global community of like-minded adventurers and share experiences.",
      colorClass: "bg-forest/20",
      textColorClass: "text-forest",
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "AI Recommendations",
      description:
        "Get personalized suggestions based on your preferences and past travels.",
      colorClass: "bg-ocean/20",
      textColorClass: "text-ocean",
    },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Reimagine How You <span className="text-primary">Travel</span>
          </motion.h2>
          <motion.p
            className="text-muted-foreground max-w-2xl mx-auto text-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Roamance combines cutting-edge technology with a passion for
            exploration, making every journey more meaningful and memorable.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-background rounded-xl p-6 border hover:shadow-lg transition-all"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ y: -5 }}
            >
              <div
                className={cn(
                  "p-3 rounded-full w-fit mb-4",
                  feature.colorClass
                )}
              >
                <div className={feature.textColorClass}>{feature.icon}</div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-travel p-8 md:p-12 rounded-2xl dark:text-white">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-2/3 mb-8 md:mb-0">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to start your adventure?
              </h3>
              <p className="dark:text-white/80 max-w-xl">
                Join thousands of travelers discovering the world with Roamance.
                Create an account today and begin your journey.
              </p>
            </div>
            <Link
              className="md:w-1/3 flex justify-center md:justify-end"
              href={routes.signIn.href}
            >
              <motion.button
                className="dark:bg-white bg-primary text-white dark:text-primary font-medium px-8 py-3 rounded-full transition-all cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign Up Now
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
