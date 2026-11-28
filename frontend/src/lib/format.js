const nf = new Intl.NumberFormat('fr-FR');

export const formatMAD = (value) => (value == null || value === '' ? '–' : nf.format(Number(value)));

export const formatDate = (value, options = { dateStyle: 'short' }) => {
  if (!value) return '–';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '–' : d.toLocaleDateString('fr-FR', options);
};

export const formatDateTime = (value) => {
  if (!value) return '–';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '–' : d.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
};
