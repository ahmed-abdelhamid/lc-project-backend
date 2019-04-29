const express = require('express');
const Request = require('../models/requestModel');
const Supplier = require('../models/supplierModel');
const Extension = require('../models/extensionModel');
const Amendment = require('../models/amendmentModel');
const Contract = require('../models/contractModel');
const Lc = require('../models/lcModel');
const auth = require('../middleware/auth');
const router = new express.Router();

// Create new request
router.post('', auth({ canRequest: true }), async ({ body, user }, res) => {
	const request = new Request({
		...body,
		createdBy: user._id,
	});

	try {
		const lc = await Lc.findById(request.lcId);
		if (!lc) {
			throw new Error('Lc not found!');
		}

		await request.save();
		res.status(201).send(request);
	} catch (e) {
		res.status(400).send(e);
	}
});

// Get requests for specific supplier
router.get('/supplier/:supplierId', auth(), async ({ params }, res) => {
	try {
		const supplier = await Supplier.findById(params.supplierId);
		if (!supplier) {
			throw new Error('Supplier not found!');
		}
		await supplier
			.populate('contracts')
			.populate('lcs')
			.populate('requests')
			.execPopulate();
		res.send(supplier.contracts.lcs.requests);
	} catch (e) {
		res.status(404).send();
	}
});

// Get requests for specific lc
router.get('/lc/:lcId', auth(), async ({ params }, res) => {
	try {
		const lc = await Lc.findById(params.lcId);
		if (!lc) {
			throw new Error('Lc not found!');
		}
		await lc.populate('requests').execPopulate();
		res.send(lc.requests);
	} catch (e) {
		res.status(404).send();
	}
});
// Get requests for specific contract
router.get('/contract/:contractId', auth(), async ({ params }, res) => {
	try {
		const contract = await Contract.findById(params.contractId);
		if (!contract) {
			throw new Error('Contract not found!');
		}
		await contract
			.populate('lcs')
			.populate('requests')
			.execPopulate();
		res.send(lc.requests);
	} catch (e) {
		res.status(404).send();
	}
});

// Get all requests
router.get('', auth(), async (req, res) => {
	try {
		const requests = await Request.find();
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

// Modify request only if still new or approved
router.patch('', auth({ canRequest: true }), async ({ body, user }, res) => {
	const updates = {};
	const allowedUpdates = ['upTo', 'amount', 'notes'];
	allowedUpdates.map(update => (updates[update] = body[update]));
	try {
		const request = await Request.findById(body._id);
		// note that the createdBy field now = {_id, name}
		// only if request still new or approved
		if (
			!request ||
			request.state === 'executed' ||
			request.state === 'inprogress' ||
			request.state === 'deleted' ||
			user._id !== request.createdBy._id
		) {
			throw new Error();
		}
		allowedUpdates.map(update => (request[update] = updates[update]));
		// after modify the state will return new
		request.state = 'new';
		await request.save();
		res.send(request);
	} catch (e) {
		res.status(400).send(e);
	}
});

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
			res.send(request);
		} catch (e) {
			res.status(400).send(e);
		}
	},
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
	},
);

// delete Request
router.patch('/:id/delete', auth(), async ({ params }, res) => {
	try {
		const request = await Request.findById(params.id);
		// check for request
		if (!request) {
			throw new Error();
			// check if executed or inprogress that the delete canAdd = true
		} else if (request.state === 'executed' || request.state === 'inprogress') {
			if (user.canAdd !== true) {
				throw new Error();
			}
		} else if (request.state === 'new' || request.state === 'approved') {
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
		let amendment;
		const { lcId, notes, upTo, amount } = body;
		try {
			const request = await Request.findById(params.id);
			if (!request || request.state !== 'inprogress') {
				throw new Error();
			}

			if (upTo) {
				// New Extension
				extension = new Extension({
					requestId: params.id,
					createdBy: user._id,
					lcId,
					notes,
					upTo,
				});
				await extension.save();
			}

			if (amount) {
				// New Amendment
				amendment = new Amendment({
					requestId: params.id,
					createdBy: user._id,
					lcId,
					notes,
					amount,
				});
				await amendment.save();
			}
			request.state = 'executed';
			await request.save();
			res.status(201).send({ extension, amendment });
		} catch (e) {
			res.status(400).send(e);
		}
	},
);

module.exports = router;
