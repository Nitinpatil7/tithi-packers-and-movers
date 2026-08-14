export const FALLBACK_TRUCK_IMAGE = 'data:image/svg+xml;utf8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"%3E%3Crect width="640" height="360" rx="36" fill="%23f0f9ff"/%3E%3Cg fill="none" stroke="%230ea5e9" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"%3E%3Cpath d="M86 222h44m70 0h178m72 0h92"/%3E%3Cpath d="M132 119h245v103H132z"/%3E%3Cpath d="M377 153h72l57 69H377z"/%3E%3Ccircle cx="173" cy="242" r="34" fill="%23fff"/%3E%3Ccircle cx="419" cy="242" r="34" fill="%23fff"/%3E%3Cpath d="M170 154h164M170 187h118"/%3E%3C/g%3E%3Ctext x="320" y="312" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="%230f172a"%3ETITHI PACKERS%3C/text%3E%3C/svg%3E';

export function getTruckImageSrc(truck = {}) {
  return String(truck.image || '').trim() || FALLBACK_TRUCK_IMAGE;
}
