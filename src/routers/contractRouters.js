const express = require('express');
const Contract = require('../models/contractModel');
const Supplier = require('../models/supplierModel');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadFiles, deleteMultiFiles, readMultiFiles } = require('../utils/filesFunctions');
const router = new express.Router();

// Create new contract
router.post(
	'',
	auth({ canRegister: true }),
	upload.array('docs'),
	async ({ body, user, files }, res) => {
		try {
			const filesNames = await uploadFiles(files);
			const contract = new Contract({
				...body,
				createdBy: user._id,
				docs: filesNames,
			});
			await contract.save();
			res.status(201).send(contract);
		} catch (e) {
			res.status(400).send(e);
		}
	},
	// eslint-disable-next-line no-unused-vars
	(error, req, res, next) => {
		res.status(400).send({ error: error.message });
	},
);

// Get contracts for specific supplier
router.get('/supplier/:supplierId', auth(), async ({ params }, res) => {
	try {
		const supplier = await Supplier.findById(params.supplierId);

		if (!supplier) {
			throw new Error();
		}
		await supplier.populate('contracts').execPopulate();
		res.send(supplier.contracts);
	} catch (e) {
		res.status(404).send();
	}
});

// Get all contracts
router.get('', auth(), async (req, res) => {
	try {
		const contracts = await Contract.find();
		res.send(contracts);
	} catch (e) {
		res.status(500).send();
	}
});

// Get contract by ID
router.get('/:id', auth(), async ({ params }, res) => {
	try {
		const contract = await Contract.findById(params.id);
		if (!contract) {
			throw new Error();
		}
		res.send(contract);
	} catch (e) {
		res.status(404).send();
	}
});

// Update contract
router.patch(
	'',
	auth({ canRegister: true }),
	upload.array('docs'),
	async ({ body, files }, res) => {
		try {
			const contract = await Contract.findById(body._id);
			if (!contract) {
				throw new Error();
			}

			contract.title = body.title;
			contract.soc = body.soc;
			contract.duration = body.duration;
			contract.amount = body.amount;
			contract.notes = body.notes;
			contract.supplierId = body.supplierId;
			contract.date = body.date;
			contract.state = body.state;
			contract.previouslyPaidInCash = body.previouslyPaidInCash;
			if (files.length > 0) {
				const filesNames = await uploadFiles(files);
				contract.docs = contract.docs.concat(filesNames);
			}
			await contract.save();
			res.send(contract);
		} catch (e) {
			res.status(400).send(e);
		}
	},
	// eslint-disable-next-line no-unused-vars
	(error, req, res, next) => {
		res.status(400).send({ error: error.message });
	},
);

// Delete a file from contract
router.patch('/:id', auth({ canRegister: true }), async ({ params, body }, res) => {
	try {
		const contract = await Contract.findById(params.id);
		if (!contract) {
			throw new Error();
		}
		await deleteMultiFiles(body.keys);
		contract.docs = contract.docs.filter(doc => body.keys.indexOf(doc) === -1);

		await contract.save();
		res.send(contract);
	} catch (e) {
		res.status(404).send();
	}
});

// Read All Files for Contract
router.get('/:id/files', auth(), async ({ params }, res) => {
	try {
		const contract = await Contract.findById(params.id);
		if (!contract) {
			throw new Error();
		}
		const zipFile = await readMultiFiles(contract.docs);
		res.set('Content-Type', 'application/zip');
		res.send(zipFile);
	} catch (e) {
		res.status(404).send();
	}
});

module.exports = router;
