const express = require('express');
const PaymentRequest = require('../models/paymentRequestModel');
const Payment = require('../models/paymentModel');
const Contract = require('../models/contractModel');
const Supplier = require('../models/supplierModel');
const Lc = require('../models/lcModel');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadFiles, deleteFile, readMultiFiles } = require('../utils/filesFunctions');
const router = new express.Router();

// Create new payment request
router.post(
	'',
	auth({ canRequest: true }),
	upload.array('docs'),
	async ({ body, user, files }, res) => {
		try {
			const filesNames = await uploadFiles(files);
			const paymentRequest = new PaymentRequest({
				...body,
				createdBy: user._id,
				docs: filesNames
			});
			await paymentRequest.save();
			await paymentRequest.populate('createdBy', 'name').execPopulate();
			res.status(201).send(paymentRequest);
		} catch (e) {
			res.status(400).send(e.message);
		}
	},
	// eslint-disable-next-line no-unused-vars
	(error, req, res, next) => {
		res.status(400).send({ error: error.message });
	}
);

// Get payment requests for specific supplier
router.get('/supplier/:supplierId', auth(), async ({ params }, res) => {
	try {
		const supplier = await Supplier.findById(params.supplierId);
		if (!supplier) {
			throw new Error();
		}
		await supplier
			.populate({ path: 'contracts', populate: { path: 'paymentRequests' } })
			.execPopulate();
		const cash = [];
		for (let doc of supplier.contracts) {
			cash.push(...doc.paymentRequests);
		}
		await supplier
			.populate({
				path: 'contracts',
				populate: { path: 'lcs', populate: { path: 'paymentRequests' } }
			})
			.execPopulate();
		const lcs = [];
		for (let doc of supplier.contracts) {
			lcs.push(...doc.lcs);
		}
		const lc = [];
		for (let doc of lcs) {
			lc.push(...doc.paymentRequests);
		}
		res.send([...cash, ...lc]);
	} catch (e) {
		res.status(404).send();
	}
});

// Get payment requests for specific contract
router.get('/contract/:contractId', auth(), async ({ params }, res) => {
	try {
		const contract = await Contract.findById(params.contractId);
		if (!contract) {
			throw new Error();
		}
		await contract.populate({ path: 'paymentRequests' }).execPopulate();
		const cash = contract.paymentRequests;

		await contract.populate({ path: 'lcs', populate: { path: 'paymentRequests' } }).execPopulate();
		const lc = [];
		for (let doc of contract.lcs) {
			lc.push(...doc.paymentRequests);
		}
		res.send({
			cash: cash,
			lc: lc
		});
	} catch (e) {
		res.status(404).send();
	}
});

// Get payment requests for specific lc
router.get('/lc/:lcId', auth(), async ({ params }, res) => {
	try {
		const lc = await Lc.findById(params.lcId);
		if (!lc) {
			throw new Error();
		}
		await lc.populate({ path: 'paymentRequests' }).execPopulate();
		res.send(lc.paymentRequests);
	} catch (e) {
		res.status(404).send();
	}
});

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

// Modify payment request only if still new or approved
router.patch(
	'',
	auth({ canRequest: true }),
	upload.array('docs'),
	async ({ body, user, files }, res) => {
		try {
			const paymentRequest = await PaymentRequest.findById(body._id);
			if (
				!paymentRequest ||
				paymentRequest.state === 'inprogress' ||
				paymentRequest.state === 'executed' ||
				paymentRequest.state === 'canceled' ||
				user._id.toString() !== paymentRequest.createdBy._id.toString()
			) {
				throw new Error();
			}
			paymentRequest.state = 'new';
			paymentRequest.amount = body.amount;
			paymentRequest.notes = body.notes;
			if (files.length > 0) {
				const filesNames = await uploadFiles(files);
				paymentRequest.docs = paymentRequest.docs.concat(filesNames);
			}
			await paymentRequest.save();
			await paymentRequest.populate('createdBy', 'name').execPopulate();
			res.send(paymentRequest);
		} catch (e) {
			res.status(400).send(e);
		}
	},
	// eslint-disable-next-line no-unused-vars
	(error, req, res, next) => {
		res.status(400).send({ error: error.message });
	}
);

