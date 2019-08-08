const express = require('express');
const Appendix = require('../models/appendixModel');
const Contract = require('../models/contractModel');
const Supplier = require('../models/supplierModel');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
	uploadFiles,
	deleteMultiFiles,
	readMultiFiles,
} = require('../utils/filesFunctions');
const router = new express.Router();

// Create new Appendix
router.post(
	'',
	auth({ canRegister: true }),
	upload.array('docs'),
	async ({ body, user, files }, res) => {
		try {
			const filesNames = await uploadFiles(files);
			const appendix = new Appendix({
				...body,
				createdBy: user._id,
				docs: filesNames,
			});
			await appendix.save();
			res.status(201).send(appendix);
		} catch (e) {
			res.status(400).send(e);
		}
	},
	// eslint-disable-next-line no-unused-vars
	(error, req, res, next) => {
		res.status(400).send({ error: error.message });
	},
);

// Get appendixes for specific contracts
router.get('/contract/:contractId', auth(), async ({ params }, res) => {
	try {
		const contract = await Contract.findById(params.contractId);
		if (!contract) {
			throw new Error();
		}
		await contract.populate('appendixes').execPopulate();
		res.send(contract.appendixes);
	} catch (e) {
		res.status(404).send();
	}
});

// Get appendixes for specific supplier
router.get('/supplier/:supplierId', auth(), async ({ params }, res) => {
	try {
		const supplier = await Supplier.findById(params.supplierId);
		if (!supplier) {
			throw new Error();
		}
		await supplier
			.populate({
				path: 'contracts',
				populate: { path: 'appendixes' },
			})
			.execPopulate();
		const appendixes = [];
		for (let contract of supplier.contracts) {
			appendixes.push(...contract.appendixes);
		}
		res.send(appendixes);
	} catch (e) {
		res.status(404).send();
	}
});

// Get all appendixes
router.get('', auth(), async (req, res) => {
	try {
		const appendixes = await Appendix.find();
		res.send(appendixes);
	} catch (e) {
		res.status(500).send();
	}
});

// Get appendix by ID
router.get('/:id', auth(), async ({ params }, res) => {
	try {
		const appendix = await Appendix.findById(params.id);
		if (!appendix) {
			throw new Error();
		}
		res.send(appendix);
	} catch (e) {
		res.status(404).send();
	}
});

// Update appendix
router.patch(
	'',
	auth({ canRegister: true }),
	upload.array('docs'),
	async ({ body, files }, res) => {
		try {
			const appendix = await Appendix.findById(body._id);
			if (!appendix) {
				throw new Error();
			}

			appendix.title = body.title;
			appendix.date = body.date;
			appendix.soc = body.soc;
			appendix.amount = body.amount;
			appendix.duration = body.duration;
			appendix.notes = body.notes;
			appendix.state = body.state;
			appendix.contractId = body.contractId;
			if (files.length > 0) {
				const filesNames = await uploadFiles(files);
				appendix.docs = appendix.docs.concat(filesNames);
			}
			await appendix.save();
			res.send(appendix);
		} catch (e) {
			res.status(400).send(e);
		}
	},
	// eslint-disable-next-line no-unused-vars
	(error, req, res, next) => {
		res.status(400).send({ error: error.message });
	},
);

// Delete a file from appendix
router.patch(
	'/:id',
	auth({ canRegister: true }),
	async ({ params, body }, res) => {
		try {
			const appendix = await Appendix.findById(params.id);
			if (!appendix) {
				throw new Error();
			}
			await deleteMultiFiles(body.keys);
			appendix.docs = appendix.docs.filter(
				doc => body.keys.indexOf(doc) === -1,
			);

			await appendix.save();
			res.send(appendix);
		} catch (e) {
			res.status(404).send(e);
		}
	},
);

// Read All Files for Appendix
router.get('/:id/files', auth(), async ({ params }, res) => {
	try {
		const appendix = await Appendix.findById(params.id);
		if (!appendix) {
			throw new Error();
		}
		const zipFile = await readMultiFiles(appendix.docs);
		res.set('Content-Type', 'application/zip');
		res.send(zipFile);
	} catch (e) {
		res.status(404).send();
	}
});

module.exports = router;
