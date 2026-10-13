var express = require('express');
var router = express.Router();
var ProductsController = require('../controllers/products');

// GET http://localhost:3000/products
router.get('/', ProductsController.getAllProducts);

// GET http://localhost:3000/products/:id  (Ví dụ: http://localhost:3000/products/64a1b2c3d...)
router.get('/:id',ProductsController.getProductById);

// GET http://localhost:3000/products/category/:id
router.get('/category/:id',ProductsController.getProductsByCategory);

// GET http://localhost:3000/products/search/:name
router.get('/search/:name',ProductsController.getProductByName);

// POST http://localhost:3000/products
router.post('/', ProductsController.createProduct);

// Cập nhật thông tin sản phẩm (changeproduct có hỗ trợ sửa ẩn/hiện)
// PUT / PATCH / POST http://localhost:3000/products/changeproduct/:id
router.put('/changeproduct/:id', ProductsController.changeProduct);
router.patch('/changeproduct/:id', ProductsController.changeProduct);
router.put('/changeproduct', ProductsController.changeProduct);
router.post('/changeproduct', ProductsController.changeProduct);

// Đổi trạng thái ẩn / hiện của sản phẩm
// PATCH http://localhost:3000/products/:id/status
router.patch('/:id/status', ProductsController.changeProductStatus);

// PUT http://localhost:3000/products/:id
router.put('/:id', ProductsController.updateProducts);

// PATCH http://localhost:3000/products/:id
router.patch('/:id', ProductsController.updateProducts);

// PUT http://localhost:3000/products (hỗ trợ truyền id qua body)
router.put('/', ProductsController.updateProducts);

// DELETE http://localhost:3000/products/:id
router.delete('/:id', ProductsController.deleteProducts);

// DELETE http://localhost:3000/products (hỗ trợ truyền id qua body)
router.delete('/', ProductsController.deleteProducts);

module.exports = router;
