export const SERVICE_TYPES = {
  LOCAL_SHIFTING: 'local_shifting',
  INTERCITY_MOVING: 'intercity_moving',
  PORTER_LABOUR_SERVICE: 'porter_labour_service',
};

export const SERVICE_ORDER = [
  SERVICE_TYPES.LOCAL_SHIFTING,
  SERVICE_TYPES.INTERCITY_MOVING,
  SERVICE_TYPES.PORTER_LABOUR_SERVICE,
];

export const ITEM_CATALOG_SERVICE_TYPES = [
  SERVICE_TYPES.LOCAL_SHIFTING,
  SERVICE_TYPES.INTERCITY_MOVING,
];

export const SERVICE_ALIAS_TO_TYPE = {
  local: SERVICE_TYPES.LOCAL_SHIFTING,
  'local-shifting': SERVICE_TYPES.LOCAL_SHIFTING,
  intercity: SERVICE_TYPES.INTERCITY_MOVING,
  'intercity-moving': SERVICE_TYPES.INTERCITY_MOVING,
  labour: SERVICE_TYPES.PORTER_LABOUR_SERVICE,
  'labour-service': SERVICE_TYPES.PORTER_LABOUR_SERVICE,
  porter: SERVICE_TYPES.PORTER_LABOUR_SERVICE,
  porter_labour_service: SERVICE_TYPES.PORTER_LABOUR_SERVICE,
};

export const SERVICE_TYPE_TO_ALIAS = {
  [SERVICE_TYPES.LOCAL_SHIFTING]: 'local',
  [SERVICE_TYPES.INTERCITY_MOVING]: 'intercity',
  [SERVICE_TYPES.PORTER_LABOUR_SERVICE]: 'labour',
};

export const toServiceType = (serviceType) => SERVICE_ALIAS_TO_TYPE[serviceType] || serviceType || '';

export const toServiceAlias = (serviceType) => SERVICE_TYPE_TO_ALIAS[serviceType] || serviceType || '';

export const serviceHasItemCatalog = (serviceType) => ITEM_CATALOG_SERVICE_TYPES.includes(toServiceType(serviceType));

export const activeServiceTypesFromRules = (rules = []) => {
  const active = new Set(
    (Array.isArray(rules) ? rules : [])
      .filter((rule) => rule && rule.isActive !== false)
      .map((rule) => rule.serviceType)
  );
  return SERVICE_ORDER.filter((serviceType) => active.has(serviceType));
};
