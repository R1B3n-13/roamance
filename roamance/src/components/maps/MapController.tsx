'use client';
import 'leaflet/dist/leaflet.css'; // newly added
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

import L from 'leaflet';
import 'leaflet-routing-machine';
import { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import { MapControllerProps, RouteData } from '@/types/map';

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

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `.leaflet-routing-container { z-index: 9999 !important; }`;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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

  // Calculate route using Leaflet Routing Machine
  useEffect(() => {
    // If route already calculated, do not re-run effect (prevents removing the routing control)
    if (hasCalculatedRoute) return;

    // Only calculate route if we have directions enabled, a destination, and a user location
    if (directions && destination && userLocation) {
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

        // Removed container hiding to keep the route path visible:
        // const container = document.querySelector('.leaflet-routing-container');
        // if (container) {
        //   container.classList.add('hidden');
        //   container.setAttribute('aria-hidden', 'true');
        // }
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
