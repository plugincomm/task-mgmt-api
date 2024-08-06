const express = require('express');
const router = express.Router();
const permissionController = require('../controller/admin/permission');

router.get('/', permissionController.getPermission);
router.get('/:id', permissionController.getPermissionById);
router.post('/add', permissionController.addPermission);
router.put('/edit/:id', permissionController.editPermission); // Change to PUT and include id in URL
router.delete('/:id', permissionController.deletePermission);

module.exports = router;
