const express = require('express');
const Lc = require('../models/lcModel');
const Extension = require('../models/extensionModel');
const auth = require('../middleware/auth');
const router = new express.Router();

// Get all extensions
router.get('/extensions', auth(), async (req, res) => {
	try {
		const extensions = await Extension.find();
		res.send(extensions);
	} catch (e) {
		res.status(500).send();
	}
});

// Get extension by id
router.get('/extensions/:id', auth(), async ({ params }, res) => {
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
router.get('/lcs/:lcId/extensions', auth(), async ({ params }, res) => {
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

module.exports = router;
