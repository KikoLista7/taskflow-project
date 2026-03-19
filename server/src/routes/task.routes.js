const express = require('express');
const router = express.Router();
const controller = require('../controllers/task.controller');

router.get('/', controller.getAll);
router.post('/', controller.create);
router.put('/order', controller.setOrder);
router.patch('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
