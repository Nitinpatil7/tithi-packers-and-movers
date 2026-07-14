'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Globe2, Map, MapPin, Navigation2 } from 'lucide-react';
import { usePublicTestimonials } from '@/hooks/useTestimonials';

const PLACES = {
  surat: { mode: 'surat', x: 226, y: 206 }, adajan: { mode: 'surat', x: 151, y: 165 }, afajan: { mode: 'surat', x: 151, y: 165 }, pandesara: { mode: 'surat', x: 222, y: 278 }, piplod: { mode: 'surat', x: 150, y: 232 }, vesu: { mode: 'surat', x: 172, y: 261 }, varachha: { mode: 'surat', x: 310, y: 142 }, katargam: { mode: 'surat', x: 232, y: 117 }, udhna: { mode: 'surat', x: 237, y: 246 }, pal: { mode: 'surat', x: 129, y: 190 }, dumas: { mode: 'surat', x: 105, y: 286 },
  ahmedabad: { mode: 'gujarat', x: 235, y: 115 }, gandhinagar: { mode: 'gujarat', x: 244, y: 88 }, vadodara: { mode: 'gujarat', x: 248, y: 190 }, bharuch: { mode: 'gujarat', x: 218, y: 235 }, rajkot: { mode: 'gujarat', x: 120, y: 157 }, jamnagar: { mode: 'gujarat', x: 83, y: 126 }, bhavnagar: { mode: 'gujarat', x: 165, y: 210 }, navsari: { mode: 'gujarat', x: 190, y: 288 }, vapi: { mode: 'gujarat', x: 196, y: 327 }, valsad: { mode: 'gujarat', x: 193, y: 309 }, anand: { mode: 'gujarat', x: 235, y: 164 }, mehsana: { mode: 'gujarat', x: 211, y: 72 }, junagadh: { mode: 'gujarat', x: 105, y: 220 },
  mumbai: { mode: 'india', state: 'Maharashtra', x: 158, y: 252 }, pune: { mode: 'india', state: 'Maharashtra', x: 174, y: 269 }, maharashtra: { mode: 'india', state: 'Maharashtra', x: 184, y: 242 }, delhi: { mode: 'india', state: 'Delhi', x: 213, y: 91 }, jaipur: { mode: 'india', state: 'Rajasthan', x: 174, y: 126 }, rajasthan: { mode: 'india', state: 'Rajasthan', x: 158, y: 145 }, indore: { mode: 'india', state: 'Madhya Pradesh', x: 205, y: 191 }, 'madhya pradesh': { mode: 'india', state: 'Madhya Pradesh', x: 229, y: 188 }, bengaluru: { mode: 'india', state: 'Karnataka', x: 215, y: 321 }, bangalore: { mode: 'india', state: 'Karnataka', x: 215, y: 321 }, karnataka: { mode: 'india', state: 'Karnataka', x: 198, y: 303 }, hyderabad: { mode: 'india', state: 'Telangana', x: 245, y: 267 }, telangana: { mode: 'india', state: 'Telangana', x: 247, y: 251 }, chennai: { mode: 'india', state: 'Tamil Nadu', x: 256, y: 335 }, 'tamil nadu': { mode: 'india', state: 'Tamil Nadu', x: 240, y: 345 }, kolkata: { mode: 'india', state: 'West Bengal', x: 338, y: 201 }, 'west bengal': { mode: 'india', state: 'West Bengal', x: 334, y: 184 }, lucknow: { mode: 'india', state: 'Uttar Pradesh', x: 263, y: 132 }, 'uttar pradesh': { mode: 'india', state: 'Uttar Pradesh', x: 265, y: 145 }, goa: { mode: 'india', state: 'Goa', x: 178, y: 300 }, kerala: { mode: 'india', state: 'Kerala', x: 211, y: 354 }, odisha: { mode: 'india', state: 'Odisha', x: 309, y: 228 }, punjab: { mode: 'india', state: 'Punjab', x: 197, y: 61 }, bihar: { mode: 'india', state: 'Bihar', x: 309, y: 157 }, assam: { mode: 'india', state: 'Assam', x: 387, y: 135 },
};

