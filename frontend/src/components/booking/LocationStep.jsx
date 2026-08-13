'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, ArrowRight, Building2, CheckCircle2, Clock, Crosshair, Layers, Loader2, Map as MapIcon, MapPin, Truck, Users, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const SURAT_BOUNDS = { north: 21.35, south: 20.97, east: 73.08, west: 72.65 };
const configuredMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
const hasUsableMapsKey = Boolean(configuredMapsKey && !configuredMapsKey.includes('PLACEHOLDER'));

const SURAT_CENTER = { lat: 21.1702, lng: 72.8311 };
const needsSurat = (serviceType, role) => serviceType === 'local' || serviceType === 'labour' || role === 'pickup';

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
  const formatted = cleanReadableAddress(stripPlusCodePrefix(place.formatted_address));
  if (formatted) return formatted;
  const composed = cleanReadableAddress(composeAddressFromComponents(place));
  if (composed) return composed;
  const compoundCode = cleanReadableAddress(stripPlusCodePrefix(place.plus_code?.compound_code));
  return compoundCode;
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

function chooseReadablePlace(results = []) {
  return [...results]
    .filter((place) => readableAddressFromPlace(place))
    .sort((a, b) => placeRank(a) - placeRank(b))[0] || null;
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
  const markerRef = useRef(null);
  const geocodeRequestRef = useRef(0);
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

  useEffect(() => {
    if (!open) return undefined;
    let attempts = 0;
    let cancelled = false;
    setSelected(initialLatLng || SURAT_CENTER);
    setAddress(initialReadableAddress);
    setPlaceForAddress(null);
    setError('');

    const fallbackToNearbyPlace = (latLng, sourceStatus, requestId) => {
      const places = window.google?.maps?.places;
      const map = mapInstanceRef.current;
      if (!places?.PlacesService || !map) {
        console.info('[MapPicker] places fallback unavailable', { sourceStatus, latLng });
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
        console.info('[MapPicker] places nearby result', {
          sourceStatus,
          status: nearbyStatus,
          latLng,
          resultCount: nearbyResults?.length || 0,
          firstPlace: nearbyResults?.[0]?.name || '',
        });

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
          console.info('[MapPicker] places details result', {
            sourceStatus,
            status: detailsStatus,
            latLng,
            address: detailsAddress,
          });

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
        setError('Google Maps geocoder is not available yet. Please try again.');
        return;
      }
      setLoadingAddress(true);
      const requestId = geocodeRequestRef.current + 1;
      geocodeRequestRef.current = requestId;
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: latLng, region: 'IN', language: 'en' }, (results, status) => {
        if (cancelled || requestId !== geocodeRequestRef.current) return;
        const readablePlace = status === 'OK' ? chooseReadablePlace(results) : null;
        const readable = readableAddressFromPlace(readablePlace);
        console.info('[MapPicker] reverse geocode result', {
          status,
          latLng,
          rawResultCount: results?.length || 0,
          firstFormattedAddress: results?.[0]?.formatted_address || '',
          address: readable,
        });
        if (readablePlace && readable) {
          setLoadingAddress(false);
          setAddress(readable);
          setPlaceForAddress({ ...readablePlace, formatted_address: readable });
        } else {
          fallbackToNearbyPlace(latLng, status, requestId);
        }
      });
    };

    const centerFromTypedArea = (map, marker) => {
      const typedAddress = String(initialReadableAddress).trim();
      if (!typedAddress || initialLatLng || !window.google?.maps?.Geocoder) return;
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: typedAddress, componentRestrictions: { country: 'IN' } }, (results, status) => {
        if (cancelled || status !== 'OK' || !results?.[0]) return;
        const readablePlace = chooseReadablePlace(results);
        if (!readablePlace) return;
        const location = readablePlace.geometry.location;
        const latLng = toLatLngLiteral(location);
        const readable = readableAddressFromPlace(readablePlace);
        if (!latLng || !readable) return;
        setSelected(latLng);
        setAddress(readable);
        setPlaceForAddress(readablePlace);
        marker.setPosition(latLng);
        map.setCenter(latLng);
        map.setZoom(needsSurat(serviceType, role) ? 15 : 12);
      });
    };

    const initialise = () => {
      if (cancelled || mapInstanceRef.current || !mapRef.current) return;
      if (!window.google?.maps?.Map) {
        attempts += 1;
        if (attempts >= 40) setError('Google Maps is taking too long to load. Please check the Maps API key or internet connection.');
        return;
      }

      const start = initialLatLng || SURAT_CENTER;
      const map = new window.google.maps.Map(mapRef.current, {
        center: start,
        zoom: needsSurat(serviceType, role) ? 14 : 7,
        mapTypeId: 'roadmap',
        streetViewControl: false,
        fullscreenControl: true,
        mapTypeControl: true,
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
      const marker = new window.google.maps.Marker({
        position: start,
        map,
        draggable: true,
        title: title || 'Selected location',
      });

      const updateSelection = (location) => {
        const latLng = toLatLngLiteral(location);
        if (!latLng) return;
        console.info('[MapPicker] selected coordinates', latLng);
        setSelected(latLng);
        marker.setPosition(latLng);
        reverseGeocode(latLng);
      };

      map.addListener('click', (event) => updateSelection(event.latLng));
      marker.addListener('dragend', (event) => updateSelection(event.latLng));
      mapInstanceRef.current = map;
      markerRef.current = marker;
      window.setTimeout(() => {
        window.google?.maps?.event?.trigger(map, 'resize');
        map.setCenter(start);
      }, 0);
      reverseGeocode(start);
      centerFromTypedArea(map, marker);
    };

    initialise();
    const timer = window.setInterval(() => {
      initialise();
      if (mapInstanceRef.current || attempts > 40) window.clearInterval(timer);
    }, 250);

    return () => {
      cancelled = true;
      geocodeRequestRef.current += 1;
      window.clearInterval(timer);
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, [initialLatLng, initialReadableAddress, open, role, serviceType, title]);

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
    console.info('[MapPicker] use this location', { address: readable, lat: selected.lat, lng: selected.lng });
    onPick({ address: readable, lat: selected.lat, lng: selected.lng, place: placeForAddress });
  };
  const readableAddress = cleanReadableAddress(address);

  return (
    <div className="fixed inset-0 z-[2147483000] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl border border-bg-border bg-bg-white shadow-2xl sm:h-[82vh] sm:rounded-3xl">
        <div className="flex items-start justify-between gap-3 border-b border-bg-border p-4 sm:p-5">
          <div>
            <h3 className="text-base font-black text-text-primary">{title || 'Choose location from map'}</h3>
            <p className="mt-1 text-xs font-semibold text-text-secondary">Map opens in default road view. Tap map or drag marker for exact home location.</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-bg-border text-text-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div ref={mapRef} className="h-[54vh] min-h-[320px] flex-1 bg-bg-section sm:min-h-[380px]" />
        <div className="border-t border-bg-border p-4 sm:p-5">
          <div className="rounded-2xl bg-bg-section p-3 text-sm font-semibold text-text-secondary">
            {loadingAddress ? 'Finding address...' : readableAddress ? `Selected: ${readableAddress}` : 'Pick a point on the map'}
          </div>
          {error && <p className="mt-2 flex items-center gap-1 text-xs font-bold text-red-600"><AlertCircle className="h-3.5 w-3.5" />{error}</p>}
          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-xl border border-bg-border px-5 py-3 text-sm font-bold text-text-secondary">Cancel</button>
            <button type="button" onClick={confirm} disabled={!readableAddress || loadingAddress} className="rounded-xl bg-primary px-5 py-3 text-sm font-black text-white shadow-sky disabled:cursor-not-allowed disabled:opacity-50">Use This Location</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlacesAddressBlock({ title, icon, role, serviceType, value, onChange, onError, clearError }) {
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
    console.info('[MapPicker] input updated from map', { role, address: readable, lat, lng });
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
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat: coords.latitude, lng: coords.longitude } }, (results, status) => {
          setLocating(false);
          if (status === 'OK' && results?.[0]) {
            const readablePlace = chooseReadablePlace(results);
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
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
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
    <div className={cn('flex flex-col gap-4 p-6 rounded-2xl border-2 transition-colors',
      isSelected ? 'bg-sky-50 border-primary/30' : validationMsg ? 'bg-red-50 border-red-300' : 'bg-bg-section border-bg-border')}>
      <div className="flex items-center gap-2">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', isSelected ? 'bg-primary text-white' : 'bg-primary-soft')}>
          {isSelected ? <CheckCircle2 className="w-4 h-4" /> : icon}
        </div>
        <h3 className="text-base font-black text-text-primary">{title}</h3>
        {isSelected && <span className="ml-auto text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase">Google verified</span>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-primary" /> Full Address *
        </label>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(event) => {
              const nextValue = isCoordinateAddress(event.target.value) ? '' : event.target.value;
              setInputVal(nextValue);
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
          <p className="text-xs text-amber-700 font-semibold flex items-center gap-1 mt-1">
            <AlertCircle className="w-3.5 h-3.5" /> Maps autocomplete is unavailable. Enter the complete address manually.
          </p>
        )}
        {validationMsg && mapsState !== 'error' && (hasBlurred || validationMsg !== 'Select the exact address from Google Maps suggestions.') && (
          <p className="text-xs text-red-600 font-semibold flex items-center gap-1 mt-1">
            <AlertCircle className="w-3.5 h-3.5" /> {validationMsg}
          </p>
        )}
        <p className="text-[11px] text-primary font-medium mt-0.5">
          {needsSurat(serviceType, role) ? 'Surat city locations only' : 'Drop can be anywhere within India'}
        </p>
        {mapsState !== 'error' && (
          <button type="button" onClick={() => setMapOpen(true)} className="mt-2 inline-flex w-fit items-center gap-2 rounded-xl border border-primary/20 bg-white px-3 py-2 text-xs font-black text-primary shadow-xs transition hover:bg-primary-soft">
            <MapIcon className="h-3.5 w-3.5" />
            Choose from map
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-primary" /> Floor Level</label>
          <select value={floor} onChange={(event) => setFloor(Number(event.target.value))} className="booking-input text-sm appearance-none">
            {floorOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Service Lift</label>
          <label className="booking-input flex items-center gap-3 cursor-pointer select-none h-[50px]">
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
  const [pickupData, setPickupData] = useState(initialData.pickupLocation || null);
  const [dropData, setDropData] = useState(initialData.dropLocation || null);
  const [distanceKm, setDistanceKm] = useState(initialData.distance || initialData.distanceKm || null);
  const [distanceLoading, setDistanceLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const handleError = (role, message) => setErrors((previous) => ({ ...previous, [role]: message }));
  const clearError = (role) => setErrors((previous) => {
    const next = { ...previous };
    delete next[role];
    return next;
  });

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
    if (!dropData?.address || (!dropData?.manual && (!dropData?.lat || !dropData?.lng))) return setSubmitError('Enter or select a valid drop location.');
    if (Object.keys(errors).length) return setSubmitError('Please fix the location errors before continuing.');
    onSubmit({ pickupLocation: pickupData, dropLocation: dropData, ...(distanceKm ? { distance: distanceKm, distanceKm } : {}), ...extra });
  };

  const labels = {
    local: { pickup: 'Pickup Location (Surat only)', drop: 'Drop Location (Surat only)' },
    intercity: { pickup: 'Pickup Location (Surat)', drop: 'Drop Location (Anywhere in India)' },
    labour: { pickup: 'Pickup / Work Location (Surat only)', drop: 'Drop / Work End Location (Surat only)' },
  }[serviceType] || { pickup: 'Pickup Location (Surat)', drop: 'Drop Location (Anywhere in India)' };
  const labour = serviceType === 'labour';
  const freeTruck = pricingRule?.labourPricing?.trucks?.find((item) => item.isFree);
  const freeEmployees = pricingRule?.labourPricing?.employeeRates?.filter((item) => item.isFree).sort((a, b) => Number(b.employees) - Number(a.employees))[0];
  const freeHours = pricingRule?.labourPricing?.hourlyRates?.filter((item) => item.isFree).sort((a, b) => Number(b.hours) - Number(a.hours))[0];

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex flex-col gap-1">
        <h3 className="text-2xl font-black text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>Pickup &amp; Drop Locations</h3>
        <p className="text-sm text-text-secondary font-medium">Search and select an exact Google Maps address, or use your current location.</p>
      </div>
      <PlacesAddressBlock title={labels.pickup} icon={<MapPin className="w-4 h-4 text-primary" />} role="pickup" serviceType={serviceType}
        value={pickupData} onChange={setPickupData} onError={handleError} clearError={clearError} />
      <div className="flex items-center gap-3"><div className="flex-1 h-px bg-bg-border" /><ArrowRight className="w-4 h-4 text-primary" /><div className="flex-1 h-px bg-bg-border" /></div>
      <PlacesAddressBlock title={labels.drop} icon={<Building2 className="w-4 h-4 text-primary" />} role="drop" serviceType={serviceType}
        value={dropData} onChange={setDropData} onError={handleError} clearError={clearError} />
      {(distanceLoading || distanceKm) && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-primary/15 bg-sky-50 px-4 py-3 text-sm font-bold text-primary">
          <span>{distanceLoading ? 'Calculating route distance from Google Maps...' : 'Google route distance'}</span>
          <span>{distanceLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : `${distanceKm} km`}</span>
        </div>
      )}
      {labour && pricingRule && (
        <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
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
      {submitError && <div className="flex items-center gap-2 p-4 bg-red-50 rounded-xl border border-red-200 text-sm font-semibold text-red-700"><AlertCircle className="w-4 h-4" />{submitError}</div>}
      <div className="p-4 bg-sky-50 rounded-xl border border-primary/15 text-xs font-bold text-primary">
        {serviceType === 'intercity' ? 'Pickup must be in Surat; drop can be anywhere in India.' : 'This service supports Surat pickup and Surat drop only.'}
      </div>
      <div className="flex flex-col gap-3 border-t border-bg-border pt-4 sm:flex-row sm:justify-end">
        <button type="button" onClick={() => handleSubmit()} className="btn-sky px-7 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 text-sm">{labour ? 'Customize Package' : 'Next Step'} <ArrowRight className="w-4 h-4" /></button>
      </div>
    </div>
  );
}

export { LocationStep };

function BaseChip({ icon: Icon, label, value }) {
  return <div className="flex items-start gap-3 rounded-2xl bg-white px-3 py-3 ring-1 ring-emerald-100"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700"><Icon className="h-4.5 w-4.5" /></span><span><span className="block text-[10px] font-black uppercase tracking-wide text-emerald-600">{label}</span><span className="mt-0.5 block text-sm font-bold text-text-primary">{value}</span></span></div>;
}
