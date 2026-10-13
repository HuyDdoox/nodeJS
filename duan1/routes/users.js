var express = require('express');
var router = express.Router();
var UsersController = require('../controllers/users');

// GET http://localhost:3000/users
router.get('/', UsersController.getAllUsers);

// GET http://localhost:3000/users/:id  (Ví dụ: http://localhost:3000/users/64a1b2c3d...)
router.get('/:id', UsersController.getUserById);

// POST http://localhost:3000/users
router.post('/', UsersController.createUser);

// PUT http://localhost:3000/users/:id
router.put('/:id', UsersController.updateUser);

// PATCH http://localhost:3000/users/:id
router.patch('/:id', UsersController.updateUser);

// PUT http://localhost:3000/users (hỗ trợ truyền id qua body)
router.put('/', UsersController.updateUser);

// PATCH http://localhost:3000/users/:id/status (ẩn / hiện, khóa / mở khóa tài khoản)
router.patch('/:id/status', UsersController.changeUserStatus);

// DELETE http://localhost:3000/users/:id
router.delete('/:id', UsersController.deleteUser);

// DELETE http://localhost:3000/users (hỗ trợ truyền id qua body)
router.delete('/', UsersController.deleteUser);

module.exports = router;
