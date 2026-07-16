import fs from 'node:fs/promises';
import { parse } from 'csv-parse/sync';

const SOURCES = {
  ko: 'https://raw.githubusercontent.com/Ra-Workspace/ffxiv-datamining-ko/master/csv/Glasses.csv',
  en: 'https://raw.githubusercontent.com/xivapi/ffxiv-datamining/master/csv/en/Glasses.csv',
  ja: 'https://raw.githubusercontent.com/xivapi/ffxiv-datamining/master/csv/ja/Glasses.csv',
};

function iconPath(iconValue) {
  const icon = Number(iconValue);
  if (!Number.isFinite(icon) || icon <= 0) return undefined;
  const folder = Math.floor(icon / 1000) * 1000;
  return `/i/${String(folder).padStart(6, '0')}/${String(icon).padStart(6, '0')}.png`;
}

export function parseGlassesCsv(csvText) {
  const rows = parse(csvText, { bom: true, relax_column_count: true, skip_empty_lines: true });
  const headerIndex = rows.findIndex((row, index) =>
    index < 4 && row.includes('Name') && row.includes('Icon'),
  );
  if (headerIndex < 0) throw new Error('Glasses.csv is missing Name/Icon headers');

  const headers = rows[headerIndex];
  const nameIndex = headers.indexOf('Name');
  const iconIndex = headers.indexOf('Icon');
  const result = new Map();

  for (const row of rows.slice(headerIndex + 1)) {
    const id = Number(row[0]);
    if (!Number.isInteger(id) || id <= 0) continue;
    const name = row[nameIndex]?.trim();
    if (!name) continue;
    result.set(String(id), { name, iconPath: iconPath(row[iconIndex]) });
  }
  return result;
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return response.text();
}

async function main() {
  const localized = await Promise.all(
    Object.entries(SOURCES).map(async ([language, url]) => [
      language,
      parseGlassesCsv(await fetchText(url)),
    ]),
  );

  const merged = {};
  for (const [language, records] of localized) {
    for (const [id, record] of records) {
      const current = merged[id] ?? {};
      current[language] = record.name;
      current.iconPath ||= record.iconPath;
      merged[id] = current;
    }
  }

  const sorted = Object.fromEntries(
    Object.entries(merged).sort(([left], [right]) => Number(left) - Number(right)),
  );
  await fs.writeFile('src/data/facewear.json', `${JSON.stringify(sorted, null, 2)}\n`, 'utf8');

  const counts = Object.fromEntries(
    Object.keys(SOURCES).map(language => [
      language,
      Object.values(sorted).filter(record => record[language]).length,
    ]),
  );
  console.log(JSON.stringify({ total: Object.keys(sorted).length, counts }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