// Approve request
router.patch('/:id/approve', auth({ canApprove: true }), async ({ params }, res) => {
	try {
		const paymentRequest = await PaymentRequest.findById(params.id);
		if (!paymentRequest || paymentRequest.state !== 'new') {
			throw new Error();
		}
		paymentRequest.state = 'approved';
		await paymentRequest.save();
		await paymentRequest.populate('createdBy', 'name').execPopulate();
		res.send(paymentRequest);
	} catch (e) {
		res.status(400).send(e);
	}
});

// Inprogressing request
router.patch(
	'/:id/inprogress',
	auth({ canAddLc: true, canAddCashPayment: true }),
	async ({ params }, res) => {
		try {
			const paymentRequest = await PaymentRequest.findById(params.id);
			if (!paymentRequest || paymentRequest.state !== 'approved') {
				throw new Error();
			}
			paymentRequest.state = 'inprogress';
			await paymentRequest.save();
			await paymentRequest.populate('createdBy', 'name').execPopulate();
			res.send(paymentRequest);
		} catch (e) {
			res.status(400).send(e);
		}
	}
);

// Delete Request
router.patch('/:id/delete', auth(), async ({ params, user }, res) => {
	try {
		const paymentRequest = await PaymentRequest.findById(params.id);
		// check for request
		if (!paymentRequest) {
			throw new Error();
			// check if executed or inprogress then the deleter canAdd = true
		} else if (paymentRequest.state === 'executed' || paymentRequest.state === 'inprogress') {
			if (user.canAddLc !== true) {
				throw new Error();
			}
			// if request is new or approved check if the requester is the deleter
		} else if (user._id.toString() !== paymentRequest.createdBy._id.toString()) {
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
	'/execute',
	auth({ canAddLc: true }),
	upload.array('docs'),
	async ({ body, user, files }, res) => {
		let payment;
		const { notes, amount } = body;
		try {
			const paymentRequest = await PaymentRequest.findById(body._id);
			if (!paymentRequest || paymentRequest.state !== 'inprogress') {
				throw new Error('here');
			}
			const filesNames = await uploadFiles(files);
			payment = new Payment({
				requestId: paymentRequest._id,
				createdBy: user._id
			});

			if (paymentRequest.lcId) {
				payment.lcId = paymentRequest.lcId;
				payment.amount = paymentRequest.amount;
				payment.notes = paymentRequest.notes;
			} else {
				payment.contractId = paymentRequest.contractId;
				payment.amount = amount;
				payment.notes = notes;
				payment.docs = filesNames;
			}

			await payment.save();
			await payment.populate('createdBy', 'name').execPopulate();
			paymentRequest.state = 'executed';
			await paymentRequest.save();
			await paymentRequest.populate('createdBy', 'name').execPopulate();
			res.status(201).send({ paymentRequest, payment });
		} catch (e) {
			res.status(400).send(e);
		}
	}
);

// Delete a file from Payment Request
router.delete('/:id/:key', auth({ canRequest: true }), async ({ params }, res) => {
	try {
		const paymentRequest = await PaymentRequest.findById(params.id);
		if (!paymentRequest) {
			throw new Error();
		}
		await deleteFile(params.key);
		paymentRequest.docs = paymentRequest.docs.filter(doc => doc !== params.key);

		await paymentRequest.save();
		res.send(paymentRequest);
	} catch (e) {
		res.status(404).send();
	}
});

// Read All Files for Payment Request
router.get('/:id/files', auth(), async ({ params }, res) => {
	try {
		const paymentRequest = await PaymentRequest.findById(params.id);
		if (!paymentRequest) {
			throw new Error();
		}
		const zipFile = await readMultiFiles(paymentRequest.docs);
		res.set('Content-Type', 'application/zip');
		res.send(zipFile);
	} catch (e) {
		res.status(404).send();
	}
});

module.exports = router;
