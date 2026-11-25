USE mikuy_db;

SHOW INDEX FROM donations;

-- ANTES (sin índice compuesto + SELECT *)
EXPLAIN
SELECT *
FROM donations IGNORE INDEX (idx_donations_status_district_expiry)
WHERE status = 'available' AND district = 'Cusco'
ORDER BY expiry ASC;

-- DESPUÉS (con índice compuesto + columnas específicas + JOIN + LIMIT)
EXPLAIN
SELECT d.id, d.owner_id, d.name, d.category, d.qty, d.unit, d.expiry, d.district, d.status,
       u.name AS donante
FROM donations d
INNER JOIN users u ON u.id = d.owner_id
WHERE d.status = 'available' AND d.district = 'Cusco'
ORDER BY d.expiry ASC
LIMIT 12 OFFSET 0;
