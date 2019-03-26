const express = require('express');
const Contract = require('../models/contractModel');
const User = require('../models/userModel');
const auth = require('../middleware/auth');
const router = new express.Router();

// Create new contract
router.post(
	'/suppliers/:supplierId/contracts',
	auth({ canRegister: true }),
	async ({ params, body, user }, res) => {
		const contract = new Contract({
			...body,
			supplierId: params.supplierId,
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

// Get all contracts
router.get('/contracts', auth(), async (req, res) => {
	try {
		const contracts = await Contract.find();
		res.send(contracts);
	} catch (e) {
		res.status(500).send();
	}
});

// Get contract by ID
router.get('/contracts/:id', auth(), async ({ params }, res) => {
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
router.get('/users/:userId/contracts', auth(), async ({ params }, res) => {
	try {
		const user = await User.findById(params.userId);
		if (!user) {
			throw new Error();
		}
		await user.populate('contracts').execPopulate();
		res.send(user.contracts);
	} catch (e) {
		res.status(404).send();
	}
});

// Get contracts for specific supplier

// Update contract

module.exports = router;
