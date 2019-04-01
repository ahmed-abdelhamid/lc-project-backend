const express = require('express');
const Appendix = require('../models/appendixModel');
// const User = require('../models/userModel');
const Contract = require('../models/contractModel');
const auth = require('../middleware/auth');
const router = new express.Router();

// Create new Appendix
router.post(
	'/contracts/:contractId/appendixes',
	auth({ canRegister: true }),
	async ({ params, body, user }, res) => {
		const appendix = new Appendix({
			...body,
			contractId: params.contractId,
			createdBy: user._id
		});
		try {
			await appendix.save();
			res.status(201).send(appendix);
		} catch (e) {
			res.status(400).send(e);
		}
	}
);

// Get appendixes for specific contracts
router.get(
	'/contracts/:contractId/appendixes',
	auth(),
	async ({ params }, res) => {
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
	}
);

// Get all appendixes
router.get('/appendixes', auth(), async (req, res) => {
	try {
		const appendixes = await Appendix.find();
		res.send(appendixes);
	} catch (e) {
		res.status(500).send();
	}
});

// Get appendix by ID
router.get('/appendixes/:id', auth(), async ({ params }, res) => {
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
router.patch(
	'/appendixes/:id',
	auth({ canRegister: true }),
	async ({ params, body }, res) => {
		const updates = Object.keys(body);
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
		const isValidOperation = updates.every(update =>
			allowedUpdates.includes(update)
		);
		if (!isValidOperation) {
			return res.status(400).send({ error: 'Invalid Updates' });
		}
		try {
			const appendix = await Appendix.findByIdAndUpdate(params.id, body, {
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
	}
);

module.exports = router;
