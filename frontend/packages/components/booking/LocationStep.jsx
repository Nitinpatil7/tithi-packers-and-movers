'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, ArrowRight, Building2, CheckCircle2, Clock, Crosshair, Layers, Loader2, Map as MapIcon, MapPin, Truck, Users, X } from 'lucide-react';
import { cn } from '@utils/utils';
import { useBookingStore } from '@tithi/store/bookingStore';
import BookingActionBar from './BookingActionBar';

const SURAT_BOUNDS = { north: 21.35, south: 20.97, east: 73.08, west: 72.65 };
const configuredMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
const hasUsableMapsKey = Boolean(configuredMapsKey && !configuredMapsKey.includes('PLACEHOLDER'));
const debugMaps = process.env.NEXT_PUBLIC_DEBUG_MAPS === 'true';

const SURAT_CENTER = { lat: 21.1702, lng: 72.8311 };
const needsSurat = (serviceType, role) => serviceType === 'local' || serviceType === 'labour' || role === 'pickup';
const GEOLOCATION_OPTIONS = { enableHighAccuracy: true, timeout: 18000, maximumAge: 0 };
const GEOLOCATION_TARGET_ACCURACY_METERS = 80;
const GEOLOCATION_WATCH_TIMEOUT_MS = 9000;

function debugMapLog(message, meta) {
  if (debugMaps) console.info(message, meta);
}

function reportMapIssue(message, meta) {
  if (debugMaps) console.error(message, meta);
}

const toLatLngLiteral = (location) => {
  if (!location) return null;
  if (typeof location.lat === 'function') return { lat: location.lat(), lng: location.lng() };
  return { lat: Number(location.lat), lng: Number(location.lng) };
};

function getAddressComponent(place, type) {
  return place.address_components?.find((component) => component.types.includes(type))?.long_name || '';
}

function getAddressComponentShort(place, type) {
  return place.address_components?.find((component) => component.types.includes(type))?.short_name || '';
}

function extractAddressMeta(place, fallbackAddress = '') {
  const city = getAddressComponent(place, 'locality')
    || getAddressComponent(place, 'postal_town')
    || getAddressComponent(place, 'administrative_area_level_3')
    || getAddressComponent(place, 'administrative_area_level_2')
    || (/surat/i.test(fallbackAddress) ? 'Surat' : '');
  const state = getAddressComponent(place, 'administrative_area_level_1')
    || (/gujarat/i.test(fallbackAddress) || /surat/i.test(fallbackAddress) ? 'Gujarat' : '');
  const pincode = getAddressComponentShort(place, 'postal_code')
    || getAddressComponent(place, 'postal_code')
    || fallbackAddress.match(/\b\d{6}\b/)?.[0]
    || (/surat/i.test(fallbackAddress) ? '395001' : '');
  return { city, state, pincode };
}

function isCoordinateAddress(value = '') {
  const text = String(value || '').trim();
  if (!text) return false;
  const coordinatePair = text.match(/[-+]?\d{1,3}(?:\.\d+)?\s*[, ]\s*[-+]?\d{1,3}(?:\.\d+)?/);
  if (!coordinatePair) return false;
  const plainCoordinate = /^[-+]?\d{1,3}(?:\.\d+)?\s*[, ]\s*[-+]?\d{1,3}(?:\.\d+)?$/.test(text);
  return plainCoordinate || text.replace(coordinatePair[0], '').trim().length < 6;
}

function cleanReadableAddress(value = '') {
  const text = stripPlusCodePrefix(value);
  return isReadableAddress(text) ? text : '';
}

function stripPlusCodePrefix(value = '') {
  return String(value || '')
    .replace(/^\s*[A-Z0-9]{2,}\+[A-Z0-9]{2,}\s*,?\s*/i, '')
    .trim();
}

function isReadableAddress(value = '') {
  const text = stripPlusCodePrefix(value);
  if (text.length < 8 || isCoordinateAddress(text)) return false;
  if (/^[A-Z0-9+]{4,}\s*[A-Z0-9+]*$/i.test(text)) return false;
  return /[a-z]/i.test(text);
}

function composeAddressFromComponents(place = {}) {
  const component = (type) => getAddressComponent(place, type);
  const premise = [
    component('premise'),
    component('subpremise'),
    component('establishment'),
  ].filter(Boolean);
  const street = [
    component('street_number'),
    component('route'),
  ].filter(Boolean).join(' ');
  const area = [
    component('neighborhood'),
    component('sublocality_level_2'),
    component('sublocality_level_1'),
    component('sublocality'),
  ].filter(Boolean);
  const city = component('locality')
    || component('postal_town')
    || component('administrative_area_level_3')
    || component('administrative_area_level_2');
  const state = component('administrative_area_level_1');
  const pincode = getAddressComponentShort(place, 'postal_code') || component('postal_code');
  const country = component('country');

  return [...premise, street, ...area, city, state, pincode, country]
    .map((part) => String(part || '').trim())
    .filter(Boolean)
    .filter((part, index, parts) => parts.findIndex((item) => item.toLowerCase() === part.toLowerCase()) === index)
    .join(', ');
}

function readableAddressFromPlace(place = {}) {
  if (!place) return '';
  if ((place.types || []).includes('plus_code')) return '';
  const formatted = cleanReadableAddress(stripPlusCodePrefix(place.formatted_address));
  if (formatted) return formatted;
  const composed = cleanReadableAddress(composeAddressFromComponents(place));
  if (composed) return composed;
  return '';
}

function placeRank(place) {
  const types = place?.types || [];
  if (types.includes('street_address') || types.includes('premise') || types.includes('subpremise')) return 1;
  if (types.includes('route') || types.includes('establishment')) return 2;
  if (types.includes('neighborhood') || types.includes('sublocality') || types.includes('sublocality_level_1')) return 3;
  if (types.includes('locality') || types.includes('postal_code')) return 4;
  if (types.includes('plus_code')) return 9;
  return 5;
}

