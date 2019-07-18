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
		const supplier = await Supplier.findById(params.supplierId);

		if (!supplier) {
			throw new Error('there is no such supplier for this payment!');
		}
		await supplier
			.populate({
				path: 'contracts',
				populate: { path: 'lcs', populate: { path: 'payments' } },
			})
			.execPopulate();
		const lcs = [];
		for (let doc of supplier.contracts) {
			lcs.push(...doc.lcs);
		}
		const lc = [];
		for (let doc of lcs) {
			lc.push(...doc.payments);
		}
		await supplier.populate({ path: 'contracts', populate: { path: 'payments' } }).execPopulate();
		const cash = [];
		for (let doc of supplier.contracts) {
			cash.push(...doc.payments);
		}
		res.send([...cash, ...lc]);
	} catch (e) {
		res.status(404).send(e);
	}
});

// Get payments for specific contract
router.get('/contract/:contractId', auth(), async ({ params }, res) => {
	try {
		const contract = await Contract.findById(params.contractId);
		if (!contract) {
			throw new Error();
		}
		await contract.populate('payments').execPopulate();
		await contract.populate({ path: 'lcs', populate: { path: 'payments' } }).execPopulate();
		const lc = [];
		for (let doc of supplier.contracts) {
			lc.push(...doc.payments);
		}
		res.send([...contract.payments, ...lc]);
	} catch (e) {
		res.status(404).send();
	}
});

// Edit payment data in case of cash only
router.patch('', auth({ canAddCashPayment: true }), async ({ body }, res) => {
	const allowedUpdates = ['amount', 'notes'];
	try {
		const payment = await Payment.findById(body._id);
		if (!payment || !payment.contractId) {
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
