const express = require('express');
const Contract = require('../models/contractModel');
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

// Read all contracts

// Get contract by ID

// Update contract

module.exports = router;
