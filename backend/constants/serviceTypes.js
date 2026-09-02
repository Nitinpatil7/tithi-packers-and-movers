const service_types = {
  LOCAL_SHIFTING: "local_shifting",
  INTERCITY_MOVING: "intercity_moving",
  PORTER_LABOUR_SERVICE: "porter_labour_service",
};

const SERVICE_TYPE_VALUES = Object.values(service_types);
const ITEM_CATALOG_SERVICE_TYPES = [
  service_types.LOCAL_SHIFTING,
  service_types.INTERCITY_MOVING,
];

const isItemCatalogService = (serviceType) => ITEM_CATALOG_SERVICE_TYPES.includes(serviceType);

module.exports = { service_types, SERVICE_TYPE_VALUES, ITEM_CATALOG_SERVICE_TYPES, isItemCatalogService };
