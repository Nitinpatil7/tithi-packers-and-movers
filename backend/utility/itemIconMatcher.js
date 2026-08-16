const DEFAULT_ITEM_ICON = "package";

const ITEM_ICON_KEYWORDS = [
  { icon: "washing-machine", keywords: ["washing machine", "washer", "dryer", "laundry"] },
  { icon: "fridge", keywords: ["refrigerator", "fridge", "freezer"] },
  { icon: "sofa", keywords: ["sofa", "couch", "settee", "diwan"] },
  { icon: "chair", keywords: ["chair", "stool", "seat", "recliner"] },
  { icon: "bed", keywords: ["bed", "mattress", "cot"] },
  { icon: "table", keywords: ["table", "desk", "dining"] },
  { icon: "tv", keywords: ["television", "smart tv", "led tv", "tv"] },
  { icon: "kitchen", keywords: ["kitchen", "stove", "gas", "cooker", "oven", "microwave"] },
  { icon: "utensils", keywords: ["utensil", "crockery", "dish", "plate", "glassware"] },
  { icon: "clothes", keywords: ["cloth", "wardrobe", "almirah", "dress", "garment"] },
  { icon: "books", keywords: ["book", "file", "document"] },
  { icon: "office", keywords: ["office", "briefcase", "business"] },
  { icon: "monitor", keywords: ["monitor", "computer", "desktop", "laptop", "printer"] },
  { icon: "electronics", keywords: ["electronic", "cable", "wire", "inverter", "ups", "router"] },
  { icon: "speaker", keywords: ["speaker", "sound", "music", "audio"] },
  { icon: "lamp", keywords: ["lamp", "light", "chandelier"] },
  { icon: "fan", keywords: ["fan", "cooler", "ac", "air conditioner"] },
  { icon: "door", keywords: ["door", "window", "frame"] },
  { icon: "bike", keywords: ["bike", "scooter", "cycle", "bicycle"] },
  { icon: "car", keywords: ["car", "vehicle"] },
  { icon: "gym", keywords: ["gym", "treadmill", "dumbbell", "fitness"] },
  { icon: "piano", keywords: ["piano", "harmonium", "keyboard"] },
  { icon: "tiles", keywords: ["tile", "marble", "granite"] },
  { icon: "archive", keywords: ["archive", "carton", "storage", "box"] },
  { icon: "box", keywords: ["package", "parcel", "bag", "bundle"] },
];

const inferItemIcon = (name = "") => {
  const normalized = ` ${String(name).toLowerCase().replace(/[^a-z0-9]+/g, " ")} `;
  const exact = ITEM_ICON_KEYWORDS.find(({ keywords }) => keywords.some((keyword) => normalized.includes(` ${keyword} `)));
  if (exact) return exact.icon;
  const partial = ITEM_ICON_KEYWORDS.find(({ keywords }) => keywords.some((keyword) => normalized.includes(keyword)));
  return partial?.icon || DEFAULT_ITEM_ICON;
};

module.exports = { DEFAULT_ITEM_ICON, ITEM_ICON_KEYWORDS, inferItemIcon };
