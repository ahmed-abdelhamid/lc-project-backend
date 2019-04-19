const express = require('express');
const PaymentRequest = require('../models/paymentRequestModel');
const Payment = require('../models/paymentModel');
const Supplier = require('../models/supplierModel');
const auth = require('../middleware/auth');
const router = new express.Router();

// Create new payment request
router.post(
	'/suppliers/:supplierId/paymentRequests',
	auth({ canRequest: true }),
	async ({ params, body, user }, res) => {
		const paymentRequest = new PaymentRequest({
			...body,
			supplierId: params.supplierId,
			requestedBy: user._id
		});
		try {
			await paymentRequest.save();
			res.status(201).send(paymentRequest);
		} catch (e) {
			res.status(400).send(e);
		}
	}
);

// Get payment requests for specific supplier
router.get(
	'/suppliers/:supplierId/paymentRequests',
	auth(),
	async ({ params }, res) => {
		try {
			const supplier = await Supplier.findById(params.supplierId);
			if (!supplier) {
				throw new Error();
			}
			await supplier.populate('paymentRequests').execPopulate();
			res.send(supplier.paymentRequests);
		} catch (e) {
			res.status(404).send();
		}
	}
);

// Get all payment requests
router.get('/paymentRequests', auth(), async (req, res) => {
	try {
		const paymentRequests = await PaymentRequest.find();
		res.send(paymentRequests);
	} catch (e) {
		res.status(500).send();
	}
});

// Get payment request by ID
router.get('/paymentRequests/:id', auth(), async ({ params }, res) => {
	try {
		const paymentRequest = await PaymentRequest.findById(params.id);
		if (!paymentRequest) {
			throw new Error();
		}
		res.send(paymentRequest);
	} catch (e) {
		res.status(404).send();
	}
});

// Modify payment request only if still new
router.patch(
	'/paymentRequests/:id',
	auth({ canRequest: true }),
	async ({ params, body }, res) => {
		const updates = Object.keys(body);
		const allowedUpdates = [
			'supplierId',
			'contactId',
			'amount',
			'type',
			'lcId',
			'notes'
		];
		const isValidOperation = updates.every(update =>
			allowedUpdates.includes(update)
		);
		if (!isValidOperation) {
			return res.status(400).send({ error: 'Invalid Updates' });
		}
		try {
			const paymentRequest = await PaymentRequest.findById(params.id);
			if (!paymentRequest || paymentRequest.state !== 'new') {
				throw new Error();
			}
			updates.forEach(update => (paymentRequest[update] = body[update]));
			await paymentRequest.save();
			res.send(paymentRequest);
		} catch (e) {
			res.status(400).send(e);
		}
	}
);

// Approve request
router.patch(
	'/paymentRequest/:id/approve',
	auth({ canApprove: true }),
	async ({ params }, res) => {
		try {
			const paymentRequest = await PaymentRequest.findById(params.id);
			if (!paymentRequest || paymentRequest.state !== 'new') {
				throw new Error();
			}
			paymentRequest.state = 'approved';
			await paymentRequest.save();
			res.send(paymentRequest);
		} catch (e) {
			res.status(400).send(e);
		}
	}
);

// Inprogressing request
router.patch(
	'/paymentRequests/:id/inprogress',
	auth({ canAdd: true }),
	async ({ params }, res) => {
		try {
			const paymentRequest = await PaymentRequest.findById(params.id);
			if (!paymentRequest || paymentRequest.state !== 'approved') {
				throw new Error();
			}
			paymentRequest.state = 'inprogress';
			await paymentRequest.save();
			res.send(paymentRequest);
		} catch (e) {
			res.status(400).send(e);
		}
	}
);

// Cancel Request
router.patch('/paymentRequests/:id/cancel', auth(), async ({ params }, res) => {
	try {
		const paymentRequest = await PaymentRequest.findById(params.id);
		if (!paymentRequest || paymentRequest.state === 'executed') {
			throw new Error();
		}
		paymentRequest.state = 'canceled';
		await paymentRequest.save();
		res.send(paymentRequest);
	} catch (e) {
		res.status(400).send(e);
	}
});

// Executing request
router.patch(
	'/paymentRequest/:id/execute',
	auth({ canAdd: true }),
	async ({ params, body, user }, res) => {
		let payment;
		const { notes, amount } = body;
		try {
			const paymentRequest = await PaymentRequest.findById(params.id);
			if (!paymentRequest || paymentRequest.state !== 'inprogress') {
				throw new Error();
			}

			payment = new Payment({
				paymentRequestId: params.id,
				supplierId: paymentRequest.supplierId,
				contractId: paymentRequest.contractId,
				createdBy: user._id,
				dateOfRequest: paymentRequest.createdAt,
				type: paymentRequest.type,
				notes
			});

			if (paymentRequest.type === 'lc') {
				// New Payment
				payment.lcId = paymentRequest.lcId;
				payment.amount = paymentRequest.amount;
			} else {
				payment.amount = amount;
			}

			await payment.save();
			paymentRequest.state = 'executed';
			await paymentRequest.save();
			res.status(201).send(payment);
		} catch (e) {
			res.status(400).send(e);
		}
	}
);

module.exports = router;
