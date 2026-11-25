export const STATUS_LABELS = {
  available: 'Disponible',
  reserved: 'Reservado',
  retired: 'Retirado',
  expired: 'Vencido',
  pending: 'Pendiente',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
  completed: 'Completada',
  scheduled: 'Coordinada',
  confirmed: 'Confirmada',
};

export const FOOD_IMAGES = {
  potato: '/assets/images/foods/potato.svg',
  carrot: '/assets/images/foods/carrot.svg',
  rice: '/assets/images/foods/rice.svg',
  apple: '/assets/images/foods/apple.svg',
  beans: '/assets/images/foods/beans.svg',
  packaged: '/assets/images/foods/packaged.svg',
};

export function getFoodImage(imageKey) {
  return FOOD_IMAGES[imageKey] || FOOD_IMAGES.packaged;
}

export function getDaysLeft(expiryDate, referenceDate = new Date()) {
  if (!expiryDate) return 0;
  const end = new Date(`${expiryDate}T23:59:59`);
  return Math.ceil((end.getTime() - referenceDate.getTime()) / 86400000);
}

export function getExpiryBadge(expiryDate, referenceDate = new Date()) {
  const days = getDaysLeft(expiryDate, referenceDate);
  if (days < 0) return { label: 'Vencido', tone: 'danger' };
  if (days === 0) return { label: 'Vence hoy', tone: 'danger' };
  if (days <= 3) return { label: `Vence en ${days} días`, tone: 'warning' };
  return { label: `Vence en ${days} días`, tone: 'ok' };
}

export function formatRole(role) {
  return (
    {
      donor: 'Donante',
      organization: 'Organización beneficiaria',
      admin: 'Administrador',
    }[role] || role
  );
}

export function filterCatalogItems(items, { q = '', district = '', category = '' } = {}) {
  const query = q.trim().toLowerCase();
  return items.filter((item) => {
    const matchQ =
      !query ||
      `${item.name} ${item.description || ''} ${item.district}`.toLowerCase().includes(query);
    const matchDistrict = !district || item.district === district;
    const matchCategory = !category || item.category === category;
    return matchQ && matchDistrict && matchCategory;
  });
}

export function buildDeterministicQrPattern(code) {
  const text = String(code || 'MIKUY');
  let seed = 0;
  for (let i = 0; i < text.length; i += 1) {
    seed = (seed * 31 + text.charCodeAt(i)) % 9973;
  }
  const grid = [];
  for (let r = 0; r < 11; r += 1) {
    const row = [];
    for (let c = 0; c < 11; c += 1) {
      const corner =
        (r < 3 && c < 3) || (r < 3 && c > 7) || (r > 7 && c < 3);
      if (corner) {
        row.push(true);
      } else {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        row.push(seed % 2 === 0);
      }
    }
    grid.push(row);
  }
  return grid;
}
