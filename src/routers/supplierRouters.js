const express = require('express');
const Supplier = require('../models/supplierModel');
const Contract = require('../models/contractModel');
const Appendix = require('../models/appendixModel');
const Lc = require('../models/lcModel');
const Request = require('../models/requestModel');
const PaymentRequest = require('../models/paymentRequestModel');
const Payment = require('../models/paymentModel');
const Extension = require('../models/extensionModel');
const Amendment = require('../models/amendmentModel');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
	uploadFiles,
	deleteFile,
	readMultiFiles
} = require('../utils/filesFunctions');
const router = new express.Router();

// Create new supplier
router.post(
	'',
	auth({ canRegister: true }),
	upload.array('docs'),
	async ({ user, body, files }, res) => {
		const filesNames = await uploadFiles(files);

		const supplier = new Supplier({
			...body,
			createdBy: user._id,
			docs: filesNames
		});
		try {
			await supplier.save();
			res.status(201).send(supplier);
		} catch (e) {
			res.status(400).send(e);
		}
	},
	// eslint-disable-next-line no-unused-vars
	(error, req, res, next) => {
		res.status(400).send({ error: error.message });
	}
);

// Read all suppliers
router.get('', auth(), async (req, res) => {
	try {
		const suppliers = await Supplier.find();
		res.send(suppliers);
	} catch (e) {
		res.status(500).send();
	}
});

// Read supplier by id
router.get('/:id', auth(), async ({ params }, res) => {
	try {
		const supplier = await Supplier.findById(params.id);
		if (!supplier) {
			return res.status(404).send();
		}
		res.send(supplier);
	} catch (e) {
		res.status(500).send();
	}
});

// Read supplier for contract
router.get('contract/:id', auth(), async ({ params }, res) => {
	try {
		const contract = await Contract.findById(params.id);
		if (!contract) {
			return res.status(404).send();
		}
		await contract.populate('supplierId').execPopulate();
		res.send(contract.supplierId);
	} catch (e) {
		res.status(500).send();
	}
});

// Read supplier for appendix
router.get('appendix/:id', auth(), async ({ params }, res) => {
	try {
		const appendix = await Appendix.findById(params.id);
		if (!appendix) {
			return res.status(404).send();
		}
		await appendix
			.populate({ path: 'contractId', populate: { path: 'supplierId' } })
			.execPopulate();
		res.send(appendix.contractId.supplierId);
	} catch (e) {
		res.status(500).send();
	}
});

// Read supplier for lc
router.get('lc/:id', auth(), async ({ params }, res) => {
	try {
		const lc = await Lc.findById(params.id);
		if (!lc) {
			return res.status(404).send();
		}
		await lc
			.populate({ path: 'contractId', populate: { path: 'supplierId' } })
			.execPopulate();
		res.send(lc.contarctId.supplierId);
	} catch (e) {
		res.status(500).send();
	}
});

// Read supplier for request
router.get('request/:id', auth(), async ({ params }, res) => {
	try {
		const request = await Request.findById(params.id);
		if (!request) {
			return res.status(404).send();
		}
		await request
			.populate({
				path: 'lcId',
				populate: { path: 'contractId', populate: { path: 'supplierId' } }
			})
			.execPopulate();
		res.send(request.lcId.contarctId.supplierId);
	} catch (e) {
		res.status(500).send();
	}
});

// Read supplier for paymentRequest
router.get('paymentRequest/:id', auth(), async ({ params }, res) => {
	try {
		const paymentRequest = await PaymentRequest.findById(params.id);
		if (!paymentRequest) {
			return res.status(404).send();
		}
		if (paymentRequest.lcId) {
			await paymentRequest
				.populate({
					path: 'lcId',
					populate: { path: 'contractId', populate: { path: 'supplierId' } }
				})
				.execPopulate();
			res.send(paymentRequest.lcId.contarctId.supplierId);
		} else {
			await paymentRequest
				.populate({ path: 'contractId', populate: { path: 'supplierId' } })
				.execPopulate();
			res.send(paymentRequest.contarctId.supplierId);
		}
	} catch (e) {
		res.status(500).send();
	}
});

// Read supplier for payment
router.get('payment/:id', auth(), async ({ params }, res) => {
	try {
		const payment = await Payment.findById(params.id);
		if (!payment) {
			return res.status(404).send();
		}
		if (payment.lcId) {
			await payment
				.populate({
					path: 'lcId',
					populate: { path: 'contractId', populate: { path: 'supplierId' } }
				})
				.execPopulate();
			res.send(payment.lcId.contarctId.supplierId);
		} else {
			await payment
				.populate({ path: 'contractId', populate: { path: 'supplierId' } })
				.execPopulate();
			res.send(payment.contarctId.supplierId);
		}
	} catch (e) {
		res.status(500).send();
	}
});

// Read supplier for extension
router.get('extension/:id', auth(), async ({ params }, res) => {
	try {
		const extension = await Extension.findById(params.id);
		if (!extension) {
			return res.status(404).send();
		}
		await extension
			.populate({
				path: 'lcId',
				populate: { path: 'contractId', populate: { path: 'supplierId' } }
			})
			.execPopulate();
		res.send(extension.lcId.contarctId.supplierId);
	} catch (e) {
		res.status(500).send();
	}
});

// Read supplier for amendment
router.get('amendment/:id', auth(), async ({ params }, res) => {
	try {
		const amendment = await Amendment.findById(params.id);
		if (!amendment) {
			return res.status(404).send();
		}
		await amendment
			.populate({
				path: 'lcId',
				populate: { path: 'contractId', populate: { path: 'supplierId' } }
			})
			.execPopulate();
		res.send(amendment.lcId.contractId.supplierId);
	} catch (e) {
		res.status(500).send();
	}
});

// Update supplier data
router.patch(
	'',
	auth({ canRegister: true }),
	upload.array('docs'),
	async ({ body, files }, res) => {
		try {
			const supplier = await Supplier.findById(body._id);
			if (!supplier) {
				throw new Error();
			}

			supplier.name = body.name;
			supplier.specialization = body.specialization;
			supplier.notes = body.notes;
			supplier.vatRegisteration = body.vatRegisteration;
			supplier.crRegisteration = body.crRegisteration;
			supplier.state = body.state;
			if (files.length > 0) {
				const filesNames = await uploadFiles(files);
				supplier.docs = supplier.docs.concat(filesNames);
			}
			await supplier.save();
			res.send(supplier);
		} catch (e) {
			res.status(400).send(e);
		}
	}
);

// Delete a file from Supplier
router.delete('/:id/:key', auth(), async ({ params }, res) => {
	try {
		const supplier = await Supplier.findById(params.id);
		if (!supplier) {
			throw new Error();
		}
		await deleteFile(params.key);
		supplier.docs = supplier.docs.filter(doc => doc !== params.key);

		await supplier.save();
		res.send(supplier);
	} catch (e) {
		res.status(404).send();
	}
});

// Read All Files for Supplier
router.get('/:id/files', auth(), async ({ params }, res) => {
	try {
		const supplier = await Supplier.findById(params.id);
		if (!supplier) {
			throw new Error();
		}
		const zipFile = await readMultiFiles(supplier.docs);
		res.set('Content-Type', 'application/zip');
		res.send(zipFile);
	} catch (e) {
		res.status(404).send();
	}
});

module.exports = router;
