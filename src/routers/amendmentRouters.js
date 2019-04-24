const express = require('express');
const Lc = require('../models/lcModel');
const Amendment = require('../models/amendmentModel');
const auth = require('../middleware/auth');
const router = new express.Router();

// Get all amendments
router.get('', auth(), async (req, res) => {
	try {
		const amendments = await Amendment.find();
		res.send(amendments);
	} catch (e) {
		res.status(500).send();
	}
});

// Get amendment by id
router.get('/:id', auth(), async ({ params }, res) => {
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
router.get('/lc/:lcId', auth(), async ({ params }, res) => {
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
	'',
	auth({ canAdd: true }),
	async ({ body }, res) => {
		const updates = {};
		const allowedUpdates = ['lcId', 'amount', 'notes'];
		allowedUpdates.map(update => updates[update] = body[update]);
		try {
			const amendment = await Amendment.findByIdAndUpdate(body._id, updates, {
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
