const express = require('express');
const Supplier = require('../models/supplierModel');
const auth = require('../middleware/auth');
const router = new express.Router();

// Create new supplier
router.post('/suppliers', auth(), async ({ user, body }, res) => {
	const supplier = new Supplier({ ...body, createdBy: user._id });
	try {
		await supplier.save();
		res.status(201).send(supplier);
	} catch (e) {
		res.status(400).send(e);
	}
});

module.exports = router;
