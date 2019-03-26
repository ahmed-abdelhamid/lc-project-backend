const express = require('express');
const Supplier = require('../models/supplierModel');
const User = require('../models/userModel');
const auth = require('../middleware/auth');
const router = new express.Router();

// Create new supplier
router.post(
	'/suppliers',
	auth({ canRegister: true }),
	async ({ user, body }, res) => {
		const supplier = new Supplier({ ...body, createdBy: user._id });
		try {
			await supplier.save();
			res.status(201).send(supplier);
		} catch (e) {
			res.status(400).send(e);
		}
	}
);

// Read all suppliers
router.get('/suppliers', auth(), async (req, res) => {
	try {
		const suppliers = await Supplier.find();
		res.send(suppliers);
	} catch (e) {
		res.status(500).send();
	}
});

// Read supplier by id
router.get('/suppliers/:id', auth(), async ({ params }, res) => {
	try {
		const supplier = await Supplier.findById(params.id);
		if (!supplier) {
			return res.status(404).send();
		}
		res.send(supplier);
	} catch (e) {
		res.status(500).send();
	}
});

// Get suppliers created by specific user
router.get('/users/:userId/suppliers', auth(), async ({ params }, res) => {
	try {
		const user = await User.findById(params.userId);
		if (!user) {
			throw new Error();
		}
		await user.populate('suppliers').execPopulate();
		res.send(user.suppliers);
	} catch (e) {
		res.status(404).send();
	}
});

// Update supplier data
router.patch(
	'/suppliers/:id',
	auth({ canRegister: true }),
	async ({ params, body }, res) => {
		const updates = Object.keys(body);
		const allowedUpdates = ['name', 'specialization', 'notes'];
		const isValidOperation = updates.every(update =>
			allowedUpdates.includes(update)
		);
		if (!isValidOperation) {
			return res.status(400).send({ error: 'Invalid Updates' });
		}
		try {
			const supplier = await Supplier.findByIdAndUpdate(params.id, body, {
				new: true,
				runValidators: true
			});
			if (!supplier) {
				throw new Error();
			}
			res.send(supplier);
		} catch (e) {
			res.status(400).send(e);
		}
	}
);

module.exports = router;
