const express = require('express');
const Lc = require('../models/lcModel');
const Amendement = require('../models/amendementModel');
const auth = require('../middleware/auth');
const router = new express.Router();

// Get all amendements
router.get('', auth(), async (req, res) => {
	try {
		const amendements = await Amendement.find();
		res.send(amendements);
	} catch (e) {
		res.status(500).send();
	}
});

// Get amendement by id
router.get('/:id', auth(), async ({ params }, res) => {
	try {
		const amendement = await Amendement.findById(params.id);
		if (!amendement) {
			throw new Error();
		}
		res.send(amendement);
	} catch (e) {
		res.status(404).send();
	}
});

// Get amendements for specific lcs
router.get('/lc/:lcId', auth(), async ({ params }, res) => {
	try {
		const lc = await Lc.findById(params.lcId);
		if (!lc) {
			throw new Error();
		}
		await lc.populate('amendements').execPopulate();
		res.send(lc.amendements);
	} catch (e) {
		res.status(404).send();
	}
});

// Edit amendement data
router.patch(
	'/:id',
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
			const amendement = await Amendement.findByIdAndUpdate(params.id, body, {
				new: true,
				runValidators: true
			});
			if (!amendement) {
				throw new Error();
			}
			res.send(amendement);
		} catch (e) {
			res.status(400).send(e);
		}
	}
);

module.exports = router;
