const toNumber = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;

export function buildItemVariantOptions(catalog = []) {
  return (catalog || []).flatMap((section) => (section.groups || []).flatMap((group) => (group.items || []).flatMap((item) => (
    item.sizes || []
  ).filter((size) => size.isActive !== false).map((size) => ({
    itemId: item._id,
    name: item.name,
    group: group.name,
    section: section.name,
    sizeKey: String(size.sizeKey || size.label || '').toUpperCase(),
    label: `${item.name}${size.label || size.sizeKey ? ` (${size.label || size.sizeKey})` : ''}`,
  })))));
}

export function describeAllowanceRows(rows = [], itemOptions = []) {
  return (rows || [])
    .filter((row) => toNumber(row.quantity) > 0)
    .map((row) => {
      const sizeKey = String(row.sizeKey || '').toUpperCase();
      const examples = itemOptions.filter((item) => item.sizeKey === sizeKey).slice(0, 3).map((item) => item.name);
      return `${examples.length ? examples.join(', ') : readableSize(sizeKey)}: ${toNumber(row.quantity)} item(s)`;
    });
}

export function deriveFreeAllowanceItems(items = [], itemBreakdown = {}) {
  const includedBySize = Object.fromEntries((itemBreakdown.bySize || []).map((row) => [String(row.sizeKey || '').toUpperCase(), toNumber(row.included)]));
  const bySize = {};
  (items || []).forEach((item) => {
    const sizeKey = String(item.sizeTag || item.sizeKey || item.tag || 'NA').toUpperCase();
    bySize[sizeKey] ||= [];
    for (let index = 0; index < toNumber(item.quantity); index += 1) {
      bySize[sizeKey].push({ ...item, quantity: 1, unitPrice: toNumber(item.unitPrice ?? item.price ?? item.pricesnapshot) });
    }
  });

  return Object.entries(bySize).flatMap(([sizeKey, entries]) => {
    const included = includedBySize[sizeKey] || 0;
    return [...entries]
      .sort((a, b) => toNumber(b.unitPrice) - toNumber(a.unitPrice))
      .slice(0, included)
      .map((item) => ({
        name: item.name || 'Inventory item',
        category: item.category || item.section || '',
        sizeKey,
      }));
  });
}

function readableSize(sizeKey = '') {
  return {
    XS: 'Extra small items',
    S: 'Small items',
    M: 'Medium items',
    L: 'Large items',
    XL: 'Extra large items',
    XXL: 'Oversized items',
  }[String(sizeKey).toUpperCase()] || 'Allowance items';
}
