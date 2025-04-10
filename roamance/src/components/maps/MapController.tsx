'use client';

import L from 'leaflet';
import 'leaflet-routing-machine';
import { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';

// Direction types for turn-by-turn navigation
export interface RouteInstructionItem {
  type: string;
  distance: number;
  time: number;
  road: string;
  direction: string;
  index: number;
  mode: string;
  modifier?: string;
  text: string;
  exit?: number;
}

export interface RouteSummary {
  totalDistance: number;
  totalTime: number;
}

export interface RouteCoordinate {
  lat: number;
  lng: number;
}

export interface RouteWaypoint {
  options: {
    allowUTurn: boolean;
  };
  latLng: {
    lng: number;
    lat?: number;
  };
  name: string;
  _initHooksCalled: boolean;
}

export interface RouteData {
  name: string;
  instructions: RouteInstructionItem[];
  summary: RouteSummary;
  coordinates: RouteCoordinate[];
  waypointIndices: number[];
  inputWaypoints: RouteWaypoint[];
  waypoints: RouteWaypoint[];
  properties?: {
    isSimplified: boolean;
  };
  routesIndex: number;
}

interface MapControllerProps {
  center: { lat: number; lng: number };
  destination?: { lat: number; lng: number } | null;
  userLocation: { lat: number; lng: number } | null;
  directions: boolean;
  waypoints: Array<{ lat: number; lng: number }>;
  onMapLoaded?: () => void;
  onRouteCalculated?: (routeData: RouteData) => void;
  locationName?: string;
}

export function MapController({
  center,
  destination,
  userLocation,
  directions,
  waypoints,
  onMapLoaded,
  onRouteCalculated,
}: MapControllerProps) {
  const map = useMap();
  const [hasCalculatedRoute, setHasCalculatedRoute] = useState<boolean>(false);
  const routingControlRef = useRef<L.Routing.Control | null>(null);

  // Initialize the map with an appropriate center point
  useEffect(() => {
    if (destination) {
      map.setView([destination.lat, destination.lng], 13);
    } else if (center.lat !== 0 && center.lng !== 0) {
      map.setView([center.lat, center.lng], 13);
    }

    if (onMapLoaded) {
      onMapLoaded();
    }
  }, [center, destination, map, onMapLoaded]);

  // Reset calculation state when key dependencies change
  useEffect(() => {
    setHasCalculatedRoute(false);
  }, [directions, userLocation, destination, waypoints]);

  // Calculate route using Leaflet Routing Machine
  useEffect(() => {
    // Clean up previous routing control if it exists
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }

    // Only calculate route if we have directions enabled, a destination, and a user location
    if (!hasCalculatedRoute && directions && destination && userLocation) {
      const routeWaypoints: L.Routing.Waypoint[] = [];

      // Start with user location (fixed error: removed reference to userLocation.name)
      routeWaypoints.push(
        L.Routing.waypoint(
          L.latLng(userLocation.lat, userLocation.lng),
          'Starting Point'
        )
      );

      // Add intermediate waypoints if any
      if (waypoints && waypoints.length > 0) {
        waypoints.forEach((wp, index) => {
          routeWaypoints.push(
            L.Routing.waypoint(
              L.latLng(wp.lat, wp.lng),
              `Waypoint ${index + 1}`
            )
          );
        });
      }

      // End with destination
      routeWaypoints.push(
        L.Routing.waypoint(
          L.latLng(destination.lat, destination.lng),
          'Destination'
        )
      );

      // Create and add the routing control to the map
      const routingControl = L.Routing.control({
        waypoints: routeWaypoints,
        routeWhileDragging: false,
        addWaypoints: false,
        fitSelectedRoutes: true,
        showAlternatives: false,
        lineOptions: {
          styles: [{ color: '#3b82f6', weight: 5 }],
          extendToWaypoints: true,
          missingRouteTolerance: 0,
        },
        plan: L.Routing.plan(routeWaypoints, {
          createMarker: function () {
            return false;
          }, // Don't show the default markers
        }),
        formatter: new L.Routing.Formatter({
          language: 'en',
          units: 'metric',
          distanceTemplate: '{value} {unit}',
        }),
      });

      // Hide the default routing container
      routingControl.on('routesfound', function (e) {
        const routes = e.routes;
        if (routes && routes.length > 0) {
          const selectedRoute = routes[0];

          try {
            console.log('Route found:', selectedRoute);

            if (onRouteCalculated) {
              // Pass the raw route data without reconstructing
              onRouteCalculated(selectedRoute as unknown as RouteData);
            }

            // Set the flag to indicate that we've calculated the route
            setHasCalculatedRoute(true);
          } catch (error) {
            console.error('Error processing route data:', error);
            console.error(
              'Error details:',
              error instanceof Error ? error.message : String(error)
            );
          }
        }

        // Hide the routing container
        const container = document.querySelector('.leaflet-routing-container');
        if (container) {
          container.classList.add('hidden');
          container.setAttribute('aria-hidden', 'true');
        }
      });

      // Add the routing control to the map
      routingControl.addTo(map);

      // Save the reference so we can remove it later
      routingControlRef.current = routingControl;
    } else if (!directions || !destination) {
      setHasCalculatedRoute(false);
    }
  }, [
    hasCalculatedRoute,
    directions,
    userLocation,
    destination,
    map,
    waypoints,
    onRouteCalculated,
  ]);
}
