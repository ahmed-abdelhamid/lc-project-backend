const express = require('express');
const Contract = require('../models/contractModel');
// const User = require('../models/userModel');
const Supplier = require('../models/supplierModel');
const auth = require('../middleware/auth');
const router = new express.Router();

// Create new contract
router.post(
	'',
	auth({ canRegister: true }),
	async ({ body, user }, res) => {
		const contract = new Contract({
			...body,
			createdBy: user._id
		});
		try {
			await contract.save();
			res.status(201).send(contract);
		} catch (e) {
			res.status(400).send(e);
		}
	}
);

// Get contracts for specific supplier
router.get(
	'/supplier/:supplierId',
	auth(),
	async ({ params }, res) => {
		try {
			const supplier = await Supplier.findById(params.supplierId);
			
			if (!supplier) {
				throw new Error();
			}
			await supplier.populate('contracts').execPopulate();
			res.send(supplier.contracts);
		} catch (e) {
			
			res.status(404).send();
		}
	}
);

// Get all contracts
router.get('', auth(), async (req, res) => {
	try {
		const contracts = await Contract.find();
		res.send(contracts);
	} catch (e) {
		res.status(500).send();
	}
});

// Get contract by ID
router.get('/:id', auth(), async ({ params }, res) => {
	try {
		const contract = await Contract.findById(params.id);
		if (!contract) {
			throw new Error();
		}
		res.send(contract);
	} catch (e) {
		res.status(404).send();
	}
});

// Get contracts created by specific user
// router.get('/users/:userId/contracts', auth(), async ({ params }, res) => {
// 	try {
// 		const user = await User.findById(params.userId);
// 		if (!user) {
// 			throw new Error();
// 		}
// 		await user.populate('contracts').execPopulate();
// 		res.send(user.contracts);
// 	} catch (e) {
// 		res.status(404).send();
// 	}
// });

// Update contract
router.patch(
	'',
	auth({ canRegister: true }),
	async ({ body }, res) => {
		const updates = {};
		const allowedUpdates = [
			'title',
			'soc',
			'duration',
			'amount',
			'notes',
			'supplierId',
			'date',
			'state'
		];
		allowedUpdates.map(update => updates[update] = body[update]);
		try {
			const contract = await Contract.findByIdAndUpdate(body._id, updates, {
				new: true,
				runValidators: true
			});
			if (!contract) {
				throw new Error();
			}
			res.send(contract);
		} catch (e) {
			res.status(400).send(e);
		}
	}
);

module.exports = router;
