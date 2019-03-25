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

// Read all suppliers
router.get('/suppliers', auth(), async (req, res) => {
	try {
		const suppliers = await Supplier.find();
		res.send(suppliers);
	} catch (e) {
		res.status(404).send();
	}
});

// Read supplier by id
router.get('/suppliers/:id', auth(), async ({ params }, res) => {
	try {
		const supplier = await Supplier.findById(params.id);
		res.send(supplier);
	} catch (e) {
		res.status(404).send();
	}
});

// Update supplier data

// Archive supplier

module.exports = router;
