const express = require('express');
const Lc = require('../models/lcModel');
const Amendment = require('../models/amendmentModel');
const auth = require('../middleware/auth');
const router = new express.Router();

// Get all amendments
router.get('/amendments', auth(), async (req, res) => {
	try {
		const amendments = await Amendment.find();
		res.send(amendments);
	} catch (e) {
		res.status(500).send();
	}
});

// Get amendment by id
router.get('/amendment/:id', auth(), async ({ params }, res) => {
	try {
		const amendment = await Amendment.findById(params.id);
		if (!amendment) {
			throw new Error();
		}
		res.send(amendment);
	} catch (e) {
		res.status(404).send();
	}
});

// Get amendments for specific lcs
router.get('/lcs/:lcId/amendments', auth(), async ({ params }, res) => {
	try {
		const lc = await Lc.findById(params.lcId);
		if (!lc) {
			throw new Error();
		}
		await lc.populate('amendments').execPopulate();
		res.send(lc.amendments);
	} catch (e) {
		res.status(404).send();
	}
});

// Edit amendment data
router.patch(
	'/amendments/:id',
	auth({ canAdd: true }),
	async ({ params, body }, res) => {
		const updates = Object.keys(body);
		const allowedUpdates = ['lcId', 'amount', 'notes'];
		const isValidOperation = updates.every(update =>
			allowedUpdates.includes(update)
		);
		if (!isValidOperation) {
			return res.status(400).send({ error: 'Invalid Updates' });
		}
		try {
			const amendment = await Amendment.findByIdAndUpdate(params.id, body, {
				new: true,
				runValidators: true
			});
			if (!amendment) {
				throw new Error();
			}
			res.send(amendment);
		} catch (e) {
			res.status(400).send(e);
		}
	}
);

module.exports = router;
