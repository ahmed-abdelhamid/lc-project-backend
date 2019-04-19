const express = require('express');
const Request = require('../models/requestModel');
const Supplier = require('../models/supplierModel');
const Extension = require('../models/extensionModel');
const Amendment = require('../models/amendmentModel');
const auth = require('../middleware/auth');
const router = new express.Router();

// Create new request
router.post(
	'/suppliers/:supplierId/requests',
	auth({ canRequest: true }),
	async ({ params, body, user }, res) => {
		const request = new Request({
			...body,
			supplierId: params.supplierId,
			requestedBy: user
		});
		try {
			await request.save();
			res.status(201).send(request);
		} catch (e) {
			res.status(400).send(e);
		}
	}
);

// Get requests for specific supplier
router.get(
	'/suppliers/:supplierId/requests',
	auth(),
	async ({ params }, res) => {
		try {
			const supplier = await Supplier.findById(params.supplierId);
			if (!supplier) {
				throw new Error();
			}
			await supplier.populate('requests').execPopulate();
			res.send(supplier.requests);
		} catch (e) {
			res.status(404).send();
		}
	}
);

// Get all requests
router.get('/requests', auth(), async (req, res) => {
	try {
		const requests = await Request.find();
		// console.log(requests);
		res.send(requests);
	} catch (e) {
		res.status(500).send();
	}
});

// Get request by ID
router.get('/requests/:id', auth(), async ({ params }, res) => {
	try {
		const request = await Request.findById(params.id);
		if (!request) {
			throw new Error();
		}
		res.send(request);
	} catch (e) {
		res.status(404).send();
	}
});

// Modify request only if still new
router.patch(
	'/requests/:id',
	auth({ canRequest: true }),
	async ({ params, body }, res) => {
		const updates = Object.keys(body);
		const allowedUpdates = ['supplierId', 'upTo', 'amount', 'notes'];
		const isValidOperation = updates.every(update =>
			allowedUpdates.includes(update)
		);
		if (!isValidOperation) {
			return res.status(400).send({ error: 'Invalid Updates' });
		}
		try {
			const request = await Request.findById(params.id);
			if (!request || request.state !== 'new') {
				throw new Error();
			}
			updates.forEach(update => (request[update] = body[update]));
			await request.save();
			res.send(request);
		} catch (e) {
			res.status(400).send(e);
		}
	}
);

// Approve request
router.patch(
	'/requests/:id/approve',
	auth({ canApprove: true }),
	async ({ params }, res) => {
		try {
			const request = await Request.findById(params.id);
			if (!request || request.state !== 'new') {
				throw new Error();
			}
			request.state = 'approved';
			await request.save();
			console.log('Approved Request');
			res.send(request);
		} catch (e) {
			res.status(400).send(e);
		}
	}
);

// Inprogressing request
router.patch(
	'/requests/:id/inprogress',
	auth({ canAdd: true }),
	async ({ params }, res) => {
		try {
			const request = await Request.findById(params.id);
			if (!request || request.state !== 'approved') {
				throw new Error();
			}
			request.state = 'inprogress';
			await request.save();
			res.send(request);
		} catch (e) {
			res.status(400).send(e);
		}
	}
);

// Cancel Request
router.patch('/requests/:id/cancel', auth(), async ({ params }, res) => {
	try {
		const request = await Request.findById(params.id);
		if (!request || request.state === 'executed') {
			throw new Error();
		}
		request.state = 'deleted';
		await request.save();
		res.send(request);
	} catch (e) {
		res.status(400).send(e);
	}
});

// Executing request
router.patch(
	'/requests/:id/execute',
	auth({ canAdd: true }),
	async ({ params, body, user }, res) => {
		let extension;
		let amendment;
		const { lcId, notes, upTo, amount } = body;
		try {
			const request = await Request.findById(params.id);
			if (!request || request.state !== 'inprogress') {
				throw new Error();
			}

			if (request.upTo !== null) {
				// New Extension
				extension = new Extension({
					requestId: params.id,
					createdBy: user.id,
					lcId,
					notes,
					upTo
				});
				await extension.save();
			}

			if (request.amount !== null) {
				// New Amendment
				amendment = new Amendment({
					requestId: params.id,
					createdBy: user.id,
					lcId,
					notes,
					amount
				});
				await amendment.save();
			}
			request.state = 'executed';
			await request.save();
			res.status(201).send({ extension, amendment });
		} catch (e) {
			res.status(400).send(e);
		}
	}
);

module.exports = router;
