const express = require('express');
const Request = require('../models/requestModel');
const Supplier = require('../models/supplierModel');
const Extension = require('../models/extensionModel');
const Amendement = require('../models/amendementModel');
const auth = require('../middleware/auth');
const router = new express.Router();

// Create new request
router.post(
	'',
	auth({ canRequest: true }),
	async ({ body, user }, res) => {
		const request = new Request({
			...body,
			requestedBy: user._id
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
	'/supplier/:supplierId',
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
router.get('', auth(), async (req, res) => {
	try {
		const requests = await Request.find();
		// console.log(requests);
		res.send(requests);
	} catch (e) {
		res.status(500).send();
	}
});

// Get request by ID
router.get('/:id', auth(), async ({ params }, res) => {
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
	'',
	auth({ canRequest: true }),
	async ({ body, user }, res) => {
		const updates = {};
		const allowedUpdates = ['supplierId', 'upTo', 'amount', 'notes'];
		allowedUpdates.map(update => updates[update] = body[update]);
		try {
			const request = await Request.findById(body._id);
			// only if request still new or approved
			if (!request || request.state === 'approved' || request.state === 'inprogress' || user._id !== request.requestedBy) {
				throw new Error();
			}
			updates.forEach(update => (request[update] = updates[update]));
			// after modify the state will return new and notes will be updated
			request.state = 'new';
			request.notes.concat(request.notes, ' ==> ', 'updated and needs new approval');
			// need to show updates in frontend
			await request.save();
			res.send(request);
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
	'/:id/inprogress',
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

// delete Request
router.patch('/:id/delete', auth(), async ({ params }, res) => {
	try {
		const request = await Request.findById(params.id);
		// check for request
		if (!request) {
			throw new Error();
		// check if executed or inprogress that the delete canAdd = true
		}else if (request.state === 'executed' || request.state === 'inprogress') {
			if (user.canAdd !== true) {
				throw new Error();
			}
		// if request is new or approved check if the requester is the deleter
		} else if (user._id !== request.requestedBy) {
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
	'/:id/execute',
	auth({ canAdd: true }),
	async ({ params, body, user }, res) => {
		let extension;
		let amendement;
		const { lcId, notes, upTo, amount } = body;
		try {
			const request = await Request.findById(params.id);
			if (!request || request.state !== 'inprogress') {
				throw new Error();
			}

			if (request.upTo) {
				// New Extension
				extension = new Extension({
					requestId: params.id,
					createdBy: user._id,
					lcId,
					notes,
					upTo
				});
				await extension.save();
			}

			if (request.amount) {
				// New Amendement
				amendement = new Amendement({
					requestId: params.id,
					createdBy: user._id,
					lcId,
					notes,
					amount
				});
				await amendement.save();
			}
			request.state = 'executed';
			await request.save();
			res.status(201).send({ extension, amendement });
		} catch (e) {
			res.status(400).send(e);
		}
	}
);

module.exports = router;
