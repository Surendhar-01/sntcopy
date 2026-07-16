const fs = require('fs/promises');
const path = require('path');

const apiBaseUrl = (process.env.RESET_API_BASE_URL || 'http://localhost:5173/api').replace(/\/$/, '');

async function apiRequest(route, options = {}) {
  const response = await fetch(`${apiBaseUrl}${route}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });
  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${route} failed (${response.status}): ${text}`);
  }
  return data;
}

async function main() {
  const fullBackup = await apiRequest('/db');
  const products = Array.isArray(fullBackup.products) ? fullBackup.products : [];
  if (products.length === 0) {
    throw new Error('No products returned from API. Aborting reset.');
  }

  const backupPath = path.resolve(
    __dirname,
    '..',
    'tmp',
    `active-api-reset-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
  );
  await fs.mkdir(path.dirname(backupPath), { recursive: true });
  await fs.writeFile(backupPath, JSON.stringify(fullBackup, null, 2));

  await apiRequest('/bills', { method: 'DELETE' }).catch(() => null);
  await apiRequest('/customers', { method: 'DELETE' }).catch(() => null);
  await apiRequest('/refills', { method: 'DELETE' }).catch(() => null);

  const orderedProducts = [...products].sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
  for (const product of orderedProducts) {
    await apiRequest(`/products/${encodeURIComponent(product.id)}`, { method: 'DELETE' });
  }

  const recreateProducts = [...products].sort((a, b) => Number(a.id || 0) - Number(b.id || 0));
  for (const product of recreateProducts) {
    await apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify({
        code: product.code || '',
        name: product.name,
        cat: product.cat || '',
        unit: product.unit || '',
        price: Number(product.price || 0),
        stock: 0,
        image: product.image || null,
      }),
    });
  }

  const resetProducts = await apiRequest('/products');
  const totals = resetProducts.reduce(
    (acc, product) => ({
      openingStock: acc.openingStock + Number(product.opening_stock || 0),
      currentStock: acc.currentStock + Number(product.stock || 0),
      sold: acc.sold + Number(product.sold || 0),
    }),
    { openingStock: 0, currentStock: 0, sold: 0 },
  );

  console.log(
    JSON.stringify(
      {
        success: true,
        backupPath,
        productCount: resetProducts.length,
        totals,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
