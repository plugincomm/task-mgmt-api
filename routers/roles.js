const express = require('express');
const router = express.Router();
const RoleController = require('../controller/admin/role');
const { validatePermissions } = require('../middleware/permissionValidator');

router.get('/', RoleController.getRole);
router.get('/:id', RoleController.getRoleById);
router.post('/add', validatePermissions, RoleController.addRole);
router.put('/edit/:id', validatePermissions, RoleController.editRole);
router.delete('/:id', RoleController.deleteRole);

module.exports = router;