function distanceMeters(left, right) {
  if (!left || !right) return Number.POSITIVE_INFINITY;
  const lat1 = Number(left.lat);
  const lng1 = Number(left.lng);
  const lat2 = Number(right.lat);
  const lng2 = Number(right.lng);
  if (![lat1, lng1, lat2, lng2].every(Number.isFinite)) return Number.POSITIVE_INFINITY;
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadius = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function chooseReadablePlace(results = [], origin = null) {
  return [...results]
    .filter((place) => readableAddressFromPlace(place))
    .sort((a, b) => {
      const locationA = toLatLngLiteral(a.geometry?.location);
      const locationB = toLatLngLiteral(b.geometry?.location);
      const distanceA = origin ? distanceMeters(origin, locationA) : 0;
      const distanceB = origin ? distanceMeters(origin, locationB) : 0;
      const rankDelta = placeRank(a) - placeRank(b);
      if (Math.abs(distanceA - distanceB) > 75) return distanceA - distanceB;
      return rankDelta;
    })[0] || null;
}

function getFreshCurrentPosition(onSuccess, onError) {
  if (!navigator.geolocation) {
    onError?.();
    return () => {};
  }
  let settled = false;
  let bestPosition = null;
  let watchId = null;
  let timeoutId = null;

  const finish = (position, error) => {
    if (settled) return;
    settled = true;
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    if (timeoutId) window.clearTimeout(timeoutId);
    if (position) onSuccess(position);
    else onError?.(error);
  };

  const considerPosition = (position) => {
    const accuracy = Number(position?.coords?.accuracy || Number.POSITIVE_INFINITY);
    const bestAccuracy = Number(bestPosition?.coords?.accuracy || Number.POSITIVE_INFINITY);
    if (!bestPosition || accuracy < bestAccuracy) bestPosition = position;
    if (accuracy <= GEOLOCATION_TARGET_ACCURACY_METERS) finish(position);
  };

  navigator.geolocation.getCurrentPosition(considerPosition, (error) => finish(bestPosition, error), GEOLOCATION_OPTIONS);
  watchId = navigator.geolocation.watchPosition(considerPosition, (error) => finish(bestPosition, error), GEOLOCATION_OPTIONS);
  timeoutId = window.setTimeout(() => finish(bestPosition), GEOLOCATION_WATCH_TIMEOUT_MS);

  return () => {
    settled = true;
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    if (timeoutId) window.clearTimeout(timeoutId);
  };
}

function visibleAddress(value = {}) {
  const address = cleanReadableAddress(value?.address);
  if (address) return address;
  const mapAddress = cleanReadableAddress(value?.mapAddress);
  if (mapAddress) return mapAddress;
  return '';
}

function normalizeLocationPayload({ address, lat, lng, floor, liftAvailable, place, manual = false, mapPicked = false }) {
  const cleanAddress = cleanReadableAddress(address);
  const meta = place ? extractAddressMeta(place, cleanAddress) : {
    city: /surat/i.test(cleanAddress) ? 'Surat' : '',
    state: /gujarat/i.test(cleanAddress) || /surat/i.test(cleanAddress) ? 'Gujarat' : '',
    pincode: cleanAddress.match(/\b\d{6}\b/)?.[0] || (/surat/i.test(cleanAddress) ? '395001' : ''),
  };
  return {
    address: cleanAddress,
    city: meta.city || 'Unknown',
    state: meta.state || 'India',
    pincode: meta.pincode || '000000',
    floor,
    liftAvailable,
    mapAddress: cleanAddress,
    lat: lat ?? null,
    lng: lng ?? null,
    manual,
    mapPicked,
  };
}

function validatePlace(place, serviceType, role) {
  if (!place?.geometry?.location || !place.formatted_address) {
    return 'Please select a complete address from Google Maps suggestions.';
  }

  const countryCode = place.address_components
    ?.find((component) => component.types.includes('country'))
    ?.short_name;
  if (countryCode !== 'IN') return 'Please select a location within India.';

  if (needsSurat(serviceType, role)) {
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    const localityText = [
      getAddressComponent(place, 'locality'),
      getAddressComponent(place, 'administrative_area_level_2'),
      getAddressComponent(place, 'postal_town'),
    ].join(' ').toLowerCase();
    const insideSuratBounds = lat >= SURAT_BOUNDS.south && lat <= SURAT_BOUNDS.north
      && lng >= SURAT_BOUNDS.west && lng <= SURAT_BOUNDS.east;

    if (!insideSuratBounds || !localityText.includes('surat')) {
      return serviceType === 'local'
        ? 'Local shifting allows pickup and drop only within Surat city.'
        : 'Pickup must be within Surat city.';
    }
  }

  return '';
}

function validateLatLng(location, serviceType, role) {
  const latLng = toLatLngLiteral(location);
  if (!latLng || !Number.isFinite(latLng.lat) || !Number.isFinite(latLng.lng)) return 'Please choose a valid map location.';
  if (needsSurat(serviceType, role)) {
    const insideSuratBounds = latLng.lat >= SURAT_BOUNDS.south && latLng.lat <= SURAT_BOUNDS.north
      && latLng.lng >= SURAT_BOUNDS.west && latLng.lng <= SURAT_BOUNDS.east;
    if (!insideSuratBounds) {
      return serviceType === 'intercity'
        ? 'Pickup must be within Surat city.'
        : 'This service allows locations only within Surat city.';
    }
  }
  return '';
}

function validateManualAddress(address, serviceType, role) {
  const cleanAddress = address.trim();
  if (cleanAddress.length < 8) return 'Please enter a complete address.';
  if (needsSurat(serviceType, role) && !/\bsurat\b/i.test(cleanAddress)) {
    return serviceType === 'local'
      ? 'Local shifting allows pickup and drop only within Surat city.'
      : 'Pickup address must include Surat city.';
  }
  return '';
}

function MapPickerModal({ open, title, role, serviceType, initialValue, onClose, onPick }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geocodeRequestRef = useRef(0);
  const reverseGeocodeRef = useRef(null);
  const openSnapshotRef = useRef({ latLng: null, address: '' });
  const wasOpenRef = useRef(false);
  const idleGeocodeTimerRef = useRef(null);
  const initialValueLat = initialValue?.lat;
  const initialValueLng = initialValue?.lng;
  const initialValueAddress = initialValue?.address;
  const initialValueMapAddress = initialValue?.mapAddress;
  const initialLatLng = useMemo(() => {
    if (initialValueLat === undefined || initialValueLng === undefined) return null;
    return toLatLngLiteral({ lat: initialValueLat, lng: initialValueLng });
  }, [initialValueLat, initialValueLng]);
  const initialReadableAddress = useMemo(
    () => visibleAddress({ address: initialValueAddress, mapAddress: initialValueMapAddress }),
    [initialValueAddress, initialValueMapAddress]
  );
  const [selected, setSelected] = useState(initialLatLng || SURAT_CENTER);
  const [address, setAddress] = useState(initialReadableAddress);
  const [placeForAddress, setPlaceForAddress] = useState(null);
  const [error, setError] = useState('');
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [locating, setLocating] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      const latLng = initialLatLng || SURAT_CENTER;
      const readable = initialReadableAddress;
      openSnapshotRef.current = { latLng, address: readable };
      setSelected(latLng);
      setAddress(readable);
      setPlaceForAddress(null);
      setError('');
      setLoadingAddress(false);
      setLocating(false);
      setMapReady(false);
    }
    wasOpenRef.current = open;
  }, [initialLatLng, initialReadableAddress, open]);

  useEffect(() => {
    if (!open) return undefined;
    let attempts = 0;
    let cancelled = false;
    let cancelAutoLocate = null;
    const snapshot = openSnapshotRef.current;
    const startLatLng = snapshot.latLng || SURAT_CENTER;
    const startAddress = snapshot.address || '';

    const fallbackToNearbyPlace = (latLng, sourceStatus, requestId) => {
      const places = window.google?.maps?.places;
      const map = mapInstanceRef.current;
      if (!places?.PlacesService || !map) {
        debugMapLog('[MapPicker] places fallback unavailable', { sourceStatus, latLng });
        reportMapIssue('[MapPicker] PlacesService unavailable. Check that the Places API is enabled for the Google Maps key.', { sourceStatus, latLng });
        setAddress('');
        setPlaceForAddress(null);
        setError('Could not find a readable address for this point. Please choose a nearby road/building or search the address.');
        return;
      }

      const service = new places.PlacesService(map);
      service.nearbySearch({
        location: latLng,
        rankBy: places.RankBy.DISTANCE,
      }, (nearbyResults, nearbyStatus) => {
        if (cancelled || requestId !== geocodeRequestRef.current) return;
        debugMapLog('[MapPicker] places nearby result', {
          sourceStatus,
          status: nearbyStatus,
          latLng,
          resultCount: nearbyResults?.length || 0,
          firstPlace: nearbyResults?.[0]?.name || '',
        });
        if (nearbyStatus !== places.PlacesServiceStatus.OK) {
          reportMapIssue('[MapPicker] Places nearbySearch failed. Check Places API, billing, quota, and key restrictions.', { status: nearbyStatus, sourceStatus, latLng });
        }

        const nearest = nearbyStatus === places.PlacesServiceStatus.OK
          ? nearbyResults?.find((place) => place.place_id)
          : null;

        if (!nearest) {
          setLoadingAddress(false);
          setAddress('');
          setPlaceForAddress(null);
          setError('Could not find a readable address for this point. Please choose a nearby road/building or search the address.');
          return;
        }

        service.getDetails({
          placeId: nearest.place_id,
          fields: ['formatted_address', 'geometry', 'address_components', 'name', 'vicinity'],
        }, (details, detailsStatus) => {
          if (cancelled || requestId !== geocodeRequestRef.current) return;
          setLoadingAddress(false);
          const detailsAddress = readableAddressFromPlace(details)
            || cleanReadableAddress(details?.vicinity)
            || cleanReadableAddress(nearest.vicinity)
            || cleanReadableAddress(nearest.name);
          debugMapLog('[MapPicker] places details result', {
            sourceStatus,
            status: detailsStatus,
            latLng,
            address: detailsAddress,
          });
          if (detailsStatus !== places.PlacesServiceStatus.OK) {
            reportMapIssue('[MapPicker] Places getDetails failed. Check Places API, billing, quota, and key restrictions.', { status: detailsStatus, sourceStatus, latLng });
          }

          if (detailsStatus === places.PlacesServiceStatus.OK && detailsAddress) {
            setAddress(detailsAddress);
            setPlaceForAddress({ ...details, formatted_address: detailsAddress });
          } else {
            setAddress('');
            setPlaceForAddress(null);
            setError('Could not find a readable address for this point. Please choose a nearby road/building or search the address.');
          }
        });
      });
    };

    const reverseGeocode = (latLng) => {
      const validation = validateLatLng(latLng, serviceType, role);
      if (validation) {
        setError(validation);
        return;
      }
      setError('');
      if (!window.google?.maps?.Geocoder) {
        reportMapIssue('[MapPicker] Geocoder unavailable. Check that Maps JavaScript API loaded with the geocoding library available.', { latLng });
        setError('Google Maps geocoder is not available yet. Please try again.');
        return;
      }
      setLoadingAddress(true);
      const requestId = geocodeRequestRef.current + 1;
      geocodeRequestRef.current = requestId;
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: latLng, region: 'IN', language: 'en' }, (results, status) => {
        if (cancelled || requestId !== geocodeRequestRef.current) return;
        const readablePlace = status === 'OK' ? chooseReadablePlace(results, latLng) : null;
        const readable = readableAddressFromPlace(readablePlace);
        debugMapLog('[MapPicker] reverse geocode result', {
          status,
          latLng,
          rawResultCount: results?.length || 0,
          firstFormattedAddress: results?.[0]?.formatted_address || '',
          address: readable,
        });
        if (status !== 'OK') {
          reportMapIssue('[MapPicker] Reverse geocode failed. Check Geocoding API, billing, quota, and key restrictions.', { status, latLng });
        }
        if (readablePlace && readable) {
          setLoadingAddress(false);
          setAddress(readable);
          setPlaceForAddress({ ...readablePlace, formatted_address: readable });
        } else {
          fallbackToNearbyPlace(latLng, status, requestId);
        }
      });
    };
    reverseGeocodeRef.current = reverseGeocode;

    const centerFromTypedArea = (map) => {
      const typedAddress = String(startAddress).trim();
      if (!typedAddress || snapshot.latLng || !window.google?.maps?.Geocoder) return;
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: typedAddress, componentRestrictions: { country: 'IN' } }, (results, status) => {
        if (cancelled) return;
        if (status !== 'OK' || !results?.[0]) {
          reportMapIssue('[MapPicker] Initial typed-address geocode failed. Check Geocoding API, billing, quota, and key restrictions.', { status, address: typedAddress });
          return;
        }
        const readablePlace = chooseReadablePlace(results);
        if (!readablePlace) return;
        const location = readablePlace.geometry.location;
        const latLng = toLatLngLiteral(location);
        const readable = readableAddressFromPlace(readablePlace);
        if (!latLng || !readable) return;
        setSelected(latLng);
        setAddress(readable);
        setPlaceForAddress(readablePlace);
        map.setCenter(latLng);
        map.setZoom(needsSurat(serviceType, role) ? 15 : 12);
      });
    };

    const initialise = () => {
      if (cancelled || mapInstanceRef.current || !mapRef.current) return;
        if (!window.google?.maps?.Map) {
          attempts += 1;
        if (attempts >= 40) {
          reportMapIssue('[MapPicker] Maps JavaScript API did not become ready. Check Maps JavaScript API, billing, network access, and key restrictions.', { attempts });
          setError('Google Maps is taking too long to load. Please check the Maps API key or internet connection.');
        }
        return;
      }

      const map = new window.google.maps.Map(mapRef.current, {
        center: startLatLng,
        zoom: needsSurat(serviceType, role) ? 14 : 7,
        mapTypeId: 'roadmap',
        streetViewControl: false,
        fullscreenControl: false,
        mapTypeControl: true,
        zoomControl: false,
        gestureHandling: 'greedy',
        mapTypeControlOptions: {
          mapTypeIds: ['roadmap', 'satellite', 'terrain'],
        },
        restriction: needsSurat(serviceType, role)
          ? {
            latLngBounds: {
              north: SURAT_BOUNDS.north,
              south: SURAT_BOUNDS.south,
              east: SURAT_BOUNDS.east,
              west: SURAT_BOUNDS.west,
            },
            strictBounds: false,
          }
          : undefined,
      });
      const updateSelectionFromCenter = () => {
        setMapReady(true);
        const latLng = toLatLngLiteral(map.getCenter());
        if (!latLng) return;
        debugMapLog('[MapPicker] selected center coordinates', latLng);
        setSelected(latLng);
        if (idleGeocodeTimerRef.current) window.clearTimeout(idleGeocodeTimerRef.current);
        idleGeocodeTimerRef.current = window.setTimeout(() => {
          if (!cancelled) reverseGeocode(latLng);
        }, 180);
      };

      map.addListener('idle', updateSelectionFromCenter);
      mapInstanceRef.current = map;
      window.setTimeout(() => {
        window.google?.maps?.event?.trigger(map, 'resize');
        map.setCenter(startLatLng);
      }, 0);
      reverseGeocode(startLatLng);
      centerFromTypedArea(map);
      if (!snapshot.latLng && !startAddress && navigator.geolocation) {
        setLocating(true);
        cancelAutoLocate = getFreshCurrentPosition(
          ({ coords }) => {
            if (cancelled) return;
            setLocating(false);
            const currentCenter = { lat: coords.latitude, lng: coords.longitude };
            const validation = validateLatLng(currentCenter, serviceType, role);
            if (validation) {
              setError(validation);
              return;
            }
            map.setCenter(currentCenter);
            map.setZoom(16);
            setSelected(currentCenter);
            reverseGeocode(currentCenter);
          },
          () => {
            if (cancelled) return;
            setLocating(false);
          },
        );
      }
    };

    initialise();
    const timer = window.setInterval(() => {
      initialise();
      if (mapInstanceRef.current || attempts > 40) window.clearInterval(timer);
    }, 250);

    return () => {
      cancelled = true;
      geocodeRequestRef.current += 1;
      reverseGeocodeRef.current = null;
      if (idleGeocodeTimerRef.current) window.clearTimeout(idleGeocodeTimerRef.current);
      window.clearInterval(timer);
      cancelAutoLocate?.();
      if (mapInstanceRef.current) window.google?.maps?.event?.clearInstanceListeners(mapInstanceRef.current);
      mapInstanceRef.current = null;
    };
  }, [open, role, serviceType]);

  if (!open) return null;

  const confirm = () => {
    const readable = cleanReadableAddress(address);
    const validation = validateLatLng(selected, serviceType, role);
    if (validation) {
      setError(validation);
      return;
    }
    if (!readable || !placeForAddress) {
      setError('Please wait for the readable map address, or choose a nearby road/building.');
      return;
    }
    debugMapLog('[MapPicker] use this location', { address: readable, lat: selected.lat, lng: selected.lng });
    onPick({ address: readable, lat: selected.lat, lng: selected.lng, place: placeForAddress });
  };
  const readableAddress = cleanReadableAddress(address);
  const adjustZoom = (delta) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.setZoom(Math.max(3, Math.min(21, Number(map.getZoom() || 12) + delta)));
  };
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Browser location is not available. Please pan the map manually.');
      return;
    }
    setLocating(true);
    getFreshCurrentPosition(
      ({ coords }) => {
        setLocating(false);
        const nextCenter = { lat: coords.latitude, lng: coords.longitude };
        const validation = validateLatLng(nextCenter, serviceType, role);
        if (validation) {
          setError(validation);
          return;
        }
        mapInstanceRef.current?.setCenter(nextCenter);
        mapInstanceRef.current?.setZoom(16);
        setSelected(nextCenter);
        reverseGeocodeRef.current?.(nextCenter);
      },
      () => {
        setLocating(false);
        setError('Location permission was denied. Please pan the map manually.');
      },
    );
  };

  return (
    <div className="fixed inset-0 z-[2147483000] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl border border-bg-border bg-bg-white shadow-2xl sm:h-[82vh] sm:rounded-3xl">
        <div className="flex items-start justify-between gap-3 border-b border-bg-border p-4 sm:p-5">
          <div>
            <h3 className="text-base font-black text-text-primary">{title || 'Choose location from map'}</h3>
            <p className="mt-1 text-xs font-semibold text-text-secondary">Pan the map until the fixed pin is on the exact location, then confirm it.</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-bg-border text-text-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="relative h-[54vh] min-h-[320px] flex-1 bg-bg-section sm:min-h-[380px]">
          <div ref={mapRef} className={cn('absolute inset-0 transition-opacity duration-200', mapReady ? 'opacity-100' : 'opacity-0')} />
          {!mapReady && (
            <div className="absolute inset-0 z-10 grid place-items-center bg-bg-section">
              <span className="inline-flex items-center gap-2 rounded-2xl border border-bg-border bg-bg-white px-4 py-3 text-xs font-black text-text-secondary shadow-card">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Loading map...
              </span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <MapPin className="h-11 w-11 -translate-y-1/2 fill-red-500 text-red-600 drop-shadow-[0_2px_4px_rgba(0,0,0,.25)]" />
            <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-950/25 blur-[2px]" />
          </div>
          <div className="absolute right-3 top-3 flex flex-col overflow-hidden rounded-2xl border border-bg-border bg-white shadow-lg">
            <button type="button" onClick={() => adjustZoom(1)} className="grid h-11 w-11 place-items-center border-b border-bg-border text-xl font-black text-text-primary">+</button>
            <button type="button" onClick={() => adjustZoom(-1)} className="grid h-11 w-11 place-items-center text-xl font-black text-text-primary">-</button>
          </div>
          <button type="button" onClick={useCurrentLocation} disabled={locating} className="absolute bottom-5 left-3 inline-flex min-h-11 items-center gap-2 rounded-2xl border border-primary/20 bg-white px-4 py-2 text-xs font-black text-primary shadow-lg disabled:opacity-60">
            {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4" />}
            Use my current location
          </button>
        </div>
        <div className="border-t border-bg-border px-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-4 sm:p-5">
          <div className="rounded-2xl bg-bg-section p-3 text-sm font-semibold text-text-secondary">
            {loadingAddress ? <span className="flex items-center gap-2"><span className="h-4 w-4 animate-pulse rounded bg-sky-200" /> Finding address under pin...</span> : readableAddress ? `Selected: ${readableAddress}` : 'Pan the map to place the pin'}
          </div>
          {error && <p className="mt-2 flex items-center gap-1 text-xs font-bold text-red-600"><AlertCircle className="h-3.5 w-3.5" />{error}</p>}
          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-xl border border-bg-border px-5 py-3 text-sm font-bold text-text-secondary">Cancel</button>
            <button type="button" onClick={confirm} disabled={!readableAddress || loadingAddress} className="rounded-xl bg-primary px-5 py-3 text-sm font-black text-white shadow-sky disabled:cursor-not-allowed disabled:opacity-50">Confirm this location</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlacesAddressBlock({ title, icon, role, serviceType, value, onChange, onError, clearError, optional = false }) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const selectedRef = useRef(Boolean(visibleAddress(value) && value?.lat && value?.lng));
  const [inputVal, setInputVal] = useState(visibleAddress(value));
  const [floor, setFloor] = useState(value?.floor ?? 0);
  const [liftAvailable, setLiftAvailable] = useState(value?.liftAvailable || false);
  const [validationMsg, setValidationMsg] = useState('');
  const [isSelected, setIsSelected] = useState(Boolean(visibleAddress(value) && value?.lat && value?.lng));
  const [mapsState, setMapsState] = useState(hasUsableMapsKey ? 'loading' : 'error');
  const [locating, setLocating] = useState(false);
  const [hasBlurred, setHasBlurred] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const autoLocationAskedRef = useRef(false);

  useEffect(() => {
    const readable = visibleAddress(value);
    if (readable && readable !== inputVal) {
      setInputVal(readable);
      setIsSelected(Boolean(value?.lat && value?.lng));
      selectedRef.current = Boolean(value?.lat && value?.lng);
      return;
    }
    if (!readable && isCoordinateAddress(inputVal)) {
      setInputVal('');
      setIsSelected(false);
      selectedRef.current = false;
      onChange(null);
    }
  // Keep the visible field human-readable when saved draft data changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.address, value?.mapAddress, value?.lat, value?.lng]);

  const setInvalid = (message) => {
    if (optional && !inputVal.trim()) {
      setValidationMsg('');
      clearError?.(role);
      return;
    }
    selectedRef.current = false;
    setValidationMsg(message);
    setIsSelected(false);
    onError?.(role, message);
  };

  const acceptPlace = (place) => {
    const error = validatePlace(place, serviceType, role);
    if (error) {
      setInvalid(error);
      return;
    }

    const address = visibleAddress({ address: place.formatted_address });
    if (!address) {
      setInvalid('Google returned coordinates instead of a readable address. Please search the address manually.');
      return;
    }
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    const nextLocation = normalizeLocationPayload({ address, lat, lng, floor, liftAvailable, place });
    setInputVal(address);
    setValidationMsg('');
    setIsSelected(true);
    selectedRef.current = true;
    setHasBlurred(false);
    clearError?.(role);
    onChange(nextLocation);
  };

  const acceptMapLocation = ({ address, lat, lng, place }) => {
    const readable = visibleAddress({ address });
    if (!readable) {
      setInvalid('Please choose a readable address, not latitude/longitude.');
      return;
    }
    const nextLocation = normalizeLocationPayload({ address: readable, lat, lng, floor, liftAvailable, place, mapPicked: true });
    setInputVal(readable);
    setValidationMsg('');
    setIsSelected(true);
    selectedRef.current = true;
    setHasBlurred(false);
    clearError?.(role);
    debugMapLog('[MapPicker] input updated from map', { role, address: readable, lat, lng });
    onChange(nextLocation);
    setMapOpen(false);
  };

  useEffect(() => {
    if (!hasUsableMapsKey) {
      setMapsState('error');
      return undefined;
    }
    let attempts = 0;
    let cancelled = false;

    const initialise = () => {
      if (cancelled || autocompleteRef.current) return;
      if (!window.google?.maps?.places) {
        attempts += 1;
        if (attempts >= 40) setMapsState('error');
        return;
      }

      const options = {
        componentRestrictions: { country: 'in' },
        fields: ['formatted_address', 'geometry', 'address_components'],
        types: ['geocode'],
      };

      if (needsSurat(serviceType, role)) {
        options.bounds = new window.google.maps.LatLngBounds(
          { lat: SURAT_BOUNDS.south, lng: SURAT_BOUNDS.west },
          { lat: SURAT_BOUNDS.north, lng: SURAT_BOUNDS.east }
        );
        options.strictBounds = true;
      }

      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, options);
      autocompleteRef.current.addListener('place_changed', () => acceptPlace(autocompleteRef.current.getPlace()));
      setMapsState('ready');
    };

    initialise();
    const timer = window.setInterval(() => {
      initialise();
      if (autocompleteRef.current || attempts >= 40) window.clearInterval(timer);
    }, 250);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      if (autocompleteRef.current) window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
      autocompleteRef.current = null;
    };
  // Autocomplete must be recreated when the service rules change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceType, role]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return undefined;

    // Google decorates the input with a repeating error icon when its API key
    // is rejected. Catch that mutation and switch to a clean manual fallback.
    const observer = new MutationObserver(() => {
      const hasGoogleError = input.classList.contains('gm-err-autocomplete')
        || input.style.backgroundImage.includes('icon_error.png')
        || input.placeholder === 'Oops! Something went wrong.';
      if (hasGoogleError) {
        input.classList.remove('gm-err-autocomplete');
        input.style.removeProperty('background-image');
        input.removeAttribute('disabled');
        input.placeholder = needsSurat(serviceType, role)
          ? 'Enter a complete address in Surat'
          : 'Enter a complete drop address in India';
        setMapsState('error');
      }
    });
    observer.observe(input, { attributes: true, attributeFilter: ['class', 'style', 'disabled', 'placeholder'] });
    return () => observer.disconnect();
  }, [role, serviceType]);

  useEffect(() => {
    if (isSelected && inputVal) {
      onChange({ ...value, address: inputVal, floor, liftAvailable });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [floor, liftAvailable]);

  const requestCurrentLocation = () => {
    if (!navigator.geolocation || !window.google?.maps?.Geocoder) {
      setInvalid('Google Maps or browser location is not available.');
      return;
    }

    setLocating(true);
    getFreshCurrentPosition(
      ({ coords }) => {
        const geocoder = new window.google.maps.Geocoder();
        const origin = { lat: coords.latitude, lng: coords.longitude };
        geocoder.geocode({ location: origin, region: 'IN', language: 'en' }, (results, status) => {
          setLocating(false);
          if (status === 'OK' && results?.[0]) {
            const readablePlace = chooseReadablePlace(results, origin);
            if (readablePlace) acceptPlace({ ...readablePlace, formatted_address: readableAddressFromPlace(readablePlace) });
            else setInvalid('Could not identify a readable address. Please search it manually.');
          } else {
            setInvalid('Could not identify your current address. Please search it manually.');
          }
        });
      },
      () => {
        setLocating(false);
        setInvalid('Location permission was denied. Please allow it or search manually.');
      },
    );
  };

  useEffect(() => {
    if (role !== 'pickup' || mapsState !== 'ready' || value?.address || autoLocationAskedRef.current) return;
    autoLocationAskedRef.current = true;
    requestCurrentLocation();
  // Ask for pickup location once when Google Maps becomes ready.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapsState, role, value?.address]);

  const floorOptions = Array.from({ length: 16 }, (_, i) => ({
    value: i,
    label: i === 0 ? 'Ground Floor' : `${i}${i === 1 ? 'st' : i === 2 ? 'nd' : i === 3 ? 'rd' : 'th'} Floor`,
  }));
  const mapInitialValue = useMemo(() => value || { address: inputVal }, [inputVal, value]);

  const placeholder = needsSurat(serviceType, role)
    ? 'Search an exact address in Surat'
    : 'Search a drop address anywhere in India';

  return (
    <div className={cn('booking-location-card flex min-w-0 flex-col gap-4 rounded-2xl border-2 p-4 shadow-sm transition-colors sm:p-6',
      isSelected ? 'border-primary/30 bg-gradient-to-br from-sky-50 to-white shadow-sky-sm' : validationMsg ? 'border-red-300 bg-red-50' : 'border-sky-100 bg-white hover:border-primary/25')}>
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', isSelected ? 'bg-primary text-white' : 'bg-primary-soft')}>
          {isSelected ? <CheckCircle2 className="w-4 h-4" /> : icon}
        </div>
        <h3 className="min-w-0 flex-1 text-base font-black leading-snug text-text-primary">{title}</h3>
        {optional && !isSelected && <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold uppercase text-primary ring-1 ring-sky-100 sm:ml-auto">Optional</span>}
        {isSelected && <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase sm:ml-auto">Google verified</span>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="flex min-w-0 items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-secondary">
          <MapPin className="w-3.5 h-3.5 text-primary" /> Full Address{optional ? '' : ' *'}
          {optional && <span className="font-semibold normal-case tracking-normal text-text-tertiary">(optional)</span>}
        </label>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(event) => {
              const nextValue = isCoordinateAddress(event.target.value) ? '' : event.target.value;
              setInputVal(nextValue);
              if (optional && !nextValue.trim()) {
                selectedRef.current = false;
                setIsSelected(false);
                setValidationMsg('');
                setHasBlurred(false);
                clearError?.(role);
                onChange(null);
                return;
              }
              if (mapsState === 'error') {
                const error = validateManualAddress(nextValue, serviceType, role);
                if (!error) {
                  selectedRef.current = true;
                  setIsSelected(true);
                  setValidationMsg('');
                  clearError?.(role);
                  onChange(normalizeLocationPayload({ address: nextValue.trim(), floor, liftAvailable, manual: true }));
                  return;
                }
              }
              // A typed value is not a Google-verified place yet. Clear the old
              // coordinates silently so typing stays calm and cannot submit stale data.
              setIsSelected(false);
              selectedRef.current = false;
              setValidationMsg('');
              setHasBlurred(false);
              clearError?.(role);
              onChange(null);
            }}
            onBlur={() => {
              // Let a Google suggestion click finish before showing guidance.
              window.setTimeout(() => {
                const currentAddress = inputRef.current?.value || '';
                if (optional && !currentAddress.trim()) {
                  selectedRef.current = false;
                  setIsSelected(false);
                  setHasBlurred(false);
                  setValidationMsg('');
                  clearError?.(role);
                  onChange(null);
                  return;
                }
                if (mapsState === 'error' && currentAddress.trim()) {
                  const error = validateManualAddress(currentAddress, serviceType, role);
                  if (error) {
                    setHasBlurred(true);
                    setInvalid(error);
                  } else {
                    selectedRef.current = true;
                    setIsSelected(true);
                    setHasBlurred(false);
                    setValidationMsg('');
                    clearError?.(role);
                    onChange(normalizeLocationPayload({ address: currentAddress.trim(), floor, liftAvailable, manual: true }));
                  }
                } else if (currentAddress.trim() && !selectedRef.current) {
                  setHasBlurred(true);
                  setInvalid('Select the exact address from Google Maps suggestions.');
                }
              }, 180);
            }}
            placeholder={placeholder}
            className="booking-input text-sm pr-12 w-full"
            autoComplete="off"
          />
          {mapsState === 'loading' && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />}
          {mapsState === 'ready' && (
            <button type="button" onClick={requestCurrentLocation} disabled={locating} title="Use current location"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-primary hover:bg-primary-soft disabled:opacity-50">
              {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
            </button>
          )}
        </div>
        {mapsState === 'error' && (
          <p className="booking-location-warning mt-1 flex min-w-0 items-start gap-1 text-xs font-semibold text-amber-700">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> <span className="min-w-0">Maps autocomplete is unavailable. Enter the complete address manually.</span>
          </p>
        )}
        {validationMsg && mapsState !== 'error' && (hasBlurred || validationMsg !== 'Select the exact address from Google Maps suggestions.') && (
          <p className="booking-location-error mt-1 flex min-w-0 items-start gap-1 text-xs font-semibold text-red-600">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> <span className="min-w-0">{validationMsg}</span>
          </p>
        )}
        <p className="text-[11px] text-primary font-medium mt-0.5">
          {needsSurat(serviceType, role) ? 'Surat city locations only' : 'Drop can be anywhere within India'}
        </p>
        {mapsState !== 'error' && (
          <button type="button" onClick={() => setMapOpen(true)} className="booking-map-button mt-2 inline-flex w-fit items-center gap-2 rounded-xl border border-primary/20 bg-white px-3 py-2 text-xs font-black text-primary shadow-xs transition hover:bg-primary-soft">
            <MapIcon className="h-3.5 w-3.5" />
            Choose from map
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="flex min-w-0 items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-secondary"><Layers className="w-3.5 h-3.5 text-primary" /> Floor Level</label>
          <select value={floor} onChange={(event) => setFloor(Number(event.target.value))} className="booking-input text-sm appearance-none">
            {floorOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Service Lift</label>
          <label className="booking-input flex h-[50px] cursor-pointer select-none items-center gap-3">
            <input type="checkbox" checked={liftAvailable} onChange={(event) => setLiftAvailable(event.target.checked)} className="w-4 h-4 accent-primary" />
            <span className="text-sm font-semibold text-text-secondary">Lift Available</span>
          </label>
        </div>
      </div>
      <MapPickerModal open={mapOpen} title={title} role={role} serviceType={serviceType} initialValue={mapInitialValue} onClose={() => setMapOpen(false)} onPick={acceptMapLocation} />
    </div>
  );
}

function getGoogleRouteDistanceKM(pickup, drop) {
  return new Promise((resolve) => {
    if (!window.google?.maps?.DirectionsService || !pickup?.lat || !pickup?.lng || !drop?.lat || !drop?.lng) {
      resolve(null);
      return;
    }
    const directions = new window.google.maps.DirectionsService();
    directions.route({
      origin: { lat: Number(pickup.lat), lng: Number(pickup.lng) },
      destination: { lat: Number(drop.lat), lng: Number(drop.lng) },
      travelMode: window.google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: false,
    }, (result, status) => {
      if (status !== 'OK') {
        resolve(null);
        return;
      }
      const meters = result?.routes?.[0]?.legs?.reduce((sum, leg) => sum + (leg.distance?.value || 0), 0) || 0;
      resolve(meters ? Math.round((meters / 1000) * 10) / 10 : null);
    });
  });
}

export default function LocationStep({ onSubmit, initialData = {}, serviceType = 'local', pricingRule = null }) {
  const updateBookingData = useBookingStore((state) => state.updateBookingData);
  const [pickupData, setPickupData] = useState(initialData.pickupLocation || null);
  const [dropData, setDropData] = useState(initialData.dropLocation || null);
  const [distanceKm, setDistanceKm] = useState(initialData.distance || initialData.distanceKm || null);
  const [distanceLoading, setDistanceLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const labour = serviceType === 'labour';
  const dropOptional = labour;

  const handleError = (role, message) => setErrors((previous) => ({ ...previous, [role]: message }));
  const clearError = (role) => setErrors((previous) => {
    const next = { ...previous };
    delete next[role];
    return next;
  });

  const updatePickupData = (nextLocation) => {
    setPickupData(nextLocation);
    updateBookingData({ pickupLocation: nextLocation });
  };
  const updateDropData = (nextLocation) => {
    setDropData(nextLocation);
    updateBookingData({ dropLocation: nextLocation });
  };

  useEffect(() => {
    let cancelled = false;
    if (!pickupData?.lat || !pickupData?.lng || !dropData?.lat || !dropData?.lng) {
      setDistanceKm(null);
      return undefined;
    }
    setDistanceLoading(true);
    getGoogleRouteDistanceKM(pickupData, dropData).then((km) => {
      if (cancelled) return;
      setDistanceKm(km);
      setDistanceLoading(false);
    });
    return () => { cancelled = true; };
  }, [dropData, pickupData]);

  const handleSubmit = (extra = {}) => {
    setSubmitError('');
    if (!pickupData?.address || (!pickupData?.manual && (!pickupData?.lat || !pickupData?.lng))) return setSubmitError('Enter or select a valid pickup location.');
    if (!dropOptional && (!dropData?.address || (!dropData?.manual && (!dropData?.lat || !dropData?.lng)))) return setSubmitError('Enter or select a valid drop location.');
    if (Object.keys(errors).length) return setSubmitError('Please fix the location errors before continuing.');
    onSubmit({
      pickupLocation: pickupData,
      dropLocation: dropData?.address ? dropData : null,
      ...(distanceKm && dropData?.address ? { distance: distanceKm, distanceKm } : {}),
      ...extra,
    });
  };

  const labels = {
    local: { pickup: 'Pickup Location (Surat only)', drop: 'Drop Location (Surat only)' },
    intercity: { pickup: 'Pickup Location (Surat)', drop: 'Drop Location (Anywhere in India)' },
    labour: { pickup: 'Pickup / Work Location (Surat only)', drop: 'Drop / Work End Location (optional)' },
  }[serviceType] || { pickup: 'Pickup Location (Surat)', drop: 'Drop Location (Anywhere in India)' };
  const freeTruck = pricingRule?.labourPricing?.trucks?.find((item) => item.isFree);
  const freeEmployees = pricingRule?.labourPricing?.employeeRates?.filter((item) => item.isFree).sort((a, b) => Number(b.employees) - Number(a.employees))[0];
  const freeHours = pricingRule?.labourPricing?.hourlyRates?.filter((item) => item.isFree).sort((a, b) => Number(b.hours) - Number(a.hours))[0];

  return (
    <div className="flex min-w-0 flex-col gap-6 text-left">
      <div className="flex flex-col gap-1">
        <h3 className="text-2xl font-black text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>Pickup &amp; Drop Locations</h3>
        <p className="text-sm text-text-secondary font-medium">Search and select an exact Google Maps address, or use your current location.</p>
      </div>
      <PlacesAddressBlock title={labels.pickup} icon={<MapPin className="w-4 h-4 text-primary" />} role="pickup" serviceType={serviceType}
        value={pickupData} onChange={updatePickupData} onError={handleError} clearError={clearError} />
      <div className="flex items-center gap-3"><div className="flex-1 h-px bg-bg-border" /><ArrowRight className="w-4 h-4 text-primary" /><div className="flex-1 h-px bg-bg-border" /></div>
      <PlacesAddressBlock title={labels.drop} icon={<Building2 className="w-4 h-4 text-primary" />} role="drop" serviceType={serviceType}
        value={dropData} onChange={updateDropData} onError={handleError} clearError={clearError} optional={dropOptional} />
      {(distanceLoading || distanceKm) && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-primary/15 bg-sky-50 px-4 py-3 text-sm font-bold text-primary">
          <span>{distanceLoading ? 'Calculating route distance from Google Maps...' : 'Google route distance'}</span>
          <span>{distanceLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : `${distanceKm} km`}</span>
        </div>
      )}
      {labour && pricingRule && (
        <div className="booking-base-package rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wider text-emerald-700">Base package includes</p>
          <p className="mt-1 text-sm font-semibold text-text-secondary">Use this package directly, or customize truck, employees, and hours in the next steps.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <BaseChip icon={Truck} label="Truck" value={freeTruck ? `${freeTruck.name}${freeTruck.capacityKg ? ` - ${freeTruck.capacityKg} kg` : ''}` : 'Not set'} />
            <BaseChip icon={Users} label="Employees" value={freeEmployees ? `${freeEmployees.employees} employee(s)` : 'Not set'} />
            <BaseChip icon={Clock} label="Hours" value={freeHours ? `${freeHours.hours} hour(s)` : 'Not set'} />
          </div>
          {(freeTruck || freeEmployees || freeHours) && (
            <button type="button" onClick={() => handleSubmit({ useBasePackage: true, selectedTruck: freeTruck?.key || freeTruck?.id || null, truckType: freeTruck?.key || freeTruck?.id || null, employeeCount: Number(freeEmployees?.employees || 1), employeeRatePrice: 0, hoursCount: Number(freeHours?.hours || 1), hourlyRatePerEmployee: 0 })} className="mt-4 w-full rounded-2xl bg-emerald-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-700">Continue With Base Package</button>
          )}
        </div>
      )}
      {submitError && <div className="booking-submit-error flex items-center gap-2 p-4 bg-red-50 rounded-xl border border-red-200 text-sm font-semibold text-red-700"><AlertCircle className="w-4 h-4" />{submitError}</div>}
      <div className="booking-location-note rounded-2xl border border-primary/15 bg-gradient-to-r from-sky-50 to-white p-4 text-xs font-bold leading-5 text-primary shadow-xs">
        {labour ? 'Pickup/work location is required. Drop/work-end location is optional for Labour & Vehicle bookings.' : serviceType === 'intercity' ? 'Pickup must be in Surat; drop can be anywhere in India.' : 'This service supports Surat pickup and Surat drop only.'}
      </div>
      <BookingActionBar onBack={undefined} onNext={() => handleSubmit()} nextLabel={labour ? 'Customize Package' : 'Next Step'} />
    </div>
  );
}

export { LocationStep };

function BaseChip({ icon: Icon, label, value }) {
  return <div className="booking-base-chip flex items-start gap-3 rounded-2xl bg-white px-3 py-3 ring-1 ring-emerald-100"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700"><Icon className="h-4.5 w-4.5" /></span><span><span className="block text-[10px] font-black uppercase tracking-wide text-emerald-600">{label}</span><span className="mt-0.5 block text-sm font-bold text-text-primary">{value}</span></span></div>;
}
