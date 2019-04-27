const express = require('express');
const Payment = require('../models/paymentModel');
const Lc = require('../models/lcModel');
const Supplier = require('../models/supplierModel');
const Contract = require('../models/contractModel');
const auth = require('../middleware/auth');
const router = new express.Router();

// Get all payments
router.get('', auth(), async (req, res) => {
	try {
		const payments = await Payment.find();
		res.send(payments);
	} catch (e) {
		res.status(500).send();
	}
});

// Get payment by id
router.get('/:id', auth(), async ({ params }, res) => {
	try {
		const payment = await Payment.findById(params.id);
		if (!payment) {
			throw new Error();
		}
		res.send(payment);
	} catch (e) {
		res.status(404).send();
	}
});

// Get payments for specific lc
router.get('/lc/:lcId', auth(), async ({ params }, res) => {
	try {
		const lc = await Lc.findById(params.lcId);
		if (!lc) {
			throw new Error();
		}
		await lc.populate('payments').execPopulate();
		res.send(lc.payments);
	} catch (e) {
		res.status(404).send();
	}
});

// Get payments for specific supplier
router.get('/supplier/:supplierId', auth(), async ({ params }, res) => {
	try {
		const supplier = await Supplier.findById(params.lcId);
		if (!supplier) {
			throw new Error();
		}
		await supplier
			.populate('contracts')
			.populate('payments')
			.execPopulate();
		await supplier
			.populate('contarcts')
			.populate('lcs')
			.populate('payments')
			.execPopulate();
		res.send({
			cash: supplier.contracts.payments,
			lc: supplier.contracts.lcs.payments
		});
	} catch (e) {
		res.status(404).send();
	}
});

// Get payments for specific contract
router.get('/contract/:contractId', auth(), async ({ params }, res) => {
	try {
		const contract = await Contract.findById(params.lcId);
		if (!contract) {
			throw new Error();
		}
		await contract.populate('payments').execPopulate();
		res.send(contract.payments);
	} catch (e) {
		res.status(404).send();
	}
});

// Edit payment data in case of cash only
router.patch('', auth({ canAdd: true }), async ({ body }, res) => {
	const allowedUpdates = ['amount', 'notes'];
	try {
		const payment = await Payment.findById(body._id);
		if (!payment || payment.type === 'lc') {
			throw new Error();
		}
		allowedUpdates.map(update => (payment[update] = body[update]));
		await payment.save();
		res.send(payment);
	} catch (e) {
		res.status(400).send(e);
	}
});

module.exports = router;
