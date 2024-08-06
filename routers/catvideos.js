const express = require('express');
const router = express.Router();
const CatVideoController = require('../controller/catvideos');
const { onlyAdminAccess,onlyUserAccess } = require('../middleware/authoriztion');

router.get('/',  CatVideoController.getCatVideo);
router.get('/:id',  CatVideoController.getCatVideoById);
router.post('/add',  CatVideoController.addCatVideo);
router.put('/edit/:id',  CatVideoController.editCatVideo);
router.delete('/:id', CatVideoController.deleteCatVideo);    
router.get('/get/counts',  CatVideoController.getCatVideoCount);

module.exports = router;