import { useEffect, useMemo, useState } from 'react';
import './ListTools.css';

const flattenValues = (value) => {
  if (value == null) return [];
  if (Array.isArray(value)) return value.flatMap(flattenValues);
  if (typeof value === 'object') return Object.values(value).flatMap(flattenValues);
  return [String(value)];
};

const flattenObject = (value, prefix = '', result = {}) => {
  Object.entries(value || {}).forEach(([key, item]) => {
    const name = prefix ? `${prefix}.${key}` : key;
    if (item && typeof item === 'object' && !Array.isArray(item)) flattenObject(item, name, result);
    else result[name] = Array.isArray(item) ? item.join(', ') : item ?? '';
  });
  return result;
};

const csvCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));

const exportCsv = (rows, filename) => {
  const flattened = rows.map((row) => flattenObject(row));
  const headers = [...new Set(flattened.flatMap(Object.keys))];
  if (!headers.length) return;
  const content = [headers, ...flattened.map((row) => headers.map((header) => row[header] ?? ''))]
    .map((line) => line.map(csvCell).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const printRows = (rows, title) => {
  const flattened = rows.map((row) => flattenObject(row));
  const headers = [...new Set(flattened.flatMap(Object.keys))];
  const popup = window.open('', '_blank', 'noopener,noreferrer');
  if (!popup) return;
  const heading = escapeHtml(title || 'Rapport');
  const tableHead = headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('');
  const tableBody = flattened.map((row) => `<tr>${headers.map((header) => `<td>${escapeHtml(row[header])}</td>`).join('')}</tr>`).join('');
  popup.document.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${heading}</title><style>body{font:14px Arial,sans-serif;padding:24px;color:#172033}h1{font-size:20px;margin:0 0 16px}p{color:#64748b}table{width:100%;border-collapse:collapse;font-size:11px}th,td{border:1px solid #dbe2ea;padding:7px;text-align:left;overflow-wrap:anywhere}th{background:#f1f5f9}@media print{body{padding:0}}</style></head><body><h1>${heading}</h1><p>${rows.length} élément(s) · ${new Date().toLocaleString('fr-FR')}</p><table><thead><tr>${tableHead}</tr></thead><tbody>${tableBody}</tbody></table><script>window.onload=()=>window.print()<\/script></body></html>`);
  popup.document.close();
};

export const useListTools = (rows = [], { filterKey = 'statut', filterLabel = 'Statut', filename = 'export.csv' } = {}) => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const safeRows = Array.isArray(rows) ? rows : [];
  const options = useMemo(() => [...new Set(safeRows.map((row) => row?.[filterKey]).filter(Boolean))].sort(), [safeRows, filterKey]);
  const filteredRows = useMemo(() => safeRows.filter((row) => {
    const matchesQuery = !query.trim() || flattenValues(row).join(' ').toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
    const matchesFilter = !filter || String(row?.[filterKey]) === filter;
    return matchesQuery && matchesFilter;
  }), [safeRows, query, filter, filterKey]);
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const visibleRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => { setPage(1); }, [query, filter, pageSize]);
  useEffect(() => { if (page > pageCount) setPage(pageCount); }, [page, pageCount]);

  const toolbar = (
    <div className="list-tools" aria-label="Outils de liste">
      <label className="list-tools-search">
        <span>Rechercher</span>
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Saisir un mot-clé…" />
      </label>
      {options.length > 0 && (
        <label className="list-tools-filter">
          <span>{filterLabel}</span>
          <select value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="">Toutes les valeurs</option>
            {options.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
      )}
      <label className="list-tools-size">
        <span>Par page</span>
        <select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))}>
          {[10, 25, 50].map((size) => <option key={size} value={size}>{size}</option>)}
        </select>
      </label>
      <div className="list-tools-exports">
        <button type="button" onClick={() => exportCsv(filteredRows, filename)} disabled={!filteredRows.length}>Exporter CSV</button>
        <button type="button" onClick={() => printRows(filteredRows, document.title)} disabled={!filteredRows.length}>Imprimer / PDF</button>
      </div>
      <div className="list-tools-pagination">
        <span>{filteredRows.length} résultat(s) · page {page} / {pageCount}</span>
        <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1} aria-label="Page précédente">‹</button>
        <button type="button" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={page >= pageCount} aria-label="Page suivante">›</button>
      </div>
    </div>
  );

  return { visibleRows, filteredRows, toolbar };
};
