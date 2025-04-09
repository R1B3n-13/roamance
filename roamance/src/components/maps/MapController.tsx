'use client';

import { useCallback, useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import { Polyline } from 'react-leaflet';
import L from 'leaflet';

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
  userLocation: { lat: number; lng: number } | null;
  directions: boolean;
  waypoints: Array<{ lat: number; lng: number }>;
  onMapLoaded?: () => void;
  onRouteCalculated?: (routeData: RouteData) => void;
}

export function MapController({
  center,
  userLocation,
  directions,
  waypoints,
  onMapLoaded,
  onRouteCalculated,
}: MapControllerProps) {
  const map = useMap();
  const [route, setRoute] = useState<[number, number][]>([]);
  const [hasCalculatedRoute, setHasCalculatedRoute] = useState<boolean>(false);

  useEffect(() => {
    if (center.lat !== 0 && center.lng !== 0) {
      map.setView([center.lat, center.lng], 13);
    }
    if (onMapLoaded) {
      onMapLoaded();
    }
  }, [center, map, onMapLoaded]);

  // Reset calculation state when key dependencies change
  useEffect(() => {
    setHasCalculatedRoute(false);
  }, [directions, userLocation, center, waypoints]);

  // Generate a simulated direction based on angle between points
  const generateDirection = (from: [number, number], to: [number, number]): string => {
    // Calculate bearing between points
    const startLat = from[0] * Math.PI / 180;
    const startLng = from[1] * Math.PI / 180;
    const endLat = to[0] * Math.PI / 180;
    const endLng = to[1] * Math.PI / 180;

    const y = Math.sin(endLng - startLng) * Math.cos(endLat);
    const x = Math.cos(startLat) * Math.sin(endLat) -
              Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);
    const bearing = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;

    // Convert bearing to direction
    if (bearing >= 337.5 || bearing < 22.5) return "north";
    if (bearing >= 22.5 && bearing < 67.5) return "northeast";
    if (bearing >= 67.5 && bearing < 112.5) return "east";
    if (bearing >= 112.5 && bearing < 157.5) return "southeast";
    if (bearing >= 157.5 && bearing < 202.5) return "south";
    if (bearing >= 202.5 && bearing < 247.5) return "southwest";
    if (bearing >= 247.5 && bearing < 292.5) return "west";
    return "northwest";
  };

  // Calculate distance between two points in meters
  const calculateDistance = (from: [number, number], to: [number, number]): number => {
    return L.latLng(from[0], from[1]).distanceTo(L.latLng(to[0], to[1]));
  };

  // Generate an instruction based on current and next points
  const generateInstruction = (
    index: number,
    current: [number, number],
    next: [number, number],
    isFirst: boolean,
    isLast: boolean,
    pointName?: string
  ): string => {
    if (isFirst) return `Start from your current location, heading ${generateDirection(current, next)}`;
    if (isLast) return `Arrive at your destination${pointName ? `: ${pointName}` : ''}`;

    const direction = generateDirection(current, next);
    if (index === 1) return `Head ${direction} on the road`;

    // For waypoints
    if (pointName) return `Continue through ${pointName}, then head ${direction}`;

    // Random street names for more realistic navigation
    const streets = ["Main St", "Oak Ave", "Park Rd", "River Way", "Mountain Dr", "Lake Blvd", "Forest Path", "Beach Rd"];
    const randomStreet = streets[Math.floor(Math.random() * streets.length)];

    // Generate various instructions
    const options = [
      `Turn ${direction} onto ${randomStreet}`,
      `Continue ${direction} for ${Math.floor(calculateDistance(current, next)/100)/10} km`,
      `Slight turn towards the ${direction}`,
      `Take the ${direction} route at the intersection`
    ];

    return options[Math.floor(Math.random() * options.length)];
  };

  // Estimate duration based on distance (simplified)
  const calculateDuration = (distance: number): number => {
    // Assume average speed of 40 km/h = 11.11 m/s
    const averageSpeedMPS = 11.11;
    return Math.round(distance / averageSpeedMPS);
  };

  // Generate a route with simulated turn-by-turn directions
  const generateRouteData = useCallback((points: [number, number][], locationName: string): RouteData => {
    // Start building the route data
    const routeData: RouteData = {
      distance: 0,
      duration: 0,
      legs: []
    };

    // If we have only start and end, create a single leg
    if (points.length >= 2) {
      // Create legs between each waypoint
      for (let i = 0; i < points.length - 1; i++) {
        const startPoint = points[i];
        const endPoint = points[i+1];
        const legSteps: RouteStep[] = [];
        const isFirstLeg = i === 0;
        const isLastLeg = i === points.length - 2;

        // Calculate intermediate points for this leg (simulate turns)
        // For simplicity, we'll create 2-4 steps per leg
        const numSteps = Math.max(2, Math.min(4, Math.floor(Math.random() * 4) + 2));
        const stepPoints: [number, number][] = [startPoint];

        // Generate intermediate points between start and end
        for (let j = 1; j < numSteps; j++) {
          const fraction = j / numSteps;
          // Add some randomness to make it look like real streets
          const jitter = 0.0005 * (Math.random() - 0.5);
          const lat = startPoint[0] + (endPoint[0] - startPoint[0]) * fraction + jitter;
          const lng = startPoint[1] + (endPoint[1] - startPoint[1]) * fraction + jitter;
          stepPoints.push([lat, lng]);
        }
        stepPoints.push(endPoint);

        // Generate steps for this leg
        let legDistance = 0;
        let legDuration = 0;

        for (let j = 0; j < stepPoints.length - 1; j++) {
          const from = stepPoints[j];
          const to = stepPoints[j+1];
          const distance = calculateDistance(from, to);
          const duration = calculateDuration(distance);

          const isFirstStep = j === 0;
          const isLastStep = j === stepPoints.length - 2;

          // Determine instruction based on position
          let pointName;
          if (isLastLeg && isLastStep) pointName = locationName;
          else if (!isFirstLeg && isFirstStep) pointName = `Waypoint ${i}`;

          const instruction = generateInstruction(
            j, from, to, isFirstLeg && isFirstStep, isLastLeg && isLastStep, pointName
          );

          const step: RouteStep = {
            instruction,
            distance,
            duration,
            maneuver: isFirstStep ? 'start' : isLastStep ? 'arrive' : 'turn',
            startLocation: from,
            endLocation: to
          };

          legSteps.push(step);
          legDistance += distance;
          legDuration += duration;
        }

        // Add the leg to our route
        const leg: RouteLeg = {
          distance: legDistance,
          duration: legDuration,
          startLocation: startPoint,
          endLocation: endPoint,
          steps: legSteps
        };

        routeData.legs.push(leg);
        routeData.distance += legDistance;
        routeData.duration += legDuration;
      }
    }

    return routeData;
  }, []);

  useEffect(() => {
    if (!hasCalculatedRoute && directions && userLocation && center.lat !== 0 && center.lng !== 0) {
      const points: [number, number][] = [];

      // Start with user location
      if (userLocation) {
        points.push([userLocation.lat, userLocation.lng]);
      }

      // Add all waypoints
      if (waypoints.length > 0) {
        waypoints.forEach((wp) => {
          points.push([wp.lat, wp.lng]);
        });
      }

      // End with destination
      if (center.lat !== 0 && center.lng !== 0) {
        points.push([center.lat, center.lng]);
      }

      setRoute(points);

      // Create bounds that include all points
      const bounds = L.latLngBounds(points.map((p) => L.latLng(p[0], p[1])));
      map.fitBounds(bounds, { padding: [50, 50] });

      // Generate and emit route data if callback is provided
      if (onRouteCalculated && points.length >= 2) {
        const routeData = generateRouteData(points, "destination");
        onRouteCalculated(routeData);
        setHasCalculatedRoute(true);
      }
    } else if (!directions) {
      setRoute([]);
    }
  }, [hasCalculatedRoute, directions, userLocation, center, map, waypoints, onRouteCalculated, generateRouteData]);

  return (
    <>
      {route.length > 0 && (
        <Polyline
          positions={route}
          color="#3b82f6"
          weight={5}
          dashArray="10, 10"
          opacity={0.8}
        />
      )}
    </>
  );
}
