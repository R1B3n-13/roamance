'use client';

import { SectionHeading } from '@/components/common/section-heading';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { GlobeMethods } from 'react-globe.gl';
import { touristPlaces } from '@/constants';
import { TouristPlace } from '@/types';
import * as THREE from 'three';
import gsap from 'gsap';

const Globe = dynamic(
  () => import('react-globe.gl').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[500px] w-full">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    ),
  }
);

export function GlobeShowcase() {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [places, setPlaces] = useState<TouristPlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<TouristPlace | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [detailsPosition, setDetailsPosition] = useState<'left' | 'right'>(
    'right'
  );
  const [isMouseOverGlobe, setIsMouseOverGlobe] = useState(false);

  // Create building objects data structure with custom shapes
  const buildingsData = useMemo(
    () =>
      places.map((place) => ({
        ...place,
        altitude: 0.05,
        lat: place.lat,
        lng: place.lng,
        radius: 0.2,
        height: 0.3 + place.size * 0.2,
        color: place.color,
      })),
    [places]
  );

  // Custom 3D object factory for buildings
  const objectsThreeObject = useCallback((d: object) => {
    const place = d as TouristPlace;

    // Calculate position based on lat/lng (spherical to Cartesian conversion)
    const latRad = THREE.MathUtils.degToRad(place.lat);
    const lngRad = THREE.MathUtils.degToRad(place.lng);

    // Create direction vector pointing from center to the place
    const dirVector = new THREE.Vector3(
      Math.cos(latRad) * Math.cos(lngRad),
      Math.sin(latRad),
      Math.cos(latRad) * Math.sin(lngRad)
    ).normalize();

    // Define scale factor for bigger markers
    const scaleFactor = 100 / 3;

    // Globe radius - exactly 1 unit
    const globeRadius = 1;

    // Position the marker exactly on the surface
    const surfacePoint = dirVector.clone().multiplyScalar(globeRadius);

    // Create a group to hold all elements
    const group = new THREE.Group();

    // Create elegant pin marker - sphere on top of a thin cylinder
    // Use the color as provided in tourist-places.ts and make the pin non-transparent
    // Use the color provided in tourist-places.ts by computing its CSS value if it's a variable
    const cssVarMatch = place.color.match(/var\(\s*(--[a-zA-Z0-9-_]+)\s*\)/);
    const pinColor =
      cssVarMatch && typeof window !== 'undefined'
        ? getComputedStyle(document.documentElement)
            .getPropertyValue(cssVarMatch[1])
            .trim()
        : place.color;

    // Top sphere (head of pin)
    const sphereGeometry = new THREE.SphereGeometry(0.12 * scaleFactor, 16, 16);
    const sphereMaterial = new THREE.MeshLambertMaterial({
      color: pinColor,
      emissive: pinColor,
      emissiveIntensity: 0.8,
      transparent: false,
      opacity: 1,
    });
    sphereMaterial.depthTest = false;
    sphereMaterial.depthWrite = false;
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

    // Thin cylinder (stem of pin)
    const stemGeometry = new THREE.CylinderGeometry(
      0.03 * scaleFactor,
      0.08 * scaleFactor,
      0.25 * scaleFactor,
      12
    );
    stemGeometry.translate(0, -0.15 * scaleFactor, 0);
    const stemMaterial = new THREE.MeshLambertMaterial({
      color: pinColor,
      emissive: pinColor,
      emissiveIntensity: 0.5,
      transparent: false,
      opacity: 1,
    });
    stemMaterial.depthTest = false;
    stemMaterial.depthWrite = false;
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);

    // Group pin parts
    const pin = new THREE.Group();
    pin.add(sphere);
    pin.add(stem);

    // Position the pin on the globe surface
    pin.position.copy(surfacePoint);

    // Orient the pin so that its local z axis aligns with the globe's outward normal (dirVector)
    pin.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dirVector);

    group.add(pin);

    // Add a pulsing ring beneath the marker - rings should be parallel to the surface
    const ringGeometry = new THREE.RingGeometry(
      0.15 * scaleFactor,
      0.18 * scaleFactor,
      32
    );
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: pinColor,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    });
    ringMaterial.depthTest = false;
    ringMaterial.depthWrite = false;
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);

    // Position the ring correctly aligned with the surface tangent
    ring.position.copy(
      surfacePoint.clone().add(dirVector.clone().multiplyScalar(0.01))
    );
    ring.lookAt(0, 0, 0);
    ring.rotateX(Math.PI / 2); // Rotate 90 degrees to be parallel with the surface

    // Create a second pulsing ring
    const outerRingGeometry = new THREE.RingGeometry(
      0.22 * scaleFactor,
      0.24 * scaleFactor,
      32
    );
    const outerRingMaterial = new THREE.MeshBasicMaterial({
      color: pinColor,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
    });
    outerRingMaterial.depthTest = false;
    outerRingMaterial.depthWrite = false;
    const outerRing = new THREE.Mesh(outerRingGeometry, outerRingMaterial);

    // Position the outer ring
    outerRing.position.copy(
      surfacePoint.clone().add(dirVector.clone().multiplyScalar(0.01))
    );
    outerRing.lookAt(new THREE.Vector3(0, 0, 0));

    group.add(ring);
    group.add(outerRing);

    // Add a glow effect sphere for hover highlighting
    const glowGeometry = new THREE.SphereGeometry(0.3 * scaleFactor, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: pinColor,
      transparent: true,
      opacity: 0,
    });
    glowMaterial.depthTest = false;
    glowMaterial.depthWrite = false;
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.copy(surfacePoint);

    group.add(glow);

    // Store place data, position vector, and hover state in the group's userData
    group.userData = {
      placeId: place.id,
      isHovered: false,
      dirVector: dirVector.clone(), // Store normalized direction vector
      ring: ring,
      outerRing: outerRing,
      pulsePhase: Math.random() * Math.PI * 2, // Random phase for animation variety
    };

    return group;
  }, []);

  // Add update function to handle hover animations
  useEffect(() => {
    if (!globeRef.current) return;
    let lastTime = performance.now();
    const animate = () => {
      if (!globeRef.current?.scene) {
        requestAnimationFrame(animate);
        return;
      }
      const currentTime = performance.now();
      const delta = (currentTime - lastTime) / 1000; // delta in seconds
      lastTime = currentTime;
      const time = currentTime * 0.001;
      const pov = globeRef.current.pointOfView();
      if (!pov) {
        requestAnimationFrame(animate);
        return;
      }
      const cameraLat = THREE.MathUtils.degToRad(pov.lat);
      const cameraLng = THREE.MathUtils.degToRad(pov.lng);
      const cameraVector = new THREE.Vector3(
        Math.cos(cameraLat) * Math.cos(cameraLng),
        Math.sin(cameraLat),
        Math.cos(cameraLat) * Math.sin(cameraLng)
      ).normalize();

      globeRef.current.scene().traverse((object) => {
        if (
          !(object instanceof THREE.Group) ||
          !object.userData ||
          object.userData.placeId === undefined
        )
          return;
        if (object.userData.dirVector) {
          if (selectedPlace && object.userData.placeId === selectedPlace.id) {
            object.visible = true;
            object.userData.hideLabel = false;
          } else {
            const dotProduct = cameraVector.dot(object.userData.dirVector);
            const isVisible = dotProduct > 0.9;
            object.visible = isVisible;
            object.userData.hideLabel = !isVisible;
            if (!isVisible) return;
          }
        }
        const isSelected =
          selectedPlace && object.userData.placeId === selectedPlace.id;
        const pinGroup = object.children.find(
          (child) => child instanceof THREE.Group
        );
        const ring = object.userData.ring;
        const outerRing = object.userData.outerRing;
        if (ring && outerRing) {
          const phase = object.userData.pulsePhase || 0;
          const pulse = 0.3 + 0.2 * Math.sin(time * 1.5 + phase);
          const outerPulse =
            0.2 + 0.15 * Math.sin(time * 1.2 + phase + Math.PI);
          (ring.material as THREE.MeshBasicMaterial).opacity = pulse;
          (outerRing.material as THREE.MeshBasicMaterial).opacity = outerPulse;
          ring.rotation.z += delta * 0.2;
          outerRing.rotation.z -= delta * 0.15;
        }
        const glow = object.children.find(
          (child) =>
            child instanceof THREE.Mesh &&
            child.geometry instanceof THREE.SphereGeometry
        );
        if (pinGroup && glow) {
          if (isSelected && !object.userData.isHovered) {
            object.userData.isHovered = true;
            if (pinGroup.scale.x !== 1.3) {
              gsap.to(pinGroup.scale, {
                x: 1.3,
                y: 1.3,
                z: 1.3,
                duration: 0.3,
              });
            }
            gsap.to(
              (glow as THREE.Mesh).material as THREE.MeshBasicMaterial,
              { opacity: 0.3, duration: 0.5 }
            );
          } else if (!isSelected && object.userData.isHovered) {
            object.userData.isHovered = false;
            if (pinGroup.scale.x !== 1) {
              gsap.to(pinGroup.scale, {
                x: 1,
                y: 1,
                z: 1,
                duration: 0.3,
              });
            }
            gsap.to(
              (glow as THREE.Mesh).material as THREE.MeshBasicMaterial,
              { opacity: 0, duration: 0.5 }
            );
          }
        }
      });
      requestAnimationFrame(animate);
    };
    animate();
  }, [selectedPlace]);

  useEffect(() => {
    setIsClient(true);

    const timer = setTimeout(() => {
      setPlaces(touristPlaces);
    }, 1000);

    let rotationFrame: number;
    const rotate = () => {
      if (globeRef.current && !selectedPlace && !isMouseOverGlobe) {
        const pov = globeRef.current.pointOfView();
        const currentLng = pov ? pov.lng : 0;
        globeRef.current.pointOfView({
          lat: 25,
          lng: currentLng + 0.1, // smaller incremental rotation per frame
          altitude: 2.5,
        });
      }
      rotationFrame = requestAnimationFrame(rotate);
    };
    if (isClient) {
      rotationFrame = requestAnimationFrame(rotate);
    }
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rotationFrame);
    };
  }, [isClient, selectedPlace, isMouseOverGlobe]);

  const handlePlaceHover = (place: TouristPlace | null) => {
    // Prevent flicker by ignoring repeated hovers over the same building.
    if (selectedPlace?.id === place?.id) return;

    setSelectedPlace(place);
    if (globeRef.current && place) {
      // Determine which side of the screen the place is on, and put the details on the opposite side
      const pov = globeRef.current.pointOfView();
      const currentLng = pov ? pov.lng : 0;
      // If place longitude is greater than current view, it's on the right side
      setDetailsPosition(place.lng > currentLng ? 'left' : 'right');

      globeRef.current.pointOfView(
        {
          lat: place.lat,
          lng: place.lng,
          altitude: 1.8,
        },
        1000
      );
    }
  };

  return (
    <section className="py-24 overflow-hidden relative bg-background/80">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-forest/5 blur-3xl"></div>
        <div className="absolute top-[40%] left-[20%] w-[30%] h-[30%] rounded-full bg-sunset/5 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <SectionHeading
          title="Explore the World"
          titleHighlight="World"
          subtitle="Discover breathtaking destinations around the globe with our interactive 3D map"
        />

        <div className="relative mt-12">
          {/* Full-width globe container */}
          <div className="w-full h-[600px] flex items-center justify-center relative">
            {isClient && (
              <div
                onPointerEnter={() => setIsMouseOverGlobe(true)}
                onPointerLeave={() => setIsMouseOverGlobe(false)}
                className="inline-block"
              >
                <Globe
                  ref={globeRef}
                  globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                  backgroundImageUrl=""
                  backgroundColor="rgba(0,0,0,0)"
                  // globeMaterial={new THREE.MeshPhongMaterial({
                  //   map: new THREE.TextureLoader().load("//unpkg.com/three-globe/example/img/earth-night.jpg"),
                  //   transparent: false,
                  //   opacity: 1,
                  // })}
                  objectsData={buildingsData}
                  objectLat="lat"
                  objectLng="lng"
                  objectAltitude="altitude"
                  objectThreeObject={objectsThreeObject}
                  objectLabel={(d) => {
                    const place = d as TouristPlace;
                    return `
                <div class="bg-background/90 backdrop-blur-md p-2 rounded-lg border shadow-lg text-sm">
                  <b>${place.name}</b><br/>
                  ${place.country}
                </div>
              `;
                  }}
                  onObjectHover={(object) =>
                    handlePlaceHover(object as TouristPlace | null)
                  }
                  width={800}
                  height={600}
                />
              </div>
            )}
          </div>

          {/* Floating details panel */}
          {selectedPlace && (
            <motion.div
              className={cn(
                'absolute top-1/2 transform -translate-y-1/2 w-[300px] z-20',
                detailsPosition === 'left' ? 'left-8' : 'right-8'
              )}
              initial={{ opacity: 0, x: detailsPosition === 'left' ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: detailsPosition === 'left' ? -50 : 50 }}
              transition={{ duration: 0.3 }}
              key={`${selectedPlace.id}-${detailsPosition}`}
            >
              <div className="bg-background/80 backdrop-blur-md p-6 rounded-xl border shadow-lg">
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className={cn(
                      'p-2 rounded-lg',
                      `bg-${selectedPlace.color.split('--')[1]}/20`
                    )}
                  >
                    <MapPin
                      className={cn(
                        'h-5 w-5',
                        `text-${selectedPlace.color.split('--')[1]}`
                      )}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedPlace.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedPlace.country}
                    </p>
                  </div>
                </div>
                <p className="mb-4">{selectedPlace.description}</p>
                <button className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1 transition-colors">
                  Explore more about {selectedPlace.name}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
