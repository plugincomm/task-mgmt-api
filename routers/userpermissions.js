const express = require('express');
const router = express.Router();
const userPermissionController = require('../controller/admin/userPermission');
const { validatePermissions } = require('../middleware/permissionValidator');
const { checkPermission } = require('../middleware/authoriztion');


router.get('/', userPermissionController.getUserPermissions);
router.get('/:id', userPermissionController.getUserPermissionById);
router.post('/add', validatePermissions, userPermissionController.assignPermission);
router.put('/edit/:id', validatePermissions, userPermissionController.editUserPermission);
router.delete('/:id', userPermissionController.deleteUserPermission);

router.get('/protected-resource', checkPermission(1), (req, res) => {
    res.status(200).json({ success: true, message: "You have access to this resource." });
});

module.exports = router;
