const DEFAULT_ITEM_ICON = "fi-rr-box";

const ITEM_ICON_KEYWORDS = [
  { icon: "fi-rr-washer", keywords: ["washing machine", "washer", "dryer", "laundry"] },
  { icon: "fi-rr-refrigerator", keywords: ["refrigerator", "fridge", "freezer"] },
  { icon: "fi-rr-couch", keywords: ["sofa", "couch", "settee", "diwan", "living room"] },
  { icon: "fi-rr-chair", keywords: ["chair", "stool", "seat", "recliner"] },
  { icon: "fi-rr-bed-alt", keywords: ["bed", "bedroom", "mattress", "cot"] },
  { icon: "fi-rr-table", keywords: ["table", "desk", "dining"] },
  { icon: "fi-rr-tv-retro", keywords: ["television", "smart tv", "led tv", "tv"] },
  { icon: "fi-rr-pan-frying", keywords: ["kitchen", "stove", "gas", "cooker", "oven", "microwave"] },
  { icon: "fi-rr-utensils", keywords: ["utensil", "crockery", "dish", "plate", "glassware"] },
  { icon: "fi-rr-shirt", keywords: ["cloth", "wardrobe", "almirah", "dress", "garment"] },
  { icon: "fi-rr-books", keywords: ["book", "file", "document"] },
  { icon: "fi-rr-briefcase", keywords: ["office", "briefcase", "business"] },
  { icon: "fi-rr-computer", keywords: ["monitor", "computer", "desktop", "laptop", "printer"] },
  { icon: "fi-rr-bolt", keywords: ["electronic", "cable", "wire", "inverter", "ups", "router"] },
  { icon: "fi-rr-speaker", keywords: ["speaker", "sound", "music", "audio"] },
  { icon: "fi-rr-lamp-floor", keywords: ["lamp", "light", "chandelier"] },
  { icon: "fi-rr-fan", keywords: ["fan", "cooler", "ac", "air conditioner"] },
  { icon: "fi-rr-door-open", keywords: ["door", "window", "frame"] },
  { icon: "fi-rr-bike", keywords: ["bike", "scooter", "cycle", "bicycle"] },
  { icon: "fi-rr-car-side", keywords: ["car", "vehicle"] },
  { icon: "fi-rr-dumbbell-fitness", keywords: ["gym", "treadmill", "dumbbell", "fitness"] },
  { icon: "fi-rr-piano", keywords: ["piano", "harmonium", "keyboard"] },
  { icon: "fi-rr-grid", keywords: ["tile", "marble", "granite"] },
  { icon: "fi-rr-archive", keywords: ["archive", "carton", "storage", "box"] },
  { icon: "fi-rr-box", keywords: ["package", "parcel", "bag", "bundle"] },
];

const inferItemIcon = (name = "") => {
  const normalized = ` ${String(name).toLowerCase().replace(/[^a-z0-9]+/g, " ")} `;
  const exact = ITEM_ICON_KEYWORDS.find(({ keywords }) => keywords.some((keyword) => normalized.includes(` ${keyword} `)));
  if (exact) return exact.icon;
  const partial = ITEM_ICON_KEYWORDS.find(({ keywords }) => keywords.some((keyword) => normalized.includes(keyword)));
  return partial?.icon || DEFAULT_ITEM_ICON;
};

module.exports = { DEFAULT_ITEM_ICON, ITEM_ICON_KEYWORDS, inferItemIcon };
