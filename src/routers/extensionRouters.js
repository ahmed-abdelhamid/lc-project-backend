const express = require('express');
const Lc = require('../models/lcModel');
const Extension = require('../models/extensionModel');
const Supplier = require('../models/supplierModel');
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
// Get extensions for specific supplier
router.get('/supplier/:supplierId', auth(), async ({ params }, res) => {
	try {
		const supplier = await Supplier.findById(params.supplierId);
		if (!supplier) {
			throw new Error();
		}
		await supplier
			.populate('contracts')
			.populate('lcs')
			.populate('extensions')
			.execPopulate();
		res.send(supplier.contracts.lcs.extensions);
	} catch (e) {
		res.status(404).send();
	}
});

// Edit extension data
router.patch('', auth({ canAdd: true }), async ({ body }, res) => {
	const updates = {};
	const allowedUpdates = ['lcId', 'upTo', 'notes'];
	allowedUpdates.map(update => (updates[update] = body[update]));
	try {
		const extension = await Extension.findByIdAndUpdate(body._id, updates, {
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
});

module.exports = router;
