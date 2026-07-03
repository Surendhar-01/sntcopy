const { listProducts, createProduct, updateProductPrice, deleteProduct } = require('../services/productsService');

async function getProducts(req, res) {
  const products = await listProducts();
  res.json(products);
}

async function addProduct(req, res) {
  const result = await createProduct(req.body);
  res.json(result);
}

async function changeProductPrice(req, res) {
  const productId = Number(req.params.id);
  const nextPrice = Number(req.body.new_price);
  const byUser = req.body.by_user;
  if (!Number.isFinite(productId) || !Number.isFinite(nextPrice) || nextPrice < 0) {
    const error = new Error('Valid product ID and new price are required');
    error.status = 400;
    throw error;
  }
  const result = await updateProductPrice(productId, nextPrice, byUser);
  res.json(result);
}

async function removeProduct(req, res) {
  const productId = Number(req.params.id);
  if (!Number.isFinite(productId)) {
    const error = new Error('Valid product ID is required');
    error.status = 400;
    throw error;
  }
  const result = await deleteProduct(productId);
  res.json(result);
}

module.exports = {
  getProducts,
  addProduct,
  changeProductPrice,
  removeProduct
};