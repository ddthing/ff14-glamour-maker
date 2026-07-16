import { parse } from 'csv-parse/sync';

const SLOT_COLUMNS = {
  MainHand: 'mainhand', OffHand: 'offhand', Head: 'head', Body: 'body',
  Gloves: 'hands', Legs: 'legs', Feet: 'feet', Ears: 'ears', Neck: 'neck',
  Wrists: 'wrists', FingerL: 'rings', FingerR: 'rings2',
};

function rows(csvText) {
  return parse(csvText, { bom: true, relax_column_count: true, skip_empty_lines: true });
}

function semanticHeader(table, required) {
  const index = table.findIndex((row, rowIndex) =>
    rowIndex < 4 && required.every(column => row.includes(column)),
  );
  if (index < 0) throw new Error(`CSV is missing headers: ${required.join(', ')}`);
  return { index, headers: table[index] };
}

function iconPath(value) {
  const icon = Number(value);
  if (!Number.isFinite(icon) || icon <= 0) return undefined;
  const folder = Math.floor(icon / 1000) * 1000;
  return `/i/${String(folder).padStart(6, '0')}/${String(icon).padStart(6, '0')}.png`;
}

export function parseItemCsv(csvText) {
  const table = rows(csvText);
  const { index, headers } = semanticHeader(table, ['Name', 'Icon', 'ItemUICategory', 'EquipSlotCategory']);
  const column = Object.fromEntries(headers.map((header, columnIndex) => [header, columnIndex]));
  const result = new Map();

  for (const row of table.slice(index + 1)) {
    const id = Number(row[0]);
    if (!Number.isInteger(id) || id <= 0) continue;
    const name = row[column.Name]?.trim();
    if (!name) continue;
    result.set(String(id), {
      name,
      iconPath: iconPath(row[column.Icon]),
      uiCategory: Number(row[column.ItemUICategory]) || undefined,
      equipSlotCategory: Number(row[column.EquipSlotCategory]) || undefined,
    });
  }
  return result;
}

export function parseEquipSlotCsv(csvText) {
  const table = rows(csvText);
  const { index, headers } = semanticHeader(table, ['MainHand', 'OffHand', 'Head', 'Body']);
  const result = new Map();

  for (const row of table.slice(index + 1)) {
    const id = Number(row[0]);
    if (!Number.isInteger(id)) continue;
    const slots = [];
    for (const [column, slot] of Object.entries(SLOT_COLUMNS)) {
      const columnIndex = headers.indexOf(column);
      if (columnIndex >= 0 && Number(row[columnIndex]) > 0 && !slots.includes(slot)) slots.push(slot);
    }
    result.set(id, slots);
  }
  return result;
}

export function mergeLocalizedItems(localized, equipSlotCategories) {
  const merged = {};
  for (const [language, records] of Object.entries(localized)) {
    for (const [id, record] of records) {
      const current = merged[id] ?? {};
      current[language] = record.name;
      current.iconPath ||= record.iconPath;
      current.uiCategory ??= record.uiCategory;
      current.equipSlotCategory ??= record.equipSlotCategory;
      merged[id] = current;
    }
  }

  for (const record of Object.values(merged)) {
    record.equipSlots = equipSlotCategories.get(record.equipSlotCategory) ?? [];
  }
  return Object.fromEntries(Object.entries(merged).sort(([a], [b]) => Number(a) - Number(b)));
}
