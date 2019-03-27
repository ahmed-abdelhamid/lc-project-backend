const express = require('express');
const Lc = require('../models/lcModel');
const auth = require('../middleware/auth');
const router = new express.Router();

// Create new lc
router.post(
	'/suppliers/:supplierId/lcs',
	auth({ canRegister: true }),
	async ({ params, body, user }, res) => {
		const lc = new Lc({
			...body,
			supplierId: params.supplierId,
			createdBy: user._id
		});
		try {
			await lc.save();
			res.status(201).send(lc);
		} catch (e) {
			res.status(400).send(e);
		}
	}
);

// Get all lcs
router.get('/lcs', auth(), async (req, res) => {
	try {
		const lcs = await Lc.find();
		res.send(lcs);
	} catch (e) {
		res.status(500).send();
	}
});

// Get lc by ID
router.get('/lcs/:id', auth(), async ({ params }, res) => {
	try {
		const lc = await Lc.findById(params.id);
		if (!lc) {
			throw new Error();
		}
		res.send(lc);
	} catch (e) {
		res.status(404).send();
	}
});

// Update lc by id
router.patch(
	'/lcs/:id',
	auth({ canRegister: true }),
	async ({ params, body }, res) => {
		const updates = Object.keys(body);
		const allowedUpdates = [
			'supplierId',
			'issuer',
			'bankName',
			'number',
			'openingCommission',
			'serviceCharge',
			'editCommission',
			'issueDate',
			'expiryDate',
			'amount',
			'notes',
			'previouslyPaidInCash',
			'previouslyPaidWithInvoice'
		];
		const isValidOperation = updates.every(update =>
			allowedUpdates.includes(update)
		);
		if (!isValidOperation) {
			return res.status(400).send({ error: 'Invalid Updates' });
		}
		try {
			const lc = await Lc.findByIdAndUpdate(params.id, body, {
				new: true,
				runValidators: true
			});
			if (!lc) {
				throw new Error();
			}
			res.send(lc);
		} catch (e) {
			res.status(400).send(e);
		}
	}
);

// Get lcs for specific suppliers
// Get appendixes created by specific user

module.exports = router;
