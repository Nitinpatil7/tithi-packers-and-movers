// src/data/itemCatalog.js

export const ITEM_CATALOG = [
  {
    section: "Living Room",
    blocks: [
      /* ================= SOFA ================= */
      {
        label: "Sofa",
        expandable: true,
        items: [
          { name: "1 Seater Sofa", tag: "L", price: 288 },   // Sofa Single
          { name: "2 Seater Sofa", tag: "XL", price: 324 },  // Sofa Double
          { name: "3 Seater Sofa", tag: "XXL", price: 360 }, // Sofa 3 Seater
          { name: "4 Seater Sofa", tag: "XXL", price: 396 }, // Sofa 4 Seater
          { name: "5 Seater Sofa – L Shape", tag: "XXXL", price: 432 }, // Sofa 5 Seater
          { name: "7 Seater Sofa – L Shape", tag: "XXXL", price: 468 }, // Sofa 6 Seater (closest match)
          { name: "Sofa Cum Bed", tag: "XXL", price: 396 },             // aligned with Sofa 4 Seater
        ],
      },
      /* ================= DINING ================= */
      {
        label: "Dining",
        expandable: true,
        items: [
          { name: "Dining Chair", tag: "M", price: 86 },       // Chair
          { name: "Dining Table – 4 Seater", tag: "XL", price: 288 }, // Dining Table
          { name: "Dining Table – 6 Seater", tag: "XXL", price: 432 },
          { name: "Dining Table – 8 Seater", tag: "XXXL", price: 576 },
        ],
      },
      /* ================= TELEVISION ================= */
      {
        label: "Television / Music",
        expandable: true,
        items: [
          { name: 'TV Upto 28"', tag: "M", price: 216 },
          { name: 'LCD / LED TV 29" – 42"', tag: "L", price: 288 }, // TV 29" to 43"
          { name: 'LCD / LED TV 42" – 50"', tag: "XL", price: 360 }, // TV 49" to 55"
          { name: 'LCD / LED TV 52" – 65"', tag: "XXL", price: 432 }, // TV Above 55"
          { name: 'LCD / LED TV 65" & Above', tag: "XXXL", price: 432 }, // same category
          { name: "Regular TV (Old Model)", tag: "L", price: 288 }, // TV 29" to 43"
          { name: "TV Stand / Trolley", tag: "M", price: 216 },
          { name: "Home Theater", tag: "M", price: 216 },
          { name: "Music / Video System", tag: "M", price: 180 },
        ],
      },
      /* ================= TABLE ================= */
      {
        label: "Table",
        expandable: true,
        items: [
          { name: "Center Table", tag: "M", price: 252 },
          { name: "Coffee Table Large", tag: "M", price: 260 },
          { name: "Coffee Table Small", tag: "S", price: 180 },
          { name: "Folding Table", tag: "S", price: 130 },
        ],
      },
      /* ================= CHAIR ================= */
      {
        label: "Chair",
        expandable: true,
        items: [
          { name: "Arm Chair", tag: "L", price: 180 },       // heavier, needs careful packing
          { name: "Bean Bag / Pouffe", tag: "M", price: 120 }, // light, easy to move
          { name: "Folding Chair", tag: "S", price: 90 },    // compact, minimal effort
          { name: "Plastic Chair", tag: "S", price: 80 },    // very light, stackable
          { name: "Rocking Chair", tag: "M", price: 150 },   // awkward shape, needs care
          { name: "Settee", tag: "L", price: 200 },          // larger, similar to sofa
          { name: "Stool", tag: "XS", price: 70 },           // smallest item
          { name: "Study Chair", tag: "M", price: 120 },     // medium weight
          { name: "Wooden Chair", tag: "M", price: 140 },    // heavier than plastic, sturdy
        ],
      },
      /* ================= AIR CONDITIONER ================= */
      {
        label: "Air Conditioner",
        expandable: true,
        items: [
          { name: "Split Air Conditioner (AC)", tag: "L", price: 288 }, // Cabinet/Storage proxy
          { name: "Window Air Conditioner (AC)", tag: "L", price: 288 },
        ],
      },
      /* ================= CABINET & STORAGE ================= */
      {
        label: "Cabinet & Storage",
        expandable: true,
        items: [
          { name: "Cabinet / Storage", tag: "L", price: 288 },          // baseline
          { name: "Book Shelf Small", tag: "M", price: 180 },           // lighter, compact
          { name: "Book Shelf Medium", tag: "L", price: 240 },          // mid-size
          { name: "Book Shelf Large", tag: "XL", price: 300 },          // heavy, tall
          { name: "Chest of Drawers Small", tag: "M", price: 200 },     // small but solid
          { name: "Chest of Drawers Medium", tag: "L", price: 260 },    // mid-weight
          { name: "Chest of Drawers Large", tag: "XL", price: 320 },    // bulky, heavier
          { name: "Display Cabinet Small", tag: "L", price: 250 },      // glass risk, careful handling
          { name: "Display Cabinet Large", tag: "XL", price: 340 },     // large, fragile
          { name: "TV Table", tag: "M", price: 220 },          // medium size, moderate handling
          { name: "Wall Shelf", tag: "S", price: 120 },        // small, light, easy to pack
          { name: "Plastic Cupboard", tag: "L", price: 260 },
          { name: "Shoe Rack Metal", tag: "M", price: 180 },   // sturdy, mid-weight
          { name: "Shoe Rack Wooden", tag: "M", price: 220 },  // heavier than metal, more effort
        ],
      },
      /* ================= APPLIANCES ================= */
      {
        label: "Fan",
        expandable: true,
        items: [
          { name: "Ceiling Fan", tag: "S", price: 120 },       // light, detachable
          { name: "Table Fan", tag: "S", price: 100 },         // very small, easy handling
        ],
      },
      /* ================= BAR FURNITURE ================= */
      {
        label: "Bar Furniture",
        expandable: true,
        items: [
          { name: "Bar Cabinet", tag: "L", price: 240 },        // medium size, moderate handling
          { name: "Bar Cabinet Large", tag: "XL", price: 300 }, // bulky, heavier
          { name: "Bar Chair / Stool", tag: "S", price: 100 },  // small, easy to move
          { name: "Bar Trolley", tag: "M", price: 180 },        // mid-size, wheels but fragile
          { name: "Bar Unit", tag: "XL", price: 320 },          // large, heavy, needs careful packing
          { name: "Wine Rack", tag: "M", price: 150 },          // compact but fragile bottles
        ],
      },
      /* ================= SIMPLE ITEMS ================= */
      {
        label: "Decorative Item",
        expandable: true,
        items: [
          { name: "Decorative Item", tag: "S", price: 86 },
          { name: "Lamp", tag: "XS", price: 72 }
        ]
      },
      {
        label: "Air Cooler",
        expandable: false,
        items: [{ name: "Air Cooler", tag: "L", price: 260 },],
      },
      {
        label: "Air Purifier",
        expandable: false,
        items: [{ name: "Air Purifier", tag: "M", price: 200 },],
      },
    ],
  },
  {
    section: "Bedroom",
    blocks: [
      /* ================= BED ================= */
      {
        label: "Bed",
        expandable: true,
        items: [
          { name: "Single Bed (Simple Frame)", tag: "L", price: 252 },
          { name: "Single Bed (Box / Drawer Storage)", tag: "XL", price: 288 },
          { name: "Single Bed (Hydraulic Storage)", tag: "XXL", price: 320 },
          { name: "Double Bed (Simple Frame)", tag: "XXL", price: 324 },
          { name: "Double Bed (Box / Drawer Storage)", tag: "XXXL", price: 360 },
          { name: "Double Bed (Hydraulic Storage)", tag: "4XL", price: 390 },
        ],
      },
      /* ================= MATTRESS ================= */
      {
        label: "Mattress",
        expandable: true,
        items: [
          { name: "Mattress Single Foldable", tag: "M", price: 108 },
          { name: "Mattress Single Non Foldable", tag: "M", price: 144 },
          { name: "Mattress Double Foldable", tag: "M", price: 180 },
          { name: "Mattress Double Non Foldable", tag: "M", price: 216 },
        ],
      },
      /* ================= TABLE ================= */
      {
        label: "Table",
        expandable: true,
        items: [
          { name: "Bed Side Table", tag: "M", price: 144 },
          { name: "Study / Computer Table", tag: "L", price: 216 },
          { name: "Center Table", tag: "M", price: 252 }, // aligned with Living Room Center Table
        ],
      },
      /* ================= CHAIR ================= */
      {
        label: "Chair",
        expandable: true,
        items: [
          { name: "Office Chair", tag: "M", price: 108 },
          { name: "Rocking Chair", tag: "M", price: 144 },
          { name: "Arm Chair", tag: "L", price: 180 }, // aligned with Living Room Arm Chair
          { name: "Bean Bag / Pouffe", tag: "M", price: 120 }, // lighter, easy handling
        ],
      },
      /* ================= AIR CONDITIONER ================= */
      {
        label: "Air Conditioner",
        expandable: true,
        items: [
          { name: "Split Air Conditioner (AC)", tag: "L", price: 288 },
          { name: "Window Air Conditioner (AC)", tag: "L", price: 252 },
          { name: "Air Cooler", tag: "M", price: 144 },
        ],
      },
      /* ================= ALMIRAH / WARDROBE ================= */
      {
        label: "Almirah / Wardrobe",
        expandable: true,
        items: [
          { name: "Wooden Wardrobe (Up to 5.5 ft)", tag: "L", price: 252 },
          { name: "Wooden Wardrobe (6 ft)", tag: "XL", price: 324 },
          { name: "Wooden Wardrobe (6.5–8 ft / Sliding)", tag: "XXL", price: 396 },
          { name: "Steel Almirah (Up to 5.5 ft)", tag: "L", price: 216 },
          { name: "Steel Almirah (6 ft)", tag: "XL", price: 288 },
          { name: "Steel Almirah (6.5+ ft)", tag: "XXL", price: 360 },
          { name: "Wooden Wardrobe (6–7 ft) Dismantale", tag: "XL", price: 324},
        ],
      },
      /* ================= APPLIANCES ================= */
      {
        label: "Appliances",
        expandable: true,
        items: [
          { name: "Air Purifier", tag: "M", price: 180 },
          { name: "Garment Steamer", tag: "S", price: 120 },
        ],
      },
      /* ================= SIMPLE ITEMS ================= */
      {
        label: "Dressing Table",
        expandable: true,
        items: [{ name: "Dressing Table", tag: "M", price: 216 }],
      },
      {
        label: "Mandir",
        expandable: true,
        items: [
          { name: "Mandir (Small)", tag: "S", price: 252 },
          { name: "Mandir (Medium)", tag: "M", price: 300 },
          { name: "Mandir (Large)", tag: "L", price: 350 },
          { name: "Religious Items", tag: "M", price: 252 },
        ],
      },
    ],
  },
  {
    section: "Kitchen",
    blocks: [
      /* ================= REFRIGERATOR ================= */
      {
        label: "Refrigerator",
        expandable: true,
        items: [
          { name: "Fridge (Up to 80L)", tag: "M", price: 216 },
          { name: "Fridge (81L – 200L)", tag: "L", price: 252 },
          { name: "Fridge (201L – 350L)", tag: "XL", price: 288 },
          { name: "Fridge (351L – 450L)", tag: "XXL", price: 360 },
          { name: "Fridge (451L – 600L)", tag: "XXXL", price: 432 },
          { name: "Fridge (Above 600L)", tag: "XXXL", price: 480 }
        ],
      },
      /* ================= KITCHEN ITEMS ================= */
      {
        label: "Kitchen Items",
        expandable: true,
        items: [
          { name: "Gas Stove / Hob", tag: "S", price: 86 },
          { name: "LPG Gas Cylinder", tag: "M", price: 72 },
          { name: "Kitchen Metal Rack", tag: "L", price: 180 },          // aligned with Book Shelf
          { name: "Kitchen Cabinet / Storage", tag: "XL", price: 288 },
          { name: "Water Drum", tag: "M", price: 144 },                  // similar to purifier
          { name: "Exhaust Fan", tag: "S", price: 108 },
          { name: "Chimney", tag: "L", price: 252 },
        ],
      },
      /* ================= APPLIANCES ================= */
      {
        label: "Appliances",
        expandable: true,
        items: [
          { name: "Microwave Oven / OTG", tag: "M", price: 144 },
          { name: "Dish Washer", tag: "L", price: 288 },
          { name: "Water Purifier", tag: "M", price: 144 },
          { name: "Mixer Grinder", tag: "S", price: 108 },               // small appliance
          { name: "Wet Grinder", tag: "M", price: 144 },                 // medium appliance
          { name: "Food Processor", tag: "S", price: 108 },
          { name: "Cooking Range", tag: "L", price: 252 },
          { name: "Domestic Flour Mill / Atta Chakki", tag: "L", price: 252 },
          { name: "Air Fryer", tag: "S", price: 108 },
          { name: "Electric Tandoor", tag: "S", price: 108 },
          { name: "Hood Chimney", tag: "L", price: 252 },
          { name: "Barbeque Grill Small", tag: "M", price: 144 },
          { name: "Barbeque Grill Large", tag: "L", price: 216 },
          { name: "Pressure Cooker Set", tag: "S", price: 86 },
        ],
      },
      /* ================= FURNITURE & STORAGE ================= */
      {
        label: "Furniture & Storage",
        expandable: true,
        items: [
          { name: "Kitchen Rack", tag: "L", price: 180 },   // similar to Book Shelf Small/Medium
          { name: "Serving Trolley", tag: "M", price: 144 },
          { name: "Side Table", tag: "M", price: 144 },     // aligned with Bed Side Table
        ],
      },
    ],
  },
  {
    section: "Other",
    blocks: [
      /* ================= CARTONS & PACKING ================= */
      {
        label: "Self Cartoon Boxes (2ft x 1.5ft x 1.5ft)",
        expandable: false,
        items: [
          { name: "Carton Box", tag: "S", price: 96 },   // Tithi Carton Box
          { name: "Large Carton", tag: "M", price: 0 },                        // Self Carton Box
          { name: "Medium Carton", tag: "S", price: 0 },                       // Self Carton Box
          { name: "Small Carton", tag: "XS", price: 0 },                       // Self Carton Box
        ],
      },
      {
        label: "TITHI Carton Box (1.5ft x 1.5ft x 2ft)",
        expandable: false,
        items: [{ name: "TITHI Carton Box (1.5ft x 1.5ft x 2ft)", tag: "S", price: 96 },],
      },
      {
        label: "TITHI Gunny Bag",
        expandable: false,
        items: [{ name: "Gunny Bag", tag: "XS", price: 40 },],
      },
      /* ================= WASHING MACHINE ================= */
      {
        label: "Washing Machine",
        expandable: true,
        items: [
          { name: "Washing Machine < 6.9 Kg", tag: "L", price: 400 },
          { name: "Washing Machine 7 – 7.9 Kg", tag: "XL", price: 400 },
          { name: "Washing Machine 8 Kg & Above", tag: "XXL", price: 400 },
        ],
      },
      /* ================= BATHROOM UTILITY ================= */
      {
        label: "Bathroom Utility",
        expandable: true,
        items: [
          { name: "Bucket", tag: "XS", price: 32 },
          { name: "Tub", tag: "S", price: 64 },
          { name: "Bath Tub", tag: "XL", price: 480 },
          { name: "Geyser", tag: "M", price: 320 },
          { name: "Mirror (Large)", tag: "M", price: 240 },
        ],
      },
      /* ================= HOME UTILITY ================= */
      {
        label: "Home Utility",
        expandable: true,
        items: [
          { name: "Inverter / UPS", tag: "L", price: 400 },
          { name: "Inverter – With Battery", tag: "XL", price: 400 },
          { name: "Clothes Stand", tag: "S", price: 144 },
          { name: "Foldable Clothes Dryer", tag: "S", price: 160 }, // aligned with Home Utility
          { name: "Iron Board", tag: "S", price: 120 },
          { name: "Storage / Laundry Basket", tag: "S", price: 160 }, // Home Utility
          { name: "Vacuum Cleaner", tag: "S", price: 280 },
          { name: "Ladder / Step Ladder", tag: "M", price: 160 },
          { name: "Sewing Machine", tag: "M", price: 320 },
          { name: "Computer System", tag: "L", price: 400 },   // aligned with Inverter/UPS
          { name: "Printer", tag: "L", price: 200 },           // proxy to Dish Antenna
          { name: "Speaker", tag: "S", price: 160 },           // small electronic, aligned with Home Utility
          { name: "Dish Antenna", tag: "M", price: 200 },      // matches reference list
        ],
      },
      /* ================= VEHICLE ================= */
      {
        label: "Vehicle",
        expandable: true,
        items: [
          { name: "Bicycle – Adult", tag: "L", price: 560 },
          { name: "Bicycle – Kids", tag: "M", price: 560 }, // same category
          { name: "Scooter", tag: "XXXL", price: 1200 },
          { name: "Bike", tag: "XXXL", price: 1600 },
        ],
      },
      /* ================= EQUIPMENT / INSTRUMENTS ================= */
      {
        label: "Musicle Instruments",
        expandable: true,
        items: [
          { name: "Piano", tag: "XXL", price: 960 },            // upright piano, heavy but smaller than grand
          { name: "Grand Piano", tag: "XXXL", price: 1200 },    // very large, requires special handling
          { name: "Guitar", tag: "L", price: 240 },             // light, fragile, easy to carry
          { name: "Harmonium", tag: "M", price: 300 },          // medium size, wooden, delicate
          { name: "Synthesizer", tag: "M", price: 360 },        // electronic, fragile
          { name: "Electronic Keyboard", tag: "M", price: 360 },// similar to synthesizer
          { name: "Tabla", tag: "S", price: 180 },              // small, portable
          { name: "Drum Set (5 Piece)", tag: "XXXL", price: 800 }, // bulky, multiple pieces
          { name: "Foosball", tag: "XL", price: 1600 },         // large, heavy, matches your reference
          { name: "Pool / Snooker", tag: "XXL", price: 2000 },  // very large, matches your reference
        ],
      },
      /* ================= PLANTS & POTS ================= */
      {
        label: "Plants & Pots",
        expandable: true,
        items: [
          { name: "Small Plant (1 ft & below)", tag: "XS", price: 80 },
          { name: "Medium Plant (2 – 5 ft)", tag: "S", price: 200 },
          { name: "Large Plant (6 ft & above)", tag: "L", price: 400 },
          { name: "Small Pots", tag: "S", price: 80 },
          { name: "Big Pots", tag: "M", price: 200 },
        ],
      },
      /* ================= SUITCASE / TROLLEY ================= */
      {
        label: "Suitcase / Trolley",
        expandable: true,
        items: [
          { name: "Cabin / Small Suitcase (Up to 55 cm)", tag: "S", price: 160 },
          { name: "Suitcase Small (7 Kg)", tag: "S", price: 160 },
          { name: "Suitcase Medium (15 Kg)", tag: "M", price: 240 },
          { name: "Suitcase Large (25 Kg)", tag: "L", price: 320 },
          { name: "Medium Suitcase (56 – 69 cm)", tag: "M", price: 240 },
          { name: "Large Suitcase (70 cm & above)", tag: "L", price: 320 },
        ],
      },
      /* ================= DECORATIVE ITEMS ================= */
      {
        label: "Decorative Items",
        expandable: true,
        items: [
          { name: "Aquarium Large", tag: "XL", price: 400 },   // heavy, fragile, aligned with Large Plant
          { name: "Carpet (Rolled)", tag: "M", price: 160 },   // medium handling, proxy to Home Utility
          { name: "Indoor Fountain Small", tag: "M", price: 200 }, // compact but fragile
          { name: "Indoor Fountain Large", tag: "XL", price: 400 }, // bulky, fragile, water risk
          { name: "Mirror", tag: "S", price: 240 },            // fragile glass, matches Mirror Large reference
          { name: "Painting / Photo Small", tag: "XS", price: 80 },
          { name: "Painting / Photo Medium", tag: "S", price: 160 },
          { name: "Painting / Photo Large", tag: "M", price: 240 },
          { name: "Pooja Lamp", tag: "XS", price: 80 },        // small, delicate
          { name: "Statue Small", tag: "S", price: 160 },
          { name: "Statue Medium", tag: "M", price: 240 },
          { name: "Statue Large", tag: "L", price: 320 },      // heavy, stone/metal
          { name: "Vase Small", tag: "XS", price: 80 },
          { name: "Vase Large", tag: "S", price: 160 },
          { name: "Wall Frames Medium", tag: "S", price: 160 },
          { name: "Wall Frames Large", tag: "M", price: 240 },
        ],
      },
      /* ================= KIDS VEHICLE ================= */
      {
        label: "Kids Vehicle",
        expandable: true,
        items: [
          { name: "Kids Three Wheeler", tag: "M", price: 240 }, // Baby Stroller proxy
          { name: "Kids Four Wheeler", tag: "L", price: 240 },  // Baby Stroller proxy
        ],
      },
      /* ================= GYM EQUIPMENT ================= */
      {
        label: "Gym Equipment",
        expandable: true,
        items: [
          { name: "Exercise Cycle", tag: "L", price: 800 },       // bulky but lighter than treadmill
          { name: "Treadmill", tag: "XXL", price: 1200 },         // heavy, requires careful handling
          { name: "Treadmill – Foldable", tag: "XL", price: 1000 }, // slightly easier to move than full treadmill
          { name: "Dumble", tag: "M", price: 120 },               // small, portable, easy handling
        ],
      },
      /* ================= SIMPLE ================= */
      {
        label: "Swing (Baby / Adult)",
        expandable: true,
        items: [
          { name: "Swing (Baby)", tag: "L", price: 300 },
          { name: "Swing (Adult)", tag: "XL", price: 400 },
        ],
      },
    ],
  },
];
