const express = require('express');
const Supplier = require('../models/supplierModel');
const router = new express.Router();

// Create new supplier
router.post('/suppliers', async ({ body }, res) => {
	const supplier = new Supplier(body);
	try {
		await supplier.save();
		res.status(201).send(supplier);
	} catch (e) {
		res.status(400).send(e);
	}
});

module.exports = router;
