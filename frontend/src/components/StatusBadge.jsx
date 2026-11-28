const StatusBadge = ({ statut }) => (
  <span className={`status ${String(statut ?? '').toLowerCase()}`}>{statut ?? '–'}</span>
);
export default StatusBadge;
