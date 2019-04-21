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
	'',
	auth({ canAdd: true }),
	async ({ body }, res) => {
		const updates = {};
		const allowedUpdates = ['lcId', 'amount', 'notes'];
		allowedUpdates.map(update => updates[update] = body[update]);
		try {
			const amendement = await Amendement.findByIdAndUpdate(body._id, updates, {
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
