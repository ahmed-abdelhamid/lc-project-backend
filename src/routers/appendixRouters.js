const express = require('express');
const Appendix = require('../models/appendixModel');
// const User = require('../models/userModel');
const Contract = require('../models/contractModel');
const Supplier = require('../models/supplierModel');
const auth = require('../middleware/auth');
const router = new express.Router();

// Create new Appendix
router.post('', auth({ canRegister: true }), async ({ body, user }, res) => {
	const appendix = new Appendix({
		...body,
		createdBy: user._id
	});
	try {
		await appendix.save();
		res.status(201).send(appendix);
	} catch (e) {
		res.status(400).send(e);
	}
});

// Get appendixes for specific contracts
router.get('/contract/:contractId', auth(), async ({ params }, res) => {
	try {
		const contract = await Contract.findById(params.contractId);
		if (!contract) {
			throw new Error();
		}
		await contract.populate('appendixes').execPopulate();
		res.send(contract.appendixes);
	} catch (e) {
		res.status(404).send();
	}
});

// Get appendixes for specific supplier
router.get('/supplier/:supplierId', auth(), async ({ params }, res) => {
	try {
		const supplier = await Supplier.findById(params.supplierId);
		if (!supplier) {
			throw new Error();
		}
		await supplier
			.populate('contracts')
			.populate('appendixes')
			.execPopulate();
		res.send(supplier.contracts.appendixes);
	} catch (e) {
		res.status(404).send();
	}
});

// Get all appendixes
router.get('', auth(), async (req, res) => {
	try {
		const appendixes = await Appendix.find();
		res.send(appendixes);
	} catch (e) {
		res.status(500).send();
	}
});

// Get appendix by ID
router.get('/:id', auth(), async ({ params }, res) => {
	try {
		const appendix = await Appendix.findById(params.id);
		if (!appendix) {
			throw new Error();
		}
		res.send(appendix);
	} catch (e) {
		res.status(404).send();
	}
});

// Get appendixes created by specific user
// router.get('/users/:userId/appendixes', auth(), async ({ params }, res) => {
// 	try {
// 		const user = await User.findById(params.userId);
// 		if (!user) {
// 			throw new Error();
// 		}
// 		await user.populate('appendixes').execPopulate();
// 		res.send(user.appendixes);
// 	} catch (e) {
// 		res.status(404).send();
// 	}
// });

// Update appendix
router.patch('', auth({ canRegister: true }), async ({ body }, res) => {
	const updates = {};
	const allowedUpdates = [
		'title',
		'soc',
		'duration',
		'amount',
		'notes',
		'contractId',
		'date',
		'state'
	];
	allowedUpdates.map(update => (updates[update] = body[update]));
	try {
		const appendix = await Appendix.findByIdAndUpdate(body._id, updates, {
			new: true,
			runValidators: true
		});
		if (!appendix) {
			throw new Error();
		}
		res.send(appendix);
	} catch (e) {
		res.status(400).send(e);
	}
});

module.exports = router;
