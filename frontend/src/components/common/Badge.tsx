

const map: Record<string, { label: string; cls: string }> = {
  admin: { label: 'Admin', cls: 'badge-admin' },
  user: { label: 'User', cls: 'badge-user' },
  store_owner: { label: 'Store Owner', cls: 'badge-store-owner' },
};

export default function Badge({ role }: { role: string }) {
  const item = map[role] ?? { label: role, cls: '' };
  return <span className={`badge ${item.cls}`}>{item.label}</span>;
}
