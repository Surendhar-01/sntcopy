const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const { getProducts, addProduct, changeProductPrice, removeProduct } = require('../controllers/productsController');

const router = express.Router();
router.get('/products', asyncHandler(getProducts));
router.post('/products', asyncHandler(addProduct));
router.put('/products/:id/price', asyncHandler(changeProductPrice));
router.delete('/products/:id', asyncHandler(removeProduct));
module.exports = router;
