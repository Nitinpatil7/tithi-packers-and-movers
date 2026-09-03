'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Globe2, Map as MapIcon, MapPin, Navigation2, Star, UserRound, X } from 'lucide-react';
import { usePublicTestimonials } from '@tithi/hooks/useTestimonials';

const SURAT_HUB = { name: 'Surat Hub', lat: 21.1702, lng: 72.8311 };

const PLACES = {
  surat: { mode: 'surat', state: 'Gujarat', lat: 21.1702, lng: 72.8311 },
  adajan: { mode: 'surat', state: 'Gujarat', lat: 21.1927, lng: 72.7933 },
  pal: { mode: 'surat', state: 'Gujarat', lat: 21.1902, lng: 72.7686 },
  piplod: { mode: 'surat', state: 'Gujarat', lat: 21.1597, lng: 72.7704 },
  vesu: { mode: 'surat', state: 'Gujarat', lat: 21.1417, lng: 72.7709 },
  pandesara: { mode: 'surat', state: 'Gujarat', lat: 21.1455, lng: 72.8399 },
  udhna: { mode: 'surat', state: 'Gujarat', lat: 21.1707, lng: 72.8506 },
  varachha: { mode: 'surat', state: 'Gujarat', lat: 21.2169, lng: 72.8666 },
  katargam: { mode: 'surat', state: 'Gujarat', lat: 21.2304, lng: 72.8311 },
  dumas: { mode: 'surat', state: 'Gujarat', lat: 21.0883, lng: 72.7131 },
  kamrej: { mode: 'surat', state: 'Gujarat', lat: 21.2699, lng: 72.9588 },
  navsari: { mode: 'gujarat', state: 'Gujarat', lat: 20.9467, lng: 72.952 },
  vapi: { mode: 'gujarat', state: 'Gujarat', lat: 20.3893, lng: 72.9106 },
  valsad: { mode: 'gujarat', state: 'Gujarat', lat: 20.5992, lng: 72.9342 },
  bharuch: { mode: 'gujarat', state: 'Gujarat', lat: 21.7051, lng: 72.9959 },
  vadodara: { mode: 'gujarat', state: 'Gujarat', lat: 22.3072, lng: 73.1812 },
  baroda: { mode: 'gujarat', state: 'Gujarat', lat: 22.3072, lng: 73.1812 },
  ahmedabad: { mode: 'gujarat', state: 'Gujarat', lat: 23.0225, lng: 72.5714 },
  gandhinagar: { mode: 'gujarat', state: 'Gujarat', lat: 23.2156, lng: 72.6369 },
  rajkot: { mode: 'gujarat', state: 'Gujarat', lat: 22.3039, lng: 70.8022 },
  jamnagar: { mode: 'gujarat', state: 'Gujarat', lat: 22.4707, lng: 70.0577 },
  bhavnagar: { mode: 'gujarat', state: 'Gujarat', lat: 21.7645, lng: 72.1519 },
  mumbai: { mode: 'india', state: 'Maharashtra', lat: 19.076, lng: 72.8777 },
  pune: { mode: 'india', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
  delhi: { mode: 'india', state: 'Delhi', lat: 28.6139, lng: 77.209 },
  jaipur: { mode: 'india', state: 'Rajasthan', lat: 26.9124, lng: 75.7873 },
  indore: { mode: 'india', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577 },
  bengaluru: { mode: 'india', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
  bangalore: { mode: 'india', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
  hyderabad: { mode: 'india', state: 'Telangana', lat: 17.385, lng: 78.4867 },
  chennai: { mode: 'india', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
  kolkata: { mode: 'india', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
  lucknow: { mode: 'india', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462 },
  goa: { mode: 'india', state: 'Goa', lat: 15.2993, lng: 74.124 },
  kerala: { mode: 'india', state: 'Kerala', lat: 10.8505, lng: 76.2711 },
};

const BOUNDARIES = {
  surat: [
    { lat: 21.273, lng: 72.755 }, { lat: 21.262, lng: 72.832 }, { lat: 21.238, lng: 72.898 },
    { lat: 21.184, lng: 72.921 }, { lat: 21.128, lng: 72.885 }, { lat: 21.094, lng: 72.821 },
    { lat: 21.084, lng: 72.737 }, { lat: 21.14, lng: 72.691 }, { lat: 21.211, lng: 72.708 },
  ],
  gujarat: [
    { lat: 24.72, lng: 68.15 }, { lat: 24.42, lng: 70.35 }, { lat: 24.19, lng: 71.95 },
    { lat: 23.82, lng: 73.26 }, { lat: 22.75, lng: 74.35 }, { lat: 21.72, lng: 73.45 },
    { lat: 20.19, lng: 72.85 }, { lat: 20.72, lng: 71.2 }, { lat: 20.9, lng: 70.0 },
    { lat: 21.48, lng: 69.25 }, { lat: 22.05, lng: 68.95 }, { lat: 22.55, lng: 69.55 },
    { lat: 23.18, lng: 68.6 }, { lat: 23.95, lng: 68.15 },
  ],
  india: [
    { lat: 35.45, lng: 76.2 }, { lat: 32.65, lng: 79.2 }, { lat: 30.9, lng: 81.1 },
    { lat: 28.4, lng: 88.0 }, { lat: 26.7, lng: 92.2 }, { lat: 27.7, lng: 97.0 },
    { lat: 24.5, lng: 94.8 }, { lat: 22.0, lng: 91.7 }, { lat: 20.1, lng: 87.0 },
    { lat: 17.1, lng: 84.3 }, { lat: 13.1, lng: 80.2 }, { lat: 8.25, lng: 77.5 },
    { lat: 9.7, lng: 76.1 }, { lat: 12.4, lng: 74.8 }, { lat: 15.5, lng: 73.7 },
    { lat: 19.3, lng: 72.7 }, { lat: 21.7, lng: 69.7 }, { lat: 23.9, lng: 68.2 },
    { lat: 26.2, lng: 70.1 }, { lat: 28.7, lng: 72.9 }, { lat: 31.1, lng: 74.7 },
  ],
};

const META = {
  surat: {
    eyebrow: 'Surat service network',
    title: 'Trusted Across Surat',
    description: 'Surat-first coverage shown on a satellite-style city map with connected customer areas.',
    rule: 'Surat city outline is highlighted, and every visible route connects back to the Surat operations hub.',
    icon: MapPin,
    center: { lat: 21.1702, lng: 72.8311 },
    zoom: 10,
  },
  gujarat: {
    eyebrow: 'Gujarat service network',
    title: 'Growing Across Gujarat',
    description: 'When customer reviews expand outside Surat, the view opens to Gujarat.',
    rule: 'Gujarat boundary and city-to-city links show how work moves from Surat to nearby service cities.',
    icon: MapIcon,
    center: { lat: 22.2587, lng: 71.1924 },
    zoom: 6,
  },
  india: {
    eyebrow: 'Pan-India service network',
    title: 'We Move Across India',
    description: 'When reviews represent five or more states, the coverage map switches to India.',
    rule: 'Long-distance lines show state-level movement connected back to the Surat hub.',
    icon: Globe2,
    center: { lat: 22.9734, lng: 78.6569 },
    zoom: 4,
  },
};

function matchPlace(label) {
  const value = String(label || '').toLowerCase();
  const key = Object.keys(PLACES).sort((a, b) => b.length - a.length).find((place) => value.includes(place));
  return key ? { key, ...PLACES[key] } : null;
}

function inferMode(nodes) {
  const states = new Set(nodes.filter((node) => node.mode === 'india').map((node) => node.state).filter(Boolean));
  if (states.size >= 5) return 'india';
  if (nodes.some((node) => node.mode === 'gujarat' || node.mode === 'india')) return 'gujarat';
  return 'surat';
}

function buildCoverage(testimonials) {
  const groups = new Map();

  testimonials.forEach((item) => {
    const name = String(item.location || '').trim();
    if (!name) return;
    const place = matchPlace(name);
    if (!place) return;
    const groupKey = `${place.lat}:${place.lng}`;
    const current = groups.get(groupKey) || { name, locations: [], testimonials: [], ...place };
    current.locations.push(name);
    current.testimonials.push(item);
    if (!current.name) current.name = name;
    groups.set(groupKey, current);
  });

  const matched = [...groups.values()].map((node) => ({
    ...node,
    name: [...new Set(node.locations)][0] || node.name,
    locations: [...new Set(node.locations)],
  }));
  const mode = inferMode(matched);
  const nodes = matched.filter((node) => {
    if (mode === 'india') return true;
    if (mode === 'gujarat') return node.mode !== 'india';
    return node.mode === 'surat';
  });
  const locations = nodes.flatMap((node) => node.locations || [node.name]).filter(Boolean);
  return { mode, locations, nodes, represented: mode === 'india' ? new Set(nodes.map((node) => node.state)).size : nodes.length };
}

function useGoogleMapsReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const check = () => {
      if (window.google?.maps?.Map) {
        setReady(true);
        return true;
      }
      return false;
    };
    if (check()) return undefined;
    const timer = window.setInterval(check, 250);
    return () => window.clearInterval(timer);
  }, []);

  return ready;
}

function closePath(points) {
  return points.length ? [...points, points[0]] : points;
}

function getCardPlacement(point, containerRect) {
  if (!point || !containerRect) return { x: 16, y: 16, placement: 'below-right' };
  const cardWidth = Math.min(300, Math.max(230, containerRect.width - 24));
  const cardHeight = 152;
  const gap = 16;
  const padding = 12;
  const roomRight = containerRect.width - point.x;
  const roomLeft = point.x;
  const roomBelow = containerRect.height - point.y;
  const roomAbove = point.y;
  const horizontal = roomRight >= cardWidth + gap || roomRight >= roomLeft ? 'right' : 'left';
  const vertical = roomBelow >= cardHeight + gap || roomBelow >= roomAbove ? 'below' : 'above';
  const rawX = horizontal === 'right' ? point.x + gap : point.x - cardWidth - gap;
  const rawY = vertical === 'below' ? point.y + gap : point.y - cardHeight - gap;
  const maxX = Math.max(padding, containerRect.width - cardWidth - padding);
  const maxY = Math.max(padding, containerRect.height - cardHeight - padding);

  return {
    x: Math.min(Math.max(padding, rawX), maxX),
    y: Math.min(Math.max(padding, rawY), maxY),
    width: cardWidth,
    placement: `${vertical}-${horizontal}`,
  };
}

function TestimonialHoverCard({ node, position, onClose }) {
  const items = node?.testimonials || [];
  const primary = items[0];
  if (!primary || !position) return null;
  const rating = Math.max(0, Math.min(5, Number(primary.rating || 0)));

  return (
    <div
      className="pointer-events-auto absolute z-30 rounded-3xl border border-sky-100 bg-bg-white p-3 text-left text-text-primary shadow-[0_22px_60px_rgba(15,23,42,.22)] ring-1 ring-white/70 dark:border-sky-300/20 dark:bg-slate-950 dark:text-white dark:ring-sky-300/10"
      style={{ left: position.x, top: position.y, width: position.width }}
      data-placement={position.placement}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full border border-bg-border bg-bg-white text-text-secondary shadow-xs md:hidden"
        aria-label="Hide testimonial"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <div className="flex items-start gap-3 pr-7 md:pr-0">
        {primary.imageUrl ? (
          <Image
            unoptimized
            src={primary.imageUrl}
            alt={primary.name || 'Customer'}
            width={46}
            height={46}
            className="h-11 w-11 shrink-0 rounded-2xl border border-white object-cover shadow-md ring-1 ring-sky-100 dark:border-slate-800 dark:ring-sky-300/20"
          />
        ) : (
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-sky-100 bg-sky-50 text-primary shadow-md dark:border-sky-300/20 dark:bg-sky-400/10 dark:text-sky-200">
            <UserRound className="h-5 w-5" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-black">{primary.name || 'Verified customer'}</h3>
          <p className="truncate text-[11px] font-bold text-text-tertiary dark:text-slate-400">{primary.location || node.name}</p>
          <div className="mt-1 flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={`h-3.5 w-3.5 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-bg-border dark:text-slate-700'}`} />
            ))}
          </div>
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-xs font-semibold leading-5 text-text-secondary dark:text-slate-300">
        “{primary.content || primary.words || 'Reliable shifting service from Tithi Packers & Movers.'}”
      </p>
      {items.length > 1 && (
        <p className="mt-2 rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-black uppercase text-primary dark:bg-sky-400/10 dark:text-sky-200">
          +{items.length - 1} more review{items.length > 2 ? 's' : ''} here
        </p>
      )}
    </div>
  );
}

export default function RealisticCoverageMapSection() {
  const { data } = usePublicTestimonials({});
  const testimonials = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const coverage = useMemo(() => buildCoverage(testimonials), [testimonials]);
  const meta = META[coverage.mode] || META.surat;
  const Icon = meta.icon;
  const mapsReady = useGoogleMapsReady();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const overlaysRef = useRef([]);
  const mapListenersRef = useRef([]);
  const projectionOverlayRef = useRef(null);
  const activeNodeRef = useRef(null);
  const ignoreNextMapClickRef = useRef(false);
  const [activeNode, setActiveNode] = useState(null);
  const [cardPosition, setCardPosition] = useState(null);
  const nodes = useMemo(
    () => (coverage.nodes.length ? coverage.nodes : [{ ...SURAT_HUB, mode: 'surat', state: 'Gujarat' }]),
    [coverage.nodes]
  );

  const hideCard = () => {
    activeNodeRef.current = null;
    setActiveNode(null);
    setCardPosition(null);
  };

  useEffect(() => {
    if (!mapsReady || !mapRef.current || !window.google?.maps?.Map) return;

    const googleMaps = window.google.maps;
    const positionCard = (node) => {
      if (!node?.testimonials?.length || !mapRef.current || !projectionOverlayRef.current?.getProjection()) return;
      const projection = projectionOverlayRef.current.getProjection();
      const latLng = new googleMaps.LatLng(node.lat, node.lng);
      const pixel = projection.fromLatLngToContainerPixel(latLng);
      if (!pixel) return;
      const rect = mapRef.current.getBoundingClientRect();
      setCardPosition(getCardPlacement({ x: pixel.x, y: pixel.y }, rect));
    };
    const showCard = (node) => {
      if (!node?.testimonials?.length) return;
      activeNodeRef.current = node;
      setActiveNode(node);
      positionCard(node);
    };

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new googleMaps.Map(mapRef.current, {
        center: meta.center,
        zoom: meta.zoom,
        mapTypeId: googleMaps.MapTypeId.HYBRID,
        streetViewControl: false,
        fullscreenControl: true,
        mapTypeControl: true,
        mapTypeControlOptions: {
          mapTypeIds: [googleMaps.MapTypeId.HYBRID, googleMaps.MapTypeId.SATELLITE, googleMaps.MapTypeId.TERRAIN],
        },
      });
      projectionOverlayRef.current = new googleMaps.OverlayView();
      projectionOverlayRef.current.onAdd = function noop() {};
      projectionOverlayRef.current.onRemove = function noop() {};
      projectionOverlayRef.current.setMap(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;
    if (projectionOverlayRef.current) {
      projectionOverlayRef.current.draw = function draw() {
        if (activeNodeRef.current) positionCard(activeNodeRef.current);
      };
    }
    hideCard();
    map.setCenter(meta.center);
    map.setZoom(meta.zoom);
    map.setMapTypeId(googleMaps.MapTypeId.HYBRID);
    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    overlaysRef.current = [];
    mapListenersRef.current.forEach((listener) => googleMaps.event.removeListener(listener));
    mapListenersRef.current = [];

    const boundary = closePath(BOUNDARIES[coverage.mode] || BOUNDARIES.surat);
    overlaysRef.current.push(new googleMaps.Polygon({
      map,
      paths: boundary,
      strokeColor: '#ffffff',
      strokeOpacity: 0.9,
      strokeWeight: 6,
      fillColor: '#0ea5e9',
      fillOpacity: 0.08,
    }));
    overlaysRef.current.push(new googleMaps.Polyline({
      map,
      path: boundary,
      strokeOpacity: 0,
      icons: [{
        icon: { path: 'M 0,-1 0,1', strokeColor: '#ef4444', strokeOpacity: 1, scale: 2 },
        offset: '0',
        repeat: '12px',
      }],
    }));

    overlaysRef.current.push(new googleMaps.Marker({
      map,
      position: SURAT_HUB,
      title: SURAT_HUB.name,
      label: { text: 'S', color: '#ffffff', fontWeight: '800' },
    }));

    const bounds = new googleMaps.LatLngBounds();
    boundary.forEach((point) => bounds.extend(point));
    bounds.extend(SURAT_HUB);

    nodes.forEach((node) => {
      const position = { lat: node.lat, lng: node.lng };
      bounds.extend(position);
      if (node.name !== SURAT_HUB.name) {
        overlaysRef.current.push(new googleMaps.Polyline({
          map,
          path: [SURAT_HUB, position],
          geodesic: true,
          strokeColor: '#38bdf8',
          strokeOpacity: 0.95,
          strokeWeight: 4,
        }));
      }
      overlaysRef.current.push(new googleMaps.Marker({
        map,
        position,
        title: node.name,
        label: node.name === SURAT_HUB.name ? undefined : { text: node.name.slice(0, 1).toUpperCase(), color: '#ffffff', fontWeight: '800' },
      }));
      const marker = overlaysRef.current[overlaysRef.current.length - 1];
      if (node.testimonials?.length) {
        mapListenersRef.current.push(marker.addListener('mouseover', () => showCard(node)));
        mapListenersRef.current.push(marker.addListener('mouseout', () => hideCard()));
        mapListenersRef.current.push(marker.addListener('click', () => {
          ignoreNextMapClickRef.current = true;
          if (activeNodeRef.current?.name === node.name) hideCard();
          else showCard(node);
        }));
      }
    });

    mapListenersRef.current.push(map.addListener('click', () => {
      if (ignoreNextMapClickRef.current) {
        ignoreNextMapClickRef.current = false;
        return;
      }
      hideCard();
    }));
    mapListenersRef.current.push(map.addListener('idle', () => {
      if (activeNodeRef.current) positionCard(activeNodeRef.current);
    }));
    map.fitBounds(bounds, 42);
  }, [coverage.mode, mapsReady, meta, nodes]);

  useEffect(() => () => {
    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    overlaysRef.current = [];
    if (window.google?.maps?.event) {
      mapListenersRef.current.forEach((listener) => window.google.maps.event.removeListener(listener));
    }
    mapListenersRef.current = [];
    projectionOverlayRef.current?.setMap(null);
    projectionOverlayRef.current = null;
  }, []);

  return (
    <section className="relative overflow-hidden border-y border-[#232328] bg-[#0b0b0e] py-20 text-white sm:py-24">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[58rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/10 blur-[120px]" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-3 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-sky-300">
            <Navigation2 className="h-3.5 w-3.5" />
            {meta.eyebrow}
          </span>
          <h2 className="text-3xl font-bold md:text-4xl">{meta.title}</h2>
          <p className="mt-2 text-sm leading-7 text-slate-400 md:text-base">{meta.description}</p>
        </header>

        <div className="grid items-center gap-8 lg:grid-cols-12">
          <div className="order-2 flex flex-col gap-5 lg:order-1 lg:col-span-4">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.04] p-4">
              <span className="grid h-10 w-10 place-items-center rounded-xl border border-sky-400/25 text-sky-400">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-100">Surat Shifting Hub</p>
                <p className="text-xs text-slate-400">Routes connected from reviews</p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[.04] p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Map logic</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">{meta.rule}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[.04] p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Mapped</p>
                <p className="mt-1 text-2xl font-black text-white">{coverage.represented || 1}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[.04] p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">View</p>
                <p className="mt-1 text-2xl font-black capitalize text-white">{coverage.mode}</p>
              </div>
            </div>
            <div className="space-y-2 text-xs font-bold text-slate-400">
              <p className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-sky-400" />Sky blue lines show connected service routes.</p>
              <p className="flex items-center gap-2"><span className="h-2.5 w-6 border-t-2 border-dashed border-red-400" />Red dashed boundary shows Surat, Gujarat, or India outline.</p>
            </div>
          </div>

          <div className="order-1 lg:order-2 lg:col-span-8">
            <div className="relative mx-auto overflow-hidden rounded-3xl border border-white/10 bg-[#111114]/90 p-3 shadow-[0_25px_70px_rgba(0,0,0,.35)] sm:p-4">
              <div className="relative h-[360px] w-full overflow-hidden rounded-2xl bg-slate-950 sm:h-[430px] lg:h-[520px]">
                <div ref={mapRef} className="absolute inset-0" />
                {!mapsReady && (
                  <div className="absolute inset-0 grid place-items-center text-sm font-bold text-slate-300">
                    Loading satellite coverage map...
                  </div>
                )}
                <TestimonialHoverCard node={activeNode} position={cardPosition} onClose={hideCard} />
              </div>
              <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4 text-xs font-bold text-slate-400 sm:flex-row sm:justify-between">
                <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-sky-500" />Google Maps hybrid view</span>
                <span>{coverage.represented || 1} mapped {coverage.mode === 'india' ? 'states' : coverage.mode === 'gujarat' ? 'cities' : 'locations'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
