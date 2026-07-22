const { pool } = require('../db');

async function getSettings() {
  const [rows] = await pool.query('SELECT * FROM settings ORDER BY id ASC LIMIT 1');
  return rows[0] || { gst: 0, shop: '', addr: '', gstin: '', fssai: '', phone: '', themePreference: 'system' };
}

async function updateSettings(values) {
  const { gst, shop, addr, gstin, fssai, phone, themePreference } = values;
  const normalized = [
    Number(gst || 0),
    shop || '',
    addr || '',
    gstin || '',
    fssai || '',
    phone || '',
    themePreference || 'system'
  ];

  const [rows] = await pool.query('SELECT id FROM settings ORDER BY id ASC LIMIT 1');
  if (!rows.length) {
    const [result] = await pool.query(
      'INSERT INTO settings (gst, shop, addr, gstin, fssai, phone, themePreference, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      normalized
    );
    return { id: result.insertId, settings: { gst: normalized[0], shop: normalized[1], addr: normalized[2], gstin: normalized[3], fssai: normalized[4], phone: normalized[5], themePreference: normalized[6] } };
  }

  await pool.query(
    'UPDATE settings SET gst = ?, shop = ?, addr = ?, gstin = ?, fssai = ?, phone = ?, themePreference = ? WHERE id = ?',
    [...normalized, rows[0].id]
  );

  return { id: rows[0].id, settings: { gst: normalized[0], shop: normalized[1], addr: normalized[2], gstin: normalized[3], fssai: normalized[4], phone: normalized[5], themePreference: normalized[6] } };
}

module.exports = {
  getSettings,
  updateSettings
};
