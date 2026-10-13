var express = require('express');
var router = express.Router();
var BillsController = require('../controllers/bills');

/* GET bills listing. */
router.get('/', BillsController.getAllBills);
router.get('/:id', BillsController.getBillById);

module.exports = router;
