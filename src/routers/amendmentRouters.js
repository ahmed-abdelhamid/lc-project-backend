const express = require('express');
const Lc = require('../models/lcModel');
const Amendment = require('../models/amendmentModel');
const Supplier = require('../models/supplierModel');
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

// Get amendments for specific lc
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

// Get amendments for specific contract
router.get('/contract/:contractId', auth(), async ({ params }, res) => {
	try {
		const contract = await Contract.findById(params.contractId);
		if (!contract) {
			throw new Error();
		}
		await contract.populate({ path: 'lcs', populate: { path: 'amendments' } }).execPopulate();
		const amendments = [];
		for (let doc of contract.lcs) {
			amendments.push(...doc.amendments);
		}
		res.send(amendments);
	} catch (e) {
		res.status(404).send();
	}
});

// Get amendments for specific supplier
router.get('/supplier/:supplierId', auth(), async ({ params }, res) => {
	try {
		const supplier = await Supplier.findById(params.supplierId);
		if (!supplier) {
			throw new Error();
		}
		await supplier
			.populate({
				path: 'contracts',
				populate: { path: 'lcs', populate: { path: 'amendments' } },
			})
			.execPopulate();
		const lcs = [];
		for (let doc of supplier.contracts) {
			lcs.push(...doc.lcs);
		}
		const amendments = [];
		for (let doc of lcs) {
			amendments.push(...doc.amendments);
		}
		res.send(amendments);
	} catch (e) {
		res.status(404).send();
	}
});

// Edit amendment data
router.patch('', auth({ canAddLc: true }), async ({ body }, res) => {
	const updates = {};
	const allowedUpdates = ['amount', 'notes'];
	allowedUpdates.map(update => (updates[update] = body[update]));
	try {
		const amendment = await Amendment.findByIdAndUpdate(body._id, updates, {
			new: true,
			runValidators: true,
		});
		if (!amendment) {
			throw new Error();
		}
		res.send(amendment);
	} catch (e) {
		res.status(400).send(e);
	}
});

module.exports = router;
