import { TouristPlace } from '@/types';
import { useCallback } from 'react';
import * as THREE from 'three';

export const useGlobeObject = () => {
  const objectsThreeObject = useCallback((d: object) => {
    const place = d as TouristPlace;

    const latRad = THREE.MathUtils.degToRad(place.lat);
    const lngRad = THREE.MathUtils.degToRad(place.lng);

    const dirVector = new THREE.Vector3(
      Math.cos(latRad) * Math.cos(lngRad),
      Math.sin(latRad),
      Math.cos(latRad) * Math.sin(lngRad)
    ).normalize();

    const scaleFactor = 100 / 3;
    const markerScale = 0.75;

    const globeRadius = 1;

    // Calculate the point on the globe's surface
    const surfacePoint = dirVector.clone().multiplyScalar(globeRadius);

    // Create a container group for all pin elements
    const group = new THREE.Group();

    // Extract pin color from CSS variables if needed
    const cssVarRegex = /var\(\s*(--[a-zA-Z0-9-_]+)\s*\)/;
    const cssVarMatch = cssVarRegex.exec(place.color);
    const pinColor =
      cssVarMatch && typeof window !== 'undefined'
        ? getComputedStyle(document.documentElement)
            .getPropertyValue(cssVarMatch[1])
            .trim()
        : place.color;

    // Create the pin head (sphere) - making it slightly larger since we're removing the stem
    const sphereGeometry = new THREE.SphereGeometry(
      0.15 * scaleFactor * markerScale,
      16,
      16
    );
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: pinColor,
      metalness: 0.5,
      roughness: 0.2,
      emissive: new THREE.Color(pinColor),
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.95,
    });
    sphereMaterial.depthTest = true;
    sphereMaterial.depthWrite = true;
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

    // Group just contains the sphere now (no stem)
    const pin = new THREE.Group();
    pin.add(sphere);

    // Position the pin at the surface point
    pin.position.copy(surfacePoint);

    // Calculate the orientation to make the pin perpendicular to the globe surface
    const radial = surfacePoint.clone().normalize();
    const upVector = new THREE.Vector3(0, 1, 0);

    // Use quaternion to orient the pin perpendicular to the globe surface
    pin.quaternion.setFromUnitVectors(upVector, radial);

    group.add(pin);

    // Create inner ring
    const ringGeometry = new THREE.RingGeometry(
      0.15 * scaleFactor * markerScale,
      0.18 * scaleFactor * markerScale,
      32
    );
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: pinColor,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    });
    ringMaterial.depthTest = true;
    ringMaterial.depthWrite = true;
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);

    // Position the ring slightly above the surface
    const ringOffset = 0.01;
    ring.position.copy(
      surfacePoint.clone().add(dirVector.clone().multiplyScalar(ringOffset))
    );

    // Orient the ring to face outward
    ring.lookAt(0, 0, 0);
    ring.rotateX(Math.PI / 2);

    // Create outer ring
    const outerRingGeometry = new THREE.RingGeometry(
      0.22 * scaleFactor * markerScale,
      0.24 * scaleFactor * markerScale,
      32
    );
    const outerRingMaterial = new THREE.MeshBasicMaterial({
      color: pinColor,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
    });
    outerRingMaterial.depthTest = true;
    outerRingMaterial.depthWrite = true;
    const outerRing = new THREE.Mesh(outerRingGeometry, outerRingMaterial);

    // Position the outer ring slightly above the surface
    outerRing.position.copy(
      surfacePoint.clone().add(dirVector.clone().multiplyScalar(ringOffset))
    );

    // Orient the outer ring to face outward
    outerRing.lookAt(0, 0, 0);
    outerRing.rotateX(Math.PI / 2);

    group.add(ring);
    group.add(outerRing);

    // Create glow effect
    const glowGeometry = new THREE.SphereGeometry(
      0.3 * scaleFactor * markerScale,
      16,
      16
    );
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: pinColor,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
    });
    glowMaterial.depthTest = true;
    glowMaterial.depthWrite = true;
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.copy(surfacePoint);

    group.add(glow);

    // Store metadata in userData for later use
    group.userData = {
      placeId: place.id,
      isHovered: false,
      dirVector: dirVector.clone(),
      ring: ring,
      outerRing: outerRing,
      pulsePhase: Math.random() * Math.PI * 2,
    };

    return group;
  }, []);

  return objectsThreeObject;
};
