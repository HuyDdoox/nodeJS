//Chuyển hướng và goi hàm
var express = require('express');
var router = express.Router();
var CategoriesController= require('../controllers/categories');


// GET http://localhost:3000/categories
router.get('/',CategoriesController.getAllCategories);

// GET http://localhost:3000/categories/name/Laptop
router.get('/name/:name',CategoriesController.getCategoryByName);

// GET http://localhost:3000/categories/12345
router.get('/:id',CategoriesController.getCategoryById);

// POST http://localhost:3000/categories
router.post('/', CategoriesController.createCategory);

// PUT http://localhost:3000/categories/:id
router.put('/:id', CategoriesController.updateCategory);

// PATCH http://localhost:3000/categories/:id
router.patch('/:id', CategoriesController.updateCategory);

// PUT http://localhost:3000/categories (hỗ trợ truyền id qua body)
router.put('/', CategoriesController.updateCategory);

// PATCH http://localhost:3000/categories/:id/status (ẩn / hiện danh mục)
router.patch('/:id/status', CategoriesController.changeCategoryStatus);

// DELETE http://localhost:3000/categories/:id
router.delete('/:id', CategoriesController.deleteCategory);

// DELETE http://localhost:3000/categories (hỗ trợ truyền id qua body)
router.delete('/', CategoriesController.deleteCategory);

module.exports = router;
