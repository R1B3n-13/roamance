'use client';

import L from 'leaflet';
import 'leaflet-routing-machine';
import { useEffect, useRef, useState } from 'react';
import { Polyline, useMap } from 'react-leaflet';

// Direction types for turn-by-turn navigation
export interface RouteStep {
  instruction: string;
  distance: number; // in meters
  duration: number; // in seconds
  maneuver: string; // e.g., "turn-right", "turn-left", "straight", etc.
  startLocation: [number, number]; // lat,lng
  endLocation: [number, number]; // lat,lng
}

export interface RouteLeg {
  distance: number;
  duration: number;
  startLocation: [number, number];
  endLocation: [number, number];
  steps: RouteStep[];
}

export interface RouteData {
  distance: number;
  duration: number;
  legs: RouteLeg[];
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
  const [route, setRoute] = useState<[number, number][]>([]);
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
            return null;
          }, // Don't show the default markers
          waypointIcon: function () {
            return null;
          }, // Don't show the default waypoint icons
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
            // Debug the route structure to understand available properties
            console.log('Route found:', selectedRoute);
            if (selectedRoute.legs && selectedRoute.legs.length > 0) {
              console.log('First leg:', selectedRoute.legs[0]);
              if (selectedRoute.legs[0].steps && selectedRoute.legs[0].steps.length > 0) {
                console.log('First step:', selectedRoute.legs[0].steps[0]);
              }
            }

            // Convert route data to our RouteData format
            const routeData: RouteData = {
              distance: selectedRoute.summary.totalDistance,
              duration: selectedRoute.summary.totalTime,
              legs: (selectedRoute.legs ?? []).map((leg) => {
                // Debug each leg
                console.log('Processing leg:', leg);

                return {
                  distance: leg.distance,
                  duration: leg.time,
                  startLocation:
                    leg.coordinates && leg.coordinates.length > 0
                      ? [leg.coordinates[0].lat, leg.coordinates[0].lng]
                      : [0, 0],
                  endLocation:
                    leg.coordinates && leg.coordinates.length > 0
                      ? [
                          leg.coordinates[leg.coordinates.length - 1].lat,
                          leg.coordinates[leg.coordinates.length - 1].lng,
                        ]
                      : [0, 0],
                  steps: (leg.steps ?? []).map((step) => {
                    // Debug each step
                    console.log('Processing step:', step);

                    // Check multiple possible property names for each field
                    const instruction = step.instructions || step.instruction || step.text || '';
                    const distance = typeof step.distance === 'number' ? step.distance : 0;
                    const duration = step.time || step.duration || 0;
                    const maneuverType = step.type || step.maneuverType || step.maneuver || '';

                    // Get coordinates from the appropriate property
                    const coords = step.coordinates || step.latLngs || [];

                    return {
                      instruction,
                      distance,
                      duration,
                      maneuver: getManeuverType(maneuverType),
                      startLocation:
                        coords.length > 0
                          ? [coords[0].lat, coords[0].lng]
                          : [0, 0],
                      endLocation:
                        coords.length > 0
                          ? [
                              coords[coords.length - 1].lat,
                              coords[coords.length - 1].lng,
                            ]
                          : [0, 0],
                    };
                  }),
                };
              }),
            };

            // Log the constructed route data for debugging
            console.log('Constructed route data:', routeData);

            // Update the route state
            const routePoints: [number, number][] = selectedRoute.coordinates
              ? selectedRoute.coordinates.map((coord: L.LatLng) => [coord.lat, coord.lng])
              : [];
            setRoute(routePoints);

            // Call the onRouteCalculated callback with the route data
            if (onRouteCalculated) {
              onRouteCalculated(routeData);
            }

            // Set the flag to indicate that we've calculated the route
            setHasCalculatedRoute(true);
          } catch (error) {
            console.error('Error processing route data:', error);
            console.error('Error details:', error instanceof Error ? error.message : String(error));
            console.error('Route data that caused the error:', selectedRoute);
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
      // Clear route when directions are disabled or no destination is set
      setRoute([]);
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

  // Helper function to map routing machine maneuver types to our format
  const getManeuverType = (type: string): string => {
    switch (type) {
      case 'SharpRight':
      case 'Right':
      case 'SlightRight':
        return 'turn-right';
      case 'SharpLeft':
      case 'Left':
      case 'SlightLeft':
        return 'turn-left';
      case 'Straight':
        return 'straight';
      case 'Roundabout':
        return 'roundabout';
      case 'TurnAround':
      case 'UTurn':
        return 'u-turn';
      case 'Depart':
      case 'StartAt':
      case 'WaypointStart':
        return 'start';
      case 'Arrive':
      case 'DestinationReached':
      case 'WaypointReached':
        return 'arrive';
      default:
        return 'turn';
    }
  };

  return (
    <>
      {route.length > 0 && (
        <Polyline positions={route} color="#3b82f6" weight={5} opacity={0.8} />
      )}
    </>
  );
}
