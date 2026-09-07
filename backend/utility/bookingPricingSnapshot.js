const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const getAllowanceMap = (rule = {}) => Object.fromEntries(
  (rule.freeItemAllowance || [])
    .map((entry) => [
      String(entry.sizeKey || "").toUpperCase(),
      Math.max(0, toNumber(entry.quantity)),
    ]),
);

const expandItemUnits = (items = []) => {
  const groupedUnits = {};
  (items || []).forEach((item) => {
    const sizeKey = String(item.sizeTag || item.sizeKey || item.tag || "").toUpperCase();
    if (!groupedUnits[sizeKey]) groupedUnits[sizeKey] = [];
    const quantity = Math.max(0, toNumber(item.quantity));
    for (let index = 0; index < quantity; index += 1) {
      groupedUnits[sizeKey].push({
        sizeKey,
        name: item.name || "Selected item",
        unitPrice: toNumber(item.unitPrice ?? item.price),
        item,
      });
    }
  });
  return groupedUnits;
};

const calculateItemBreakdown = (items = [], rule = {}, { includeItemUnits = false } = {}) => {
  const allowances = getAllowanceMap(rule);
  const groupedUnits = expandItemUnits(items);
  const includedItems = [];
  const chargedAllowanceItems = [];
  const bySize = Object.entries(groupedUnits).map(([sizeKey, units]) => {
    const sorted = units.sort((a, b) => b.unitPrice - a.unitPrice);
    const allowance = allowances[sizeKey] || 0;
    const included = sorted.slice(0, allowance);
    const charged = sorted.slice(allowance);
    includedItems.push(...included);
    chargedAllowanceItems.push(...charged);
    return {
      sizeKey,
      selected: sorted.length,
      included: included.length,
      charged: charged.length,
      allowance,
      charge: charged.reduce((sum, unit) => sum + unit.unitPrice, 0),
    };
  });

  const result = {
    allowances,
    bySize,
    selectedCount: bySize.reduce((sum, item) => sum + item.selected, 0),
    includedCount: bySize.reduce((sum, item) => sum + item.included, 0),
    chargedCount: bySize.reduce((sum, item) => sum + item.charged, 0),
    charge: bySize.reduce((sum, item) => sum + item.charge, 0),
  };
  if (includeItemUnits) {
    result.includedItems = includedItems;
    result.chargedAllowanceItems = chargedAllowanceItems;
  }
  return result;
};

module.exports = {
  calculateItemBreakdown,
};
