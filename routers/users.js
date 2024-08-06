const express = require('express');
const router = express.Router();
const UserController = require('../controller/user');

router.get('/', UserController.getUser);
router.get('/:id', UserController.getUserByID);
router.post('/newuser', UserController.addUser);
router.post('/add', UserController.registerUser);
router.put('/edit/:id', UserController.editUser);  
router.delete('/:id', UserController.deleteUser);
router.post('/login', UserController.userLogin);  
router.get('/get/counts', UserController.getUserCount);


module.exports = router;