const MAPS = {
  surat: { eyebrow: 'Surat service network', title: 'Trusted Across Surat', description: 'Every point below comes from a published customer review in Surat.', rule: 'Live neighbourhood coverage from real customer locations.', icon: MapPin, hub: { name: 'Surat Hub', x: 207, y: 207 }, outline: 'M91 113 Q136 68 215 65 Q293 61 353 111 L366 168 Q351 218 321 267 Q272 316 199 326 Q126 315 82 270 Q57 222 70 168Z', details: ['M82 168 Q154 174 226 206 T354 180','M126 82 Q159 151 151 232 T182 316','M274 72 Q264 142 310 206 T287 292','M73 247 Q155 225 238 246 T339 251'] },
  gujarat: { eyebrow: 'Gujarat service network', title: 'Growing Across Gujarat', description: 'Five or more represented Gujarat cities automatically expand this view statewide.', rule: 'City-to-city routes connected to the Surat operations hub.', icon: Map, hub: { name: 'Surat Hub', x: 198, y: 273 }, outline: 'M92 57 L192 48 L266 62 L335 114 L310 169 L276 191 L262 239 L229 265 L215 345 L164 354 L142 303 L101 275 L69 219 L78 162 L55 126Z', details: ['M80 110 L156 129 L213 97 L292 102','M72 189 L145 176 L210 202 L291 178','M109 273 L173 235 L234 268','M158 53 L151 129 L174 190 L164 271','M234 65 L215 132 L245 196 L228 257'] },
  india: { eyebrow: 'Pan-India service network', title: 'We Move Across India', description: 'Five or more represented states automatically reveal the all-India network.', rule: 'Long-distance customer routes connected from our Surat hub.', icon: Globe2, hub: { name: 'Surat Hub', x: 154, y: 215 }, outline: 'M157 28 L207 42 L220 79 L247 102 L286 115 L311 98 L350 122 L401 111 L387 145 L356 162 L365 201 L337 224 L292 223 L270 262 L251 314 L230 367 L205 348 L192 300 L166 264 L145 224 L119 201 L104 161 L77 128 L111 103 L123 62Z', details: ['M113 104 L191 105 L247 102','M101 158 L168 149 L231 165 L356 162','M120 203 L194 195 L270 213 L337 224','M154 247 L219 239 L270 262','M190 44 L181 105 L192 174 L183 244','M247 102 L231 165 L243 229 L230 300'] },
};

function matchPlace(label) {
  const value = label.toLowerCase();
  const key = Object.keys(PLACES).sort((a, b) => b.length - a.length).find((place) => value.includes(place));
  return key ? PLACES[key] : null;
}

function buildCoverage(testimonials) {
  const locations = [...new Set(testimonials.map((item) => String(item.location || '').trim()).filter(Boolean))];
  const matched = locations.map((name) => ({ name, place: matchPlace(name) }));
  const states = new Set(matched.map(({ place }) => place?.state).filter(Boolean));
  const gujaratCities = new Set(matched.filter(({ place }) => place?.mode === 'gujarat').map(({ name }) => name.toLowerCase()));
  const mode = states.size >= 5 ? 'india' : gujaratCities.size >= 5 ? 'gujarat' : 'surat';
  const nodes = matched.filter(({ place }) => place && (mode === 'india' ? place.state : place.mode === mode)).map(({ name, place }) => ({ name, x: place.x, y: place.y }));
  return { mode, locations, nodes, represented: mode === 'india' ? states.size : mode === 'gujarat' ? gujaratCities.size : nodes.length };
}

