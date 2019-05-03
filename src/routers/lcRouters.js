const express = require('express');
const Lc = require('../models/lcModel');
const Supplier = require('../models/supplierModel');
const Request = require('../models/requestModel');
const auth = require('../middleware/auth');
const router = new express.Router();

// Create new lc
router.post('/:id', auth({ canAdd: true }), async ({ params, body, user }, res) => {
	const requestId = params.id;
	const lc = new Lc({
		...body,
		requestId: requestId,
		createdBy: user._id,
	});

	try {
		const request = await Request.findById(requestId);
		if (!request || request.state !== 'inprogress') {
			throw new Error('request not found');
		}
		request.state = 'executed';
		await lc.save();
		await request.save();
		res.status(201).send(lc);
	} catch (e) {
		res.status(400).send(e);
	}
});

// Get all lcs
router.get('', auth(), async (req, res) => {
	try {
		const lcs = await Lc.find();
		res.send(lcs);
	} catch (e) {
		res.status(500).send();
	}
});

// Get lc by ID
router.get('/:id', auth(), async ({ params }, res) => {
	try {
		const lc = await Lc.findById(params.id);
		if (!lc) {
			throw new Error();
		}
		res.send(lc);
	} catch (e) {
		res.status(404).send();
	}
});

// Update lc by id
router.patch('', auth({ canAdd: true }), async ({ body }, res) => {
	const updates = {};
	const allowedUpdates = [
		'issuer',
		'bankName',
		'number',
		'openingCommission',
		'serviceCharge',
		'editCommission',
		'issueDate',
		'expiryDate',
		'amount',
		'notes',
		'previouslyPaidWithInvoice',
		'advancedPaymentCondition',
		'otherPaymentsCondition',
		'advancedPayment',
	];
	allowedUpdates.map(update => (updates[update] = body[update]));
	try {
		const lc = await Lc.findByIdAndUpdate(body._id, updates, {
			new: true,
			runValidators: true,
		});
		if (!lc) {
			throw new Error();
		}
		res.send(lc);
	} catch (e) {
		res.status(400).send(e);
	}
});

// Get lcs for specific suppliers
router.get('/supplier/:supplierId', auth(), async ({ params }, res) => {
	try {
		const supplier = await Supplier.findById(params.supplierId);
		if (!supplier) {
			throw new Error();
		}
		await supplier.populate({ path: 'contracts', populate: { path: 'lcs' } }).execPopulate();
		const lcs = [];
		for (let doc of supplier.contracts) {
			lcs.push(...doc.lcs);
		}

		res.send(lcs);
	} catch (e) {
		res.status(404).send();
	}
});

// Get lcs for specific contract
router.get('/contract/:contractId', auth(), async ({ params }, res) => {
	try {
		const contract = await Contract.findById(params.contractId);
		if (!contract) {
			throw new Error();
		}
		await contract.populate('lcs').execPopulate();
		res.send(contract.lcs);
	} catch (e) {
		res.status(404).send();
	}
});

module.exports = router;
