import {
  Armchair,
  Archive,
  BedDouble,
  Bike,
  BookOpen,
  BriefcaseBusiness,
  Cable,
  Car,
  CookingPot,
  DoorOpen,
  Dumbbell,
  Fan,
  Grid2X2,
  LampDesk,
  Monitor,
  Package,
  PackageOpen,
  Piano,
  Refrigerator,
  Shirt,
  Sofa,
  Speaker,
  Table2,
  Tv,
  Utensils,
  WashingMachine,
} from 'lucide-react';

export const DEFAULT_ITEM_ICON = 'package';

export const ITEM_ICON_OPTIONS = [
  { key: 'package', label: 'Package', Icon: Package },
  { key: 'box', label: 'Moving box', Icon: PackageOpen },
  { key: 'sofa', label: 'Sofa', Icon: Sofa },
  { key: 'chair', label: 'Chair', Icon: Armchair },
  { key: 'bed', label: 'Bed', Icon: BedDouble },
  { key: 'table', label: 'Table', Icon: Table2 },
  { key: 'tv', label: 'TV', Icon: Tv },
  { key: 'fridge', label: 'Fridge', Icon: Refrigerator },
  { key: 'washing-machine', label: 'Washing machine', Icon: WashingMachine },
  { key: 'kitchen', label: 'Kitchen', Icon: CookingPot },
  { key: 'utensils', label: 'Utensils', Icon: Utensils },
  { key: 'clothes', label: 'Clothes', Icon: Shirt },
  { key: 'books', label: 'Books', Icon: BookOpen },
  { key: 'office', label: 'Office bag', Icon: BriefcaseBusiness },
  { key: 'monitor', label: 'Monitor', Icon: Monitor },
  { key: 'electronics', label: 'Electronics', Icon: Cable },
  { key: 'speaker', label: 'Speaker', Icon: Speaker },
  { key: 'lamp', label: 'Lamp', Icon: LampDesk },
  { key: 'fan', label: 'Fan', Icon: Fan },
  { key: 'door', label: 'Door', Icon: DoorOpen },
  { key: 'bike', label: 'Bike', Icon: Bike },
  { key: 'car', label: 'Car', Icon: Car },
  { key: 'gym', label: 'Gym', Icon: Dumbbell },
  { key: 'piano', label: 'Piano', Icon: Piano },
  { key: 'tiles', label: 'Tiles', Icon: Grid2X2 },
  { key: 'archive', label: 'Archive', Icon: Archive },
];

const iconMap = Object.fromEntries(ITEM_ICON_OPTIONS.map((item) => [item.key, item.Icon]));

export function getItemIcon(iconKey) {
  return iconMap[iconKey] || iconMap[DEFAULT_ITEM_ICON];
}

export function ItemIcon({ icon, className = 'h-4 w-4', ...props }) {
  const Icon = getItemIcon(icon);
  return <Icon className={className} strokeWidth={1.7} {...props} />;
}
