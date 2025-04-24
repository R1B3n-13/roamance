'use client';

import { cn } from '@/lib/utils';
import { Location } from '@/types';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import React from 'react';
import { createIcons } from './markers/UserLocationMarker';

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);

export interface LocationMapProps {
  /**
   * Single location to display (for sightseeing or single points)
   */
  location?: Location;

  /**
   * Array of waypoints (for routes)
   */
  waypoints?: Location[];

  /**
   * Type of map to display
   * - 'single': Display a single location marker
   * - 'route': Display multiple waypoints connected by a line
   * - 'auto': Automatically determine based on inputs (default)
   */
  type?: 'single' | 'route' | 'auto';

  /**
   * Height of the map container
   * @default '250px'
   */
  height?: string | number;

  /**
   * Additional class names for the container
   */
  className?: string;

  /**
   * Whether to show zoom controls
   * @default true
   */
  zoomControl?: boolean;

  /**
   * Whether to show attribution control
   * @default true
   */
  attributionControl?: boolean;

  /**
   * Whether the map can be dragged
   * @default true
   */
  dragging?: boolean;

  /**
   * Whether the map can be zoomed by mouse wheel
   * @default true
   */
  scrollWheelZoom?: boolean;

  /**
   * Initial zoom level
   * @default 13 for single, 11 for routes
   */
  zoom?: number;
}

/**
 * A reusable component for displaying locations on a map
 */
export function LocationMap({
  location,
  waypoints = [],
  type = 'auto',
  height = '250px',
  className,
  zoomControl = true,
  attributionControl = true,
  dragging = true,
  scrollWheelZoom = true,
  zoom,
}: LocationMapProps) {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';

  // Determine map type if set to auto
  if (type === 'auto') {
    if (waypoints && waypoints.length >= 2) {
      type = 'route';
    } else {
      type = 'single';
    }
  }

  // If no valid data is provided, return null
  if (!location && (!waypoints || waypoints.length === 0)) {
    return null;
  }

  // For route type, we need at least 2 waypoints to draw a line
  if (type === 'route' && (!waypoints || waypoints.length < 2)) {
    if (!location) return null;
    type = 'single';
  }

  // Center on either the location or the first waypoint
  const center = location || waypoints[0];

  // Default zoom levels based on map type
  const defaultZoom = type === 'single' ? 13 : 11;
  const zoomLevel = zoom || defaultZoom;

  // Convert waypoints to the format needed by Polyline
  const polylinePositions = waypoints.map((wp) => [wp.latitude, wp.longitude]);

  return (
    <div
      className={cn(
        'w-full rounded-lg overflow-hidden border border-muted/30',
        className
      )}
      style={{ height }}
    >
      {typeof window !== 'undefined' && (
        <>
          <link
            rel="stylesheet"
            href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          />
          <MapContainer
            center={[center.latitude, center.longitude]}
            zoom={zoomLevel}
            style={{ height: '100%', width: '100%' }}
            zoomControl={zoomControl}
            attributionControl={attributionControl}
            dragging={dragging}
            scrollWheelZoom={scrollWheelZoom}
            className={cn({ 'dark-map': isDarkMode })}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url={
                isDarkMode
                  ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                  : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              }
            />

            {/* Show marker for single location type */}
            {(type === 'single' || !waypoints || waypoints.length === 0) &&
              location && (
                <Marker
                  position={[location.latitude, location.longitude]}
                  icon={createIcons().placeLocationIcon}
                />
              )}

            {/* Show markers and polyline for route */}
            {type === 'route' && waypoints && waypoints.length >= 2 && (
              <>
                {/* Show marker for each waypoint */}
                {waypoints.map((wp, i) => {
                  const icons = createIcons();
                  return (
                    <Marker
                      key={i}
                      position={[wp.latitude, wp.longitude]}
                      icon={
                        i === 0
                          ? icons.userLocationIcon
                          : icons.placeLocationIcon
                      }
                    />
                  );
                })}

                {/* Connect the waypoints with a line */}
                <Polyline
                  positions={polylinePositions as any}
                  color={isDarkMode ? '#6366f1' : '#4f46e5'}
                  weight={4}
                  opacity={0.8}
                />
              </>
            )}
          </MapContainer>
        </>
      )}
    </div>
  );
}