export default function CoverageMapSection() {
  const { data } = usePublicTestimonials({});
  const testimonials = useMemo(() => Array.isArray(data) ? data : [], [data]);
  const coverage = useMemo(() => buildCoverage(testimonials), [testimonials]);
  const map = MAPS[coverage.mode];
  const Icon = map.icon;
  const nodes = coverage.nodes.length ? coverage.nodes : [{ name: 'Surat', x: map.hub.x, y: map.hub.y }];

  return (
    <section className="relative overflow-hidden border-y border-sky-100 bg-gradient-to-b from-white via-sky-50/40 to-white py-20 text-text-primary sm:py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300 to-transparent" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mx-auto mb-10 flex max-w-2xl flex-col items-center gap-3 text-center sm:mb-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-primary shadow-sm">
            <Navigation2 className="h-3.5 w-3.5" />
            {map.eyebrow}
          </span>
          <h2 className="text-3xl font-black text-text-primary md:text-4xl">{map.title}</h2>
          <p className="mt-1 text-sm font-medium leading-7 text-text-secondary md:text-base">{map.description}</p>
        </header>

        <div className="grid items-center gap-8 lg:grid-cols-12">
          <div className="order-2 flex flex-col gap-4 lg:order-1 lg:col-span-4">
            <div className="rounded-3xl border border-sky-100 bg-white p-5 shadow-[0_18px_50px_rgba(14,165,233,.10)]">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-black text-text-primary">Surat Shifting Hub</p>
                  <p className="text-xs font-semibold text-text-tertiary">Connected from customer reviews</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-sky-50 p-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-primary">Mapped</p>
                  <p className="mt-1 text-xl font-black text-text-primary">{coverage.represented || 1}</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Network</p>
                  <p className="mt-1 text-xl font-black capitalize text-text-primary">{coverage.mode}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-widest text-primary">How to read this map</p>
              <p className="mt-3 text-sm font-semibold leading-7 text-text-secondary">{map.rule}</p>
              <div className="mt-4 space-y-2 text-xs font-bold text-text-tertiary">
                <p className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-primary" />Blue point is the Surat operations hub.</p>
                <p className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-violet-500" />Purple points are serviced customer areas.</p>
                <p className="flex items-center gap-2"><span className="h-2.5 w-7 rounded-full bg-gradient-to-r from-sky-400 to-violet-500" />Highlighted lines show connected routes.</p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 lg:col-span-8">
            <div className="relative mx-auto max-w-3xl overflow-hidden rounded-[1.75rem] border border-sky-100 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,.12)] sm:p-6">
              <div className="absolute inset-4 rounded-[1.35rem] bg-[radial-gradient(circle_at_50%_45%,rgba(14,165,233,.12),transparent_40%)]" />
              <svg viewBox="0 0 450 390" className="relative h-auto w-full" fill="none" role="img" aria-label={`${map.title} customer coverage map`}>
                <defs>
                  <linearGradient id="mapFill" x1="0" y1="0" x2="1" y2="1">
                    <stop stopColor="#f8fbff" />
                    <stop offset="1" stopColor="#e8f4ff" />
                  </linearGradient>
                  <linearGradient id="route" x1="0" y1="0" x2="1" y2="1">
                    <stop stopColor="#0EA5E9" />
                    <stop offset="1" stopColor="#7C3AED" />
                  </linearGradient>
                  <filter id="routeGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <path d={map.outline} fill="url(#mapFill)" stroke="#bae6fd" strokeWidth="2.4" />
                {map.details.map((path, index) => <path key={index} d={path} stroke="#cbd5e1" strokeWidth="1.1" opacity=".85" />)}
                {nodes.map((node) => (
                  <path key={`route-shadow-${node.name}`} d={`M ${map.hub.x} ${map.hub.y} Q ${(map.hub.x + node.x) / 2} ${(map.hub.y + node.y) / 2 - 24} ${node.x} ${node.y}`} stroke="#bae6fd" strokeWidth="7" strokeLinecap="round" opacity=".55" />
                ))}
                {nodes.map((node) => (
                  <motion.path key={`route-${node.name}`} d={`M ${map.hub.x} ${map.hub.y} Q ${(map.hub.x + node.x) / 2} ${(map.hub.y + node.y) / 2 - 24} ${node.x} ${node.y}`} stroke="url(#route)" strokeWidth="2.8" strokeLinecap="round" filter="url(#routeGlow)" initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.15 }} />
                ))}
                <motion.circle cx={map.hub.x} cy={map.hub.y} r="16" fill="#0EA5E9" animate={{ r: [10, 22, 10], opacity: [.24, .05, .24] }} transition={{ duration: 2.4, repeat: Infinity }} />
                {nodes.map((node, index) => (
                  <g key={node.name}>
                    <circle cx={node.x} cy={node.y} r="7" fill="#7C3AED" stroke="#fff" strokeWidth="2.2" />
                    <circle cx={node.x} cy={node.y} r="11" fill="#7C3AED" opacity=".12" />
                    <text x={node.x + (index % 2 ? -9 : 9)} y={node.y - 11} fill="#334155" fontSize="10" fontWeight="800" textAnchor={index % 2 ? 'end' : 'start'}>{node.name}</text>
                  </g>
                ))}
                <circle cx={map.hub.x} cy={map.hub.y} r="7" fill="#0EA5E9" stroke="#fff" strokeWidth="2.2" />
                <text x={map.hub.x + 10} y={map.hub.y + 18} fill="#0369a1" fontSize="11" fontWeight="900">Surat hub</text>
              </svg>
              <div className="relative flex flex-col gap-2 border-t border-sky-100 pt-4 text-xs font-black text-text-secondary sm:flex-row sm:items-center sm:justify-between">
                <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-primary" />Connected customer network</span>
                <span>{coverage.represented || 1} mapped {coverage.mode === 'india' ? 'states' : coverage.mode === 'gujarat' ? 'cities' : 'locations'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
