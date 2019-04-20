const express = require('express');
const PaymentRequest = require('../models/paymentRequestModel');
const Payment = require('../models/paymentModel');
const Supplier = require('../models/supplierModel');
const auth = require('../middleware/auth');
const router = new express.Router();

// Create new payment request
router.post('',
	auth({ canRequest: true }),
	async ({ body, user }, res) => {
		const paymentRequest = new PaymentRequest({
			...body,
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
	'/supplier/:supplierId',
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
router.get('', auth(), async (req, res) => {
	try {
		const paymentRequests = await PaymentRequest.find();
		res.send(paymentRequests);
	} catch (e) {
		res.status(500).send();
	}
});

// Get payment request by ID
router.get('/:id', auth(), async ({ params }, res) => {
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
	'',
	auth({ canRequest: true }),
	async ({ body }, res) => {
		const updates = {};
		const allowedUpdates = [
			'supplierId',
			'contactId',
			'amount',
			'type',
			'lcId',
			'notes'
		];
		allowedUpdates.map(update => updates[update] = body[update]);
		try {
			const paymentRequest = await PaymentRequest.findById(body._id);
			if (!paymentRequest || paymentRequest.state === 'approved' || paymentRequest.state === 'inprogress' || user._id !== paymentRequest.requestedBy) {
				throw new Error();
			}
			updates.forEach(update => (paymentRequest[update] = updates[update]));
			paymentRequest.state = 'new';
			paymentRequest.notes.concat(paymentRequest.notes, ' ==> ', 'updated and needs new approval');
			await paymentRequest.save();
			res.send(paymentRequest);
		} catch (e) {
			res.status(400).send(e);
		}
	}
);

// Approve request
router.patch(
	'/:id/approve',
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
	'/:id/inprogress',
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

// delete Request
router.patch('/:id/delete', auth(), async ({ params }, res) => {
	try {
		const paymentRequest = await PaymentRequest.findById(params.id);
		// check for request
		if (!paymentRequest) {
			throw new Error();
		// check if executed or inprogress that the delete canAdd = true
		}else if (paymentRequest.state === 'executed' || paymentRequest.state === 'inprogress') {
			if (user.canAdd !== true) {
				throw new Error();
			}
		// if request is new or approved check if the requester is the deleter
		} else if (user._id !== paymentRequest.requestedBy) {
			throw new Error();
		}
		paymentRequest.state = 'deleted';
		await paymentRequest.save();
		res.send(paymentRequest);
	} catch (e) {
		res.status(400).send(e);
	}
});

// Executing request
router.patch(
	'/:id/execute',
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
