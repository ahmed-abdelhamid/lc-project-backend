const express = require('express');
const Lc = require('../models/lcModel');
const Extension = require('../models/extensionModel');
const auth = require('../middleware/auth');
const router = new express.Router();

// Get all extensions
router.get('', auth(), async (req, res) => {
	try {
		const extensions = await Extension.find();
		res.send(extensions);
	} catch (e) {
		res.status(500).send();
	}
});

// Get extension by id
router.get('/:id', auth(), async ({ params }, res) => {
	try {
		const extension = await Extension.findById(params.id);
		if (!extension) {
			throw new Error();
		}
		res.send(extension);
	} catch (e) {
		res.status(404).send();
	}
});

// Get extensions for specific lcs
router.get('/lc/:lcId', auth(), async ({ params }, res) => {
	try {
		const lc = await Lc.findById(params.lcId);
		if (!lc) {
			throw new Error();
		}
		await lc.populate('extensions').execPopulate();
		res.send(lc.extensions);
	} catch (e) {
		res.status(404).send();
	}
});

// Edit extension data
router.patch(
	'/:id',
	auth({ canAdd: true }),
	async ({ params, body }, res) => {
		const updates = Object.keys(body);
		const allowedUpdates = ['lcId', 'upTo', 'notes'];
		const isValidOperation = updates.every(update =>
			allowedUpdates.includes(update)
		);
		if (!isValidOperation) {
			return res.status(400).send({ error: 'Invalid Updates' });
		}
		try {
			const extension = await Extension.findByIdAndUpdate(params.id, body, {
				new: true,
				runValidators: true
			});
			if (!extension) {
				throw new Error();
			}
			res.send(extension);
		} catch (e) {
			res.status(400).send(e);
		}
	}
);

module.exports = router;
